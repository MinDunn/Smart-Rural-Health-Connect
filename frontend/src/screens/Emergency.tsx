import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle, Activity, PhoneCall, User } from 'lucide-react';
import { Screen } from '../types';

interface EmergencyProps {
  setScreen: (s: Screen) => void;
}

const EmergencyScreen = ({ setScreen }: EmergencyProps) => {
  const facilities = [
    { name: 'Bệnh viện Đa khoa Tâm Anh', address: '108 Hoàng Như Tiếp, Long Biên', distance: '0.8 km', phone: '1800 6858' },
    { name: 'Bệnh viện Vinmec Times City', address: '458 Minh Khai, Hai Bà Trưng', distance: '2.5 km', phone: '024 3974 3556' },
    { name: 'Bệnh viện Bạch Mai', address: '78 Giải Phóng, Phương Mai', distance: '4.2 km', phone: '024 3869 3731' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="max-w-xl mx-auto px-6 py-12"
    >
      <button onClick={() => setScreen('home')} className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest mb-8 hover:text-starbucks-green group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Quay lại trang chủ
      </button>

      <div className="bg-white rounded-[40px] shadow-2xl p-8 md:p-10 border border-red-50">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-red-200">
            <AlertCircle className="text-white w-12 h-12" />
          </div>
          <h2 className="text-3xl font-extrabold text-house-green mb-2 text-center">Trợ giúp khẩn cấp</h2>
          <p className="text-gray-500 text-sm text-center">Chúng tôi đang xác định vị trí của ông bà</p>
        </div>

        <div className="space-y-4 mb-10">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Cơ sở y tế gần nhất</p>
          {facilities.map((f, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-red-200 transition-colors">
              <div className="flex-grow">
                <h4 className="font-bold text-sm text-house-green">{f.name}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">{f.address}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <Activity size={12} className="text-red-500" />
                  <span className="text-[10px] font-bold text-red-500 uppercase">{f.distance}</span>
                </div>
              </div>
              <button 
                onClick={() => alert(`Đang gọi ${f.name}: ${f.phone}`)}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-starbucks-green shadow-sm border border-gray-100 hover:bg-green-50 transition-colors"
              >
                <PhoneCall size={20} />
              </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => alert('Đang gọi 115...')}
            className="w-full bg-red-600 text-white py-5 rounded-[24px] font-extrabold text-lg flex items-center justify-center gap-3 shadow-xl shadow-red-200 active:scale-95 transition-all"
          >
            <AlertCircle size={24} />
            GỌI CẤP CỨU 115
          </button>
          <button 
            onClick={() => alert('Đang gọi cho người thân...')}
            className="w-full bg-house-green text-white py-5 rounded-[24px] font-extrabold text-lg flex items-center justify-center gap-3 shadow-xl shadow-green-900/20 active:scale-95 transition-all"
          >
            <User size={24} />
            GỌI CHO NGƯỜI THÂN
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default EmergencyScreen;
