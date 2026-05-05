import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { arrayUnion, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from './firebase';
import { useAuth } from './hooks/useAuth';

export default function ManualSplitScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const navigationLock = useRef(false);

  const [items, setItems] = useState<any[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [sessionData, setSessionData] = useState<any>(null);
  const [myUsername, setMyUsername] = useState('New User');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) setMyUsername(snap.data().username || user.displayName || "New User");
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!sessionId || !user?.uid) return;

    const unsub = onSnapshot(doc(db, "sessions", sessionId), (snap) => {
      if (!snap.exists()) {
        router.replace('/(tabs)');
        return;
      }
      const data = snap.data();
      
      if (data.participants && data.participants.length < 2) {
        deleteDoc(doc(db, "sessions", sessionId));
        router.replace('/(tabs)');
        return;
      }

      if (data.participants && !data.participants.includes(user.uid)) {
        router.replace('/(tabs)');
        return;
      }

      setSessionData(data);
      setItems(data.items || []);
      
      // Navigate forward to summary only if the stage is set to summary
      if (data.stage === 'summary' && !navigationLock.current) {
        navigationLock.current = true;
        router.push({pathname: './final_split', params: { sessionId } });
      } else if (data.stage !== 'summary') {
        navigationLock.current = false; // Reset lock if we move back
      }
    });
    return () => unsub();
  }, [sessionId, user?.uid, router]);

  const isHost = user?.uid === sessionData?.hostId;

  const handleBackToSetup = async () => {
    await updateDoc(doc(db, "sessions", sessionId!), { stage: 'setup' });
  };

  const confirmCloseSession = () => {
    Alert.alert("Close Session", "End this session for everyone?", [
      { text: "Cancel", style: "cancel" },
      { text: "Yes, Close", style: "destructive", onPress: async () => {
          await deleteDoc(doc(db, "sessions", sessionId!));
          router.replace('/(tabs)');
      }}
    ]);
  };

  const handleProceed = async () => {
    if (!sessionData) return;
    if (sessionData.stage === 'selecting') {
      const allSelected = items.every(item => item.selectedBy && item.selectedBy.length > 0);
      if (!allSelected) {
        Alert.alert("Action Required", "All items must be selected before proceeding.");
        return;
      }
      await updateDoc(doc(db, "sessions", sessionId!), { stage: 'summary' });
    } else {
      await updateDoc(doc(db, "sessions", sessionId!), { stage: 'selecting' });
    }
  };

  const addItem = async () => {
    if (!newItemName || !newItemPrice) return;
    const item = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItemName,
      price: parseFloat(newItemPrice),
      selectedBy: [],
      selectedByUsername: []
    };
    await updateDoc(doc(db, "sessions", sessionId!), { items: arrayUnion(item) });
    setNewItemName(''); setNewItemPrice('');
  };

  const toggleItemSelection = async (itemId: string) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        const hasSelected = item.selectedBy?.includes(user?.uid);
        return {
          ...item,
          selectedBy: hasSelected ? [] : [user?.uid],
          selectedByUsername: hasSelected ? [] : [myUsername] 
        };
      }
      return item;
    });
    await updateDoc(doc(db, "sessions", sessionId!), { items: updatedItems });
  };

  const handleKick = async (targetUid: string, index: number) => {
    if (!sessionData) return;
    const update = {
      participants: sessionData.participants.filter((_: any, i: number) => i !== index),
      participantUsernames: sessionData.participantUsernames.filter((_: any, i: number) => i !== index),
      participantEmails: (sessionData.participantEmails || []).filter((_: any, i: number) => i !== index),
      participantPhones: (sessionData.participantPhones || []).filter((_: any, i: number) => i !== index),
    };
    await updateDoc(doc(db, "sessions", sessionId!), update);
  };

  if (!sessionData) return <View style={{flex:1, justifyContent:'center'}}><ActivityIndicator color="#00966d" /></View>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 }}>
        {isHost && sessionData.stage === 'selecting' ? (
          <TouchableOpacity onPress={handleBackToSetup}>
            <Ionicons name="arrow-back" size={28} color="#00966d" />
          </TouchableOpacity>
        ) : <View style={{ width: 28 }} />}
        
        <Text style={{ fontSize: 22, fontWeight: '900' }}>
          {sessionData.stage === 'selecting' ? "Claim Items" : "Create List"}
        </Text>
        
        <TouchableOpacity onPress={() => setShowSettings(true)}>
          <Ionicons name="settings-sharp" size={26} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        {isHost && sessionData.stage !== 'selecting' && (
          <View style={{ marginBottom: 20 }}>
            <TextInput placeholder="Item Name" value={newItemName} onChangeText={setNewItemName} style={{ backgroundColor: '#f9fafb', padding: 15, borderRadius: 14, marginBottom: 10 }} />
            <TextInput placeholder="$ 0.00" value={newItemPrice} onChangeText={setNewItemPrice} keyboardType="numeric" style={{ backgroundColor: '#f9fafb', padding: 15, borderRadius: 14, marginBottom: 10 }} />
            <TouchableOpacity onPress={addItem} style={{ backgroundColor: '#00966d', padding: 15, borderRadius: 14 }}>
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: '900' }}>ADD TO LIST</Text>
            </TouchableOpacity>
          </View>
        )}

        {items.map((item) => {
          const isSelected = item.selectedBy?.includes(user?.uid);
          const isTaken = (item.selectedBy?.length || 0) > 0 && !isSelected;
          return (
            <TouchableOpacity key={item.id} onPress={() => sessionData.stage === 'selecting' && !isTaken && toggleItemSelection(item.id)}
              style={{ 
                backgroundColor: isSelected ? '#ecfdf5' : (isTaken ? '#f3f4f6' : 'white'), 
                padding: 18, borderRadius: 15, marginBottom: 10, borderWidth: 1, 
                borderColor: isSelected ? '#10b981' : '#f3f4f6' 
              }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '700', color: isTaken ? '#9ca3af' : 'black' }}>{item.name}</Text>
                <Text style={{ fontWeight: '900', color: isTaken ? '#9ca3af' : 'black' }}>${item.price.toFixed(2)}</Text>
              </View>
              {isTaken && <Text style={{ fontSize: 12, color: '#9ca3af' }}>{item.selectedByUsername?.[0]} claimed this</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={{ padding: 20 }}>
        {isHost ? (
          <TouchableOpacity onPress={handleProceed} style={{ backgroundColor: '#00966d', padding: 20, borderRadius: 20 }}>
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: '900' }}>
              {sessionData.stage === 'selecting' ? "PROCEED TO SUMMARY" : "FINISH LIST"}
            </Text>
          </TouchableOpacity>
        ) : <Text style={{ textAlign: 'center', color: '#6b7280' }}>Waiting for host...</Text>}
      </View>

      <Modal visible={showSettings} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ fontSize: 22, fontWeight: '800' }}>Session Settings</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}><Ionicons name="close" size={28} /></TouchableOpacity>
            </View>
            {isHost ? (
              <>
                {sessionData.participants.map((uid: string, i: number) => uid !== user?.uid && (
                  <View key={uid} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderColor: '#eee' }}>
                    <View>
                      <Text style={{ fontWeight: '700', color: 'black' }}>{sessionData.participantUsernames[i]}</Text>
                      <Text style={{ fontSize: 12, color: '#9ca3af' }}>{sessionData.participantEmails?.[i] || sessionData.participantPhones?.[i] || "No contact info"}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleKick(uid, i)} style={{ backgroundColor: '#fee2e2', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 }}>
                      <Text style={{ color: '#ef4444', fontWeight: '800' }}>Kick</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity onPress={confirmCloseSession} style={{ marginTop: 20, backgroundColor: '#fee2e2', padding: 20, borderRadius: 20 }}>
                  <Text style={{ color: '#ef4444', textAlign: 'center', fontWeight: '800' }}>CLOSE SESSION</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={{ paddingVertical: 20, backgroundColor: '#fee2e2', borderRadius: 20, marginTop: 10 }}>
                <Text style={{ color: '#ef4444', fontWeight: '800', textAlign: 'center' }}>LEAVE SESSION</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}