import React from 'react';
import { ArrowLeft } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import { Screen } from '../types';

interface ForgotPasswordProps {
  setScreen: (s: Screen) => void;
}

const ForgotPasswordScreen = ({ setScreen }: ForgotPasswordProps) => (
  <AuthLayout title="Khôi phục mật khẩu" subtitle="Nhập email hoặc số điện thoại để nhận mã xác thực">
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">SĐT / Email</label>
        <input type="text" placeholder="Nhập liên hệ của bạn" className="w-full bg-gray-50 border-gray-100 rounded-2xl py-4 px-6 text-sm focus:ring-starbucks-green focus:border-starbucks-green transition-all" />
      </div>
      <button 
        onClick={() => {
          alert('Mã xác thực đã được gửi!');
          setScreen('login');
        }}
        className="w-full bg-starbucks-green text-white py-4 rounded-3xl font-bold active:scale-95 transition-all"
      >
        Gửi mã xác thực
      </button>
      <button 
        onClick={() => setScreen('login')}
        className="w-full flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:text-house-green transition-colors"
      >
        <ArrowLeft size={16} />
        Quay lại đăng nhập
      </button>
    </div>
  </AuthLayout>
);

export default ForgotPasswordScreen;
