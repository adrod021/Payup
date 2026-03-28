import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../firebase";

export default function RouletteSpinScreen() {
  const { sessionId } = useLocalSearchParams();
  const router = useRouter();

  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);

  // Pulls the current list of group members from the database when the screen opens
  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return;
      const docRef = doc(db, "sessions", sessionId as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setParticipants(docSnap.data().participants || []);
      }
    };
    fetchSession();
  }, [sessionId]);

  // Triggers the spin animation and picks a random participant after a short delay
  const handleSpin = () => {
    if (isSpinning || participants.length === 0) return;
    
    setIsSpinning(true);
    setResult(null);

    // Simulated spin timing to let the visual animation play out
    setTimeout(() => {
      setIsSpinning(false);
      // Randomly selects one index from the participants array
      const winner = participants[Math.floor(Math.random() * participants.length)];
      setResult(`${winner} is paying!`);
    }, 2500);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 10 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#00966d" />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, padding: 32, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 36, fontWeight: '900', color: 'black', marginBottom: 8 }}>
          Bill Roulette
        </Text>
        <Text style={{ fontSize: 16, color: '#6b7280', marginBottom: 40, textAlign: 'center' }}>
          {participants.length > 0 
            ? `Spinning for ${participants.length} friends...` 
            : "Loading participants..."}
        </Text>

        <View style={{ marginBottom: 40, alignItems: 'center' }}>
          {/* Pointer icon to show where the wheel "stops" */}
          <Ionicons name="caret-down" size={44} color="#dc2626" style={{ marginBottom: -15, zIndex: 1 }} />
          
          <Image 
            source={require('../../../assets/images/roulette_7400514.png')} 
            style={{ 
              width: 280, 
              height: 280,
              // Basic rotation toggle; will eventually be replaced with smooth animated values
              transform: [{ rotate: isSpinning ? '720deg' : '0deg' }] 
            }} 
            resizeMode="contain"
          />
        </View>

        {/* Display area for the result or spinning status */}
        <View style={{ height: 80, justifyContent: 'center', alignItems: 'center' }}>
          {result ? (
            <View style={{ backgroundColor: '#ecfdf5', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 15 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#00966d', textAlign: 'center' }}>
                {result}
              </Text>
            </View>
          ) : isSpinning ? (
            <Text style={{ fontSize: 18, color: '#9ca3af', fontStyle: 'italic' }}>Feeling lucky?</Text>
          ) : null}
        </View>

        {/* Main action button that disables itself while the wheel is in motion */}
        <TouchableOpacity 
          onPress={handleSpin}
          disabled={isSpinning || participants.length === 0}
          style={{ 
            backgroundColor: (isSpinning || participants.length === 0) ? '#9ca3af' : '#00966d', 
            paddingVertical: 20, 
            width: '100%',
            borderRadius: 24,
            marginTop: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '900', fontSize: 22, textAlign: 'center' }}>
            {isSpinning ? "SPINNING..." : "SPIN!"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}