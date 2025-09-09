import { useState } from 'react';
import axios from 'axios';

export default function Admin(){
  const [file,setFile]=useState(null);
  const [msg,setMsg]=useState('');
  const [loading,setLoading]=useState(false);
  const [trained,setTrained]=useState(false);
  const [localMode,setLocalMode]=useState(false);

  const upload=async(e)=>{
    e.preventDefault();
    if(!file) return;
    setLoading(true); setMsg('Uploading...');
    const fd=new FormData(); fd.append('file',file);
    try {
      const res=await axios.post('http://localhost:8080/api/upload-faq',fd,{headers:{'Content-Type':'multipart/form-data'}});
      setMsg('Import done: '+JSON.stringify(res.data));
      if(res.data && (res.data.status==='imported-local' || res.data.status==='import-failed-using-local')){
        setLocalMode(true);
        setTrained(true);
      } else if (res.data && res.data.status==='imported-botpress') {
        setLocalMode(false);
        setTrained(true);
      }
    } catch(err){ setMsg('Error: '+err.message); }
    setLoading(false);
  };
  const retrain=async()=>{
    setLoading(true); setMsg('Publishing...');
    try {
      const res=await axios.post('http://localhost:8080/api/retrain');
      setMsg('Published: '+JSON.stringify(res.data));
      if(res.data.status==='published') setTrained(true);
    } catch(err){ setMsg('Error: '+err.message); }
    setLoading(false);
  };
  const forcePublish=async()=>{
    setLoading(true); setMsg('Force publishing...');
    try {
      const res=await axios.post('http://localhost:8080/api/retrain?force=1');
      setMsg('Force Published: '+JSON.stringify(res.data));
      if(res.data.status==='published') setTrained(true);
    } catch(err){ setMsg('Error: '+err.message); }
    setLoading(false);
  };
  return <main style={{padding:40,fontFamily:'sans-serif'}}>
    <h1>Admin Dashboard</h1>
    <form onSubmit={upload}>
      <input type="file" accept=".csv" onChange={e=>setFile(e.target.files[0])} />
      <button disabled={loading}>Upload FAQ CSV</button>
    </form>
    <div style={{marginTop:16}}>
      <button onClick={retrain} disabled={loading || localMode} title={localMode? 'Local mode active – publishing disabled':'Trigger Botpress publish'}>Retrain / Publish Bot</button>
      {/* <button onClick={forcePublish} disabled={loading} style={{marginLeft:12}} title='Force publish attempt regardless of local mode'>Force Publish (override local)</button> */}
    </div>
    <p style={{marginTop:12}}>Training State: {trained? 'Trained' : 'Not trained'} {localMode? '(Local Mode)' : ''}</p>
    <p>Status: {msg}</p>
    <p>Open Botpress admin at http://localhost:3000 to view analytics (after first run create bot id campus-bot).</p>
  </main>;
}
