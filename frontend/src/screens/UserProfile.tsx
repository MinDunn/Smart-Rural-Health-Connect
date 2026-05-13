import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Paperclip, Heart, PhoneCall, AlertCircle, CheckCircle2, 
  Plus, Trash2, Edit3, Lock, Volume2, QrCode, 
  ChevronRight, ShieldCheck, MapPin, User as UserIcon,
  Calendar, Droplet, Activity, Camera
} from 'lucide-react';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[48px] p-10 max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 text-center space-y-8"
      >
        <div className={cn(
          "w-28 h-28 rounded-full flex items-center justify-center mx-auto shadow-inner relative",
          isOffline ? "bg-blue-50" : "bg-green-50"
        )}>
          <div className={cn("absolute inset-0 animate-ping rounded-full opacity-20", isOffline ? "bg-blue-400" : "bg-starbucks-green")} />
          {isOffline ? (
            <AlertCircle size={56} className="text-blue-500 relative z-10" />
          ) : (
            <CheckCircle2 size={56} className="text-starbucks-green relative z-10" />
          )}
        </div>
        <div className="space-y-3">
          <h3 className="text-3xl font-black text-house-green">
            {isOffline ? 'Đã lưu tạm' : 'Thành công!'}
          </h3>
          <p className="text-gray-500 text-base leading-relaxed">
            {isOffline 
              ? 'Hiện tại không có kết nối, thông tin đã được lưu tạm. Hệ thống sẽ tự động gửi lên trạm xá khi có mạng trở lại.' 
              : 'Thông tin của ông bà đã được cập nhật an toàn. Chúc ông bà luôn mạnh khỏe!'}
          </p>
        </div>
        <button 
          onClick={onClose}
          className={cn(
            "w-full py-5 rounded-[24px] font-black text-xl shadow-xl active:scale-95 transition-all",
            isOffline ? "bg-blue-600 text-white shadow-blue-100" : "bg-starbucks-green text-white shadow-green-100"
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
  const [showQrModal, setShowQrModal] = React.useState(false);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(() => {
    return localStorage.getItem('srhc_avatar_cuu_tro');
  });
  const [tempProfile, setTempProfile] = React.useState<Profile>(profile);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const years = Array.from({ length: 2026 - 1940 }, (_, i) => (1940 + i).toString()).reverse();

  // Track unsaved changes
  React.useEffect(() => {
    const isChanged = JSON.stringify(tempProfile) !== JSON.stringify(profile);
    setHasUnsavedChanges(isChanged || isEditingBasic || editingContactIndex !== null);
  }, [tempProfile, profile, isEditingBasic, editingContactIndex, setHasUnsavedChanges]);

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

  // Cập nhật tempProfile khi profile thay đổi từ bên ngoài
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
      gender: tempProfile.gender,
      birthYear: tempProfile.birthYear,
      bloodType: tempProfile.bloodType,
      medicalHistory: tempProfile.conditions.join(', '),
      allergies: tempProfile.allergies,
      emergencyContacts: tempProfile.emergencyContacts,
    };

    try {
      const { patientApi } = await import('../lib/api');
      await patientApi.updateProfile(user.id, updatedData);
      
      setProfile(tempProfile);
      user.profile = { ...user.profile, ...updatedData };
      localStorage.setItem('srhc_user', JSON.stringify(user));
      
      setIsOfflineSave(false);
      setIsEditingBasic(false);
      setEditingContactIndex(null);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving profile:', error);
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

  const getQrContent = () => {
    const age = new Date().getFullYear() - parseInt(profile.birthYear || '1950');
    const info = [
      '🆘 HỒ SƠ Y TẾ KHẨN CẤP 🆘',
      '',
      `👤 HỌ TÊN: ${profile.name.toUpperCase()}`,
      `🎂 TUỔI: ${age} tuổi`,
      `📞 LIÊN LẠC: ${profile.phone}`,
      `🏠 ĐỊA CHỈ: ${profile.address || 'Chưa cập nhật'}`,
      `🏥 BỆNH LÝ: ${profile.conditions.join(', ') || 'Không có'}`,
      `🚫 DỊ ỨNG: ${profile.allergies || 'Không có'}`,
      `🩸 NHÓM MÁU: ${profile.bloodType}`,
      '',
      '🚑 NGƯỜI THÂN (SOS):',
      ...profile.emergencyContacts.map((c, i) => `${i+1}️⃣ ${c.name}: ${c.phone}`),
      '',
      '--- Smart Rural Health Connect ---',
    ];
    return encodeURIComponent(info.join('\n'));
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${getQrContent()}&bgcolor=ffffff&color=1a3933&margin=20`;

  const addContact = () => {
    const newContacts = [...tempProfile.emergencyContacts, { name: '', relationship: 'Người thân', phone: '', address: '' }];
    setTempProfile({ ...tempProfile, emergencyContacts: newContacts });
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        setAvatarPreview(base64Image);
        
        // Lưu vào một ngăn riêng biệt để đảm bảo không bao giờ mất
        localStorage.setItem('srhc_avatar_cuu_tro', base64Image);
        
        showToast('Đã cập nhật ảnh đại diện mới thành công!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-warm pb-40">
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => {
          setHasUnsavedChanges(false);
          setShowSuccessModal(false);
        }} 
        isOffline={isOfflineSave} 
      />

      {/* 1. Premium Hero Header */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-starbucks-green to-house-green overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-green-300 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-end px-6 pb-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10">
            <div className="relative group">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarChange} 
              />
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-8 border-white/20 overflow-hidden shadow-2xl relative z-10 transition-transform group-hover:scale-105 duration-500 bg-white">
                <img 
                  src={avatarPreview || DOCTOR_PROFILE_IMG} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 bg-white text-starbucks-green p-3 rounded-2xl shadow-xl z-20 hover:bg-green-50 transition-all active:scale-90"
              >
                <Camera size={20} />
              </button>
            </div>
            
            <div className="text-center md:text-left space-y-2 mb-8">
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-md">
                {profile.name || 'Chào ông bà!'}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm font-bold flex items-center gap-2">
                  <ShieldCheck size={16} className="text-green-300" /> Bệnh nhân đã xác thực
                </span>
                <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm font-bold flex items-center gap-2">
                  <Droplet size={16} className="text-red-300" /> Nhóm máu: {profile.bloodType}
                </span>
              </div>
            </div>

            <div className="flex-grow flex justify-center md:justify-end">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowQrModal(true)}
                className="bg-white/10 backdrop-blur-xl p-4 rounded-3xl border border-white/20 shadow-2xl flex items-center gap-4 group cursor-pointer hover:bg-white/25 transition-all"
              >
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center p-2 shadow-inner">
                   <img src={qrUrl} alt="Medical QR" className="w-full h-full object-contain" />
                </div>
                <div className="hidden md:block pr-4">
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Mã QR Y tế</p>
                  <p className="text-sm font-bold text-white">Bấm để phóng to mã</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQrModal && (
          <div 
            onClick={() => setShowQrModal(false)}
            className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-black/70 backdrop-blur-xl cursor-pointer"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[56px] p-10 max-w-sm w-full shadow-2xl relative overflow-hidden text-center space-y-8 cursor-default"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-starbucks-green to-house-green" />
              
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-house-green">Mã QR Y tế</h3>
                <p className="text-gray-500 font-medium">Ông bà hãy đưa mã này cho bác sĩ quét ạ.</p>
              </div>

              <div className="bg-gray-50 p-8 rounded-[40px] border-2 border-gray-100 inline-block shadow-inner">
                <img src={qrUrl.replace('size=300x300', 'size=600x600')} alt="Medical QR Large" className="w-64 h-64 mx-auto" />
              </div>

              <button 
                onClick={() => setShowQrModal(false)}
                className="w-full py-5 bg-house-green text-white rounded-3xl font-black text-lg shadow-xl shadow-green-100 active:scale-95 transition-all"
              >
                ĐÓNG LẠI
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-6 -mt-4 relative z-20 space-y-8">
        {/* Main Content Areas */}
        <div className="space-y-8">
          {/* 2. Thông tin cơ bản */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "bg-white/80 backdrop-blur-2xl rounded-[48px] shadow-2xl border-4 p-8 md:p-12 space-y-10 transition-all duration-500",
              isEditingBasic ? "border-dashed border-starbucks-green shadow-green-100" : "border-white"
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-green-light rounded-2xl flex items-center justify-center text-starbucks-green shadow-inner">
                  <UserIcon size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-house-green">Thông tin cá nhân</h2>
                  <p className="text-sm text-gray-400 font-medium italic">Ông bà hãy kiểm tra kỹ các thông tin này nhé.</p>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  if (isEditingBasic) handleSave();
                  else setIsEditingBasic(true);
                }}
                className={cn(
                  "px-8 py-4 rounded-3xl font-black text-sm flex items-center gap-3 transition-all active:scale-95 shadow-xl",
                  isEditingBasic 
                    ? "bg-starbucks-green text-white shadow-green-100" 
                    : "bg-white border border-gray-100 text-starbucks-green hover:bg-green-50"
                )}
              >
                {isEditingBasic ? <CheckCircle2 size={20} /> : <Edit3 size={20} />}
                {isEditingBasic ? 'LƯU LẠI' : 'CHỈNH SỬA'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Field: Full Name */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    Họ và tên {isEditingBasic && <Edit3 size={10} className="text-starbucks-green" />}
                  </label>
                </div>
                <input 
                  type="text" 
                  value={tempProfile.name}
                  disabled={!isEditingBasic}
                  onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
                  className={cn(
                    "w-full rounded-2xl p-5 text-lg font-bold transition-all outline-none",
                    isEditingBasic 
                      ? "bg-white border-2 border-starbucks-green shadow-inner text-house-green" 
                      : "bg-gray-50/50 border-2 border-transparent text-gray-400"
                  )}
                />
              </div>

              {/* Field: Birth Year */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    Năm sinh {isEditingBasic && <Edit3 size={10} className="text-starbucks-green" />}
                  </label>
                </div>
                <select 
                  value={tempProfile.birthYear}
                  disabled={!isEditingBasic}
                  onChange={(e) => setTempProfile({...tempProfile, birthYear: e.target.value})}
                  className={cn(
                    "w-full rounded-2xl p-5 text-lg font-bold transition-all outline-none appearance-none",
                    isEditingBasic 
                      ? "bg-white border-2 border-starbucks-green shadow-inner text-house-green" 
                      : "bg-gray-50/50 border-2 border-transparent text-gray-400"
                  )}
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              {/* Field: Gender */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    Giới tính {isEditingBasic && <Edit3 size={10} className="text-starbucks-green" />}
                  </label>
                </div>
                <div className="flex gap-4">
                  {['Nam', 'Nữ', 'Khác'].map(g => (
                    <button 
                      key={g}
                      disabled={!isEditingBasic}
                      onClick={() => setTempProfile({...tempProfile, gender: g})}
                      className={cn(
                        "flex-1 py-4 rounded-2xl border-2 font-black text-sm transition-all shadow-sm",
                        tempProfile.gender === g 
                          ? (isEditingBasic ? "bg-starbucks-green border-starbucks-green text-white scale-105 shadow-green-100" : "bg-gray-100 border-gray-200 text-gray-500") 
                          : "bg-white border-gray-50 text-gray-300 hover:border-gray-200",
                        !isEditingBasic && "cursor-not-allowed"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field: Phone */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    Số điện thoại {isEditingBasic && <Edit3 size={10} className="text-starbucks-green" />}
                  </label>
                </div>
                <div className="relative">
                  <input 
                    type="tel" 
                    value={tempProfile.phone} 
                    disabled={!isEditingBasic}
                    onChange={(e) => setTempProfile({...tempProfile, phone: e.target.value})}
                    className={cn(
                      "w-full rounded-2xl p-5 text-lg font-bold transition-all outline-none",
                      isEditingBasic 
                        ? "bg-white border-2 border-starbucks-green shadow-inner text-house-green" 
                        : "bg-gray-50/50 border-2 border-transparent text-gray-400"
                    )}
                  />
                  {!isEditingBasic && (
                    <PhoneCall className="absolute right-5 top-1/2 -translate-y-1/2 text-starbucks-green/50" size={20} />
                  )}
                </div>
              </div>

              {/* Field: Blood Type */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    Nhóm máu {isEditingBasic && <Edit3 size={10} className="text-starbucks-green" />}
                  </label>
                </div>
                <select 
                  value={tempProfile.bloodType}
                  disabled={!isEditingBasic}
                  onChange={(e) => setTempProfile({...tempProfile, bloodType: e.target.value})}
                  className={cn(
                    "w-full rounded-2xl p-5 text-lg font-bold transition-all outline-none appearance-none",
                    isEditingBasic 
                      ? "bg-white border-2 border-starbucks-green shadow-inner text-red-600" 
                      : "bg-gray-50/50 border-2 border-transparent text-red-400/70"
                  )}
                >
                  {['A', 'B', 'AB', 'O', 'Không rõ'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Field: Allergies */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    Tiền sử dị ứng {isEditingBasic && <Edit3 size={10} className="text-starbucks-green" />}
                  </label>
                </div>
                <input 
                  type="text" 
                  value={tempProfile.allergies}
                  disabled={!isEditingBasic}
                  placeholder="Ví dụ: Dị ứng phấn hoa, tôm..."
                  onChange={(e) => setTempProfile({...tempProfile, allergies: e.target.value})}
                  className={cn(
                    "w-full rounded-2xl p-5 text-lg font-bold transition-all outline-none",
                    isEditingBasic 
                      ? "bg-white border-2 border-starbucks-green shadow-inner text-house-green" 
                      : "bg-gray-50/50 border-2 border-transparent text-gray-400"
                  )}
                />
              </div>

              {/* Field: Address */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    Địa chỉ liên hệ {isEditingBasic && <Edit3 size={10} className="text-starbucks-green" />}
                  </label>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-5 top-6 text-gray-300" size={20} />
                  <textarea 
                    placeholder="Số 123, đường ABC, xã XYZ..."
                    value={tempProfile.address} 
                    disabled={!isEditingBasic}
                    onChange={(e) => setTempProfile({...tempProfile, address: e.target.value})}
                    className={cn(
                      "w-full rounded-3xl p-5 pl-14 text-lg font-bold transition-all outline-none min-h-[100px] resize-none",
                      isEditingBasic 
                        ? "bg-white border-2 border-starbucks-green shadow-inner text-house-green" 
                        : "bg-gray-50/50 border-2 border-transparent text-gray-400"
                    )}
                  />
                </div>
              </div>
            </div>
          </motion.section>

          {/* 3. Người liên hệ khẩn cấp */}
          <section className="bg-red-50/30 rounded-[48px] shadow-xl p-8 md:p-12 border-2 border-red-50/50 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-200">
                  <Heart size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-house-green">Người liên hệ khẩn cấp ❤️</h2>
                  <p className="text-sm text-red-600 font-medium italic italic">Bác sĩ sẽ gọi cho những người này nếu có chuyện khẩn cấp.</p>
                </div>
              </div>
              
              <button 
                onClick={addContact}
                className="px-8 py-4 bg-white border-2 border-red-100 text-red-600 rounded-3xl text-sm font-black shadow-lg hover:bg-red-50 transition-all flex items-center gap-3 active:scale-95"
              >
                <Plus size={20} /> THÊM NGƯỜI THÂN
              </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {tempProfile.emergencyContacts.length === 0 && editingContactIndex === null && (
                <div className="text-center py-20 bg-white/50 rounded-[40px] border-4 border-dashed border-red-100 flex flex-col items-center gap-6">
                  <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center animate-bounce">
                    <Heart size={48} className="text-red-300" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-500">Ông bà chưa có người liên hệ nào</h3>
                    <p className="text-sm text-gray-400 max-w-xs mx-auto">Hãy thêm con cháu hoặc người thân để được hỗ trợ kịp thời ạ.</p>
                  </div>
                  <button 
                    onClick={addContact}
                    className="bg-red-600 text-white px-10 py-4 rounded-3xl text-lg font-black shadow-2xl shadow-red-200 active:scale-95 transition-all"
                  >
                    THÊM NGƯỜI THÂN NGAY
                  </button>
                </div>
              )}
              
              {tempProfile.emergencyContacts.map((contact, index) => {
                const isEditingThis = editingContactIndex === index;
                return (
                  <motion.div 
                    layout
                    key={index} 
                    className={cn(
                      "relative p-8 md:p-10 rounded-[40px] transition-all duration-500 border-4",
                      isEditingThis 
                        ? "bg-white border-dashed border-red-500 shadow-2xl shadow-red-100 scale-[1.02] z-30" 
                        : "bg-white border-transparent shadow-md"
                    )}
                  >
                    {/* Action Buttons */}
                    <div className="absolute top-6 right-6 flex gap-3 z-40">
                      {isEditingThis ? (
                        <button 
                          onClick={() => { removeContact(index); setEditingContactIndex(null); }}
                          className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg"
                        >
                          <Trash2 size={24} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => setEditingContactIndex(index)}
                          className="w-14 h-14 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
                        >
                          <Edit3 size={24} />
                        </button>
                      )}
                      {isEditingThis && (
                        <button 
                          onClick={handleSave}
                          className="px-8 h-14 bg-starbucks-green text-white rounded-2xl font-black shadow-xl shadow-green-100 flex items-center gap-2 hover:brightness-110 active:scale-95"
                        >
                          <CheckCircle2 size={24} /> LƯU
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 md:pt-14">
                      <div className="space-y-6">
                        <div className="space-y-2">
                           <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-1 ml-16">
                             Tên người thân {isEditingThis && <Edit3 size={10} className="text-red-500" />}
                           </p>
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 shrink-0">
                                 <UserIcon size={24} />
                              </div>
                              <div className="flex-grow">
                                 <div className={cn(
                                   "transition-all rounded-2xl p-4 border-2",
                                   isEditingThis ? "bg-white border-red-500 shadow-inner" : "bg-red-50/30 border-transparent"
                                 )}>
                                   <input 
                                     type="text" 
                                     placeholder="Ví dụ: Nguyễn Văn B" 
                                     disabled={!isEditingThis}
                                     value={contact.name}
                                     onChange={(e) => updateContact(index, 'name', e.target.value)}
                                     className={cn(
                                       "w-full bg-transparent border-none p-0 text-xl font-black outline-none focus:ring-0 placeholder:text-gray-200",
                                       isEditingThis ? "text-house-green" : "text-gray-400"
                                     )} 
                                   />
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-1 ml-16">
                             Mối quan hệ {isEditingThis && <Edit3 size={10} className="text-red-500" />}
                           </p>
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shrink-0">
                                 <Heart size={24} />
                              </div>
                              <div className="flex-grow">
                                 <div className={cn(
                                   "transition-all rounded-2xl p-4 border-2",
                                   isEditingThis ? "bg-white border-red-500 shadow-inner" : "bg-orange-50/30 border-transparent"
                                 )}>
                                   <select 
                                     disabled={!isEditingThis}
                                     value={contact.relationship}
                                     onChange={(e) => updateContact(index, 'relationship', e.target.value)}
                                     className={cn(
                                       "w-full bg-transparent border-none p-0 text-lg font-bold outline-none focus:ring-0 appearance-none",
                                       isEditingThis ? "text-gray-700" : "text-gray-400"
                                     )}
                                   >
                                     {['Con trai', 'Vợ / Chồng', 'Con gái', 'Bố / Mẹ', 'Anh / Em', 'Người thân khác'].map(r => (
                                       <option key={r} value={r}>{r}</option>
                                     ))}
                                   </select>
                                 </div>
                              </div>
                           </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                           <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest flex items-center gap-1 ml-16">
                             Số điện thoại {isEditingThis && <Edit3 size={10} className="text-red-500" />}
                           </p>
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                                 <PhoneCall size={24} />
                              </div>
                              <div className="flex-grow">
                                 <div className={cn(
                                   "transition-all rounded-2xl p-4 border-2 flex items-center gap-2",
                                   isEditingThis ? "bg-white border-red-500 shadow-inner" : "bg-blue-50/30 border-transparent"
                                 )}>
                                   <input 
                                     type="tel" 
                                     value={contact.phone} 
                                     disabled={!isEditingThis}
                                     onChange={(e) => updateContact(index, 'phone', e.target.value)}
                                     className={cn(
                                       "w-full bg-transparent border-none p-0 text-xl font-black outline-none focus:ring-0",
                                       isEditingThis ? "text-blue-900" : "text-gray-400"
                                     )} 
                                   />
                                   {!isEditingThis && contact.phone && (
                                     <a href={`tel:${contact.phone}`} className="w-8 h-8 bg-white text-starbucks-green rounded-xl flex items-center justify-center shadow-md active:scale-95">
                                       <ChevronRight size={16} />
                                     </a>
                                   )}
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-1 ml-16">
                             Địa chỉ cư trú {isEditingThis && <Edit3 size={10} className="text-red-500" />}
                           </p>
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 shrink-0">
                                 <MapPin size={24} />
                              </div>
                              <div className="flex-grow">
                                 <div className={cn(
                                   "transition-all rounded-2xl p-4 border-2",
                                   isEditingThis ? "bg-white border-red-500 shadow-inner" : "bg-gray-50/30 border-transparent"
                                 )}>
                                   <input 
                                     type="text" 
                                     placeholder="Địa chỉ của người thân..." 
                                     disabled={!isEditingThis}
                                     value={contact.address}
                                     onChange={(e) => updateContact(index, 'address', e.target.value)}
                                     className={cn(
                                       "w-full bg-transparent border-none p-0 text-lg font-bold outline-none focus:ring-0",
                                       isEditingThis ? "text-gray-600" : "text-gray-400"
                                     )} 
                                   />
                                 </div>
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* Floating SOS Button */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => alert('Đang kết nối cuộc gọi SOS đến Trạm Y tế và Người thân...')}
        className="fixed bottom-28 right-6 md:bottom-10 md:right-10 w-20 h-20 md:w-24 md:h-24 bg-red-600 text-white rounded-full shadow-[0_0_40px_rgba(220,38,38,0.5)] flex flex-col items-center justify-center z-50 group overflow-hidden active:bg-red-700"
      >
        <div className="absolute inset-0 bg-white/20 animate-ping rounded-full" />
        <PhoneCall size={32} className="relative z-10 animate-bounce" />
        <span className="text-xs font-black relative z-10 mt-1">SOS</span>
      </motion.button>
    </div>
  );
};

export default UserProfileScreen;
