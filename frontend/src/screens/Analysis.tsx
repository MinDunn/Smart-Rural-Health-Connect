import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ClipboardList, CheckCircle2, AlertCircle, Calendar, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { Screen } from '../types';
import { CLINIC_IMG } from '../constants';

interface AnalysisProps {
  setScreen: (s: Screen) => void;
}

const AnalysisScreen = ({ setScreen }: AnalysisProps) => (
  <motion.div 
    initial={{ opacity: 0, x: 50 }} 
    animate={{ opacity: 1, x: 0 }} 
    className="max-w-5xl mx-auto px-6 py-8 pb-32"
  >
    <button onClick={() => setScreen('chat')} className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest mb-6 hover:text-starbucks-green group">
      <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
      Quay lại tư vấn
    </button>

    <h2 className="text-3xl font-extrabold text-house-green mb-2">Kết quả phân tích sức khỏe</h2>
    <p className="text-gray-500 mb-10">Dựa trên các triệu chứng đã cung cấp, dưới đây là đánh giá và đề xuất hành động.</p>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-8 rounded-3xl card-shadow border border-gray-50">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-light rounded-full flex items-center justify-center">
                <ClipboardList className="text-starbucks-green" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Tóm tắt tình trạng</h3>
                <p className="text-xs text-gray-400">Cập nhật: 14:30, Hôm nay</p>
              </div>
            </div>
            <span className="bg-green-light text-starbucks-green px-4 py-1 rounded-full text-xs font-bold">Độ ưu tiên: Thường</span>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border-l-4 border-starbucks-green mb-8">
            <h4 className="text-xs font-bold text-starbucks-green mb-2 uppercase">PHÂN TÍCH CHÍNH</h4>
            <p className="text-sm leading-relaxed">Các triệu chứng mệt mỏi và đau đầu nhẹ có khả năng cao liên quan đến tình trạng thiếu ngủ kéo dài và căng thẳng. Không phát hiện dấu hiệu nguy hiểm cấp tính.</p>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
              <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Nhịp tim</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">72</span>
                <span className="text-sm text-gray-400">bpm</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full mt-2">
                <div className="h-full w-[70%] bg-starbucks-green rounded-full" />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Mức độ Stress</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-red-600">Cao</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full mt-2">
                <div className="h-full w-[85%] bg-red-600 rounded-full" />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="text-xs font-bold text-gray-800 mb-4 uppercase">LƯU Ý QUAN TRỌNG</h4>
            <ul className="space-y-3">
              {[
                'Cần theo dõi thêm nếu cơn đau đầu tăng cường độ vào buổi sáng.',
                'Đảm bảo uống đủ 2L nước mỗi ngày để giảm chóng mặt.'
              ].map((note, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                  <CheckCircle2 className="text-starbucks-green shrink-0 mt-0.5" size={18} />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="hidden lg:block relative">
        <div className="rounded-3xl overflow-hidden h-full card-shadow relative">
          <img src={CLINIC_IMG} className="w-full h-full object-cover" alt="Phòng khám" />
          <div className="absolute inset-0 bg-gradient-to-t from-house-green/80 via-transparent to-transparent flex flex-col justify-end p-8">
            <p className="text-green-light text-xs font-bold uppercase mb-1">Chăm sóc từ xa</p>
            <h3 className="text-white text-2xl font-bold">Luôn bên cạnh sức khỏe của bạn</h3>
          </div>
        </div>
      </div>
    </div>

    <h3 className="text-2xl font-bold text-house-green mb-6">Hành động khuyến nghị</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { title: 'Gọi cấp cứu', desc: 'Chỉ sử dụng khi có các dấu hiệu nguy kịch như khó thở, đau ngục dữ dội.', action: 'GỌI NGAY: 115', color: 'bg-red-50 text-red-600 border-red-100', icon: AlertCircle },
        { title: 'Đặt lịch khám', desc: 'Gặp chuyên gia nội khoa để được tư vấn chi tiết về tình trạng mệt mỏi.', action: 'XEM LỊCH TRỐNG', color: 'bg-green-50 text-starbucks-green border-green-100', icon: Calendar },
        { title: 'Tự chăm sóc', desc: 'Thực hiện các bài tập thư giãn và điều chỉnh chế độ sinh hoạt.', action: 'XEM HƯỚNG DẪN', color: 'bg-gray-50 text-gray-700 border-gray-100', icon: ShieldCheck }
      ].map((card, i) => (
        <div key={i} className={cn("p-6 rounded-3xl border flex flex-col items-start gap-4 transition-all hover:scale-[1.02] cursor-pointer", card.color)}>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
            <card.icon />
          </div>
          <h4 className="text-xl font-bold">{card.title}</h4>
          <p className="text-xs opacity-70 leading-relaxed">{card.desc}</p>
          <div className="mt-auto font-bold text-[10px] tracking-widest uppercase py-1 px-3 border border-current rounded-full">
            {card.action}
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

export default AnalysisScreen;
