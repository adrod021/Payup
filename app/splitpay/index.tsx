import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SplitPayScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ThemedView className="flex-1 p-6">
        <ThemedText type="title" className="mb-3">
          SplitPay
        </ThemedText>
        <ThemedText className="mb-4">
          Create or join a shared bill session and coordinate who pays what.
        </ThemedText>

        <Link href="/splitpay/create" className="mb-3 rounded-lg bg-blue-600 px-4 py-3">
          <ThemedText type="defaultSemiBold" className="text-white">
            Create (Host)
          </ThemedText>
        </Link>

        <Link href="/splitpay/join" className="rounded-lg bg-slate-600 px-4 py-3">
          <ThemedText type="defaultSemiBold" className="text-white">
            Join (Participant)
          </ThemedText>
        </Link>
      </ThemedView>
    </SafeAreaView>
  );
}
