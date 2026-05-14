import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

const resources = {
  vi: {
    translation: {
      common: {
        loading: "Đang tải...",
        error: "Đã xảy ra lỗi",
        success: "Thành công",
        cancel: "Hủy",
        save: "Lưu",
        search: "Tìm kiếm...",
      },
      auth: {
        welcome_title: "Chào mừng trở lại",
        welcome_subtitle: "Đăng nhập để quản lý sức khỏe của bạn và gia đình",
        login: "Đăng nhập",
        register: "Đăng ký ngay",
        forgot_password: "Quên mật khẩu?",
        email_placeholder: "Nhập email hoặc số điện thoại",
        password_placeholder: "Nhập mật khẩu",
      },
      dashboard: {
        greeting: "Chào buổi sáng",
        health_status: "Trạng thái sức khỏe",
        stable: "Ổn định",
        services: "Dịch vụ y tế",
        ai_consult: "Tư vấn AI",
        appointments: "Đặt lịch",
        medical_records: "Bệnh án",
        emergency: "Cấp cứu 115",
        upcoming: "Lịch sắp tới",
      }
    }
  }
};

const getDeviceLanguage = () => {
  const locales = Localization.getLocales();
  if (locales && locales.length > 0) {
    return locales[0].languageCode ?? 'vi';
  }
  return 'vi';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'vi',
    compatibilityJSON: 'v3', // Quan trọng cho React Native
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;
