"use client";

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
  Save,
  Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { clinicalApi } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';

const MOCK_DOCTORS = [
  { id: '1', name: 'BS. Lê Minh', specialty: 'Chuyên khoa Nội', image: 'https://ui-avatars.com/api/?name=Le+Minh&background=0D9488&color=fff' },
  { id: '2', name: 'BS. Nguyễn Thị Hương', specialty: 'Chuyên khoa Nhi', image: 'https://ui-avatars.com/api/?name=Nguyen+Huong&background=0D9488&color=fff' },
  { id: '3', name: 'BS. Trần Văn Hoàng', specialty: 'Chuyên khoa Tim mạch', image: 'https://ui-avatars.com/api/?name=Tran+Hoang&background=0D9488&color=fff' },
];

export default function ConsultationRoom() {
  const router = useRouter();
  const { id } = useParams();
  const [appointment, setAppointment] = useState<any>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await clinicalApi.getPendingRequests(); // Should be getById, but using pending/accepted for now
        const found = res.data.find((a: any) => a.id === id) || (await clinicalApi.getAcceptedRequests()).data.find((a: any) => a.id === id);
        setAppointment(found);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [id]);

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
      await clinicalApi.completeConsultation(id as string, form);
      alert('Đã gửi kết quả cho người dân và hoàn thành ca khám!');
      router.push('/dashboard');
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

  if (loading) return <div className="h-[600px] flex items-center justify-center"><Loader2 className="animate-spin text-emerald-deep" size={40} /></div>;

  if (!selectedDoctor) {
    return (
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 hover:bg-gray-50 transition-all text-gray-400"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-house-green uppercase tracking-tight">Chọn bác sĩ chuyên khoa</h1>
            <p className="text-gray-500 font-medium italic">Vui lòng chọn bác sĩ để bắt đầu phiên tham vấn cho {patientName}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {MOCK_DOCTORS.map(doc => (
            <motion.div
              key={doc.id}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => setSelectedDoctor(doc)}
              className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/40 cursor-pointer group hover:border-emerald-deep/30 transition-all text-center flex flex-col items-center"
            >
              <div className="w-24 h-24 mb-6 relative">
                <img src={doc.image} alt={doc.name} className="w-full h-full rounded-[32px] object-cover border-4 border-gray-50 group-hover:border-emerald-deep/10 transition-all shadow-sm" />
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-white" />
              </div>
              <h3 className="text-lg font-black text-house-green mb-1">{doc.name}</h3>
              <p className="text-[10px] font-bold text-emerald-deep uppercase tracking-widest mb-8">{doc.specialty}</p>
              <button className="w-full py-4 bg-gray-50 text-emerald-deep rounded-2xl text-[10px] font-black uppercase tracking-widest group-hover:bg-emerald-deep group-hover:text-white transition-all flex items-center justify-center gap-2">
                Bắt đầu hội chẩn <ChevronRight size={14} />
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
      className="-m-8 lg:-m-12 h-[calc(100vh-80px)] flex flex-col bg-gray-50/50"
    >
      {/* Session Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between shrink-0 shadow-sm z-30">
         <div className="flex items-center gap-6">
            <button 
              onClick={() => setSelectedDoctor(null)}
              className="p-2 text-gray-400 hover:text-emerald-deep hover:bg-emerald-50 rounded-lg"
            >
               <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-50 shadow-sm">
                  <img src={selectedDoctor.image} alt="Doc" className="w-full h-full object-cover" />
               </div>
               <div>
                  <h3 className="text-sm font-black text-house-green leading-none mb-1">{selectedDoctor.name}</h3>
                  <div className="flex items-center gap-2">
                     <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                     <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Đang kết nối hội chẩn</span>
                  </div>
               </div>
            </div>
         </div>
         
         <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
               <Activity size={18} className="text-amber-600" />
               <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Ca bệnh: {patientName}</span>
            </div>
            <button className="w-11 h-11 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all">
               <Video size={20} />
            </button>
         </div>
      </div>

      <div className="flex-grow flex overflow-hidden">
         {/* Patient Sidebar */}
         <aside className="w-80 bg-white border-r border-gray-100 overflow-y-auto p-8 shrink-0 hidden lg:block">
            <div className="space-y-10">
               <section>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 block">Hồ sơ bệnh nhân</label>
                  <div className="bg-emerald-deep/5 p-6 rounded-[32px] border border-emerald-100">
                     <h4 className="text-lg font-black text-house-green mb-1">{patientName}</h4>
                     <p className="text-[10px] font-bold text-gray-400 uppercase mb-4">{appointment?.patient?.user?.profile?.gender} • ID: {id?.toString().slice(0,8)}</p>
                     <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                        <Phone size={14} className="text-emerald-deep" />
                        {appointment?.patient?.user?.profile?.phone || '098XXXXXXX'}
                     </div>
                  </div>
               </section>

               <section>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 block">Lý do tham vấn</label>
                  <div className="p-5 bg-red-50 rounded-2xl border border-red-100">
                     <p className="text-sm text-red-900 font-bold leading-relaxed italic">
                        "{appointment?.reason || 'Bệnh nhân có triệu chứng đau họng kéo dài và sốt nhẹ.'}"
                     </p>
                  </div>
               </section>

               <section>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 block">Chỉ số sinh tồn</label>
                  <div className="grid grid-cols-2 gap-3">
                     {[
                       { label: 'Huyết áp', value: '145/95', unit: 'mmHg' },
                       { label: 'Nhịp tim', value: '88', unit: 'bpm' },
                       { label: 'SpO2', value: '98', unit: '%' },
                       { label: 'Nhiệt độ', value: '37.5', unit: '°C' },
                     ].map((v, i) => (
                       <div key={i} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <p className="text-[9px] font-black text-gray-400 uppercase mb-1">{v.label}</p>
                          <div className="flex items-baseline gap-1">
                             <span className="text-base font-black text-house-green">{v.value}</span>
                             <span className="text-[8px] font-bold text-gray-300">{v.unit}</span>
                          </div>
                       </div>
                     ))}
                  </div>
               </section>
            </div>
         </aside>

         {/* Chat Area */}
         <main className="flex-grow flex flex-col bg-white overflow-hidden shadow-2xl relative z-10">
            <div className="flex-grow p-8 overflow-y-auto space-y-6 scroll-smooth">
               {messages.map((m, i) => (
                 <div key={i} className={cn("flex gap-4 max-w-[80%]", m.sender === 'lhw' ? "ml-auto flex-row-reverse" : "")}>
                    <div className={cn("w-10 h-10 rounded-2xl shrink-0 shadow-sm flex items-center justify-center overflow-hidden", m.sender === 'doctor' ? "bg-emerald-deep" : "bg-gray-100")}>
                       {m.sender === 'doctor' ? <img src={selectedDoctor.image} alt="Doc" /> : <User size={20} className="text-gray-400" />}
                    </div>
                    <div className={cn(
                      "p-5 rounded-[32px] text-sm font-medium leading-relaxed shadow-sm",
                      m.sender === 'doctor' 
                        ? "bg-gray-50 text-house-green rounded-tl-none border border-gray-100" 
                        : "bg-emerald-deep text-white rounded-tr-none shadow-emerald-900/10"
                    )}>
                       {m.text}
                       <div className={cn("text-[9px] font-black uppercase mt-3 opacity-30", m.sender === 'lhw' ? "text-right" : "")}>{m.time}</div>
                    </div>
                 </div>
               ))}
            </div>

            <div className="p-8 border-t border-gray-100">
               <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-3xl border border-gray-100 shadow-inner group focus-within:ring-2 focus-within:ring-emerald-deep/10 transition-all">
                  <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Nhập nội dung trao đổi với bác sĩ..."
                    className="flex-1 bg-transparent border-none py-3 px-4 text-sm font-medium outline-none"
                  />
                  <button className="w-12 h-12 bg-emerald-deep text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20 active:scale-90 transition-all">
                     <Send size={20} />
                  </button>
               </div>
            </div>
         </main>

         {/* Report Sidebar */}
         <aside className="w-[450px] bg-gray-50 overflow-y-auto shrink-0 hidden xl:flex flex-col p-10">
            <h3 className="text-sm font-black text-house-green uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
               <div className="w-10 h-10 bg-emerald-deep text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
                  <FileText size={22} />
               </div>
               BIÊN BẢN HỘI CHẨN
            </h3>

            <div className="flex-grow space-y-8 pb-10">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Kết luận & Chẩn đoán</label>
                  <textarea 
                    value={form.diagnosis}
                    onChange={(e) => setForm({...form, diagnosis: e.target.value})}
                    placeholder="Bác sĩ kết luận bệnh gì?..."
                    rows={3}
                    className="w-full bg-white border-2 border-gray-100 rounded-[24px] p-5 text-sm font-bold focus:border-emerald-deep outline-none transition-all shadow-sm"
                  />
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Đơn thuốc chỉ định</label>
                  <textarea 
                    value={form.prescriptionSummary}
                    onChange={(e) => setForm({...form, prescriptionSummary: e.target.value})}
                    placeholder="Danh sách thuốc và liều dùng..."
                    rows={4}
                    className="w-full bg-white border-2 border-gray-100 rounded-[24px] p-5 text-sm font-bold focus:border-emerald-deep outline-none transition-all shadow-sm"
                  />
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Dặn dò & Chăm sóc</label>
                  <textarea 
                    value={form.careInstructions}
                    onChange={(e) => setForm({...form, careInstructions: e.target.value})}
                    placeholder="Bệnh nhân cần kiêng gì, làm gì?..."
                    rows={4}
                    className="w-full bg-white border-2 border-gray-100 rounded-[24px] p-5 text-sm font-bold focus:border-emerald-deep outline-none transition-all shadow-sm"
                  />
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Mức độ cần theo dõi</label>
                  <div className="grid grid-cols-3 gap-2">
                     {[
                       { id: 'normal', label: 'Ổn định', color: 'bg-emerald-500' },
                       { id: 'watch', label: 'Theo dõi', color: 'bg-amber-500' },
                       { id: 'emergency', label: 'Cấp cứu', color: 'bg-red-600' },
                     ].map(opt => (
                       <button
                         key={opt.id}
                         onClick={() => setForm({...form, followUpUrgency: opt.id})}
                         className={cn(
                           "py-3 rounded-2xl text-[10px] font-black uppercase transition-all border-2",
                           form.followUpUrgency === opt.id 
                             ? `${opt.color} text-white border-transparent shadow-lg` 
                             : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
                         )}
                       >
                          {opt.label}
                       </button>
                     ))}
                  </div>
               </div>
            </div>

            <button 
              onClick={handleComplete}
              disabled={completing}
              className="w-full py-5 bg-house-green text-white rounded-[32px] font-black text-base shadow-2xl shadow-green-900/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
            >
               {completing ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
               {completing ? 'ĐANG XỬ LÝ...' : 'HOÀN THÀNH & GỬI KẾT QUẢ'}
            </button>
         </aside>
      </div>
    </motion.div>
  );
}
