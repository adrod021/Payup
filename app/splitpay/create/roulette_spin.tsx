import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Dimensions, Easing, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { G, Path } from "react-native-svg";
import { db } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";

const { width } = Dimensions.get("window");
const WHEEL_SIZE = Math.min(width * 0.85, 420); 
const RADIUS = WHEEL_SIZE / 2;

const PALETTE = ['#E63946', '#457B9D', '#1D3557', '#F4A261', '#2A9D8F', '#8338EC', '#3A86FF', '#0077B6', '#606C38', '#283618'];

export default function RouletteSpinScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const { user } = useAuth(); 

  const [isSpinning, setIsSpinning] = useState(false);
  const [winnerName, setWinnerName] = useState<string | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const [participantColors, setParticipantColors] = useState<string[]>([]); 
  const [sessionData, setSessionData] = useState<any>(null);
  
  const lastProcessedSpin = useRef<number | null>(null);
  const spinValue = useRef(new Animated.Value(0)).current;
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const handleExitSession = useCallback(() => {
    if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
    }
    setShowWinnerModal(false);
    
    setTimeout(() => {
        router.dismissAll(); 
        router.replace('/(tabs)');
    }, 100);
  }, [router]);

  const makeWheelSlice = (index: number, total: number) => {
    const angle = 360 / total;
    const startAngle = (index * angle) - 90; 
    const endAngle = ((index + 1) * angle) - 90;
    const x1 = RADIUS + RADIUS * Math.cos((Math.PI * startAngle) / 180);
    const y1 = RADIUS + RADIUS * Math.sin((Math.PI * startAngle) / 180);
    const x2 = RADIUS + RADIUS * Math.cos((Math.PI * endAngle) / 180);
    const y2 = RADIUS + RADIUS * Math.sin((Math.PI * endAngle) / 180);
    return `M${RADIUS},${RADIUS} L${x1},${y1} A${RADIUS},${RADIUS} 0 0,1 ${x2},${y2} z`;
  };

  const triggerAnimation = useCallback((winner: string, stopValue: number, duration: number) => {
    setIsSpinning(true);
    setWinnerName(null);
    spinValue.setValue(0);
    const totalRotation = 10 + stopValue; 

    Animated.timing(spinValue, {
      toValue: totalRotation,
      duration: duration,
      easing: Easing.bezier(0.15, 0, 0.2, 1), 
      useNativeDriver: true,
    }).start(() => {
      setIsSpinning(false);
      setWinnerName(winner);
      setTimeout(() => setShowWinnerModal(true), 600);
    });
  }, [spinValue]);

  useEffect(() => {
    if (!sessionId) return;
    
    unsubscribeRef.current = onSnapshot(doc(db, "sessions", sessionId), (snap) => {
      if (!snap.exists()) {
        handleExitSession(); 
        return;
      }
      const data = snap.data();
      setSessionData(data);
      setParticipants(data.participantUsernames || []); 
      setParticipantColors(data.participantColors || []); 

      if (data.spinTrigger && data.spinTrigger !== lastProcessedSpin.current) {
        lastProcessedSpin.current = data.spinTrigger;
        triggerAnimation(data.spinResult, data.randomStopValue, data.spinDuration || 5000);
      }
    });

    return () => { if (unsubscribeRef.current) unsubscribeRef.current(); };
  }, [sessionId, handleExitSession, triggerAnimation]);

  const handleHostSpin = async () => {
    if (isSpinning || participants.length < 2) return;
    const winnerIndex = Math.floor(Math.random() * participants.length);
    const segmentAngle = 360 / participants.length;
    const targetRotation = (360 - (winnerIndex * segmentAngle)) % 360;
    const finalAngle = (targetRotation - (segmentAngle / 2) + (Math.random() - 0.5) * (segmentAngle * 0.8) + 360) % 360;
    
    await updateDoc(doc(db, "sessions", sessionId!), {
      spinResult: participants[winnerIndex],
      randomStopValue: finalAngle / 360,
      spinDuration: Math.floor(Math.random() * 4000) + 3000,
      spinTrigger: Date.now()
    });
  };

  const spinRotation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!sessionData) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator color="#00966d" /></View>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}>
        <View style={{ width: '100%', paddingHorizontal: 24, paddingVertical: 10 }}>
          <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={28} color="#00966d" /></TouchableOpacity>
        </View>

        <Text style={{ fontSize: 32, fontWeight: '900', color: 'black' }}>Bill Roulette</Text>
        <Text style={{ color: '#6b7280', marginBottom: 30 }}>{participants.length} Friends Joined</Text>

        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          {/* ADJUSTED: top changed from -35 to -15 to bring the arrow down */}
          <View style={{ position: 'absolute', top: -15, zIndex: 100 }}>
            <Ionicons name="caret-down" size={50} color="#111" />
          </View>
          
          <Animated.View style={{ width: WHEEL_SIZE, height: WHEEL_SIZE, transform: [{ rotate: spinRotation }] }}>
            <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
              <G>
                {participants.map((_, i) => (
                  <Path 
                    key={i} 
                    d={makeWheelSlice(i, participants.length)} 
                    fill={participantColors[i] || PALETTE[i % 10]} 
                    stroke="#fff" 
                    strokeWidth="2" 
                  />
                ))}
              </G>
            </Svg>
          </Animated.View>
          <View style={{ position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', zIndex: 110, borderWidth: 6, borderColor: '#111' }} />
        </View>

        <View style={{ width: '100%', paddingHorizontal: 32, marginTop: 40 }}>
          <Text style={{ fontWeight: '800', color: '#9ca3af', textTransform: 'uppercase', fontSize: 12, marginBottom: 12 }}>Lobby</Text>
          {participants.map((name, index) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, backgroundColor: '#f9fafb', padding: 12, borderRadius: 12 }}>
              <View style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: participantColors[index] || PALETTE[index % 10], marginRight: 12 }} />
              <Text style={{ fontWeight: '700' }}>{name} {index === 0 ? '(HOST)' : ''}</Text>
            </View>
          ))}
        </View>

        <View style={{ width: '100%', paddingHorizontal: 32, marginTop: 30 }}>
          {user?.uid === sessionData?.hostId ? (
            <TouchableOpacity 
              onPress={handleHostSpin} 
              disabled={isSpinning || participants.length < 2} 
              style={{ backgroundColor: isSpinning || participants.length < 2 ? '#d1d5db' : '#00966d', paddingVertical: 18, borderRadius: 20 }}
            >
              <Text style={{ color: 'white', fontWeight: '900', textAlign: 'center', fontSize: 18 }}>SPIN THE WHEEL</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ backgroundColor: '#f3f4f6', paddingVertical: 18, borderRadius: 20 }}>
              <Text style={{ color: '#9ca3af', textAlign: 'center', fontWeight: '800' }}>WAITING FOR HOST TO SPIN</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={showWinnerModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: 'white', width: '100%', borderRadius: 32, padding: 40, alignItems: 'center' }}>
            <Ionicons name="cash" size={40} color="#10b981" />
            <Text style={{ fontSize: 24, fontWeight: '900', marginTop: 10 }}>The one paying is...</Text>
            <Text style={{ fontSize: 42, fontWeight: '900', color: '#059669', marginVertical: 10 }}>{winnerName}</Text>
            <TouchableOpacity onPress={handleExitSession} style={{ backgroundColor: '#111827', width: '100%', paddingVertical: 20, borderRadius: 20 }}>
              <Text style={{ color: 'white', fontWeight: '900', textAlign: 'center', fontSize: 18 }}>CLOSE SESSION</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}