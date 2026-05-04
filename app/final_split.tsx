import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from './firebase';
import { useAuth } from './hooks/useAuth';

export default function FinalSplitScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { user } = useAuth(); 
  const router = useRouter();
  const [summaries, setSummaries] = useState<any[]>([]);
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    if (!sessionId) return;
    const unsub = onSnapshot(doc(db, "sessions", sessionId), (snap) => {
      if (!snap.exists()) {
        router.replace('/(tabs)');
        return;
      }
      const data = snap.data();
      
      // If the host hit "back", this listener triggers and moves participants back too
      if (data.stage !== 'summary') {
        router.replace({ pathname: '/manual_split', params: { sessionId } });
        return;
      }

      setSessionData(data);
      const userMap: any = {};
      data.participants.forEach((uid: string, index: number) => {
        userMap[uid] = { name: data.participantUsernames[index] || "User", items: [], total: 0 };
      });

      data.items?.forEach((item: any) => {
        item.selectedBy?.forEach((uid: string) => {
          if (userMap[uid]) {
            userMap[uid].items.push(item);
            userMap[uid].total += (item.price / item.selectedBy.length);
          }
        });
      });
      setSummaries(Object.values(userMap));
    });
    return () => unsub();
  }, [sessionId, router]);

  const isHost = user?.uid === sessionData?.hostId;

  const handleBackToSelecting = async () => {
    await updateDoc(doc(db, "sessions", sessionId!), { stage: 'selecting' });
  };

  const handleEndSession = () => {
    if (isHost) {
      Alert.alert("End Session", "This will close the session for everyone. Are you sure?", [
        { text: "Cancel", style: "cancel" },
        { text: "End for All", style: "destructive", onPress: async () => {
            await deleteDoc(doc(db, "sessions", sessionId!));
            router.replace('/(tabs)');
        }}
      ]);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 }}>
        {isHost ? (
          <TouchableOpacity onPress={handleBackToSelecting}>
            <Ionicons name="arrow-back" size={28} color="#00966d" />
          </TouchableOpacity>
        ) : <View style={{ width: 28 }} />}
        
        <Text style={{ fontSize: 26, fontWeight: '900' }}>Totals</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        {summaries.map((u, i) => (
          <View key={i} style={{ backgroundColor: '#f9fafb', borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#eee' }}>
            <Text style={{ fontSize: 20, fontWeight: '800', marginBottom: 5 }}>{u.name}</Text>
            <View style={{ height: 1, backgroundColor: '#ddd', marginBottom: 10 }} />
            {u.items.map((item: any, idx: number) => (
              <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                <Text style={{ color: '#4b5563' }}>{item.name}</Text>
                <Text style={{ color: '#4b5563' }}>${(item.price / item.selectedBy.length).toFixed(2)}</Text>
              </View>
            ))}
            <View style={{ height: 1, backgroundColor: '#ddd', marginVertical: 10 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>Total</Text>
              <Text style={{ fontWeight: '900', color: '#00966d' }}>${u.total.toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={{ padding: 20 }}>
        <TouchableOpacity onPress={handleEndSession} style={{ backgroundColor: isHost ? '#00966d' : '#ef4444', padding: 20, borderRadius: 20 }}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '900' }}>{isHost ? "END SESSION" : "LEAVE"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}