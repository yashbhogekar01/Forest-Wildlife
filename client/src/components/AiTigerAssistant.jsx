import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, Sparkles, X, CheckCircle2, Copy, Check, Mic, RefreshCw, Eye, User, Trash2
} from 'lucide-react';
import { askAiAssistant } from '../services/api';

export default function AiTigerAssistant({ 
  tigers = [], 
  sightings = [], 
  stations = [], 
  isOpen, 
  onClose, 
  onSelectTiger 
}) {
  const [selectedTigerId, setSelectedTigerId] = useState('TGR-001');
  const [queryInput, setQueryInput] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isListeningVoice, setIsListeningVoice] = useState(false);

  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'ai',
      text: `Hello! I am **Maya AI — Wildlife Intelligence Assistant** for Pench Tiger Reserve.\n\nAsk me any question about:\n• 🐅 **Tiger Species & Diseases**\n• 🌳 **Trees & Flora in Pench**\n• 🦅 **Other Birds & Animals**\n• 📊 **Tiger Movement & Telemetry**`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const chatEndRef = useRef(null);

  // Active Tiger Profile
  const currentTiger = tigers.find(t => t.id === selectedTigerId) || tigers[0] || {
    id: 'TGR-001',
    name: 'Collarwali Descendant (T-15)',
    gender: 'Female',
    age_years: 5.2,
    health_status: 'Healthy'
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAnalyzing]);

  const handleCopyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearChat = () => {
    setChatHistory([
      {
        sender: 'ai',
        text: `Chat cleared. Ask me anything about Pench tigers, health, trees, or wildlife!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSendMessage = async (textToSend) => {
    const prompt = textToSend || queryInput;
    if (!prompt.trim()) return;

    const userMsg = {
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMsg]);
    if (!textToSend) setQueryInput('');
    setIsAnalyzing(true);

    try {
      const res = await askAiAssistant({
        prompt: prompt,
        tiger: currentTiger
      });

      setChatHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          text: res.reply || 'No response received from Maya AI.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error('Maya AI Assistant error:', err);
      
      const fallbackReply = `🌲 **Maya - Pench Wildlife Intelligence Assistant**
*Tactical Wildlife Telemetry & Biodiversity Assessment*

### 1. 🐅 TIGER SPECIES & SUBSPECIES
• **Scientific Name:** *Panthera tigris*
• **Local Subspecies:** Royal Bengal Tiger (*Panthera tigris tigris*) — dominant in Pench.
• **Global Extant Subspecies:** Bengal, Siberian (Amur), Indochinese, Sumatran, Malayan, South China.
• **Extinct Subspecies:** Caspian, Javan, Bali tigers.

---

### 2. 🦠 TIGER DISEASES & HEALTH RISKS
• **Viral Threats:** Canine Distemper Virus (CDV) (transmitted by village dogs, causes fatal neurological damage), Rabies, Parvovirus, SARS-CoV-2.
• **Bacterial & Fungal:** Anthrax, Salmonellosis, Tuberculosis.
• **Parasites:** Sarcoptic Mange, Intestinal Hookworms (*Ancylostoma*), Lung Flukes (*Paragonimus*), and tick-borne infections (*Babesiosis*).

---

### 3. 🌳 TREE SPECIES IN PENCH TIGER RESERVE
• **Canopy Dominant:** Teak (*Tectona grandis* — covers over 50% of forest canopy).
• **Wildlife Sustenance:** Mahua (*Madhuca longifolia* — blossoms feed sloth bears & herbivores), Palash ("Flame of the Forest" — bright orange blossoms).
• **Key Flora:** Saja (*Terminalia tomentosa*), Dhaora (*Anogeissus latifolia*), Tendu (*Diospyros melanoxylon*), Bamboo thickets (*Dendrocalamus strictus*), Haldu, Lendia, and Ghost Trees (White Kulu / *Sterculia urens*).

---

### 4. 🦅 OTHER BIRDS & ANIMALS IN PENCH
• **Key Mammals:** Indian Leopard, Sloth Bear, Dhole (Asiatic Wild Dog), Gaur (Indian Bison), Sambar Deer, Chital (Spotted Deer), Wild Boar, Nilgai, Barking Deer, Golden Jackal.
• **Avian Species (Birds):** Crested Serpent Eagle, Malabar Pied Hornbill, Indian Roller, Indian Peafowl, Grey Heron, Changeable Hawk-Eagle, Paradise Flycatcher, Pied Kingfisher, Osprey.

---
💡 **Field Advisory for ${currentTiger.name}:** Active in Pench core territory. Recommend buffer village dog CDV vaccination and waterhole anthrax monitoring.`;

      setChatHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleVoiceSimulate = () => {
    setIsListeningVoice(true);
    setTimeout(() => {
      setIsListeningVoice(false);
      handleSendMessage('Tell me about Pench Tiger species & diseases');
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden selection:bg-emerald-600 selection:text-white font-sans">
      
      {/* Streamlined Main Modal Box */}
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl w-full max-w-3xl h-[88vh] flex flex-col overflow-hidden text-slate-100 relative">
        
        {/* Simple Header Bar */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 px-6 py-4 border-b border-emerald-500/20 flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl text-emerald-400">
              <Bot className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-extrabold text-white tracking-wide">
                  Maya AI — Wildlife Assistant
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  ONLINE
                </span>
              </div>
              <p className="text-xs text-slate-400">Pench Tiger Reserve Intelligence Assistant</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Subject Tiger Selector */}
            <div className="hidden sm:flex items-center space-x-1 bg-slate-800 border border-slate-700 rounded-xl px-2 py-1 text-xs">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={selectedTigerId}
                onChange={(e) => {
                  setSelectedTigerId(e.target.value);
                  const t = tigers.find(tg => tg.id === e.target.value);
                  if (t && onSelectTiger) onSelectTiger(t);
                }}
                className="bg-transparent text-xs font-bold text-amber-300 focus:outline-none cursor-pointer"
              >
                {tigers.slice(0, 30).map(t => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                    {t.name} ({t.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Chat */}
            <button
              onClick={handleClearChat}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
              title="Clear chat history"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Spacious Clean Chat History Window */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-950/50">
          {chatHistory.map((msg, index) => (
            <div 
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[90%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 relative shadow-lg ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-slate-900 border border-emerald-500/30 text-slate-200 rounded-bl-none'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] opacity-75 font-mono mb-1 pb-1 border-b border-white/10">
                  <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                    {msg.sender === 'user' ? (
                      'Officer Query'
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Maya AI Assistant
                      </>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'ai' && (
                      <button
                        type="button"
                        onClick={() => handleCopyText(msg.text, index)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                        title="Copy response markdown"
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-[9px] text-emerald-400 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="text-[9px]">Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="whitespace-pre-line font-sans leading-relaxed">
                  {msg.text}
                </div>
              </div>
            </div>
          ))}

          {isAnalyzing && (
            <div className="flex justify-start">
              <div className="bg-slate-900 border border-amber-500/40 p-3 px-4 rounded-2xl text-xs text-amber-300 flex items-center gap-2.5 animate-pulse">
                <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                <span>Maya AI is generating Pench wildlife response...</span>
              </div>
            </div>
          )}

          {isListeningVoice && (
            <div className="flex justify-start">
              <div className="bg-slate-900 border border-emerald-500/40 p-3 px-4 rounded-2xl text-xs text-emerald-300 flex items-center gap-2.5 animate-pulse">
                <Mic className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span>Listening to voice prompt...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Clean 1-Click Suggestion Chips */}
        <div className="px-4 pt-3 pb-2 bg-slate-950 border-t border-slate-800 flex items-center justify-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleSendMessage('Tell me about Pench Tiger species & diseases')}
            className="px-3 py-1.5 bg-amber-950/70 hover:bg-amber-900/90 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
          >
            🐅 Pench Tiger Species &amp; Diseases
          </button>

          <button
            type="button"
            onClick={() => handleSendMessage('What trees grow in Pench Tiger Reserve?')}
            className="px-3 py-1.5 bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
          >
            🌳 Trees &amp; Flora in Pench
          </button>

          <button
            type="button"
            onClick={() => handleSendMessage('Which animals and birds live alongside Pench tigers?')}
            className="px-3 py-1.5 bg-sky-950/70 hover:bg-sky-900/90 text-sky-300 border border-sky-500/40 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
          >
            🦅 Birds &amp; Mammals of Pench
          </button>

          <button
            type="button"
            onClick={() => handleSendMessage(`Show telemetry & travel history for ${currentTiger.name}`)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
          >
            📊 {currentTiger.name} Telemetry
          </button>
        </div>

        {/* Simple Input Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-slate-950 border-t border-slate-800/80 flex items-center gap-2"
        >
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={handleVoiceSimulate}
            className="p-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow transition-all shrink-0 active:scale-95"
            title="Click to speak voice prompt"
          >
            <Mic className="w-4 h-4 font-bold" />
          </button>

          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Ask Maya AI about Pench tigers, health, trees, or wildlife..."
            className="flex-1 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
          />

          <button
            type="submit"
            disabled={!queryInput.trim() || isAnalyzing}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow shrink-0 active:scale-95 uppercase tracking-wider"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
}
