import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { deleteDoc, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Dimensions, Easing, Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { G, Path } from "react-native-svg";
import { db } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";

const { width } = Dimensions.get("window");
const WHEEL_SIZE = Math.min(width * 0.85, 420); 
const RADIUS = WHEEL_SIZE / 2;

const PALETTE = ["#FF3B30", "#FF9500", "#FFCC00", "#4CD964", "#5AC8FA", "#007AFF", "#5856D6", "#FF2D55", "#AF52DE", "#8E8E93"];

export default function RouletteSpinScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const { user } = useAuth(); 

  const [isSpinning, setIsSpinning] = useState(false);
  const [winnerName, setWinnerName] = useState<string | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const [sessionData, setSessionData] = useState<any>(null);
  
  const lastProcessedSpin = useRef<number | null>(null);
  const spinValue = useRef(new Animated.Value(0)).current;

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

    const extraSpins = 10; 
    const totalRotation = extraSpins + stopValue; 

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
    const unsub = onSnapshot(doc(db, "sessions", sessionId), (snap) => {
      if (!snap.exists()) {
        // If document is deleted (by host), close modal and go home
        setShowWinnerModal(false);
        router.replace('/(tabs)'); 
        return;
      }
      const data = snap.data();
      setSessionData(data);
      setParticipants(data.participantUsernames || []); 

      if (data.spinTrigger && data.spinTrigger !== lastProcessedSpin.current) {
        lastProcessedSpin.current = data.spinTrigger;
        triggerAnimation(data.spinResult, data.randomStopValue, data.spinDuration || 5000);
      }
    });
    return () => unsub();
  }, [sessionId, router, triggerAnimation]);

  const isHost = user?.uid === sessionData?.hostId; 

  const handleHostSpin = async () => {
    if (isSpinning || participants.length < 2) return;

    const winnerIndex = Math.floor(Math.random() * participants.length);
    const segmentAngle = 360 / participants.length;
    
    const targetRotation = (360 - (winnerIndex * segmentAngle)) % 360;
    const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.8);
    const finalAngle = (targetRotation - (segmentAngle / 2) + randomOffset + 360) % 360;
    
    const randomStopValue = finalAngle / 360;
    const randomDuration = Math.floor(Math.random() * 6000) + 4000; 
    
    await updateDoc(doc(db, "sessions", sessionId!), {
      spinResult: participants[winnerIndex],
      randomStopValue: randomStopValue,
      spinDuration: randomDuration,
      spinTrigger: Date.now()
    });
  };

  const handleExitSession = async () => {
    setShowWinnerModal(false);
    if (!sessionId || !user) {
      router.replace('/(tabs)');
      return;
    }
    
    try {
      const sessionRef = doc(db, "sessions", sessionId);
      const snap = await getDoc(sessionRef);
      
      // FIX: Check if snap exists before trying to filter data
      if (snap.exists()) {
        if (isHost) {
          await deleteDoc(sessionRef);
        } else {
          const data = snap.data();
          const pUsernames = data.participantUsernames || [];
          const pIds = data.participantIds || [];

          const updatedUsernames = pUsernames.filter((u: string) => u !== user.displayName);
          const updatedIds = pIds.filter((id: string) => id !== user.uid);
          
          await updateDoc(sessionRef, {
            participantUsernames: updatedUsernames,
            participantIds: updatedIds
          });
        }
      }
    } catch (e) {
      console.log("Exit error handled:", e);
    } finally {
      router.replace('/(tabs)');
    }
  };

  const spinRotation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!sessionData) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator color="#00966d" /></View>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 10 }}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={28} color="#00966d" /></TouchableOpacity>
        <View style={{ width: 28 }} /> 
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 32, fontWeight: '900', color: 'black', marginBottom: 5 }}>Bill Roulette</Text>
        <Text style={{ color: '#6b7280', marginBottom: 30, fontWeight: '500' }}>{participants.length} Friends</Text>

        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', top: -35, zIndex: 100 }}>
            <Ionicons name="caret-down" size={50} color="#FF3B30" />
          </View>

          <Animated.View style={{
            width: WHEEL_SIZE, height: WHEEL_SIZE, 
            transform: [{ rotate: spinRotation }]
          }}>
            <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
              <G>
                {participants.map((_, i) => (
                  <Path
                    key={i}
                    d={makeWheelSlice(i, participants.length)}
                    fill={PALETTE[i % PALETTE.length]}
                    stroke="#111"
                    strokeWidth="2"
                  />
                ))}
              </G>
            </Svg>

            {participants.map((name, i) => {
              const segmentAngle = 360 / participants.length;
              return (
                <View key={`label-${i}`} style={{
                  position: 'absolute', width: WHEEL_SIZE, height: WHEEL_SIZE,
                  alignItems: 'center', justifyContent: 'center',
                  transform: [{ rotate: `${i * segmentAngle + (segmentAngle / 2)}deg` }]
                }}>
                  <Text numberOfLines={1} style={{ 
                      transform: [{ translateY: -RADIUS / 1.5 }],
                      color: 'white', fontWeight: '900', fontSize: 16,
                      textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 3
                  }}>{name}</Text>
                </View>
              );
            })}
          </Animated.View>
          <View style={{ position: 'absolute', width: 30, height: 30, borderRadius: 15, backgroundColor: 'white', zIndex: 110, borderWidth: 5, borderColor: '#111' }} />
        </View>

        <View style={{ width: '100%', marginTop: 50 }}>
          {isHost ? (
            <TouchableOpacity onPress={handleHostSpin} disabled={isSpinning} style={{ backgroundColor: isSpinning ? '#d1d5db' : '#00966d', paddingVertical: 18, borderRadius: 20 }}>
              <Text style={{ color: 'white', fontWeight: '900', fontSize: 18, textAlign: 'center' }}>SPIN THE WHEEL</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ backgroundColor: '#f3f4f6', paddingVertical: 18, borderRadius: 20 }}>
              <Text style={{ color: '#9ca3af', textAlign: 'center', fontWeight: '800' }}>WAITING FOR HOST</Text>
            </View>
          )}
        </View>
      </View>

      <Modal visible={showWinnerModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: 'white', width: '100%', borderRadius: 32, padding: 40, alignItems: 'center' }}>
            <Ionicons name="cash" size={40} color="#10b981" />
            <Text style={{ fontSize: 24, fontWeight: '900', color: '#111827', marginTop: 10 }}>The one paying is...</Text>
            <Text style={{ fontSize: 42, fontWeight: '900', color: '#059669', marginVertical: 10 }}>{winnerName}</Text>
            <TouchableOpacity onPress={handleExitSession} style={{ backgroundColor: '#111827', width: '100%', paddingVertical: 20, borderRadius: 20, marginTop: 20 }}>
              <Text style={{ color: 'white', fontWeight: '900', fontSize: 18, textAlign: 'center' }}>OKAY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}