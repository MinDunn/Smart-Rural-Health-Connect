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
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="max-w-4xl mx-auto px-4 md:px-6 flex flex-col h-[calc(100vh-72px)] md:h-[calc(100vh-72px)] pb-24 md:pb-8"
    >
      <div className="text-center py-6 shrink-0">
        <h2 className="text-xl md:text-2xl font-bold text-house-green">Trò chuyện cùng Trợ lý Sức Khỏe AI</h2>
        <p className="text-gray-500 text-xs md:text-sm mt-1">Hệ thống AI chuyên nghiệp hỗ trợ giải đáp mọi thắc mắc về sức khỏe.</p>
      </div>

      <div className="flex-grow overflow-y-auto space-y-6 pb-6 pr-1 custom-scrollbar scroll-smooth">
        {messages.map((msg, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex items-start gap-3",
              msg.role === 'user' ? "flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
              msg.role === 'bot' ? "bg-starbucks-green" : "bg-house-green"
            )}>
              {msg.role === 'bot' ? <Bot className="text-white w-5 h-5" /> : <User className="text-white w-5 h-5" />}
            </div>
            <div className={cn(
              "max-w-[80%] md:max-w-[70%] p-4 rounded-2xl shadow-sm border",
              msg.role === 'bot' 
                ? "bg-white border-gray-100 rounded-tl-none" 
                : "bg-green-light border-starbucks-green/10 rounded-tr-none"
            )}>
              <p className="text-sm leading-relaxed text-gray-800">{msg.text}</p>
              <span className="text-[9px] font-bold text-gray-400 mt-2 block uppercase tracking-tighter">{msg.time}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="shrink-0 pt-4 bg-neutral-warm">
        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {['Sốt & cảm cúm', 'Đau nhức cơ thể', 'Tư vấn dinh dưỡng', 'Lịch tiêm chủng'].map(chip => (
            <button key={chip} className="px-3 py-1.5 bg-white border border-gray-100 rounded-full text-[10px] md:text-xs font-bold text-starbucks-green hover:bg-green-light transition-all active:scale-95">
              {chip}
            </button>
          ))}
        </div>

        <div 
          className="bg-white rounded-[24px] p-2 pr-3 shadow-2xl border border-gray-100 flex items-center gap-2 group focus-within:ring-2 focus-within:ring-starbucks-green/20 transition-all cursor-pointer"
          onClick={() => setScreen('analysis')}
        >
          <button className="p-3 text-gray-400 hover:text-starbucks-green transition-colors">
            <Paperclip size={20} />
          </button>
          <div className="flex-grow py-2">
            <input 
              disabled
              type="text" 
              placeholder="Nhập triệu chứng hoặc câu hỏi tại đây..." 
              className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-600 placeholder:text-gray-300"
            />
          </div>
          <button className="w-10 h-10 md:w-12 md:h-12 bg-starbucks-green rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all hover:bg-house-green">
            <Send size={20} />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-3 font-medium italic">Bấm vào khung chat hoặc gửi để xem kết quả phân tích AI mẫu.</p>
      </div>
    </motion.div>
  );
};

export default ChatScreen;
