# Multilingual Campus Chatbot Prototype

Hackathon prototype featuring:
- Botpress backend (Docker) with QnA in English & Hindi (fees, admissions, timetable)
- React/Next.js floating chat widget + language switcher
- Admin dashboard: upload CSV, retrain/publish bot
- Fallback to human when confidence < 0.5
- Conversation analytics accessible via Botpress UI

## Repository Structure
```
backend/        Express middleware service bridging widget <-> Botpress
frontend/       Next.js app (demo page + admin + widget bundle)
uploads/        CSV files (sample_faq.csv)
docker-compose.yml
```

## Prerequisites
- Docker & Docker Compose
- Node.js 18+ (only if you want to run frontend outside Docker)

## Quick Start

### 1. Start Services
```powershell
docker compose up -d --build
```
Botpress: http://localhost:3000
Backend API: http://localhost:8080
Frontend (run manually below) will serve widget script.

### 2. Create Bot in Botpress
1. Open Botpress Studio at http://localhost:3000
2. Create a new bot with ID `campus-bot` (must match docker-compose env).
3. Enable/confirm QnA module.

### 3. Import Sample FAQ via Admin Dashboard
Install frontend deps & run dev server:
```powershell
cd frontend
npm install
npm run dev
```
Open http://localhost:3001/admin
1. Upload `uploads/sample_faq.csv`
2. Click "Retrain / Publish Bot"
3. Confirm success message.

### 4. Test Chat Widget
Go to http://localhost:3001/
- Open floating widget (bottom-right)
- Ask: "What are the tuition fees?" or Hindi: "शुल्क कितना है?"
- Switch language dropdown to EN / HI before asking each.

### 5. Analytics & Logs
In Botpress Studio -> Analytics / QnA:
- View daily conversations, top intents, languages.
(Note: This prototype relies on Botpress internal logging.)

## CSV Format
`sample_faq.csv` columns:
```
intent,language,question,answer
```
Add rows for each localized question. Import groups answers by identical answer text & intent.

## API Summary (Backend)
- POST /api/upload-faq (multipart field `file`) -> imports QnA
- POST /api/retrain -> publishes bot
- POST /api/chat JSON: { userId, text, lang } -> { reply, confidence }

## Fallback Logic
If top answer confidence < 0.5 -> reply: "Contact Human".
Adjust threshold via env `FALLBACK_CONFIDENCE` in `docker-compose.yml`.

## Embedding Widget on Any Static Page
Include script tag:
```html
<script src="http://localhost:3001/widget/bundle.js" defer></script>
```
(Ensure frontend dev server is running.)

## Environment Variables (docker-compose)
- BOTPRESS_URL=http://botpress:3000
- BOTPRESS_BOT_ID=campus-bot
- FALLBACK_CONFIDENCE=0.5

## Notes & Assumptions
- Botpress API endpoints may vary by version; adjust if 404s occur (check Botpress docs for QnA import/publish path changes).
- No authentication layer added (hackathon scope). Add auth before production.
- SQLite used via Botpress default; persistent volume at `backend/botpress-data`.

## Troubleshooting
| Issue | Tip |
|-------|-----|
| QnA import fails | Check Bot ID exists; verify endpoint path in `server.js`. |
| Confidence always 0 | Ensure QnA module is trained; try republishing. |
| CORS errors | Confirm backend allows origin; adjust `cors()` usage. |
| Widget not loading | Frontend dev server must run on port 3001. |

## Future Enhancements
See "Next Steps" section (to be expanded).

---