import React, { useState } from 'react';
import { HeartPulse, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Screen } from '../../types';

interface NavbarProps {
  activeScreen: Screen;
  setScreen: (s: Screen) => void;
  onLogout: () => void;
  user?: any;
}

const Navbar = ({ activeScreen, setScreen, onLogout, user }: NavbarProps) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const isWorker = user?.role?.name === 'health_worker';

  const navItems = isWorker ? [
    { id: 'worker-home', label: 'Trang chủ' },
    { id: 'patient-directory', label: 'Danh bạ' },
    { id: 'vitals-capture', label: 'Đo chỉ số' },
    { id: 'consultation-room', label: 'Hội chẩn' },
    { id: 'follow-up-monitor', label: 'Theo dõi' },
    { id: 'worker-profile', label: 'Hồ sơ' },
  ] : [
    { id: 'home', label: 'Trang chủ' },
    { id: 'chat', label: 'Tư vấn AI' },
    { id: 'request-support', label: 'Gửi yêu cầu' },
    { id: 'status', label: 'Tình trạng' },
    { id: 'medical-records', label: 'Hồ sơ' },
    { id: 'user-profile', label: 'Cá nhân' }
  ];

  return (
    <header className="glass fixed top-0 left-0 right-0 z-50 h-[80px] flex items-center justify-between px-6 md:px-12 border-b border-white/20">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setScreen(isWorker ? 'worker-home' : 'home')}>
        <div className="w-12 h-12 bg-emerald-deep rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
          <HeartPulse className="text-white w-7 h-7" />
        </div>
        <h1 className="font-black text-2xl text-gradient tracking-tight">Sức khỏe Việt</h1>
      </div>
      
      <nav className="hidden md:flex items-center gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setScreen(item.id as Screen)}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-black transition-all relative",
              activeScreen === item.id 
                ? "text-emerald-deep bg-emerald-deep/5" 
                : "text-house-green/60 hover:text-emerald-deep hover:bg-emerald-deep/5"
            )}
          >
            {item.label}
            {activeScreen === item.id && (
              <motion.div 
                layoutId="nav-pill" 
                className="absolute inset-0 rounded-full border-2 border-emerald-deep/20" 
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-4 relative">
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-12 h-12 rounded-[18px] glass border-white/60 overflow-hidden flex items-center justify-center hover:border-emerald-deep hover:scale-105 transition-all shadow-sm group"
          >
            <User size={24} className="text-emerald-deep group-hover:scale-110 transition-transform" />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowUserMenu(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.9 }}
                  className="absolute right-0 mt-4 w-56 glass rounded-[32px] shadow-2xl border-white/40 py-3 z-20 overflow-hidden"
                >
                  <button 
                    onClick={() => {
                      setShowUserMenu(false);
                      setScreen(isWorker ? 'worker-profile' : 'user-profile');
                    }}
                    className="w-full px-5 py-3 border-b border-emerald-deep/5 mb-2 hover:bg-gray-50 transition-colors text-left"
                  >
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Tài khoản</p>
                    <p className="font-black text-house-green">{isWorker ? 'Cán bộ y tế' : 'Thành viên'}</p>
                  </button>
                  <button 
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-4 px-5 py-3.5 text-base font-bold text-red-500 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut size={20} />
                    <span>Đăng xuất</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
