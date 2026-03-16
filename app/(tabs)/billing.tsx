import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BillingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ThemedView className="flex-1 p-6">
        <ThemedText type="title" className="mb-3">
          Billing
        </ThemedText>
        <ThemedText className="mb-4">
          Add and manage debit/credit cards for paying your share of a bill.
        </ThemedText>

        <TouchableOpacity className="rounded-lg bg-blue-600 px-4 py-3">
          <ThemedText type="defaultSemiBold" className="text-white">
            Add a card
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
}

// This screen allows users to add and manage their debit/credit cards for paying their share of a bill. Nothing is implemented at the moment it's a placeholder