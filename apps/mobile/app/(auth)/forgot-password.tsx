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
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import AuthLayout from '../../components/auth/AuthLayout';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Lỗi', 'Vui lòng nhập email hoặc số điện thoại');
      return;
    }

    setIsLoading(true);
    // Giả lập gửi mã reset
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 2000);
  };

  if (isSent) {
    return (
      <AuthLayout 
        title="Kiểm tra hộp thư" 
        subtitle="Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn"
      >
        <View className="items-center py-10 gap-y-8">
          <View className="w-24 h-24 bg-green-50 rounded-full items-center justify-center">
            <CheckCircle2 size={60} color="#1E3932" />
          </View>
          
          <Text className="text-gray-500 text-center text-lg leading-relaxed px-4">
            Vui lòng kiểm tra email và làm theo hướng dẫn để tạo mật khẩu mới.
          </Text>

          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login')}
            className="w-full h-16 bg-house-green rounded-2xl items-center justify-center shadow-lg shadow-green-900/20"
          >
            <Text className="text-white text-lg font-bold">Quay lại Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Quên mật khẩu?" 
      subtitle="Đừng lo lắng, hãy nhập email của bạn và chúng tôi sẽ giúp bạn lấy lại mật khẩu"
    >
      <View className="gap-y-8">
        <View className="gap-y-2">
          <Text className="text-sm font-semibold text-gray-700 ml-1">SỐ ĐIỆN THOẠI / EMAIL</Text>
          <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 h-16 shadow-sm">
            <Mail size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="Nhập email của bạn"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleResetPassword}
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
              <Text className="text-white text-lg font-bold mr-2">Gửi mã xác nhận</Text>
              <ArrowRight size={20} color="white" />
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.back()}
          className="items-center mt-4"
        >
          <Text className="text-gray-500 font-medium">Hủy và quay lại</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
}
