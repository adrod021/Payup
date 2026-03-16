import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TouchableOpacity } from 'react-native';

export default function SplitPayMethodScreen() {
  const router = useRouter();

  return (
    <ThemedView className="flex-1 p-6">
      <ThemedText type="title" className="mb-3">
        Select split method
      </ThemedText>
      <ThemedText className="mb-4">
        Choose how the bill should be split among participants.
      </ThemedText>

      <TouchableOpacity
        onPress={() => router.push('/splitpay/create/choose-host')}
        className="mb-3 rounded-lg bg-blue-600 px-4 py-3">
        <ThemedText type="defaultSemiBold" className="text-white">
          Percentage split
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/splitpay/create/choose-host')}
        className="rounded-lg bg-slate-600 px-4 py-3">
        <ThemedText type="defaultSemiBold" className="text-white">
          Roulette (random host)
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
