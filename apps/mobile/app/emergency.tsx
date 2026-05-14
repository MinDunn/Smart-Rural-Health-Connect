import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Linking, 
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Phone, MapPin, X, Heart, ShieldAlert } from 'lucide-react-native';
import * as Location from 'expo-location';

export default function EmergencyScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<any>(null);
  const [address, setAddress] = useState('Đang xác định vị trí...');
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setAddress('Không có quyền truy cập vị trí');
          setIsLoadingLocation(false);
          return;
        }
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
        let reverse = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        });
        if (reverse.length > 0) {
          const addr = reverse[0];
          setAddress(`${addr.street || ''}, ${addr.subregion || ''}, ${addr.region || ''}`);
        }
      } catch (e) {
        setAddress('Không thể xác định địa chỉ');
      } finally {
        setIsLoadingLocation(false);
      }
    })();
  }, []);

  return (
    <View className="flex-1 bg-[#8B0000]">
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-8 py-6 justify-between">
          <View className="flex-row justify-between items-center">
            <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
              <X size={28} color="white" />
            </TouchableOpacity>
            <View className="bg-white/20 px-4 py-2 rounded-full border border-white/30">
              <Text className="text-white font-bold">{"SOS KHẨN CẤP"}</Text>
            </View>
            <View className="w-12 h-12" />
          </View>
          <View className="items-center">
            <View className="w-24 h-24 bg-white/10 rounded-full items-center justify-center mb-10">
              <ShieldAlert size={60} color="white" />
            </View>
            <TouchableOpacity onPress={() => Linking.openURL('tel:115')} className="w-64 h-64 bg-red-600 rounded-full items-center justify-center shadow-2xl shadow-black border-8 border-white/20" style={{ elevation: 20 }}>
              <View className="bg-white p-6 rounded-full mb-4">
                <Phone size={48} color="#DC2626" fill="#DC2626" />
              </View>
              <Text className="text-white text-4xl font-black">{"115"}</Text>
              <Text className="text-white/80 font-bold mt-2 uppercase tracking-widest">{"Cấp cứu"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL('tel:0901234567')} className="mt-12 bg-white h-20 rounded-3xl flex-row items-center px-8 shadow-xl">
              <View className="bg-blue-100 p-3 rounded-2xl mr-4">
                <Heart size={24} color="#2563EB" fill="#2563EB" />
              </View>
              <View>
                <Text className="text-gray-400 text-xs font-bold uppercase">{"Gọi cho người thân"}</Text>
                <Text className="text-gray-900 text-lg font-extrabold">{"Bảo vệ Gia đình"}</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View className="bg-white/10 p-6 rounded-[32px] border border-white/20">
            <View className="flex-row items-center mb-3">
              <MapPin size={20} color="white" />
              <Text className="text-white font-bold ml-2 text-base">{"Vị trí của bạn"}</Text>
            </View>
            {isLoadingLocation ? (
              <ActivityIndicator color="white" />
            ) : (
              <View>
                <Text className="text-white/90 text-lg font-medium leading-6">{address}</Text>
                <Text className="text-white/50 text-xs mt-2 italic">{"GPS: "}{location?.coords.latitude.toFixed(5)}{", "}{location?.coords.longitude.toFixed(5)}</Text>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
