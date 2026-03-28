import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Firebase database tools
import { collection, deleteDoc, doc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";

// Custom logic for auth and invitations
import { useAuth } from "../hooks/useAuth";
import { createSessionAndInvite } from "../services/invite";

export default function HomeScreen() {
  // UI State: Controls which "Step" or "Menu" the user is seeing
  const [showOptions, setShowOptions] = useState(false); 
  const [showInvite, setShowInvite] = useState(false);   
  const [showHostOptions, setShowHostOptions] = useState(false); 
  const [isConnecting, setIsConnecting] = useState(false); 

  // Hosting State: Manages the group creation process
  const [inviteEmail, setInviteEmail] = useState("");
  const [participants, setParticipants] = useState<string[]>([]); 
  const [isCreating, setIsCreating] = useState(false); 
  const [isRoomCreated, setIsRoomCreated] = useState(false);
  
  const [sessionId, setSessionId] = useState<string | null>(null); 
  const [joinedCount, setJoinedCount] = useState(1); 
  
  // Joining State: Manages incoming invites from friends
  const [invites, setInvites] = useState<any[]>([]);
  const [isLoadingInvites, setIsLoadingInvites] = useState(true);

  const router = useRouter();
  const { user } = useAuth(); 
  const MAX_PARTICIPANTS = 10;

  // Listen for incoming invites sent to the current user
  useEffect(() => {
    if (!user?.email) return;
    setIsLoadingInvites(true);
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

  // If hosting, watch the session to see when friends actually join
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

  // Handles moving back through the various menu levels
  const handleBack = () => {
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

  // Creates the session in Firebase and sends invites to the listed emails
  const handleCreateRoom = async () => {
    if (!user?.email) return;
    setIsCreating(true);
    try {
      const newId = await createSessionAndInvite(user.email, participants, user.displayName || "Someone");
      setSessionId(newId);
      setIsRoomCreated(true); 
    } catch (err) {
      console.error("Room creation error:", err);
      Alert.alert("Error", "Failed to create session. Check your connection.");
    } finally {
      setIsCreating(false);
    }
  };

  // Navigate to the join screen when an invite is accepted
  const handleAcceptInvite = (invite: any) => {
    router.push({
      pathname: '/splitpay/join',
      params: { sessionId: invite.sessionId, inviteId: invite.id }
    });
    setIsConnecting(false);
  };

  // Deletes an invite from Firebase if the user declines it
  const handleDeclineInvite = async (inviteId: string) => {
    try {
      await deleteDoc(doc(db, "invites", inviteId));
    } catch (err) {
      console.error("Decline error:", err);
    }
  };

  // Adds an email to the temporary participant list before sending invites
  const addParticipant = () => {
    if (participants.length >= MAX_PARTICIPANTS) return Alert.alert("Limit Reached", "Max 10 people.");
    const cleanEmail = inviteEmail.trim().toLowerCase();
    if (cleanEmail && cleanEmail.includes("@")) {
      if (cleanEmail === user?.email?.toLowerCase()) return Alert.alert("Error", "You are the host!");
      setParticipants([...participants, cleanEmail]);
      setInviteEmail(""); 
    }
  };

  // View: The "Join Group" overlay shows pending invites
  if (isConnecting) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, padding: 32, justifyContent: 'center' }}>
          <TouchableOpacity onPress={() => setIsConnecting(false)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Ionicons name="arrow-back" size={24} color="#2563eb" />
            <Text style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 18, marginLeft: 8 }}>Back</Text>
          </TouchableOpacity>

          <View style={{ 
            backgroundColor: '#f3f4f6', borderRadius: 40, padding: 32, aspectRatio: 1, 
            justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#e5e7eb' 
          }}>
            <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 24, textAlign: 'center', color: '#1f2937' }}>
              {isLoadingInvites ? "Checking for Invites" : invites.length > 0 ? "Invites Found!" : "No Invites Found"}
            </Text>

            {isLoadingInvites ? (
              <ActivityIndicator size="large" color="#2563eb" />
            ) : invites.length === 0 ? (
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="mail-unread-outline" size={64} color="#9ca3af" />
                <TouchableOpacity 
                  onPress={() => setIsLoadingInvites(true)} 
                  style={{ marginTop: 24, backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Refresh</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
                {invites.map((invite) => (
                  <View key={invite.id} style={{ backgroundColor: 'white', padding: 16, borderRadius: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2 }}>
                    <Text style={{ fontWeight: '700', fontSize: 15, flex: 1, color: '#374151' }}>
                      {`${invite.hostName || "Someone"}'s Group`}
                    </Text>
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
      </SafeAreaView>
    );
  }

  // Main view: Landing Page and Host/Join Toggle
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: 'white' }}>
        <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: showOptions ? 20 : 40 }}>
          
          {!showOptions ? (
            /* Initial state: Big Branding and Start Button */
            <View style={{ alignItems: 'center', marginTop: 20 }}>
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 72, fontWeight: '900', color: 'black', textAlign: 'center' }}>PayUp</Text>
                <Text style={{ fontSize: 18, color: '#6b7280', textAlign: 'center', marginTop: 40, fontWeight: '500' }}>
                  Start splitting bills here.
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowOptions(true)}
                style={{ backgroundColor: '#00966d', paddingVertical: 40, borderRadius: 24, width: '100%' }}
              >
                <Text style={{ color: 'white', textAlign: 'center', fontWeight: '900', fontSize: 36 }}>SplitPay</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Option states: Choosing to Host or Join */
            <View style={{ width: '100%', marginTop: 10 }}>
              <TouchableOpacity onPress={handleBack} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <Ionicons name="arrow-back" size={24} color="#00966d" />
                <Text style={{ color: '#00966d', fontWeight: 'bold', fontSize: 18, marginLeft: 8 }}>Back</Text>
              </TouchableOpacity>

              <View style={{ backgroundColor: '#f3f4f6', padding: 24, borderRadius: 24, borderWidth: 2, borderColor: '#e5e7eb' }}>
                <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 20, textAlign: 'center' }}>
                  {showHostOptions ? "Method Selection" : showInvite ? "Host a Session" : "Host or Join Group"}
                </Text>

                {!showInvite && !showHostOptions && (
                  <>
                    <TouchableOpacity onPress={() => setShowInvite(true)} style={{ backgroundColor: '#00966d', padding: 20, borderRadius: 16, marginBottom: 12 }}>
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>Create Group (Host)</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={() => setIsConnecting(true)} 
                      style={{ backgroundColor: '#2563eb', padding: 20, borderRadius: 16 }}
                    >
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>Join Group (Participant)</Text>
                    </TouchableOpacity>
                  </>
                )}

                {/* Invite view: Host adds friend emails and starts the room */}
                {showInvite && !showHostOptions && (
                  <View>
                    <Text style={{ color: '#6b7280', textAlign: 'center', marginBottom: 10 }}>
                      {isRoomCreated ? `${joinedCount - 1} / ${participants.length} Friends Joined` : "Add friends to start"}
                    </Text>
                    {!isRoomCreated && (
                      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                        <TextInput 
                          placeholder="Invite by email"
                          value={inviteEmail}
                          onChangeText={setInviteEmail}
                          autoCapitalize="none"
                          style={{ flex: 1, backgroundColor: 'white', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#d1d5db' }}
                        />
                        <TouchableOpacity onPress={addParticipant} style={{ backgroundColor: '#00966d', padding: 12, borderRadius: 12, marginLeft: 8 }}>
                          <Ionicons name="mail-outline" size={24} color="white" />
                        </TouchableOpacity>
                      </View>
                    )}
                    <View style={{ marginBottom: 20 }}>
                      {participants.map((email, index) => (
                        <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: 'white', borderRadius: 8, marginBottom: 8 }}>
                          <Text style={{ fontWeight: '500' }}>{email}</Text>
                          {!isRoomCreated && (
                            <TouchableOpacity onPress={() => {
                                const newList = [...participants];
                                newList.splice(index, 1);
                                setParticipants(newList);
                            }}>
                              <Ionicons name="trash-outline" size={20} color="#ef4444" />
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                    </View>
                    <TouchableOpacity 
                      onPress={isRoomCreated ? () => setShowHostOptions(true) : handleCreateRoom}
                      disabled={participants.length === 0 || isCreating}
                      style={{ backgroundColor: (participants.length > 0 || isRoomCreated) ? '#00966d' : '#9ca3af', padding: 20, borderRadius: 16 }}
                    >
                      <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                        {isCreating ? "CREATING..." : isRoomCreated ? (joinedCount < 2 ? "WAITING FOR FRIENDS..." : "START SESSION") : "SEND INVITES"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Methods: Host chooses between Scanning or Roulette */}
                {showHostOptions && (
                  <>
                    <TouchableOpacity onPress={() => router.push({ pathname: '/splitpay/create/scan', params: { host: user?.email, sessionId: sessionId || "" } })} style={{ borderWidth: 2, borderColor: '#00966d', padding: 18, borderRadius: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'center' }}>
                      <Ionicons name="receipt" size={20} color="#00966d" style={{ marginRight: 10 }} />
                      <Text style={{ color: '#00966d', fontWeight: 'bold' }}>Itemized</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push({ pathname: '/splitpay/create/roulette_spin', params: { host: user?.email, sessionId: sessionId || "" } })} style={{ borderWidth: 2, borderColor: '#475569', padding: 18, borderRadius: 16, flexDirection: 'row', justifyContent: 'center' }}>
                      <Image source={require('../../assets/images/roulette_7400514.png')} style={{ width: 24, height: 24, marginRight: 10, tintColor: '#475569' }} resizeMode="contain" />
                      <Text style={{ color: '#475569', fontWeight: 'bold' }}>Roulette</Text>
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