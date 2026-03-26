import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Firebase Imports
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

// Custom hooks and services
import { useAuth } from "../hooks/useAuth";
import { createSessionAndInvite } from "../services/invite";

export default function HomeScreen() {
  const [showOptions, setShowOptions] = useState(false);
  const [showInvite, setShowInvite] = useState(false); 
  const [showHostOptions, setShowHostOptions] = useState(false); 
  const [inviteEmail, setInviteEmail] = useState("");
  const [participants, setParticipants] = useState<string[]>([]); 
  const [isCreating, setIsCreating] = useState(false);
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [joinedCount, setJoinedCount] = useState(1);

  const router = useRouter();
  const { user } = useAuth(); 
  const MAX_PARTICIPANTS = 10;

  useEffect(() => {
    if (!sessionId) return;
    const unsubscribe = onSnapshot(doc(db, "sessions", sessionId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.participants) {
          setJoinedCount(data.participants.length);
        }
      }
    });
    return () => unsubscribe();
  }, [sessionId]);

  const handleBack = () => {
    if (showHostOptions) {
      setShowHostOptions(false);
      setShowInvite(true);
    } else if (showInvite) {
      setShowInvite(false);
    } else {
      setShowOptions(false);
    }
  };

  const handleStartHosting = async () => {
    if (!user?.email) {
      Alert.alert("Error", "You must be logged in to host.");
      return;
    }
    setIsCreating(true);
    try {
      const newId = await createSessionAndInvite(user.email, participants);
      setSessionId(newId);
      setShowHostOptions(true); 
    } catch (error) {
      Alert.alert("Error", `Failed to create session: ${error}`);
    } finally {
      setIsCreating(false);
    }
  };

  const addParticipant = () => {
    if (participants.length >= MAX_PARTICIPANTS) {
      Alert.alert("Limit Reached", "A group can only have 10 people.");
      return;
    }
    const cleanEmail = inviteEmail.trim().toLowerCase();
    if (cleanEmail && cleanEmail.includes("@")) {
      setParticipants([...participants, cleanEmail]);
      setInviteEmail("");
    } else {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
    }
  };

  const removeParticipant = (index: number) => {
    const newList = [...participants];
    newList.splice(index, 1);
    setParticipants(newList);
  };

  const navigateToMethod = (path: "/splitpay/create/scan" | "/splitpay/create/roulette_spin") => {
    router.push({
      pathname: path,
      params: { 
        host: user?.email,
        sessionId: sessionId 
      } 
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: 'white' }}>
        <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: showOptions ? 20 : 40 }}>
          
          {/* FIXED: "Home" text is now conditional - only shows on the very first screen */}
          {!showOptions && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 32, fontWeight: '900', color: 'black' }}>Home</Text>
            </View>
          )}

          {!showOptions ? (
            <View style={{ alignItems: 'center', marginTop: 20 }}>
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 72, fontWeight: '900', color: 'black', textAlign: 'center' }}>PayUp</Text>
              </View>

              <TouchableOpacity 
                onPress={() => setShowOptions(true)}
                activeOpacity={0.8}
                style={{ 
                  backgroundColor: '#00966d', paddingVertical: 40, borderRadius: 24, width: '100%', 
                  elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1, shadowRadius: 10
                }}
              >
                <Text style={{ color: 'white', textAlign: 'center', fontWeight: '900', fontSize: 36, letterSpacing: 2 }}>SplitPay</Text>
              </TouchableOpacity>

              <Text style={{ fontSize: 16, color: '#6b7280', marginTop: 20, textAlign: 'center', lineHeight: 22 }}>
                Host or join bill splitting sessions with friends and instantly split expenses without the hassle.
              </Text>
            </View>
          ) : (
            <View style={{ width: '100%', marginTop: 10 }}>
              <TouchableOpacity onPress={handleBack} style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <Ionicons name="arrow-back" size={24} color="#00966d" />
                <Text style={{ color: '#00966d', fontWeight: 'bold', fontSize: 18, marginLeft: 8 }}>Back</Text>
              </TouchableOpacity>

              <View style={{ backgroundColor: '#f3f4f6', padding: 24, borderRadius: 24, width: '100%', borderWidth: 2, borderColor: '#e5e7eb' }}>
                <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 20, textAlign: 'center' }}>
                  {showHostOptions ? "Method Selection" : showInvite ? "Host a Session" : "Host or Join Group"}
                </Text>

                {!showInvite && !showHostOptions && (
                  <>
                    <TouchableOpacity onPress={() => setShowInvite(true)} style={{ backgroundColor: '#00966d', padding: 20, borderRadius: 16, marginBottom: 12 }}>
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>Create Group (Host)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/splitpay/join')} style={{ backgroundColor: '#2563eb', padding: 20, borderRadius: 16 }}>
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>Join Group (Participant)</Text>
                    </TouchableOpacity>
                  </>
                )}

                {showInvite && !showHostOptions && (
                  <View>
                    <Text style={{ color: '#6b7280', textAlign: 'center', marginBottom: 10 }}>{joinedCount} / {MAX_PARTICIPANTS} People Joined</Text>
                    
                    <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                      <TextInput 
                        placeholder="Invite by email"
                        value={inviteEmail}
                        onChangeText={setInviteEmail}
                        autoCapitalize="none"
                        style={{ flex: 1, backgroundColor: 'white', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#d1d5db' }}
                      />
                      <TouchableOpacity onPress={addParticipant} style={{ backgroundColor: '#00966d', padding: 12, borderRadius: 12, marginLeft: 8, justifyContent: 'center' }}>
                        <Ionicons name="mail-outline" size={24} color="white" />
                      </TouchableOpacity>
                    </View>
                    <View style={{ marginBottom: 20, maxHeight: 150 }}>
                      {participants.map((email, index) => (
                        <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 10, borderRadius: 8, marginBottom: 8 }}>
                          <Text numberOfLines={1} style={{ flex: 1, fontWeight: '500' }}>{email}</Text>
                          <TouchableOpacity onPress={() => removeParticipant(index)}>
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                    
                    <TouchableOpacity 
                      onPress={handleStartHosting}
                      disabled={participants.length === 0 || isCreating}
                      style={{ 
                        backgroundColor: (participants.length > 0 && !isCreating) ? '#00966d' : '#9ca3af', 
                        padding: 20, borderRadius: 16 
                      }}
                    >
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>
                        {isCreating ? "CREATING..." : "START SESSION"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {showHostOptions && (
                  <>
                    <Text style={{ color: '#00966d', textAlign: 'center', fontWeight: 'bold', marginBottom: 15 }}>
                      Room Active: {joinedCount} Member(s) Ready
                    </Text>

                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#6b7280', marginBottom: 12, textAlign: 'center' }}>Select Method:</Text>
                    <TouchableOpacity onPress={() => navigateToMethod('/splitpay/create/scan')} style={{ borderWidth: 2, borderColor: '#00966d', padding: 18, borderRadius: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name="receipt" size={20} color="#00966d" style={{ marginRight: 10 }} />
                      <Text style={{ color: '#00966d', fontWeight: 'bold', fontSize: 16 }}>Itemized</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateToMethod('/splitpay/create/roulette_spin')} style={{ borderWidth: 2, borderColor: '#475569', padding: 18, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                      <Image source={require('../../assets/images/roulette_7400514.png')} style={{ width: 24, height: 24, marginRight: 10, tintColor: '#475569' }} resizeMode="contain" />
                      <Text style={{ color: '#475569', fontWeight: 'bold', fontSize: 16 }}>Roulette</Text>
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