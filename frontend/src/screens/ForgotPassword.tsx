import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, ShieldCheck, Lock, AlertCircle, CheckCircle2, Timer } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import { Screen } from '../types';
import { authApi } from '../lib/api';

interface ForgotPasswordProps {
  setScreen: (s: Screen) => void;
}

type Step = 'email' | 'otp' | 'reset';

const ForgotPasswordScreen = ({ setScreen }: ForgotPasswordProps) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    if (step === 'otp' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleRequestOtp = async () => {
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authApi.forgotPassword(email);
      setStep('otp');
      setTimeLeft(300);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không tìm thấy tài khoản với email này');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      setError('Vui lòng nhập đủ 6 chữ số');
      return;
    }
    setStep('reset');
    setError('');
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp');
      return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authApi.resetPassword({ email, otp, newPassword });
      setSuccess('Mật khẩu đã được khôi phục thành công!');
      setTimeout(() => {
        setScreen('login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title={step === 'email' ? "Khôi phục mật khẩu" : step === 'otp' ? "Xác thực mã OTP" : "Mật khẩu mới"} 
      subtitle={
        step === 'email' ? "Nhập email của bạn để nhận mã khôi phục" : 
        step === 'otp' ? `Chúng tôi đã gửi mã đến email ${email}` : 
        "Thiết lập mật khẩu mới cho tài khoản của bạn"
      }
    >
      <div className="space-y-6">
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 flex items-center gap-2">
            <AlertCircle size={14} />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-3 bg-green-50 text-green-600 text-xs font-bold rounded-xl border border-green-100 flex items-center gap-2">
            <CheckCircle2 size={14} />
            {success}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 'email' && (
            <motion.div key="email-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email tài khoản</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com" 
                    className="w-full bg-gray-50 border-gray-100 rounded-2xl py-4 pl-12 pr-6 text-sm focus:ring-starbucks-green focus:border-starbucks-green transition-all" 
                  />
                </div>
              </div>
              <button onClick={handleRequestOtp} disabled={loading} className="w-full bg-starbucks-green text-white py-4 rounded-3xl font-bold active:scale-95 transition-all disabled:opacity-50">
                {loading ? 'Đang xử lý...' : 'Gửi mã xác thực'}
              </button>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div key="otp-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Mã xác thực (6 chữ số)</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="000000" 
                    className="w-full bg-gray-50 border-gray-100 rounded-2xl py-4 pl-12 pr-6 text-2xl tracking-[1em] font-bold text-center focus:ring-starbucks-green focus:border-starbucks-green transition-all" 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <Timer size={16} className={timeLeft < 60 ? 'text-red-500' : ''} />
                  <span className={timeLeft < 60 ? 'text-red-500' : ''}>{formatTime(timeLeft)}</span>
                </div>
                <button 
                  onClick={handleRequestOtp} 
                  disabled={timeLeft > 0 || loading}
                  className="text-sm font-bold text-starbucks-green disabled:text-gray-300"
                >
                  Gửi lại mã
                </button>
              </div>

              <button onClick={handleVerifyOtp} className="w-full bg-starbucks-green text-white py-4 rounded-3xl font-bold active:scale-95 transition-all">
                Tiếp tục
              </button>
            </motion.div>
          )}

          {step === 'reset' && (
            <motion.div key="reset-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full bg-gray-50 border-gray-100 rounded-2xl py-4 pl-12 pr-6 text-sm focus:ring-starbucks-green focus:border-starbucks-green transition-all" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full bg-gray-50 border-gray-100 rounded-2xl py-4 pl-12 pr-6 text-sm focus:ring-starbucks-green focus:border-starbucks-green transition-all" 
                  />
                </div>
              </div>
              <button onClick={handleResetPassword} disabled={loading} className="w-full bg-starbucks-green text-white py-4 rounded-3xl font-bold active:scale-95 transition-all disabled:opacity-50">
                {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setScreen('login')}
          className="w-full flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:text-starbucks-green transition-colors pt-4"
        >
          <ArrowLeft size={16} />
          Quay lại đăng nhập
        </button>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordScreen;
