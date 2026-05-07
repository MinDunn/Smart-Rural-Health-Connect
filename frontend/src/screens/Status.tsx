import React from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, Activity, Heart, Brain } from 'lucide-react';
import { cn } from '../lib/utils';
import { Profile } from '../types';
import { DOCTOR_PROFILE_IMG } from '../constants';

interface StatusProps {
  profile: Profile;
  setProfile: (p: Profile) => void;
  bmi: string;
  bmiStatus: { label: string, color: string, bg: string };
}

const StatusScreen = ({ profile, setProfile, bmi, bmiStatus }: StatusProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    className="max-w-7xl mx-auto px-6 md:px-12 py-12 pb-32 space-y-12"
  >
    {/* Profile Banner */}
    <div className="bg-house-green rounded-[40px] p-8 md:p-12 mb-12 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden shadow-2xl">
      <div className="flex-1 text-white z-10">
        <span className="bg-white/20 text-[10px] font-bold px-3 py-1 rounded-full mb-4 inline-block tracking-widest uppercase">CẬP NHẬT MỚI NHẤT</span>
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Tình trạng ổn định</h2>
        <p className="text-white/70 leading-relaxed mb-8 max-w-lg">
          Xin chào {profile.name}, các chỉ số xét nghiệm gần nhất cho thấy sức khỏe của bạn đang tiến triển rất tốt.
        </p>
        <div className="flex gap-4">
          <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/10">
            <p className="text-[10px] text-white/50 uppercase font-bold mb-1">Huyết áp</p>
            <p className="text-2xl font-bold">{profile.bp}</p>
          </div>
          <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/10">
            <p className="text-[10px] text-white/50 uppercase font-bold mb-1">Đường huyết</p>
            <p className="text-2xl font-bold">{profile.sugar}</p>
          </div>
        </div>
      </div>
      <div className="w-64 h-64 md:w-80 md:h-80 shrink-0 relative z-10">
        <div className="w-full h-full rounded-full border-8 border-white/10 overflow-hidden shadow-2xl">
          <img src={DOCTOR_PROFILE_IMG} alt="Hồ sơ" className="w-full h-full object-cover" />
        </div>
      </div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-starbucks-green/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-light/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3" />
    </div>

    {/* Chỉ số sức khỏe cơ bản */}
    <section className="space-y-6">
      <h2 className="text-2xl font-extrabold text-house-green">Chỉ số sức khỏe cơ bản</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[40px] shadow-xl flex flex-col items-center border border-gray-50">
          <span className="text-[10px] font-bold text-gray-400 uppercase mb-4">BMI (Chỉ số khối cơ thể)</span>
          <div className={cn("text-5xl font-black mb-2", bmiStatus.color)}>{bmi}</div>
          <div className={cn("px-4 py-1 rounded-full text-xs font-bold", bmiStatus.bg, bmiStatus.color)}>
            {bmiStatus.label}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8 w-full border-t pt-6">
            <div className="text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Chiều cao</p>
              <div className="flex items-center justify-center gap-1">
                <input type="number" value={profile.height} onChange={e => setProfile({...profile, height: parseInt(e.target.value)})} className="w-16 bg-transparent border-none p-0 text-center font-bold" />
                <span className="text-xs">cm</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Cân nặng</p>
              <div className="flex items-center justify-center gap-1">
                <input type="number" value={profile.weight} onChange={e => setProfile({...profile, weight: parseInt(e.target.value)})} className="w-16 bg-transparent border-none p-0 text-center font-bold" />
                <span className="text-xs">kg</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          {[
            { id: 'bp', label: 'Huyết áp', val: profile.bp, unit: 'mmHg', icon: HeartPulse, color: 'text-red-500' },
            { id: 'sugar', label: 'Đường huyết', val: profile.sugar, unit: 'mmol/L', icon: Activity, color: 'text-blue-500' },
            { id: 'hr', label: 'Nhịp tim', val: profile.hr, unit: 'bpm', icon: Heart, color: 'text-pink-500' },
            { id: 'spo2', label: 'SpO2', val: profile.spo2, unit: '%', icon: Brain, color: 'text-orange-500' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[32px] shadow-xl flex flex-col justify-between border border-gray-50">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50", stat.color)}>
                  <stat.icon size={20} />
                </div>
                <span className="text-xs font-bold text-gray-400 tracking-tight">{stat.label}</span>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  <input 
                    type="text" 
                    value={stat.val} 
                    onChange={(e) => setProfile({...profile, [stat.id]: e.target.value})}
                    className="w-24 bg-transparent border-none p-0 text-2xl font-bold focus:ring-0"
                  />
                  <span className="text-[10px] font-bold text-gray-400">{stat.unit}</span>
                </div>
                <p className="text-[9px] text-gray-300 mt-1 uppercase font-bold tracking-widest">{profile.lastMeasured}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Thông tin y tế quan trọng */}
    <section className="bg-white rounded-[40px] shadow-xl p-8 md:p-12 border border-orange-50">
      <h2 className="text-2xl font-extrabold text-house-green mb-2">Thông tin y tế quan trọng</h2>
      <p className="text-xs text-orange-600 font-bold mb-8 italic">👉 Thông tin giúp hệ thống đánh giá nguy cơ chính xác hơn</p>
      
      <div className="space-y-8">
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-4">Bạn có bệnh nền không?</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              'Không có', 'Cao huyết áp', 'Tiểu đường', 'Bệnh tim mạch', 'Hen / bệnh phổi', 'Đột quỵ trước đây', 'Bệnh thận'
            ].map(cond => (
              <label key={cond} className={cn(
                "flex items-center gap-2 p-3 rounded-2xl border cursor-pointer transition-all",
                profile.conditions.includes(cond) ? "bg-green-light border-starbucks-green" : "bg-gray-50 border-gray-100"
              )}>
                <input 
                  type="checkbox" 
                  checked={profile.conditions.includes(cond)}
                  onChange={(e) => {
                    if (cond === 'Không có') {
                      setProfile({...profile, conditions: ['Không có']});
                    } else {
                      const newConds = e.target.checked 
                        ? [...profile.conditions.filter((c: string) => c !== 'Không có'), cond]
                        : profile.conditions.filter((c: string) => c !== cond);
                      setProfile({...profile, conditions: newConds.length ? newConds : ['Không có']});
                    }
                  }}
                  className="rounded text-starbucks-green" 
                />
                <span className="text-xs font-medium">{cond}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-3">Dị ứng thuốc?</label>
            <input 
                type="text" 
                value={profile.allergies}
                onChange={(e) => setProfile({...profile, allergies: e.target.value})}
                placeholder="Nhập tên thuốc (nếu có)"
                className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 px-5 text-sm"
              />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-3">Nhóm máu</label>
            <select 
              value={profile.bloodType}
              onChange={(e) => setProfile({...profile, bloodType: e.target.value})}
              className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 px-5 text-sm"
            >
              <option>O</option>
              <option>A</option>
              <option>B</option>
              <option>AB</option>
              <option>Không rõ</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <div className="flex justify-center pt-8">
      <button 
        className="px-12 py-5 bg-starbucks-green text-white rounded-[24px] font-extrabold text-lg shadow-xl shadow-green-900/20 active:scale-95 transition-all"
        onClick={() => alert('Đã cập nhật chỉ số sức khỏe!')}
      >
        CẬP NHẬT CHỈ SỐ HÔM NAY
      </button>
    </div>
  </motion.div>
);

export default StatusScreen;
