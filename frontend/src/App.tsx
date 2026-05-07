import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types & Constants
import { Screen, Profile, HistoryItem, Prescription } from './types';

// Layout Components
import Navbar from './components/layout/Navbar';
import BottomNav from './components/layout/BottomNav';

// Screens
import HomeScreen from './screens/Home';
import ChatScreen from './screens/Chat';
import AnalysisScreen from './screens/Analysis';
import StatusScreen from './screens/Status';
import MedicalRecordsScreen from './screens/MedicalRecords';
import UserProfileScreen from './screens/UserProfile';
import LoginScreen from './screens/Login';
import RegisterScreen from './screens/Register';
import ForgotPasswordScreen from './screens/ForgotPassword';
import EmergencyScreen from './screens/Emergency';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeScreen, setScreen] = useState<Screen>('home');
  const [user, setUser] = useState<any>(null);

  // Profile State
  const [profile, setProfile] = useState<Profile>({
    name: 'Nguyễn Văn A',
    birthYear: '1960',
    gender: 'Nam',
    phone: '0912 345 678',
    relativePhone: '0988 777 666',
    conditions: ['Cao huyết áp'],
    allergies: '',
    bloodType: 'O',
    height: 165,
    weight: 68,
    bp: '120/80',
    sugar: '5.6',
    hr: '72',
    spo2: '98',
    lastMeasured: 'Hôm nay'
  });

  // Medical History State
  const [medicalHistory, setMedicalHistory] = useState<HistoryItem[]>([
    { date: '12', month: 'Tháng 03', year: '2026', title: 'Kiểm tra sức khỏe tổng quát', hospital: 'Trạm y tế Phường', doctor: 'BS. Lê Mạnh Hùng', result: 'Theo dõi chỉ số huyết áp tại nhà.' },
    { date: '15', month: 'Tháng 10', year: '2025', title: 'Xét nghiệm đường huyết định kỳ', hospital: 'Bệnh viện Đa khoa Tâm Anh', doctor: 'BS. Nguyễn Thị Kim', result: 'Đường huyết ổn định, duy trì chế độ ăn.' },
    { date: '02', month: 'Tháng 08', year: '2025', title: 'Khám chuyên khoa Nội tiết', hospital: 'Phòng khám Đa khoa Hồng Ngọc', doctor: 'BS. Trần Văn Tú', result: 'Kết quả bình thường, tái khám sau 6 tháng.' }
  ]);

  // Prescription State
  const [prescription, setPrescription] = useState<Prescription>({
    id: 'DT-2026-0312',
    title: 'Duy trì huyết áp',
    date: '12/03/2026',
    doctor: 'BS. Hùng',
    medications: [
      { name: 'Amlodipine 5mg', timing: 'Sáng', dosage: '1 viên' },
      { name: 'Metformin 500mg', timing: 'Tối', dosage: '1 viên' },
      { name: 'Vitamin B Complex', timing: 'Trưa', dosage: '1 viên' }
    ]
  });

  // Check for token on load
  useEffect(() => {
    const savedUser = localStorage.getItem('srhc_user');
    const token = localStorage.getItem('srhc_token');
    if (savedUser && token) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsLoggedIn(true);
        
        if (userData.profile) {
          setProfile(prev => ({
            ...prev,
            name: `${userData.profile.lastName} ${userData.profile.firstName}`,
          }));
        }
      } catch (e) {
        localStorage.removeItem('srhc_user');
        localStorage.removeItem('srhc_token');
      }
    }
  }, []);

  const addHistory = (item: HistoryItem) => {
    setMedicalHistory([item, ...medicalHistory]);
  };

  const updatePrescription = (data: Prescription) => {
    setPrescription(data);
  };

  const bmi = useMemo(() => {
    const hInM = profile.height / 100;
    return (profile.weight / (hInM * hInM)).toFixed(1);
  }, [profile.height, profile.weight]);

  const bmiStatus = useMemo(() => {
    const val = parseFloat(bmi);
    if (val < 18.5) return { label: 'Thiếu cân', color: 'text-blue-500', bg: 'bg-blue-50' };
    if (val < 25) return { label: 'Bình thường', color: 'text-green-600', bg: 'bg-green-50' };
    if (val < 30) return { label: 'Thừa cân', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { label: 'Nguy cơ', color: 'text-red-600', bg: 'bg-red-50' };
  }, [bmi]);

  // Scroll to top on screen change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeScreen, isLoggedIn]);

  const handleLogin = (data: any) => {
    localStorage.setItem('srhc_token', data.access_token);
    localStorage.setItem('srhc_user', JSON.stringify(data.user));
    setUser(data.user);
    setIsLoggedIn(true);
    setScreen('home');

    if (data.user?.profile) {
      setProfile(prev => ({
        ...prev,
        name: `${data.user.profile.lastName} ${data.user.profile.firstName}`,
      }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('srhc_token');
    localStorage.removeItem('srhc_user');
    setUser(null);
    setIsLoggedIn(false);
    setScreen('login');
  };

  if (!isLoggedIn) {
    return (
      <AnimatePresence mode="wait">
        {activeScreen === 'login' && (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoginScreen onLogin={handleLogin} setScreen={setScreen} />
          </motion.div>
        )}
        {activeScreen === 'register' && (
          <motion.div key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <RegisterScreen onRegister={handleLogin} setScreen={setScreen} />
          </motion.div>
        )}
        {activeScreen === 'forgot-password' && (
          <motion.div key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ForgotPasswordScreen setScreen={setScreen} />
          </motion.div>
        )}
        {!['login', 'register', 'forgot-password'].includes(activeScreen) && (
          <motion.div key="login-fallback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoginScreen onLogin={handleLogin} setScreen={setScreen} />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-warm pb-20 md:pb-0 font-sans">
      <Navbar activeScreen={activeScreen} setScreen={setScreen} onLogout={handleLogout} />
      
      <main>
        <AnimatePresence mode="wait">
          {activeScreen === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HomeScreen setScreen={setScreen} />
            </motion.div>
          )}
          {activeScreen === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ChatScreen setScreen={setScreen} />
            </motion.div>
          )}
          {activeScreen === 'analysis' && (
            <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AnalysisScreen setScreen={setScreen} />
            </motion.div>
          )}
          {activeScreen === 'status' && (
            <motion.div key="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <StatusScreen profile={profile} setProfile={setProfile} bmi={bmi} bmiStatus={bmiStatus} />
            </motion.div>
          )}
          {activeScreen === 'medical-records' && (
            <motion.div key="medical-records" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MedicalRecordsScreen 
                history={medicalHistory} 
                onAddHistory={addHistory}
                prescription={prescription}
                onUpdatePrescription={updatePrescription}
              />
            </motion.div>
          )}
          {activeScreen === 'user-profile' && (
            <motion.div key="user-profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <UserProfileScreen profile={profile} setProfile={setProfile} />
            </motion.div>
          )}
          {activeScreen === 'emergency' && (
            <motion.div key="emergency" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EmergencyScreen setScreen={setScreen} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav activeScreen={activeScreen} setScreen={setScreen} />
    </div>
  );
}
