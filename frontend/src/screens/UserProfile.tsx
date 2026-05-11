import React from 'react';
import { motion } from 'framer-motion';
import { Paperclip, Heart, PhoneCall, AlertCircle, CheckCircle2, Plus, Trash2, Edit3, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { Profile } from '../types';
import { DOCTOR_PROFILE_IMG } from '../constants';

interface UserProfileProps {
  profile: Profile;
  setProfile: (p: Profile) => void;
  setHasUnsavedChanges: (val: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const SuccessModal = ({ isOpen, onClose, isOffline }: { isOpen: boolean, onClose: () => void, isOffline: boolean }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/20 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[48px] p-10 max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 text-center"
      >
        <div className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner",
          isOffline ? "bg-blue-50" : "bg-green-50"
        )}>
          {isOffline ? (
            <AlertCircle size={48} className="text-blue-500" />
          ) : (
            <CheckCircle2 size={48} className="text-starbucks-green" />
          )}
        </div>
        <h3 className="text-3xl font-black text-house-green mb-4">
          {isOffline ? 'Đã lưu tạm' : 'Thành công!'}
        </h3>
        <p className="text-gray-500 text-base mb-10 leading-relaxed">
          {isOffline 
            ? 'Hiện tại không có kết nối, thông tin đã được lưu tạm vào máy. Hệ thống sẽ tự động gửi lên trạm xá khi có mạng trở lại.' 
            : 'Thông tin của ông bà đã được cập nhật an toàn trên hệ thống trạm y tế. Chúc ông bà mạnh khỏe!'}
        </p>
        <button 
          onClick={onClose}
          className={cn(
            "w-full py-5 rounded-[24px] font-black text-xl shadow-xl active:scale-95 transition-all",
            isOffline ? "bg-blue-600 text-white shadow-blue-200" : "bg-starbucks-green text-white shadow-green-200"
          )}
        >
          {isOffline ? 'TÔI ĐÃ HIỂU' : 'XONG'}
        </button>
      </motion.div>
    </div>
  );
};

const UserProfileScreen = ({ profile, setProfile, setHasUnsavedChanges, showToast }: UserProfileProps) => {
  const [isEditingBasic, setIsEditingBasic] = React.useState(false);
  const [editingContactIndex, setEditingContactIndex] = React.useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [isOfflineSave, setIsOfflineSave] = React.useState(false);
  const [tempProfile, setTempProfile] = React.useState<Profile>(profile);
  const years = Array.from({ length: 2026 - 1940 }, (_, i) => (1940 + i).toString()).reverse();

  // Track unsaved changes
  React.useEffect(() => {
    setHasUnsavedChanges(isEditingBasic || editingContactIndex !== null);
  }, [isEditingBasic, editingContactIndex, setHasUnsavedChanges]);

  // Cảnh báo khi đóng trình duyệt
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEditingBasic || editingContactIndex !== null) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isEditingBasic, editingContactIndex]);

  // Cập nhật tempProfile khi profile thay đổi từ bên ngoài (ví dụ: khi mới load)
  React.useEffect(() => {
    if (!isEditingBasic && editingContactIndex === null) {
      setTempProfile(profile);
    }
  }, [profile, isEditingBasic, editingContactIndex]);

  const handleSave = async () => {
    const savedUserRaw = localStorage.getItem('srhc_user');
    if (!savedUserRaw) return;
    const user = JSON.parse(savedUserRaw);

    const nameParts = tempProfile.name.trim().split(' ');
    const firstName = nameParts.pop() || '';
    const lastName = nameParts.join(' ');

    const updatedData = {
      firstName,
      lastName,
      phone: tempProfile.phone,
      address: tempProfile.address,
      bloodType: tempProfile.bloodType,
      medicalHistory: tempProfile.conditions.join(', '),
      allergies: tempProfile.allergies,
      emergencyContacts: tempProfile.emergencyContacts,
    };

    try {
      const { patientApi } = await import('../lib/api');
      await patientApi.updateProfile(user.id, updatedData);
      
      // Update parent state and local storage
      setProfile(tempProfile);
      user.profile = { ...user.profile, ...updatedData };
      localStorage.setItem('srhc_user', JSON.stringify(user));
      
      setIsOfflineSave(false);
      setIsEditingBasic(false);
      setEditingContactIndex(null);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving profile:', error);
      
      // FALLBACK: Offline Save
      setProfile(tempProfile);
      user.profile = { ...user.profile, ...updatedData };
      localStorage.setItem('srhc_user', JSON.stringify(user));
      localStorage.setItem('srhc_profile_pending_sync', 'true');

      setIsOfflineSave(true);
      setIsEditingBasic(false);
      setEditingContactIndex(null);
      setShowSuccessModal(true);
    }
  };

  const addContact = () => {
    const newContacts = [...tempProfile.emergencyContacts, { name: '', relationship: 'Người thân', phone: '', address: '' }];
    setTempProfile({
      ...tempProfile,
      emergencyContacts: newContacts
    });
    setEditingContactIndex(newContacts.length - 1);
  };

  const removeContact = (index: number) => {
    const newContacts = [...tempProfile.emergencyContacts];
    newContacts.splice(index, 1);
    setTempProfile({ ...tempProfile, emergencyContacts: newContacts });
  };

  const updateContact = (index: number, field: string, value: string) => {
    const newContacts = [...tempProfile.emergencyContacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setTempProfile({ ...tempProfile, emergencyContacts: newContacts });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-4xl mx-auto px-6 py-12 pb-32 space-y-12"
    >
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => {
          setHasUnsavedChanges(false);
          setShowSuccessModal(false);
        }} 
        isOffline={isOfflineSave} 
      />
      
      {/* 1. Thông tin cơ bản */}
      <section className="bg-white rounded-[40px] shadow-xl p-8 md:p-12 border border-gray-50">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="relative group mb-4">
            <div className="w-28 h-28 rounded-full border-4 border-green-light overflow-hidden shadow-xl group-hover:opacity-80 transition-opacity">
              <img src={DOCTOR_PROFILE_IMG} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <button className="absolute bottom-4 right-0 bg-starbucks-green text-white p-2 rounded-full shadow-lg">
              <Paperclip size={14} />
            </button>
          </div>
          <h2 className="text-2xl font-extrabold text-house-green mb-6">Thông tin cơ bản</h2>
          
          <button 
            onClick={() => {
              if (isEditingBasic) {
                handleSave();
              } else {
                setIsEditingBasic(true);
              }
            }}
            className={cn(
              "p-4 px-10 rounded-[32px] border transition-all active:scale-95 hover:scale-105 hover:brightness-105 flex items-center gap-3 text-base font-bold shadow-xl transition-all duration-300",
              isEditingBasic 
                ? "bg-starbucks-green border-starbucks-green text-white shadow-green-900/20" 
                : "bg-white border-gray-100 text-starbucks-green hover:bg-green-50/50 hover:shadow-lg"
            )}
          >
            {isEditingBasic ? <CheckCircle2 size={22} /> : <Edit3 size={22} />}
            {isEditingBasic ? 'LƯU THÔNG TIN CÁ NHÂN' : 'CHỈNH SỬA THÔNG TIN'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Họ tên</label>
            <input 
              type="text" 
              value={tempProfile.name}
              disabled={!isEditingBasic}
              onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
              className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 px-5 text-sm focus:ring-starbucks-green disabled:opacity-70"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Năm sinh</label>
            <select 
              value={tempProfile.birthYear}
              disabled={!isEditingBasic}
              onChange={(e) => setTempProfile({...tempProfile, birthYear: e.target.value})}
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
                  disabled={!isEditingBasic}
                  onClick={() => setTempProfile({...tempProfile, gender: g})}
                  className={cn(
                    "flex-1 py-3 rounded-2xl border text-xs font-bold transition-all",
                    tempProfile.gender === g ? "bg-green-light border-starbucks-green text-starbucks-green shadow-sm" : "bg-white border-gray-100 text-gray-400",
                    !isEditingBasic && "opacity-70 cursor-not-allowed"
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
                value={tempProfile.phone} 
                disabled={!isEditingBasic}
                onChange={(e) => setTempProfile({...tempProfile, phone: e.target.value})}
                className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 px-5 text-sm focus:ring-starbucks-green disabled:opacity-70" 
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Địa chỉ thường trú</label>
            <input 
              type="text" 
              placeholder="Số 123, đường ABC, xã XYZ..."
              value={tempProfile.address} 
              disabled={!isEditingBasic}
              onChange={(e) => setTempProfile({...tempProfile, address: e.target.value})}
              className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 px-5 text-sm focus:ring-starbucks-green disabled:opacity-70" 
            />
          </div>
        </div>
      </section>

      <section className="bg-red-50/30 rounded-[40px] shadow-xl p-8 md:p-12 border border-red-50">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200">
              <Heart className="text-white" size={28} />
            </div>
            <h2 className="text-2xl font-extrabold text-house-green">Người liên hệ khẩn cấp ❤️</h2>
          </div>
          
          {tempProfile.emergencyContacts.length > 0 && (
            <button 
              onClick={addContact}
              className="p-3 px-6 bg-white border border-red-100 text-red-600 rounded-2xl text-sm font-black shadow-sm flex items-center gap-2 active:scale-95 hover:scale-105 hover:bg-red-50 transition-all"
            >
              <Plus size={18} /> THÊM NGƯỜI THÂN
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8">
          {tempProfile.emergencyContacts.length === 0 && editingContactIndex === null && (
            <div className="text-center py-12 bg-white/50 rounded-[32px] border-2 border-dashed border-red-100 flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                <Heart size={32} className="text-red-300" />
              </div>
              <p className="text-gray-400 text-sm font-medium italic">Ông bà chưa thêm người liên hệ khẩn cấp</p>
              <button 
                onClick={addContact}
                className="mt-2 bg-red-600 text-white px-8 py-3 rounded-2xl text-sm font-black shadow-lg shadow-red-200 active:scale-95 hover:scale-105 hover:brightness-110 transition-all"
              >
                THÊM NGƯỜI THÂN NGAY
              </button>
            </div>
          )}
          
          {tempProfile.emergencyContacts.map((contact, index) => {
            const isEditingThis = editingContactIndex === index;
            return (
              <div key={index} className={cn(
                "relative grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-white/50 rounded-[32px] border transition-all duration-300",
                isEditingThis ? "border-red-200 shadow-2xl shadow-red-100 scale-[1.02] z-20" : "border-red-50"
              )}>
                <div className="absolute -top-5 -right-2 flex items-center gap-4 z-30">
                  {isEditingThis && (
                    <button 
                      onClick={() => {
                        removeContact(index);
                        setEditingContactIndex(null);
                      }}
                      className="w-12 h-12 bg-white border border-red-100 text-red-500 rounded-2xl shadow-xl flex items-center justify-center hover:bg-red-50 hover:scale-110 transition-all active:scale-90"
                    >
                      <Trash2 size={22} />
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      if (isEditingThis) {
                        handleSave();
                      } else {
                        setEditingContactIndex(index);
                      }
                    }}
                    className={cn(
                      "shadow-2xl flex items-center justify-center transition-all active:scale-95 hover:scale-110 font-black text-sm gap-2",
                      isEditingThis 
                        ? "px-8 py-3 rounded-2xl bg-starbucks-green text-white shadow-green-200 hover:brightness-110" 
                        : "w-12 h-12 rounded-full bg-white border border-red-100 text-red-600 hover:bg-red-50 hover:brightness-105"
                    )}
                  >
                    {isEditingThis ? <CheckCircle2 size={20} /> : <Edit3 size={20} />}
                    {isEditingThis && "LƯU LẠI"}
                  </button>
                </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Tên</label>
                    <input 
                      type="text" 
                      placeholder="Nguyễn Văn B" 
                      disabled={!isEditingThis}
                      value={contact.name}
                      onChange={(e) => updateContact(index, 'name', e.target.value)}
                      className="w-full bg-white border-gray-100 rounded-2xl py-3 px-5 text-sm disabled:opacity-70 focus:ring-red-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Quan hệ</label>
                    <select 
                      disabled={!isEditingThis}
                      value={contact.relationship}
                      onChange={(e) => updateContact(index, 'relationship', e.target.value)}
                      className="w-full bg-white border-gray-100 rounded-2xl py-3 px-5 text-sm disabled:opacity-70 focus:ring-red-500"
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
                      disabled={!isEditingThis}
                      onChange={(e) => updateContact(index, 'phone', e.target.value)}
                      className="flex-grow bg-white border-gray-100 rounded-2xl py-3 px-5 text-sm disabled:opacity-70 focus:ring-red-500" 
                    />
                    {!isEditingThis && (
                      <a 
                        href={`tel:${contact.phone}`}
                        className="w-12 h-12 bg-starbucks-green text-white rounded-2xl flex items-center justify-center shadow-md active:scale-95 hover:scale-110 hover:brightness-110 transition-all"
                      >
                        <PhoneCall size={20} />
                      </a>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Địa chỉ</label>
                  <input 
                    type="text" 
                    placeholder="Địa chỉ cư trú..." 
                    disabled={!isEditingThis}
                    value={contact.address}
                    onChange={(e) => updateContact(index, 'address', e.target.value)}
                    className="w-full bg-white border-gray-100 rounded-2xl py-3 px-5 text-sm disabled:opacity-70 focus:ring-red-500" 
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
          );
        })}
      </div>
    </section>
  </motion.div>
);
};

export default UserProfileScreen;
