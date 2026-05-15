"use client";

import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Bell, 
  User as UserIcon,
  Search,
  Menu,
  X,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  href: string;
  icon: any;
  label: string;
  active?: boolean;
}

const SidebarItem = ({ href, icon: Icon, label, active }: SidebarItemProps) => (
  <Link 
    href={href}
    className={cn(
      "flex items-center gap-4 px-6 py-4 transition-all group",
      active 
        ? "bg-emerald-deep text-white shadow-lg shadow-emerald-900/20" 
        : "text-gray-400 hover:text-emerald-deep hover:bg-emerald-50"
    )}
  >
    <Icon size={22} className={cn("transition-transform group-hover:scale-110", active ? "text-white" : "text-gray-400 group-hover:text-emerald-deep")} />
    <span className="font-bold text-sm uppercase tracking-wider">{label}</span>
    {active && <ChevronRight size={16} className="ml-auto" />}
  </Link>
);

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('srhc_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // For now, if no user, redirect to some login or just show guest
      // router.push('/login'); 
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('srhc_user');
    localStorage.removeItem('srhc_token');
    window.location.href = 'http://localhost:3000/login'; // Redirect to citizen app login for now or portal login
  };

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
    { href: '/dashboard/patients', icon: Users, label: 'Bệnh nhân' },
    { href: '/dashboard/vitals', icon: Activity, label: 'Đo sinh tồn' },
    { href: '/dashboard/monitoring', icon: ShieldCheck, label: 'Theo dõi' },
    { href: '/dashboard/settings', icon: Settings, label: 'Cấu hình' },
  ];

  return (
    <div className="min-h-screen bg-neutral-warm flex">
      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-gray-100 transition-all duration-300 flex flex-col z-50",
        isSidebarOpen ? "w-72" : "w-0 -translate-x-full lg:w-20 lg:translate-x-0"
      )}>
        <div className="p-8 flex items-center gap-4 border-b border-gray-50">
          <div className="w-10 h-10 bg-emerald-deep rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-emerald-900/20">
             SR
          </div>
          {isSidebarOpen && (
            <span className="font-black text-xl text-house-green tracking-tighter uppercase italic">Connect</span>
          )}
        </div>

        <nav className="flex-grow py-8">
          {navItems.map((item) => (
            <SidebarItem 
              key={item.href}
              {...item}
              active={pathname === item.href}
            />
          ))}
        </nav>

        <div className="p-4 mt-auto">
           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-4 px-6 py-4 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-2xl group"
           >
              <LogOut size={22} className="group-hover:translate-x-1 transition-transform" />
              {isSidebarOpen && <span className="font-bold text-sm uppercase tracking-wider">Đăng xuất</span>}
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
           <div className="flex items-center gap-6">
              <button 
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 lg:hidden"
              >
                 <Menu size={24} />
              </button>
              <div className="hidden md:flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-xl w-96 group focus-within:ring-2 focus-within:ring-emerald-deep/20 transition-all border border-transparent focus-within:border-emerald-deep/20">
                 <Search size={18} className="text-gray-400 group-focus-within:text-emerald-deep" />
                 <input 
                   type="text" 
                   placeholder="Tìm kiếm bệnh nhân, mã số..." 
                   className="bg-transparent border-none outline-none text-sm w-full font-medium"
                 />
              </div>
           </div>

           <div className="flex items-center gap-6">
              <button className="relative p-2.5 text-gray-400 hover:text-emerald-deep hover:bg-emerald-50 rounded-xl transition-all group">
                 <Bell size={22} />
                 <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white group-hover:scale-125 transition-transform" />
              </button>
              
              <div className="h-8 w-px bg-gray-100" />

              <div className="flex items-center gap-4 group cursor-pointer">
                 <div className="text-right hidden sm:block">
                    <p className="text-sm font-black text-house-green group-hover:text-emerald-deep transition-colors">
                       {user?.profile?.lastName} {user?.profile?.firstName || 'Cán bộ'}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                       {user?.role?.name === 'health_worker' ? 'Cán bộ y tế' : user?.role?.name || 'Nhân viên'}
                    </p>
                 </div>
                 <div className="w-12 h-12 bg-neutral-warm rounded-2xl flex items-center justify-center text-emerald-deep shadow-inner border border-gray-100 group-hover:border-emerald-deep/20 transition-all">
                    <UserIcon size={24} />
                 </div>
              </div>
           </div>
        </header>

        {/* Page Content */}
        <div className="p-8 lg:p-12">
           {children}
        </div>
      </main>
    </div>
  );
}
