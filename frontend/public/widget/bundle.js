(function(){
  const API_BASE='http://localhost:8080/api';
  const userId = localStorage.getItem('campus_user_id') || (Date.now()+"-"+Math.random().toString(36).slice(2));
  localStorage.setItem('campus_user_id', userId);
  let currentLang = 'en';
  const style = document.createElement('style');
  style.innerHTML = `#campus-chat-btn{position:fixed;bottom:20px;right:20px;background:#2563eb;color:#fff;border:none;border-radius:50%;width:60px;height:60px;font-size:26px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.2);}#campus-chat-panel{position:fixed;bottom:90px;right:20px;width:340px;height:480px;background:#fff;border:1px solid #ddd;border-radius:12px;display:flex;flex-direction:column;box-shadow:0 6px 18px rgba(0,0,0,.25);font-family:sans-serif;overflow:hidden;}#campus-chat-header{background:#1e3a8a;color:#fff;padding:10px;display:flex;justify-content:space-between;align-items:center;font-size:14px;}#campus-chat-messages{flex:1;padding:10px;overflow-y:auto;font-size:14px;}#campus-chat-messages .msg{margin:6px 0;line-height:1.3;}#campus-chat-messages .user{color:#064e3b;}#campus-chat-messages .bot{color:#111827;}#campus-chat-input{display:flex;border-top:1px solid #ddd;}#campus-chat-input input{flex:1;border:none;padding:10px;font-size:14px;outline:none;}#campus-chat-input button{border:none;background:#2563eb;color:#fff;padding:0 16px;cursor:pointer;}#campus-lang{margin-left:8px;background:#fff;color:#111;border-radius:4px;font-size:12px;}`;
  document.head.appendChild(style);
  const btn=document.createElement('button'); btn.id='campus-chat-btn'; btn.textContent='💬'; document.body.appendChild(btn);
  const panel=document.createElement('div'); panel.id='campus-chat-panel'; panel.style.display='none';
  panel.innerHTML=`<div id="campus-chat-header">Campus Chat <select id="campus-lang"><option value="en">EN</option><option value="hi">HI</option></select><span style='cursor:pointer' id='campus-close'>✖</span></div><div id='campus-chat-messages'></div><div id='campus-chat-input'><input placeholder='Type message...'/><button>Send</button></div>`;
  document.body.appendChild(panel);
  const messages=panel.querySelector('#campus-chat-messages');
  const input=panel.querySelector('input');
  const sendBtn=panel.querySelector('button');
  const langSel=panel.querySelector('#campus-lang');
  langSel.addEventListener('change',()=>{currentLang=langSel.value;});
  btn.onclick=()=>{panel.style.display = panel.style.display==='none'?'flex':'none';};
  panel.querySelector('#campus-close').onclick=()=>{panel.style.display='none';};
  function addMsg(text, cls){const d=document.createElement('div');d.className='msg '+cls;d.textContent=text;messages.appendChild(d);messages.scrollTop=messages.scrollHeight;}
  async function send(){const text=input.value.trim(); if(!text) return; addMsg(text,'user'); input.value=''; try {const r=await fetch(API_BASE+'/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId,text,lang:currentLang})}); const data=await r.json(); if(data.error) addMsg('Error: '+data.error,'bot'); else addMsg(data.reply+' (conf '+(data.confidence||0).toFixed(2)+')','bot'); } catch(e){ addMsg('Network error','bot'); }}
  sendBtn.onclick=send; input.addEventListener('keydown',e=>{if(e.key==='Enter') send();});
})();
