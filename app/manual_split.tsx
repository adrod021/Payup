import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { arrayUnion, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from './firebase';
import { useAuth } from './hooks/useAuth';

interface Item {
  id: string;
  name: string;
  price: number;
  selectedBy: string[]; 
  selectedByUsername: string[];
}

export default function ManualSplitScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const navigationLock = useRef(false);

  // Must match the identifier used in friends.tsx / Join logic
  const userIdentifier = user?.email || user?.phoneNumber;

  const [items, setItems] = useState<Item[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [sessionData, setSessionData] = useState<any>(null);
  const [myUsername, setMyUsername] = useState('New User');

  // Sync real username from users collection
  useEffect(() => {
    if (!user?.uid) return;
    const userRef = doc(db, "users", user.uid);
    const unsub = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setMyUsername(snap.data().username || user.displayName || "New User");
      }
    });
    return () => unsub();
  }, [user]);

  // Main session listener with kick-protection logic
  useEffect(() => {
    if (!sessionId || !userIdentifier) return;

    const unsub = onSnapshot(doc(db, "sessions", sessionId), (snap) => {
      if (!snap.exists()) {
        router.replace('/(tabs)');
        return;
      }

      const data = snap.data();
      const isHost = user?.uid === data.hostId;
      const participants = Array.isArray(data.participants) ? data.participants : [];
      
      // Only run kick check if session state is already established locally
      if (sessionData && !isHost && participants.length > 0) {
        if (!participants.includes(userIdentifier)) {
          Alert.alert("Session Ended", "You are no longer in this session.");
          router.replace('/(tabs)');
          return;
        }
      }

      setSessionData(data);
      setItems(data.items || []);
      
      if (data.stage === 'summary' && !navigationLock.current) {
        navigationLock.current = true;
        router.push({ pathname: '/final_split', params: { sessionId } });
      }
    });

    return () => unsub();
  }, [sessionId, userIdentifier, user?.uid, router, sessionData]); 

  const isHost = user?.uid === sessionData?.hostId;

  const handleFinishSession = async () => {
    const allClaimed = items.length > 0 && items.every(item => item.selectedBy && item.selectedBy.length > 0);
    if (!allClaimed) {
      Alert.alert("Items Remaining", "All items must be selected by at least one person.");
      return;
    }
    await updateDoc(doc(db, "sessions", sessionId!), { stage: 'summary' });
  };

  const toggleItemSelection = async (itemId: string) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        const hasSelected = item.selectedBy?.includes(userIdentifier!);
        return {
          ...item,
          selectedBy: hasSelected ? [] : [userIdentifier!],
          selectedByUsername: hasSelected ? [] : [myUsername] 
        };
      }
      return item;
    });
    await updateDoc(doc(db, "sessions", sessionId!), { items: updatedItems });
  };

  const addItem = async () => {
    if (!newItemName || !newItemPrice) return;
    const sanitizedPrice = parseFloat(newItemPrice.replace(/[^0-9.]/g, ''));
    if (isNaN(sanitizedPrice)) return;

    const item: Item = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItemName,
      price: sanitizedPrice,
      selectedBy: [],
      selectedByUsername: []
    };
    await updateDoc(doc(db, "sessions", sessionId!), { items: arrayUnion(item) });
    setNewItemName('');
    setNewItemPrice('');
  };

  const handleBackPress = () => {
    if (isHost) {
      Alert.alert("Close Session", "This ends the session for everyone.", [
        { text: "Cancel", style: "cancel" },
        { text: "CLOSE", style: "destructive", onPress: async () => await deleteDoc(doc(db, "sessions", sessionId!)) }
      ]);
    } else {
      router.replace('/(tabs)');
    }
  };

  if (!sessionData) return <ActivityIndicator style={{flex:1}} color="#00966d" />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white', padding: 20 }}>
      {/* Navbar area */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={28} color="#00966d" />
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: '900' }}>
            {sessionData.stage === 'selecting' ? "Claim Items" : "Create List"}
        </Text>
        <View style={{ width: 28 }} /> 
      </View>

      {/* Host input for adding items */}
      {isHost && sessionData.stage !== 'selecting' && (
        <View style={{ marginBottom: 25 }}>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
            <TextInput placeholder="Item Name" value={newItemName} onChangeText={setNewItemName} style={{ flex: 2, backgroundColor: '#f9fafb', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb' }} />
            <TextInput placeholder="$ 0.00" value={newItemPrice} onChangeText={setNewItemPrice} keyboardType="numeric" style={{ flex: 1, backgroundColor: '#f9fafb', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb' }} />
          </View>
          <TouchableOpacity onPress={addItem} style={{ backgroundColor: '#00966d', padding: 18, borderRadius: 14, alignItems: 'center' }}>
            <Text style={{ color: 'white', fontWeight: '900' }}>ADD TO LIST</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main item scroll view */}
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {items.map((item) => {
          const isSelected = item.selectedBy?.includes(userIdentifier!);
          const isTaken = (item.selectedBy?.length || 0) > 0 && !isSelected;
          return (
            <TouchableOpacity key={item.id} onPress={() => sessionData.stage === 'selecting' && !isTaken && toggleItemSelection(item.id)}
              style={{ backgroundColor: isSelected ? '#ecfdf5' : isTaken ? '#f9fafb' : 'white', padding: 20, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: isSelected ? '#10b981' : '#f3f4f6', opacity: isTaken ? 0.6 : 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '700', fontSize: 16 }}>{item.name}</Text>
                <Text style={{ fontWeight: '900' }}>${item.price.toFixed(2)}</Text>
              </View>
              {isTaken && (
                <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  {item.selectedByUsername?.[0] || "Someone"} claimed this
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer controls */}
      {isHost ? (
        <TouchableOpacity onPress={sessionData.stage === 'selecting' ? handleFinishSession : async () => await updateDoc(doc(db, "sessions", sessionId!), { stage: 'selecting' })} 
            style={{ backgroundColor: '#00966d', padding: 20, borderRadius: 20, marginTop: 10 }}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '900' }}>
              {sessionData.stage === 'selecting' ? "PROCEED TO SUMMARY" : "FINISH LIST"}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={{ padding: 20, borderRadius: 20, backgroundColor: '#f3f4f6', marginTop: 10 }}>
            <Text style={{ textAlign: 'center', fontWeight: '700', color: '#6b7280' }}>Waiting for host...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}