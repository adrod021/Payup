import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Firebase & Services
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";
import { joinSession } from "../../services/invite";

export default function JoinLobbyScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { sessionId, inviteId } = useLocalSearchParams<{ sessionId: string; inviteId: string }>();

  const [status, setStatus] = useState("joining");
  const [participantCount, setParticipantCount] = useState(0);

  useEffect(() => {
    if (!sessionId || !user?.email) return;

    const performJoin = async () => {
      try {
        await joinSession(sessionId, user.email, inviteId || "");
        setStatus("waiting");
      } catch (error) {
        console.error("Join error:", error);
        Alert.alert("Error", "Could not join the session. The invite may have expired.");
        router.back();
      }
    };

    performJoin();

    const unsubscribe = onSnapshot(doc(db, "sessions", sessionId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setParticipantCount(data.participants?.length || 0);

        if (data.status === "scanning" || data.status === "roulette") {
          router.replace("/splitpay/create/waiting");
        }
      }
    });

    return () => unsubscribe();
  }, [sessionId, user, inviteId, router]);

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
            <Text style={{ fontSize: 32, fontWeight: "900", color: "black" }}>Join Group</Text>
          </View>

          <View style={{ backgroundColor: "#f3f4f6", padding: 24, borderRadius: 24, width: "100%", borderWidth: 2, borderColor: "#e5e7eb", alignItems: "center" }}>
            {/* FIXED: Removed 'p: 20' from props and put it in style */}
            <View style={{ backgroundColor: "#00966d10", borderRadius: 100, padding: 20, marginBottom: 20 }}>
              <Ionicons name="people" size={60} color="#00966d" />
            </View>

            <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 10, textAlign: "center" }}>
              {status === "joining" ? "Connecting..." : "Waiting for Host"}
            </Text>

            <Text style={{ fontSize: 16, color: "#6b7280", textAlign: "center", marginBottom: 24, lineHeight: 22 }}>
              {status === "joining" 
                ? "Accepting your invite and syncing with the group..." 
                : "You&apos;re in the lobby! Once the host starts scanning the receipt, you&apos;ll see the items here."}
            </Text>

            {status === "joining" ? (
              <ActivityIndicator size="large" color="#00966d" />
            ) : (
              <View style={{ width: "100%" }}>
                <View style={{ backgroundColor: "white", padding: 20, borderRadius: 16, borderWidth: 1, borderColor: "#d1d5db", alignItems: "center" }}>
                  <Text style={{ color: "#00966d", fontWeight: "900", fontSize: 24 }}>
                    {participantCount} People Ready
                  </Text>
                </View>
                
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{ marginTop: 20, padding: 15 }}
                >
                  <Text style={{ color: "#ef4444", textAlign: "center", fontWeight: "bold", fontSize: 16 }}>
                    Leave Session
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}