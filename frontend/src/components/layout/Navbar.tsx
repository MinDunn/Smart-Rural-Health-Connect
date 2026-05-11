import React, { useState } from 'react';
import { HeartPulse, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Screen } from '../../types';

interface NavbarProps {
  activeScreen: Screen;
  setScreen: (s: Screen) => void;
  onLogout: () => void;
}

const Navbar = ({ activeScreen, setScreen, onLogout }: NavbarProps) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white sticky top-0 z-50 h-[72px] shadow-sm flex items-center justify-between px-6 md:px-12">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setScreen('home')}>
        <div className="w-10 h-10 bg-starbucks-green rounded-lg flex items-center justify-center">
          <HeartPulse className="text-white w-6 h-6" />
        </div>
        <h1 className="font-bold text-xl text-starbucks-green tracking-tight">Sức khỏe Việt</h1>
      </div>
      
      <nav className="hidden md:flex items-center gap-8">
        {[
          { id: 'home', label: 'Trang chủ' },
          { id: 'chat', label: 'Tư vấn AI' },
          { id: 'request-support', label: 'Gửi yêu cầu' },
          { id: 'status', label: 'Tình trạng' },
          { id: 'medical-records', label: 'Hồ sơ' },
          { id: 'user-profile', label: 'Cá nhân' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setScreen(item.id as Screen)}
            className={cn(
              "text-sm font-semibold transition-all hover:text-starbucks-green relative py-2",
              activeScreen === item.id ? "text-starbucks-green" : "text-gray-500"
            )}
          >
            {item.label}
            {activeScreen === item.id && (
              <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-starbucks-green" />
            )}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-4 relative">
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center hover:border-starbucks-green transition-colors focus:outline-none"
          >
            <User size={20} className="text-gray-400" />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowUserMenu(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 overflow-hidden"
                >
                  <button 
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut size={16} />
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
