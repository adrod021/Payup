import { Link } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SplitPayDoneScreen() {
  return (
    <ThemedView className="flex-1 p-6 items-center justify-center">
      <ThemedText type="title" className="mb-3">
        Done
      </ThemedText>
      <ThemedText className="mb-4 text-center">
        Your split payment session is complete. You can start another SplitPay session or return home.
      </ThemedText>

      <Link href="/" className="rounded-lg bg-blue-600 px-4 py-3">
        <ThemedText type="defaultSemiBold" className="text-white">
          Go home
        </ThemedText>
      </Link>
    </ThemedView>
  );
}
