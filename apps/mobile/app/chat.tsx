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
  StatusBar, 
  Image,
  Keyboard,
  StyleSheet,
  Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, Bot, ChevronLeft, Sparkles, Camera, Image as ImageIcon, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import api from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// KHO LƯU TRỮ ẢNH TĨNH: Tuyệt đối không để NativeWind quét qua
const IMG_STORE: Record<string, string> = {};

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  imgKey?: string;
  isHistoryImage?: boolean;
}

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeImgKey, setActiveImgKey] = useState<string | null>(null);
  const [kbVisible, setKbVisible] = useState(false);
  const kbAnim = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', (e) => {
      setKbVisible(true);
    });
    const hideSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => {
      setKbVisible(false);
    });
    
    (async () => {
      try {
        // Load image store
        const stored = await AsyncStorage.getItem('chat_imgs');
        if (stored) Object.assign(IMG_STORE, JSON.parse(stored));

        // Load chat history
        const userRaw = await AsyncStorage.getItem('user_data');
        if (!userRaw) return;
        const userData = JSON.parse(userRaw);
        const res = await api.get(`/ai/history/${userData.id}`);
        if (res.data?.length > 0) {
          const msgs: Message[] = [];
          res.data.forEach((c: any) => {
            const hasImg = c.question.startsWith('[Hình ảnh]');
            msgs.push({
              id: `q-${c.id}`,
              text: c.question.replace('[Hình ảnh] ', ''),
              sender: 'user',
              timestamp: new Date(c.createdAt),
              isHistoryImage: hasImg
            });
            msgs.push({
              id: `a-${c.id}`,
              text: c.answer,
              sender: 'ai',
              timestamp: new Date(c.createdAt)
            });
          });
          setMessages(msgs);
        } else {
          setMessages([{
            id: 'w',
            text: 'Xin chào! Tôi là bác sĩ AI. Bạn có thể gửi ảnh đơn thuốc hoặc triệu chứng để tôi tư vấn nhé.',
            sender: 'ai',
            timestamp: new Date(),
          }]);
        }
      } catch (e) { console.error(e); }
    })();
    
    return () => { showSub.remove(); hideSub.remove(); };
  }, [insets.bottom]);

  const handleImg = async (mode: 'library' | 'camera') => {
    try {
      const opt = { mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.2, base64: true };
      const res = mode === 'library' ? await ImagePicker.launchImageLibraryAsync(opt) : await ImagePicker.launchCameraAsync(opt);
      if (!res.canceled && res.assets[0].base64) {
        const k = `i-${Date.now()}`;
        IMG_STORE[k] = `data:image/jpeg;base64,${res.assets[0].base64}`;
        setActiveImgKey(k);
      }
    } catch (e) { console.error(e); }
  };

  const onSend = async () => {
    if (!inputText.trim() && !activeImgKey) return;
    const msg: Message = { id: Date.now().toString(), text: inputText, sender: 'user', timestamp: new Date(), imgKey: activeImgKey || undefined };
    setMessages(p => [...p, msg]);
    const txt = inputText;
    const b64 = activeImgKey ? IMG_STORE[activeImgKey] : null;
    setInputText(''); setActiveImgKey(null); setIsTyping(true);
    try {
      const u = await AsyncStorage.getItem('user_data');
      const res = await api.post('/ai/consult', { question: txt || 'Phân tích ảnh này', patientData: u ? JSON.parse(u) : null, image: b64 });
      setMessages(p => [...p, { id: Date.now().toString(), text: res.data.answer, sender: 'ai', timestamp: new Date() }]);
    } catch (e) {
      setMessages(p => [...p, { id: 'e', text: 'Lỗi kết nối. Thử lại sau nhé.', sender: 'ai', timestamp: new Date() }]);
    } finally { setIsTyping(false); }
  };

  useEffect(() => { 
    if (listRef.current) setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 200); 
  }, [messages, isTyping, kbVisible]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><ChevronLeft size={24} color="#1E3932" /></TouchableOpacity>
        <View style={styles.headerTitle}><Text style={styles.titleText}>Tư vấn bác sĩ AI</Text></View>
        <View style={styles.iconBtn}><Bot size={22} color="#006241" /></View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'position'} 
        style={{ flex: 1 }}
        contentContainerStyle={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'android' ? -insets.bottom : 0}
      >
        <FlatList
          style={{ flex: 1 }}
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.msgRow, { justifyContent: item.sender === 'user' ? 'flex-end' : 'flex-start' }]}>
              <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
                {item.imgKey && IMG_STORE[item.imgKey] && (
                  <View style={styles.imgBox}><Image source={{ uri: IMG_STORE[item.imgKey] }} style={styles.fullImg} resizeMode="cover" /></View>
                )}
                {item.isHistoryImage && (
                  <View style={styles.histBox}><ImageIcon size={20} color="#9CA3AF" /><Text style={styles.histText}>Ảnh lịch sử</Text></View>
                )}
                <Text style={[styles.msgText, { color: item.sender === 'user' ? '#fff' : '#1F2937' }]}>{item.text}</Text>
              </View>
            </View>
          )}
        />

        <View style={styles.inputArea}>
          {activeImgKey && (
            <View style={styles.previewRow}>
              <View style={styles.previewBox}>
                <Image source={{ uri: IMG_STORE[activeImgKey] }} style={styles.fullImg} />
                <TouchableOpacity onPress={() => setActiveImgKey(null)} style={styles.closeBtn}><X size={12} color="#fff" /></TouchableOpacity>
              </View>
            </View>
          )}
          <View style={[styles.inputRow, { paddingBottom: insets.bottom + 12 }]}>
            <TouchableOpacity onPress={() => handleImg('library')} style={styles.toolBtn}><ImageIcon size={20} color="#006241" /></TouchableOpacity>
            <TouchableOpacity onPress={() => handleImg('camera')} style={styles.toolBtn}><Camera size={20} color="#006241" /></TouchableOpacity>
            <TextInput style={styles.input} placeholder="Hỏi bác sĩ..." value={inputText} onChangeText={setInputText} multiline />
            <TouchableOpacity onPress={onSend} style={[styles.sendBtn, { backgroundColor: (inputText || activeImgKey) ? '#006241' : '#E5E7EB' }]} disabled={!inputText && !activeImgKey}>
              <Send size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6', borderRadius: 12 },
  headerTitle: { flex: 1, alignItems: 'center' },
  titleText: { fontSize: 17, fontWeight: '700', color: '#111827' },
  listContent: { padding: 20, paddingBottom: 30 },
  msgRow: { flexDirection: 'row', marginBottom: 20 },
  bubble: { maxWidth: '85%', padding: 14, borderRadius: 20 },
  userBubble: { backgroundColor: '#006241', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#F3F4F6' },
  msgText: { fontSize: 15, lineHeight: 22 },
  imgBox: { width: 200, height: 200, borderRadius: 12, overflow: 'hidden', marginBottom: 8 },
  histBox: { width: 200, height: 80, backgroundColor: '#F3F4F6', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8, borderStyle: 'dashed', borderWidth: 1, borderColor: '#D1D5DB' },
  histText: { fontSize: 10, color: '#9CA3AF', marginTop: 4 },
  inputArea: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  previewRow: { padding: 15, paddingBottom: 0 },
  previewBox: { width: 70, height: 70, borderRadius: 10, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: '#E5E7EB' },
  closeBtn: { position: 'absolute', top: 2, right: 2, backgroundColor: '#EF4444', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingTop: 12 },
  toolBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, marginHorizontal: 8, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  fullImg: { width: '100%', height: '100%' }
});
