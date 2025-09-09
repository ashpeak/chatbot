(function() {
  const API_BASE = 'http://localhost:8080/api';
  const userId = localStorage.getItem('campus_user_id') || (Date.now() + "-" + Math.random().toString(36).slice(2));
  localStorage.setItem('campus_user_id', userId);
  let currentLang = 'en';
  let isOpen = false;

  // Beautiful modern styles
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    @keyframes typing {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-10px); opacity: 1; }
    }
    
    #campus-chat-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
      z-index: 1000;
      transition: all 0.3s ease;
      color: white;
      font-size: 24px;
      animation: pulse 2s infinite;
    }
    
    #campus-chat-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
    }
    
    #campus-chat-panel {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      display: none;
      flex-direction: column;
      z-index: 1001;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    #campus-chat-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    #campus-chat-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    
    #campus-chat-header p {
      margin: 0;
      font-size: 12px;
      opacity: 0.9;
    }
    
    #campus-lang {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 12px;
      cursor: pointer;
      margin-right: 8px;
    }
    
    #campus-lang option {
      color: black;
    }
    
    #campus-close {
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    #campus-chat-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    #campus-chat-messages::-webkit-scrollbar {
      width: 6px;
    }
    
    #campus-chat-messages::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }
    
    #campus-chat-messages::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }
    
    #campus-chat-messages::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
    
    .msg {
      padding: 12px 16px;
      border-radius: 18px;
      max-width: 85%;
      font-size: 14px;
      line-height: 1.4;
      word-wrap: break-word;
    }
    
    .msg.user {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 18px 18px 4px 18px;
      align-self: flex-end;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
    }
    
    .msg.bot {
      background: white;
      color: #1f2937;
      border-radius: 18px 18px 18px 4px;
      align-self: flex-start;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #667eea;
    }
    
    .typing-indicator {
      background: white;
      padding: 12px 16px;
      border-radius: 18px 18px 18px 4px;
      max-width: 85%;
      align-self: flex-start;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #667eea;
    }
    
    .typing-dots {
      display: flex;
      gap: 4px;
      align-items: center;
    }
    
    .typing-dots span {
      width: 8px;
      height: 8px;
      background: #6b7280;
      border-radius: 50%;
      animation: typing 1.4s ease-in-out infinite;
    }
    
    .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
    
    #campus-chat-input {
      padding: 16px;
      background: white;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 8px;
      align-items: center;
    }
    
    #campus-chat-input input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 25px;
      outline: none;
      font-size: 14px;
      background: #f9fafb;
      transition: all 0.2s ease;
    }
    
    #campus-chat-input input:focus {
      border-color: #667eea;
      background: white;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    #campus-chat-input button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transition: all 0.2s ease;
    }
    
    #campus-chat-input button:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
  `;
  
  document.head.appendChild(style);

  // Create chat button
  const btn = document.createElement('button');
  btn.id = 'campus-chat-btn';
  btn.innerHTML = '💬';
  document.body.appendChild(btn);

  // Create chat panel
  const panel = document.createElement('div');
  panel.id = 'campus-chat-panel';
  panel.innerHTML = `
    <div id="campus-chat-header">
      <div>
        <h3>🎓 Campus Assistant</h3>
        <p>Ask me anything!</p>
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <select id="campus-lang">
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
        </select>
        <button id="campus-close">×</button>
      </div>
    </div>
    <div id="campus-chat-messages">
      <div class="msg bot">
        Hello! 👋 I'm your campus assistant. Ask me about:
        <br>• 💰 Fees and costs
        <br>• 🎯 Admissions process  
        <br>• 📅 Class timetables
        <br><br>Try saying "Hi" or "फीस कितनी है?"
      </div>
    </div>
    <div id="campus-chat-input">
      <input placeholder="Type your message..." />
      <button>📤</button>
    </div>
  `;
  
  document.body.appendChild(panel);

  // Get elements
  const messages = panel.querySelector('#campus-chat-messages');
  const input = panel.querySelector('input');
  const sendBtn = panel.querySelector('button');
  const langSel = panel.querySelector('#campus-lang');
  const closeBtn = panel.querySelector('#campus-close');

  // Functions
  function toggleChat() {
    isOpen = !isOpen;
    panel.style.display = isOpen ? 'flex' : 'none';
    if (isOpen) {
      setTimeout(() => input.focus(), 100);
    }
  }

  function addMsg(text, className) {
    const msg = document.createElement('div');
    msg.className = 'msg ' + className;
    msg.innerHTML = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'typing-indicator';
    typing.id = 'typing-indicator';
    typing.innerHTML = `
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
  }

  function hideTyping() {
    const typing = document.getElementById('typing-indicator');
    if (typing) {
      typing.remove();
    }
  }

  async function send() {
    const text = input.value.trim();
    if (!text) return;
    
    addMsg(text, 'user');
    input.value = '';
    
    showTyping();
    
    try {
      const response = await fetch(API_BASE + '/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: userId, 
          text: text, 
          lang: currentLang 
        })
      });
      
      const data = await response.json();
      hideTyping();
      
      if (data.error) {
        addMsg('❌ Error: ' + data.error, 'bot');
      } else {
        const confidence = data.confidence || 0;
        let reply = data.reply;
        
        // Add confidence indicator for debugging (remove in production)
        if (confidence < 0.5) {
          reply += `<br><small style="opacity: 0.7;">💡 Confidence: ${(confidence * 100).toFixed(0)}%</small>`;
        }
        
        addMsg(reply, 'bot');
      }
    } catch (error) {
      hideTyping();
      addMsg('❌ Network error. Please try again later.', 'bot');
    }
  }

  // Event listeners
  btn.onclick = toggleChat;
  closeBtn.onclick = toggleChat;
  sendBtn.onclick = send;
  
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      send();
    }
  });

  langSel.addEventListener('change', () => {
    currentLang = langSel.value;
    
    // Update welcome message based on language
    const welcomeMsg = currentLang === 'hi' 
      ? 'नमस्ते! 👋 मैं आपका कैंपस असिस्टेंट हूं। मुझसे पूछें:<br>• 💰 फीस और खर्च<br>• 🎯 प्रवेश प्रक्रिया<br>• 📅 क्लास टाइमटेबल<br><br>"हैलो" या "फीस कितनी है?" कहकर देखें!'
      : 'Hello! 👋 I\'m your campus assistant. Ask me about:<br>• 💰 Fees and costs<br>• 🎯 Admissions process<br>• 📅 Class timetables<br><br>Try saying "Hi" or "What are the fees?"';
    
    // Update the first bot message
    const firstBotMsg = messages.querySelector('.msg.bot');
    if (firstBotMsg) {
      firstBotMsg.innerHTML = welcomeMsg;
    }
  });

})();
