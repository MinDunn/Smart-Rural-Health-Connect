import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  MessageSquare, 
  Video, 
  User, 
  Activity, 
  FileText, 
  Send,
  Plus,
  Pill,
  ClipboardCheck,
  Stethoscope,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Save
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Screen } from '../types';
import { clinicalApi } from '../lib/api';

interface ConsultationRoomProps {
  setScreen: (s: Screen) => void;
  appointment: any;
}

const MOCK_DOCTORS = [
  { id: '1', name: 'BS. Lê Minh', specialty: 'Chuyên khoa Nội', image: 'https://ui-avatars.com/api/?name=Le+Minh&background=0D9488&color=fff' },
  { id: '2', name: 'BS. Nguyễn Thị Hương', specialty: 'Chuyên khoa Nhi', image: 'https://ui-avatars.com/api/?name=Nguyen+Huong&background=0D9488&color=fff' },
  { id: '3', name: 'BS. Trần Văn Hoàng', specialty: 'Chuyên khoa Tim mạch', image: 'https://ui-avatars.com/api/?name=Tran+Hoang&background=0D9488&color=fff' },
];

const ConsultationRoom = ({ setScreen, appointment }: ConsultationRoomProps) => {
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [message, setMessage] = useState('');
  
  // Synthesis Form State
  const [form, setForm] = useState({
    diagnosis: '',
    prescriptionSummary: '',
    careInstructions: '',
    followUpUrgency: 'normal',
    doctorNotes: ''
  });

  const patientName = appointment?.patient?.user?.profile 
    ? `${appointment.patient.user.profile.lastName} ${appointment.patient.user.profile.firstName}`
    : 'Bệnh nhân chưa rõ';

  const handleComplete = async () => {
    if (!form.diagnosis || !form.prescriptionSummary) {
      alert('Vui lòng điền ít nhất Kết luận bệnh và Đơn thuốc.');
      return;
    }

    setCompleting(true);
    try {
      await clinicalApi.completeConsultation(appointment.id, form);
      alert('Đã gửi kết quả cho người dân và hoàn thành ca khám!');
      setScreen('worker-home');
    } catch (error) {
      console.error('Error completing consultation:', error);
      alert('Không thể hoàn thành ca khám. Vui lòng thử lại.');
    } finally {
      setCompleting(false);
    }
  };

  const messages = [
    { sender: 'doctor', text: `Chào Cán bộ, tôi đã nhận được thông tin ca bệnh của ${patientName}. Hãy mô tả chi tiết tình trạng hiện tại.`, time: '09:15' },
    { sender: 'lhw', text: `Chào Bác sĩ, bệnh nhân có triệu chứng: ${appointment?.reason || 'Cần tư vấn'}. Hiện tại các chỉ số sinh tồn đang ổn định.`, time: '09:16' },
    { sender: 'doctor', text: 'Theo các triệu chứng này, tôi nghi ngờ bệnh nhân bị viêm họng cấp. Cần cho dùng thuốc giảm viêm và súc họng nước muối.', time: '09:17' },
  ];

  if (!selectedDoctor) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="flex items-center gap-6 mb-12">
          <button 
            onClick={() => setScreen('worker-home')}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 hover:bg-gray-50 transition-all text-gray-400"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-house-green">Bắt đầu tham vấn</h1>
            <p className="text-gray-500 font-medium italic">Vui lòng chọn bác sĩ chuyên khoa để hỗ trợ ca bệnh này</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_DOCTORS.map(doc => (
            <motion.div
              key={doc.id}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => setSelectedDoctor(doc)}
              className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/40 cursor-pointer group hover:border-emerald-deep/30 transition-all text-center"
            >
              <div className="w-24 h-24 mx-auto mb-6 relative">
                <img src={doc.image} alt={doc.name} className="w-full h-full rounded-[32px] object-cover border-4 border-gray-50 group-hover:border-emerald-deep/10 transition-all" />
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-white" />
              </div>
              <h3 className="text-lg font-black text-house-green mb-1">{doc.name}</h3>
              <p className="text-xs font-bold text-emerald-deep uppercase tracking-widest mb-6">{doc.specialty}</p>
              <button className="w-full py-3 bg-gray-50 text-emerald-deep rounded-2xl text-[10px] font-black uppercase tracking-widest group-hover:bg-emerald-deep group-hover:text-white transition-all flex items-center justify-center gap-2">
                CHỌN BÁC SĨ <ChevronRight size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="h-[calc(100vh-80px)] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm relative z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedDoctor(null)}
            className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-deep rounded-2xl overflow-hidden border-2 border-emerald-deep/10 shadow-sm">
              <img src={selectedDoctor.image} alt="Doc" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-sm font-black text-house-green leading-none mb-1">{selectedDoctor.name}</h3>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Đang tham vấn trực tuyến
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 mr-4 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
             <Stethoscope size={16} />
             <span className="text-[10px] font-black uppercase tracking-widest">Đang kết nối: {patientName}</span>
          </div>
          <button className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm">
            <Video size={20} />
          </button>
        </div>
      </div>

      {/* Main content grid */}
      <div className="flex-grow flex overflow-hidden bg-gray-50/30">
        
        {/* Left column: Patient Info (Fixed width) */}
        <aside className="w-[320px] bg-white border-r border-gray-100 overflow-y-auto p-8 shrink-0 hidden lg:block">
           <div className="space-y-10">
              <section>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <User size={14} className="text-emerald-deep" /> Hồ sơ bệnh nhân
                </h4>
                <div className="bg-emerald-deep/5 rounded-[24px] p-6 border border-emerald-100">
                  <p className="text-lg font-black text-house-green mb-1">{patientName}</p>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                    {appointment?.patient?.user?.profile?.gender || 'N/A'} • {appointment?.patient?.user?.profile?.idCard?.slice(-4) || 'XXXX'}
                  </p>
                  <p className="text-[11px] text-gray-400 font-medium mt-2 leading-relaxed">
                    {appointment?.patient?.user?.profile?.address || 'Xã Yên Bình, Vĩnh Phúc'}
                  </p>
                </div>
              </section>

              <section>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-500" /> Lý do khám
                </h4>
                <div className="p-5 bg-red-50/30 rounded-2xl border border-red-100/50">
                  <p className="text-sm text-red-900 font-bold leading-relaxed">
                    {appointment?.reason || 'Cần tư vấn hỗ trợ y tế khẩn cấp'}
                  </p>
                </div>
                {appointment?.urgency === 'high' && (
                  <div className="mt-3 px-3 py-1.5 bg-red-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 animate-pulse">
                    <Activity size={12} /> Cực kỳ khẩn cấp
                  </div>
                )}
              </section>

              <section>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Activity size={14} className="text-emerald-deep" /> Chỉ số sinh tồn
                </h4>
                <div className="grid grid-cols-2 gap-3">
                   <VitalItem label="Huyết áp" value="145/95" unit="mmHg" />
                   <VitalItem label="Nhịp tim" value="88" unit="bpm" />
                   <VitalItem label="SpO2" value="98" unit="%" />
                   <VitalItem label="Nhiệt độ" value="37.5" unit="°C" />
                </div>
              </section>
           </div>
        </aside>

        {/* Center column: Chat with Doctor (Flexible) */}
        <main className="flex-grow flex flex-col bg-white overflow-hidden">
           <div className="flex-grow p-8 overflow-y-auto space-y-6">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex gap-4 max-w-[85%]", m.sender === 'lhw' ? "ml-auto flex-row-reverse" : "")}>
                   <div className={cn("w-9 h-9 rounded-xl overflow-hidden shrink-0 shadow-sm", m.sender === 'doctor' ? "bg-emerald-deep" : "bg-gray-100")}>
                      {m.sender === 'doctor' ? <img src={selectedDoctor.image} alt="Doc" /> : <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">Y</div>}
                   </div>
                   <div className={cn(
                     "p-5 rounded-[24px] shadow-sm text-sm font-medium leading-relaxed",
                     m.sender === 'doctor' ? "bg-gray-50 text-house-green rounded-tl-none border border-gray-100" : "bg-emerald-deep text-white rounded-tr-none shadow-emerald-900/10"
                   )}>
                      {m.text}
                      <p className={cn("text-[9px] font-black uppercase mt-2 opacity-40", m.sender === 'lhw' ? "text-right" : "")}>{m.time}</p>
                   </div>
                </div>
              ))}
           </div>

           <div className="p-6 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-4 py-2 border border-gray-100 shadow-inner">
                 <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Hỏi ý kiến bác sĩ chuyên khoa..."
                    className="flex-grow bg-transparent border-none py-3 px-2 text-sm outline-none font-medium"
                 />
                 <button className="w-10 h-10 bg-emerald-deep text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
                    <Send size={18} />
                 </button>
              </div>
           </div>
        </main>

        {/* Right column: Synthesis Form (Fixed width) */}
        <aside className="w-[400px] bg-gray-50 border-l border-gray-100 overflow-y-auto shrink-0 hidden xl:flex flex-col">
           <div className="p-8 flex-grow">
              <h4 className="text-[11px] font-black text-house-green uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                 <div className="w-8 h-8 bg-emerald-deep text-white rounded-lg flex items-center justify-center shadow-sm">
                    <FileText size={18} />
                 </div>
                 BIÊN BẢN TỔNG HỢP
              </h4>

              <div className="space-y-8">
                 <FormField 
                    label="Kết luận bệnh (Chẩn đoán)" 
                    value={form.diagnosis} 
                    onChange={v => setForm({...form, diagnosis: v})} 
                    placeholder="Bác sĩ chẩn đoán là gì?..."
                    rows={3}
                 />
                 <FormField 
                    label="Đơn thuốc & Liều dùng" 
                    value={form.prescriptionSummary} 
                    onChange={v => setForm({...form, prescriptionSummary: v})} 
                    placeholder="Danh sách thuốc và cách dùng..."
                    rows={4}
                 />
                 <FormField 
                    label="Hướng dẫn chăm sóc & Lời dặn" 
                    value={form.careInstructions} 
                    onChange={v => setForm({...form, careInstructions: v})} 
                    placeholder="Bệnh nhân cần làm gì tiếp theo?..."
                    rows={4}
                 />
                 
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mức độ khẩn cấp tiếp theo</label>
                    <div className="grid grid-cols-3 gap-2">
                       {['normal', 'watch', 'emergency'].map(u => (
                         <button
                           key={u}
                           onClick={() => setForm({...form, followUpUrgency: u})}
                           className={cn(
                             "py-2.5 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border-2",
                             form.followUpUrgency === u 
                               ? (u === 'normal' ? "bg-emerald-deep text-white border-emerald-deep shadow-lg shadow-emerald-900/20" : 
                                  u === 'watch' ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-900/20" : 
                                  "bg-red-600 text-white border-red-600 shadow-lg shadow-red-900/20")
                               : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
                           )}
                         >
                           {u === 'normal' ? 'Ổn định' : u === 'watch' ? 'Theo dõi' : 'Cấp cứu'}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-8 pt-0">
              <button 
                onClick={handleComplete}
                disabled={completing}
                className="w-full py-4 bg-house-green text-white rounded-2xl font-black text-sm shadow-2xl shadow-green-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {completing ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                {completing ? 'ĐANG GỬI...' : 'GỬI KẾT QUẢ CHO NGƯỜI DÂN'}
              </button>
              <p className="text-[9px] text-gray-400 text-center font-bold uppercase tracking-widest mt-4">Kết quả sẽ được gửi ngay đến app người dân</p>
           </div>
        </aside>

      </div>
    </motion.div>
  );
};

const VitalItem = ({ label, value, unit }: { label: string, value: string, unit: string }) => (
  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">{label}</p>
    <div className="flex items-baseline gap-1">
       <span className="text-base font-black text-house-green">{value}</span>
       <span className="text-[9px] font-bold text-gray-300">{unit}</span>
    </div>
  </div>
);

const FormField = ({ label, value, onChange, placeholder, rows }: { label: string, value: string, onChange: (v: string) => void, placeholder: string, rows: number }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <textarea 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-white border-2 border-gray-100 rounded-[20px] p-4 text-sm font-medium focus:border-emerald-deep outline-none transition-all placeholder:text-gray-200"
    />
  </div>
);

export default ConsultationRoom;
