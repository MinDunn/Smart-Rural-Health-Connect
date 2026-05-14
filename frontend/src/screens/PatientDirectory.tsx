import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  UserPlus, 
  Filter, 
  MoreVertical, 
  Phone, 
  MapPin, 
  Calendar,
  Activity,
  Heart,
  ChevronRight,
  Stethoscope,
  RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Screen } from '../types';
import { patientApi } from '../lib/api';

interface PatientDirectoryProps {
  setScreen: (s: Screen) => void;
}

const PatientDirectory = ({ setScreen }: PatientDirectoryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await patientApi.getAllPatients();
      setPatients(res.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const calculateAge = (dob: string) => {
    if (!dob) return '--';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const filteredPatients = patients.filter(p => {
    const profile = p.user?.profile;
    const name = `${profile?.lastName} ${profile?.firstName}`.toLowerCase();
    const phone = (profile?.phone || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return name.includes(term) || phone.includes(term);
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-green-100 text-green-700 border-green-200';
      case 'warning': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="max-w-7xl mx-auto px-6 md:px-12 py-10 pb-32"
    >
      {/* Header */}
      <div className="flex items-center gap-6 mb-12">
        <button 
          onClick={() => setScreen('worker-home')}
          className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 hover:bg-gray-50 transition-all text-gray-400 hover:text-house-green"
        >
          <ArrowLeft size={28} />
        </button>
        <div>
          <h1 className="text-4xl font-black text-house-green tracking-tight">Danh bạ bệnh nhân</h1>
          <p className="text-gray-500 font-medium">Quản lý hồ sơ sức khỏe cộng đồng</p>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
          <input 
            type="text" 
            placeholder="Tìm theo tên, số điện thoại hoặc mã bệnh nhân..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-2 border-gray-50 rounded-[32px] py-6 px-16 text-lg focus:ring-4 focus:ring-starbucks-green/5 focus:border-starbucks-green transition-all shadow-sm outline-none"
          />
        </div>
        <div className="flex gap-4">
          <button className="px-8 py-4 bg-white border-2 border-gray-50 rounded-[24px] font-black text-gray-500 hover:border-starbucks-green hover:text-starbucks-green transition-all flex items-center gap-3 shadow-sm">
            <Filter size={20} />
            BỘ LỌC
          </button>
          <button className="px-8 py-4 bg-emerald-deep text-white rounded-[24px] font-black hover:bg-house-green transition-all flex items-center gap-3 shadow-xl shadow-emerald-900/20">
            <UserPlus size={20} />
            THÊM MỚI
          </button>
        </div>
      </div>

      {/* Patient List */}
      <div className="bg-white rounded-[48px] border border-gray-50 shadow-xl shadow-gray-200/40 overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-10 py-8 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Bệnh nhân</th>
                <th className="px-6 py-8 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-6 py-8 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Liên hệ</th>
                <th className="px-6 py-8 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Lần khám cuối</th>
                <th className="px-10 py-8 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-400">
                    <RefreshCw size={48} className="animate-spin mx-auto mb-4 opacity-20" />
                    <p className="font-bold">Đang tải danh bạ...</p>
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-400 italic">
                    Không tìm thấy bệnh nhân nào.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => {
                  const profile = p.user?.profile;
                  const fullName = profile ? `${profile.lastName} ${profile.firstName}` : 'Ẩn danh';
                  const latestProfile = p.healthProfiles?.[0];
                  const lastVisit = latestProfile ? new Date(latestProfile.createdAt).toLocaleDateString('vi-VN') : 'Chưa có';
                  
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-emerald-deep/5 text-emerald-deep rounded-2xl flex items-center justify-center font-black text-xl shadow-inner">
                            {fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xl font-black text-house-green mb-1">{fullName}</p>
                            <p className="text-sm text-gray-400 font-medium">
                              {profile?.gender || 'Chưa rõ'} • {calculateAge(profile?.dob)} tuổi
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-8">
                        <span className={cn(
                          "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border",
                          getStatusStyle('stable') // Default to stable for now
                        )}>
                          Ổn định
                        </span>
                      </td>
                      <td className="px-6 py-8">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-gray-500 font-medium">
                            <Phone size={14} className="text-emerald-deep" />
                            {profile?.phone || 'Chưa có số'}
                          </div>
                          <div className="flex items-center gap-2 text-gray-400 text-xs line-clamp-1 max-w-[200px]">
                            <MapPin size={12} />
                            {profile?.address || 'Chưa có địa chỉ'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-8">
                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                          <Calendar size={14} />
                          {lastVisit}
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button className="w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-emerald-deep hover:border-emerald-100 transition-all shadow-sm">
                             <Activity size={20} />
                          </button>
                          <button className="w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-100 transition-all shadow-sm">
                             <Stethoscope size={20} />
                          </button>
                          <button className="w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:bg-emerald-deep hover:text-white transition-all shadow-sm">
                             <ChevronRight size={24} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-8 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
           <p className="text-sm text-gray-400 font-medium">
             Hiển thị {filteredPatients.length} trên tổng số {patients.length} bệnh nhân
           </p>
           <div className="flex gap-2">
              <button className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 disabled:opacity-30" disabled>1</button>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PatientDirectory;
