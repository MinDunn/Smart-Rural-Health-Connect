import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartPulse, Activity, Heart, Brain, 
  History, CheckCircle2, User, UserCheck, 
  Info, TrendingUp, Calendar, Clock,
  ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Profile } from '../types';
import { clinicalApi, iotApi, patientApi } from '../lib/api';

interface StatusProps {
  profile: Profile;
  setProfile: (p: Profile) => void;
  bmi: string;
  bmiStatus: { label: string, color: string, bg: string };
  patientId: string | null;
  userId: string | null;
}

const StatusScreen = ({ profile, setProfile, bmi, bmiStatus, patientId, userId }: StatusProps) => {
  const [latestConsultation, setLatestConsultation] = useState<any>(null);
  const [metricsHistory, setMetricsHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllHistory, setShowAllHistory] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!patientId) return;
      setIsLoading(true);
      try {
        const [consRes, metricsRes] = await Promise.all([
          clinicalApi.getLatestConsultation ? clinicalApi.getLatestConsultation(patientId) : Promise.resolve({ data: null }),
          iotApi.getMetrics(patientId)
        ]);
        setLatestConsultation(consRes.data);
        setMetricsHistory(metricsRes.data);
      } catch (error) {
        console.error('Error fetching status data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [patientId]);

  const handleUpdateMetrics = async () => {
    if (!patientId) return;
    try {
      const metrics = [
        { type: 'blood_pressure', value: profile.bp, unit: 'mmHg' },
        { type: 'blood_sugar', value: profile.sugar, unit: 'mmol/L' },
        { type: 'heart_rate', value: profile.hr, unit: 'bpm' },
        { type: 'spo2', value: profile.spo2, unit: '%' }
      ];

      for (const m of metrics) {
        if (!m.value || m.value === '--' || m.value === '--/--') continue;
        const numericValue = typeof m.value === 'string' ? parseFloat(m.value.split('/')[0]) : m.value;
        if (isNaN(numericValue)) continue;

        await iotApi.saveMetric({
          patient: { id: patientId },
          type: m.type,
          value: numericValue,
          unit: m.unit,
          source: 'self',
          isVerified: false,
          isStable: true,
          status: 'stable'
        });
      }

      // Also update height/weight in HealthProfile
      if (userId) {
        await patientApi.addHealthProfile(userId, {
          height: profile.height,
          weight: profile.weight,
          bmi: parseFloat(bmi),
          source: 'self'
        });
      }

      alert('Đã cập nhật chỉ số sức khỏe của ông bà!');
      // Refresh
      const metricsRes = await iotApi.getMetrics(patientId);
      setMetricsHistory(metricsRes.data);
    } catch (error) {
      console.error('Error saving metrics:', error);
      alert('Có lỗi xảy ra khi cập nhật chỉ số.');
    }
  };

  const getMetricLabel = (type: string) => {
    switch (type) {
      case 'blood_pressure': return 'Huyết áp';
      case 'blood_sugar': return 'Đường huyết';
      case 'heart_rate': return 'Nhịp tim';
      case 'spo2': return 'SpO2';
      default: return type;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="max-w-7xl mx-auto px-6 md:px-12 py-12 pb-32 space-y-12"
    >
      {/* Banner Tình Trạng Dynamic */}
      <div className="bg-emerald-deep rounded-[40px] p-8 md:p-12 mb-12 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-white">
            <span className="bg-white/20 text-[10px] font-black px-4 py-1.5 rounded-full mb-6 inline-block tracking-widest uppercase backdrop-blur-md">
              KẾT LUẬN GẦN NHẤT
            </span>
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
              {latestConsultation ? (
                latestConsultation.followUpUrgency === 'emergency' ? "Cần hỗ trợ ngay" :
                latestConsultation.followUpUrgency === 'watch' ? "Cần theo dõi thêm" :
                "Tình trạng ổn định"
              ) : "Chào ông bà!"}
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-2xl font-medium italic">
              {latestConsultation 
                ? `"${latestConsultation.diagnosis}"` 
                : "Ông bà hãy cập nhật chỉ số thường xuyên để bác sĩ có thể theo dõi sức khỏe tốt nhất nhé."}
            </p>
            
            {latestConsultation && (
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/10 flex items-center gap-3">
                   <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Calendar size={20} />
                   </div>
                   <div>
                      <p className="text-[10px] text-white/50 uppercase font-black">Ngày khám</p>
                      <p className="text-lg font-bold">{new Date(latestConsultation.createdAt).toLocaleDateString('vi-VN')}</p>
                   </div>
                </div>
                <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/10 flex items-center gap-3">
                   <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Activity size={20} />
                   </div>
                   <div>
                      <p className="text-[10px] text-white/50 uppercase font-black">Mức độ</p>
                      <p className="text-lg font-bold uppercase">{latestConsultation.followUpUrgency || 'Ổn định'}</p>
                   </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="w-48 h-48 md:w-64 md:h-64 bg-white/5 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-inner">
             <HeartPulse size={100} className={cn(
               "text-white animate-pulse",
               latestConsultation?.followUpUrgency === 'emergency' ? "text-red-400" : "text-emerald-400"
             )} />
          </div>
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-starbucks-green/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3" />
      </div>

      {/* Chỉ số sức khỏe cơ bản */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
           <h2 className="text-3xl font-black text-house-green tracking-tight">Chỉ số sức khỏe</h2>
           <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
              <Clock size={14} />
              Cập nhật lúc: {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* BMI Card */}
          <div className="bg-white p-10 rounded-[48px] shadow-2xl flex flex-col items-center border border-gray-50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 text-gray-50 group-hover:text-emerald-50 transition-colors">
               <TrendingUp size={80} />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 relative z-10">CHỈ SỐ KHỐI CƠ THỂ (BMI)</span>
            <div className={cn("text-7xl font-black mb-4 relative z-10", bmiStatus.color)}>{bmi}</div>
            <div className={cn("px-6 py-2 rounded-full text-sm font-black uppercase tracking-tight relative z-10", bmiStatus.bg, bmiStatus.color)}>
              {bmiStatus.label}
            </div>
            
            <div className="grid grid-cols-2 gap-8 mt-12 w-full border-t border-gray-100 pt-8 relative z-10">
              <div className="text-center group/item">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 group-hover/item:text-starbucks-green transition-colors">Chiều cao</p>
                <div className="flex items-center justify-center gap-1">
                  <input 
                    type="number" 
                    value={profile.height} 
                    onChange={e => setProfile({...profile, height: parseInt(e.target.value)})} 
                    className="w-16 bg-transparent border-none p-0 text-center font-black text-2xl text-house-green focus:ring-0" 
                  />
                  <span className="text-sm font-bold text-gray-300">cm</span>
                </div>
              </div>
              <div className="text-center group/item">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 group-hover/item:text-starbucks-green transition-colors">Cân nặng</p>
                <div className="flex items-center justify-center gap-1">
                  <input 
                    type="number" 
                    value={profile.weight} 
                    onChange={e => setProfile({...profile, weight: parseInt(e.target.value)})} 
                    className="w-16 bg-transparent border-none p-0 text-center font-black text-2xl text-house-green focus:ring-0" 
                  />
                  <span className="text-sm font-bold text-gray-300">kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vitals Grid */}
          <div className="md:col-span-2 grid grid-cols-2 gap-6">
            {[
              { id: 'bp', label: 'Huyết áp', val: profile.bp, unit: 'mmHg', icon: HeartPulse, color: 'text-red-500', bg: 'bg-red-50' },
              { id: 'sugar', label: 'Đường huyết', val: profile.sugar, unit: 'mmol/L', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
              { id: 'hr', label: 'Nhịp tim', val: profile.hr, unit: 'bpm', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50' },
              { id: 'spo2', label: 'SpO2', val: profile.spo2, unit: '%', icon: Brain, color: 'text-orange-500', bg: 'bg-orange-50' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[40px] shadow-2xl flex flex-col justify-between border border-gray-50 group hover:border-emerald-100 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                      <stat.icon size={28} />
                    </div>
                    <span className="text-sm font-black text-house-green tracking-tight uppercase">{stat.label}</span>
                  </div>
                </div>
                <div className="mt-8">
                  <div className="flex items-baseline gap-2">
                    <input 
                      type="text" 
                      value={stat.val} 
                      onChange={(e) => setProfile({...profile, [stat.id]: e.target.value})}
                      className="w-32 bg-transparent border-none p-0 text-4xl font-black text-house-green focus:ring-0"
                    />
                    <span className="text-xs font-black text-gray-300 uppercase">{stat.unit}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                     <div className="px-3 py-1 bg-gray-50 rounded-full flex items-center gap-1.5 border border-gray-100">
                        <User size={10} className="text-gray-400" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Tự khai báo</span>
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lịch sử chỉnh sửa */}
      <section className="bg-white rounded-[48px] shadow-2xl p-10 border border-gray-50 overflow-hidden">
        <div className="flex items-center justify-between mb-10">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-starbucks-green">
                 <History size={28} />
              </div>
              <div>
                 <h2 className="text-2xl font-black text-house-green">Lịch sử đo lường</h2>
                 <p className="text-sm text-gray-400 font-medium">Theo dõi sự thay đổi của các chỉ số qua thời gian.</p>
              </div>
           </div>
           <button 
             onClick={() => setShowAllHistory(!showAllHistory)}
             className="text-starbucks-green font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity"
           >
              {showAllHistory ? 'Thu gọn' : 'Xem tất cả'}
              {showAllHistory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
           </button>
        </div>

        <div className="space-y-4">
           {metricsHistory.slice(0, showAllHistory ? undefined : 5).map((log, idx) => (
             <div key={idx} className="flex items-center justify-between p-6 rounded-3xl border border-gray-50 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-6">
                   <div className={cn(
                     "w-12 h-12 rounded-2xl flex items-center justify-center",
                     log.isVerified ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                   )}>
                      {log.isVerified ? <UserCheck size={24} /> : <User size={24} />}
                   </div>
                   <div>
                      <div className="flex items-center gap-3 mb-1">
                         <span className="font-black text-house-green">{getMetricLabel(log.type)}</span>
                         <span className={cn(
                           "px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight border",
                           log.isVerified ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"
                         )}>
                            {log.isVerified ? "Đã xác thực" : "Tự khai báo"}
                         </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                         <div className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(log.timestamp).toLocaleDateString('vi-VN')}</div>
                         <div className="flex items-center gap-1.5"><Clock size={14} /> {new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                   </div>
                </div>
                <div className="text-right">
                   <div className="text-2xl font-black text-house-green">{log.value} <span className="text-xs text-gray-300 font-bold uppercase">{log.unit}</span></div>
                   {log.source === 'worker' && <p className="text-[10px] font-bold text-starbucks-green mt-1">Ghi nhận bởi Trạm xá</p>}
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* Medical Info Section */}
      <section className="bg-emerald-deep rounded-[48px] shadow-2xl p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
           <div className="flex-1 space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <Info size={28} />
                 </div>
                 <h2 className="text-2xl font-black uppercase tracking-tight">Hồ sơ y tế</h2>
              </div>
              <p className="text-white/60 font-medium leading-relaxed max-w-lg">
                 Ông bà hãy chọn các bệnh nền hiện có để hệ thống AI và bác sĩ có thể đưa ra tư vấn chính xác nhất cho tình trạng của mình.
              </p>
           </div>
           
           <div className="flex-1 grid grid-cols-2 gap-3 w-full">
              {[
                'Cao huyết áp', 'Tiểu đường', 'Bệnh tim mạch', 'Hen / bệnh phổi', 'Đột quỵ', 'Bệnh thận'
              ].map(cond => (
                <label key={cond} className={cn(
                  "flex items-center gap-3 p-4 rounded-3xl border-2 transition-all cursor-pointer",
                  profile.conditions.includes(cond) 
                    ? "bg-white text-emerald-deep border-white shadow-xl scale-105" 
                    : "bg-white/5 text-white/60 border-white/10 hover:border-white/30"
                )}>
                  <input 
                    type="checkbox" 
                    checked={profile.conditions.includes(cond)}
                    onChange={(e) => {
                      const newConds = e.target.checked 
                        ? [...profile.conditions.filter((c: string) => c !== 'Không có'), cond]
                        : profile.conditions.filter((c: string) => c !== cond);
                      setProfile({...profile, conditions: newConds.length ? newConds : ['Không có']});
                    }}
                    className="hidden" 
                  />
                  {profile.conditions.includes(cond) ? <CheckCircle2 size={18} /> : <div className="w-4 h-4 rounded-full border-2 border-white/20" />}
                  <span className="text-sm font-black uppercase tracking-tight">{cond}</span>
                </label>
              ))}
           </div>
        </div>
      </section>

      <div className="flex flex-col items-center gap-6 pt-8">
        <button 
          className="px-16 py-6 bg-starbucks-green text-white rounded-[32px] font-black text-xl shadow-2xl shadow-green-900/30 active:scale-95 transition-all flex items-center gap-4 group"
          onClick={handleUpdateMetrics}
        >
          CẬP NHẬT CHỈ SỐ NGAY
          <Activity size={24} className="group-hover:rotate-12 transition-transform" />
        </button>
        <p className="text-xs font-bold text-gray-400 flex items-center gap-2">
           <AlertCircle size={14} />
           Chỉ số đo tại trạm xá sẽ được ưu tiên để đánh giá y tế
        </p>
      </div>
    </motion.div>
  );
};

export default StatusScreen;
