import React from 'react';
import { motion } from 'framer-motion';
import { Activity, MessageSquare, ArrowRight, PhoneCall, ClipboardList, Stethoscope, Heart } from 'lucide-react';
import { Screen } from '../types';
import { DOCTOR_IMG } from '../constants';

interface HomeProps {
  setScreen: (s: Screen) => void;
}

const HomeScreen = ({ setScreen }: HomeProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    exit={{ opacity: 0 }}
    className="max-w-7xl mx-auto px-6 md:px-12 py-12 pb-32 md:pb-12"
  >
    <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
      <div className="flex-1">
        <h2 className="text-4xl md:text-5xl font-extrabold text-house-green mb-4 leading-tight">
          Chào ông bà, <br />
          <span className="text-starbucks-green">Hôm nay ông bà thấy thế nào?</span>
        </h2>
        <p className="text-lg text-gray-500 max-w-lg mb-8">
          Chúng tôi luôn ở đây để hỗ trợ sức khỏe của ông bà một cách nhanh chóng và tận tâm nhất.
        </p>
      </div>
      <div className="flex-1 w-full relative">
        <motion.div 
          className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] relative group"
          whileHover={{ scale: 1.02 }}
        >
          <img src={DOCTOR_IMG} alt="Bác sĩ" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-black/10 transition-opacity opacity-0 group-hover:opacity-100" />
        </motion.div>
        {/* Floating Stat */}
        <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce-slow">
          <div className="w-12 h-12 bg-green-light rounded-full flex items-center justify-center">
            <Activity className="text-starbucks-green" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Nhịp tim</p>
            <p className="text-xl font-bold">72 bpm</p>
          </div>
        </div>
      </div>
    </div>

    {/* Bento Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div 
        onClick={() => setScreen('chat')}
        className="bg-white p-8 rounded-3xl card-shadow group cursor-pointer hover:bg-green-light transition-all duration-300"
      >
        <div className="w-16 h-16 bg-[#d4e9e2] rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
          <MessageSquare className="text-starbucks-green w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Chat với Bác sĩ AI</h3>
        <p className="text-gray-500 mb-8">Hỏi đáp nhanh các triệu chứng sức khỏe và nhận lời khuyên hữu ích ngay lập tức.</p>
        <div className="flex items-center text-starbucks-green font-bold gap-2 group-hover:gap-4 transition-all">
          <span>Bắt đầu trò chuyện</span>
          <ArrowRight size={20} />
        </div>
      </div>

      <div 
        onClick={() => setScreen('emergency')}
        className="bg-[#ffdad6] p-8 rounded-3xl card-shadow group cursor-pointer hover:bg-[#ffcdc9] transition-all duration-300"
      >
        <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
          <PhoneCall className="text-white w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Trợ giúp khẩn cấp</h3>
        <p className="text-gray-500 mb-8">Kết nối ngay với người thân hoặc cơ sở y tế gần nhất trong trường hợp nguy cấp.</p>
        <div className="flex items-center text-red-600 font-bold gap-2 group-hover:gap-4 transition-all">
          <span>Gọi hỗ trợ ngay</span>
          <PhoneCall size={20} />
        </div>
      </div>

      <div 
        onClick={() => setScreen('status')}
        className="bg-[#faf6ee] p-8 rounded-3xl card-shadow group cursor-pointer hover:bg-[#dfc49d] transition-all duration-300"
      >
        <div className="w-16 h-16 bg-[#cba258] rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
          <ClipboardList className="text-white w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Hồ sơ sức khỏe</h3>
        <p className="text-gray-500 mb-8">Xem lại lịch sử khám bệnh, đơn thuốc và các chỉ số sức khỏe của ông bà.</p>
        <div className="flex items-center text-[#76312f] font-bold gap-2 group-hover:gap-4 transition-all">
          <span>Xem chi tiết hồ sơ</span>
          <ArrowRight size={20} />
        </div>
      </div>
    </div>

    {/* Secondary Stats */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-house-green text-white p-6 rounded-3xl flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-300">
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
          <Stethoscope className="w-8 h-8" />
        </div>
        <div>
          <h4 className="text-lg font-bold">Nhắc nhở uống thuốc</h4>
          <p className="text-green-light text-sm">Tiếp theo: Thuốc huyết áp vào lúc 08:00 sáng mai.</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-3xl flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-300 border border-gray-100">
        <div className="w-14 h-14 bg-green-light rounded-2xl flex items-center justify-center">
          <Heart className="text-starbucks-green w-8 h-8" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-house-green">Chỉ số nhịp tim</h4>
          <p className="text-gray-500 text-sm">72 bpm - Ổn định (Cập nhật 15 phút trước)</p>
        </div>
      </div>
    </div>
  </motion.div>
);

export default HomeScreen;
