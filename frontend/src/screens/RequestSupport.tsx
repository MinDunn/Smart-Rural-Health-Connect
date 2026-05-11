import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Send, Image as ImageIcon, X, AlertCircle, ShieldCheck, 
  CheckCircle2, WifiOff, PhoneCall, Stethoscope, ClipboardList, 
  Upload, Calendar, Clock, MapPin, Info, Activity, Pill, Camera,
  Mic, Volume2, Square, Play, Pause, Trash2, History as HistoryIcon
} from 'lucide-react';
import { Screen } from '../types';
import { cn } from '../lib/utils';
import { clinicalApi } from '../lib/api';

interface RequestSupportProps {
  setScreen: (s: Screen) => void;
  patientId: string | null;
  setHasUnsavedChanges: (val: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const RequestSupportScreen = ({ setScreen, patientId, setHasUnsavedChanges, showToast }: RequestSupportProps) => {
  const [supportType, setSupportType] = useState<'general' | 'prescription' | 'urgent'>('general');
  const [reason, setReason] = useState('');
  const [medication, setMedication] = useState('');
  const [duration, setDuration] = useState('today');
  const [daysCount, setDaysCount] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Track unsaved changes
  useEffect(() => {
    const isDirty = reason !== '' || medication !== '' || selectedSymptoms.length > 0 || images.length > 0 || audioUrl !== null;
    setHasUnsavedChanges(isDirty);
    return () => setHasUnsavedChanges(false);
  }, [reason, medication, selectedSymptoms, images, audioUrl, setHasUnsavedChanges]);

  const supportTypes = [
    { id: 'general', label: 'Tư vấn chung', desc: 'Hỏi đáp sức khỏe', icon: Stethoscope, color: 'bg-blue-500', theme: 'blue' },
    { id: 'prescription', label: 'Cấp đơn thuốc', desc: 'Gia hạn đơn thuốc', icon: ClipboardList, color: 'bg-orange-500', theme: 'orange' },
    { id: 'urgent', label: 'Cần hỗ trợ gấp', desc: 'Liên hệ bác sĩ ngay', icon: AlertCircle, color: 'bg-red-500', theme: 'red' },
  ];

  const symptoms = [
    { id: 'fever', label: 'Sốt / Nóng', icon: '🔥' },
    { id: 'headache', label: 'Đau đầu', icon: '🧠' },
    { id: 'dizzy', label: 'Chóng mặt', icon: '🌀' },
    { id: 'cough', label: 'Ho / Đau họng', icon: '🗣️' },
    { id: 'stomach', label: 'Đau bụng', icon: '🤢' },
    { id: 'chest', label: 'Đau ngực', icon: '🫀' },
    { id: 'breath', label: 'Khó thở', icon: '🌬️' },
    { id: 'fatigue', label: 'Mệt mỏi', icon: '😫' },
    { id: 'joint', label: 'Đau khớp / Lưng', icon: '🦴' },
    { id: 'insomnia', label: 'Mất ngủ', icon: '😴' },
    { id: 'numb', label: 'Tê bì tay chân', icon: '🦶' },
    { id: 'skin', label: 'Mẩn ngứa', icon: '🩹' },
    { id: 'bp', label: 'Huyết áp cao', icon: '📈' },
    { id: 'sugar', label: 'Đường huyết cao', icon: '🍭' },
  ];

  const durationOptions = [
    { id: 'today', label: 'Mới bị (Hôm nay)', icon: Clock },
    { id: 'few_days', label: '2-3 ngày nay', icon: Calendar },
    { id: 'long_term', label: 'Đã lâu / Mãn tính', icon: Activity },
  ];

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleSymptom = (label: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
    );
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Convert to base64 to include in requestData if needed
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // You could add this to a separate audio state or attachments
        };
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      alert('Vui lòng cho phép ứng dụng truy cập Micro để ghi âm.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = async () => {
    if (!consent) {
      alert('Vui lòng đồng ý với điều khoản bảo mật dữ liệu.');
      return;
    }
    
    if (supportType !== 'prescription' && selectedSymptoms.length === 0 && !reason) {
      alert('Vui lòng chọn triệu chứng hoặc mô tả tình trạng của ông bà.');
      return;
    }

    const durationText = daysCount 
      ? `${daysCount} ngày` 
      : (durationOptions.find(d => d.id === duration)?.label || 'Không xác định');

    const requestData = {
      patient: { id: patientId },
      reason: `[${supportType.toUpperCase()}] ${supportType === 'prescription' ? 'YÊU CẦU CẤP ĐƠN THUỐC' : `Triệu chứng: ${selectedSymptoms.join(', ')}`}. Thời gian: ${durationText}. Thuốc đang dùng: ${medication}. Chi tiết: ${reason}`,
      attachments: images,
      consentGiven: consent,
      urgency: supportType === 'urgent' ? 'high' : 'normal',
      status: 'pending'
    };

    if (!isOnline) {
      const savedRaw = localStorage.getItem('srhc_pending_requests');
      let requests = [];
      if (savedRaw && savedRaw !== "undefined") {
        try {
          requests = JSON.parse(savedRaw);
        } catch (e) {
          console.error("Error parsing requests", e);
        }
      }
      requests.push(requestData);
      localStorage.setItem('srhc_pending_requests', JSON.stringify(requests));
      setHasUnsavedChanges(false);
      setShowOfflineModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await clinicalApi.createAppointment(requestData);
      setHasUnsavedChanges(false);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      alert('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlaceholder = () => {
    switch (supportType) {
      case 'prescription': return "Ví dụ: Tôi cần gia hạn đơn thuốc huyết áp tháng trước, tên thuốc là Amlodipin...";
      case 'urgent': return "Hãy mô tả ngay tình trạng khẩn cấp của ông bà tại đây để bác sĩ ứng cứu kịp thời...";
      default: return "Ông bà hãy kể chi tiết hơn về tình trạng sức khỏe tại đây để bác sĩ nắm rõ nhất...";
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white rounded-[48px] p-10 md:p-12 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 text-center space-y-8"
        >
          <div className="w-28 h-28 bg-green-50 rounded-full flex items-center justify-center mx-auto shadow-inner relative">
            <div className="absolute inset-0 bg-starbucks-green/5 animate-ping rounded-full" />
            <CheckCircle2 className="text-starbucks-green w-14 h-14 relative z-10" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-house-green tracking-tight">Gửi thành công!</h2>
            <p className="text-gray-500 text-base leading-relaxed">
              Yêu cầu của ông bà đã được chuyển tới Trạm Y tế xã. Bác sĩ sẽ phản hồi sớm nhất có thể.
            </p>
          </div>

          <div className="bg-green-light/30 p-6 rounded-3xl flex items-center gap-5 text-left border border-green-light">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <Clock className="text-starbucks-green" size={28} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Thời gian chờ</p>
              <p className="text-xl font-black text-house-green">Dưới 30 phút</p>
            </div>
          </div>

          <button
            onClick={() => setScreen('home')}
            className="w-full py-5 bg-starbucks-green text-white rounded-[24px] font-black text-xl shadow-xl shadow-green-200 hover:bg-house-green transition-all active:scale-95"
          >
            QUAY VỀ TRANG CHỦ
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="max-w-7xl mx-auto px-6 md:px-12 py-10 pb-32"
    >
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-house-green tracking-tight">Gửi yêu cầu hỗ trợ</h1>
          <div className="flex items-center gap-4">
            <p className="text-lg text-gray-500 max-w-xl">
              Cán bộ y tế xã luôn sẵn sàng tư vấn và hỗ trợ ông bà mọi lúc, mọi nơi.
            </p>
            <button 
              onClick={() => setScreen('request-history')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-starbucks-green hover:text-white transition-all shadow-sm"
            >
              <HistoryIcon size={14} />
              Xem lịch sử
            </button>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
            <PhoneCall className="text-orange-600" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Trực ban 24/7</p>
            <p className="text-lg font-black text-house-green">024.123.4567</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">
        {/* Main Content Area */}
        <div className="space-y-10">
          {/* Card 1: Support Type */}
          <section className="bg-white rounded-[48px] p-10 border border-gray-50 shadow-xl shadow-gray-200/40 space-y-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-light rounded-xl flex items-center justify-center font-black text-starbucks-green shadow-sm">1</div>
                <h2 className="text-2xl font-bold text-house-green">Ông bà đang cần hỗ trợ về việc gì?</h2>
              </div>
              <button 
                onClick={() => handleSpeak("Ông bà đang cần hỗ trợ về việc gì? Tư vấn chung, Cấp đơn thuốc, hay Cần hỗ trợ gấp?")}
                className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center hover:bg-starbucks-green hover:text-white transition-all shadow-sm group"
                title="Đọc hướng dẫn"
              >
                <Volume2 size={24} className="group-active:scale-90" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {supportTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setSupportType(type.id as any);
                    if (type.id === 'prescription') {
                      setSelectedSymptoms([]);
                      setDuration('');
                      setDaysCount('');
                    }
                  }}
                  className={cn(
                    "p-6 rounded-[32px] border-2 text-left transition-all relative overflow-hidden group",
                    supportType === type.id 
                      ? "border-starbucks-green bg-green-light/30 shadow-md" 
                      : "border-gray-50 bg-gray-50/50 hover:border-gray-200 hover:bg-white"
                  )}
                >
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg transition-transform group-hover:scale-110", type.color)}>
                    <type.icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-house-green mb-1">{type.label}</h3>
                  <p className="text-xs text-gray-500 leading-snug">{type.desc}</p>
                  {supportType === type.id && (
                    <div className="absolute top-6 right-6">
                      <div className="w-6 h-6 bg-starbucks-green rounded-full flex items-center justify-center">
                        <CheckCircle2 className="text-white" size={16} />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Adaptive Content based on supportType */}
          <AnimatePresence mode="wait">
            {supportType !== 'prescription' ? (
              <motion.div
                key="clinical-info"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                {/* Emergency Warning */}
                {supportType === 'urgent' && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-[32px] p-6 flex items-center gap-6">
                    <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white shrink-0 animate-pulse">
                      <AlertCircle size={32} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-red-600 uppercase italic">Cảnh báo khẩn cấp!</h3>
                      <p className="text-red-700 font-medium leading-snug">
                        Yêu cầu này sẽ được ưu tiên xử lý ngay. Nếu thấy đe dọa tính mạng, gọi ngay <span className="font-black text-2xl">115</span>.
                      </p>
                    </div>
                  </div>
                )}

                {/* Card 2: Symptoms */}
                <section className="bg-white rounded-[48px] p-10 border border-gray-50 shadow-xl shadow-gray-200/40 space-y-8">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-light rounded-xl flex items-center justify-center font-black text-starbucks-green shadow-sm">2</div>
                      <h2 className="text-2xl font-bold text-house-green">Hãy chọn các triệu chứng hiện tại</h2>
                    </div>
                    <button 
                      onClick={() => handleSpeak("Hãy chọn các triệu chứng hiện tại của ông bà, như là: Sốt, đau đầu, chóng mặt, ho, hay mệt mỏi.")}
                      className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center hover:bg-starbucks-green hover:text-white transition-all shadow-sm"
                    >
                      <Volume2 size={24} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {symptoms.map(s => (
                      <button
                        key={s.id}
                        onClick={() => toggleSymptom(s.label)}
                        className={cn(
                          "px-6 py-4 rounded-2xl border-2 text-sm font-bold transition-all flex items-center gap-3",
                          selectedSymptoms.includes(s.label) 
                            ? "bg-starbucks-green border-starbucks-green text-white shadow-lg shadow-green-100 scale-105" 
                            : "bg-white border-gray-100 text-gray-500 hover:border-starbucks-green/30 hover:text-starbucks-green"
                        )}
                      >
                        <span className="text-2xl">{s.icon}</span>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Card 3: Duration & Meds */}
                <section className="bg-white rounded-[48px] p-10 border border-gray-50 shadow-xl shadow-gray-200/40 space-y-10">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-light rounded-xl flex items-center justify-center font-black text-starbucks-green shadow-sm">3</div>
                      <h2 className="text-2xl font-bold text-house-green">Thời gian & Tiền sử dùng thuốc</h2>
                    </div>
                    <button 
                      onClick={() => handleSpeak("Ông bà bị tình trạng này từ bao giờ? Và ông bà có đang dùng thuốc gì không?")}
                      className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center hover:bg-starbucks-green hover:text-white transition-all shadow-sm"
                    >
                      <Volume2 size={24} />
                    </button>
                  </div>
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ông bà bị tình trạng này từ bao giờ?</p>
                      <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 pl-2">Hoặc nhập số ngày:</span>
                        <input 
                          type="number" 
                          value={daysCount}
                          onChange={(e) => {
                            setDaysCount(e.target.value);
                            if (e.target.value) setDuration('');
                          }}
                          placeholder="0"
                          className="w-16 bg-white border-none rounded-xl py-1 px-2 text-center font-bold text-house-green focus:ring-2 focus:ring-starbucks-green/20"
                        />
                        <span className="text-xs font-bold text-gray-500 pr-2">ngày</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {durationOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => { setDuration(opt.id); setDaysCount(''); }}
                          className={cn(
                            "p-5 rounded-2xl border-2 flex items-center gap-4 transition-all",
                            duration === opt.id ? "border-starbucks-green bg-green-light/30" : "border-gray-50 bg-gray-50/30 hover:border-gray-200"
                          )}
                        >
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", duration === opt.id ? "bg-starbucks-green text-white" : "bg-white text-gray-400")}>
                            <opt.icon size={20} />
                          </div>
                          <span className={cn("font-bold text-sm", duration === opt.id ? "text-house-green" : "text-gray-500")}>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                      <Pill size={14} className="text-orange-400" />
                      Các loại thuốc đang dùng (nếu có)
                    </div>
                    <textarea
                      value={medication}
                      onChange={(e) => setMedication(e.target.value)}
                      placeholder="Ví dụ: Đang uống thuốc huyết áp Amlodipin, thuốc tiểu đường..."
                      className="w-full bg-gray-50/50 border-2 border-gray-50 rounded-[24px] p-6 text-lg focus:bg-white focus:ring-4 focus:ring-starbucks-green/5 focus:border-starbucks-green transition-all min-h-[120px] resize-none outline-none shadow-inner"
                    />
                  </div>
                </section>
              </motion.div>
            ) : (
              <motion.div
                key="prescription-info"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                <section className="bg-orange-50/30 rounded-[48px] p-10 border-2 border-orange-100 shadow-xl shadow-orange-100/20 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                      <Pill size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-house-green">Thông tin đơn thuốc cần cấp</h2>
                      <p className="text-sm text-gray-500">Ông bà vui lòng cung cấp thông tin đơn thuốc cũ bên dưới.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tên thuốc hoặc ghi chú thêm</p>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Ví dụ: Tôi cần cấp lại đơn thuốc huyết áp tháng trước..."
                        className="w-full bg-white border-2 border-orange-50 rounded-[32px] p-8 text-lg focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all min-h-[200px] resize-none outline-none shadow-sm"
                      />
                    </div>
                    
                    <div className="bg-white p-8 rounded-[32px] border border-orange-50 shadow-sm space-y-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Camera className="text-orange-500" size={20} />
                          <p className="text-sm font-bold text-house-green uppercase tracking-tight">Chụp ảnh đơn thuốc cũ (Rất quan trọng)</p>
                        </div>
                        <label className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl text-xs font-black cursor-pointer hover:bg-orange-600 transition-all shadow-md">
                          <Upload size={16} />
                          CHỤP / TẢI ẢNH
                          <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                      </div>
                      <p className="text-xs text-gray-400 italic">Việc chụp ảnh đơn thuốc sẽ giúp bác sĩ kiểm tra thông tin nhanh hơn.</p>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Card 4: Description & Images (Only shown for non-prescription as it's handled above) */}
          {supportType !== 'prescription' && (
            <section className="bg-white rounded-[48px] p-10 border border-gray-50 shadow-xl shadow-gray-200/40 space-y-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-light rounded-xl flex items-center justify-center font-black text-starbucks-green shadow-sm">4</div>
                  <h2 className="text-2xl font-bold text-house-green">Mô tả thêm & Gửi ảnh</h2>
                </div>
                <button 
                  onClick={() => handleSpeak("Ông bà hãy kể chi tiết hơn về tình trạng sức khỏe, hoặc nhấn nút micro để ghi âm giọng nói của mình.")}
                  className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center hover:bg-starbucks-green hover:text-white transition-all shadow-sm"
                >
                  <Volume2 size={24} />
                </button>
              </div>
                <div className="relative group">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={getPlaceholder()}
                  className="w-full bg-gray-50/50 border-2 border-gray-50 rounded-[32px] p-8 text-lg focus:bg-white focus:ring-4 focus:ring-starbucks-green/5 focus:border-starbucks-green transition-all min-h-[180px] resize-none outline-none shadow-inner pr-24"
                />
                <div className="absolute top-6 right-6 flex flex-col gap-3">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="w-14 h-14 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-blue-600 transition-all active:scale-95"
                      title="Ghi âm giọng nói"
                    >
                      <Mic size={28} />
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="w-14 h-14 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg animate-pulse"
                      title="Dừng ghi âm"
                    >
                      <Square size={28} />
                    </button>
                  )}
                </div>
              </div>

              {audioUrl && (
                <div className="bg-blue-50 p-6 rounded-[24px] border border-blue-100 flex items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center">
                      <Mic size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Đã ghi âm giọng nói</p>
                      <p className="text-sm font-bold text-blue-900 italic">Bác sĩ sẽ nghe thấy lời nhắn này của ông bà.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <audio src={audioUrl} controls className="h-10 w-48" />
                    <button 
                      onClick={() => setAudioUrl(null)}
                      className="w-10 h-10 bg-white text-red-500 rounded-xl flex items-center justify-center hover:bg-red-50 shadow-sm"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hình ảnh đính kèm ({images.length})</p>
                  <label className="flex items-center gap-2 px-6 py-3 bg-green-light text-starbucks-green rounded-2xl text-sm font-black cursor-pointer hover:bg-starbucks-green hover:text-white transition-all shadow-sm">
                    <Upload size={18} />
                    CHỌN ẢNH TỪ MÁY
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {images.map((img, i) => (
                    <div key={i} className="relative aspect-square group">
                      <img src={img} onClick={() => setPreviewImage(img)} className="w-full h-full object-cover rounded-[20px] border border-gray-100 cursor-pointer shadow-md transition-transform group-hover:scale-105" alt="Symptom" />
                      <button onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110"><X size={14} /></button>
                    </div>
                  ))}
                  <label className="aspect-square border-3 border-dashed border-gray-100 rounded-[20px] flex flex-col items-center justify-center text-gray-300 hover:border-starbucks-green/30 hover:text-starbucks-green/30 cursor-pointer transition-all bg-gray-50/30">
                    <ImageIcon size={28} />
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>
            </section>
          )}

          {/* Images for Prescription (if any images uploaded in adaptive card) */}
          {supportType === 'prescription' && images.length > 0 && (
             <section className="bg-white rounded-[48px] p-10 border border-gray-50 shadow-xl shadow-gray-200/40 space-y-6">
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ảnh đơn thuốc đã tải lên ({images.length})</p>
               <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                  {images.map((img, i) => (
                    <div key={i} className="relative aspect-square group">
                      <img src={img} onClick={() => setPreviewImage(img)} className="w-full h-full object-cover rounded-[20px] border border-gray-100 cursor-pointer shadow-md" alt="Prescription" />
                      <button onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                    </div>
                  ))}
               </div>
             </section>
          )}
        </div>

        {/* Sidebar Info & Submit */}
        <div className="space-y-6 sticky top-28">
          <div className={cn(
            "rounded-[40px] p-8 shadow-2xl space-y-8 relative overflow-hidden transition-colors duration-500",
            supportType === 'urgent' ? "bg-red-700" : supportType === 'prescription' ? "bg-orange-600" : "bg-house-green"
          )}>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="text-green-300" size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">Xác nhận gửi đi</h3>
              </div>
              <p className="text-sm text-green-50/70 leading-relaxed">
                Mọi thông tin ông bà cung cấp sẽ được mã hóa và chỉ bác sĩ tại Trạm Y tế xã mới có quyền truy cập.
              </p>
              <label className="flex items-start gap-4 cursor-pointer group p-4 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="w-6 h-6 mt-0.5 rounded-lg text-starbucks-green border-white/20 bg-white/10 focus:ring-starbucks-green transition-all" />
                <span className="text-sm font-medium text-white/90 leading-tight">Tôi đồng ý chia sẻ thông tin để được hỗ trợ y tế.</span>
              </label>
              <button disabled={isSubmitting || !consent} onClick={handleSubmit} className={cn("w-full py-6 rounded-[32px] font-black text-xl flex items-center justify-center gap-4 transition-all active:scale-[0.98] shadow-2xl", isSubmitting || !consent ? "bg-white/10 text-white/20 cursor-not-allowed" : "bg-starbucks-green text-white hover:bg-white hover:text-starbucks-green")}>
                {isSubmitting ? "ĐANG GỬI..." : "GỬI YÊU CẦU"}
                {!isSubmitting && <Send size={24} />}
              </button>
            </div>
          </div>
          <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-lg space-y-6">
            <h4 className="font-bold text-house-green flex items-center gap-2"><Info size={18} className="text-starbucks-green" /> Thông tin Trạm Y tế</h4>
            <div className="space-y-4">
              <div className="flex gap-3"><MapPin className="text-gray-400 shrink-0" size={18} /><p className="text-sm text-gray-500">Số 12, Đường Lê Lợi, Xã Yên Bình</p></div>
              <div className="flex gap-3"><Clock className="text-gray-400 shrink-0" size={18} /><p className="text-sm text-gray-500">Làm việc 24/7 (Trực cấp cứu)</p></div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showOfflineModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[48px] max-w-sm w-full p-10 text-center shadow-2xl">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"><WifiOff className="text-red-600 w-12 h-12" /></div>
              <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Mất kết nối</h3>
              <p className="text-gray-500 mb-10 leading-relaxed">Yêu cầu của ông bà đã được lưu lại an toàn. Chúng tôi sẽ tự động gửi ngay khi có mạng trở lại.</p>
              <div className="bg-red-50 p-6 rounded-[32px] mb-8 border border-red-100"><p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-4">Khẩn cấp?</p><button onClick={() => alert('Đang gọi 115...')} className="w-full bg-red-600 text-white py-5 rounded-[24px] font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-red-200 active:scale-95 transition-all"><PhoneCall size={24} />GỌI NGAY 115</button></div>
              <button onClick={() => { setShowOfflineModal(false); setScreen('home'); }} className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">ĐÃ HIỂU, VỀ TRANG CHỦ</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
 
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[60] flex items-center justify-center p-4 md:p-16" onClick={() => setPreviewImage(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative max-w-6xl w-full h-full flex items-center justify-center">
              <img src={previewImage} className="max-w-full max-h-full object-contain shadow-[0_0_80px_rgba(0,0,0,0.6)] rounded-3xl" alt="Full Preview" />
              <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 md:top-0 md:-right-20 text-white hover:text-gray-300 transition-all bg-white/10 p-4 rounded-full hover:scale-110"><X size={36} /></button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RequestSupportScreen;
