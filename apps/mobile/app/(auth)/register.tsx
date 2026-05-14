import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, User, UserPlus, ShieldCheck } from 'lucide-react-native';
import AuthLayout from '../../components/auth/AuthLayout';
import api from '../../utils/api';

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    const { fullName, email, password, confirmPassword } = formData;

    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các trường thông tin');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);
    try {
      // Gọi API đăng ký thật
      await api.post('/auth/register', {
        fullName,
        email,
        password
      });

      Alert.alert(
        'Thành công', 
        'Tài khoản của bạn đã được tạo thành công!',
        [{ text: 'Đăng nhập ngay', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (error: any) {
      console.error('Register error:', error);
      const message = error.response?.data?.message || 'Không thể tạo tài khoản. Vui lòng thử lại sau.';
      Alert.alert('Đăng ký thất bại', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Tạo tài khoản" 
      subtitle="Bắt đầu hành trình chăm sóc sức khỏe thông minh cùng SRHC"
    >
      <View className="gap-y-5">
        <View className="gap-y-1.5">
          <Text className="text-sm font-semibold text-gray-700 ml-1">HỌ VÀ TÊN</Text>
          <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 h-15 shadow-sm">
            <User size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="Nguyễn Văn A"
              placeholderTextColor="#9CA3AF"
              value={formData.fullName}
              onChangeText={(text) => setFormData({...formData, fullName: text})}
            />
          </View>
        </View>
        <View className="gap-y-1.5">
          <Text className="text-sm font-semibold text-gray-700 ml-1">EMAIL / SỐ ĐIỆN THOẠI</Text>
          <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 h-15 shadow-sm">
            <Mail size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="example@gmail.com"
              placeholderTextColor="#9CA3AF"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>
        <View className="gap-y-1.5">
          <Text className="text-sm font-semibold text-gray-700 ml-1">MẬT KHẨU</Text>
          <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 h-15 shadow-sm">
            <Lock size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={formData.password}
              onChangeText={(text) => setFormData({...formData, password: text})}
            />
          </View>
        </View>
        <View className="gap-y-1.5">
          <Text className="text-sm font-semibold text-gray-700 ml-1">XÁC NHẬN MẬT KHẨU</Text>
          <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 h-15 shadow-sm">
            <ShieldCheck size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
            />
          </View>
        </View>
        <View className="mt-4">
          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading}
            className={`h-16 rounded-2xl flex-row items-center justify-center shadow-lg ${
              isLoading ? 'bg-house-green/80' : 'bg-house-green'
            }`}
            style={{ 
              shadowColor: '#1E3932',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 8 
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center">
                <Text className="text-white text-lg font-bold mr-2">Đăng ký ngay</Text>
                <UserPlus size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-center mt-4 mb-6">
          <Text className="text-gray-500 font-medium">Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text className="text-starbucks-green font-bold">Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AuthLayout>
  );
}
