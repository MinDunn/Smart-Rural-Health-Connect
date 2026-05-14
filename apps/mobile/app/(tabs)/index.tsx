import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Dimensions
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
  LayoutGrid,
  Heart,
  Droplets,
  Thermometer,
  Sparkles
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import api from '../../utils/api';

const { width } = Dimensions.get('window');

const HeartRateWave = () => (
  <View className="absolute bottom-0 left-0 right-0 h-24 opacity-20">
    <Svg height="100%" width="100%" viewBox="0 0 400 100">
      <Path
        d="M0 50 Q 25 10, 50 50 T 100 50 T 150 50 T 200 50 T 250 50 T 300 50 T 350 50 T 400 50"
        fill="none"
        stroke="white"
        strokeWidth="3"
      />
    </Svg>
  </View>
);

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
    return user.fullName || (user.profile ? `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim() : 'Bảo Quốc');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Chào buổi sáng";
    if (hour >= 12 && hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const getGreetingEmoji = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "☀️";
    if (hour >= 12 && hour < 18) return "🌤️";
    return "🌙";
  };

  const loadData = async () => {
    try {
      const userRaw = await AsyncStorage.getItem('user_data');
      if (userRaw) {
        const user = JSON.parse(userRaw);
        setUserData(user);
        const pId = user.patientId || 'demo-patient';
        
        try {
          const metricsRes = await api.get(`/iot/metrics/${pId}`);
          const newMetrics = { heart_rate: '--', blood_pressure: '--/--', temperature: '--' };
          metricsRes.data.forEach((m: any) => {
            if (m.type === 'heart_rate') newMetrics.heart_rate = m.value;
            if (m.type === 'blood_pressure') newMetrics.blood_pressure = m.value;
            if (m.type === 'temperature') newMetrics.temperature = m.value;
          });
          setMetrics(newMetrics);
        } catch (e) {}
        
        try {
          const appointmentsRes = await api.get(`/clinical/appointments/upcoming/${pId}`);
          setUpcomingAppointments(appointmentsRes.data);
        } catch (e) {}
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

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      <View className="px-6 pb-4" style={{ paddingTop: insets.top + 10 }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden border-2 border-house-green/20">
              <View className="w-full h-full bg-house-green items-center justify-center">
                <Text className="text-white font-bold text-xl">{getDisplayName(userData).charAt(0)}</Text>
              </View>
            </View>
            <View className="ml-3">
              <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{getGreeting()}</Text>
              <Text className="text-gray-900 text-lg font-black">{getDisplayName(userData)}{" "}{getGreetingEmoji()}</Text>
            </View>
          </View>
          <View className="flex-row gap-x-2">
            <TouchableOpacity className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100">
              <Search size={20} color="#1E3932" />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100">
              <Bell size={20} color="#1E3932" />
              <View className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); loadData(); }} tintColor="#006241" />}
      >
        <View className="px-6 mt-4">
          <View className="bg-house-green rounded-[32px] p-7 shadow-xl shadow-green-900/40 overflow-hidden">
            <View className="absolute top-[-20] right-[-20] w-40 h-40 rounded-full bg-white/10" />
            <View className="absolute bottom-[-40] left-[-10] w-32 h-32 rounded-full bg-black/5" />
            
            <HeartRateWave />

            <View className="flex-row justify-between items-center mb-8">
              <View className="flex-row items-center bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                <Activity size={12} color="white" />
                <Text className="text-white font-bold text-[9px] ml-1.5 uppercase tracking-tighter">{"Trạng thái hiện tại"}</Text>
              </View>
              <Text className="text-white/60 text-[10px] font-medium">{"Cập nhật 2 phút trước"}</Text>
            </View>

            <View className="mb-8">
              <Text className="text-white/60 text-sm font-medium mb-1">{"Sức khỏe của bạn"}</Text>
              <Text className="text-white text-4xl font-black">{isLoading ? "---" : "Ổn định"}</Text>
            </View>

            <View className="flex-row justify-between items-center">
              <View className="items-center">
                <View className="w-8 h-8 bg-white/10 rounded-full items-center justify-center mb-2">
                  <Heart size={14} color="white" />
                </View>
                <Text className="text-white font-bold text-lg">{metrics.heart_rate}</Text>
                <Text className="text-white/40 text-[8px] uppercase font-bold">{"BPM"}</Text>
              </View>
              <View className="w-[1px] h-10 bg-white/10" />
              <View className="items-center">
                <View className="w-8 h-8 bg-white/10 rounded-full items-center justify-center mb-2">
                  <Droplets size={14} color="white" />
                </View>
                <Text className="text-white font-bold text-lg">{metrics.blood_pressure}</Text>
                <Text className="text-white/40 text-[8px] uppercase font-bold">{"mmHg"}</Text>
              </View>
              <View className="w-[1px] h-10 bg-white/10" />
              <View className="items-center">
                <View className="w-8 h-8 bg-white/10 rounded-full items-center justify-center mb-2">
                  <Thermometer size={14} color="white" />
                </View>
                <Text className="text-white font-bold text-lg">{metrics.temperature}</Text>
                <Text className="text-white/40 text-[8px] uppercase font-bold">{"°C"}</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="px-6 mt-8">
          <View className="bg-blue-50/50 rounded-[28px] p-5 border border-blue-100 flex-row items-center">
            <View className="w-12 h-12 bg-blue-500 rounded-2xl items-center justify-center">
              <Sparkles size={24} color="white" />
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">{"Lời khuyên AI"}</Text>
              <Text className="text-gray-700 text-sm leading-5 font-medium">
                {"Chỉ số nhịp tim của bạn rất tốt. Hãy duy trì thói quen đi bộ 30 phút mỗi ngày nhé!"}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-6 mt-10">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-gray-900 text-xl font-black">{"Dịch vụ y tế"}</Text>
            <TouchableOpacity>
              <Text className="text-house-green font-bold text-sm">{"Xem tất cả"}</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity 
              onPress={() => router.push('/chat')}
              className="w-[48%] bg-white p-6 rounded-[32px] mb-4 shadow-sm border border-gray-100 items-center"
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 }}
            >
              <View className="w-14 h-14 bg-blue-50 rounded-2xl items-center justify-center mb-3">
                <Bot size={28} color="#3B82F6" />
              </View>
              <Text className="text-gray-900 font-bold text-sm">{"Tư vấn AI"}</Text>
            </TouchableOpacity>

            <TouchableOpacity className="w-[48%] bg-white p-6 rounded-[32px] mb-4 shadow-sm border border-gray-100 items-center" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 }}>
              <View className="w-14 h-14 bg-emerald-50 rounded-2xl items-center justify-center mb-3">
                <Calendar size={28} color="#10B981" />
              </View>
              <Text className="text-gray-900 font-bold text-sm">{"Đặt lịch"}</Text>
            </TouchableOpacity>

            <TouchableOpacity className="w-[48%] bg-white p-6 rounded-[32px] mb-4 shadow-sm border border-gray-100 items-center" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 }}>
              <View className="w-14 h-14 bg-purple-50 rounded-2xl items-center justify-center mb-3">
                <Stethoscope size={28} color="#8B5CF6" />
              </View>
              <Text className="text-gray-900 font-bold text-sm">{"Bệnh án"}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/emergency')} className="w-[48%] bg-red-500 p-6 rounded-[32px] mb-4 shadow-lg shadow-red-200 items-center">
              <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center mb-3">
                <PhoneCall size={28} color="white" />
              </View>
              <Text className="text-white font-bold text-sm">{"115 Cấp cứu"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6 mt-8">
          <Text className="text-gray-900 text-xl font-black mb-6">{"Lịch hẹn sắp tới"}</Text>
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((app, index) => (
              <TouchableOpacity key={app.id || index} className="bg-white p-4 rounded-[28px] flex-row items-center shadow-sm border border-gray-100 mb-3">
                <View className="w-14 h-14 bg-gray-50 rounded-2xl items-center justify-center">
                  <Text className="text-house-green font-bold text-lg">{app.doctor?.user?.profile?.firstName?.[0] || 'D'}</Text>
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-gray-900 font-bold text-base">{"BS. "}{app.doctor?.user?.profile?.firstName}{" "}{app.doctor?.user?.profile?.lastName}</Text>
                  <Text className="text-gray-400 text-xs font-medium">{"Đa khoa • 09:30"}</Text>
                </View>
                <View className="bg-emerald-50 px-3 py-1.5 rounded-xl">
                  <Text className="text-emerald-600 font-bold text-[10px]">{"14 Th5"}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="bg-gray-50/50 p-8 rounded-[32px] items-center border border-dashed border-gray-200">
              <Calendar size={28} color="#9CA3AF" />
              <Text className="text-gray-400 font-medium mt-3 text-center text-xs">{"Bạn chưa có lịch hẹn nào."}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
