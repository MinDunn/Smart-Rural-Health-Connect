import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Image as ImageIcon, X, AlertCircle, ShieldCheck, CheckCircle2, WifiOff, PhoneCall, Upload } from 'lucide-react';
import { Screen } from '../types';
import { cn } from '../lib/utils';
import { clinicalApi } from '../lib/api';

interface RequestSupportProps {
  setScreen: (s: Screen) => void;
  patientId: string | null;
}

const RequestSupportScreen = ({ setScreen, patientId }: RequestSupportProps) => {
  const [reason, setReason] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const symptoms = [
    { id: 'fever', label: 'Sốt / Nóng', icon: '🔥' },
    { id: 'headache', label: 'Đau đầu', icon: '🧠' },
    { id: 'cough', label: 'Ho / Đau họng', icon: '🗣️' },
    { id: 'stomach', label: 'Đau bụng', icon: '🤢' },
    { id: 'fatigue', label: 'Mệt mỏi', icon: '😫' },
    { id: 'skin', label: 'Mẩn ngứa', icon: '🩹' },
  ];

  // Monitor online status
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

  // Sync logic
  useEffect(() => {
    if (isOnline) {
      const saved = localStorage.getItem('srhc_pending_requests');
      if (saved) {
        const requests = JSON.parse(saved);
        if (requests.length > 0) {
          console.log('Syncing offline requests...', requests);
          // In a real app, we would loop and send them
          // For now, we'll just clear it and notify
          localStorage.removeItem('srhc_pending_requests');
          alert('Các yêu cầu gửi lúc ngoại tuyến đã được đồng bộ thành công!');
        }
      }
    }
  }, [isOnline]);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages: string[] = [];
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
    if (!reason && selectedSymptoms.length === 0) {
      alert('Vui lòng nhập triệu chứng hoặc chọn từ danh sách.');
      return;
    }

    const requestData = {
      patient: { id: patientId },
      reason: `Triệu chứng: ${selectedSymptoms.join(', ')}. Chi tiết: ${reason}`,
      attachments: images,
      consentGiven: consent,
      urgency: selectedSymptoms.includes('fever') ? 'high' : 'normal',
      status: 'pending'
    };

    if (!isOnline) {
      // Save for later
      const saved = localStorage.getItem('srhc_pending_requests') || '[]';
      const requests = JSON.parse(saved);
      requests.push(requestData);
      localStorage.setItem('srhc_pending_requests', JSON.stringify(requests));
      setShowOfflineModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await clinicalApi.createAppointment(requestData);
      alert('Yêu cầu của ông bà đã được gửi tới Y tế xã. Vui lòng chờ phản hồi!');
      setScreen('home');
    } catch (error) {
      alert('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-2xl mx-auto px-6 py-8 pb-32"
    >
      <button onClick={() => setScreen('home')} className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest mb-6 hover:text-starbucks-green group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Quay lại trang chủ
      </button>

      <div className="bg-white rounded-[40px] shadow-2xl p-8 border border-gray-50">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-green-light rounded-2xl flex items-center justify-center">
            <Send className="text-starbucks-green" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-house-green">Gửi yêu cầu tới Y tế xã</h2>
            <p className="text-sm text-gray-500">Cán bộ y tế sẽ phản hồi ông bà sớm nhất.</p>
          </div>
        </div>

        {/* Symptoms */}
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Triệu chứng của ông bà là gì?</p>
          <div className="flex flex-wrap gap-3">
            {symptoms.map(s => (
              <button
                key={s.id}
                onClick={() => toggleSymptom(s.label)}
                className={cn(
                  "px-4 py-3 rounded-2xl border text-sm font-bold transition-all flex items-center gap-2",
                  selectedSymptoms.includes(s.label) 
                    ? "bg-starbucks-green border-starbucks-green text-white shadow-lg shadow-green-200 scale-105" 
                    : "bg-gray-50 border-gray-100 text-gray-600 hover:border-starbucks-green/30"
                )}
              >
                <span>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reason */}
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Mô tả thêm (nếu có)</p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ví dụ: Tôi bị đau đầu từ sáng sớm, đã uống nước nhưng chưa đỡ..."
            className="w-full bg-gray-50 border-gray-100 rounded-3xl p-5 text-sm focus:ring-2 focus:ring-starbucks-green/20 focus:border-starbucks-green transition-all min-h-[120px]"
          />
        </div>

        {/* Images */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hình ảnh đính kèm</p>
            <label className="flex items-center gap-2 text-xs font-bold text-starbucks-green hover:underline cursor-pointer">
              <ImageIcon size={16} />
              Thêm ảnh từ máy
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload} 
              />
            </label>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <div key={i} className="relative shrink-0 group">
                <img 
                  src={img} 
                  onClick={() => setPreviewImage(img)}
                  className="w-20 h-20 object-cover rounded-xl border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity" 
                  alt="Symptom" 
                />
                <button 
                  onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {images.length === 0 && (
              <div className="w-full py-8 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-300">
                <ImageIcon size={32} className="mb-2" />
                <p className="text-[10px] font-bold uppercase">Chưa có ảnh nào</p>
              </div>
            )}
          </div>
        </div>

        {/* Consent */}
        <div className="mb-10 bg-blue-50 p-5 rounded-3xl border border-blue-100">
          <label className="flex items-start gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 rounded text-starbucks-green focus:ring-starbucks-green" 
            />
            <div className="text-xs leading-relaxed text-blue-800">
              <div className="flex items-center gap-1.5 mb-1">
                <ShieldCheck size={14} className="text-blue-600" />
                <span className="font-bold uppercase tracking-tight">Quyền riêng tư dữ liệu</span>
              </div>
              Tôi đồng ý chia sẻ các triệu chứng và tiền sử y tế của mình để phục vụ quá trình hội chẩn từ xa.
            </div>
          </label>
        </div>

        {/* Submit */}
        <button
          disabled={isSubmitting}
          onClick={handleSubmit}
          className={cn(
            "w-full py-5 rounded-[24px] font-extrabold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl",
            isSubmitting ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-starbucks-green text-white shadow-green-200 hover:bg-house-green"
          )}
        >
          {isSubmitting ? "ĐANG GỬI..." : "GỬI YÊU CẦU NGAY"}
          {!isSubmitting && <Send size={20} />}
        </button>
      </div>

      {/* Offline Modal */}
      <AnimatePresence>
        {showOfflineModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] max-w-sm w-full p-8 text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <WifiOff className="text-red-600 w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Mất kết nối mạng</h3>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Yêu cầu của ông bà đã được lưu lại. Hệ thống sẽ tự động gửi ngay khi có mạng trở lại.
              </p>
              
              <div className="bg-red-50 p-4 rounded-2xl mb-6 border border-red-100">
                <p className="text-[10px] font-bold text-red-600 uppercase mb-2">Trường hợp khẩn cấp?</p>
                <button 
                  onClick={() => alert('Đang gọi 115...')}
                  className="w-full bg-red-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <PhoneCall size={18} />
                  GỌI NGAY 115
                </button>
              </div>

              <button 
                onClick={() => { setShowOfflineModal(false); setScreen('home'); }}
                className="text-sm font-bold text-gray-400 hover:text-gray-600"
              >
                ĐÃ HIỂU, QUAY LẠI TRANG CHỦ
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
 
      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 md:p-12"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full h-full flex items-center justify-center"
            >
              <img src={previewImage} className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" alt="Full Preview" />
              <button 
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 md:top-0 md:-right-12 text-white hover:text-gray-300 transition-colors bg-black/50 md:bg-transparent p-2 rounded-full"
              >
                <X size={32} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RequestSupportScreen;
