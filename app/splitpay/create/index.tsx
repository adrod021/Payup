import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
// This fixes the 'crossed off' deprecated warning
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SplitPayCreateScreen() {
  const router = useRouter();

  return (
    // edges={['top']} ensures it handles the notch but keeps the bottom clear
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1 p-8 justify-center">
        
        {/* Header Section */}
        <Text 
          style={{ fontFamily: 'Poppins_700Bold' }} 
          className="text-4xl text-black mb-4"
        >
          Host or Join a session
        </Text>
        
        <Text 
          style={{ fontFamily: 'Poppins_400Regular' }} 
          className="text-lg text-gray-500 mb-10 leading-6"
        >
          As the host, you can choose how to split costs and then scan a receipt to start the payment flow.
        </Text>

        {/* Action Button - Brand Green with 25px rounding */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/splitpay/create/method')}
          className="bg-[#00966d] w-full py-6 rounded-[25px] shadow-md items-center justify-center"
        >
          <Text 
            style={{ fontFamily: 'Poppins_600SemiBold' }} 
            className="text-white text-xl"
          >
            Itemized
          </Text>
        </TouchableOpacity>

        {/* Back Button Link */}
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mt-8 self-center"
        >
          <Text 
            style={{ fontFamily: 'Poppins_600SemiBold' }} 
            className="text-[#00966d] text-base"
          >
            ← Back to Home
          </Text>
        </TouchableOpacity>
        
      </View>
    </SafeAreaView>
  );
}