import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Firebase database tools
import { collection, deleteDoc, doc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";

// Custom logic for auth, invitations, and SPLITTING
import { useAuth } from "../hooks/useAuth";
import { createSessionAndInvite, joinSession } from "../services/invite";
import { equalSplit } from "../utils/split";

export default function HomeScreen() {
  // UI State
  const [showOptions, setShowOptions] = useState(false); 
  const [showInvite, setShowInvite] = useState(false);   
  const [showHostOptions, setShowHostOptions] = useState(false); 
  const [isConnecting, setIsConnecting] = useState(false); 

  // --- BYPASS & MANUAL STATES ---
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualItemName, setManualItemName] = useState("");
  const [manualItemPrice, setManualItemPrice] = useState("");

  // Hosting State
  const [inviteEmail, setInviteEmail] = useState("");
  const [participants, setParticipants] = useState<string[]>([]); 
  const [isCreating, setIsCreating] = useState(false); 
  const [isRoomCreated, setIsRoomCreated] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null); 
  const [joinedCount, setJoinedCount] = useState(1); 
  
  // Joining State
  const [invites, setInvites] = useState<any[]>([]);
  const [isLoadingInvites, setIsLoadingInvites] = useState(true);

  const router = useRouter();
  const { user } = useAuth(); 
  const MAX_PARTICIPANTS = 10;

  // Listen for incoming invites (Real-time)
  useEffect(() => {
    if (!user?.email) return;
    const cleanUserEmail = user.email.trim().toLowerCase();
    const q = query(
      collection(db, "invites"),
      where("invitedEmail", "==", cleanUserEmail),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const inviteList = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setInvites(inviteList);
      setIsLoadingInvites(false);
    });

    return () => unsubscribe();
  }, [user?.email]);

  // Watch session for participant joins
  useEffect(() => {
    if (!sessionId) return;
    const unsubscribe = onSnapshot(doc(db, "sessions", sessionId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.participants) setJoinedCount(data.participants.length);
      }
    });
    return () => unsubscribe();
  }, [sessionId]);

  const handleBack = () => {
    if (showManualEntry) return setShowManualEntry(false);
    if (showHostOptions) {
      setShowHostOptions(false);
      setShowInvite(true);
    } else if (showInvite) {
      setShowInvite(false);
      setIsRoomCreated(false);
      setSessionId(null);
      setParticipants([]);
    } else {
      setShowOptions(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!user?.email) return;
    setIsCreating(true);
    try {
      const newId = await createSessionAndInvite(user.email, participants, user.displayName || "Host");
      setSessionId(newId);
      setIsRoomCreated(true); 
    } catch {
      // Removed the _err variable to fix the ESLint warning
      Alert.alert("Error", "Failed to create session.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleAcceptInvite = async (invite: any) => {
    try {
      await joinSession(invite.sessionId, user?.email || "", invite.id);
      router.push({
        pathname: '/splitpay/join',
        params: { sessionId: invite.sessionId, inviteId: invite.id }
      });
      setIsConnecting(false);
    } catch {
      // Removed the _err variable to fix the ESLint warning
      Alert.alert("Error", "Could not join session.");
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    try {
      await deleteDoc(doc(db, "invites", inviteId));
    } catch (err) {
      // Keep this one if you want to see what went wrong in the console
      console.error("Failed to decline invite:", err);
    }
  };

  const addParticipant = () => {
    if (participants.length >= MAX_PARTICIPANTS) return Alert.alert("Limit Reached", "Max 10 people.");
    const cleanEmail = inviteEmail.trim().toLowerCase();
    if (cleanEmail && cleanEmail.includes("@")) {
      if (cleanEmail === user?.email?.toLowerCase()) return Alert.alert("Error", "You are the host!");
      setParticipants([...participants, cleanEmail]);
      setInviteEmail(""); 
    }
  };

  const handleManualSplit = () => {
    const price = parseFloat(manualItemPrice);
    if (isNaN(price) || price <= 0) return Alert.alert("Invalid Price", "Please enter a valid amount.");

    const everyone = [user?.email || "Host", ...participants];
    try {
      const results = equalSplit(price, everyone);
      console.log("Manual Split Calculated:", results);
      router.push({
        pathname: "/billing",
        params: { method: "manual", total: manualItemPrice, itemName: manualItemName }
      });
    } catch {
      // Removed the _err variable to fix the ESLint warning
      Alert.alert("Split Error", "Could not calculate the split.");
    }
  };

  if (isConnecting) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, padding: 32, justifyContent: 'center' }}>
          <TouchableOpacity onPress={() => setIsConnecting(false)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Ionicons name="arrow-back" size={24} color="#2563eb" />
            <Text style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 18, marginLeft: 8 }}>Back</Text>
          </TouchableOpacity>

          <View style={{ backgroundColor: '#f3f4f6', borderRadius: 40, padding: 32, aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#e5e7eb' }}>
            <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 24, textAlign: 'center', color: '#1f2937' }}>
              {isLoadingInvites ? "Checking for Invites" : invites.length > 0 ? "Invites Found!" : "No Invites Found"}
            </Text>

            {isLoadingInvites ? (
              <ActivityIndicator size="large" color="#2563eb" />
            ) : invites.length === 0 ? (
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="mail-unread-outline" size={64} color="#9ca3af" />
                <TouchableOpacity 
                  onPress={() => setShowManualEntry(true)} 
                  style={{ marginTop: 24, backgroundColor: '#ef4444', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Bypass & Manual Enter</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView style={{ width: '100%' }}>
                {invites.map((invite) => (
                  <View key={invite.id} style={{ backgroundColor: 'white', padding: 16, borderRadius: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontWeight: '700', fontSize: 15, flex: 1 }}>{`${invite.hostName}'s Group`}</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity onPress={() => handleAcceptInvite(invite)} style={{ backgroundColor: '#00966d', padding: 10, borderRadius: 12 }}>
                        <Ionicons name="checkmark" size={20} color="white" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeclineInvite(invite.id)} style={{ backgroundColor: '#ef4444', padding: 10, borderRadius: 12 }}>
                        <Ionicons name="close" size={20} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>

        <Modal visible={showManualEntry} animationType="slide">
            <SafeAreaView style={{ flex: 1, padding: 32 }}>
               <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Manual Bill Entry</Text>
               <TextInput placeholder="Item Name (e.g. Pizza)" value={manualItemName} onChangeText={setManualItemName} style={{ backgroundColor: '#f3f4f6', padding: 16, borderRadius: 12, marginBottom: 12 }} />
               <TextInput placeholder="Total Price (0.00)" keyboardType="decimal-pad" value={manualItemPrice} onChangeText={setManualItemPrice} style={{ backgroundColor: '#f3f4f6', padding: 16, borderRadius: 12, marginBottom: 24 }} />
               <TouchableOpacity onPress={handleManualSplit} style={{ backgroundColor: '#00966d', padding: 20, borderRadius: 16 }}>
                 <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>SPLIT NOW</Text>
               </TouchableOpacity>
               <TouchableOpacity onPress={() => setShowManualEntry(false)} style={{ marginTop: 20 }}><Text style={{ color: '#ef4444', textAlign: 'center' }}>Cancel</Text></TouchableOpacity>
            </SafeAreaView>
         </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 40 }}>
          {!showOptions ? (
            <View style={{ alignItems: 'center', marginTop: 20 }}>
              <Text style={{ fontSize: 72, fontWeight: '900' }}>PayUp</Text>
              <TouchableOpacity onPress={() => setShowOptions(true)} style={{ backgroundColor: '#00966d', paddingVertical: 40, borderRadius: 24, width: '100%', marginTop: 40 }}>
                <Text style={{ color: 'white', textAlign: 'center', fontWeight: '900', fontSize: 36 }}>SplitPay</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ width: '100%' }}>
              <TouchableOpacity onPress={handleBack} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <Ionicons name="arrow-back" size={24} color="#00966d" />
                <Text style={{ color: '#00966d', fontWeight: 'bold', fontSize: 18, marginLeft: 8 }}>Back</Text>
              </TouchableOpacity>

              <View style={{ backgroundColor: '#f3f4f6', padding: 24, borderRadius: 24 }}>
                {!showInvite && !showHostOptions && (
                  <>
                    <TouchableOpacity onPress={() => setShowInvite(true)} style={{ backgroundColor: '#00966d', padding: 20, borderRadius: 16, marginBottom: 12 }}>
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>Create Group (Host)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsConnecting(true)} style={{ backgroundColor: '#2563eb', padding: 20, borderRadius: 16 }}>
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>Join Group (Participant)</Text>
                    </TouchableOpacity>
                  </>
                )}

                {showInvite && !showHostOptions && (
                  <View>
                    <Text style={{ color: '#6b7280', textAlign: 'center', marginBottom: 10 }}>
                      {isRoomCreated ? `${joinedCount - 1} / ${participants.length} Friends Joined` : "Add friends to start"}
                    </Text>
                    {!isRoomCreated && (
                      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                        <TextInput placeholder="Invite by email" value={inviteEmail} onChangeText={setInviteEmail} autoCapitalize="none" style={{ flex: 1, backgroundColor: 'white', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#d1d5db' }} />
                        <TouchableOpacity onPress={addParticipant} style={{ backgroundColor: '#00966d', padding: 12, borderRadius: 12, marginLeft: 8 }}><Ionicons name="mail-outline" size={24} color="white" /></TouchableOpacity>
                      </View>
                    )}
                    <View style={{ marginBottom: 20 }}>
                      {participants.map((email, i) => (
                        <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: 'white', borderRadius: 8, marginBottom: 8 }}>
                          <Text>{email}</Text>
                          {!isRoomCreated && <TouchableOpacity onPress={() => setParticipants(participants.filter((_, idx) => idx !== i))}><Ionicons name="trash-outline" size={20} color="#ef4444" /></TouchableOpacity>}
                        </View>
                      ))}
                    </View>
                    <TouchableOpacity onPress={isRoomCreated ? () => setShowHostOptions(true) : handleCreateRoom} disabled={participants.length === 0 || isCreating} style={{ backgroundColor: (participants.length > 0 || isRoomCreated) ? '#00966d' : '#9ca3af', padding: 20, borderRadius: 16 }}>
                      <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>{isCreating ? "CREATING..." : isRoomCreated ? "START SESSION" : "SEND INVITES"}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {showHostOptions && (
                  <>
                    <TouchableOpacity onPress={() => router.push({ pathname: '/splitpay/create/scan', params: { sessionId } })} style={{ borderWidth: 2, borderColor: '#00966d', padding: 18, borderRadius: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'center' }}>
                      <Ionicons name="receipt" size={20} color="#00966d" style={{ marginRight: 10 }} />
                      <Text style={{ color: '#00966d', fontWeight: 'bold' }}>Itemized (OCR)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowManualEntry(true)} style={{ backgroundColor: '#ef4444', padding: 18, borderRadius: 16, flexDirection: 'row', justifyContent: 'center' }}>
                      <Ionicons name="create-outline" size={20} color="white" style={{ marginRight: 10 }} />
                      <Text style={{ color: 'white', fontWeight: 'bold' }}>Bypass OCR (Manual)</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}