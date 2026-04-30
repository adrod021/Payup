import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";
import { joinSession } from "../../services/invite";

export default function JoinLobbyScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { sessionId, inviteId } = useLocalSearchParams<{ sessionId: string; inviteId: string }>();

  const [status, setStatus] = useState("checking");
  const [participants, setParticipants] = useState<string[]>([]);
  const [hostName, setHostName] = useState("");

  // Formats the header text to show possession correctly (e.g., Alex's vs. Jess')
  const getGroupName = (name: string) => {
    if (!name) return "Group";
    const displayName = name.split(' ')[0];
    return displayName.endsWith('s') ? `${displayName}' Group` : `${displayName}'s Group`;
  };

  // Validates the session ID and retrieves initial host information on mount
  useEffect(() => {
    if (!sessionId) {
      Alert.alert("Error", "Invalid session link.");
      router.back();
      return;
    }

    const fetchHostInfo = async () => {
      try {
        const docRef = doc(db, "sessions", sessionId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setHostName(data.hostName || data.hostEmail?.split('@')[0] || "Friend"); 
          setStatus("confirming");
        } else {
          Alert.alert("Not Found", "This session no longer exists.");
          router.back();
        }
      } catch (err) {
        console.error("Fetch host error:", err);
        setStatus("confirming");
      }
    };

    fetchHostInfo();
  }, [sessionId, router]);

  // Real-time listener for the lobby. This triggers the transition when the host starts.
  useEffect(() => {
    if (!sessionId || status !== "waiting") return;

    const unsubscribe = onSnapshot(doc(db, "sessions", sessionId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setParticipants(data.participants || []);

        // PROTOTYPE 2: Transition logic. If host starts scanning, move participants to the wait screen.
        // NOTE: Ensure this path matches your file structure for participant views.
        if (data.status === "scanning" || data.status === "roulette") {
          router.replace("/splitpay/create/waiting" as any);
        }
      }
    });

    return () => unsubscribe();
  }, [sessionId, status, router]);

  // Handles joining the session. Includes trim/lowercase to match Firebase formatting.
  const handleAcceptInvite = async () => {
    if (!user?.email || !sessionId) return;
    
    setStatus("joining");
    try {
      // Normalize email to prevent case-sensitive login bugs
      const cleanEmail = user.email.toLowerCase().trim();
      await joinSession(sessionId, cleanEmail, inviteId || "");
      setStatus("waiting");
    } catch (error) {
      console.error("Join error:", error);
      Alert.alert("Error", "Could not join. The invite may have expired.");
      router.back();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: "white" }}>
        <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 40 }}>
          
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", marginBottom: 20 }}
          >
            <Ionicons name="arrow-back" size={24} color="#00966d" />
            <Text style={{ color: "#00966d", fontWeight: "bold", fontSize: 18, marginLeft: 8 }}>Back</Text>
          </TouchableOpacity>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 32, fontWeight: "900", color: "black" }}>
              {status === "waiting" ? "Lobby" : "Join Group"}
            </Text>
          </View>

          <View style={{ 
            backgroundColor: "#f3f4f6", 
            padding: 24, 
            borderRadius: 24, 
            width: "100%", 
            borderWidth: 2, 
            borderColor: "#e5e7eb" 
          }}>
            
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={{ backgroundColor: "#00966d10", borderRadius: 100, padding: 20 }}>
                <Ionicons 
                  name={status === "waiting" ? "checkmark-circle" : "people"} 
                  size={60} 
                  color="#00966d" 
                />
              </View>
            </View>

            {/* Confirmation view shown before the user officially joins the room */}
            {status === "confirming" && (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 10, textAlign: "center" }}>
                  Join {getGroupName(hostName)}?
                </Text>
                <Text style={{ fontSize: 16, color: "#6b7280", textAlign: "center", marginBottom: 24 }}>
                  You&apos;ve been invited to split a bill.
                </Text>
                <TouchableOpacity 
                  onPress={handleAcceptInvite}
                  style={{ backgroundColor: "#00966d", width: "100%", padding: 18, borderRadius: 16 }}
                >
                  <Text style={{ color: "white", fontWeight: "bold", textAlign: "center", fontSize: 18 }}>Accept & Join</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Processing state shown during the Firestore update */}
            {status === "joining" && (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 10 }}>Connecting...</Text>
                <ActivityIndicator size="large" color="#00966d" style={{ marginTop: 10 }} />
              </View>
            )}

            {/* The active lobby view showing all participants currently in the room */}
            {status === "waiting" && (
              <View style={{ width: "100%" }}>
                <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 10, textAlign: "center" }}>
                  Ready to Split!
                </Text>
                <Text style={{ fontSize: 14, color: "#6b7280", textAlign: "center", marginBottom: 20 }}>
                  Waiting for host to start...
                </Text>

                <View style={{ maxHeight: 200, marginBottom: 20 }}>
                    <ScrollView nestedScrollEnabled style={{ backgroundColor: 'white', borderRadius: 16, padding: 10 }}>
                      {participants.map((email, index) => (
                        <View key={index} style={{ 
                          flexDirection: 'row', 
                          alignItems: 'center', 
                          paddingVertical: 8, 
                          borderBottomWidth: index === participants.length - 1 ? 0 : 1, 
                          borderBottomColor: '#f3f4f6' 
                        }}>
                          <Ionicons 
                            name="person-circle" 
                            size={24} 
                            color={email === user?.email?.toLowerCase() ? "#00966d" : "#9ca3af"} 
                          />
                          <Text style={{ marginLeft: 10, fontWeight: '500', color: '#374151' }} numberOfLines={1}>
                            {email} {email === user?.email?.toLowerCase() && "(You)"}
                          </Text>
                        </View>
                      ))}
                    </ScrollView>
                </View>

                <View style={{ backgroundColor: "#00966d", padding: 15, borderRadius: 16, alignItems: "center" }}>
                   <Text style={{ color: "white", fontWeight: "900", fontSize: 18 }}>
                     {participants.length} {participants.length === 1 ? 'Person' : 'People'} Joined
                   </Text>
                </View>

                {/* PROTOTYPE 2: Manual Bypass button to skip the loading lobby */}
                <TouchableOpacity 
                  onPress={() => router.push('/billing' as any)} 
                  style={{ 
                    marginTop: 20, 
                    padding: 12, 
                    borderWidth: 1, 
                    borderColor: '#d1d5db', 
                    borderRadius: 12, 
                    borderStyle: 'dashed' 
                  }}
                >
                  <Text style={{ color: "#6b7280", textAlign: 'center', fontWeight: "bold" }}>
                    Skip to Manual Entry (Bypass)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 24, alignItems: 'center' }}>
                  <Text style={{ color: "#ef4444", fontWeight: "bold" }}>Leave Session</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Spinner used while the session ID is being validated */}
            {status === "checking" && <ActivityIndicator size="large" color="#00966d" />}

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}