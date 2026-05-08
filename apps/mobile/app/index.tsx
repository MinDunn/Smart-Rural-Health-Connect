import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 items-center justify-center p-6">
        <View className="w-full max-w-sm p-8 bg-white rounded-[40px] items-center shadow-2xl shadow-blue-200">
          <View className="w-20 h-20 bg-blue-600 rounded-2xl items-center justify-center mb-6 transform rotate-12">
            <Text className="text-white text-4xl font-bold -rotate-12">H</Text>
          </View>
          
          <Text className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
            SRHC <Text className="text-blue-600">Health</Text>
          </Text>
          
          <Text className="text-slate-500 text-center leading-6 mb-8">
            Hệ thống kết nối y tế thông minh{"\n"}cho vùng nông thôn Việt Nam
          </Text>
          
          <View className="w-full space-y-4">
            <View className="w-full py-4 bg-blue-600 rounded-2xl items-center shadow-lg shadow-blue-300">
              <Text className="text-white font-bold text-lg">Bắt đầu</Text>
            </View>
            
            <View className="w-full py-4 bg-white border border-slate-200 rounded-2xl items-center mt-3">
              <Text className="text-slate-600 font-semibold">Tìm hiểu thêm</Text>
            </View>
          </View>
        </View>
        
        <Text className="mt-12 text-slate-400 text-sm">
          Phiên bản 1.0.0 • Powered by AI
        </Text>
      </View>
    </SafeAreaView>
  );
}
