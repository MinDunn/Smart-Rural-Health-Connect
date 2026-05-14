import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Send, Bot, User, Sparkles } from 'lucide-react-native';

interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
}

export default function AIChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Xin chào Quốc Bảo! Tôi là trợ lý sức khỏe thông minh của bạn. Hôm nay bạn cảm thấy thế nào?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Giả lập phản hồi từ AI (Sau này sẽ kết nối API thật)
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Cảm ơn bạn đã chia sẻ. Dựa trên thông tin bạn cung cấp, bạn nên nghỉ ngơi và theo dõi thêm. Nếu có triệu chứng sốt cao, hãy liên hệ ngay với bác sĩ tại trạm y tế gần nhất nhé!',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 2000);
  };

  useEffect(() => {
    if (flatListRef.current) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, isTyping]);

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <StatusBar barStyle="dark-content" />
      
      {/* Premium Header */}
      <View 
        className="bg-white px-6 pb-4 shadow-sm shadow-gray-100 flex-row items-center justify-between"
        style={{ paddingTop: insets.top + 10 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-gray-50 rounded-xl">
          <ChevronLeft size={24} color="#1E3932" />
        </TouchableOpacity>
        
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-house-green/10 rounded-full items-center justify-center mr-3">
            <Bot size={22} color="#006241" />
          </View>
          <View>
            <Text className="text-gray-900 font-bold text-base">{"Tư vấn AI"}</Text>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5" />
              <Text className="text-emerald-600 text-[10px] font-bold uppercase">{"Trực tuyến"}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity className="w-10 h-10 items-center justify-center bg-gray-50 rounded-xl">
          <Sparkles size={20} color="#006241" />
        </TouchableOpacity>
      </View>

      {/* Chat Area */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View className={`mb-6 flex-row ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {item.sender === 'ai' && (
              <View className="w-8 h-8 bg-house-green rounded-full items-center justify-center mr-3 self-end">
                <Bot size={16} color="white" />
              </View>
            )}
            <View 
              className={`max-w-[80%] px-5 py-4 rounded-[28px] ${
                item.sender === 'user' 
                ? 'bg-house-green rounded-tr-none' 
                : 'bg-white rounded-tl-none border border-gray-100 shadow-sm'
              }`}
            >
              <Text className={`text-[15px] leading-6 ${item.sender === 'user' ? 'text-white' : 'text-gray-800'}`}>
                {item.text}
              </Text>
              <Text className={`text-[9px] mt-2 ${item.sender === 'user' ? 'text-white/60 text-right' : 'text-gray-400'}`}>
                {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        )}
      />

      {isTyping && (
        <View className="px-6 py-2 flex-row items-center">
          <View className="bg-white px-4 py-3 rounded-full border border-gray-100 shadow-sm flex-row items-center">
            <ActivityIndicator size="small" color="#006241" />
            <Text className="text-gray-400 text-xs ml-3">{"Bác sĩ AI đang suy nghĩ..."}</Text>
          </View>
        </View>
      )}

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <View 
          className="bg-white px-6 pt-4 pb-10 border-t border-gray-50 flex-row items-center shadow-lg shadow-black"
          style={{ paddingBottom: Math.max(insets.bottom, 20) }}
        >
          <View className="flex-1 bg-gray-50 rounded-3xl px-6 py-3 border border-gray-100 mr-3">
            <TextInput
              placeholder="Nhập câu hỏi của bạn..."
              className="text-gray-900 text-[15px]"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
          </View>
          <TouchableOpacity 
            onPress={handleSend}
            disabled={!inputText.trim()}
            className={`w-14 h-14 rounded-full items-center justify-center ${inputText.trim() ? 'bg-house-green' : 'bg-gray-200'}`}
          >
            <Send size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
