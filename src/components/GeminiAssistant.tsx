import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  MessageSquare, 
  Send, 
  X, 
  Sparkles, 
  Image as ImageIcon, 
  Loader2,
  AlertCircle,
  Download,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  isError?: boolean;
}

const GeminiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your EmaraTax AI Assistant. How can I help you with your tax filings or registrations today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Check if user wants to generate an image
      if (userMessage.toLowerCase().includes('generate image') || userMessage.toLowerCase().includes('create image')) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image-preview',
          contents: [{ text: userMessage }],
          config: {
            imageConfig: {
              aspectRatio: "1:1",
              imageSize: "1K"
            }
          }
        });

        let imageUrl = '';
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }

        if (imageUrl) {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: 'I have generated the image for you based on your request.',
            image: imageUrl
          }]);
        } else {
          setMessages(prev => [...prev, { role: 'assistant', content: 'I processed your request but couldn\'t generate an image. ' + (response.text || '') }]);
        }
      } else {
        // Regular text chat
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite-preview",
          contents: userMessage,
          config: {
            systemInstruction: "You are an expert tax assistant for the UAE Federal Tax Authority (FTA) platform called EmaraTax. You help users with VAT, Corporate Tax, and Excise Tax questions. Be professional, accurate, and concise. If the user asks about specific filings, guide them to the relevant sections of the app (VAT, Corporate Tax, etc.).",
          },
        });

        setMessages(prev => [...prev, { role: 'assistant', content: response.text || 'I am sorry, I could not process that request.' }]);
      }
    } catch (error) {
      console.error('Gemini Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I encountered an error while processing your request. Please try again later.',
        isError: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#B8860B] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#9A6F09] transition-all z-50 group"
      >
        <Sparkles className="group-hover:scale-110 transition-transform" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#0A192F] p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#B8860B] rounded-full flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider">EmaraTax AI</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === 'user' ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "p-3 rounded-2xl text-[11px] font-medium leading-relaxed shadow-sm",
                      msg.role === 'user' 
                        ? "bg-[#B8860B] text-white rounded-tr-none" 
                        : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                    )}
                  >
                    {msg.content}
                    {msg.image && (
                      <div className="mt-3 relative group">
                        <img src={msg.image} alt="Generated" className="rounded-lg w-full h-auto shadow-md" />
                        <a 
                          href={msg.image} 
                          download="generated-image.png"
                          className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Download size={14} />
                        </a>
                      </div>
                    )}
                  </div>
                  {msg.isError && (
                    <div className="flex items-center gap-1 mt-1 text-[9px] text-red-500 font-bold uppercase">
                      <AlertCircle size={10} />
                      Error occurred
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm">
                    <Loader2 size={16} className="animate-spin text-[#B8860B]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1 focus-within:border-[#B8860B] transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about VAT, Corporate Tax..."
                  className="flex-1 bg-transparent py-2 text-[11px] outline-none"
                />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setInput(prev => prev + " Generate an image of ")}
                    className="p-1.5 text-gray-400 hover:text-[#B8860B] transition-colors"
                    title="Generate Image"
                  >
                    <ImageIcon size={16} />
                  </button>
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="p-1.5 bg-[#B8860B] text-white rounded-lg hover:bg-[#9A6F09] transition-colors disabled:opacity-50"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
              <p className="text-[9px] text-gray-400 mt-2 text-center font-bold uppercase tracking-wider">
                Powered by Gemini AI • Nano Banana 2
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GeminiAssistant;
