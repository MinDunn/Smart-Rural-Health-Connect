# Smart Rural Health Connect (SRHC) - Nền tảng Y tế Thông minh Nông thôn Việt Nam

## 🏥 Giới thiệu Dự án
SRHC là một hệ sinh thái y tế thông minh được thiết kế để cách mạng hóa việc chăm sóc sức khỏe cho hàng triệu người dân tại các vùng nông thôn Việt Nam. Dự án tập trung vào việc thu hẹp khoảng cách y tế, kết nối người dân với các bác sĩ chuyên khoa thông qua công nghệ IoT, AI và Telemedicine.

## 🚀 Kiến trúc Hệ thống (Modular Monolith)
Dự án được xây dựng theo kiến trúc **Modular Monolith**, cho phép quản lý mã nguồn tập trung nhưng vẫn đảm bảo tính tách biệt giữa các module nghiệp vụ, sẵn sàng chuyển đổi sang Microservices khi cần thiết.

### Tech Stack:
- **Frontend**: Expo (React Native) cho Mobile, Next.js cho Web Portal.
- **Backend**: NestJS (Node.js).
- **Database**: PostgreSQL (Dữ liệu chính), Redis (Cache/Event).
- **IoT**: EMQX (MQTT Broker).
- **Hạ tầng**: Docker & Kubernetes.
- **Real-time**: WebRTC & Socket.io.

## 📁 Cấu trúc Thư mục
```text
srhc-platform/
├── apps/
│   ├── mobile/             # Ứng dụng Expo cho Công dân & Y tế cơ sở
│   └── web-portal/          # Cổng thông tin Next.js cho Bác sĩ & Quản lý
├── backend/                # Backend NestJS (Modular Monolith)
│   ├── src/modules/        # Các module: Auth, Patient, IoT, Inventory...
├── infrastructure/
│   ├── docker/             # Docker Compose & Dockerfiles
│   └── k8s/                # Kubernetes manifests
├── docs/                   # Tài liệu chi tiết dự án
└── README.md
```

## 👥 Các Đối tượng Tham gia
1. **Citizen (Công dân)**: Người thụ hưởng, sử dụng app để tư vấn AI và theo dõi sức khỏe.
2. **Local Health Worker (Y tế cơ sở)**: Cầu nối, thực hiện đo IoT và hỗ trợ hội chẩn.
3. **Specialist Doctor (Bác sĩ chuyên khoa)**: Tư vấn từ xa, chẩn đoán và kê đơn.
4. **Health Manager (Quản lý y tế)**: Điều phối nguồn lực và theo dõi sức khỏe cộng đồng.
5. **Admin (Quản trị viên)**: Vận hành và bảo mật hệ thống.

## 🛠 Hướng dẫn Cài đặt nhanh
1. **Yêu cầu**: Cài đặt Docker, Node.js (v18+), Git.
2. **Khởi động hạ tầng**:
   ```bash
   cd infrastructure/docker
   docker-compose up -d
   ```
3. **Chạy Backend**:
   ```bash
   cd backend
   npm run start:dev
   ```

4. **Chạy Mobile App (Expo)**:
   ```bash
   cd apps/mobile
   npm start
   ```

5. **Chạy Web Portal (Next.js)**:
   ```bash
   cd apps/web-portal
   npm run dev
   ```

## 🗄 Cơ sở dữ liệu & Tài khoản mẫu

### Sơ đồ Thực thể (Entities)
Hệ thống sử dụng PostgreSQL với các module chính:
- **Users**: Quản lý tài khoản, vai trò và thông tin cá nhân.
- **Patients**: Quản lý bệnh nhân và hồ sơ sức khỏe.
- **Healthcare**: Quản lý bác sĩ, chuyên khoa và cơ sở y tế.
- **IoT**: Quản lý thiết bị và chỉ số sức khỏe thời gian thực.
- **Clinical**: Quản lý lịch hẹn, hội chẩn và đơn thuốc.

### Danh sách tài khoản mẫu (Seed Data)
Tất cả tài khoản đều sử dụng mật khẩu chung: **`123456`**

| Vai trò | Email | Mô tả |
| :--- | :--- | :--- |
| **Admin** | `admin@srhc.vn` | Quản trị viên toàn hệ thống |
| **Doctor** | `doctor@srhc.vn` | Bác sĩ chuyên khoa |
| **Citizen** | `citizen@srhc.vn` | Người dân / Bệnh nhân |
| **Health Worker** | `health_worker@srhc.vn` | Cán bộ y tế cơ sở |
| **Health Manager** | `health_manager@srhc.vn` | Quản lý y tế khu vực |

---
*Dự án thuộc sứ mệnh chuyển đổi số quốc gia trong lĩnh vực y tế tại Việt Nam.*
