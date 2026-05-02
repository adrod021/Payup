import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";

export default function JoinLobbyScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();

  // State for session details
  const [participants, setParticipants] = useState<string[]>([]);
  const [hostName, setHostName] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  // Formats the header text to show possession correctly
  const getGroupName = (name: string) => {
    if (!name) return "Group";
    const displayName = name.split(' ')[0];
    return displayName.endsWith('s') ? `${displayName}' Group` : `${displayName}'s Group`;
  };

  // Real-time listener for the lobby. 
  useEffect(() => {
    if (!sessionId) {
      Alert.alert("Error", "Invalid session link.");
      router.back();
      return;
    }

    const unsubscribe = onSnapshot(doc(db, "sessions", sessionId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setParticipants(data.participants || []);
        setHostName(data.hostName || "Friend");

        // Transition logic: if host moves to scanning or active status
        if (data.status === "scanning" || data.status === "active") {
          router.replace("/(tabs)/billing");
        }
      } else {
        // Handle case where host deletes the session
        Alert.alert("Session Ended", "The host has closed this session.");
        router.replace("/(tabs)");
      }
    });

    return () => unsubscribe();
  }, [sessionId, router]); // Added router to dependency array to fix ESLint warning

  const handleLeaveSession = () => {
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      {/* Header Navigation */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 32, paddingTop: 20 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#00966d" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Settings Menu Popup */}
      {showMenu && (
        <View style={{ 
          position: 'absolute', 
          top: 60, 
          right: 32, 
          backgroundColor: 'white', 
          borderRadius: 12, 
          elevation: 5, 
          zIndex: 10, 
          padding: 8, 
          borderWidth: 1, 
          borderColor: '#e5e7eb' 
        }}>
          <TouchableOpacity onPress={handleLeaveSession} style={{ padding: 12 }}>
            <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>Leave Session</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 32, justifyContent: 'center' }}>
          
          <View style={{ marginBottom: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 32, fontWeight: "900", color: "black", textAlign: 'center' }}>
              {getGroupName(hostName)}
            </Text>
            <Text style={{ color: "#6b7280", marginTop: 8 }}>Waiting for host to start...</Text>
          </View>

          {/* Lobby Card */}
          <View style={{ 
            backgroundColor: "#f3f4f6", 
            padding: 24, 
            borderRadius: 40, 
            width: "100%", 
            borderWidth: 2, 
            borderColor: "#e5e7eb",
            minHeight: 300,
            justifyContent: 'center'
          }}>
            
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={{ backgroundColor: "#00966d10", borderRadius: 100, padding: 20 }}>
                <Ionicons name="people" size={60} color="#00966d" />
              </View>
            </View>

            {/* Participants List */}
            <View style={{ maxHeight: 200 }}>
              <ScrollView nestedScrollEnabled style={{ backgroundColor: 'white', borderRadius: 20, padding: 15 }}>
                {participants.map((participantId, index) => (
                  <View key={index} style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    paddingVertical: 10, 
                    borderBottomWidth: index === participants.length - 1 ? 0 : 1, 
                    borderBottomColor: '#f3f4f6' 
                  }}>
                    <Ionicons 
                      name="person-circle" 
                      size={24} 
                      color={participantId === (user?.email || user?.phoneNumber) ? "#00966d" : "#9ca3af"} 
                    />
                    <Text style={{ marginLeft: 10, fontWeight: '500', color: '#374151' }} numberOfLines={1}>
                      {participantId} {participantId === (user?.email || user?.phoneNumber) && "(You)"}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={{ backgroundColor: "#00966d", padding: 18, borderRadius: 20, alignItems: "center", marginTop: 20 }}>
              <Text style={{ color: "white", fontWeight: "900", fontSize: 18 }}>
                {participants.length} {participants.length === 1 ? 'Person' : 'People'} Ready
              </Text>
            </View>
          </View>

          {/* Dev Bypass */}
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/billing')} 
            style={{ marginTop: 30, padding: 12, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, borderStyle: 'dashed' }}
          >
            <Text style={{ color: "#6b7280", textAlign: 'center', fontSize: 12 }}>
              Dev Bypass: Go to Billing
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}