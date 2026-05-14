import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Phone, 
  User, 
  Activity,
  ChevronRight,
  Stethoscope,
  Heart
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Screen } from '../types';

interface FollowUpMonitorProps {
  setScreen: (s: Screen) => void;
}

const FollowUpMonitor = ({ setScreen }: FollowUpMonitorProps) => {
  const schedules = [
    { id: '1', patient: 'Nguyễn Văn A', time: '08:30', task: 'Thăm khám định kỳ', location: 'Thôn Đông', urgency: 'normal' },
    { id: '2', patient: 'Trần Thị B', time: '10:00', task: 'Kiểm tra huyết áp', location: 'Trạm Y tế', urgency: 'high' },
    { id: '3', patient: 'Lê Văn C', time: '14:30', task: 'Phát thuốc tháng', location: 'Thôn Tây', urgency: 'normal' },
    { id: '4', patient: 'Phạm Thị D', time: '16:00', task: 'Tiêm chủng định kỳ', location: 'Trạm Y tế', urgency: 'normal' },
  ];

  const riskyPatients = [
    { name: 'Hoàng Văn E', risk: 'Huyết áp cao', status: 'critical', trend: 'increasing' },
    { name: 'Đỗ Thị F', risk: 'Đường huyết cao', status: 'warning', trend: 'stable' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="max-w-7xl mx-auto px-6 md:px-12 py-10 pb-32"
    >
      {/* Header */}
      <div className="flex items-center gap-6 mb-12">
        <button 
          onClick={() => setScreen('worker-home')}
          className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 hover:bg-gray-50 transition-all text-gray-400"
        >
          <ArrowLeft size={28} />
        </button>
        <div>
          <h1 className="text-4xl font-black text-house-green tracking-tight">Theo dõi & Giám sát</h1>
          <p className="text-gray-500 font-medium italic mt-1">Lên lịch thăm khám và theo dõi bệnh nhân nguy cơ cao</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Schedule Section */}
        <div className="lg:col-span-2 space-y-8">
           <section className="bg-white rounded-[48px] p-10 border border-gray-50 shadow-xl shadow-gray-200/40">
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-deep/10 text-emerald-deep rounded-2xl flex items-center justify-center">
                       <CalendarIcon size={28} />
                    </div>
                    <h2 className="text-2xl font-black text-house-green uppercase tracking-tight">Lịch trình hôm nay</h2>
                 </div>
                 <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-xs font-black text-gray-400">
                    <Clock size={14} />
                    14/05/2026
                 </div>
              </div>

              <div className="space-y-6 relative before:absolute before:left-[31px] before:top-2 before:bottom-2 before:w-1 before:bg-gray-50 before:rounded-full">
                 {schedules.map((item) => (
                   <div key={item.id} className="relative pl-16">
                      <div className={cn(
                        "absolute left-6 top-6 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 transition-colors",
                        item.urgency === 'high' ? "bg-red-500" : "bg-emerald-deep"
                      )} />
                      <div className="p-6 bg-gray-50/50 border border-gray-100 rounded-[32px] flex items-center justify-between gap-6 hover:bg-white hover:shadow-xl transition-all group cursor-pointer">
                         <div className="flex items-center gap-6">
                            <div className="text-center w-16">
                               <p className="text-xl font-black text-house-green">{item.time}</p>
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Sáng</p>
                            </div>
                            <div className="w-px h-10 bg-gray-200" />
                            <div>
                               <h3 className="text-lg font-black text-house-green mb-1 group-hover:text-emerald-deep transition-colors">{item.patient}</h3>
                               <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                                  <span className="flex items-center gap-1"><Stethoscope size={12} /> {item.task}</span>
                                  <span className="flex items-center gap-1"><MapPin size={12} /> {item.location}</span>
                               </div>
                            </div>
                         </div>
                         <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-300 group-hover:bg-emerald-deep group-hover:text-white transition-all shadow-sm">
                            <CheckCircle2 size={20} />
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
           </section>
        </div>

        {/* Risky Patients Section */}
        <div className="space-y-8">
           <section className="bg-red-50 border-2 border-red-100 rounded-[48px] p-8 shadow-xl shadow-red-100/30">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                    <Activity size={28} />
                 </div>
                 <h3 className="text-xl font-black text-red-900 uppercase tracking-tight">Cảnh báo nguy cơ</h3>
              </div>
              <div className="space-y-4">
                 {riskyPatients.map((p, i) => (
                   <div key={i} className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                         <p className="font-black text-house-green">{p.name}</p>
                         <span className={cn(
                           "px-3 py-1 rounded-full text-[10px] font-black uppercase",
                           p.status === 'critical' ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                         )}>
                            {p.status === 'critical' ? 'Khẩn cấp' : 'Cần chú ý'}
                         </span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold">
                         <span className="text-gray-400 uppercase tracking-widest">{p.risk}</span>
                         <span className={cn(
                           "flex items-center gap-1",
                           p.trend === 'increasing' ? "text-red-500" : "text-emerald-deep"
                         )}>
                            {p.trend === 'increasing' ? 'Tăng cao ↑' : 'Ổn định →'}
                         </span>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 py-3 bg-red-600 text-white rounded-xl text-xs font-black shadow-lg shadow-red-200">GỌI NGAY</button>
                        <button className="px-4 py-3 bg-white text-gray-400 rounded-xl border border-gray-100"><ChevronRight size={18} /></button>
                      </div>
                   </div>
                 ))}
              </div>
           </section>

           <section className="glass p-8 rounded-[48px] border-white shadow-xl">
              <h3 className="text-xl font-black text-house-green mb-6 flex items-center gap-2">
                <Heart className="text-emerald-deep" size={24} /> Chỉ số trung bình xã
              </h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Huyết áp trung bình</span>
                    <span className="font-black text-house-green">128/82</span>
                 </div>
                 <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="w-[70%] h-full bg-emerald-deep" />
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Đường huyết trung bình</span>
                    <span className="font-black text-house-green">5.8</span>
                 </div>
                 <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="w-[60%] h-full bg-amber-500" />
                 </div>
              </div>
           </section>
        </div>
      </div>
    </motion.div>
  );
};

export default FollowUpMonitor;
