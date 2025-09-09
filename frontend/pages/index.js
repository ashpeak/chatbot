import { useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  useEffect(() => {
    // Load the chat widget
    const script = document.createElement('script');
    script.src = '/widget/bundle.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <>
      <Head>
        <title>Campus Chatbot - Your AI Assistant</title>
        <meta name="description" content="Get instant answers about campus life, fees, admissions, and timetables" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎓</text></svg>" />
      </Head>
      
      {/* Main Container */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-3xl">🎓</span>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                    Campus Bot
                  </h1>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <a 
                  href="/admin" 
                  className="btn btn-primary group"
                >
                  <svg className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Admin Dashboard
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
            <div className="absolute top-20 right-10 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" style={{animationDelay: '1s'}}></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" style={{animationDelay: '2s'}}></div>
          </div>

          <div className="relative max-w-7xl mx-auto">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center min-h-[80vh]">
              
              {/* Left Content */}
              <div className="px-4 sm:px-6 lg:px-8 lg:col-span-6 py-12 lg:py-16">
                <div className="space-y-8 animate-slide-up">
                  <div className="space-y-4">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                      <span className="block text-gray-900">Your Campus</span>
                      <span className="block gradient-text">AI Assistant</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                      Get instant answers about campus life, fees, admissions, and schedules. 
                      Our multilingual chatbot is here to help you 24/7 in English and Hindi.
                    </p>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => {
                        const chatBtn = document.getElementById('campus-chat-btn');
                        if (chatBtn) chatBtn.click();
                      }}
                      className="btn btn-primary text-lg px-8 py-4 group"
                    >
                      <span className="mr-2 text-xl group-hover:animate-bounce">💬</span>
                      Start Chatting
                    </button>
                    <a href="#features" className="btn btn-secondary text-lg px-8 py-4">
                      Learn More
                    </a>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">24/7</div>
                      <div className="text-sm text-gray-600">Available</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">2</div>
                      <div className="text-sm text-gray-600">Languages</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">∞</div>
                      <div className="text-sm text-gray-600">Questions</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Visual */}
              <div className="lg:col-span-6 relative">
                <div className="relative mx-auto max-w-lg">
                  {/* Main Bot Visual */}
                  <div className="relative z-10 bg-white rounded-3xl shadow-large p-8 mx-4 border border-gray-100">
                    <div className="text-center space-y-6">
                      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-400 to-accent-500 rounded-full flex items-center justify-center text-4xl animate-bounce-gentle">
                        🤖
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Hi there! 👋</h3>
                        <p className="text-gray-600 text-sm">I'm your campus assistant ready to help!</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 text-left">
                        <div className="flex items-start space-x-2 mb-3">
                          <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-xs">🎓</div>
                          <div className="text-sm text-gray-700">Ask me about fees, admissions, or timetables!</div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 bg-accent-100 rounded-full flex items-center justify-center text-xs">🌐</div>
                          <div className="text-sm text-gray-700">Available in English and Hindi</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-4 -left-4 w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-2xl animate-pulse">
                    💰
                  </div>
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center text-2xl animate-pulse" style={{animationDelay: '0.5s'}}>
                    📅
                  </div>
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-2xl animate-pulse" style={{animationDelay: '1s'}}>
                    🎯
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                What Can I Help You With?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From basic questions to complex queries, I'm here to make your campus experience smoother
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: "💰",
                  title: "Fees & Costs",
                  description: "Get detailed information about tuition fees, payment options, and financial aid",
                  color: "from-emerald-400 to-cyan-400"
                },
                {
                  icon: "🎯",
                  title: "Admissions",
                  description: "Learn about the admission process, requirements, and important deadlines",
                  color: "from-purple-400 to-pink-400"
                },
                {
                  icon: "📅",
                  title: "Timetables",
                  description: "Find your class schedules, exam dates, and academic calendar events",
                  color: "from-amber-400 to-orange-400"
                }
              ].map((feature, index) => (
                <div key={index} className="card card-hover group">
                  <div className="p-8 text-center">
                    <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center text-3xl group-hover:animate-bounce transition-all duration-300`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-gradient-to-r from-primary-50 to-accent-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                How to Get Started
              </h2>
              <p className="text-xl text-gray-600">It's as easy as 1-2-3!</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connection Lines */}
              <div className="hidden md:block absolute top-1/2 left-1/3 w-1/3 h-0.5 bg-gradient-to-r from-primary-300 to-accent-300"></div>
              <div className="hidden md:block absolute top-1/2 right-1/3 w-1/3 h-0.5 bg-gradient-to-r from-primary-300 to-accent-300"></div>
              
              {[
                {
                  step: "01",
                  title: "Click the Chat Button",
                  description: "Look for the floating chat widget in the bottom right corner",
                  icon: "💬"
                },
                {
                  step: "02", 
                  title: "Ask Your Question",
                  description: "Type in English or Hindi - try \"Hi\" or \"फीस कितनी है?\"",
                  icon: "❓"
                },
                {
                  step: "03",
                  title: "Get Instant Answers",
                  description: "Receive accurate information immediately with helpful details",
                  icon: "⚡"
                }
              ].map((step, index) => (
                <div key={index} className="relative text-center group">
                  <div className="bg-white rounded-2xl p-8 shadow-medium hover:shadow-large transition-all duration-300 border border-gray-100">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4 group-hover:scale-110 transition-transform">
                      {step.step}
                    </div>
                    <div className="text-4xl mb-4 group-hover:animate-bounce">{step.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join thousands of students who are already using our AI assistant for their campus needs
            </p>
            <button 
              onClick={() => {
                const chatBtn = document.getElementById('campus-chat-btn');
                if (chatBtn) chatBtn.click();
              }}
              className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
            >
              <span className="mr-2 group-hover:animate-bounce">🚀</span>
              Start Chatting Now
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="text-2xl">🎓</span>
                <h3 className="text-xl font-semibold">Campus Chatbot</h3>
              </div>
              <p className="text-gray-400 mb-6">Powered by AI • Available 24/7 • Multilingual Support</p>
              <div className="flex justify-center items-center space-x-8 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span>Online</span>
                </div>
                <span>•</span>
                <span>English</span>
                <span>•</span>
                <span>हिंदी</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
