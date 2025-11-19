import React, { useState } from 'react';
import { Sparkles, Zap, Wand2, Copy, Check, Download, Trash2, ArrowRight, FileText, BrainCircuit, Crown } from 'lucide-react';
import { humanizeContent } from './services/geminiService';
import { ProcessingMode, ToneStyle } from './types';
import { Button } from './components/Button';
import { ChatAssistant } from './components/ChatAssistant';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<ProcessingMode>(ProcessingMode.FAST);
  const [tone, setTone] = useState<ToneStyle>(ToneStyle.CONVERSATIONAL);
  const [copied, setCopied] = useState(false);

  const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

  const handleProcess = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    try {
      const result = await humanizeContent(inputText, mode, tone);
      setOutputText(result);
    } catch (error) {
      alert("Failed to process text. Please check your API Key configuration or try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'humanized-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans text-zinc-200 selection:bg-amber-900 selection:text-amber-100">
      
      {/* Header */}
      <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-30 shadow-md shadow-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-amber-500 to-amber-700 p-1.5 rounded-lg shadow-lg shadow-amber-900/20">
              <BrainCircuit className="w-6 h-6 text-zinc-950" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-100">Humanize<span className="text-amber-500">AI</span> <span className="text-zinc-600 text-sm font-normal ml-1">v1.1</span></span>
          </div>
          
          <div className="hidden sm:flex items-center space-x-6 text-xs font-medium tracking-wider uppercase">
            <div className="flex items-center space-x-2 text-zinc-400">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Flash 2.5</span>
            </div>
            <div className="w-px h-4 bg-zinc-800"></div>
            <div className="flex items-center space-x-2 text-zinc-400">
              <Crown className="w-4 h-4 text-red-700" />
              <span>Pro 3</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-6">
        
        {/* Left Panel: Input */}
        <section className="flex-1 flex flex-col min-h-[300px] bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-colors duration-300 shadow-sm">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/30 shrink-0">
            <h2 className="font-medium text-zinc-300 flex items-center text-sm tracking-wide uppercase">
              <FileText className="w-4 h-4 mr-2 text-amber-600" />
              Ai Text
            </h2>
            <div className="flex items-center space-x-2">
              <label className="cursor-pointer text-xs font-medium text-zinc-500 hover:text-amber-500 transition-colors flex items-center px-2 py-1 rounded hover:bg-zinc-800">
                Import .txt
                <input type="file" accept=".txt" className="hidden" onChange={handleFileUpload} />
              </label>
              {inputText && (
                <button 
                  onClick={() => setInputText('')}
                  className="text-xs font-medium text-zinc-600 hover:text-red-400 transition-colors px-2 py-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          
          <div className="flex-1 relative group flex flex-col">
            <textarea
              className="w-full flex-1 p-6 resize-none focus:outline-none text-zinc-300 leading-relaxed text-base bg-transparent placeholder-zinc-700 font-light"
              placeholder="Paste AI-generated text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <div className="absolute bottom-3 right-4 text-xs text-zinc-500 bg-zinc-950/80 px-2 py-1 rounded-md pointer-events-none border border-zinc-800">
              {wordCount(inputText)} words
            </div>
          </div>
        </section>

        {/* Center Panel: Controls (Desktop) / Divider (Mobile) */}
        <div className="flex lg:flex-col items-center justify-center gap-4 shrink-0 z-10">
            <div className="bg-zinc-900 p-3 rounded-xl shadow-xl shadow-black/20 border border-zinc-800 flex flex-row lg:flex-col gap-4 w-full lg:w-auto justify-center">
                {/* Mode Selection */}
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1 hidden lg:block text-center">Engine</span>
                    <div className="flex lg:flex-col gap-2">
                        <button
                            onClick={() => setMode(ProcessingMode.FAST)}
                            className={`p-3 rounded-lg flex items-center justify-center lg:justify-start space-x-3 transition-all w-full lg:w-40 border ${
                              mode === ProcessingMode.FAST 
                                ? 'bg-amber-950/30 text-amber-400 border-amber-900/50' 
                                : 'bg-zinc-950/50 text-zinc-500 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-300'
                            }`}
                            title="Fast & Efficient (Flash 2.5)"
                        >
                            <Zap className="w-4 h-4 shrink-0" />
                            <div className="text-left flex flex-col">
                              <span className="text-xs font-bold uppercase">Speed</span>
                              <span className="text-[10px] opacity-70 hidden sm:inline">Flash 2.5</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setMode(ProcessingMode.QUALITY)}
                            className={`p-3 rounded-lg flex items-center justify-center lg:justify-start space-x-3 transition-all w-full lg:w-40 border ${
                              mode === ProcessingMode.QUALITY 
                                ? 'bg-red-950/30 text-red-400 border-red-900/50' 
                                : 'bg-zinc-950/50 text-zinc-500 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-300'
                            }`}
                            title="Deep Analysis (Pro)"
                        >
                            <Crown className="w-4 h-4 shrink-0" />
                            <div className="text-left flex flex-col">
                              <span className="text-xs font-bold uppercase">Pro Mode</span>
                              <span className="text-[10px] opacity-70 hidden sm:inline">Gemini Pro</span>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="w-px h-auto lg:w-auto lg:h-px bg-zinc-800 mx-2 lg:mx-0"></div>

                {/* Tone Selection */}
                <div className="flex flex-col gap-2 flex-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1 hidden lg:block text-center">Style</span>
                    <select 
                        value={tone}
                        onChange={(e) => setTone(e.target.value as ToneStyle)}
                        className="w-full lg:w-40 p-2.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-zinc-300 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none appearance-none cursor-pointer hover:border-zinc-600 transition-colors"
                        style={{backgroundImage: 'none'}}
                    >
                        {Object.values(ToneStyle).map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
                
                <div className="lg:mt-2">
                    <Button 
                        onClick={handleProcess}
                        isLoading={isProcessing}
                        disabled={!inputText}
                        className="w-full lg:w-40 h-11 shadow-lg shadow-amber-900/20"
                    >
                        {isProcessing ? 'Refining...' : (
                            <span className="flex items-center uppercase text-xs font-bold tracking-widest">
                                Humanize <ArrowRight className="w-3 h-3 ml-2" />
                            </span>
                        )}
                    </Button>
                </div>
            </div>
        </div>

        {/* Right Panel: Output */}
        <section className="flex-1 flex flex-col min-h-[300px] bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden relative hover:border-zinc-700 transition-colors duration-300 shadow-sm">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/30 shrink-0">
            <h2 className="font-medium text-zinc-300 flex items-center text-sm tracking-wide uppercase">
              <Wand2 className="w-4 h-4 mr-2 text-amber-500" />
              Humanized Result
            </h2>
            <div className="flex items-center space-x-2">
                <button 
                    onClick={handleCopy} 
                    disabled={!outputText}
                    className="p-1.5 text-zinc-500 hover:text-amber-400 hover:bg-amber-950/30 rounded-md transition-colors disabled:opacity-30"
                    title="Copy to clipboard"
                >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button 
                    onClick={handleExport} 
                    disabled={!outputText}
                    className="p-1.5 text-zinc-500 hover:text-amber-400 hover:bg-amber-950/30 rounded-md transition-colors disabled:opacity-30"
                    title="Export as .txt"
                >
                    <Download className="w-4 h-4" />
                </button>
            </div>
          </div>

          <div className="flex-1 bg-transparent relative flex flex-col">
            {outputText ? (
                <textarea
                    className="w-full flex-1 p-6 resize-none focus:outline-none text-amber-50 leading-relaxed text-base bg-transparent font-light"
                    value={outputText}
                    onChange={(e) => setOutputText(e.target.value)}
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 p-8 text-center">
                    {isProcessing ? (
                        <div className="flex flex-col items-center animate-pulse">
                            <div className="w-14 h-14 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                <Sparkles className="w-6 h-6 text-amber-500 animate-spin-slow" />
                            </div>
                            <p className="text-sm font-medium text-amber-500/80 tracking-wide uppercase">Polishing Prose...</p>
                            <p className="text-xs mt-2 text-zinc-600">Using {mode === ProcessingMode.FAST ? 'Gemini Flash 2.5' : 'Gemini Pro 3'}</p>
                        </div>
                    ) : (
                        <>
                            <Wand2 className="w-12 h-12 mb-4 text-zinc-800" />
                            <p className="text-sm text-zinc-500 font-medium uppercase tracking-widest">Awaiting Input</p>
                            <p className="text-xs mt-2 max-w-xs text-zinc-700">Experience professional quality text refinement.</p>
                        </>
                    )}
                </div>
            )}
             {outputText && (
                <div className="absolute bottom-3 right-4 text-xs text-amber-500/80 bg-zinc-950/90 border border-amber-900/30 px-2 py-1 rounded-md pointer-events-none">
                {wordCount(outputText)} words
                </div>
            )}
          </div>
        </section>
      </main>

      {/* Floating Chat Assistant */}
      <ChatAssistant contextText={outputText || inputText} />

    </div>
  );
};

export default App;