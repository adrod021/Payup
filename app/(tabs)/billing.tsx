import Octicons from '@expo/vector-icons/Octicons';
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BillingScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: 'white' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, paddingTop: 80 }}>
          
          {/* Header Section: Centered and lowered */}
          <View style={{ alignItems: 'center', marginBottom: 48, width: '100%' }}>
            <Text style={{ fontSize: 72, fontWeight: '900', color: 'black', textAlign: 'center' }}>PayUp</Text>
            <Text style={{ fontSize: 24, color: '#9ca3af', marginTop: 4, textAlign: 'center' }}>Billing</Text>
          </View>

          <View style={{ width: '100%', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, color: '#4b5563', marginBottom: 40, textAlign: 'center', lineHeight: 26 }}>
              Add and manage debit/credit cards for paying your share of a bill.
            </Text>

            {/* Main Action Button - Signature Green */}
            <TouchableOpacity 
              activeOpacity={0.8}
              style={{ 
                backgroundColor: '#059669', 
                paddingVertical: 32, 
                borderRadius: 24, 
                width: '100%', 
                elevation: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {/* Swapped to Octicons to match TabLayout */}
              <Octicons name="credit-card" size={28} color="white" style={{ marginRight: 15 }} />
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: '900', fontSize: 15, letterSpacing: 1.5 }}>
                CHOOSE PAYMENT METHOD
              </Text>
            </TouchableOpacity>
          </View>

          {/* Spacer to keep things balanced */}
          <View style={{ height: 100 }} />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}