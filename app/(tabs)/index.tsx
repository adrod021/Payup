import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { and, collection, deleteDoc, doc, onSnapshot, or, query, updateDoc, where } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { createSessionAndInvite, joinSession } from "../services/invite";

export default function HomeScreen() {
  const [showOptions, setShowOptions] = useState(false); 
  const [showInvite, setShowInvite] = useState(false);   
  const [isConnecting, setIsConnecting] = useState(false); 
  const [showSplitMethods, setShowSplitMethods] = useState(false);

  const [invites, setInvites] = useState<any[]>([]);
  const [isLoadingInvites, setIsLoadingInvites] = useState(true);

  const [inviteInput, setInviteInput] = useState(""); 
  const [isCreating, setIsCreating] = useState(false); 
  const [isRoomCreated, setIsRoomCreated] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null); 
  const [sessionHostId, setSessionHostId] = useState<string | null>(null);
  const [joinedCount, setJoinedCount] = useState(1); 
  
  const router = useRouter();
  const { user } = useAuth(); 

  const handleBack = useCallback(() => {
    if (showSplitMethods) return setShowSplitMethods(false);
    if (isConnecting) return setIsConnecting(false);
    if (showInvite) {
      setShowInvite(false);
      setIsRoomCreated(false);
      setSessionId(null);
      return;
    }
    setShowOptions(false);
  }, [isConnecting, showInvite, showSplitMethods]);

  const handleAddParticipant = async () => {
    if (!inviteInput || !user || isCreating) return;
    const newParticipant = inviteInput.trim();
    setIsCreating(true);
    try {
      const id = await createSessionAndInvite(user, [newParticipant], sessionId || undefined);
      if (!sessionId) {
        setSessionId(id);
        setSessionHostId(user.uid);
      }
      setInviteInput("");
    } catch {
      Alert.alert("Error", "Could not send invite.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleAcceptInvite = async (invite: any) => {
    try {
      await joinSession(invite.sessionId, user!.uid, invite.id);
      setIsConnecting(false);
      setSessionId(invite.sessionId);
      setShowInvite(true);
      setIsRoomCreated(true);
    } catch {
      Alert.alert("Error", "Could not join session.");
    }
  };

  const startMode = async (mode: 'itemized' | 'roulette', method?: 'scan' | 'manual') => {
    if (!sessionId) return;
    await updateDoc(doc(db, "sessions", sessionId), { status: mode, stage: 'creating' });
    
    if (mode === 'itemized') {
      router.push({ pathname: '/manual_split', params: { sessionId, method } });
    } else {
      router.push({ pathname: '/splitpay/create/roulette_spin', params: { sessionId } });
    }
  };

  useEffect(() => {
    if (!user) return;
    const email = user.email?.toLowerCase().trim() || "no-email";
    const phone = user.phoneNumber || "no-phone";
    const qInvites = query(collection(db, "invites"), and(where("status", "==", "pending"), or(where("invitedEmail", "==", email), where("invitedPhone", "==", phone))));
    const unsubInvites = onSnapshot(qInvites, (snapshot) => { 
      setInvites(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))); 
      setIsLoadingInvites(false); 
    });
    return () => unsubInvites();
  }, [user]);

  useEffect(() => {
    if (!sessionId || !user) return;
    const unsub = onSnapshot(doc(db, "sessions", sessionId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setJoinedCount(data.participants?.length || 1);
        setSessionHostId(data.hostId);

        const isHost = user?.uid === data.hostId;
        if (!isHost) {
          if (data.status === "itemized") {
            router.push({ pathname: '/manual_split', params: { sessionId } });
          } else if (data.status === "roulette") {
            router.push({ pathname: '/splitpay/create/roulette_spin', params: { sessionId } });
          }
        }
      } else {
        handleBack();
      }
    });
    return () => unsub();
  }, [sessionId, user, router, handleBack]);

  const isHost = !sessionId || user?.uid === sessionHostId;
  const canStart = joinedCount > 1; // Requirement: At least one person accepted the invite

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 20 }}>
          {(showOptions || showInvite || isConnecting) && (
            <TouchableOpacity onPress={handleBack}><Ionicons name="arrow-back" size={24} color="#00966d" /></TouchableOpacity>
          )}
        </View>

        {isConnecting ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 20 }}>Waiting for Invites</Text>
            <View style={{ width: '100%', backgroundColor: '#f3f4f6', borderRadius: 40, padding: 24, minHeight: 300 }}>
              {isLoadingInvites ? <ActivityIndicator color="#00966d" size="large" /> : (
                invites.length > 0 ? (
                  <ScrollView>
                    {invites.map(i => (
                      <View key={i.id} style={{ backgroundColor: 'white', padding: 16, borderRadius: 20, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontWeight: '800', flex: 1 }}>{i.hostName}&apos;s Room</Text>
                        <View style={{ flexDirection: 'row' }}>
                          <TouchableOpacity onPress={() => handleAcceptInvite(i)} style={{ marginRight: 15 }}><Ionicons name="checkmark-circle" size={32} color="#00966d" /></TouchableOpacity>
                          <TouchableOpacity onPress={() => deleteDoc(doc(db, "invites", i.id))}><Ionicons name="close-circle" size={32} color="#ef4444" /></TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={{ color: '#6b7280', textAlign: 'center', fontWeight: '600', fontSize: 16 }}>No Invites Yet!</Text>
                )
              )}
            </View>
          </View>
        ) : !showOptions ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={{ fontSize: 72, fontWeight: '900', textAlign: 'center', marginBottom: 40 }}>PayUp</Text>
            <TouchableOpacity onPress={() => setShowOptions(true)} style={{ backgroundColor: '#00966d', paddingVertical: 40, borderRadius: 24 }}>
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: '900', fontSize: 36 }}>SplitPay</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            {!showInvite ? (
              <View>
                <TouchableOpacity onPress={() => setShowInvite(true)} style={{ backgroundColor: '#00966d', padding: 25, borderRadius: 20, marginBottom: 15 }}>
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20, textAlign: 'center' }}>Host a Session</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsConnecting(true)} style={{ backgroundColor: '#2563eb', padding: 25, borderRadius: 20 }}>
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20, textAlign: 'center' }}>Join a Session</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ width: '100%', alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: '800', marginBottom: 10 }}>
                   {sessionId ? `Joined: ${joinedCount}` : "Invite via Email/Phone"}
                </Text>

                {isRoomCreated ? (
                  isHost ? (
                    <View style={{ width: '100%', marginTop: 20 }}>
                      {!showSplitMethods ? (
                        <>
                          <TouchableOpacity onPress={() => setShowSplitMethods(true)} style={{ backgroundColor: '#00966d', padding: 20, borderRadius: 16, marginBottom: 10 }}>
                            <Text style={{ color: 'white', fontWeight: '900', textAlign: 'center' }}>ITEMIZED SPLIT</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => startMode('roulette')} style={{ backgroundColor: '#2563eb', padding: 20, borderRadius: 16 }}>
                            <Text style={{ color: 'white', fontWeight: '900', textAlign: 'center' }}>ROULETTE SPIN</Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <View style={{ width: '100%' }}>
                          <TouchableOpacity onPress={() => startMode('itemized', 'scan')} style={{ backgroundColor: '#00966d', padding: 20, borderRadius: 16, marginBottom: 10 }}>
                            <Text style={{ color: 'white', textAlign: 'center', fontWeight: '900' }}>SCAN RECEIPT (OCR)</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => startMode('itemized', 'manual')} style={{ backgroundColor: '#2563eb', padding: 20, borderRadius: 16 }}>
                            <Text style={{ color: 'white', textAlign: 'center', fontWeight: '900' }}>MANUALLY ADD ITEMS</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={{ marginTop: 40, alignItems: 'center' }}>
                      <ActivityIndicator color="#00966d" size="large" />
                      <Text style={{ marginTop: 20, fontWeight: '700', color: '#6b7280' }}>Joined! Waiting for host...</Text>
                    </View>
                  )
                ) : (
                  <>
                    <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                      <TextInput placeholder="Email or Phone" value={inviteInput} onChangeText={setInviteInput} style={{ flex: 1, backgroundColor: '#f3f4f6', padding: 15, borderRadius: 15 }} />
                      <TouchableOpacity onPress={handleAddParticipant} style={{ backgroundColor: '#00966d', padding: 15, borderRadius: 15, marginLeft: 10 }}>
                        <Ionicons name="add" size={24} color="white" />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => setIsRoomCreated(true)} disabled={!canStart} style={{ backgroundColor: canStart ? '#00966d' : '#9ca3af', padding: 20, borderRadius: 16, width: '100%' }}>
                      <Text style={{ color: 'white', fontWeight: '900', textAlign: 'center' }}>START SESSION</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}