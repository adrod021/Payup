import { Ionicons } from "@expo/vector-icons";
import { Link } from 'expo-router';
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// A done screen for final confirmation, shown to the host after successfully sending a split request.
export default function SplitPayDoneScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1, padding: 32, justifyContent: 'center', alignItems: 'center' }}>
        
        {/* Visual confirmation icon using the theme's green success color */}
        <View style={{ backgroundColor: '#ecfdf5', padding: 24, borderRadius: 100, marginBottom: 24 }}>
          <Ionicons name="checkmark-circle" size={80} color="#10b981" />
        </View>

        <Text style={{ fontSize: 32, fontWeight: '900', color: 'black', textAlign: 'center' }}>
          All Set!
        </Text>
        
        <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center', marginTop: 12, marginBottom: 40, lineHeight: 24 }}>
          Your split request has been sent. Your friends will see the total in their activity feed.
        </Text>

        {/* Home navigation link using asChild to wrap the styled TouchableOpacity */}
        <Link href="/" asChild>
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#00966d', 
              paddingVertical: 18, 
              paddingHorizontal: 40, 
              borderRadius: 16, 
              width: '100%' 
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 18 }}>
              Return Home
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}