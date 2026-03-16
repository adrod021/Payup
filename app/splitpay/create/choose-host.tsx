import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TouchableOpacity } from 'react-native';

export default function SplitPayChooseHostScreen() {
  const router = useRouter();

  return (
    <ThemedView className="flex-1 p-6">
      <ThemedText type="title" className="mb-3">
        Choose a host
      </ThemedText>
      <ThemedText className="mb-4">
        Decide who will scan the receipt and initiate the payment collection.
      </ThemedText>

      <TouchableOpacity
        onPress={() => router.push('/splitpay/create/scan')}
        className="rounded-lg bg-blue-600 px-4 py-3">
        <ThemedText type="defaultSemiBold" className="text-white">
          I am the host (scan receipt)
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/splitpay/create/waiting')}
        className="mt-3 rounded-lg bg-slate-600 px-4 py-3">
        <ThemedText type="defaultSemiBold" className="text-white">
          I am a participant (wait for host)
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
