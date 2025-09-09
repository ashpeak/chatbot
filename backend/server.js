import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
// Simple in-process log (Botpress has its own analytics; this is supplemental)
app.use((req,res,next)=>{
  if (req.path.startsWith('/api/chat')) {
    console.log('[CHAT_REQ]', new Date().toISOString(), req.body?.text);
  }
  next();
});

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir });

const BOT_ID = process.env.BOTPRESS_BOT_ID || 'campus-bot';
const BOTPRESS_URL = process.env.BOTPRESS_URL || 'http://localhost:3000';
const FALLBACK_CONFIDENCE = parseFloat(process.env.FALLBACK_CONFIDENCE || '0.5');
const QNA_IMPORT_PATH_ENV = process.env.QNA_IMPORT_PATH; // e.g. /api/v1/bots/:botId/mod/qna/import
const QNA_ANSWER_PATH_ENV = process.env.QNA_ANSWER_PATH; // e.g. /api/v1/bots/:botId/mod/qna/answers
const WORKSPACE_ID = process.env.WORKSPACE_ID; // optional workspace scoping
const BOTPRESS_TOKEN = process.env.BOTPRESS_TOKEN; // optional auth token
const USE_LOCAL_QNA = process.env.USE_LOCAL_QNA === '1';

function authHeaders(base={}) {
  if (BOTPRESS_TOKEN) return { ...base, Authorization: `Bearer ${BOTPRESS_TOKEN}` };
  return base;
}

// In-memory QnA store when using local mode
const localQnA = { items: [], lastUpload: null };

function buildLocalIndex(records) {
  // records: [{intent, language, question, answer}]
  const grouped = {};
  for (const r of records) {
    const key = r.intent + '|' + r.answer;
    if (!grouped[key]) grouped[key] = { intent: r.intent, answer: r.answer, questions: [] };
    grouped[key].questions.push({ text: r.question, lang: r.language });
  }
  localQnA.items = Object.values(grouped);
  localQnA.lastUpload = new Date().toISOString();
  console.log('[LOCAL_QNA] Loaded', localQnA.items.length, 'groups');
}

function localSearch(text, lang) {
  const norm = (s)=> s.toLowerCase().trim();
  const q = norm(text);
  let best = null;
  
  // Intent-based keywords for semantic matching
  const intentKeywords = {
    greeting: {
      en: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'],
      hi: ['हैलो', 'नमस्ते', 'हाय', 'सुप्रभात', 'नमस्कार']
    },
    fees: {
      en: ['fee', 'cost', 'price', 'tuition', 'payment', 'money', 'amount', 'charge', 'expensive'],
      hi: ['शुल्क', 'फीस', 'पैसा', 'राशि', 'लागत', 'ट्यूशन', 'खर्च']
    },
    admissions: {
      en: ['admission', 'apply', 'application', 'join', 'enroll', 'enrollment', 'entry', 'register'],
      hi: ['प्रवेश', 'आवेदन', 'दाखिला', 'भर्ती', 'पंजीकरण', 'एडमिशन']
    },
    timetable: {
      en: ['timetable', 'schedule', 'time', 'class', 'timing', 'period', 'calendar'],
      hi: ['समय', 'सारिणी', 'टाइम', 'क्लास', 'पीरियड', 'शेड्यूल']
    }
  };
  
  // First try exact/substring matching (highest confidence)
  for (const g of localQnA.items) {
    for (const qn of g.questions.filter(qo => !lang || qo.lang === lang)) {
      const questionNorm = norm(qn.text);
      let score = 0;
      
      if (questionNorm === q) {
        score = 1.0;
      } else if (questionNorm.includes(q) || q.includes(questionNorm)) {
        score = 0.85;
      } else {
        // Word overlap
        const qtoks = new Set(q.split(/\s+/).filter(t => t.length > 2));
        const qstoks = new Set(questionNorm.split(/\s+/).filter(t => t.length > 2));
        let inter = 0; 
        qtoks.forEach(t => { if (qstoks.has(t)) inter++; });
        if (qtoks.size > 0) score = (inter / qtoks.size) * 0.7;
      }
      
      if (!best || score > best.confidence) {
        best = { answer: g.answer, confidence: score, intent: g.intent, matchedQuestion: qn.text, method: 'direct' };
      }
    }
  }
  
  // If no good direct match, try intent-based semantic matching
  if (!best || best.confidence < 0.4) {
    const qTokens = q.split(/\s+/).filter(t => t.length > 1);
    
    for (const [intent, keywords] of Object.entries(intentKeywords)) {
      const langKeywords = keywords[lang] || keywords.en;
      let intentScore = 0;
      let matchedKeywords = [];
      
      // Check if question contains intent keywords
      for (const keyword of langKeywords) {
        if (q.includes(keyword)) {
          intentScore += 0.3;
          matchedKeywords.push(keyword);
        }
      }
      
      // Check for partial keyword matches
      for (const qToken of qTokens) {
        for (const keyword of langKeywords) {
          if (keyword.includes(qToken) || qToken.includes(keyword)) {
            intentScore += 0.1;
            matchedKeywords.push(qToken + '→' + keyword);
          }
        }
      }
      
      // Find the best answer for this intent
      const intentItem = localQnA.items.find(item => item.intent === intent);
      if (intentItem && intentScore > 0.2 && (!best || intentScore > best.confidence)) {
        // Prefer answer in requested language, fallback to any language
        const langAnswer = intentItem.questions.find(q => q.lang === lang);
        const answerToUse = langAnswer ? intentItem.answer : 
                           localQnA.items.find(item => item.intent === intent)?.answer || intentItem.answer;
        
        best = { 
          answer: answerToUse, 
          confidence: Math.min(intentScore, 0.8), 
          intent: intent, 
          matchedQuestion: `Intent: ${intent} (${matchedKeywords.join(', ')})`,
          method: 'semantic'
        };
      }
    }
  }
  
  return best ? [best] : [];
}

// Utility: Import QnA from CSV (tries multiple Botpress endpoint versions)
async function importCsvToBotpress(filePath) {
  const records = [];
  const parser = fs
    .createReadStream(filePath)
    .pipe(parse({ columns: true, trim: true }));
  for await (const rec of parser) {
    records.push(rec);
  }
  // Transform into Botpress QnA JSON structure
  // Minimal structure: array of { questions:[], answer, id?, category? }
  const grouped = {};
  for (const r of records) {
    const key = r.intent + '|' + r.answer; // simplistic grouping
    if (!grouped[key]) grouped[key] = { intent: r.intent, answer: r.answer, questions: [] };
    grouped[key].questions.push({ text: r.question, lang: r.language });
  }
  const qnaItems = Object.values(grouped).map(g => ({
    id: uuidv4(),
    questions: g.questions,
    answer: g.answer,
    category: g.intent
  }));

  const importPaths = [
    QNA_IMPORT_PATH_ENV ? QNA_IMPORT_PATH_ENV.replace(':botId', BOT_ID) : null,
    `/api/v1/bots/${BOT_ID}/mod/qna/import`,
    `/api/v1/bots/${BOT_ID}/qna/import`,
    `/api/bots/${BOT_ID}/qna/import`,
    WORKSPACE_ID ? `/api/v1/workspaces/${WORKSPACE_ID}/bots/${BOT_ID}/qna/import` : null,
    WORKSPACE_ID ? `/api/v1/workspaces/${WORKSPACE_ID}/bots/${BOT_ID}/mod/qna/import` : null
  ].filter(Boolean);
  let lastErr;
  const attempts = [];
  for (const p of importPaths) {
    try {
  console.log('[QNA_IMPORT_ATTEMPT]', p);
      const res = await fetch(`${BOTPRESS_URL}${p}`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(qnaItems)
      });
      if (!res.ok) {
        const txt = await res.text();
        attempts.push({ path: p, status: res.status, body: txt.slice(0,200) });
        lastErr = new Error(`[${p}] ${res.status}`);
        continue;
      }
      return await res.json().catch(()=>({ ok:true }));
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error('Import failed across endpoints: ' + lastErr.message + ' attempts=' + JSON.stringify(attempts));
}

const PUBLISH_PATH_ENV = process.env.PUBLISH_PATH; // optional explicit publish path
async function publishBot() {
  const paths = [
    PUBLISH_PATH_ENV ? PUBLISH_PATH_ENV.replace(':botId', BOT_ID) : null,
    `/api/v1/bots/${BOT_ID}/mod/channel-web/publish`,
    `/api/v1/bots/${BOT_ID}/channel-web/publish`,
    WORKSPACE_ID ? `/api/v1/workspaces/${WORKSPACE_ID}/bots/${BOT_ID}/mod/channel-web/publish` : null,
    WORKSPACE_ID ? `/api/v1/workspaces/${WORKSPACE_ID}/bots/${BOT_ID}/channel-web/publish` : null
  ].filter(Boolean);
  const attempts = [];
  let lastErr;
  for (const p of paths) {
    try {
      console.log('[PUBLISH_ATTEMPT]', p);
      const res = await fetch(`${BOTPRESS_URL}${p}`, { method: 'POST', headers: authHeaders({}) });
      if (!res.ok) {
        const txt = await res.text();
        attempts.push({ path: p, status: res.status, body: txt.slice(0,150) });
        lastErr = new Error(`[${p}] ${res.status}`);
        continue;
      }
      const js = await res.json().catch(()=>({ ok:true }));
      return { ok:true, path: p, response: js };
    } catch (e) {
      lastErr = e;
      attempts.push({ path: p, error: e.message });
    }
  }
  throw new Error('Publish failed attempts=' + JSON.stringify(attempts) + ' last=' + (lastErr && lastErr.message));
}

app.post('/api/upload-faq', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    // Parse CSV regardless to support local mode
    const records = [];
    await new Promise((resolve, reject)=>{
      fs.createReadStream(req.file.path)
        .pipe(parse({ columns: true, trim: true }))
        .on('data', r=>records.push(r))
        .on('error', reject)
        .on('end', resolve);
    });
    buildLocalIndex(records);
    if (USE_LOCAL_QNA) {
      return res.json({ status: 'imported-local', groups: localQnA.items.length });
    }
    try {
      const result = await importCsvToBotpress(req.file.path);
      res.json({ status: 'imported-botpress', items: result.length || result });
    } catch (e) {
      // Fallback silently to local if Botpress import fails
      res.json({ status: 'import-failed-using-local', error: e.message, groups: localQnA.items.length });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/retrain', async (req, res) => {
  try {
    const force = req.query.force === '1' || req.body?.force === true;
    if (USE_LOCAL_QNA && !force) {
      return res.json({ status: 'skipped', reason: 'local-qna-mode', hint: 'Add ?force=1 to override' });
    }
    try {
      const pub = await publishBot();
      res.json({ status: 'published', details: pub, forced: !!force });
    } catch (e) {
      res.status(500).json({ error: e.message, note: 'Check attempts for correct publish path; set PUBLISH_PATH env if known.' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Chat endpoint bridging frontend widget to Botpress (QnA querying)
app.post('/api/chat', async (req, res) => {
  try {
    const { userId, text, lang } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });

    // Local mode branch
    if (USE_LOCAL_QNA || localQnA.items.length) {
      const data = localSearch(text, lang);
      let reply = 'Contact Human';
      let confidence = 0;
      if (data.length) {
        confidence = data[0].confidence;
        // Use lower threshold for local mode (0.2 instead of 0.5)
        const localThreshold = USE_LOCAL_QNA ? 0.2 : FALLBACK_CONFIDENCE;
        if (confidence >= localThreshold) reply = data[0].answer;
      }
      return res.json({ reply, confidence, source: USE_LOCAL_QNA ? 'local' : 'local-fallback', threshold: USE_LOCAL_QNA ? 0.2 : FALLBACK_CONFIDENCE });
    }

    const answerPaths = [
      QNA_ANSWER_PATH_ENV ? QNA_ANSWER_PATH_ENV.replace(':botId', BOT_ID) : null,
      `/api/v1/bots/${BOT_ID}/mod/qna/answers`,
      `/api/v1/bots/${BOT_ID}/qna/answers`,
      `/api/bots/${BOT_ID}/qna/answers`,
      WORKSPACE_ID ? `/api/v1/workspaces/${WORKSPACE_ID}/bots/${BOT_ID}/qna/answers` : null,
      WORKSPACE_ID ? `/api/v1/workspaces/${WORKSPACE_ID}/bots/${BOT_ID}/mod/qna/answers` : null
    ].filter(Boolean);
    let data = [];
    let lastErr;
    const attempts = [];
    for (const p of answerPaths) {
      try {
  console.log('[QNA_ANSWER_ATTEMPT]', p);
        const r = await fetch(`${BOTPRESS_URL}${p}`, {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ question: text, lang })
        });
        if (!r.ok) {
          const txt = await r.text();
          attempts.push({ path: p, status: r.status, body: txt.slice(0,150) });
          lastErr = new Error(`[${p}] ${r.status}`);
          continue;
        }
        data = await r.json();
        break;
      } catch (e) {
        lastErr = e;
      }
    }
    if (!data || !data.length) {
      if (lastErr) throw new Error('Botpress QnA error: ' + lastErr.message + ' attempts=' + JSON.stringify(attempts));
    }
    // Suppose data = [{ answer, confidence }]
    let reply = 'Contact Human';
    let confidence = 0;
    if (Array.isArray(data) && data.length) {
      confidence = data[0].confidence || 0;
      if (confidence >= FALLBACK_CONFIDENCE) reply = data[0].answer;
    }
    res.json({ reply, confidence });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Probing endpoint: tries HEAD/GET on potential import paths to see which exist
app.get('/api/debug/qna-endpoints', async (_req, res) => {
  const candidates = [
    QNA_IMPORT_PATH_ENV ? QNA_IMPORT_PATH_ENV.replace(':botId', BOT_ID) : null,
    `/api/v1/bots/${BOT_ID}/mod/qna/import`,
    `/api/v1/bots/${BOT_ID}/qna/import`,
    `/api/bots/${BOT_ID}/qna/import`,
    `/api/v1/bots/${BOT_ID}/knowledge-base/import`,
    `/api/v1/bots/${BOT_ID}/kb/import`
  ].filter(Boolean);
  const results = [];
  for (const p of candidates) {
    try {
      const url = `${BOTPRESS_URL}${p}`;
      const r = await fetch(url, { method: 'GET' });
      results.push({ path: p, status: r.status });
    } catch (e) {
      results.push({ path: p, error: e.message });
    }
  }
  res.json({ botId: BOT_ID, results });
});

app.get('/api/debug/local-qna', (_req, res) => {
  res.json({ 
    itemCount: localQnA.items.length,
    lastUpload: localQnA.lastUpload,
    sampleItems: localQnA.items.slice(0, 3),
    useLocalQna: USE_LOCAL_QNA,
    fallbackConfidence: FALLBACK_CONFIDENCE
  });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log('Backend running on ' + port));
