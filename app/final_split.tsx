import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from './firebase';
import { useAuth } from './hooks/useAuth';

interface UserSummary {
  id: string; 
  displayName: string;
  items: any[];
  subtotal: number;
}

export default function FinalSplitScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { user } = useAuth(); 
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<UserSummary[]>([]);
  const [sessionData, setSessionData] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Use a stable identifier to check "isMe"
  const myId = user?.uid || user?.email || user?.phoneNumber;

  useEffect(() => {
    if (!sessionId) return;
    
    const unsub = onSnapshot(doc(db, "sessions", sessionId), (snap) => {
      if (!snap.exists()) {
        router.replace('/'); 
        return;
      }

      const data = snap.data();
      setSessionData(data);

      // CRITICAL: Initialize empty map to prevent "undefined" errors
      const userMap: { [key: string]: UserSummary } = {};
      const pIDs = data.participants || [];
      const pNames = data.participantUsernames || [];

      pIDs.forEach((id: string, index: number) => {
        if (!id) return; // Skip if ID is null/undefined

        const isMe = (id === user?.uid || id === user?.email || id === user?.phoneNumber);
        
        // Robust Name Selection
        let nameToDisplay = "User";
        if (isMe && user?.username) {
          nameToDisplay = user.username;
        } else if (pNames[index]) {
          nameToDisplay = pNames[index];
        } else {
          nameToDisplay = `Member ${index + 1}`;
        }

        userMap[id] = { 
          id, 
          displayName: nameToDisplay, 
          items: [], 
          subtotal: 0 
        };
      });

      // Assign Items
      const items = data.items || [];
      items.forEach((item: any) => {
        if (item.selectedBy && Array.isArray(item.selectedBy)) {
          item.selectedBy.forEach((selectorId: string) => {
            if (userMap[selectorId]) {
              userMap[selectorId].items.push(item);
              // Divide price by number of people who split it
              userMap[selectorId].subtotal += (item.price / item.selectedBy.length);
            }
          });
        }
      });

      setSummaries(Object.values(userMap));
      setLoading(false);
    }, () => {
      router.replace('/');
    });
    
    return () => unsub();
  }, [sessionId, user, router]); 

  const isHost = user?.uid === sessionData?.hostId;

  const handleGoBack = async () => {
    if (!isHost) return;
    try {
      await updateDoc(doc(db, "sessions", sessionId!), { status: 'active' });
      router.back();
    } catch {
      router.replace('/(tabs)/billing');
    }
  };

  const handleKick = (targetId: string, targetName: string) => {
    Alert.alert("Kick Member", `Remove ${targetName}?`, [
      { text: "Cancel" },
      { 
        text: "KICK", 
        style: "destructive", 
        onPress: async () => {
          // Check sessionData existence immediately before logic
          if (!sessionData || !sessionData.participants) return;

          try {
            const currentParticipants = [...sessionData.participants];
            const currentNames = [...(sessionData.participantUsernames || [])];
            
            const idx = currentParticipants.indexOf(targetId);
            if (idx > -1) {
              currentParticipants.splice(idx, 1);
              // Only splice names if the array exists and has that index
              if (currentNames.length > idx) {
                currentNames.splice(idx, 1);
              }

              if (currentParticipants.length === 0) {
                await deleteDoc(doc(db, "sessions", sessionId!));
              } else {
                await updateDoc(doc(db, "sessions", sessionId!), {
                  participants: currentParticipants,
                  participantUsernames: currentNames
                });
              }
            }
          } catch (err) {
            console.error("Kick Logic Error:", err);
          }
        } 
      }
    ]);
  };

  const handleLeave = async () => {
    if (!sessionData || !myId) return;
    try {
      const p = [...sessionData.participants];
      const n = [...(sessionData.participantUsernames || [])];
      const idx = p.indexOf(myId);
      if (idx > -1) {
        p.splice(idx, 1);
        if (n.length > idx) n.splice(idx, 1);
        await updateDoc(doc(db, "sessions", sessionId!), { participants: p, participantUsernames: n });
      }
      router.replace('/');
    } catch {
      router.replace('/');
    }
  };

  if (loading || !sessionData) return <ActivityIndicator style={{ flex: 1 }} color="#00966d" />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white', padding: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        {isHost && (
          <TouchableOpacity onPress={handleGoBack} style={{ marginRight: 15 }}>
            <Ionicons name="arrow-back" size={28} color="#00966d" />
          </TouchableOpacity>
        )}
        <Text style={{ fontSize: 32, fontWeight: '900', color: 'black' }}>Totals</Text>
        <TouchableOpacity onPress={() => setShowSettings(true)} style={{ marginLeft: 'auto' }}>
          <Ionicons name="settings-sharp" size={26} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {summaries.map((u) => (
          <View key={u.id} style={{ backgroundColor: '#f9fafb', borderRadius: 24, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#e5e7eb' }}>
            <Text style={{ fontSize: 18, fontWeight: '800', marginBottom: 10 }}>{u.displayName}</Text>
            {u.items.map((item, i) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                <Text style={{ color: '#4b5563' }}>{item.name}</Text>
                <Text style={{ color: '#6b7280' }}>${(item.price / item.selectedBy.length).toFixed(2)}</Text>
              </View>
            ))}
            <View style={{ borderTopWidth: 1, borderColor: '#e5e7eb', marginTop: 10, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>Total</Text>
              <Text style={{ fontWeight: '900', color: '#00966d', fontSize: 18 }}>${u.subtotal.toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Settings Modal */}
      <Modal visible={showSettings} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ fontSize: 22, fontWeight: '800' }}>Settings</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}><Ionicons name="close" size={28} /></TouchableOpacity>
            </View>
            
            {isHost ? (
              summaries.filter(s => s.id !== myId).map(s => (
                <View key={s.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderColor: '#f3f4f6' }}>
                  <Text style={{ fontSize: 16 }}>{s.displayName}</Text>
                  <TouchableOpacity onPress={() => handleKick(s.id, s.displayName)}>
                    <Text style={{ color: '#ef4444', fontWeight: '700' }}>Kick</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <TouchableOpacity onPress={handleLeave} style={{ paddingVertical: 15 }}>
                <Text style={{ color: '#ef4444', fontSize: 18, fontWeight: '700' }}>Leave Session</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      <TouchableOpacity 
        onPress={isHost ? () => Alert.alert("End", "Close session?", [{text: "No"}, {text: "Yes", onPress: () => deleteDoc(doc(db, "sessions", sessionId!))}]) : handleLeave} 
        style={{ backgroundColor: isHost ? '#00966d' : '#ef4444', padding: 20, borderRadius: 20, marginTop: 10 }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '900' }}>{isHost ? "END SESSION" : "LEAVE"}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}