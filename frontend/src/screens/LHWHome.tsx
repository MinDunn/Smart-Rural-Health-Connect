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
  Loader2,
  XCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Screen } from '../types';
import { clinicalApi, authApi, patientApi } from '../lib/api';

interface LHWHomeProps {
  setScreen: (s: Screen) => void;
  user: any;
  setSelectedAppointment: (a: any) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const LHWHome = ({ setScreen, user, setSelectedAppointment, showToast }: LHWHomeProps) => {
  // Sync request states with unified backend status updates
  const [requests, setRequests] = useState<any[]>([]);
  const [ongoing, setOngoing] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [stats, setStats] = useState({ pending: 0, confirmed: 0, completed: 0, rejected: 0, total: 0 });
  const [totalPatients, setTotalPatients] = useState(0);
  const [loading, setLoading] = useState(true);

  // Rejected Modal State
  const [showRejectedModal, setShowRejectedModal] = useState(false);
  const [rejectedRequests, setRejectedRequests] = useState<any[]>([]);
  const [loadingRejected, setLoadingRejected] = useState(false);

  // Notification state
  const [showNotifications, setShowNotifications] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  const [previewRequest, setPreviewRequest] = useState<any>(null);
  const [confirmAccept, setConfirmAccept] = useState<string | null>(null);
  const [confirmReject, setConfirmReject] = useState<string | null>(null);
  const [viewedRequests, setViewedRequests] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('srhc_viewed_requests');
      if (saved && saved !== 'undefined') return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading viewed requests:', e);
    }
    return [];
  });

  const unreadCount = requests.filter(r => r.status === 'pending' && !viewedRequests.includes(r.id)).length;

  const markAsViewed = (id: string) => {
    if (!viewedRequests.includes(id)) {
      const newViewed = [...viewedRequests, id];
      setViewedRequests(newViewed);
      localStorage.setItem('srhc_viewed_requests', JSON.stringify(newViewed));
    }
  };

  const markAllAsViewed = () => {
    const unreadIds = requests.filter(r => r.status === 'pending' && !viewedRequests.includes(r.id)).map(r => r.id);
    if (unreadIds.length > 0) {
      const newViewed = [...new Set([...viewedRequests, ...unreadIds])];
      setViewedRequests(newViewed);
      localStorage.setItem('srhc_viewed_requests', JSON.stringify(newViewed));
    }
  };

  const handleBellClick = () => {
    const newState = !showNotifications;
    if (newState) {
      fetchActivities();
      markAllAsViewed();
    }
    setShowNotifications(newState);
  };

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
    markAsViewed(id);
    try {
      const acceptedReq = requests.find(r => r.id === id) || previewRequest;
      await clinicalApi.updateStatus(id, 'confirmed');
      
      if (acceptedReq) {
        setSelectedAppointment({ ...acceptedReq, status: 'confirmed' });
        setScreen('consultation-room');
      }
      
      setPreviewRequest(null);
      setConfirmAccept(null);
      fetchDashboardData();
      showToast('Đã tiếp nhận yêu cầu!', 'success');
    } catch (error) {
      showToast('Không thể tiếp nhận yêu cầu.', 'error');
    }
  };

  const handleReject = async (id: string) => {
    markAsViewed(id);
    try {
      await clinicalApi.updateStatus(id, 'rejected');
      showToast('Đã từ chối yêu cầu.', 'info');
      setPreviewRequest(null);
      setConfirmReject(null);
      fetchDashboardData();
    } catch (error) {
      showToast('Có lỗi xảy ra khi từ chối.', 'error');
    }
  };

  const handleOpenRejected = async () => {
    setShowRejectedModal(true);
    setLoadingRejected(true);
    try {
      const res = await clinicalApi.getRejectedRequests();
      setRejectedRequests(res.data);
    } catch (error) {
      showToast('Lỗi khi tải danh sách từ chối.', 'error');
    } finally {
      setLoadingRejected(false);
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
      className="max-w-7xl mx-auto px-6 md:px-12 py-6 pb-12"
    >
      {/* Quick Preview Modal */}
      <AnimatePresence>
        {previewRequest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-house-green/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[48px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-deep text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">
                    {previewRequest.patient?.user?.profile?.firstName?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-house-green">
                      {previewRequest.patient?.user?.profile?.lastName} {previewRequest.patient?.user?.profile?.firstName}
                    </h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={12} /> Gửi lúc {new Date(previewRequest.createdAt).toLocaleTimeString('vi-VN')}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setPreviewRequest(null)}
                  className="w-12 h-12 rounded-full bg-white text-gray-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 shadow-sm transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-8">
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Nội dung yêu cầu</h4>
                  <div className="bg-emerald-deep/5 border border-emerald-100/50 p-8 rounded-[32px] space-y-6">
                    {previewRequest.reason ? previewRequest.reason.split(/\n|(?=Triệu chứng:)|(?=Thời gian:)|(?=Thuốc đang dùng:)|(?=Chi tiết:)/).filter((l: string) => l.trim()).map((line: string, idx: number) => {
                      const cleanLine = line.trim().replace(/^\[.*?\]\s*/, ''); 
                      const parts = cleanLine.split(': ');
                      if (parts.length > 1) {
                        const label = parts[0];
                        const value = parts.slice(1).join(': ');
                        
                        return (
                          <div key={idx} className="space-y-2 pb-6 border-b border-emerald-900/5 last:border-none">
                            <span className="font-black text-house-green text-sm uppercase tracking-widest block">
                              {label === 'Thuốc đang dùng' ? (
                                <>
                                  THUỐC ĐANG<br />DÙNG:
                                </>
                              ) : `${label.toUpperCase()}:`}
                            </span>
                            <span className="text-gray-600 font-bold text-xl block leading-relaxed">{value}</span>
                          </div>
                        );
                      }
                      return <p key={idx} className="text-house-green font-bold text-lg leading-relaxed">{cleanLine}</p>;
                    }) : (
                      <p className="text-gray-400 italic">Bệnh nhân chưa cung cấp mô tả chi tiết.</p>
                    )}
                  </div>
                </div>

                {previewRequest.attachments && previewRequest.attachments.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Hình ảnh đính kèm ({previewRequest.attachments.length})</h4>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                      {Array.isArray(previewRequest.attachments) && previewRequest.attachments.map((img: any, i: number) => {
                        if (!img || img === 'undefined') return null;
                        const imgSrc = typeof img === 'string' ? img : (img.url || img.data);
                        const isValidBase64 = typeof imgSrc === 'string' && (imgSrc.startsWith('data:image/') || imgSrc.startsWith('http'));
                        
                        return (
                          <div 
                            key={i} 
                            className="aspect-square rounded-[24px] overflow-hidden border-2 border-gray-100 shadow-md bg-white cursor-zoom-in hover:scale-105 transition-all group relative"
                            onClick={() => isValidBase64 && window.open(imgSrc, '_blank')}
                          >
                            {isValidBase64 ? (
                              <img 
                                src={imgSrc} 
                                alt="Attachment" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/f8fafc/10b981?text=Lỗi+ảnh';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-red-400 p-4 text-center">
                                <X size={32} className="mb-2" />
                                <p className="text-[10px] font-black uppercase">Ảnh không hợp lệ</p>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-emerald-deep/0 group-hover:bg-emerald-deep/10 transition-colors" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-deep shadow-sm">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-house-green">Mức độ ưu tiên</p>
                    <p className={cn(
                      "text-xs font-black uppercase tracking-widest",
                      previewRequest.urgency === 'high' ? "text-red-500" : "text-emerald-deep"
                    )}>
                      {previewRequest.urgency === 'high' ? 'Khẩn cấp' : 'Bình thường'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex gap-4">
                <button 
                  onClick={() => setPreviewRequest(null)}
                  className="flex-1 py-5 bg-white text-gray-500 rounded-[24px] font-black text-lg border border-gray-100 hover:bg-gray-100 transition-all"
                >
                  ĐÓNG
                </button>
                <button 
                  onClick={() => setConfirmReject(previewRequest.id)}
                  className="px-8 py-5 bg-red-50 text-red-500 rounded-[24px] font-black text-lg border-2 border-red-100 hover:bg-red-500 hover:text-white transition-all active:scale-95"
                >
                  TỪ CHỐI
                </button>
                <button 
                  onClick={() => setConfirmAccept(previewRequest.id)}
                  className="flex-[2] py-5 bg-emerald-deep text-white rounded-[24px] font-black text-lg shadow-xl shadow-emerald-900/10 hover:bg-house-green transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <UserCheck size={24} />
                  TIẾP NHẬN NGAY
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
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
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 min-w-[22px] h-[22px] bg-red-500 rounded-full border-2 border-white flex items-center justify-center animate-bounce">
                  <span className="text-[10px] font-black text-white">{unreadCount}</span>
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
                                setPreviewRequest(a);
                                markAsViewed(a.id);
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Inbox */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ongoing Section */}
          {ongoing.length > 0 && (
            <section className="bg-emerald-deep/5 rounded-[32px] p-6 border border-emerald-100 shadow-xl shadow-emerald-900/5">
              <div className="flex items-center justify-between mb-4">
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

          <section className="bg-white rounded-[32px] p-6 border border-gray-50 shadow-xl shadow-gray-200/40 min-h-[300px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
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

            <div className="space-y-4 overflow-y-auto max-h-[40vh] pr-2">
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
                      onClick={() => {
                        setPreviewRequest(req);
                        markAsViewed(req.id);
                      }}
                      className={cn(
                        "p-6 rounded-[32px] border-2 flex items-center justify-between gap-6 transition-all cursor-pointer group",
                        req.urgency === 'high' ? "border-red-100 bg-red-50/30" : "border-gray-50 bg-gray-50/30 hover:border-emerald-100 hover:bg-white"
                      )}
                    >
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-16 h-16 rounded-[24px] flex items-center justify-center shadow-lg font-black text-2xl relative",
                          req.urgency === 'high' ? "bg-red-500 text-white" : "bg-white text-emerald-deep"
                        )}>
                          {!viewedRequests.includes(req.id) && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
                          )}
                          {req.urgency === 'high' ? <AlertCircle size={32} /> : patientName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-black text-house-green mb-1">{patientName}</h3>
                            {!viewedRequests.includes(req.id) && (
                              <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase animate-pulse">MỚI</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 font-medium line-clamp-1">{req.reason || 'Yêu cầu hỗ trợ chung'}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                          <Clock size={14} />
                          {getTimeAgo(req.createdAt)}
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewRequest(req);
                              markAsViewed(req.id);
                            }}
                            className="px-4 py-2 bg-gray-50 text-gray-500 border border-gray-100 rounded-xl text-xs font-black hover:bg-gray-100 transition-all"
                          >
                            XEM TRƯỚC
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmReject(req.id);
                            }}
                            className="px-4 py-2 bg-red-50 text-red-500 border border-red-100 rounded-xl text-xs font-black hover:bg-red-500 hover:text-white transition-all"
                          >
                            TỪ CHỐI
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmAccept(req.id);
                            }}
                            className="px-4 py-2 bg-emerald-deep text-white rounded-xl text-xs font-black hover:bg-house-green transition-all shadow-md shadow-emerald-900/5"
                          >
                            TIẾP NHẬN
                          </button>
                        </div>
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
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <section className="bg-house-green text-white rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
            <h3 className="text-xl font-black mb-4 relative z-10 uppercase tracking-widest">Thống kê trạm y tế</h3>
            <div className="space-y-3 relative z-10">
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
              <div 
                onClick={handleOpenRejected}
                className="flex items-center justify-between p-5 bg-red-500/20 hover:bg-red-500/40 rounded-3xl border border-red-500/30 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-500/30 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <XCircle size={24} />
                  </div>
                  <span className="font-bold text-red-100">Đã từ chối</span>
                </div>
                <span className="text-2xl font-black text-white">
                  {loading ? <Loader2 size={20} className="animate-spin" /> : stats.rejected}
                </span>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[32px] p-6 border border-gray-50 shadow-lg space-y-4">
          <h3 className="text-sm font-black text-house-green uppercase tracking-widest">Cán bộ cùng ca</h3>
          <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2">
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

      {/* Confirmation Modals */}
      <AnimatePresence>
        {confirmAccept && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-emerald-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[48px] p-10 max-w-md w-full shadow-2xl text-center space-y-8 border-4 border-emerald-100"
            >
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-deep">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-house-green">Tiếp nhận hỗ trợ?</h3>
                <p className="text-gray-500 font-medium">Bạn có chắc chắn muốn tiếp nhận ca này không? Bệnh nhân sẽ nhận được thông báo ngay.</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setConfirmAccept(null)}
                  className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-3xl font-black text-lg hover:bg-gray-100 transition-all"
                >
                  HỦY
                </button>
                <button 
                  onClick={() => handleAccept(confirmAccept)}
                  className="flex-[2] py-5 bg-emerald-deep text-white rounded-3xl font-black text-lg shadow-xl shadow-emerald-900/20 hover:bg-house-green transition-all active:scale-95"
                >
                  ĐỒNG Ý
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {confirmReject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-red-900/20 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[48px] p-10 max-w-md w-full shadow-2xl text-center space-y-8 border-4 border-red-100"
            >
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
                <AlertCircle size={48} />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-red-600">Từ chối hỗ trợ?</h3>
                <p className="text-gray-500 font-medium italic">Thao tác này sẽ gỡ yêu cầu khỏi danh sách chờ. Bạn có chắc chắn muốn từ chối không?</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setConfirmReject(null)}
                  className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-3xl font-black text-lg hover:bg-gray-100 transition-all"
                >
                  HỦY
                </button>
                <button 
                  onClick={() => handleReject(confirmReject)}
                  className="flex-[2] py-5 bg-red-500 text-white rounded-3xl font-black text-lg shadow-xl shadow-red-900/20 hover:bg-red-600 transition-all active:scale-95"
                >
                  TỪ CHỐI NGAY
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showRejectedModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[48px] w-full max-w-2xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-red-50/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center">
                    <XCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-red-600">Lịch sử từ chối</h3>
                    <p className="text-sm font-bold text-gray-400">Các yêu cầu đã bị hủy</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowRejectedModal(false)}
                  className="w-10 h-10 rounded-full bg-white text-gray-400 flex items-center justify-center hover:bg-gray-100 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
                {loadingRejected ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Loader2 size={40} className="animate-spin mb-4 text-red-300" />
                    <p className="font-bold">Đang tải lịch sử...</p>
                  </div>
                ) : rejectedRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <CheckCircle2 size={48} className="mb-4 opacity-20" />
                    <p className="font-bold">Chưa có yêu cầu nào bị từ chối.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rejectedRequests.map((req) => (
                      <div key={req.id} className="p-6 bg-white rounded-3xl border border-red-50 shadow-sm flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 text-gray-500 font-black text-xl rounded-2xl flex items-center justify-center">
                            {req.patient?.user?.profile?.firstName?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <h4 className="font-black text-house-green">
                              {req.patient?.user?.profile?.lastName} {req.patient?.user?.profile?.firstName}
                            </h4>
                            <p className="text-sm text-gray-500 line-clamp-1 mt-1">{req.reason}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="bg-red-50 text-red-500 text-[10px] font-black px-2 py-1 rounded-full uppercase">Đã từ chối</span>
                          <p className="text-[10px] text-gray-400 font-bold mt-2 flex items-center gap-1 justify-end">
                            <Clock size={10} /> {new Date(req.updatedAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LHWHome;
