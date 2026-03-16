import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';

import { equalSplit } from '@/app/utils/split';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type Participant = {
  id: string;
  name: string;
  paid: boolean;
};

export default function SplitPayPaymentScreen() {
  const router = useRouter();

  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'Alex', paid: false },
    { id: '2', name: 'Jordan', paid: false },
    { id: '3', name: 'Sam', paid: false },
  ]);

  const total = 64.2; // mock total (in dollars)

  const splitByPerson = useMemo(() => {
    const names = participants.map((p) => p.name);
    return equalSplit(total, names);
  }, [participants, total]);

  const remaining = participants.filter((p) => !p.paid).length;
  const allPaid = remaining === 0;

  const togglePaid = (id: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, paid: !p.paid } : p))
    );
  };

  return (
    <ThemedView className="flex-1 p-6">
      <ThemedText type="title" className="mb-3">
        Who owes what
      </ThemedText>

      <ThemedText className="mb-3">
        Total: ${total.toFixed(2)} — split evenly between participants.
      </ThemedText>

      <FlatList
        data={participants}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item }) => (
          <View className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <View className="flex-row items-center justify-between">
              <View>
                <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                <ThemedText className="text-sm text-gray-500">
                  Owes ${splitByPerson[item.name]} 
                  {item.paid ? '(paid)' : '(unpaid)'}
                </ThemedText>
              </View>
              <TouchableOpacity
                onPress={() => togglePaid(item.id)}
                className={`rounded-full px-3 py-1 ${
                  item.paid ? 'bg-emerald-500' : 'bg-slate-200'
                }`}>
                <ThemedText className={item.paid ? 'text-white' : 'text-black'}>
                  {item.paid ? 'Paid' : 'Mark paid'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        disabled={!allPaid}
        onPress={() => router.push('/splitpay/create/done')}
        className={`mt-6 rounded-lg px-4 py-3 ${
          allPaid ? 'bg-blue-600' : 'bg-gray-300'
        }`}>
        <ThemedText type="defaultSemiBold" className={allPaid ? 'text-white' : 'text-gray-700'}>
          {allPaid ? 'All paid — finish' : `Waiting on ${remaining} ${remaining === 1 ? 'person' : 'people'}`}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
