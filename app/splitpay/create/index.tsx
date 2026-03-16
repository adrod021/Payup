import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TouchableOpacity } from 'react-native';

export default function SplitPayCreateScreen() {
  const router = useRouter();

  return (
    <ThemedView className="flex-1 p-6">
      <ThemedText type="title" className="mb-3">
        Create a split session
      </ThemedText>
      <ThemedText className="mb-4">
        As the host, you can choose how to split costs and then scan a receipt to start the payment flow.
      </ThemedText>

      <TouchableOpacity
        onPress={() => router.push('/splitpay/create/method')}
        className="rounded-lg bg-blue-600 px-4 py-3">
        <ThemedText type="defaultSemiBold" className="text-white">
          Pick a split method
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
