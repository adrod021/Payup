import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TouchableOpacity } from 'react-native';

export default function SplitPayWaitingScreen() {
  const router = useRouter();

  return (
    <ThemedView className="flex-1 p-6">
      <ThemedText type="title" className="mb-3">
        Waiting for host
      </ThemedText>
      <ThemedText className="mb-4">
        Your group host will scan the receipt and send the payment request once it’s ready.
      </ThemedText>

      <TouchableOpacity
        onPress={() => router.push('/splitpay/create/payment')}
        className="rounded-lg bg-blue-600 px-4 py-3">
        <ThemedText type="defaultSemiBold" className="text-white">
          Simulate host finished
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
