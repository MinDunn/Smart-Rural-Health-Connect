import React from 'react';
import { motion } from 'framer-motion';
import { Activity, MessageSquare, ArrowRight, PhoneCall, ClipboardList, Stethoscope, Heart, AlertCircle, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { Screen, Profile } from '../types';
import { DOCTOR_IMG } from '../constants';

interface HomeProps {
  setScreen: (s: Screen) => void;
  profile: Profile;
}

const ProfileCompletionBanner = ({ setScreen, profile }: HomeProps) => {
  const isIncomplete = !profile.address || profile.emergencyContacts.length === 0;
  
  if (!isIncomplete) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => setScreen('user-profile')}
      className="mb-12 glass border-orange-200/50 rounded-[40px] p-8 flex items-center gap-8 cursor-pointer hover:shadow-2xl hover:scale-[1.01] transition-all group relative overflow-hidden bg-gradient-to-r from-orange-50/50 to-amber-50/50"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-orange-300/30 transition-colors" />
      
      <div className="w-16 h-16 bg-orange-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-200 group-hover:rotate-6 transition-transform">
        <AlertCircle className="text-white" size={32} />
      </div>
      <div className="flex-1">
        <h4 className="text-xl font-black text-orange-900 mb-1 leading-tight">Hoàn thiện hồ sơ sức khỏe</h4>
        <p className="text-sm md:text-base text-orange-800/70 font-medium leading-relaxed">
          Cập nhật địa chỉ và người thân để bác sĩ hỗ trợ ông bà nhanh nhất khi cần thiết.
        </p>
      </div>
      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all">
        <ChevronRight size={24} />
      </div>
    </motion.div>
  );
};

const HomeScreen = ({ setScreen, profile }: HomeProps) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    exit={{ opacity: 0 }}
    className="max-w-7xl mx-auto px-6 md:px-12 py-12 pb-32 md:pb-24 relative z-10"
  >
    <ProfileCompletionBanner setScreen={setScreen} profile={profile} />
    
    <div className="flex flex-col lg:flex-row items-center gap-16 mb-20">
      <div className="flex-1 text-center lg:text-left">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-7xl font-black text-house-green mb-6 leading-[1.1] tracking-tight">
            Chào ông bà, <br />
            <span className="text-gradient">Hôm nay ông bà thấy thế nào?</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-500 max-w-xl mb-10 font-medium leading-relaxed opacity-80">
            Chúng tôi luôn ở đây để hỗ trợ sức khỏe của ông bà một cách nhanh chóng và tận tâm nhất.
          </p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setScreen('chat')}
            className="px-10 py-5 bg-emerald-deep text-white rounded-full font-black text-lg shadow-2xl shadow-emerald-900/30 hover:bg-starbucks-green transition-all flex items-center gap-3 mx-auto lg:mx-0"
          >
            TƯ VẤN SỨC KHỎE NGAY
            <ArrowRight size={24} />
          </motion.button>
        </motion.div>
      </div>
      <div className="flex-1 w-full relative">
        <motion.div 
          className="rounded-[60px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] aspect-[4/3] relative group border-[12px] border-white glass"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <img src={DOCTOR_IMG} alt="Bác sĩ" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
          <div className="absolute inset-0 bg-emerald-deep/10 transition-opacity opacity-0 group-hover:opacity-100" />
        </motion.div>
        
        {/* Floating Stats Card */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-8 -left-8 glass p-6 rounded-[32px] shadow-2xl flex items-center gap-5 border-white/60"
        >
          <div className="w-16 h-16 bg-emerald-deep rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
            <Activity className="text-white w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Nhịp tim</p>
            <p className="text-3xl font-black text-house-green">72 <span className="text-sm opacity-50 font-bold">bpm</span></p>
          </div>
        </motion.div>

        {/* Pulsing Dot */}
        <div className="absolute top-10 right-10 flex items-center gap-3 glass py-3 px-5 rounded-full border-white/60 shadow-xl">
          <div className="w-3 h-3 bg-red-500 rounded-full pulse-soft" />
          <span className="text-sm font-black text-house-green uppercase tracking-tighter">TRỰC TUYẾN</span>
        </div>
      </div>
    </div>

    {/* Bento Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
      {[
        { 
          id: 'chat', 
          title: 'Chat với Bác sĩ AI', 
          desc: 'Hỏi đáp nhanh các triệu chứng sức khỏe và nhận lời khuyên hữu ích.',
          icon: <MessageSquare size={32} />,
          bg: 'glass hover:bg-emerald-deep hover:text-white',
          iconBg: 'bg-emerald-deep/5 text-emerald-deep group-hover:bg-white/20 group-hover:text-white',
          color: 'text-emerald-deep'
        },
        { 
          id: 'emergency', 
          title: 'Trợ giúp khẩn cấp', 
          desc: 'Kết nối ngay với người thân hoặc cơ sở y tế gần nhất trong trường hợp nguy cấp.',
          icon: <PhoneCall size={32} />,
          bg: 'bg-red-50 border-red-100/50 hover:bg-red-600 hover:text-white',
          iconBg: 'bg-red-600 text-white',
          color: 'text-red-600'
        },
        { 
          id: 'request-support', 
          title: 'Y tế xã hỗ trợ', 
          desc: 'Gửi yêu cầu trực tiếp để được cán bộ y tế địa phương tư vấn.',
          icon: <Stethoscope size={32} />,
          bg: 'bg-amber-50 border-amber-100/50 hover:bg-amber-600 hover:text-white',
          iconBg: 'bg-amber-600 text-white',
          color: 'text-amber-600'
        },
        { 
          id: 'status', 
          title: 'Hồ sơ sức khỏe', 
          desc: 'Xem lại lịch sử khám bệnh, đơn thuốc và các chỉ số sức khỏe.',
          icon: <ClipboardList size={32} />,
          bg: 'glass hover:bg-house-green hover:text-white',
          iconBg: 'bg-house-green/5 text-house-green group-hover:bg-white/20 group-hover:text-white',
          color: 'text-house-green'
        }
      ].map((item, idx) => (
        <motion.div 
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + idx * 0.1 }}
          onClick={() => setScreen(item.id as Screen)}
          className={cn(
            "p-8 rounded-[48px] border shadow-xl cursor-pointer transition-all duration-500 group flex flex-col justify-between min-h-[340px]",
            item.bg
          )}
        >
          <div>
            <div className={cn(
              "w-20 h-20 rounded-3xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-sm",
              item.iconBg
            )}>
              {item.icon}
            </div>
            <h3 className="text-2xl font-black mb-3 leading-tight">{item.title}</h3>
            <p className="opacity-70 font-medium leading-relaxed">{item.desc}</p>
          </div>
          <div className="flex items-center font-black gap-3 mt-8 group-hover:translate-x-2 transition-transform">
            <span>BẮT ĐẦU NGAY</span>
            <ArrowRight size={24} />
          </div>
        </motion.div>
      ))}
    </div>

    {/* Secondary Stats Section */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <motion.div 
        whileHover={{ y: -8 }}
        className="glass-dark p-8 rounded-[40px] flex items-center gap-8 group transition-all cursor-pointer shadow-emerald-900/40"
      >
        <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
          <Stethoscope className="text-white w-10 h-10" />
        </div>
        <div>
          <h4 className="text-2xl font-black text-white mb-1">Nhắc nhở uống thuốc</h4>
          <p className="text-emerald-100/70 text-lg font-medium italic">Tiếp theo: Thuốc huyết áp vào lúc 08:00 sáng mai.</p>
        </div>
      </motion.div>

      <motion.div 
        whileHover={{ y: -8 }}
        className="glass p-8 rounded-[40px] flex items-center gap-8 group transition-all cursor-pointer border-white/60 shadow-2xl"
      >
        <div className="w-20 h-20 bg-emerald-deep/10 rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
          <Heart className="text-emerald-deep w-10 h-10" />
        </div>
        <div>
          <h4 className="text-2xl font-black text-house-green mb-1">Chỉ số nhịp tim</h4>
          <p className="text-gray-500 text-lg font-medium italic">72 bpm - Ổn định (Cập nhật 15 phút trước)</p>
        </div>
      </motion.div>
    </div>
  </motion.div>
);

export default HomeScreen;
