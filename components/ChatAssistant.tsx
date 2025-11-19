import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { Chat } from "@google/genai";
import { createChatSession, sendChatMessage } from '../services/geminiService';
import { ChatMessage } from '../types';

interface ChatAssistantProps {
  contextText: string;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ contextText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I can help you refine your text further. Just ask!', timestamp: Date.now() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      chatSessionRef.current = createChatSession();
    } catch (e) {
      console.error("Failed to init chat", e);
    }
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || !chatSessionRef.current) return;

    const userMsg: ChatMessage = { role: 'user', text: inputValue, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      let prompt = inputValue;
      // Context aware prompting if this is the first interaction or explicitly asked
      if (messages.length < 3 && contextText) {
        prompt = `Context: The user is working on this text: "${contextText.substring(0, 500)}..."\n\nUser Request: ${inputValue}`;
      }

      const responseText = await sendChatMessage(chatSessionRef.current, prompt);
      
      setMessages(prev => [...prev, {
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'model',
        text: "Sorry, I encountered an error. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-red-900 to-red-950 border border-red-800/50 hover:from-red-800 hover:to-red-900 text-amber-100 rounded-full shadow-xl shadow-black/50 flex items-center justify-center transition-transform hover:scale-105 z-50"
        aria-label="Open Chat Assistant"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div 
      className={`fixed bottom-6 right-6 bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800 flex flex-col overflow-hidden transition-all duration-300 z-50 ${isMinimized ? 'w-72 h-14' : 'w-80 sm:w-96 h-[500px]'}`}
    >
      {/* Header */}
      <div className="bg-zinc-950 border-b border-zinc-800 p-3 flex items-center justify-between text-zinc-200 shrink-0">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-amber-500" />
          <span className="font-semibold text-sm text-amber-50">Assistant</span>
        </div>
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => setIsMinimized(!isMinimized)} 
            className="p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-white"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-900/95 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm border ${
                    msg.role === 'user' 
                      ? 'bg-amber-900/20 border-amber-900/50 text-amber-100 rounded-br-none' 
                      : 'bg-zinc-800 border-zinc-700 text-zinc-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 border border-zinc-700 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex space-x-1">
                  <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-zinc-950 border-t border-zinc-800 shrink-0">
            <div className="relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask for edits..."
                className="w-full pr-10 pl-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 resize-none h-10 max-h-24 placeholder-zinc-600"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-amber-500 hover:bg-amber-950/30 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};