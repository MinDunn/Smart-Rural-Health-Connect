import React from 'react';
import { motion } from 'framer-motion';
import { Paperclip, Heart, PhoneCall, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { Profile } from '../types';
import { DOCTOR_PROFILE_IMG } from '../constants';

interface UserProfileProps {
  profile: Profile;
  setProfile: (p: Profile) => void;
}

const UserProfileScreen = ({ profile, setProfile }: UserProfileProps) => {
  const years = Array.from({ length: 2026 - 1940 }, (_, i) => (1940 + i).toString()).reverse();

  const handleSave = async () => {
    try {
      const savedUser = localStorage.getItem('srhc_user');
      if (!savedUser) return;
      const user = JSON.parse(savedUser);
      
      const { patientApi } = await import('../lib/api');
      await patientApi.updateProfile(user.id, {
        bloodType: profile.bloodType,
        medicalHistory: profile.conditions.join(', '),
        allergies: profile.allergies,
      });
      alert('Đã lưu thông tin y tế thành công!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Có lỗi xảy ra khi lưu thông tin.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-4xl mx-auto px-6 py-12 pb-32 space-y-12"
    >
      {/* 1. Thông tin cơ bản */}
      <section className="bg-white rounded-[40px] shadow-xl p-8 md:p-12 border border-gray-50">
        <div className="flex flex-col items-center mb-10">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full border-4 border-green-light overflow-hidden shadow-xl mb-4 group-hover:opacity-80 transition-opacity">
              <img src={DOCTOR_PROFILE_IMG} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <button className="absolute bottom-4 right-0 bg-starbucks-green text-white p-2 rounded-full shadow-lg">
              <Paperclip size={14} />
            </button>
          </div>
          <h2 className="text-2xl font-extrabold text-house-green">Thông tin cơ bản</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Họ tên</label>
            <input 
              type="text" 
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
              className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 px-5 text-sm focus:ring-starbucks-green"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Năm sinh</label>
            <select 
              value={profile.birthYear}
              onChange={(e) => setProfile({...profile, birthYear: e.target.value})}
              className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 px-5 text-sm focus:ring-starbucks-green"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Giới tính</label>
            <div className="flex gap-2">
              {['Nam', 'Nữ', 'Khác'].map(g => (
                <button 
                  key={g}
                  onClick={() => setProfile({...profile, gender: g})}
                  className={cn(
                    "flex-1 py-3 rounded-2xl border text-xs font-bold transition-all",
                    profile.gender === g ? "bg-green-light border-starbucks-green text-starbucks-green shadow-sm" : "bg-white border-gray-100 text-gray-400"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Số điện thoại</label>
              <input type="tel" value={profile.phone} className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 px-5 text-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Người liên hệ khẩn cấp */}
      <section className="bg-[#fff5f5] rounded-[40px] shadow-xl p-8 md:p-12 border border-red-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200">
            <Heart size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-red-600">Người liên hệ khẩn cấp ❤️</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Tên</label>
                <input type="text" placeholder="Nguyễn Văn B" className="w-full bg-white border-gray-100 rounded-2xl py-3 px-5 text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Quan hệ</label>
                <select className="w-full bg-white border-gray-100 rounded-2xl py-3 px-5 text-sm">
                  <option>Con trai</option>
                  <option>Vợ / Chồng</option>
                  <option>Con gái</option>
                  <option>Người thân khác</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Số điện thoại</label>
              <div className="flex gap-2">
                <input type="tel" value={profile.relativePhone} className="flex-grow bg-white border-gray-100 rounded-2xl py-3 px-5 text-sm" />
                <button className="w-12 h-12 bg-starbucks-green text-white rounded-2xl flex items-center justify-center shadow-md">
                  <PhoneCall size={20} />
                </button>
              </div>
            </div>
          </div>
          <div className="bg-white/50 p-6 rounded-3xl border border-red-50">
            <p className="text-xs text-red-600 font-bold mb-4 flex items-center gap-2">
              <AlertCircle size={14} /> Khi bấm nút SOS hệ thống sẽ gọi:
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                <CheckCircle2 size={16} className="text-red-500" /> Trạm y tế gần nhất
              </li>
              <li className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                <CheckCircle2 size={16} className="text-red-500" /> {profile.relativePhone} (Người thân)
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. Nút hành động cuối trang */}
      <div className="flex flex-col md:flex-row gap-4 pt-8">
        <button 
          className="flex-grow bg-starbucks-green text-white py-5 rounded-3xl font-extrabold text-lg shadow-xl shadow-green-900/20 active:scale-95 transition-all"
          onClick={handleSave}
        >
          LƯU THÔNG TIN
        </button>
        <div className="flex gap-4">
          <button className="px-8 py-5 bg-white border border-gray-200 rounded-3xl font-bold text-sm hover:bg-gray-50 transition-all">
            CHỈNH SỬA
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfileScreen;
