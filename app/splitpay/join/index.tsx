import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TouchableOpacity } from 'react-native';

export default function SplitPayJoinScreen() {
  const router = useRouter();

  return (
    <ThemedView className="flex-1 p-6">
      <ThemedText type="title" className="mb-3">
        Join a session
      </ThemedText>
      <ThemedText className="mb-4">
        Enter the session code from the host. When the host scans the receipt, you will be able to see the bill and pay your share.
      </ThemedText>

      <TouchableOpacity
        onPress={() => router.push('/splitpay/create/waiting')}
        className="rounded-lg bg-blue-600 px-4 py-3">
        <ThemedText type="defaultSemiBold" className="text-white">
          Waiting for host
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
