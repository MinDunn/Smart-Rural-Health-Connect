import React from 'react';
import { Home, MessageSquare, Activity, ClipboardList, User, Stethoscope, Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Screen } from '../../types';

interface BottomNavProps {
  activeScreen: Screen;
  setScreen: (s: Screen) => void;
  user?: any;
}

const BottomNav = ({ activeScreen, setScreen, user }: BottomNavProps) => {
  const isWorker = user?.role?.name === 'health_worker';

  const items = isWorker ? [
    { id: 'worker-home', label: 'Home', icon: Home },
    { id: 'patient-directory', label: 'Bệnh nhân', icon: Users },
    { id: 'vitals-capture', label: 'Đo chỉ số', icon: Activity },
    { id: 'consultation-room', label: 'Hội chẩn', icon: Stethoscope },
    { id: 'worker-profile', label: 'Tôi', icon: User },
  ] : [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'Tư vấn', icon: MessageSquare },
    { id: 'request-support', label: 'Hỗ trợ', icon: Stethoscope },
    { id: 'status', label: 'Chỉ số', icon: Activity },
    { id: 'medical-records', label: 'Hồ sơ', icon: ClipboardList },
    { id: 'user-profile', label: 'Tôi', icon: User }
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-6 right-6 h-[84px] glass border-white/40 rounded-[32px] flex items-center justify-around px-2 z-50 shadow-2xl">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setScreen(item.id as Screen)}
          className={cn(
            "flex flex-col items-center gap-1.5 transition-all relative",
            activeScreen === item.id ? "text-emerald-deep" : "text-emerald-deep/40"
          )}
        >
          <div className={cn(
            "p-2 rounded-[18px] transition-all relative z-10",
            activeScreen === item.id ? "bg-emerald-deep/5 scale-110" : "bg-transparent"
          )}>
            <item.icon size={26} strokeWidth={activeScreen === item.id ? 2.5 : 2} />
          </div>
          <span className={cn(
            "text-[10px] font-black uppercase tracking-widest",
            activeScreen === item.id ? "opacity-100" : "opacity-40"
          )}>
            {item.label}
          </span>
          {activeScreen === item.id && (
            <motion.div 
              layoutId="nav-indicator"
              className="absolute top-[-12px] w-1 h-1 bg-emerald-deep rounded-full shadow-[0_0_8px_rgba(0,72,47,0.5)]"
            />
          )}
        </button>
      ))}
    </div>
  );
};

export default BottomNav;
