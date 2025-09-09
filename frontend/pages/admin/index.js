import { useState } from 'react';
import Head from 'next/head';
import axios from 'axios';

export default function Admin() {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [trained, setTrained] = useState(false);
  const [localMode, setLocalMode] = useState(false);

  const upload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMsg('⚠️ Please select a CSV file');
      return;
    }
    
    setLoading(true);
    setMsg('📤 Uploading CSV file...');
    
    const fd = new FormData();
    fd.append('file', file);
    
    try {
      const res = await axios.post('http://localhost:8080/api/upload-faq', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setMsg('✅ Import done: ' + JSON.stringify(res.data));
      
      if (res.data && (res.data.status === 'imported-local' || res.data.status === 'import-failed-using-local')) {
        setLocalMode(true);
        setTrained(true);
      } else if (res.data && res.data.status === 'imported-botpress') {
        setLocalMode(false);
        setTrained(true);
      }
    } catch (err) {
      setMsg('❌ Error: ' + err.message);
    }
    
    setLoading(false);
  };

  const retrain = async () => {
    setLoading(true);
    setMsg('🔄 Publishing bot...');
    
    try {
      const res = await axios.post('http://localhost:8080/api/retrain');
      setMsg('✅ Published: ' + JSON.stringify(res.data));
      if (res.data.status === 'published') setTrained(true);
    } catch (err) {
      setMsg('❌ Error: ' + err.message);
    }
    
    setLoading(false);
  };

  const forcePublish = async () => {
    setLoading(true);
    setMsg('🚀 Force publishing...');
    
    try {
      const res = await axios.post('http://localhost:8080/api/retrain?force=1');
      setMsg('✅ Force Published: ' + JSON.stringify(res.data));
      if (res.data.status === 'published') setTrained(true);
    } catch (err) {
      setMsg('❌ Error: ' + err.message);
    }
    
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Admin Dashboard - Campus Chatbot</title>
        <meta name="description" content="Manage your campus chatbot training data" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚙️</text></svg>" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <a href="/" className="flex items-center space-x-3 group">
                  <span className="text-3xl group-hover:animate-bounce">🎓</span>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                      Campus Bot
                    </h1>
                    <p className="text-xs text-gray-500">Admin Dashboard</p>
                  </div>
                </a>
              </div>
              <div className="flex items-center space-x-4">
                <a 
                  href="/" 
                  className="btn btn-secondary group"
                >
                  <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Chat
                </a>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-3xl animate-pulse-slow">
                🤖
              </div>
            </div>
            <h2 className="text-4xl font-bold gradient-text mb-4">Bot Training Center</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Upload CSV files to train your chatbot with new Q&A pairs and manage your bot's knowledge base
            </p>
            
            {/* Status Badges */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className={`px-4 py-2 rounded-full text-sm font-medium border ${
                trained 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                <span className="mr-2">{trained ? '✅' : '⏳'}</span>
                {trained ? 'Bot Trained' : 'Not Trained'}
              </div>
              {localMode && (
                <div className="px-4 py-2 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  <span className="mr-2">🏠</span>
                  Local Mode Active
                </div>
              )}
              <div className="px-4 py-2 rounded-full text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200">
                <span className="mr-2">🌐</span>
                Multilingual Support
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            {/* Upload Section */}
            <div className="card">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-xl">📁</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Upload Training Data</h3>
                    <p className="text-primary-100 text-sm">Import new Q&A pairs from CSV</p>
                  </div>
                </div>
              </div>
              
              <form onSubmit={upload} className="p-6">
                <div className="space-y-6">
                  
                  {/* File Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select CSV File
                    </label>
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type="file"
                          accept=".csv"
                          onChange={(e) => setFile(e.target.files[0])}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 file:cursor-pointer cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary-400 rounded-lg p-4 transition-colors"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <span className="mr-2">📤</span>
                            Upload CSV File
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Format Info */}
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <span className="text-blue-400 text-lg">ℹ️</span>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-blue-800">CSV Format Requirements</h4>
                        <div className="mt-2 text-sm text-blue-700">
                          <p><strong>Columns:</strong> intent, language, question, answer</p>
                          <p className="mt-1"><strong>Example:</strong> greeting,en,"Hi","Hello! How can I help you?"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Training Section */}
            <div className="card">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🚀</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Bot Training & Publishing</h3>
                    <p className="text-emerald-100 text-sm">Deploy your training data</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                
                {/* Regular Publish */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Standard Publish</h4>
                    <p className="text-sm text-gray-600 mt-1">Apply training data to Botpress</p>
                  </div>
                  <button
                    onClick={retrain}
                    disabled={loading || localMode}
                    title={localMode ? 'Local mode active – publishing disabled' : 'Trigger Botpress publish'}
                    className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Publishing...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">🚀</span>
                        Retrain Bot
                      </>
                    )}
                  </button>
                </div>
                
                {/* Force Publish */}
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div>
                    <h4 className="font-medium text-gray-900">Force Publish</h4>
                    <p className="text-sm text-gray-600 mt-1">Override local mode restrictions</p>
                  </div>
                  <button
                    onClick={forcePublish}
                    disabled={loading}
                    className="btn btn-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Force Publishing...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">💪</span>
                        Force Publish
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Status Section */}
          {msg && (
            <div className="card mb-8">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-xl mr-2">📊</span>
                  Status & Logs
                </h3>
                <div className={`p-4 rounded-lg border-l-4 ${
                  msg.includes('✅') ? 'bg-emerald-50 border-emerald-400 text-emerald-800' :
                  msg.includes('❌') ? 'bg-red-50 border-red-400 text-red-800' :
                  msg.includes('⚠️') ? 'bg-amber-50 border-amber-400 text-amber-800' :
                  'bg-blue-50 border-blue-400 text-blue-800'
                }`}>
                  <p className="font-medium text-sm break-words">{msg}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            
            <a
              href="/uploads/sample_faq.csv"
              download
              className="card card-hover p-6 text-center group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
                <span className="text-2xl">📥</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Download Sample</h4>
              <p className="text-sm text-gray-600">Get CSV template</p>
            </a>
            
            <button
              onClick={() => window.open('/', '_blank')}
              className="card card-hover p-6 text-center group"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
                <span className="text-2xl">💬</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Test Chatbot</h4>
              <p className="text-sm text-gray-600">Try the chat widget</p>
            </button>
            
            <button
              onClick={() => setMsg('')}
              className="card card-hover p-6 text-center group"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-gray-200 transition-colors">
                <span className="text-2xl">🗑️</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Clear Status</h4>
              <p className="text-sm text-gray-600">Reset messages</p>
            </button>
            
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="card card-hover p-6 text-center group"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
                <span className="text-2xl">📈</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Botpress Admin</h4>
              <p className="text-sm text-gray-600">Advanced analytics</p>
            </a>
          </div>

          {/* Info Section */}
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-xl mr-2">💡</span>
                Quick Tips
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">CSV Format Tips:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Use quotes for text containing commas</li>
                    <li>• Support for multiple intents: greeting, fees, admissions, timetable</li>
                    <li>• Language codes: 'en' for English, 'hi' for Hindi</li>
                    <li>• Keep questions natural and conversational</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Training Best Practices:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Test with sample data first</li>
                    <li>• Include variations of common questions</li>
                    <li>• Use Force Publish if standard publish fails</li>
                    <li>• Monitor bot responses after training</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
