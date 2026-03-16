import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FriendsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ThemedView className="flex-1 p-6">
        <ThemedText type="title" className="mb-3">
          Add Friends
        </ThemedText>
        <ThemedText className="mb-4">
          Invite friends by email or phone number so you can split bills together.
        </ThemedText>

        <View className="mb-3">
          <TextInput
            placeholder="Email or phone"
            className="rounded-md border border-gray-300 bg-white px-3 py-2"
          />
        </View>

        <TouchableOpacity className="rounded-lg bg-blue-600 px-4 py-3">
          <ThemedText type="defaultSemiBold" className="text-white">
            Send invite
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
}
