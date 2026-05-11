import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Clock, CheckCircle2, AlertCircle, Search, 
  Filter, Calendar, ChevronRight, FileText, Pill, Stethoscope, 
  History as HistoryIcon, Info, RefreshCcw, WifiOff, PhoneCall
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
  const [filter, setFilter] = useState<'all' | 'pending' | 'viewed' | 'processing' | 'completed'>('all');

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
          status: r.status, // pending, viewed, processing, completed
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

  const filteredRequests = requests.filter(r => 
    filter === 'all' ? true : r.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'processing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'viewed': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'processing': return 'Đang xử lý';
      case 'viewed': return 'Bác sĩ đã xem';
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
              Lịch sử yêu cầu
            </h1>
            <p className="text-gray-500">Theo dõi tiến độ xử lý các yêu cầu y tế của ông bà.</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-starbucks-green shadow-sm border border-gray-50"
          >
            <RefreshCcw size={20} />
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar">
        {[
          { id: 'all', label: 'Tất cả' },
          { id: 'pending', label: 'Chờ duyệt' },
          { id: 'viewed', label: 'Đã xem' },
          { id: 'processing', label: 'Đang xử lý' },
          { id: 'completed', label: 'Hoàn thành' },
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
            <p className="text-gray-400 max-w-xs mx-auto">Ông bà chưa gửi yêu cầu hỗ trợ nào trong mục này.</p>
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
              className="bg-white rounded-[32px] p-6 border border-gray-50 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
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
                    <h3 className="font-bold text-house-green text-lg leading-tight line-clamp-2">
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
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 group-hover:bg-starbucks-green group-hover:text-white transition-all">
                  <ChevronRight size={20} />
                </div>
              </div>

              {req.doctorNotes && (
                <div className="mt-6 p-4 bg-green-50/50 rounded-2xl border border-green-100 flex items-start gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-starbucks-green shadow-sm shrink-0">
                    <Info size={16} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-starbucks-green uppercase tracking-widest">Phản hồi từ bác sĩ</p>
                    <p className="text-sm text-house-green italic leading-relaxed">"{req.doctorNotes}"</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

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
