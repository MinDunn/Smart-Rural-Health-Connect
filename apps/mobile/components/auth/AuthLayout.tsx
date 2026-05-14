import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Dimensions
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

const { height } = Dimensions.get('window');

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Decorative Background Elements */}
      <View 
        className="absolute top-[-100] right-[-50] w-[300] h-[300] rounded-full bg-starbucks-green/10" 
        style={{ transform: [{ scale: 1.5 }] }}
      />
      <View 
        className="absolute bottom-[-50] left-[-50] w-[200] h-[200] rounded-full bg-house-green/5" 
      />

      <SafeAreaView className="flex-1" edges={['right', 'bottom', 'left']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header with adjusted spacing for Status Bar */}
            <View 
              className="px-6 flex-row items-center justify-between"
              style={{ paddingTop: Math.max(insets.top, 16) }}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-12 h-12 rounded-full bg-white shadow-md items-center justify-center border border-gray-100"
                style={{ elevation: 4 }}
              >
                <ArrowLeft size={24} color="#1E3932" />
              </TouchableOpacity>
              
              <View className="w-12 h-12" />
            </View>

            {/* Content Container */}
            <View className="px-6 pt-8 pb-8 flex-1 justify-center">
              <View className="mb-10">
                <Text className="text-4xl font-bold text-house-green tracking-tight leading-tight">
                  {title}
                </Text>
                {subtitle && (
                  <Text className="text-lg text-gray-500 mt-3 font-medium">
                    {subtitle}
                  </Text>
                )}
              </View>

              {/* Main Content Card (Glass Effect) */}
              <View className="bg-white/80 rounded-3xl p-1">
                {children}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
