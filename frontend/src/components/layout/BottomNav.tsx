import React from 'react';
import { Home, MessageSquare, Activity, ClipboardList, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Screen } from '../../types';

interface BottomNavProps {
  activeScreen: Screen;
  setScreen: (s: Screen) => void;
}

const BottomNav = ({ activeScreen, setScreen }: BottomNavProps) => (
  <div className="md:hidden fixed bottom-0 left-0 right-0 h-[88px] bg-white border-t border-gray-100 flex items-center justify-around px-2 z-50">
    {[
      { id: 'home', label: 'Trang chủ', icon: Home },
      { id: 'chat', label: 'Tư vấn', icon: MessageSquare },
      { id: 'status', label: 'Tình trạng', icon: Activity },
      { id: 'medical-records', label: 'Hồ sơ', icon: ClipboardList },
      { id: 'user-profile', label: 'Cá nhân', icon: User }
    ].map((item) => (
      <button
        key={item.id}
        onClick={() => setScreen(item.id as Screen)}
        className={cn(
          "flex flex-col items-center gap-1 min-w-[72px] transition-colors",
          activeScreen === item.id ? "text-starbucks-green" : "text-gray-400"
        )}
      >
        <div className={cn(
          "p-2 rounded-2xl transition-all",
          activeScreen === item.id ? "bg-green-light" : "bg-transparent"
        )}>
          <item.icon size={24} strokeWidth={activeScreen === item.id ? 2.5 : 2} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
      </button>
    ))}
  </div>
);

export default BottomNav;
