import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Calendar, Pill, Tablets, Bell, ChevronRight } from 'lucide-react';
import { Screen, HistoryItem, Prescription, Medication } from '../types';

interface MedicalRecordsProps {
  history: HistoryItem[];
  onAddHistory: (item: HistoryItem) => void;
  prescription: Prescription;
  onUpdatePrescription: (data: Prescription) => void;
  patientId: string | null;
}

const MedicalRecordsScreen = ({ 
  history, 
  onAddHistory, 
  prescription, 
  onUpdatePrescription,
  patientId 
}: MedicalRecordsProps) => {
  const [showHistoryForm, setShowHistoryForm] = useState(false);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);

  // History Form State
  const [newHistory, setNewHistory] = useState<HistoryItem>({
    date: '', month: '', year: '', title: '', hospital: '', doctor: '', result: ''
  });

  // Prescription Form State
  const [newPrescription, setNewPrescription] = useState<Prescription>(prescription);
  const [newMed, setNewMed] = useState<Medication>({ name: '', timing: 'Sáng', dosage: '1 viên' });

  const handleAddHistory = () => {
    onAddHistory(newHistory);
    setShowHistoryForm(false);
    setNewHistory({ date: '', month: '', year: '', title: '', hospital: '', doctor: '', result: '' });
  };

  const handleUpdatePrescription = () => {
    onUpdatePrescription(newPrescription);
    setShowPrescriptionForm(false);
  };

  const addMedication = () => {
    if (newMed.name) {
      setNewPrescription({
        ...newPrescription,
        medications: [...newPrescription.medications, newMed]
      });
      setNewMed({ name: '', timing: 'Sáng', dosage: '1 viên' });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-7xl mx-auto px-6 md:px-12 py-12 pb-32 space-y-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-house-green mb-2">Hồ sơ y tế</h2>
          <p className="text-gray-500">Lịch sử khám bệnh và đơn thuốc được lưu trữ tại đây.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowHistoryForm(true)}
            className="px-6 py-3 bg-starbucks-green text-white rounded-2xl text-sm font-bold shadow-lg shadow-green-900/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <ClipboardList size={18} /> Thêm kết quả khám
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Exam History */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-house-green flex items-center gap-2">
            <Calendar size={20} className="text-starbucks-green" /> Lịch sử khám bệnh
          </h3>
          
          {history.map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-[32px] card-shadow flex flex-col md:flex-row gap-6 hover:scale-[1.01] transition-all cursor-pointer border border-gray-50">
              <div className="bg-green-light min-w-[100px] h-24 rounded-2xl flex flex-col items-center justify-center p-4 text-starbucks-green font-bold shrink-0 shadow-sm border border-starbucks-green/5">
                <span className="text-3xl leading-none">{item.date}</span>
                <span className="text-[10px] uppercase text-center mt-1">{item.month}</span>
                <span className="text-[10px] opacity-50">{item.year}</span>
              </div>
              <div className="flex-grow">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-[9px] font-bold px-2 py-1 bg-gray-100 text-gray-500 rounded uppercase tracking-wider">{item.hospital}</span>
                </div>
                <h4 className="text-xl font-bold text-house-green mb-1">{item.title}</h4>
                <p className="text-sm text-gray-600 mb-2 font-medium">Bác sĩ: {item.doctor}</p>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500"><span className="font-bold text-gray-700">Kết luận:</span> {item.result}</p>
                </div>
              </div>
              <div className="self-center flex flex-col gap-2">
                <button className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-starbucks-green transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Prescription */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-house-green flex items-center gap-2">
              <Pill size={20} className="text-starbucks-green" /> Đơn thuốc gần nhất
            </h3>
            <button 
              onClick={() => {
                setNewPrescription(prescription);
                setShowPrescriptionForm(true);
              }}
              className="text-xs font-bold text-starbucks-green hover:underline"
            >
              Cập nhật đơn
            </button>
          </div>
          
          <div className="bg-white rounded-[40px] card-shadow overflow-hidden border border-gray-50">
            <div className="bg-starbucks-green p-8 text-white">
              <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-2">MÃ ĐƠN: {prescription.id}</p>
              <h4 className="text-2xl font-bold">{prescription.title}</h4>
              <p className="text-xs mt-1 text-white/80 italic">Cấp ngày {prescription.date} bởi {prescription.doctor}</p>
            </div>
            <div className="p-8 space-y-6">
              {prescription.medications.map((med: any, i: number) => (
                <div key={i} className="flex items-center gap-4 border-b border-gray-50 pb-5 last:border-0 last:pb-0">
                  <div className="w-12 h-12 bg-green-light rounded-2xl flex items-center justify-center shrink-0">
                    <Tablets className="text-starbucks-green w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-base text-house-green">{med.name}</p>
                    <p className="text-xs text-gray-400">Uống {med.dosage} sau ăn {med.timing}</p>
                  </div>
                </div>
              ))}
              <div className="pt-4 space-y-3">
                <button className="w-full bg-white text-starbucks-green border-2 border-green-light py-5 rounded-3xl font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-green-50 transition-all">
                  XEM CHI TIẾT ĐƠN
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#faf6ee] p-6 rounded-[32px] border border-[#dfc49d] flex gap-4 shadow-sm">
            <Bell className="text-[#cba258] shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-house-green mb-1 uppercase tracking-tight">Cần lưu ý!</h4>
              <p className="text-xs text-gray-600 leading-relaxed">Hãy nhớ tái khám đúng hẹn vào ngày <span className="font-bold text-red-600">12/06/2026</span> tại Trạm y tế khu vực.</p>
            </div>
          </div>
        </div>
      </div>

      {/* History Form Modal */}
      <AnimatePresence>
        {showHistoryForm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
              onClick={() => setShowHistoryForm(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl p-8 relative z-10 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-2xl font-bold text-house-green mb-6">Thêm lịch sử khám</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Ngày</label>
                    <input type="text" placeholder="12" value={newHistory.date} onChange={e => setNewHistory({...newHistory, date: e.target.value})} className="w-full bg-gray-50 border-gray-100 rounded-xl py-3 px-4 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tháng (vd: Tháng 03)</label>
                    <input type="text" placeholder="Tháng 03" value={newHistory.month} onChange={e => setNewHistory({...newHistory, month: e.target.value})} className="w-full bg-gray-50 border-gray-100 rounded-xl py-3 px-4 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Năm</label>
                    <input type="text" placeholder="2026" value={newHistory.year} onChange={e => setNewHistory({...newHistory, year: e.target.value})} className="w-full bg-gray-50 border-gray-100 rounded-xl py-3 px-4 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tên đợt khám</label>
                  <input type="text" placeholder="Kiểm tra tổng quát" value={newHistory.title} onChange={e => setNewHistory({...newHistory, title: e.target.value})} className="w-full bg-gray-50 border-gray-100 rounded-xl py-3 px-4 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cơ sở y tế</label>
                  <input type="text" placeholder="Trạm y tế Phường" value={newHistory.hospital} onChange={e => setNewHistory({...newHistory, hospital: e.target.value})} className="w-full bg-gray-50 border-gray-100 rounded-xl py-3 px-4 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Bác sĩ</label>
                  <input type="text" placeholder="BS. Lê Mạnh Hùng" value={newHistory.doctor} onChange={e => setNewHistory({...newHistory, doctor: e.target.value})} className="w-full bg-gray-50 border-gray-100 rounded-xl py-3 px-4 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Kết luận</label>
                  <textarea rows={3} placeholder="Mô tả kết quả..." value={newHistory.result} onChange={e => setNewHistory({...newHistory, result: e.target.value})} className="w-full bg-gray-50 border-gray-100 rounded-xl py-3 px-4 text-sm" />
                </div>
                <button 
                  onClick={handleAddHistory}
                  className="w-full bg-starbucks-green text-white py-4 rounded-3xl font-bold shadow-lg shadow-green-900/20 active:scale-95 transition-all mt-4"
                >
                  Lưu hồ sơ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Prescription Form Modal */}
      <AnimatePresence>
        {showPrescriptionForm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
              onClick={() => setShowPrescriptionForm(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl p-8 relative z-10 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-2xl font-bold text-house-green mb-6">Cập nhật đơn thuốc</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Mã đơn</label>
                  <input type="text" value={newPrescription.id} onChange={e => setNewPrescription({...newPrescription, id: e.target.value})} className="w-full bg-gray-50 border-gray-100 rounded-xl py-3 px-4 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tên đơn thuốc</label>
                  <input type="text" value={newPrescription.title} onChange={e => setNewPrescription({...newPrescription, title: e.target.value})} className="w-full bg-gray-50 border-gray-100 rounded-xl py-3 px-4 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Ngày cấp</label>
                    <input type="text" value={newPrescription.date} onChange={e => setNewPrescription({...newPrescription, date: e.target.value})} className="w-full bg-gray-50 border-gray-100 rounded-xl py-3 px-4 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Bác sĩ cấp</label>
                    <input type="text" value={newPrescription.doctor} onChange={e => setNewPrescription({...newPrescription, doctor: e.target.value})} className="w-full bg-gray-50 border-gray-100 rounded-xl py-3 px-4 text-sm" />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <label className="block text-xs font-bold text-house-green mb-3 uppercase">Danh sách thuốc</label>
                  <div className="space-y-3 mb-4">
                    {newPrescription.medications.map((m: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-sm font-bold">{m.name} ({m.timing}, {m.dosage})</span>
                        <button onClick={() => setNewPrescription({...newPrescription, medications: newPrescription.medications.filter((_: any, idx: number) => idx !== i)})} className="text-red-500 text-xs">Xóa</button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-green-light/30 p-4 rounded-2xl space-y-3">
                    <input type="text" placeholder="Tên thuốc" value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} className="w-full bg-white border-gray-100 rounded-xl py-2 px-3 text-sm" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Thời điểm (vd: Sáng)" value={newMed.timing} onChange={e => setNewMed({...newMed, timing: e.target.value})} className="w-full bg-white border-gray-100 rounded-xl py-2 px-3 text-sm" />
                      <input type="text" placeholder="Liều lượng (vd: 1 viên)" value={newMed.dosage} onChange={e => setNewMed({...newMed, dosage: e.target.value})} className="w-full bg-white border-gray-100 rounded-xl py-2 px-3 text-sm" />
                    </div>
                    <button onClick={addMedication} className="w-full py-2 bg-starbucks-green text-white rounded-xl text-xs font-bold uppercase">Thêm thuốc</button>
                  </div>
                </div>

                <button 
                  onClick={handleUpdatePrescription}
                  className="w-full bg-house-green text-white py-4 rounded-3xl font-bold shadow-lg active:scale-95 transition-all mt-6"
                >
                  Cập nhật toàn bộ đơn
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MedicalRecordsScreen;
