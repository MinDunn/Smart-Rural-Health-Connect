"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Activity, 
  Heart, 
  Wind, 
  Droplets, 
  Save, 
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  User,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { patientApi, iotApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function VitalsCapture() {
  const router = useRouter();
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [vitals, setVitals] = useState({
    bp_sys: '',
    bp_dia: '',
    sugar: '',
    hr: '',
    spo2: '',
    temp: '36.5'
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

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

  const handleSave = async () => {
    if (!selectedPatient) return;
    try {
      const metrics = [
        { type: 'blood_pressure', value: `${vitals.bp_sys}/${vitals.bp_dia}`, unit: 'mmHg' },
        { type: 'blood_sugar', value: parseFloat(vitals.sugar) || 0, unit: 'mmol/L' },
        { type: 'heart_rate', value: parseFloat(vitals.hr) || 0, unit: 'bpm' },
        { type: 'spo2', value: parseFloat(vitals.spo2) || 0, unit: '%' }
      ];

      for (const m of metrics) {
        if (!m.value) continue;
        await iotApi.saveMetric({
          patient: { id: selectedPatient.id },
          type: m.type,
          value: typeof m.value === 'string' ? parseFloat(m.value.split('/')[0]) : m.value,
          unit: m.unit,
          source: 'worker',
          isVerified: true,
          isStable: true,
          status: 'stable'
        });
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error saving vitals:', error);
      alert('Có lỗi xảy ra khi lưu chỉ số.');
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await patientApi.getAllPatients();
      const filtered = res.data.filter((p: any) => 
        `${p.user?.profile?.lastName} ${p.user?.profile?.firstName}`.toLowerCase().includes(query.toLowerCase()) ||
        p.id.includes(query)
      );
      setSearchResults(filtered);
    } catch (e) {
      console.error('Search error:', e);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="flex items-center gap-6">
        <button 
          onClick={() => router.back()}
          className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 hover:bg-gray-50 transition-all text-gray-400"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-house-green tracking-tight uppercase">Đo chỉ số sinh tồn</h1>
          <p className="text-gray-500 font-medium italic">Ghi nhận dữ liệu sức khỏe đã xác thực cho bệnh nhân</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Selection and Instructions */}
        <div className="space-y-8">
           <section className="bg-white rounded-[40px] p-8 border border-gray-50 shadow-xl shadow-gray-200/40">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-10 h-10 bg-emerald-deep text-white rounded-xl flex items-center justify-center font-black">1</div>
                 <h2 className="text-lg font-black text-house-green uppercase tracking-tight">Chọn bệnh nhân</h2>
              </div>
              
              {!selectedPatient ? (
                <div className="relative">
                   <div className="relative">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input 
                        type="text" 
                        value={searchQuery}
                        placeholder="Tên hoặc mã số..."
                        className="w-full bg-gray-50 border-2 border-transparent rounded-[24px] py-5 px-14 text-sm focus:bg-white focus:border-emerald-deep transition-all shadow-inner outline-none font-bold"
                        onChange={(e) => handleSearch(e.target.value)}
                      />
                   </div>
                   
                   {searchResults.length > 0 && (
                     <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                        {searchResults.map(p => (
                          <button 
                            key={p.id}
                            onClick={() => {
                              setSelectedPatient({
                                id: p.id,
                                name: `${p.user?.profile?.lastName} ${p.user?.profile?.firstName}`,
                                age: p.user?.profile?.dob ? new Date().getFullYear() - new Date(p.user.profile.dob).getFullYear() : '?'
                              });
                              setSearchResults([]);
                              setSearchQuery('');
                            }}
                            className="w-full p-4 hover:bg-emerald-50 text-left flex items-center gap-4 transition-colors"
                          >
                             <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-emerald-deep font-black uppercase tracking-tighter">
                                {p.user?.profile?.firstName?.charAt(0)}
                             </div>
                             <div>
                                <p className="text-sm font-black text-house-green">{p.user?.profile?.lastName} {p.user?.profile?.firstName}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">{p.id.slice(0,8)}...</p>
                             </div>
                          </button>
                        ))}
                     </div>
                   )}
                </div>
              ) : (
                <div className="p-6 bg-emerald-deep/5 rounded-[32px] border-2 border-emerald-deep flex flex-col gap-6">
                   <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center font-black text-emerald-deep text-xl shadow-sm border border-emerald-100">
                         {selectedPatient.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                         <p className="text-lg font-black text-house-green leading-tight">{selectedPatient.name}</p>
                         <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{selectedPatient.id.slice(0,12)}...</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setSelectedPatient(null)}
                     className="w-full py-3 bg-white text-gray-400 rounded-2xl text-[10px] font-black border border-gray-100 hover:text-red-500 hover:bg-red-50 transition-all uppercase tracking-widest"
                   >
                     Thay đổi bệnh nhân
                   </button>
                </div>
              )}
           </section>

           <section className="bg-house-green p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-6">
                    <AlertTriangle size={24} className="text-amber-400" />
                    <h3 className="text-lg font-black uppercase tracking-tight">Lưu ý chuyên môn</h3>
                 </div>
                 <ul className="space-y-4 text-sm text-white/70 font-medium italic leading-relaxed">
                    <li>• Bệnh nhân cần nghỉ ngơi 5-10 phút trước khi đo huyết áp.</li>
                    <li>• Đảm bảo băng quấn huyết áp vừa vặn với cánh tay.</li>
                    <li>• Đường huyết nên được đo lúc đói hoặc sau ăn 2 giờ để có kết quả chính xác nhất.</li>
                 </ul>
              </div>
              <div className="absolute bottom-0 right-0 p-6 text-white/5">
                 <History size={100} />
              </div>
           </section>
        </div>

        {/* Right Column: Vitals Form */}
        <div className="lg:col-span-2">
           <section className={cn(
             "bg-white rounded-[48px] p-10 border border-gray-50 shadow-xl shadow-gray-200/40 transition-all duration-500",
             !selectedPatient && "opacity-30 pointer-events-none grayscale blur-[2px]"
           )}>
             <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-emerald-deep text-white rounded-xl flex items-center justify-center font-black">2</div>
                   <h2 className="text-xl font-black text-house-green uppercase tracking-tight">Thông số đo lường</h2>
                </div>
                <button 
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="flex items-center gap-3 px-6 py-3 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all shadow-sm uppercase tracking-widest"
                >
                  <RefreshCw size={18} className={cn(isSyncing && "animate-spin")} />
                  {isSyncing ? "ĐANG ĐỒNG BỘ..." : "Đồng bộ từ thiết bị"}
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* BP */}
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <Heart className="text-red-500" size={20} />
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Huyết áp (mmHg)</label>
                   </div>
                   <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        placeholder="SYS"
                        value={vitals.bp_sys}
                        onChange={(e) => setVitals({...vitals, bp_sys: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-[24px] p-6 text-2xl font-black text-house-green focus:bg-white focus:border-red-200 transition-all text-center outline-none shadow-inner"
                      />
                      <span className="text-3xl text-gray-200 font-light">/</span>
                      <input 
                        type="number" 
                        placeholder="DIA"
                        value={vitals.bp_dia}
                        onChange={(e) => setVitals({...vitals, bp_dia: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-[24px] p-6 text-2xl font-black text-house-green focus:bg-white focus:border-red-200 transition-all text-center outline-none shadow-inner"
                      />
                   </div>
                </div>

                {/* Heart Rate */}
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <Activity className="text-emerald-deep" size={20} />
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nhịp tim (bpm)</label>
                   </div>
                   <input 
                      type="number" 
                      placeholder="--"
                      value={vitals.hr}
                      onChange={(e) => setVitals({...vitals, hr: e.target.value})}
                      className="w-full bg-gray-50 border-2 border-transparent rounded-[24px] p-6 text-2xl font-black text-house-green focus:bg-white focus:border-emerald-200 transition-all text-center outline-none shadow-inner"
                   />
                </div>

                {/* Blood Sugar */}
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <Droplets className="text-amber-500" size={20} />
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đường huyết (mmol/L)</label>
                   </div>
                   <input 
                      type="number" 
                      placeholder="0.0"
                      value={vitals.sugar}
                      onChange={(e) => setVitals({...vitals, sugar: e.target.value})}
                      className="w-full bg-gray-50 border-2 border-transparent rounded-[24px] p-6 text-2xl font-black text-house-green focus:bg-white focus:border-amber-200 transition-all text-center outline-none shadow-inner"
                   />
                </div>

                {/* SpO2 */}
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <Wind className="text-blue-500" size={20} />
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nồng độ Oxy (%)</label>
                   </div>
                   <input 
                      type="number" 
                      placeholder="--"
                      value={vitals.spo2}
                      onChange={(e) => setVitals({...vitals, spo2: e.target.value})}
                      className="w-full bg-gray-50 border-2 border-transparent rounded-[24px] p-6 text-2xl font-black text-house-green focus:bg-white focus:border-blue-200 transition-all text-center outline-none shadow-inner"
                   />
                </div>
             </div>

             <div className="mt-16 flex items-center gap-6">
                <button 
                   onClick={handleSave}
                   disabled={!vitals.bp_sys || isSuccess}
                   className={cn(
                     "flex-1 py-6 rounded-[32px] font-black text-xl shadow-2xl flex items-center justify-center gap-4 transition-all active:scale-95 uppercase tracking-widest",
                     isSuccess ? "bg-emerald-deep text-white" : "bg-starbucks-green text-white hover:bg-emerald-deep shadow-green-900/20"
                   )}
                >
                   {isSuccess ? (
                     <>
                       <CheckCircle2 size={28} />
                       Đã lưu thành công
                     </>
                   ) : (
                     <>
                       <Save size={28} />
                       Lưu vào hồ sơ
                     </>
                   )}
                </button>
             </div>
           </section>
        </div>
      </div>
    </div>
  );
}
