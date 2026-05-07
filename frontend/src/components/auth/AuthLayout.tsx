import React from 'react';
import { motion } from 'framer-motion';
import { HeartPulse } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => (
  <div className="min-h-screen bg-neutral-warm flex items-center justify-center p-6">
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-8 md:p-12"
    >
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-starbucks-green rounded-2xl flex items-center justify-center mb-6">
          <HeartPulse className="text-white w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-house-green mb-2 text-center">{title}</h2>
        <p className="text-gray-500 text-sm text-center">{subtitle}</p>
      </div>
      {children}
    </motion.div>
  </div>
);

export default AuthLayout;
