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
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthLayout from '../../components/auth/AuthLayout';
import api from '../../utils/api';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setIsLoading(true);
    try {
      // Gọi API thật từ Backend
      const response = await api.post('/auth/login', {
        email: email,
        password: password,
      });

      const { access_token, user } = response.data;

      // Lưu Token vào máy để dùng cho các lần sau
      await AsyncStorage.setItem('user_token', access_token);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));

      Alert.alert('Thành công', `Chào mừng ${user.fullName || 'bạn'} trở lại!`);
      
      // Chuyển vào màn hình chính
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng hoặc địa chỉ IP.';
      Alert.alert('Đăng nhập thất bại', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Chào mừng trở lại" 
      subtitle="Đăng nhập để quản lý sức khỏe của bạn và gia đình"
    >
      <View className="gap-y-6">
        <View className="gap-y-2">
          <Text className="text-sm font-semibold text-gray-700 ml-1">SỐ ĐIỆN THOẠI / EMAIL</Text>
          <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 h-16 shadow-sm">
            <Mail size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="Nhập số điện thoại hoặc email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>
        <View className="gap-y-2">
          <View className="flex-row justify-between items-center ml-1">
            <Text className="text-sm font-semibold text-gray-700">MẬT KHẨU</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
              <Text className="text-sm font-bold text-starbucks-green">Quên mật khẩu?</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 h-16 shadow-sm">
            <Lock size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={20} color="#6B7280" />
              ) : (
                <Eye size={20} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleLogin}
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
              <Text className="text-white text-lg font-bold mr-2">Đăng nhập</Text>
              <LogIn size={20} color="white" />
            </View>
          )}
        </TouchableOpacity>
        <View className="flex-row items-center my-4">
          <View className="flex-1 h-[1px] bg-gray-200" />
          <View className="mx-4">
            <Text className="text-gray-400 font-medium">HOẶC</Text>
          </View>
          <View className="flex-1 h-[1px] bg-gray-200" />
        </View>
        <TouchableOpacity 
          className="h-16 bg-white border border-gray-200 rounded-2xl flex-row items-center justify-center shadow-sm"
          onPress={() => {}}
        >
          <View className="w-6 h-6 mr-3 rounded-full bg-red-500 items-center justify-center">
            <Text className="text-white text-[10px] font-bold">G</Text>
          </View>
          <Text className="text-gray-700 text-lg font-bold">Tiếp tục với Google</Text>
        </TouchableOpacity>
        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-500 font-medium">Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text className="text-starbucks-green font-bold">Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AuthLayout>
  );
}
