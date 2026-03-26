import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SplitPayEntryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 40 }}>
        
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", marginBottom: 20 }}
        >
          <Ionicons name="arrow-back" size={24} color="#00966d" />
          <Text style={{ color: "#00966d", fontWeight: "bold", fontSize: 18, marginLeft: 8 }}>Back</Text>
        </TouchableOpacity>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 32, fontWeight: "900", color: "black" }}>Join Session</Text>
        </View>

        <View style={{ backgroundColor: "#f3f4f6", padding: 24, borderRadius: 24, width: "100%", borderWidth: 2, borderColor: "#e5e7eb", alignItems: "center" }}>
          <Ionicons name="mail-open-outline" size={50} color="#6b7280" style={{ marginBottom: 15 }} />
          <Text style={{ fontSize: 18, fontWeight: "700", textAlign: "center", color: "#374151" }}>
            Check your Friend Tab
          </Text>
          {/* FIXED: Escaped the apostrophe in 'friend's' */}
          <Text style={{ fontSize: 14, color: "#6b7280", textAlign: "center", marginTop: 8, lineHeight: 20 }}>
            To join a group, tap the &apos;Join&apos; button on an active invite from your friend&apos;s list.
          </Text>

          <TouchableOpacity 
            onPress={() => router.push("../(tabs)/friend")}
            style={{ backgroundColor: "#00966d", width: "100%", padding: 16, borderRadius: 12, marginTop: 20 }}
          >
            <Text style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Go to Invites</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}