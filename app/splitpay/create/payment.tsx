import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Utility for calculating the split logic; to be replaced with backend math later
import { equalSplit } from '@/app/utils/split';

export default function SplitPayPaymentScreen() {
  const router = useRouter();

  // Temporary local state for testing participant payment status
  const [participants, setParticipants] = useState([
    { id: '1', name: 'Alex', paid: false },
    { id: '2', name: 'Jordan', paid: false },
    { id: '3', name: 'Sam', paid: false },
  ]);

  const total = 64.2; 

  // Saves calculation result to prevent re-splitting unless participants or total change
  const splitByPerson = useMemo(() => {
    const names = participants.map((p) => p.name);
    return equalSplit(total, names);
  }, [participants, total]);

  // Derived state to track remaining payments and toggle the finish button
  const remaining = participants.filter((p) => !p.paid).length;
  const allPaid = remaining === 0;

  // Updates the local paid status for a specific user ID
  const togglePaid = (id: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, paid: !p.paid } : p))
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1, padding: 24 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
          <Ionicons name="arrow-back" size={24} color="#00966d" />
        </TouchableOpacity>

        <Text style={{ fontSize: 32, fontWeight: '900', color: 'black', marginBottom: 8 }}>
          Who Owes What
        </Text>
        <Text style={{ fontSize: 18, color: '#6b7280', marginBottom: 24 }}>
          Total: <Text style={{ color: 'black', fontWeight: 'bold' }}>${total.toFixed(2)}</Text>
        </Text>

        <FlatList
          data={participants}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={{ 
              backgroundColor: '#f3f4f6', 
              padding: 20, 
              borderRadius: 20, 
              marginBottom: 12, 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between' 
            }}>
              <View>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937' }}>{item.name}</Text>
                <Text style={{ color: '#6b7280' }}>Owes ${splitByPerson[item.name]}</Text>
              </View>
              
              {/* Individual payment toggle for manual tracking */}
              <TouchableOpacity
                onPress={() => togglePaid(item.id)}
                style={{ 
                  backgroundColor: item.paid ? '#00966d' : 'white', 
                  paddingHorizontal: 16, 
                  paddingVertical: 8, 
                  borderRadius: 12,
                  borderWidth: item.paid ? 0 : 1,
                  borderColor: '#d1d5db'
                }}>
                <Text style={{ color: item.paid ? 'white' : '#374151', fontWeight: 'bold' }}>
                  {item.paid ? 'Paid' : 'Mark Paid'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />

        {/* Action button that only unlocks once all participants are marked as paid */}
        <TouchableOpacity
          disabled={!allPaid}
          onPress={() => router.push('/splitpay/create/done')}
          style={{ 
            backgroundColor: allPaid ? '#00966d' : '#9ca3af', 
            padding: 20, 
            borderRadius: 16, 
            marginTop: 12 
          }}>
          <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 18 }}>
            {allPaid ? 'Finish Session' : `Waiting on ${remaining} ${remaining === 1 ? 'person' : 'people'}`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}