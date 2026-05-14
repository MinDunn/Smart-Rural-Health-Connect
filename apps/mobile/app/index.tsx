import { Text, View, TouchableOpacity, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowRight, Heart } from "lucide-react-native";

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Decorative Background */}
      <View className="absolute top-0 left-0 right-0 h-[60%] bg-house-green rounded-b-[60px] overflow-hidden">
        <View className="absolute top-[-50] right-[-50] w-[300] h-[300] rounded-full bg-white/10" />
        <View className="absolute bottom-20 left-[-30] w-[150] h-[150] rounded-full bg-starbucks-green/20" />
      </View>

      <SafeAreaView className="flex-1">
        <View className="flex-1 px-8 py-10 justify-between">
          {/* Logo & Illustration */}
          <View className="items-center mt-10">
            <View className="w-24 h-24 bg-white rounded-3xl items-center justify-center shadow-2xl rotate-12">
              <Heart size={48} color="#006241" fill="#006241" />
            </View>
            
            <View className="mt-12 items-center">
              <Text className="text-white text-4xl font-extrabold tracking-tight">
                SRHC <Text className="text-starbucks-green">Health</Text>
              </Text>
              <View className="h-1 w-12 bg-starbucks-green mt-2 rounded-full" />
            </View>
          </View>

          {/* Text Content */}
          <View className="bg-white p-8 rounded-[40px] shadow-2xl shadow-gray-400 border border-gray-50">
            <Text className="text-gray-900 text-3xl font-bold text-center leading-tight">
              Chăm sóc sức khỏe{"\n"}trong tầm tay bạn
            </Text>
            <Text className="text-gray-500 text-center mt-4 text-base leading-6 font-medium">
              Giải pháp kết nối y tế thông minh hiện đại dành riêng cho vùng nông thôn Việt Nam.
            </Text>

            <View className="mt-8 gap-y-4">
              <TouchableOpacity 
                onPress={() => router.push('/(auth)/login')}
                className="bg-house-green h-16 rounded-2xl flex-row items-center justify-center shadow-lg shadow-green-900/40"
              >
                <Text className="text-white text-lg font-bold mr-2">Bắt đầu ngay</Text>
                <ArrowRight size={20} color="white" />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => {}}
                className="h-16 rounded-2xl items-center justify-center border border-gray-100 bg-gray-50/50"
              >
                <Text className="text-gray-500 font-bold">Tìm hiểu thêm</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-gray-400 text-center mt-6 text-xs font-medium">
              Phiên bản 1.0.0 • Powered by Smart AI
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
