import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Briefcase, 
  ShieldCheck, 
  Camera, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  CreditCard,
  Building2,
  Award,
  Globe,
  Save,
  Edit2,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Screen } from '../types';
import { authApi } from '../lib/api';

interface WorkerProfileProps {
  setScreen: (s: Screen) => void;
  user: any;
}

const WorkerProfile = ({ setScreen, user }: WorkerProfileProps) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'professional'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Local state for editable fields
  const [profileData, setProfileData] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    dob: user?.profile?.dob ? new Date(user.profile.dob).toLocaleDateString('vi-VN') : '',
    gender: user?.profile?.gender || '',
    idCard: user?.profile?.idCard || '',
    phone: user?.profile?.phone || '',
    email: user?.email || '',
    address: user?.profile?.address || '',
    
    // Professional
    workplace: 'Trạm y tế xã Yên Bình',
    district: 'Trung tâm y tế huyện Yên Lạc',
    role: 'Cán bộ y tế cơ sở',
    scope: 'Thôn Đông, Thôn Đoài',
    experience: '8 năm'
  });

  // Load fresh data from backend
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      try {
        const res = await authApi.getUserById(user.id);
        const u = res.data;
        if (u?.profile) {
          setProfileData(prev => ({
            ...prev,
            firstName: u.profile.firstName || prev.firstName,
            lastName: u.profile.lastName || prev.lastName,
            dob: u.profile.dob ? new Date(u.profile.dob).toLocaleDateString('vi-VN') : prev.dob,
            gender: u.profile.gender || prev.gender,
            idCard: u.profile.idCard || prev.idCard,
            phone: u.profile.phone || prev.phone,
            email: u.email || prev.email,
            address: u.profile.address || prev.address,
          }));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    loadProfile();
  }, [user?.id]);

  const fullName = `${profileData.lastName} ${profileData.firstName}`.trim();

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await authApi.updateUserProfile(user.id, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        address: profileData.address,
        gender: profileData.gender,
        idCard: profileData.idCard,
      });

      // Update localStorage so navbar and other screens see the change
      const savedUser = localStorage.getItem('srhc_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        parsed.profile = {
          ...parsed.profile,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          address: profileData.address,
          gender: profileData.gender,
          idCard: profileData.idCard,
        };
        localStorage.setItem('srhc_user', JSON.stringify(parsed));
      }

      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Không thể lưu thay đổi. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="max-w-4xl mx-auto px-6 py-10 pb-32"
    >
      {/* Save success toast */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-emerald-deep text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
          >
            <CheckCircle2 size={20} />
            Đã lưu thay đổi thành công!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setScreen('worker-home')}
            className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 hover:bg-gray-50 transition-all text-gray-400"
          >
            <ArrowLeft size={28} />
          </button>
          <div>
            <h1 className="text-4xl font-black text-house-green tracking-tight">Hồ sơ Cán bộ</h1>
            <p className="text-gray-500 font-medium">Thông tin xác thực và nghiệp vụ</p>
          </div>
        </div>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-deep border-2 border-emerald-deep/10 rounded-2xl font-black hover:bg-emerald-deep hover:text-white transition-all shadow-sm"
          >
            <Edit2 size={18} />
            CHỈNH SỬA
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsEditing(false)}
              className="px-5 py-3 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-all"
            >
              HỦY
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-starbucks-green text-white rounded-2xl font-black hover:bg-house-green transition-all shadow-lg shadow-green-900/20 disabled:opacity-60"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
            </button>
          </div>
        )}
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-[48px] border border-gray-50 shadow-2xl shadow-gray-200/40 overflow-hidden mb-10">
        {/* Banner & Portrait */}
        <div className="h-32 bg-gradient-to-r from-emerald-deep to-house-green relative">
           <div className="absolute -bottom-16 left-10">
              <div className="relative group">
                <div className="w-32 h-32 bg-gray-100 rounded-[40px] border-4 border-white shadow-xl overflow-hidden">
                   <img 
                     src={`https://ui-avatars.com/api/?name=${fullName}&background=random&size=200`} 
                     alt="Avatar" 
                     className="w-full h-full object-cover"
                   />
                </div>
                {isEditing && (
                  <button className="absolute inset-0 bg-black/40 text-white flex items-center justify-center rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={24} />
                  </button>
                )}
              </div>
           </div>
        </div>

        <div className="pt-20 px-10 pb-10">
           <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div>
                 <h2 className="text-3xl font-black text-house-green mb-2">{fullName || 'Chưa có tên'}</h2>
                 <div className="flex items-center gap-4 text-sm font-bold text-gray-400 uppercase tracking-widest">
                    <span className="flex items-center gap-2 text-emerald-deep">
                       <ShieldCheck size={16} /> XÁC THỰC
                    </span>
                    <span>•</span>
                    <span>{profileData.role}</span>
                 </div>
              </div>
           </div>

           {/* Tabs */}
           <div className="flex items-center gap-10 mt-12 border-b border-gray-50">
              <button 
                onClick={() => setActiveTab('personal')}
                className={cn(
                  "pb-4 text-sm font-black uppercase tracking-widest transition-all relative",
                  activeTab === 'personal' ? "text-emerald-deep" : "text-gray-400 hover:text-gray-600"
                )}
              >
                Thông tin cá nhân
                {activeTab === 'personal' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-deep rounded-full" />}
              </button>
              <button 
                onClick={() => setActiveTab('professional')}
                className={cn(
                  "pb-4 text-sm font-black uppercase tracking-widest transition-all relative",
                  activeTab === 'professional' ? "text-emerald-deep" : "text-gray-400 hover:text-gray-600"
                )}
              >
                Thông tin nghiệp vụ
                {activeTab === 'professional' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-deep rounded-full" />}
              </button>
           </div>

           {/* Content */}
           <div className="mt-10">
              <AnimatePresence mode="wait">
                {activeTab === 'personal' ? (
                  <motion.div 
                    key="personal"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8"
                  >
                    <InfoField icon={User} label="Họ" value={profileData.lastName} isEditing={isEditing} onChange={(v) => updateField('lastName', v)} />
                    <InfoField icon={User} label="Tên" value={profileData.firstName} isEditing={isEditing} onChange={(v) => updateField('firstName', v)} />
                    <InfoField icon={Calendar} label="Ngày sinh" value={profileData.dob} isEditing={isEditing} onChange={(v) => updateField('dob', v)} />
                    <InfoField 
                      icon={Globe} 
                      label="Giới tính" 
                      value={profileData.gender} 
                      isEditing={isEditing} 
                      onChange={(v) => updateField('gender', v)} 
                      type="select"
                      options={['Nam', 'Nữ', 'Khác']}
                    />
                    <InfoField icon={CreditCard} label="Số CCCD/CMND" value={profileData.idCard} isEditing={isEditing} onChange={(v) => updateField('idCard', v)} />
                    <InfoField icon={Phone} label="Số điện thoại" value={profileData.phone} isEditing={isEditing} onChange={(v) => updateField('phone', v)} />
                    <InfoField icon={Mail} label="Email công việc" value={profileData.email} isEditing={false} />
                    <div className="md:col-span-2">
                      <InfoField icon={MapPin} label="Địa chỉ thường trú" value={profileData.address} isEditing={isEditing} onChange={(v) => updateField('address', v)} />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="professional"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-10"
                  >
                    <section className="bg-gray-50/50 p-8 rounded-[32px] border border-gray-100">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Building2 size={14} className="text-emerald-deep" /> Nơi công tác
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InfoField label="Trạm y tế" value={profileData.workplace} isEditing={false} />
                        <InfoField label="Trung tâm y tế" value={profileData.district} isEditing={false} />
                      </div>
                    </section>

                    <section className="bg-gray-50/50 p-8 rounded-[32px] border border-gray-100">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Briefcase size={14} className="text-emerald-deep" /> Vai trò & Phạm vi
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InfoField label="Vai trò hệ thống" value={profileData.role} isEditing={false} />
                        <InfoField 
                          label="Thôn/ấp phụ trách" 
                          value={profileData.scope} 
                          isEditing={isEditing} 
                          onChange={(val) => updateField('scope', val)} 
                        />
                      </div>
                    </section>

                    <section className="bg-gray-50/50 p-8 rounded-[32px] border border-gray-100">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Award size={14} className="text-emerald-deep" /> Kinh nghiệm
                      </h3>
                      <InfoField 
                        label="Số năm kinh nghiệm" 
                        value={profileData.experience} 
                        isEditing={isEditing} 
                        onChange={(val) => updateField('experience', val)} 
                      />
                    </section>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>
      </div>

      <div className="bg-amber-50 border-2 border-dashed border-amber-200 p-8 rounded-[40px] flex items-center gap-6">
        <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-amber-500 shadow-sm">
          <ShieldCheck size={32} />
        </div>
        <div>
          <h4 className="text-lg font-black text-amber-900">Cam kết trách nhiệm</h4>
          <p className="text-sm text-amber-700 leading-relaxed font-medium">
            Mọi thông tin trên đây đều được xác thực và dùng để chịu trách nhiệm pháp lý trong các hoạt động chuyên môn y tế.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

interface InfoFieldProps {
  icon?: any;
  label: string;
  value: string;
  isEditing: boolean;
  onChange?: (val: string) => void;
  type?: 'text' | 'select';
  options?: string[];
}

const InfoField = ({ icon: Icon, label, value, isEditing, onChange, type = 'text', options }: InfoFieldProps) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
      {Icon && <Icon size={14} className="text-emerald-deep" />}
      {label}
    </div>
    {isEditing && onChange ? (
      type === 'select' && options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white border-2 border-emerald-deep/20 rounded-2xl py-3 px-4 font-bold text-house-green outline-none focus:border-emerald-deep transition-all appearance-none cursor-pointer"
        >
          <option value="">-- Chọn --</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input 
          type="text" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white border-2 border-emerald-deep/20 rounded-2xl py-3 px-4 font-bold text-house-green outline-none focus:border-emerald-deep transition-all"
        />
      )
    ) : (
      <p className="text-lg font-black text-house-green">{value || <span className="text-gray-300 italic font-medium">Chưa cập nhật</span>}</p>
    )}
  </div>
);

export default WorkerProfile;
