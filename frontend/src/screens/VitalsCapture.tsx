import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Activity, 
  Heart, 
  Wind, 
  Droplets, 
  Thermometer, 
  Save, 
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Screen } from '../types';

interface VitalsCaptureProps {
  setScreen: (s: Screen) => void;
}

const VitalsCapture = ({ setScreen }: VitalsCaptureProps) => {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [vitals, setVitals] = useState({
    bp_sys: '',
    bp_dia: '',
    sugar: '',
    hr: '',
    spo2: '',
    temp: ''
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setVitals({
        bp_sys: '120',
        bp_dia: '80',
        sugar: '5.6',
        hr: '72',
        spo2: '98',
        temp: '36.5'
      });
      setIsSyncing(false);
    }, 2000);
  };

  const handleSave = () => {
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setScreen('worker-home');
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="max-w-4xl mx-auto px-6 py-10 pb-32"
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
          <h1 className="text-4xl font-black text-house-green tracking-tight">Đo chỉ số sinh tồn</h1>
          <p className="text-gray-500 font-medium italic mt-1">Cập nhật dữ liệu sức khỏe định kỳ cho bệnh nhân</p>
        </div>
      </div>

      <div className="space-y-10">
        {/* Step 1: Select Patient */}
        <section className="bg-white rounded-[40px] p-8 border border-gray-50 shadow-xl shadow-gray-200/40">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-emerald-deep text-white rounded-xl flex items-center justify-center font-black">1</div>
              <h2 className="text-xl font-black text-house-green uppercase tracking-tight">Chọn bệnh nhân</h2>
           </div>
           
           {!selectedPatient ? (
             <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-deep transition-colors" size={24} />
                <input 
                  type="text" 
                  placeholder="Nhập tên hoặc mã định danh bệnh nhân..."
                  className="w-full bg-gray-50 border-2 border-transparent rounded-[24px] py-6 px-16 text-lg focus:bg-white focus:border-emerald-deep transition-all shadow-inner outline-none"
                  onFocus={() => {}} // Could show dropdown
                  onChange={(e) => {
                    if (e.target.value.toLowerCase().includes('nguyễn văn a')) {
                       setSelectedPatient({ id: '1', name: 'Nguyễn Văn A', age: 72 });
                    }
                  }}
                />
             </div>
           ) : (
             <div className="p-6 bg-emerald-deep/5 rounded-[32px] border-2 border-emerald-deep flex items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center font-black text-emerald-deep text-2xl shadow-sm">A</div>
                   <div>
                      <p className="text-xl font-black text-house-green">{selectedPatient.name}</p>
                      <p className="text-sm text-gray-500 font-medium">{selectedPatient.id} • {selectedPatient.age} tuổi</p>
                   </div>
                </div>
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="px-6 py-3 bg-white text-gray-400 rounded-xl text-xs font-black border border-gray-100 hover:text-red-500 transition-all"
                >
                  THAY ĐỔI
                </button>
             </div>
           )}
        </section>

        {/* Step 2: Vitals Input */}
        <section className={cn(
          "bg-white rounded-[48px] p-10 border border-gray-50 shadow-xl shadow-gray-200/40 transition-opacity duration-500",
          !selectedPatient && "opacity-50 pointer-events-none"
        )}>
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-emerald-deep text-white rounded-xl flex items-center justify-center font-black">2</div>
               <h2 className="text-xl font-black text-house-green uppercase tracking-tight">Nhập chỉ số đo được</h2>
            </div>
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-3 px-6 py-3 bg-blue-50 text-blue-600 rounded-2xl text-xs font-black hover:bg-blue-600 hover:text-white transition-all shadow-sm"
            >
              <RefreshCw size={18} className={cn(isSyncing && "animate-spin")} />
              {isSyncing ? "ĐANG ĐỒNG BỘ..." : "ĐỒNG BỘ THIẾT BỊ IOT"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* BP */}
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <Heart className="text-red-500" size={20} />
                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Huyết áp (mmHg)</label>
                </div>
                <div className="flex items-center gap-3">
                   <input 
                     type="number" 
                     placeholder="Tâm thu"
                     value={vitals.bp_sys}
                     onChange={(e) => setVitals({...vitals, bp_sys: e.target.value})}
                     className="w-full bg-gray-50 border-2 border-transparent rounded-[20px] p-5 text-xl font-black text-house-green focus:bg-white focus:border-red-200 transition-all text-center outline-none"
                   />
                   <span className="text-2xl text-gray-200 font-light">/</span>
                   <input 
                     type="number" 
                     placeholder="Tâm trương"
                     value={vitals.bp_dia}
                     onChange={(e) => setVitals({...vitals, bp_dia: e.target.value})}
                     className="w-full bg-gray-50 border-2 border-transparent rounded-[20px] p-5 text-xl font-black text-house-green focus:bg-white focus:border-red-200 transition-all text-center outline-none"
                   />
                </div>
             </div>

             {/* Heart Rate */}
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <Activity className="text-emerald-deep" size={20} />
                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Nhịp tim (bpm)</label>
                </div>
                <input 
                   type="number" 
                   placeholder="00"
                   value={vitals.hr}
                   onChange={(e) => setVitals({...vitals, hr: e.target.value})}
                   className="w-full bg-gray-50 border-2 border-transparent rounded-[20px] p-5 text-xl font-black text-house-green focus:bg-white focus:border-emerald-200 transition-all text-center outline-none"
                />
             </div>

             {/* Blood Sugar */}
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <Droplets className="text-amber-500" size={20} />
                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Đường huyết (mmol/L)</label>
                </div>
                <input 
                   type="number" 
                   placeholder="0.0"
                   value={vitals.sugar}
                   onChange={(e) => setVitals({...vitals, sugar: e.target.value})}
                   className="w-full bg-gray-50 border-2 border-transparent rounded-[20px] p-5 text-xl font-black text-house-green focus:bg-white focus:border-amber-200 transition-all text-center outline-none"
                />
             </div>

             {/* SpO2 */}
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <Wind className="text-blue-500" size={20} />
                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Nồng độ Oxy (%)</label>
                </div>
                <input 
                   type="number" 
                   placeholder="00"
                   value={vitals.spo2}
                   onChange={(e) => setVitals({...vitals, spo2: e.target.value})}
                   className="w-full bg-gray-50 border-2 border-transparent rounded-[20px] p-5 text-xl font-black text-house-green focus:bg-white focus:border-blue-200 transition-all text-center outline-none"
                />
             </div>
          </div>

          <div className="mt-12 bg-emerald-deep/5 border-2 border-dashed border-emerald-100 p-8 rounded-[40px] flex items-center gap-6">
             <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-emerald-deep shadow-sm">
                <AlertTriangle size={32} />
             </div>
             <div>
                <h4 className="text-lg font-black text-house-green">Lưu ý khi đo</h4>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">Để bệnh nhân nghỉ ngơi 5 phút trước khi đo huyết áp. Đảm bảo tư thế ngồi thoải mái và không nói chuyện trong khi máy đang hoạt động.</p>
             </div>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={!vitals.bp_sys || isSuccess}
            className={cn(
              "w-full mt-12 py-6 rounded-[32px] font-black text-2xl shadow-2xl flex items-center justify-center gap-4 transition-all active:scale-95",
              isSuccess ? "bg-emerald-deep text-white" : "bg-starbucks-green text-white hover:bg-emerald-deep"
            )}
          >
            {isSuccess ? (
              <>
                <CheckCircle2 size={32} />
                ĐÃ LƯU THÀNH CÔNG
              </>
            ) : (
              <>
                <Save size={32} />
                LƯU VÀO HỒ SƠ
              </>
            )}
          </button>
        </section>
      </div>
    </motion.div>
  );
};

export default VitalsCapture;
