import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// FIXED PATHS HERE:
import { db } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";

export default function JoinLobbyScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();

  const [participants, setParticipants] = useState<string[]>([]);
  const [participantNames, setParticipantNames] = useState<string[]>([]);
  const [sessionData, setSessionData] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);

  const isHost = user?.uid === sessionData?.hostId;

  useEffect(() => {
    if (!sessionId) {
      router.back();
      return;
    }

    const unsubscribe = onSnapshot(doc(db, "sessions", sessionId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSessionData(data);
        setParticipants(data.participants || []);
        setParticipantNames(data.participantUsernames || []);

        if (data.status === "active" || data.status === "itemized") {
          router.replace("/(tabs)/billing");
        }
      } else {
        Alert.alert("Session Ended", "The session was closed.");
        router.replace("/(tabs)");
      }
    });

    return () => unsubscribe();
  }, [sessionId, router]);

  const handleKick = (targetId: string, targetName: string) => {
    Alert.alert("Kick Member", `Remove ${targetName}?`, [
      { text: "Cancel" },
      { 
        text: "KICK", 
        style: "destructive", 
        onPress: async () => {
          const p = [...participants];
          const n = [...participantNames];
          const idx = p.indexOf(targetId);
          if (idx > -1) {
            p.splice(idx, 1);
            n.splice(idx, 1);
            await updateDoc(doc(db, "sessions", sessionId!), {
              participants: p,
              participantUsernames: n
            });
          }
        } 
      }
    ]);
  };

  const handleLeaveOrClose = async () => {
    if (isHost) {
      Alert.alert("Close Session", "End for everyone?", [
        { text: "Cancel" },
        { text: "End", style: "destructive", onPress: async () => await deleteDoc(doc(db, "sessions", sessionId!)) }
      ]);
    } else {
      const p = [...participants];
      const n = [...participantNames];
      const idx = p.indexOf(user?.uid!);
      if (idx > -1) {
        p.splice(idx, 1);
        n.splice(idx, 1);
        await updateDoc(doc(db, "sessions", sessionId!), {
          participants: p,
          participantUsernames: n
        });
      }
      router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 32, paddingTop: 20 }}>
        <TouchableOpacity onPress={() => setShowSettings(true)}>
          <Ionicons name="settings-sharp" size={26} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 32, justifyContent: 'center' }}>
          <View style={{ marginBottom: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 32, fontWeight: "900", color: "black" }}>
              {sessionData?.hostName || "Host"}&apos;s Group
            </Text>
            <Text style={{ color: "#6b7280", marginTop: 8 }}>Waiting for host to start...</Text>
          </View>

          <View style={{ backgroundColor: "#f3f4f6", padding: 24, borderRadius: 40, borderWidth: 2, borderColor: "#e5e7eb", minHeight: 300 }}>
            {participants.map((id, index) => (
              <View key={id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
                <Ionicons name="person-circle" size={24} color={id === user?.uid ? "#00966d" : "#9ca3af"} />
                <Text style={{ marginLeft: 10, fontWeight: '700' }}>
                  {participantNames[index]} {id === user?.uid && "(You)"}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal visible={showSettings} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30 }}>
            <div style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, display: 'flex' }}>
              <Text style={{ fontSize: 22, fontWeight: '800' }}>Session Settings</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Ionicons name="close" size={28} />
              </TouchableOpacity>
            </div>
            
            {isHost ? (
              <View>
                {participants.map((id, index) => id !== user?.uid && (
                  <View key={id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderColor: '#f3f4f6' }}>
                    <Text style={{ fontSize: 16, fontWeight: '700' }}>{participantNames[index]}</Text>
                    <TouchableOpacity onPress={() => handleKick(id, participantNames[index])}>
                      <Text style={{ color: '#ef4444', fontWeight: '900' }}>KICK</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity onPress={handleLeaveOrClose} style={{ marginTop: 20, padding: 20, backgroundColor: '#fee2e2', borderRadius: 20 }}>
                  <Text style={{ color: '#ef4444', textAlign: 'center', fontWeight: '800' }}>CLOSE SESSION</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={handleLeaveOrClose} style={{ padding: 20, backgroundColor: '#fee2e2', borderRadius: 20 }}>
                <Text style={{ color: '#ef4444', textAlign: 'center', fontWeight: '800' }}>LEAVE SESSION</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}