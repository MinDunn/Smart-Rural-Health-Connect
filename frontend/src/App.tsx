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
  const [patientId, setPatientId] = useState<string | null>(null);

  // Profile State
  const [profile, setProfile] = useState<Profile>({
    name: '',
    birthYear: '',
    gender: '',
    phone: '',
    address: '',
    relativePhone: '',
    emergencyContacts: [],
    conditions: ['Không có'],
    allergies: '',
    bloodType: 'Không rõ',
    height: 0,
    weight: 0,
    bp: '--/--',
    sugar: '--',
    hr: '--',
    spo2: '--',
    lastMeasured: 'Chưa có dữ liệu'
  });

  // Medical History State
  const [medicalHistory, setMedicalHistory] = useState<HistoryItem[]>([]);

  // Prescription State
  const [prescription, setPrescription] = useState<Prescription>({
    id: '',
    title: 'Chưa có đơn thuốc',
    date: '--/--/----',
    doctor: '--',
    medications: []
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

  // Fetch data from API
  useEffect(() => {
    if (isLoggedIn && user) {
      const fetchData = async () => {
        try {
          // Fetch Patient/Profile
          const patientRes = await import('./lib/api').then(m => m.patientApi.getProfile(user.id));
          const patientData = patientRes.data;
          
          if (patientData) {
            setPatientId(patientData.id);
            setProfile(prev => ({
              ...prev,
              bloodType: patientData.bloodType || prev.bloodType,
              allergies: patientData.allergies || prev.allergies,
              conditions: patientData.medicalHistory ? [patientData.medicalHistory] : prev.conditions,
            }));

            // Fetch History
            const historyRes = await import('./lib/api').then(m => m.clinicalApi.getHistory(patientData.id));
            const formattedHistory = historyRes.data.map((item: any) => ({
              date: new Date(item.appointmentDate).getDate().toString(),
              month: `Tháng ${new Date(item.appointmentDate).getMonth() + 1}`,
              year: new Date(item.appointmentDate).getFullYear().toString(),
              title: item.reason || 'Khám bệnh',
              hospital: 'Trạm y tế',
              doctor: item.doctor?.user?.profile ? `${item.doctor.user.profile.lastName} ${item.doctor.user.profile.firstName}` : 'Bác sĩ',
              result: item.consultation?.diagnosis || 'Chưa có kết luận'
            }));
            setMedicalHistory(formattedHistory);

            // Fetch Latest Prescription
            const prescriptionRes = await import('./lib/api').then(m => m.clinicalApi.getLatestPrescription(patientData.id));
            if (prescriptionRes.data) {
              const p = prescriptionRes.data;
              setPrescription({
                id: p.id,
                title: 'Đơn thuốc gần nhất',
                date: new Date(p.createdAt).toLocaleDateString('vi-VN'),
                doctor: 'Bác sĩ điều trị',
                medications: p.medicines || []
              });
            }
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      fetchData();
    }
  }, [isLoggedIn, user]);

  const addHistory = async (item: HistoryItem) => {
    if (!patientId) return;
    try {
      const { clinicalApi } = await import('./lib/api');
      // 1. Create Appointment
      const apptRes = await clinicalApi.createAppointment({
        patient: { id: patientId },
        appointmentDate: new Date(`${item.year}-${item.month.replace('Tháng ', '')}-${item.date}`),
        reason: item.title,
        status: 'completed'
      });
      
      // 2. Create Consultation
      await clinicalApi.addConsultation(apptRes.data.id, {
        diagnosis: item.result,
        doctorNotes: `Bác sĩ: ${item.doctor}, Bệnh viện: ${item.hospital}`
      });

      // Refresh list
      setMedicalHistory([item, ...medicalHistory]);
      alert('Đã lưu lịch sử khám thành công!');
    } catch (error) {
      console.error('Error adding history:', error);
      alert('Có lỗi xảy ra khi lưu lịch sử khám.');
    }
  };

  const updatePrescription = async (data: Prescription) => {
    if (!patientId) return;
    try {
      const { clinicalApi } = await import('./lib/api');
      // Usually we need a consultationId. For simplicity, we'll assume we update for the latest appointment
      const historyRes = await clinicalApi.getHistory(patientId);
      const latestAppt = historyRes.data[0];
      
      if (latestAppt && latestAppt.consultation) {
        await clinicalApi.addPrescription(latestAppt.consultation.id, {
          medicines: data.medications,
          duration: '7 days' // Default
        });
        setPrescription(data);
        alert('Đã cập nhật đơn thuốc thành công!');
      } else {
        alert('Cần có lịch sử khám trước khi thêm đơn thuốc.');
      }
    } catch (error) {
      console.error('Error updating prescription:', error);
      alert('Có lỗi xảy ra khi cập nhật đơn thuốc.');
    }
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
              <StatusScreen 
                profile={profile} 
                setProfile={setProfile} 
                bmi={bmi} 
                bmiStatus={bmiStatus}
                patientId={patientId}
              />
            </motion.div>
          )}
          {activeScreen === 'medical-records' && (
            <motion.div key="medical-records" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MedicalRecordsScreen 
                history={medicalHistory} 
                onAddHistory={addHistory}
                prescription={prescription}
                onUpdatePrescription={updatePrescription}
                patientId={patientId}
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
