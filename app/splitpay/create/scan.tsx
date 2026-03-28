import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SplitPayScanReceiptScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1, padding: 32 }}>
        
        {/* Simple navigation to return to the previous screen */}
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
          <Ionicons name="arrow-back" size={24} color="#00966d" />
        </TouchableOpacity>

        <Text style={{ fontSize: 32, fontWeight: '900', color: 'black', marginBottom: 8 }}>
          Scan Receipt
        </Text>
        <Text style={{ fontSize: 16, color: '#6b7280', marginBottom: 40, lineHeight: 24 }}>
          Position the receipt within the frame. Our AI will automatically detect the items and total.
        </Text>

        {/* Visual placeholder for the future Expo Camera or Google ML Kit OCR view */}
        <View style={{ 
          flex: 1, 
          backgroundColor: '#f3f4f6', 
          borderRadius: 32, 
          borderWidth: 2, 
          borderStyle: 'dashed', 
          borderColor: '#d1d5db',
          justifyContent: 'center', 
          alignItems: 'center',
          marginBottom: 40
        }}>
          <Ionicons name="camera-outline" size={80} color="#9ca3af" />
          <Text style={{ color: '#9ca3af', marginTop: 16, fontWeight: '600' }}>
            Camera View Component
          </Text>
        </View>

        {/* Temporary button to bypass the camera and move to the payment step */}
        <TouchableOpacity
          onPress={() => router.push('/splitpay/create/payment')}
          style={{ 
            backgroundColor: '#00966d', 
            paddingVertical: 20, 
            borderRadius: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '900', fontSize: 18 }}>
            SIMULATE SCAN
          </Text>
        </TouchableOpacity>
        
        {/* Placeholder for the native image picker/gallery access */}
        <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }}>
          <Text style={{ color: '#6b7280', fontWeight: '600' }}>Upload from Gallery</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}