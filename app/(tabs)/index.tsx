import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ThemedView className="flex-1 p-6">
        <ThemedText type="title" className="mb-3">
          Home
        </ThemedText>
        <ThemedText className="mb-4">
          Welcome to the app. Use the tabs below to start a new split, manage cards, add friends,
          and update your account settings.
        </ThemedText>
        <Link href="/splitpay" className="rounded-lg bg-blue-600 px-4 py-3">
          <ThemedText type="defaultSemiBold" className="text-white">
            Start a new SplitPay session
          </ThemedText>
        </Link>
      </ThemedView>
    </SafeAreaView>
  );
}

//home screen for the app. It provides a welcome message and a link to start a new SplitPay session. You can expand this screen with more features and navigation options as needed.