/* place holder for now, will implement later. 
* This is the screen that will be shown when the user clicks on the "Spin the wheel" button in the split pay flow. 
* It will show a spinning wheel with the names of the people in the group and will randomly select one of them to pay the bill.
*/
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RouletteSpinScreen() {
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null);

    setTimeout(() => {
      setIsSpinning(false);
      setResult("Person 1 is paying!"); 
    }, 2000);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <Stack.Screen options={{ title: "", headerTitleStyle: { fontWeight: 'bold' } }} />

      <View style={{ flex: 1, padding: 32, alignItems: 'center', justifyContent: 'center' }}>
        
        <Text style={{ fontSize: 32, fontWeight: '900', marginBottom: 10 }}>Bill Roulette</Text>
        <Text style={{ color: '#6b7280', marginBottom: 40 }}>{"Who will pay?"}</Text>

        <View style={{ marginBottom: 40, alignItems: 'center' }}>
          <Ionicons name="caret-down" size={40} color="#dc2626" style={{ marginBottom: -10, zIndex: 1 }} />
          
          <Image 
            source={require('../../../assets/images/roulette_7400514.png')} 
            style={{ 
              width: 250, 
              height: 250, 
              transform: [{ rotate: isSpinning ? '360deg' : '0deg' }] 
            }} 
            resizeMode="contain"
          />
        </View>

        <View style={{ height: 60, justifyContent: 'center' }}>
          {result && (
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#2563eb' }}>
              {result}
            </Text>
          )}
        </View>

        <TouchableOpacity 
          onPress={handleSpin}
          disabled={isSpinning}
          style={{ 
            backgroundColor: isSpinning ? '#9ca3af' : '#059669', 
            paddingVertical: 20, 
            paddingHorizontal: 60, 
            borderRadius: 50,
            marginTop: 20,
            elevation: 5
          }}
        >
          <Text style={{ color: 'white', fontWeight: '900', fontSize: 20 }}>
            {isSpinning ? "SPINNING..." : "SPIN!"}
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}