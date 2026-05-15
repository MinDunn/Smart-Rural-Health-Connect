"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  UserPlus, 
  Filter, 
  Phone, 
  MapPin, 
  Calendar,
  Activity,
  ChevronRight,
  Stethoscope,
  RefreshCw,
  LayoutGrid,
  List
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { patientApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function PatientDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const router = useRouter();

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
    return name.includes(term) || phone.includes(term) || p.id.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-house-green tracking-tight uppercase">Danh bạ bệnh nhân</h1>
          <p className="text-gray-500 font-medium">Quản lý và tra cứu hồ sơ sức khỏe cộng đồng toàn vùng</p>
        </div>
        <button className="px-8 py-4 bg-emerald-deep text-white rounded-2xl font-black hover:bg-house-green transition-all flex items-center gap-3 shadow-xl shadow-emerald-900/20 active:scale-95">
          <UserPlus size={20} />
          THÊM BỆNH NHÂN MỚI
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
           <input 
             type="text" 
             placeholder="Tìm theo tên, số điện thoại hoặc mã số..." 
             className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-deep/10 outline-none"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
        
        <div className="flex items-center gap-2 w-full lg:w-auto">
           <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all">
              <Filter size={18} />
              Bộ lọc
           </button>
           <div className="h-8 w-px bg-gray-100 mx-2" />
           <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
              <button 
                onClick={() => setViewMode('table')}
                className={cn("p-2 rounded-xl transition-all", viewMode === 'table' ? "bg-white text-emerald-deep shadow-sm" : "text-gray-400")}
              >
                 <List size={20} />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={cn("p-2 rounded-xl transition-all", viewMode === 'grid' ? "bg-white text-emerald-deep shadow-sm" : "text-gray-400")}
              >
                 <LayoutGrid size={20} />
              </button>
           </div>
        </div>
      </div>

      {/* List Container */}
      <section className="bg-white rounded-[48px] border border-gray-50 shadow-xl shadow-gray-200/40 overflow-hidden min-h-[400px]">
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Hồ sơ bệnh nhân</th>
                  <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
                  <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Thông tin liên hệ</th>
                  <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Lần khám cuối</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-24 text-center text-gray-400">
                      <RefreshCw size={40} className="animate-spin mx-auto mb-4 opacity-20" />
                      <p className="font-bold uppercase tracking-tighter text-xs">Đang tải danh sách...</p>
                    </td>
                  </tr>
                ) : filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-24 text-center text-gray-400 italic">
                      Không tìm thấy bệnh nhân nào khớp với từ khóa tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => {
                    const profile = p.user?.profile;
                    const fullName = profile ? `${profile.lastName} ${profile.firstName}` : 'Bệnh nhân mới';
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-emerald-deep/5 text-emerald-deep rounded-2xl flex items-center justify-center font-black text-lg border border-emerald-100/30">
                                 {fullName.charAt(0)}
                              </div>
                              <div>
                                 <p className="text-base font-black text-house-green group-hover:text-emerald-deep transition-colors">{fullName}</p>
                                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                   {profile?.gender || 'Chưa rõ'} • {calculateAge(profile?.dob)} tuổi
                                 </p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-6">
                           <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[9px] font-black uppercase tracking-widest">
                              Ổn định
                           </span>
                        </td>
                        <td className="px-6 py-6 text-sm">
                           <div className="flex flex-col gap-1 text-gray-500 font-medium">
                              <div className="flex items-center gap-2">
                                 <Phone size={14} className="text-emerald-deep/40" />
                                 {profile?.phone || '--'}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                 <MapPin size={12} className="text-gray-300" />
                                 <span className="truncate max-w-[150px]">{profile?.address || '--'}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-6">
                           <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                              <Calendar size={14} className="text-gray-300" />
                              {p.healthProfiles?.[0] ? new Date(p.healthProfiles[0].createdAt).toLocaleDateString('vi-VN') : 'Chưa có'}
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => router.push(`/dashboard/vitals?patient=${p.id}`)}
                                className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-emerald-deep hover:border-emerald-100 transition-all shadow-sm"
                                title="Đo sinh tồn"
                              >
                                 <Activity size={18} />
                              </button>
                              <button 
                                className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-100 transition-all shadow-sm"
                                title="Bắt đầu khám"
                              >
                                 <Stethoscope size={18} />
                              </button>
                              <button 
                                className="w-10 h-10 bg-emerald-deep text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20 active:scale-95 transition-all"
                                title="Xem chi tiết"
                              >
                                 <ChevronRight size={20} />
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
        ) : (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
             {filteredPatients.map((p) => {
               const profile = p.user?.profile;
               const fullName = profile ? `${profile.lastName} ${profile.firstName}` : 'Bệnh nhân mới';
               return (
                 <div key={p.id} className="bg-white border border-gray-100 rounded-[32px] p-6 hover:shadow-xl hover:border-emerald-100 transition-all group">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-16 h-16 bg-neutral-warm rounded-2xl flex items-center justify-center font-black text-2xl text-emerald-deep border border-gray-50">
                          {fullName.charAt(0)}
                       </div>
                       <div className="flex-1">
                          <h4 className="text-lg font-black text-house-green group-hover:text-emerald-deep transition-colors">{fullName}</h4>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.id.slice(0,12)}...</p>
                       </div>
                    </div>
                    <div className="space-y-3 mb-8">
                       <div className="flex items-center justify-between text-xs font-bold text-gray-500 bg-gray-50 p-3 rounded-2xl">
                          <span>Giới tính: {profile?.gender || 'Chưa rõ'}</span>
                          <span>Tuổi: {calculateAge(profile?.dob)}</span>
                       </div>
                       <div className="flex items-center gap-3 text-xs text-gray-400 px-1">
                          <Phone size={14} /> {profile?.phone || 'Chưa có số'}
                       </div>
                       <div className="flex items-center gap-3 text-xs text-gray-400 px-1 truncate">
                          <MapPin size={14} /> {profile?.address || 'Chưa có địa chỉ'}
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-50">
                       <button className="py-3 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-deep hover:text-white transition-all">Chi tiết</button>
                       <button className="py-3 bg-emerald-deep text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-900/20 active:scale-95 transition-all">Khám bệnh</button>
                    </div>
                 </div>
               );
             })}
          </div>
        )}

        <div className="p-8 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
           <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
              Trang 1 • Hiển thị {filteredPatients.length} / {patients.length} bệnh nhân
           </p>
           <div className="flex gap-2">
              <button disabled className="w-10 h-10 rounded-xl bg-emerald-deep text-white text-xs font-black shadow-lg shadow-emerald-900/20">1</button>
              <button className="w-10 h-10 rounded-xl bg-white border border-gray-100 text-gray-400 text-xs font-black hover:border-emerald-100 transition-all">2</button>
           </div>
        </div>
      </section>
    </div>
  );
}
