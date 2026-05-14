import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AiKnowledge } from './entities/ai-knowledge.entity';
import { AiChat } from './entities/ai-chat.entity';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { Patient } from '../patients/entities/patient.entity';
import { HealthProfile } from '../patients/entities/health-profile.entity';
import { HealthMetric } from '../iot/entities/health-metric.entity';
import { Consultation } from '../clinical/entities/consultation.entity';
import { Appointment } from '../clinical/entities/appointment.entity';

@Injectable()
export class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    @InjectRepository(AiKnowledge)
    private aiKnowledgeRepository: Repository<AiKnowledge>,
    @InjectRepository(AiChat)
    private aiChatRepository: Repository<AiChat>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(HealthProfile)
    private healthProfileRepository: Repository<HealthProfile>,
    @InjectRepository(HealthMetric)
    private healthMetricRepository: Repository<HealthMetric>,
    @InjectRepository(Consultation)
    private consultationRepository: Repository<Consultation>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    }
  }

  async onModuleInit() {
    this.logger.log('AI Service initialized with Multimodal Support');
  }

  async consult(question: string, userData?: any, imageBase64?: string): Promise<string> {
    try {
      if (!this.genAI) return 'AI chưa được cấu hình API Key. Vui lòng kiểm tra lại.';

      let medicalContext = '--- BỐI CẢNH Y TẾ NGƯỜI DÙNG ---\n';
      
      if (userData?.id) {
        const patient = await this.patientRepository.findOne({
          where: { user: { id: userData.id } },
          relations: ['healthProfiles']
        });

        if (patient) {
          medicalContext += `Bệnh nhân: ${userData.name || 'Người dùng'}, ${userData.age || 'không rõ'} tuổi.\n`;
          medicalContext += `Nhóm máu: ${patient.bloodType || 'Chưa cập nhật'}\n`;
          medicalContext += `Tiền sử bệnh lý: ${patient.medicalHistory || 'Không có'}\n`;
          medicalContext += `Dị ứng: ${patient.allergies || 'Không có'}\n`;

          const metrics = await this.healthMetricRepository.find({
            where: { patient: { id: patient.id } },
            order: { timestamp: 'DESC' },
            take: 5
          });
          if (metrics.length > 0) {
            medicalContext += `Chỉ số sinh tồn gần nhất:\n`;
            metrics.forEach(m => {
              medicalContext += `- ${m.type}: ${m.value}${m.unit || ''} (${m.status}, lúc ${m.timestamp.toLocaleString()})\n`;
            });
          }

          const appointments = await this.appointmentRepository.find({
            where: { patient: { id: patient.id }, status: 'completed' },
            order: { appointmentDate: 'DESC' },
            take: 3
          });
          
          if (appointments.length > 0) {
            medicalContext += `Lịch sử chẩn đoán gần đây:\n`;
            for (const appt of appointments) {
              const consultation = await this.consultationRepository.findOne({
                where: { appointment: { id: appt.id } }
              });
              if (consultation) {
                medicalContext += `- Ngày ${appt.appointmentDate.toLocaleDateString()}: ${consultation.diagnosis}\n`;
              }
            }
          }
        }
      }

      const promptText = `
        Bạn là một Bác sĩ trợ lý ảo chuyên nghiệp của hệ thống Smart Rural Health Connect.
        Nhiệm vụ của bạn là thực hiện quy trình thăm khám và tư vấn y tế từ xa cho người dân.

        ${medicalContext}

        QUY TRÌNH TƯ VẤN:
        1. THU THẬP THÔNG TIN: Nếu triệu chứng người dùng nêu ra quá sơ sài, hãy đặt câu hỏi để làm rõ.
        2. TƯ VẤN CÁ NHÂN HÓA: Hãy sử dụng dữ liệu bối cảnh y tế (tiền sử, chỉ số IoT) để đưa ra lời khuyên chính xác nhất.
        3. PHÂN TÍCH HÌNH ẢNH: Nếu có hình ảnh đi kèm, hãy mô tả các dấu hiệu y tế bạn thấy (ví dụ: vết thương, màu sắc da, nội dung đơn thuốc) và đưa ra nhận định.
        4. CẢNH BÁO AN TOÀN: Luôn nhắc nhở các dấu hiệu nguy hiểm cần đi cấp cứu ngay (115) nếu thấy tình trạng chuyển biến xấu.

        CÂU HỎI CỦA NGƯỜI DÙNG:
        ${question}
      `;

      let result;
      if (imageBase64) {
        // Loại bỏ tiền tố base64 nếu có (e.g. data:image/jpeg;base64,...)
        const base64Data = imageBase64.split(',')[1] || imageBase64;
        const imagePart = {
          inlineData: {
            data: base64Data,
            mimeType: "image/jpeg",
          },
        };
        result = await this.model.generateContent([promptText, imagePart]);
      } else {
        result = await this.model.generateContent(promptText);
      }

      const response = await result.response;
      const answer = response.text();

      if (userData?.id) {
        try {
          await this.aiChatRepository.save({
            user: { id: userData.id } as any,
            question: imageBase64 ? `[Hình ảnh] ${question}` : question,
            answer: answer
          });
        } catch (e) {
          this.logger.warn('Could not save chat history:', e.message);
        }
      }

      return answer;
    } catch (error) {
      this.logger.error('AI Consultation Error:', error);
      return 'Xin lỗi, tôi gặp trục trặc khi phân tích thông tin y tế. Vui lòng thử lại sau.';
    }
  }

  async seedKnowledge(content: string, metadata: any = {}) {
    return { message: 'Feature disabled' };
  }

  async getHistory(userId: string) {
    return this.aiChatRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'ASC' },
      take: 50,
    });
  }
}
