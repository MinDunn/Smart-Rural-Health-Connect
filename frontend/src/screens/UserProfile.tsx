import React from 'react';
import { motion } from 'framer-motion';
import { Paperclip, Heart, PhoneCall, AlertCircle, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Profile } from '../types';
import { DOCTOR_PROFILE_IMG } from '../constants';

interface UserProfileProps {
  profile: Profile;
  setProfile: (p: Profile) => void;
}

const SuccessModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/20 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-gray-50 text-center"
      >
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-starbucks-green" />
        </div>
        <h3 className="text-2xl font-extrabold text-house-green mb-2">Thành công!</h3>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Thông tin của bạn đã được cập nhật an toàn trên hệ thống. Chúc bạn một ngày tràn đầy sức khỏe!
        </p>
        <button 
          onClick={onClose}
          className="w-full bg-starbucks-green text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-green-900/20 active:scale-95 transition-all"
        >
          XONG
        </button>
      </motion.div>
    </div>
  );
};

const UserProfileScreen = ({ profile, setProfile }: UserProfileProps) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const years = Array.from({ length: 2026 - 1940 }, (_, i) => (1940 + i).toString()).reverse();

  const handleSave = async () => {
    try {
      const savedUser = localStorage.getItem('srhc_user');
      if (!savedUser) return;
      const user = JSON.parse(savedUser);
      
      const { patientApi } = await import('../lib/api');
      
      const nameParts = profile.name.trim().split(' ');
      const firstName = nameParts.pop() || '';
      const lastName = nameParts.join(' ');

      await patientApi.updateProfile(user.id, {
        firstName,
        lastName,
        phone: profile.phone,
        address: profile.address,
        bloodType: profile.bloodType,
        medicalHistory: profile.conditions.join(', '),
        allergies: profile.allergies,
        emergencyContacts: profile.emergencyContacts,
      });
      
      setIsEditing(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Có lỗi xảy ra khi lưu thông tin.');
    }
  };

  const addContact = () => {
    setProfile({
      ...profile,
      emergencyContacts: [...profile.emergencyContacts, { name: '', relationship: 'Người thân', phone: '', address: '' }]
    });
  };

  const removeContact = (index: number) => {
    const newContacts = [...profile.emergencyContacts];
    newContacts.splice(index, 1);
    setProfile({ ...profile, emergencyContacts: newContacts });
  };

  const updateContact = (index: number, field: string, value: string) => {
    const newContacts = [...profile.emergencyContacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setProfile({ ...profile, emergencyContacts: newContacts });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-4xl mx-auto px-6 py-12 pb-32 space-y-12"
    >
      <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
      
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
              disabled={!isEditing}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
              className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 px-5 text-sm focus:ring-starbucks-green disabled:opacity-70"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Năm sinh</label>
            <select 
              value={profile.birthYear}
              disabled={!isEditing}
              onChange={(e) => setProfile({...profile, birthYear: e.target.value})}
              className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 px-5 text-sm focus:ring-starbucks-green disabled:opacity-70"
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
                  disabled={!isEditing}
                  onClick={() => setProfile({...profile, gender: g})}
                  className={cn(
                    "flex-1 py-3 rounded-2xl border text-xs font-bold transition-all",
                    profile.gender === g ? "bg-green-light border-starbucks-green text-starbucks-green shadow-sm" : "bg-white border-gray-100 text-gray-400",
                    !isEditing && "opacity-70 cursor-not-allowed"
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
              <input 
                type="tel" 
                value={profile.phone} 
                disabled={!isEditing}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 px-5 text-sm focus:ring-starbucks-green disabled:opacity-70" 
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Địa chỉ thường trú</label>
            <input 
              type="text" 
              placeholder="Số 123, đường ABC, xã XYZ..."
              value={profile.address} 
              disabled={!isEditing}
              onChange={(e) => setProfile({...profile, address: e.target.value})}
              className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 px-5 text-sm focus:ring-starbucks-green disabled:opacity-70" 
            />
          </div>
        </div>
      </section>

      {/* 5. Người liên hệ khẩn cấp */}
      <section className="bg-[#fff5f5] rounded-[40px] shadow-xl p-8 md:p-12 border border-red-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200">
              <Heart size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-red-600">Người liên hệ khẩn cấp ❤️</h2>
          </div>
          {isEditing && (
            <button 
              onClick={addContact}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-700 transition-all active:scale-95"
            >
              <Plus size={16} /> THÊM NGƯỜI THÂN
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8">
          {profile.emergencyContacts.length === 0 && !isEditing && (
            <div className="text-center py-8 bg-white/50 rounded-3xl border border-dashed border-red-200">
              <p className="text-gray-400 text-sm italic">Chưa có thông tin người liên hệ khẩn cấp</p>
            </div>
          )}
          
          {profile.emergencyContacts.map((contact, index) => (
            <div key={index} className="relative grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-white/50 rounded-[32px] border border-red-50">
              {isEditing && (
                <button 
                  onClick={() => removeContact(index)}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-red-100 text-red-500 rounded-full flex items-center justify-center shadow-md hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </button>
              )}
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Tên</label>
                    <input 
                      type="text" 
                      placeholder="Nguyễn Văn B" 
                      disabled={!isEditing}
                      value={contact.name}
                      onChange={(e) => updateContact(index, 'name', e.target.value)}
                      className="w-full bg-white border-gray-100 rounded-2xl py-3 px-5 text-sm disabled:opacity-70" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Quan hệ</label>
                    <select 
                      disabled={!isEditing}
                      value={contact.relationship}
                      onChange={(e) => updateContact(index, 'relationship', e.target.value)}
                      className="w-full bg-white border-gray-100 rounded-2xl py-3 px-5 text-sm disabled:opacity-70"
                    >
                      <option value="Con trai">Con trai</option>
                      <option value="Vợ / Chồng">Vợ / Chồng</option>
                      <option value="Con gái">Con gái</option>
                      <option value="Bố / Mẹ">Bố / Mẹ</option>
                      <option value="Anh / Em">Anh / Em</option>
                      <option value="Người thân khác">Người thân khác</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Số điện thoại</label>
                  <div className="flex gap-2">
                    <input 
                      type="tel" 
                      value={contact.phone} 
                      disabled={!isEditing}
                      onChange={(e) => updateContact(index, 'phone', e.target.value)}
                      className="flex-grow bg-white border-gray-100 rounded-2xl py-3 px-5 text-sm disabled:opacity-70" 
                    />
                    <a 
                      href={`tel:${contact.phone}`}
                      className="w-12 h-12 bg-starbucks-green text-white rounded-2xl flex items-center justify-center shadow-md active:scale-95 transition-all"
                    >
                      <PhoneCall size={20} />
                    </a>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Địa chỉ</label>
                  <input 
                    type="text" 
                    placeholder="Địa chỉ cư trú..." 
                    disabled={!isEditing}
                    value={contact.address}
                    onChange={(e) => updateContact(index, 'address', e.target.value)}
                    className="w-full bg-white border-gray-100 rounded-2xl py-3 px-5 text-sm disabled:opacity-70" 
                  />
                </div>
              </div>

              <div className="bg-white/80 p-6 rounded-3xl border border-red-50 flex flex-col justify-center">
                <p className="text-xs text-red-600 font-bold mb-4 flex items-center gap-2">
                  <AlertCircle size={14} /> Khi bấm nút SOS hệ thống sẽ gọi:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                    <CheckCircle2 size={16} className="text-red-500" /> Trạm y tế gần nhất
                  </li>
                  <li className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                    <CheckCircle2 size={16} className="text-red-500" /> {contact.phone || '...'} ({contact.name || 'Người thân'})
                  </li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Nút hành động cuối trang */}
      <div className="flex flex-col md:flex-row gap-4 pt-8">
        <button 
          className={cn(
            "flex-grow py-5 rounded-3xl font-extrabold text-lg shadow-xl transition-all active:scale-95",
            isEditing ? "bg-starbucks-green text-white shadow-green-900/20" : "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none"
          )}
          disabled={!isEditing}
          onClick={handleSave}
        >
          LƯU THÔNG TIN
        </button>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={cn(
              "px-8 py-5 border rounded-3xl font-bold text-sm transition-all",
              isEditing ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            )}
          >
            {isEditing ? 'HỦY BỎ' : 'CHỈNH SỬA'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfileScreen;
