import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Activity, 
  MessageSquare, 
  ClipboardList, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Search,
  Bell,
  RefreshCw,
  X,
  UserCheck,
  FileText,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Screen } from '../types';
import { clinicalApi, authApi, patientApi } from '../lib/api';

interface LHWHomeProps {
  setScreen: (s: Screen) => void;
  user: any;
  setSelectedAppointment: (a: any) => void;
}

const LHWHome = ({ setScreen, user, setSelectedAppointment }: LHWHomeProps) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [ongoing, setOngoing] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [stats, setStats] = useState({ pending: 0, confirmed: 0, completed: 0, total: 0 });
  const [totalPatients, setTotalPatients] = useState(0);
  const [loading, setLoading] = useState(true);

  // Notification state
  const [showNotifications, setShowNotifications] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [reqRes, ongoingRes, staffRes, statsRes, patientsRes] = await Promise.all([
        clinicalApi.getPendingRequests(),
        clinicalApi.getAcceptedRequests(),
        authApi.getHealthWorkers(),
        clinicalApi.getDashboardStats(),
        patientApi.getAllPatients(),
      ]);
      setRequests(reqRes.data);
      setOngoing(ongoingRes.data);
      setStaff(staffRes.data.filter((s: any) => s.id !== user.id));
      setStats(statsRes.data);
      setTotalPatients(Array.isArray(patientsRes.data) ? patientsRes.data.length : 0);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await clinicalApi.getRecentActivity();
      setActivities(res.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAccept = async (id: string) => {
    try {
      const acceptedReq = requests.find(r => r.id === id);
      await clinicalApi.acceptRequest(id);
      
      if (acceptedReq) {
        setSelectedAppointment({ ...acceptedReq, status: 'confirmed' });
        setScreen('consultation-room');
      }
      
      fetchDashboardData();
    } catch (error) {
      alert('Không thể tiếp nhận yêu cầu. Vui lòng thử lại.');
    }
  };

  const handleBellClick = () => {
    if (!showNotifications) {
      fetchActivities();
    }
    setShowNotifications(!showNotifications);
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

  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle size={16} className="text-amber-500" />;
      case 'confirmed': return <UserCheck size={16} className="text-blue-500" />;
      case 'completed': return <CheckCircle2 size={16} className="text-emerald-600" />;
      default: return <FileText size={16} className="text-gray-400" />;
    }
  };

  const getActivityLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Yêu cầu mới';
      case 'confirmed': return 'Đã tiếp nhận';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="max-w-7xl mx-auto px-6 md:px-12 py-10 pb-32"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-house-green tracking-tight">Chào Cán bộ, {user?.profile?.firstName}</h1>
          <p className="text-gray-500 font-medium italic mt-1">Trạm Y tế xã Yên Bình • Ngày {new Date().toLocaleDateString('vi-VN')}</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchDashboardData}
            className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-all text-gray-400"
          >
            <RefreshCw size={24} className={cn(loading && "animate-spin")} />
          </button>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={handleBellClick}
              className={cn(
                "relative p-3 rounded-2xl shadow-sm border cursor-pointer transition-all",
                showNotifications
                  ? "bg-emerald-deep text-white border-emerald-deep"
                  : "bg-white text-gray-400 border-gray-100 hover:bg-gray-50"
              )}
            >
              <Bell size={24} />
              {(requests.length > 0) && (
                <div className="absolute -top-1 -right-1 min-w-[22px] h-[22px] bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-[10px] font-black text-white">{requests.length}</span>
                </div>
              )}
            </button>

            {/* Notification Panel */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-16 w-[420px] bg-white rounded-[32px] shadow-2xl shadow-gray-300/40 border border-gray-100 z-50 overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="text-lg font-black text-house-green">Thông báo</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto">
                    {activities.length === 0 ? (
                      <div className="p-10 text-center text-gray-400">
                        <Bell size={40} className="mx-auto mb-3 opacity-15" />
                        <p className="font-bold text-sm">Chưa có hoạt động nào</p>
                      </div>
                    ) : (
                      activities.map((a, i) => {
                        const patientProfile = a.patient?.user?.profile;
                        const patientName = patientProfile
                          ? `${patientProfile.lastName} ${patientProfile.firstName}`
                          : 'Bệnh nhân';
                        return (
                          <div
                            key={a.id || i}
                            className={cn(
                              "px-6 py-4 flex items-start gap-4 border-b border-gray-50 last:border-none hover:bg-gray-50/50 transition-colors cursor-pointer",
                              a.status === 'pending' && "bg-amber-50/30"
                            )}
                            onClick={() => {
                              if (a.status === 'pending') {
                                handleAccept(a.id);
                              } else if (a.status === 'confirmed') {
                                setSelectedAppointment(a);
                                setScreen('consultation-room');
                              }
                              setShowNotifications(false);
                            }}
                          >
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                              {getActivityIcon(a.status)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-house-green leading-snug">
                                <span className="text-gray-500 font-medium">{getActivityLabel(a.status)}:</span> {patientName}
                              </p>
                              <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{a.reason || 'Yêu cầu hỗ trợ y tế'}</p>
                              <p className="text-[10px] text-gray-300 font-bold mt-1 flex items-center gap-1">
                                <Clock size={10} /> {getTimeAgo(a.createdAt)}
                              </p>
                            </div>
                            {a.status === 'pending' && (
                              <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-2 py-1 rounded-full uppercase shrink-0">Mới</span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="p-4 border-t border-gray-50 bg-gray-50/30">
                    <p className="text-center text-xs text-gray-400 font-bold">
                      Hiển thị {activities.length} hoạt động gần nhất
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setScreen('patient-directory')}
            className="flex items-center gap-3 px-6 py-4 bg-starbucks-green text-white rounded-2xl font-black shadow-xl shadow-green-100 hover:bg-house-green transition-all"
          >
            <Search size={20} />
            TRA CỨU BỆNH NHÂN
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Inbox */}
        <div className="lg:col-span-2 space-y-10">
          {/* Ongoing Section */}
          {ongoing.length > 0 && (
            <section className="bg-emerald-deep/5 rounded-[48px] p-10 border border-emerald-100 shadow-xl shadow-emerald-900/5">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-deep text-white rounded-2xl flex items-center justify-center">
                    <Activity size={28} />
                  </div>
                  <h2 className="text-2xl font-black text-house-green uppercase tracking-tight">Ca đang xử lý</h2>
                </div>
                <span className="px-4 py-2 bg-emerald-deep text-white rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
                  {ongoing.length} ĐANG THỰC HIỆN
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ongoing.map(item => (
                  <motion.div 
                    key={item.id}
                    whileHover={{ scale: 1.02, y: -4 }}
                    onClick={() => {
                      setSelectedAppointment(item);
                      setScreen('consultation-room');
                    }}
                    className="p-6 bg-white rounded-[32px] border border-emerald-100 shadow-sm cursor-pointer hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-emerald-deep/10 text-emerald-deep rounded-full flex items-center justify-center font-black">
                        {item.patient?.user?.profile?.firstName?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h4 className="font-black text-house-green">
                          {item.patient?.user?.profile?.lastName} {item.patient?.user?.profile?.firstName}
                        </h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Đang chờ tư vấn</p>
                      </div>
                    </div>
                    <button className="w-full py-3 bg-emerald-deep text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2">
                      VÀO PHÒNG KHÁM <ArrowRight size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          <section className="bg-white rounded-[48px] p-10 border border-gray-50 shadow-xl shadow-gray-200/40 min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-deep/10 text-emerald-deep rounded-2xl flex items-center justify-center">
                  <ClipboardList size={28} />
                </div>
                <h2 className="text-2xl font-black text-house-green uppercase tracking-tight">Yêu cầu cần xử lý</h2>
              </div>
              <span className="px-4 py-2 bg-emerald-deep/5 text-emerald-deep rounded-full text-xs font-black uppercase tracking-widest">
                {requests.length} ĐANG CHỜ
              </span>
            </div>

            <div className="space-y-4">
              {loading && requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <RefreshCw size={48} className="animate-spin mb-4 opacity-20" />
                  <p className="font-bold">Đang tải yêu cầu...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <CheckCircle2 size={64} className="mb-4 opacity-10" />
                  <p className="font-bold">Tuyệt vời! Không còn yêu cầu nào đang chờ.</p>
                </div>
              ) : (
                requests.map((req) => {
                  const patientName = req.patient?.user?.profile 
                    ? `${req.patient.user.profile.lastName} ${req.patient.user.profile.firstName}`
                    : 'Bệnh nhân chưa rõ';
                    
                  return (
                    <motion.div 
                      key={req.id}
                      whileHover={{ x: 4, scale: 1.01 }}
                      className={cn(
                        "p-6 rounded-[32px] border-2 flex items-center justify-between gap-6 transition-all cursor-pointer group",
                        req.urgency === 'high' ? "border-red-100 bg-red-50/30" : "border-gray-50 bg-gray-50/30 hover:border-emerald-100 hover:bg-white"
                      )}
                    >
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-16 h-16 rounded-[24px] flex items-center justify-center shadow-lg font-black text-2xl",
                          req.urgency === 'high' ? "bg-red-500 text-white" : "bg-white text-emerald-deep"
                        )}>
                          {req.urgency === 'high' ? <AlertCircle size={32} /> : patientName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-house-green mb-1">{patientName}</h3>
                          <p className="text-sm text-gray-500 font-medium line-clamp-1">{req.reason || 'Yêu cầu hỗ trợ chung'}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                          <Clock size={14} />
                          {getTimeAgo(req.createdAt)}
                        </div>
                        <button 
                          onClick={() => handleAccept(req.id)}
                          className="px-5 py-2 bg-white text-emerald-deep border border-emerald-100 rounded-xl text-xs font-black group-hover:bg-emerald-deep group-hover:text-white transition-all"
                        >
                          TIẾP NHẬN
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
            
            {requests.length > 0 && (
              <button className="w-full mt-8 py-4 text-gray-400 font-bold text-sm hover:text-emerald-deep transition-colors">
                XEM TẤT CẢ YÊU CẦU
              </button>
            )}
          </section>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              onClick={() => setScreen('vitals-capture')}
              className="glass p-8 rounded-[40px] border-emerald-100/50 hover:bg-emerald-deep group cursor-pointer transition-all shadow-xl"
            >
              <div className="w-16 h-16 bg-emerald-deep text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:bg-white group-hover:text-emerald-deep transition-all">
                <Activity size={32} />
              </div>
              <h3 className="text-2xl font-black text-house-green group-hover:text-white mb-2 transition-colors">Đo chỉ số nhanh</h3>
              <p className="text-sm text-gray-500 group-hover:text-emerald-100 transition-colors">Nhập Huyết áp, Đường huyết cho bệnh nhân tại chỗ.</p>
            </div>
            
            <div 
              onClick={() => setScreen('consultation-room')}
              className="glass p-8 rounded-[40px] border-blue-100/50 hover:bg-blue-600 group cursor-pointer transition-all shadow-xl"
            >
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:bg-white group-hover:text-blue-600 transition-all">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-2xl font-black text-house-green group-hover:text-white mb-2 transition-colors">Kết nối Bác sĩ</h3>
              <p className="text-sm text-gray-500 group-hover:text-blue-100 transition-colors">Yêu cầu hội chẩn từ xa cho các ca bệnh khó.</p>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <section className="bg-house-green text-white rounded-[48px] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
            <h3 className="text-xl font-black mb-6 relative z-10 uppercase tracking-widest">Thống kê trạm y tế</h3>
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between p-5 bg-white/10 rounded-3xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Users size={24} />
                  </div>
                  <span className="font-bold">Tổng bệnh nhân</span>
                </div>
                <span className="text-2xl font-black">
                  {loading ? <Loader2 size={20} className="animate-spin" /> : totalPatients}
                </span>
              </div>
              <div className="flex items-center justify-between p-5 bg-white/10 rounded-3xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <ClipboardList size={24} />
                  </div>
                  <span className="font-bold">Chờ xử lý</span>
                </div>
                <span className="text-2xl font-black">
                  {loading ? <Loader2 size={20} className="animate-spin" /> : stats.pending}
                </span>
              </div>
              <div className="flex items-center justify-between p-5 bg-white/10 rounded-3xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Activity size={24} />
                  </div>
                  <span className="font-bold">Đang xử lý</span>
                </div>
                <span className="text-2xl font-black">
                  {loading ? <Loader2 size={20} className="animate-spin" /> : stats.confirmed}
                </span>
              </div>
              <div className="flex items-center justify-between p-5 bg-white/10 rounded-3xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <span className="font-bold">Hoàn thành</span>
                </div>
                <span className="text-2xl font-black">
                  {loading ? <Loader2 size={20} className="animate-spin" /> : stats.completed}
                </span>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[40px] p-8 border border-gray-50 shadow-lg space-y-6">
          <h3 className="text-sm font-black text-house-green uppercase tracking-widest">Cán bộ cùng ca</h3>
          <div className="space-y-4">
            {staff.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Không có cán bộ nào khác trực cùng ca.</p>
            ) : (
              staff.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-50 group hover:bg-white hover:border-emerald-100 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden border border-gray-100">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${member.profile?.lastName}+${member.profile?.firstName}&background=random`} 
                        alt="Staff" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-house-green">{member.profile?.lastName} {member.profile?.firstName}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {member.role?.name === 'health_worker' ? 'Y sĩ đa khoa' : 'Bác sĩ trực'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Online</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
        </div>
      </div>
    </motion.div>
  );
};

export default LHWHome;
