import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AccountScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ThemedView className="flex-1 p-6">
        <ThemedText type="title" className="mb-3">
          Account
        </ThemedText>
        <ThemedText className="mb-4">
          Manage your account settings, reset your password, and update your contact information.
        </ThemedText>

        <TouchableOpacity className="mb-3 rounded-lg bg-blue-600 px-4 py-3">
          <ThemedText type="defaultSemiBold" className="text-white">
            Reset password
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity className="mb-3 rounded-lg bg-slate-600 px-4 py-3">
          <ThemedText type="defaultSemiBold" className="text-white">
            Add email / phone
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity className="rounded-lg bg-red-600 px-4 py-3">
          <ThemedText type="defaultSemiBold" className="text-white">
            Delete account
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
}
