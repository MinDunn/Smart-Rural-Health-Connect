import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Clock, CheckCircle2, AlertCircle, Search, 
  Calendar, ChevronRight, FileText, Pill, Stethoscope, 
  History as HistoryIcon, Info, RefreshCcw, WifiOff, PhoneCall,
  Activity, ClipboardCheck
} from 'lucide-react';
import { Screen } from '../types';
import { cn } from '../lib/utils';
import { clinicalApi } from '../lib/api';

interface RequestHistoryProps {
  setScreen: (s: Screen) => void;
  patientId: string | null;
}

const RequestHistoryScreen = ({ setScreen, patientId }: RequestHistoryProps) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [isFetchingResult, setIsFetchingResult] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!patientId) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await clinicalApi.getHistory(patientId);
        
        const savedRaw = localStorage.getItem('srhc_pending_requests');
        let offlineRequests = [];
        if (savedRaw && savedRaw !== "undefined") {
          try {
            offlineRequests = JSON.parse(savedRaw).map((r: any, idx: number) => ({
              ...r,
              id: `offline-${idx}`,
              status: 'pending',
              createdAt: new Date().toISOString(),
              isOffline: true
            }));
          } catch (e) {
            console.error("Error parsing offline requests", e);
          }
        }

        const onlineRequests = res.data.map((r: any) => ({
          id: r.id,
          supportType: r.reason?.includes('PRESCRIPTION') ? 'prescription' : r.urgency === 'high' ? 'urgent' : 'general',
          reason: r.reason,
          status: r.status, // pending, confirmed, processing, completed
          createdAt: r.createdAt || r.appointmentDate,
          doctorNotes: r.consultation?.doctorNotes
        }));

        setRequests([...offlineRequests, ...onlineRequests].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [patientId]);

  const fetchResult = async (appointmentId: string) => {
    setIsFetchingResult(true);
    try {
      const res = await clinicalApi.getConsultationResult(appointmentId);
      setSelectedResult(res.data);
    } catch (error) {
      console.error('Error fetching result:', error);
      alert('Không tìm thấy biên bản kết luận cho ca khám này.');
    } finally {
      setIsFetchingResult(false);
    }
  };

  const filteredRequests = requests.filter(r => 
    filter === 'all' ? true : r.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'processing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Đã có kết quả';
      case 'processing': return 'Đang xử lý';
      case 'confirmed': return 'Đã tiếp nhận';
      default: return 'Đã gửi / Chờ duyệt';
    }
  };

  const getSupportIcon = (type: string) => {
    switch (type) {
      case 'prescription': return <Pill className="text-orange-500" size={20} />;
      case 'urgent': return <AlertCircle className="text-red-500" size={20} />;
      default: return <Stethoscope className="text-blue-500" size={20} />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="max-w-4xl mx-auto px-6 py-10 pb-32"
    >
      <header className="space-y-6 mb-10">
        <button 
          onClick={() => setScreen('home')} 
          className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-starbucks-green transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Trang chủ
        </button>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-house-green tracking-tight flex items-center gap-3">
              <HistoryIcon className="text-starbucks-green" size={36} />
              Lịch sử hỗ trợ
            </h1>
            <p className="text-gray-500">Ông bà xem lại kết luận và dặn dò của bác sĩ tại đây.</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-starbucks-green shadow-sm border border-gray-50"
          >
            <RefreshCcw size={20} />
          </button>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar">
        {[
          { id: 'all', label: 'Tất cả' },
          { id: 'pending', label: 'Chờ duyệt' },
          { id: 'confirmed', label: 'Đã nhận' },
          { id: 'completed', label: 'Có kết quả' },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id as any)}
            className={cn(
              "px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border-2",
              filter === btn.id 
                ? "bg-starbucks-green border-starbucks-green text-white shadow-lg" 
                : "bg-white border-gray-50 text-gray-500 hover:border-gray-200"
            )}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-starbucks-green border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 font-medium">Đang tải lịch sử...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-[40px] p-16 text-center border border-gray-50 shadow-sm space-y-6">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
            <Search size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-house-green">Không có yêu cầu nào</h3>
            <p className="text-gray-400 max-w-xs mx-auto">Ông bà chưa có kết luận y tế nào trong mục này.</p>
          </div>
          <button 
            onClick={() => setScreen('request-support')}
            className="px-8 py-4 bg-starbucks-green text-white rounded-2xl font-bold shadow-lg hover:bg-house-green transition-all"
          >
            GỬI YÊU CẦU NGAY
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <motion.div
              layout
              key={req.id}
              onClick={() => req.status === 'completed' && fetchResult(req.id)}
              className={cn(
                "bg-white rounded-[32px] p-6 border border-gray-50 shadow-sm transition-all group",
                req.status === 'completed' ? "cursor-pointer hover:border-emerald-200 hover:shadow-md" : "opacity-80"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-emerald-50 transition-colors">
                    {getSupportIcon(req.supportType)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase border", getStatusColor(req.status))}>
                        {getStatusLabel(req.status)}
                      </span>
                      {req.isOffline && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-orange-50 text-orange-600 border border-orange-100 flex items-center gap-1">
                          <WifiOff size={10} /> Ngoại tuyến
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-house-green text-lg leading-tight line-clamp-2 group-hover:text-emerald-900 transition-colors">
                      {req.reason.split('. ')[0].replace(/\[.*?\]\s*/, '')}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {new Date(req.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  req.status === 'completed' ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white" : "bg-gray-50 text-gray-300"
                )}>
                  {isFetchingResult && req.status === 'completed' ? <RefreshCcw size={18} className="animate-spin" /> : <ChevronRight size={20} />}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Result Modal */}
      <AnimatePresence>
        {selectedResult && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/40 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-white w-full max-w-2xl rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
             >
                <div className="p-8 bg-emerald-deep text-white flex items-center justify-between shrink-0">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                         <ClipboardCheck size={28} />
                      </div>
                      <div>
                         <h2 className="text-2xl font-black uppercase tracking-tight">KẾT QUẢ TƯ VẤN</h2>
                         <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Ngày khám: {new Date(selectedResult.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                   </div>
                   <button 
                    onClick={() => setSelectedResult(null)}
                    className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center hover:bg-black/20 transition-all"
                   >
                      <ArrowLeft size={20} className="rotate-90 sm:rotate-0" />
                   </button>
                </div>

                <div className="p-8 overflow-y-auto space-y-10 custom-scrollbar">
                   <section>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Kết luận bệnh</label>
                      <div className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100">
                         <p className="text-lg font-black text-house-green leading-relaxed">
                            {selectedResult.diagnosis || "Chưa có kết luận cụ thể."}
                         </p>
                      </div>
                   </section>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <section>
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4 flex items-center gap-2">
                            <Pill size={14} className="text-starbucks-green" /> Đơn thuốc & Liều dùng
                         </label>
                         <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm min-h-[120px]">
                            <p className="text-sm text-gray-700 font-medium whitespace-pre-line leading-relaxed">
                               {selectedResult.prescriptionSummary || "Không có đơn thuốc chỉ định."}
                            </p>
                         </div>
                      </section>

                      <section>
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4 flex items-center gap-2">
                            <Info size={14} className="text-blue-500" /> Hướng dẫn & Dặn dò
                         </label>
                         <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm min-h-[120px]">
                            <p className="text-sm text-gray-700 font-medium whitespace-pre-line leading-relaxed">
                               {selectedResult.careInstructions || "Nghỉ ngơi và theo dõi thêm tại nhà."}
                            </p>
                         </div>
                      </section>
                   </div>

                   <div className={cn(
                     "p-6 rounded-[32px] border flex items-center justify-between",
                     selectedResult.followUpUrgency === 'emergency' ? "bg-red-50 border-red-100 text-red-700" :
                     selectedResult.followUpUrgency === 'watch' ? "bg-amber-50 border-amber-100 text-amber-700" :
                     "bg-blue-50 border-blue-100 text-blue-700"
                   )}>
                      <div className="flex items-center gap-4">
                         <div className={cn(
                           "w-12 h-12 rounded-2xl flex items-center justify-center",
                           selectedResult.followUpUrgency === 'emergency' ? "bg-red-600 text-white" :
                           selectedResult.followUpUrgency === 'watch' ? "bg-amber-500 text-white" :
                           "bg-blue-600 text-white"
                         )}>
                            <Activity size={24} />
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Mức độ theo dõi tiếp theo</p>
                            <p className="text-lg font-black uppercase">
                               {selectedResult.followUpUrgency === 'emergency' ? "Cấp cứu ngay lập tức" :
                                selectedResult.followUpUrgency === 'watch' ? "Cần theo dõi sát sao" :
                                "Ổn định - Theo dõi tại nhà"}
                            </p>
                         </div>
                      </div>
                      <CheckCircle2 size={32} className="opacity-20" />
                   </div>
                </div>

                <div className="p-8 pt-0 mt-auto shrink-0">
                   <button 
                     onClick={() => setSelectedResult(null)}
                     className="w-full py-5 bg-house-green text-white rounded-2xl font-black text-lg shadow-xl shadow-green-900/20 active:scale-95 transition-all"
                   >
                      TÔI ĐÃ HIỂU
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Helper Card */}
      <div className="mt-12 bg-house-green rounded-[40px] p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-green-300">
              <Info size={28} />
            </div>
            <h4 className="text-xl font-bold">Ông bà cần lưu ý</h4>
          </div>
          <p className="text-green-50/70 text-sm leading-relaxed">
            Nếu bác sĩ chưa phản hồi kịp hoặc tình trạng trở nên xấu đi, ông bà hãy gọi ngay số điện thoại trực ban 24/7 của xã.
          </p>
          <div className="flex items-center gap-4">
            <button className="flex-1 py-4 bg-white text-house-green rounded-2xl font-black text-sm flex items-center justify-center gap-2">
              <PhoneCall size={18} /> GỌI TRẠM XÁ
            </button>
            <button className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2">
              <AlertCircle size={18} /> GỌI 115
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RequestHistoryScreen;
