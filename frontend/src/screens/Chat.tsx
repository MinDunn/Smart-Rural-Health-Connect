import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Paperclip, Send } from 'lucide-react';
import { cn } from '../lib/utils';
import { Screen } from '../types';

interface ChatProps {
  setScreen: (s: Screen) => void;
}

const ChatScreen = ({ setScreen }: ChatProps) => {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Chào bạn! Tôi là trợ lý ảo của Sức Khỏe Việt. Bạn đang cảm thấy như thế nào hôm nay? Hãy cho tôi biết triệu chứng hoặc thắc mắc của bạn.', time: 'Mới' },
  ]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-4xl mx-auto px-4 md:px-6 flex flex-col h-[calc(100vh-72px)] md:h-[calc(100vh-72px)] pb-24 md:pb-8 relative z-10"
    >
      <div className="text-center py-8 shrink-0">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-2xl md:text-4xl font-black text-gradient mb-2"
        >
          Trò chuyện cùng Trợ lý Sức Khỏe AI
        </motion.h2>
        <p className="text-gray-500 text-xs md:text-base font-medium opacity-80">Hệ thống AI chuyên nghiệp hỗ trợ giải đáp mọi thắc mắc về sức khỏe.</p>
      </div>

      <div className="flex-grow overflow-y-auto space-y-6 pb-6 pr-2 custom-scrollbar scroll-smooth">
        {messages.map((msg, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, x: msg.role === 'bot' ? -20 : 20, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className={cn(
              "flex items-start gap-4",
              msg.role === 'user' ? "flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform hover:scale-110",
              msg.role === 'bot' ? "bg-emerald-deep pulse-soft" : "bg-starbucks-green"
            )}>
              {msg.role === 'bot' ? <Bot className="text-white w-6 h-6" /> : <User className="text-white w-6 h-6" />}
            </div>
            <div className={cn(
              "max-w-[85%] md:max-w-[75%] p-5 rounded-[28px] shadow-xl border backdrop-blur-md transition-all hover:shadow-2xl",
              msg.role === 'bot' 
                ? "glass border-white/40 rounded-tl-none" 
                : "bg-emerald-deep/90 text-white border-white/10 rounded-tr-none shadow-emerald-900/10"
            )}>
              <p className={cn(
                "text-sm md:text-base leading-relaxed font-medium",
                msg.role === 'bot' ? "text-house-green" : "text-white"
              )}>
                {msg.text}
              </p>
              <span className={cn(
                "text-[10px] font-bold mt-3 block uppercase tracking-widest opacity-50",
                msg.role === 'bot' ? "text-gray-400" : "text-emerald-100"
              )}>
                {msg.time}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="shrink-0 pt-6">
        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-3 mb-6 justify-center">
          {['Sốt & cảm cúm', 'Đau nhức cơ thể', 'Tư vấn dinh dưỡng', 'Lịch tiêm chủng'].map((chip, idx) => (
            <motion.button 
              key={chip}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (idx * 0.1) }}
              className="px-4 py-2 glass border-white/60 rounded-full text-xs md:text-sm font-bold text-emerald-deep hover:bg-emerald-deep hover:text-white transition-all active:scale-95 shadow-sm"
            >
              {chip}
            </motion.button>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass rounded-[32px] p-3 pr-4 shadow-2xl border-white/50 flex items-center gap-3 group focus-within:ring-4 focus-within:ring-emerald-deep/10 transition-all cursor-pointer"
          onClick={() => setScreen('analysis')}
        >
          <button className="p-3 text-emerald-deep/40 hover:text-emerald-deep transition-colors bg-emerald-deep/5 rounded-2xl">
            <Paperclip size={24} />
          </button>
          <div className="flex-grow py-2">
            <input 
              disabled
              type="text" 
              placeholder="Nhập triệu chứng hoặc câu hỏi tại đây..." 
              className="w-full bg-transparent border-none focus:ring-0 text-base text-house-green placeholder:text-emerald-deep/30 font-medium"
            />
          </div>
          <button className="w-12 h-12 md:w-14 md:h-14 bg-emerald-deep rounded-[20px] flex items-center justify-center text-white shadow-xl shadow-emerald-900/20 active:scale-90 transition-all hover:bg-starbucks-green hover:rotate-3">
            <Send size={24} />
          </button>
        </motion.div>
        <p className="text-[11px] text-emerald-deep/40 text-center mt-4 font-bold tracking-tight uppercase">Bấm vào khung chat hoặc gửi để xem kết quả phân tích AI mẫu.</p>
      </div>
    </motion.div>
  );
};

export default ChatScreen;
