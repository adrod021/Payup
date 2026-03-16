import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TouchableOpacity } from 'react-native';

export default function SplitPayScanReceiptScreen() {
  const router = useRouter();

  return (
    <ThemedView className="flex-1 p-6">
      <ThemedText type="title" className="mb-3">
        Scan receipt
      </ThemedText>
      <ThemedText className="mb-4">
        Capture or upload the receipt so the app can read the totals and split the bill.
      </ThemedText>

      <TouchableOpacity
        onPress={() => router.push('/splitpay/create/payment')}
        className="rounded-lg bg-blue-600 px-4 py-3">
        <ThemedText type="defaultSemiBold" className="text-white">
          Simulate receipt scan (mock)
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
