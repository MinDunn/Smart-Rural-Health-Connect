import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from './lib/utils';

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
import RequestSupportScreen from './screens/RequestSupport';
import RequestHistoryScreen from './screens/RequestHistory';

// LHW Screens
import LHWHomeScreen from './screens/LHWHome';
import PatientDirectoryScreen from './screens/PatientDirectory';
import VitalsCaptureScreen from './screens/VitalsCapture';
import ConsultationRoomScreen from './screens/ConsultationRoom';
import FollowUpMonitorScreen from './screens/FollowUpMonitor';
import WorkerProfileScreen from './screens/WorkerProfile';

// API
import { patientApi, clinicalApi } from './lib/api';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeScreen, setScreen] = useState<Screen>('home');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingScreen, setPendingScreen] = useState<Screen | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [user, setUser] = useState<any>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

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
        
        // Set default screen based on role if on home
        if (userData.role?.name === 'health_worker') {
          setScreen('worker-home');
        } else {
          setScreen('home');
        }
        
        if (userData.profile) {
          setProfile(prev => ({
            ...prev,
            name: `${userData.profile.lastName} ${userData.profile.firstName}`,
            phone: userData.profile.phone || prev.phone,
            address: userData.profile.address || prev.address,
            birthYear: userData.profile.birthYear || prev.birthYear,
            gender: userData.profile.gender || prev.gender,
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
    if (isLoggedIn && user && user.id && user.role?.name === 'citizen') {
      const fetchData = async () => {
        try {
          // Fetch Patient/Profile
          const patientRes = await patientApi.getProfile(user.id);
          const patientData = patientRes.data;
          
          if (patientData) {
            setPatientId(patientData.id);
            setProfile(prev => ({
              ...prev,
              bloodType: patientData.bloodType || prev.bloodType,
              allergies: patientData.allergies || prev.allergies,
              conditions: patientData.medicalHistory ? [patientData.medicalHistory] : prev.conditions,
              emergencyContacts: patientData.emergencyContacts || prev.emergencyContacts,
              // Also sync from user profile if available in relation
              name: patientData.user?.profile 
                ? `${patientData.user.profile.lastName} ${patientData.user.profile.firstName}` 
                : prev.name,
              phone: patientData.user?.profile?.phone || prev.phone,
              address: patientData.user?.profile?.address || prev.address,
              gender: patientData.user?.profile?.gender || prev.gender,
              birthYear: patientData.user?.profile?.dob 
                ? new Date(patientData.user.profile.dob).getFullYear().toString() 
                : prev.birthYear,
            }));

            // Fetch History
            const historyRes = await clinicalApi.getHistory(patientData.id);
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
            const prescriptionRes = await clinicalApi.getLatestPrescription(patientData.id);
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
  }, [isLoggedIn, user?.id, user?.role?.name]);

  const addHistory = useCallback(async (item: HistoryItem) => {
    if (!patientId) return;
    try {
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
      setMedicalHistory(prev => [item, ...prev]);
      alert('Đã lưu lịch sử khám thành công!');
    } catch (error) {
      console.error('Error adding history:', error);
      alert('Có lỗi xảy ra khi lưu lịch sử khám.');
    }
  }, [patientId]);

  const updatePrescription = useCallback(async (data: Prescription) => {
    if (!patientId) return;
    try {
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
  }, [patientId]);

  const bmi = useMemo(() => {
    if (!profile.height || profile.height <= 0) return '0.0';
    const hInM = profile.height / 100;
    return (profile.weight / (hInM * hInM)).toFixed(1);
  }, [profile.height, profile.weight]);

  const bmiStatus = useMemo(() => {
    const val = parseFloat(bmi);
    if (val <= 0) return { label: '--', color: 'text-gray-400', bg: 'bg-gray-50' };
    if (val < 18.5) return { label: 'Thiếu cân', color: 'text-blue-500', bg: 'bg-blue-50' };
    if (val < 25) return { label: 'Bình thường', color: 'text-green-600', bg: 'bg-green-50' };
    if (val < 30) return { label: 'Thừa cân', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { label: 'Nguy cơ', color: 'text-red-600', bg: 'bg-red-50' };
  }, [bmi]);

  // Scroll to top on screen change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeScreen, isLoggedIn]);

  const handleLogin = useCallback((data: any) => {
    localStorage.setItem('srhc_token', data.access_token);
    localStorage.setItem('srhc_user', JSON.stringify(data.user));
    setUser(data.user);
    setIsLoggedIn(true);
    
    // Set default screen based on role
    if (data.user?.role?.name === 'health_worker') {
      setScreen('worker-home');
    } else {
      setScreen('home');
    }

    if (data.user?.profile) {
      setProfile(prev => ({
        ...prev,
        name: `${data.user.profile.lastName} ${data.user.profile.firstName}`,
      }));
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('srhc_token');
    localStorage.removeItem('srhc_user');
    setUser(null);
    setIsLoggedIn(false);
    setScreen('login');
  }, []);

  const handleSetScreen = useCallback((s: Screen) => {
    if (hasUnsavedChanges && s !== activeScreen) {
      setPendingScreen(s);
      setShowConfirmModal(true);
    } else {
      setScreen(s);
    }
  }, [hasUnsavedChanges, activeScreen]);

  const confirmLeave = () => {
    if (pendingScreen) {
      setHasUnsavedChanges(false);
      setScreen(pendingScreen);
      setPendingScreen(null);
    }
    setShowConfirmModal(false);
  };

  const cancelLeave = () => {
    setPendingScreen(null);
    setShowConfirmModal(false);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (!isLoggedIn) {
    return (
      <AnimatePresence mode="wait">
        {activeScreen === 'login' && (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoginScreen onLogin={handleLogin} setScreen={handleSetScreen} />
          </motion.div>
        )}
        {activeScreen === 'register' && (
          <motion.div key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <RegisterScreen onRegister={handleLogin} setScreen={handleSetScreen} />
          </motion.div>
        )}
        {activeScreen === 'forgot-password' && (
          <motion.div key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ForgotPasswordScreen setScreen={handleSetScreen} />
          </motion.div>
        )}
        {!['login', 'register', 'forgot-password'].includes(activeScreen) && (
          <motion.div key="login-fallback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoginScreen onLogin={handleLogin} setScreen={handleSetScreen} />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-warm pb-20 md:pb-0 font-sans relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-light/30 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-starbucks-green/5 rounded-full blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-house-green/5 rounded-full blur-[80px] animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar activeScreen={activeScreen} setScreen={handleSetScreen} onLogout={handleLogout} user={user} />
        
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            {/* Citizen Screens */}
            {activeScreen === 'home' && (
              <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <HomeScreen setScreen={handleSetScreen} profile={profile} />
              </motion.div>
            )}
            {activeScreen === 'chat' && (
              <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ChatScreen setScreen={handleSetScreen} />
              </motion.div>
            )}
            {activeScreen === 'analysis' && (
              <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AnalysisScreen setScreen={handleSetScreen} />
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
                  userId={user?.id}
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
                <UserProfileScreen 
                  profile={profile} 
                  setProfile={setProfile} 
                  setHasUnsavedChanges={setHasUnsavedChanges} 
                  showToast={showToast}
                />
              </motion.div>
            )}
            {activeScreen === 'emergency' && (
              <motion.div key="emergency" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EmergencyScreen setScreen={handleSetScreen} />
              </motion.div>
            )}
            {activeScreen === 'request-support' && (
              <motion.div key="request-support" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <RequestSupportScreen 
                  setScreen={handleSetScreen} 
                  patientId={patientId} 
                  setHasUnsavedChanges={setHasUnsavedChanges}
                  showToast={showToast}
                  prescription={prescription}
                />
              </motion.div>
            )}
            {activeScreen === 'request-history' && (
              <motion.div key="request-history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <RequestHistoryScreen setScreen={handleSetScreen} patientId={patientId} />
              </motion.div>
            )}

            {/* Health Worker Screens */}
            {activeScreen === 'worker-home' && (
              <motion.div key="worker-home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LHWHomeScreen 
                  setScreen={handleSetScreen} 
                  user={user} 
                  setSelectedAppointment={setSelectedAppointment}
                />
              </motion.div>
            )}
            {activeScreen === 'patient-directory' && (
              <motion.div key="patient-directory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <PatientDirectoryScreen setScreen={handleSetScreen} />
              </motion.div>
            )}
            {activeScreen === 'vitals-capture' && (
              <motion.div key="vitals-capture" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <VitalsCaptureScreen setScreen={handleSetScreen} />
              </motion.div>
            )}
            {activeScreen === 'consultation-room' && (
              <motion.div key="consultation-room" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ConsultationRoomScreen 
                  setScreen={handleSetScreen} 
                  appointment={selectedAppointment}
                />
              </motion.div>
            )}
            {activeScreen === 'follow-up-monitor' && (
              <motion.div key="follow-up-monitor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FollowUpMonitorScreen setScreen={handleSetScreen} />
              </motion.div>
            )}
            {activeScreen === 'worker-profile' && (
              <motion.div key="worker-profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <WorkerProfileScreen setScreen={handleSetScreen} user={user} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <BottomNav activeScreen={activeScreen} setScreen={handleSetScreen} user={user} />

        {/* Floating Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[110] w-[90%] max-w-sm"
            >
              <div className={cn(
                "glass p-5 rounded-3xl shadow-2xl flex items-center gap-4 border-glass-border",
                toast.type === 'success' ? "border-green-100" : "border-red-100"
              )}>
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                  toast.type === 'success' ? "bg-green-50 text-starbucks-green" : "bg-red-50 text-red-500"
                )}>
                  {toast.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                </div>
                <p className="text-sm font-black text-house-green leading-snug">
                  {toast.message}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Confirmation Modal */}
        <AnimatePresence>
          {showConfirmModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-black/20 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glass rounded-[48px] p-10 max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-glass-border text-center"
              >
                <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <AlertCircle size={48} className="text-amber-500" />
                </div>
                <h3 className="text-3xl font-black text-house-green mb-4 leading-tight">Chưa lưu thông tin!</h3>
                <p className="text-gray-500 text-base mb-10 leading-relaxed">
                  Ông bà đang có thay đổi chưa được lưu lại. Nếu rời đi lúc này, những gì ông bà vừa nhập sẽ bị mất hết ạ.
                </p>
                <div className="space-y-4">
                  <button 
                    onClick={cancelLeave}
                    className="w-full py-5 bg-starbucks-green text-white rounded-[24px] font-black text-xl shadow-xl shadow-green-200 active:scale-95 transition-all"
                  >
                    Ở LẠI ĐỂ LƯU
                  </button>
                  <button 
                    onClick={confirmLeave}
                    className="w-full py-4 text-gray-400 font-bold text-base hover:text-red-500 transition-colors"
                  >
                    BỎ QUA VÀ RỜI ĐI
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
