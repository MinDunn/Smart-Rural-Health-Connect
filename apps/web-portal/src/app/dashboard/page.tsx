"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Activity, 
  ClipboardList, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  Loader2,
  TrendingUp,
  Search,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { clinicalApi, authApi, patientApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function LHWDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [ongoing, setOngoing] = useState<any[]>([]);
  const [stats, setStats] = useState({ pending: 0, confirmed: 0, completed: 0, total: 0 });
  const [totalPatients, setTotalPatients] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [reqRes, ongoingRes, statsRes, patientsRes] = await Promise.all([
        clinicalApi.getPendingRequests(),
        clinicalApi.getAcceptedRequests(),
        clinicalApi.getDashboardStats(),
        patientApi.getAllPatients(),
      ]);
      setRequests(reqRes.data);
      setOngoing(ongoingRes.data);
      setStats(statsRes.data);
      setTotalPatients(Array.isArray(patientsRes.data) ? patientsRes.data.length : 0);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('srhc_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchDashboardData();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await clinicalApi.acceptRequest(id);
      router.push(`/dashboard/consultation/${id}`);
    } catch (error) {
      alert('Không thể tiếp nhận yêu cầu. Vui lòng thử lại.');
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const now = new Date();
    const created = new Date(dateStr);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    return created.toLocaleDateString('vi-VN');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-10"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Tổng bệnh nhân', value: totalPatients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Yêu cầu chờ', value: stats.pending, icon: ClipboardList, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Đang xử lý', value: stats.confirmed, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Hoàn thành', value: stats.completed, icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-house-green">{loading ? '...' : stat.value}</h3>
            </div>
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
              <stat.icon size={28} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Ongoing Cases */}
          {ongoing.length > 0 && (
            <section className="bg-emerald-deep p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
               <div className="relative z-10 flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <Activity size={32} />
                    <h2 className="text-2xl font-black uppercase tracking-tight">Ca đang xử lý</h2>
                  </div>
                  <div className="bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                     TIẾP TỤC HỖ TRỢ
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                  {ongoing.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => router.push(`/dashboard/consultation/${item.id}`)}
                      className="bg-white/10 p-6 rounded-3xl border border-white/10 hover:bg-white/20 transition-all cursor-pointer group"
                    >
                       <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-deep font-black text-xl">
                             {item.patient?.user?.profile?.firstName?.charAt(0)}
                          </div>
                          <div>
                             <h4 className="font-black">{item.patient?.user?.profile?.lastName} {item.patient?.user?.profile?.firstName}</h4>
                             <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Đang chờ tư vấn</p>
                          </div>
                       </div>
                       <div className="flex items-center justify-between text-xs font-black">
                          <span className="text-white/50 italic">Cần bác sĩ hỗ trợ</span>
                          <span className="flex items-center gap-2 group-hover:translate-x-1 transition-transform uppercase">VÀO PHÒNG <ArrowRight size={14} /></span>
                       </div>
                    </div>
                  ))}
               </div>
               
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            </section>
          )}

          {/* New Requests */}
          <section className="bg-white p-10 rounded-[48px] border border-gray-50 shadow-xl shadow-gray-200/40">
             <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                      <ClipboardList size={28} />
                   </div>
                   <h2 className="text-2xl font-black text-house-green uppercase tracking-tight">Yêu cầu mới chờ xử lý</h2>
                </div>
                <button 
                  onClick={fetchDashboardData}
                  className="p-3 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors"
                >
                   <RefreshCw size={20} className={cn(loading && "animate-spin")} />
                </button>
             </div>

             <div className="space-y-4">
                {requests.length === 0 ? (
                  <div className="text-center py-20 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-100">
                     <CheckCircle2 size={48} className="text-gray-200 mx-auto mb-4" />
                     <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Hiện chưa có yêu cầu nào mới</p>
                  </div>
                ) : (
                  requests.map((req) => (
                    <div 
                      key={req.id}
                      className="p-6 rounded-[32px] border-2 border-gray-50 hover:border-emerald-100 hover:bg-emerald-50/20 transition-all flex items-center justify-between group"
                    >
                       <div className="flex items-center gap-6">
                          <div className={cn(
                            "w-16 h-16 rounded-[24px] flex items-center justify-center shadow-lg font-black text-2xl transition-transform group-hover:scale-105",
                            req.urgency === 'high' ? "bg-red-500 text-white" : "bg-white text-emerald-deep"
                          )}>
                             {req.urgency === 'high' ? <AlertCircle size={32} /> : req.patient?.user?.profile?.firstName?.charAt(0)}
                          </div>
                          <div>
                             <h4 className="text-xl font-black text-house-green mb-1">
                                {req.patient?.user?.profile?.lastName} {req.patient?.user?.profile?.firstName}
                             </h4>
                             <p className="text-sm text-gray-500 font-medium italic">"{req.reason || 'Yêu cầu tư vấn sức khỏe'}"</p>
                          </div>
                       </div>
                       <div className="text-right flex flex-col items-end gap-3">
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                             <Clock size={12} /> {getTimeAgo(req.createdAt)}
                          </div>
                          <button 
                            onClick={() => handleAccept(req.id)}
                            className="px-6 py-2.5 bg-emerald-deep text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-900/20 active:scale-95 transition-all"
                          >
                             TIẾP NHẬN NGAY
                          </button>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </section>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
           <section className="bg-white p-8 rounded-[40px] border border-gray-50 shadow-lg">
              <h3 className="text-sm font-black text-house-green uppercase tracking-widest mb-8 flex items-center gap-2">
                 <TrendingUp size={16} className="text-emerald-600" />
                 Lối tắt nhanh
              </h3>
              <div className="space-y-4">
                 {[
                   { label: 'Tra cứu bệnh nhân', icon: Search, color: 'bg-blue-50 text-blue-600', href: '/dashboard/patients' },
                   { label: 'Đo sinh tồn mới', icon: Activity, color: 'bg-emerald-50 text-emerald-600', href: '/dashboard/vitals' },
                   { label: 'Phòng hội chẩn', icon: MessageSquare, color: 'bg-purple-50 text-purple-600', href: '/dashboard/consultation' },
                 ].map((action, i) => (
                   <button 
                     key={i}
                     onClick={() => router.push(action.href)}
                     className="w-full p-5 rounded-3xl border border-gray-50 flex items-center gap-4 hover:border-emerald-100 hover:bg-gray-50 transition-all group"
                   >
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12", action.color)}>
                         <action.icon size={24} />
                      </div>
                      <span className="font-black text-house-green text-sm uppercase tracking-tight">{action.label}</span>
                      <ArrowRight size={16} className="ml-auto text-gray-300 group-hover:text-emerald-deep group-hover:translate-x-1 transition-all" />
                   </button>
                 ))}
              </div>
           </section>

           <section className="bg-house-green p-10 rounded-[48px] text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                 <h3 className="text-xl font-black uppercase tracking-widest mb-6">Mục tiêu ngày</h3>
                 <div className="space-y-6">
                    <div>
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                          <span>Ca hoàn thành</span>
                          <span>{stats.completed} / 10</span>
                       </div>
                       <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((stats.completed / 10) * 100, 100)}%` }}
                            className="h-full bg-emerald-400"
                          />
                       </div>
                    </div>
                    <p className="text-xs text-white/50 italic leading-relaxed">
                       Cố gắng hoàn thành các yêu cầu trong ngày để tránh dồn ứ bệnh nhân ông bà nhé!
                    </p>
                 </div>
              </div>
              <div className="absolute bottom-0 right-0 p-8 text-white/5">
                 <ClipboardList size={120} />
              </div>
           </section>
        </div>
      </div>
    </motion.div>
  );
}
