import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  MessageSquare, 
  Video, 
  Mic, 
  PhoneOff, 
  User, 
  Activity, 
  FileText, 
  Send,
  MoreVertical,
  Plus,
  Pill,
  ClipboardCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Screen } from '../types';
import { DOCTOR_IMG } from '../constants';

interface ConsultationRoomProps {
  setScreen: (s: Screen) => void;
  appointment: any;
}

const ConsultationRoom = ({ setScreen, appointment }: ConsultationRoomProps) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'history' | 'prescription'>('chat');
  const [message, setMessage] = useState('');

  const patientName = appointment?.patient?.user?.profile 
    ? `${appointment.patient.user.profile.lastName} ${appointment.patient.user.profile.firstName}`
    : 'Bệnh nhân chưa rõ';
  
  const patientVitals = {
    bp: '145/95',
    hr: '88 bpm',
    spo2: '96%',
    temp: '37.2°C',
    sugar: '6.2 mmol/L'
  };

  const messages = [
    { sender: 'doctor', text: `Chào Cán bộ, tôi đã xem qua yêu cầu của bệnh nhân ${patientName}.`, time: '09:15' },
    { sender: 'lhw', text: `Chào Bác sĩ, bệnh nhân có nội dung: ${appointment?.reason || 'Cần tư vấn sức khỏe'}.`, time: '09:16' },
    { sender: 'doctor', text: 'Hãy cho bệnh nhân nằm nghỉ ngơi và theo dõi thêm 15 phút để tôi đánh giá lại.', time: '09:17' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="h-[calc(100vh-100px)] flex flex-col"
    >
      {/* Consultation Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm relative z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setScreen('worker-home')}
            className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden border-2 border-emerald-deep">
                <img src={DOCTOR_IMG} alt="Doctor" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <h3 className="font-black text-house-green">BS. Lê Minh</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Đang trực tuyến</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
            <Video size={24} />
          </button>
          <button className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-gray-100 transition-all">
            <MoreVertical size={24} />
          </button>
        </div>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden bg-neutral-warm/50">
        {/* Left Side: Patient Vitals & Info */}
        <aside className="w-full lg:w-[380px] bg-white border-r border-gray-100 p-8 overflow-y-auto hidden lg:block">
           <div className="space-y-10">
              <section>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <User size={14} className="text-emerald-deep" /> Bệnh nhân đang khám
                </h4>
                <div className="bg-emerald-deep/5 rounded-[32px] p-6 border border-emerald-100">
                  <p className="text-xl font-black text-house-green mb-1">{patientName}</p>
                  <p className="text-sm text-gray-500 font-medium">
                    {appointment?.patient?.user?.profile?.gender || 'Chưa rõ'} • {appointment?.patient?.user?.profile?.address || 'Địa phương'}
                  </p>
                </div>
              </section>

              <section>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Activity size={14} className="text-red-500" /> Triệu chứng/Lý do
                </h4>
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-sm text-gray-700 font-medium leading-relaxed italic">
                    "{appointment?.reason || 'Cần tư vấn sức khỏe tổng quát'}"
                  </p>
                </div>
              </section>

              <section>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Activity size={14} className="text-red-500" /> Chỉ số sinh tồn (IoT)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Huyết áp', value: patientVitals.bp, unit: 'mmHg', color: 'text-red-600' },
                    { label: 'Nhịp tim', value: patientVitals.hr, unit: '', color: 'text-emerald-deep' },
                    { label: 'SPO2', value: patientVitals.spo2, unit: '', color: 'text-blue-600' },
                    { label: 'Đường huyết', value: patientVitals.sugar, unit: '', color: 'text-amber-600' }
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-inner">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{item.label}</p>
                      <p className={cn("text-lg font-black", item.color)}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <FileText size={14} className="text-blue-500" /> Ghi chú lâm sàng
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  Bệnh nhân có tiền sử cao huyết áp, hiện tại đang cảm thấy nặng ngực và hơi chóng mặt. Đã cho nằm nghỉ 10 phút.
                </p>
              </section>
           </div>
        </aside>

        {/* Center: Interaction Area */}
        <div className="flex-grow flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="bg-white px-6 flex items-center gap-8 border-b border-gray-50 overflow-x-auto no-scrollbar">
            {[
              { id: 'chat', label: 'TRAO ĐỔI', icon: MessageSquare },
              { id: 'prescription', label: 'ĐƠN THUỐC', icon: Pill },
              { id: 'history', label: 'HỒ SƠ CŨ', icon: ClipboardCheck }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "py-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all relative",
                  activeTab === tab.id ? "text-emerald-deep" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <tab.icon size={16} />
                {tab.label}
                {activeTab === tab.id && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-deep rounded-full" />}
              </button>
            ))}
          </div>

          {/* Chat Content */}
          <div className="flex-grow p-8 overflow-y-auto space-y-6 flex flex-col">
             {activeTab === 'chat' && (
               <>
                 {messages.map((m, i) => (
                   <motion.div 
                     key={i} 
                     initial={{ opacity: 0, x: m.sender === 'doctor' ? -20 : 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className={cn(
                       "flex gap-4 max-w-[80%]",
                       m.sender === 'lhw' ? "ml-auto flex-row-reverse" : ""
                     )}
                   >
                     <div className={cn(
                       "w-10 h-10 rounded-full shrink-0 shadow-sm",
                       m.sender === 'doctor' ? "bg-emerald-deep overflow-hidden" : "bg-gray-200"
                     )}>
                        {m.sender === 'doctor' && <img src={DOCTOR_IMG} alt="Doc" className="w-full h-full object-cover" />}
                     </div>
                     <div className={cn(
                       "p-5 rounded-[24px] shadow-sm",
                       m.sender === 'doctor' ? "bg-white border border-gray-50 rounded-tl-none" : "bg-emerald-deep text-white rounded-tr-none shadow-emerald-900/20"
                     )}>
                        <p className="text-sm font-medium leading-relaxed">{m.text}</p>
                        <p className={cn("text-[10px] font-bold mt-2 uppercase opacity-40", m.sender === 'lhw' ? "text-right" : "")}>{m.time}</p>
                     </div>
                   </motion.div>
                 ))}
               </>
             )}

             {activeTab === 'prescription' && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="bg-white rounded-[32px] p-8 border border-emerald-100 shadow-xl">
                    <h5 className="text-lg font-black text-house-green mb-6 flex items-center justify-between">
                      Đơn thuốc mới (Đề xuất)
                      <button className="px-4 py-2 bg-emerald-deep text-white rounded-xl text-[10px] font-black uppercase tracking-widest">ÁP DỤNG</button>
                    </h5>
                    <div className="space-y-4">
                       {[
                         { name: 'Amlodipin 5mg', dosage: '1 viên / ngày', timing: 'Sáng sau ăn' },
                         { name: 'Panadol Extra', dosage: '1 viên / khi đau', timing: 'Cách ít nhất 6 tiếng' }
                       ].map((med, i) => (
                         <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-deep shadow-sm">
                                <Pill size={20} />
                              </div>
                              <div>
                                 <p className="text-sm font-black text-house-green">{med.name}</p>
                                 <p className="text-xs text-gray-400">{med.timing}</p>
                              </div>
                           </div>
                           <p className="text-xs font-black text-emerald-deep">{med.dosage}</p>
                         </div>
                       ))}
                    </div>
                  </div>
               </motion.div>
             )}
          </div>

          {/* Chat Input */}
          <div className="p-6 bg-white border-t border-gray-100 relative z-10">
            <div className="max-w-4xl mx-auto flex items-center gap-4">
              <button className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-gray-100 transition-all">
                <Plus size={24} />
              </button>
              <div className="flex-grow relative">
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Nhập nội dung trao đổi với bác sĩ..."
                  className="w-full bg-gray-50 border-none rounded-[24px] py-4 px-6 text-sm focus:ring-2 focus:ring-emerald-deep transition-all shadow-inner outline-none"
                />
              </div>
              <button className="w-14 h-14 bg-emerald-deep text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20 hover:scale-105 active:scale-95 transition-all">
                <Send size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ConsultationRoom;
