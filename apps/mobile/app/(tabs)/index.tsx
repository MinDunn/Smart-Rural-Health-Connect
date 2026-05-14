import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StatusBar,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Bell, 
  Search, 
  Bot, 
  Calendar, 
  Stethoscope, 
  PhoneCall,
  ChevronRight,
  Activity,
  LayoutGrid
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../utils/api';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>({
    heart_rate: '--',
    blood_pressure: '--/--',
    temperature: '--',
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getDisplayName = (user: any) => {
    if (!user) return 'Bạn ơi';
    if (user.fullName) return user.fullName;
    if (user.profile) {
      const { firstName, lastName } = user.profile;
      if (firstName && lastName) return `${firstName} ${lastName}`;
      return firstName || lastName || 'Bạn ơi';
    }
    return 'Bạn ơi';
  };

  const getAvatarLetter = (user: any) => {
    const name = getDisplayName(user);
    return name.charAt(0).toUpperCase();
  };

  const loadData = async () => {
    try {
      const userRaw = await AsyncStorage.getItem('user_data');
      if (userRaw) {
        const user = JSON.parse(userRaw);
        setUserData(user);
        if (user.patientId) {
          try {
            const metricsRes = await api.get(`/iot/metrics/${user.patientId}`);
            const newMetrics = { heart_rate: '--', blood_pressure: '--/--', temperature: '--' };
            metricsRes.data.forEach((m: any) => {
              if (m.type === 'heart_rate') newMetrics.heart_rate = m.value;
              if (m.type === 'blood_pressure') newMetrics.blood_pressure = m.value;
              if (m.type === 'temperature') newMetrics.temperature = m.value;
            });
            setMetrics(newMetrics);
          } catch (e) {}
          try {
            const appointmentsRes = await api.get(`/clinical/appointments/upcoming/${user.patientId}`);
            setUpcomingAppointments(appointmentsRes.data);
          } catch (e) {}
        }
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { month: 'long', day: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View className="flex-1 bg-[#FDFDFD]">
      <StatusBar barStyle="dark-content" />
      <View className="bg-white px-6 pb-6 shadow-sm shadow-gray-100" style={{ paddingTop: insets.top + 10 }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-14 h-14 rounded-2xl bg-house-green items-center justify-center">
              <Text className="text-white font-bold text-2xl">{getAvatarLetter(userData)}</Text>
            </View>
            <View className="ml-4">
              <Text className="text-gray-400 text-xs font-bold uppercase tracking-[2px]">{"CHÀO BUỔI SÁNG"}</Text>
              <Text className="text-house-green text-xl font-extrabold">{getDisplayName(userData)}{" 👋"}</Text>
            </View>
          </View>
          <View className="flex-row gap-x-3">
            <TouchableOpacity className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center border border-gray-100">
              <Search size={22} color="#1E3932" />
            </TouchableOpacity>
            <TouchableOpacity className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center border border-gray-100">
              <Bell size={22} color="#1E3932" />
              <View className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); loadData(); }} tintColor="#006241" />}>
        <View className="px-6 mt-6">
          <View className="bg-house-green rounded-[40px] p-8 shadow-2xl shadow-green-900/30 overflow-hidden">
            <View className="absolute top-[-50] right-[-50] w-60 h-60 rounded-full bg-white/5" />
            <View className="absolute bottom-[-30] left-[-20] w-40 h-40 rounded-full bg-starbucks-green/20" />
            <View className="flex-row justify-between items-start mb-8">
              <View>
                <View className="flex-row items-center bg-white/20 px-3 py-1.5 rounded-full mb-3 self-start">
                  <Activity size={14} color="white" />
                  <Text className="text-white font-bold text-[10px] ml-1.5 uppercase tracking-wider">{"TRẠNG THÁI HIỆN TẠI"}</Text>
                </View>
                <Text className="text-white text-3xl font-bold">{isLoading ? "Đang tải..." : "Ổn định"}</Text>
                <Text className="text-white/60 text-sm mt-1">{"Cập nhật thời gian thực"}</Text>
              </View>
              <TouchableOpacity className="bg-white/20 p-3 rounded-2xl">
                <LayoutGrid size={20} color="white" />
              </TouchableOpacity>
            </View>
            <View className="flex-row justify-between bg-white/10 p-5 rounded-3xl border border-white/10">
              <View className="items-center flex-1">
                <Text className="text-white font-bold text-xl">{metrics.heart_rate}</Text>
                <Text className="text-white/50 text-[10px] mt-1 uppercase">{"BPM"}</Text>
              </View>
              <View className="w-[1px] h-10 bg-white/10" />
              <View className="items-center flex-1">
                <Text className="text-white font-bold text-xl">{metrics.blood_pressure}</Text>
                <Text className="text-white/50 text-[10px] mt-1 uppercase">{"mmHg"}</Text>
              </View>
              <View className="w-[1px] h-10 bg-white/10" />
              <View className="items-center flex-1">
                <Text className="text-white font-bold text-xl">{metrics.temperature}</Text>
                <Text className="text-white/50 text-[10px] mt-1 uppercase">{"°C"}</Text>
              </View>
            </View>
          </View>
        </View>
        <View className="px-6 mt-10">
          <Text className="text-house-green text-2xl font-black mb-6">{"Dịch vụ y tế"}</Text>
          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity 
              onPress={() => router.push('/ai-chat')}
              className="w-[48%] bg-white p-6 rounded-[32px] mb-4 shadow-sm border border-gray-50 items-center"
            >
              <View className="w-16 h-16 bg-blue-50 rounded-3xl items-center justify-center mb-4">
                <Bot size={32} color="#3B82F6" />
              </View>
              <Text className="text-gray-900 font-bold text-center">{"Tư vấn AI"}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="w-[48%] bg-white p-6 rounded-[32px] mb-4 shadow-sm border border-gray-50 items-center"><View className="w-16 h-16 bg-emerald-50 rounded-3xl items-center justify-center mb-4"><Calendar size={32} color="#10B981" /></View><Text className="text-gray-900 font-bold text-center">{"Đặt lịch"}</Text></TouchableOpacity>
            <TouchableOpacity className="w-[48%] bg-white p-6 rounded-[32px] mb-4 shadow-sm border border-gray-50 items-center"><View className="w-16 h-16 bg-purple-50 rounded-3xl items-center justify-center mb-4"><Stethoscope size={32} color="#8B5CF6" /></View><Text className="text-gray-900 font-bold text-center">{"Bệnh án"}</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/emergency')} className="w-[48%] bg-red-50 p-6 rounded-[32px] mb-4 border border-red-50 items-center"><View className="w-16 h-16 bg-red-500 rounded-3xl items-center justify-center mb-4"><PhoneCall size={32} color="white" /></View><Text className="text-red-600 font-black text-center">{"115 Cấp cứu"}</Text></TouchableOpacity>
          </View>
        </View>
        <View className="px-6 mt-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-house-green text-2xl font-black">{"Lịch sắp tới"}</Text>
            <TouchableOpacity><ChevronRight size={24} color="#006241" /></TouchableOpacity>
          </View>
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((app, index) => (
              <TouchableOpacity key={app.id || index} className="bg-white p-5 rounded-[32px] flex-row items-center shadow-sm border border-gray-50 mb-3"><View className="w-16 h-16 bg-gray-100 rounded-2xl items-center justify-center"><Text className="text-house-green font-bold text-lg">{app.doctor?.user?.profile?.firstName?.[0] || 'D'}</Text></View><View className="flex-1 ml-4"><Text className="text-gray-900 font-bold text-lg">{"BS. "}{app.doctor?.user?.profile?.firstName}{" "}{app.doctor?.user?.profile?.lastName}</Text><Text className="text-gray-400 text-sm font-medium">{app.doctor?.specialty || 'Đa khoa'}{" • "}{formatTime(app.appointmentDate)}</Text></View><View className="bg-starbucks-green/10 px-3 py-1 rounded-lg"><Text className="text-starbucks-green font-bold text-xs">{formatDate(app.appointmentDate)}</Text></View></TouchableOpacity>
            ))
          ) : (
            <View className="bg-gray-50 p-8 rounded-[32px] items-center border border-dashed border-gray-200"><Calendar size={32} color="#9CA3AF" /><Text className="text-gray-400 font-medium mt-3 text-center">{"Bạn chưa có lịch hẹn nào sắp tới.\nHãy đặt lịch ngay để được tư vấn!"}</Text></View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
