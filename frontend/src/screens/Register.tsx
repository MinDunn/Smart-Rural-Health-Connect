import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import { Screen } from '../types';
import { authApi } from '../lib/api';

interface RegisterProps {
  onRegister: (data: any) => void;
  setScreen: (s: Screen) => void;
}

const RegisterScreen = ({ onRegister, setScreen }: RegisterProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password || !firstName || !lastName || !confirmPassword) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await authApi.register({
        email,
        password,
        firstName,
        lastName,
        phone,
      });
      
      setSuccess(true);
      // Wait a bit to show success message before switching
      setTimeout(() => {
        onRegister(response.data);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Tạo tài khoản mới" subtitle="Bắt đầu hành trình chăm sóc sức khỏe thông minh">
      <div className="space-y-4">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 flex items-center gap-2"
          >
            <AlertCircle size={14} />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-green-50 text-green-600 text-xs font-bold rounded-xl border border-green-100 flex items-center gap-2"
          >
            <CheckCircle2 size={14} />
            Đăng ký thành công! Đang chuyển hướng...
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Họ</label>
            <input 
              type="text" 
              placeholder="Nguyễn" 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-gray-50 border-gray-100 rounded-2xl py-4 px-6 text-sm focus:ring-starbucks-green focus:border-starbucks-green transition-all" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Tên</label>
            <input 
              type="text" 
              placeholder="An" 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-gray-50 border-gray-100 rounded-2xl py-4 px-6 text-sm focus:ring-starbucks-green focus:border-starbucks-green transition-all" 
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email / Định danh</label>
          <input 
            type="email" 
            placeholder="nguyena@gmail.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-50 border-gray-100 rounded-2xl py-4 px-6 text-sm focus:ring-starbucks-green focus:border-starbucks-green transition-all" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Số điện thoại</label>
          <input 
            type="tel" 
            placeholder="0xxx xxx xxx" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-gray-50 border-gray-100 rounded-2xl py-4 px-6 text-sm focus:ring-starbucks-green focus:border-starbucks-green transition-all" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Mật khẩu</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-50 border-gray-100 rounded-2xl py-4 px-6 text-sm focus:ring-starbucks-green focus:border-starbucks-green transition-all" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nhập lại mật khẩu</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-gray-50 border-gray-100 rounded-2xl py-4 px-6 text-sm focus:ring-starbucks-green focus:border-starbucks-green transition-all" 
          />
        </div>
        <button 
          onClick={handleSubmit}
          disabled={loading || success}
          className="w-full bg-starbucks-green text-white py-4 rounded-3xl font-bold hover:shadow-lg hover:shadow-green-900/20 active:scale-95 transition-all mt-4 disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : 'Đăng ký'}
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
};

export default RegisterScreen;
