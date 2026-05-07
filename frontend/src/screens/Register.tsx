import React from 'react';
import AuthLayout from '../components/auth/AuthLayout';
import { Screen } from '../types';

interface RegisterProps {
  onRegister: (data: any) => void;
  setScreen: (s: Screen) => void;
}

const RegisterScreen = ({ onRegister, setScreen }: RegisterProps) => (
  <AuthLayout title="Tạo tài khoản mới" subtitle="Bắt đầu hành trình chăm sóc sức khỏe thông minh">
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Họ</label>
          <input type="text" placeholder="Nguyễn" className="w-full bg-gray-50 border-gray-100 rounded-2xl py-4 px-6 text-sm focus:ring-starbucks-green focus:border-starbucks-green transition-all" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Tên</label>
          <input type="text" placeholder="An" className="w-full bg-gray-50 border-gray-100 rounded-2xl py-4 px-6 text-sm focus:ring-starbucks-green focus:border-starbucks-green transition-all" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Số điện thoại</label>
        <input type="tel" placeholder="0xxx xxx xxx" className="w-full bg-gray-50 border-gray-100 rounded-2xl py-4 px-6 text-sm focus:ring-starbucks-green focus:border-starbucks-green transition-all" />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Mật khẩu</label>
        <input type="password" placeholder="••••••••" className="w-full bg-gray-50 border-gray-100 rounded-2xl py-4 px-6 text-sm focus:ring-starbucks-green focus:border-starbucks-green transition-all" />
      </div>
      <button 
        onClick={() => onRegister({})}
        className="w-full bg-starbucks-green text-white py-4 rounded-3xl font-bold hover:shadow-lg hover:shadow-green-900/20 active:scale-95 transition-all mt-4"
      >
        Đăng ký
      </button>
      <div className="text-center mt-6">
        <span className="text-gray-400 text-sm">Đã có tài khoản? </span>
        <button 
          onClick={() => setScreen('login')}
          className="text-sm font-bold text-starbucks-green hover:underline"
        >
          Đăng nhập
        </button>
      </div>
    </div>
  </AuthLayout>
);

export default RegisterScreen;
