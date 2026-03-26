import Octicons from '@expo/vector-icons/Octicons';
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BillingScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: 'white' }}>
        <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 40 }}>
          
          {/* Header Section: Top-Left Aligned */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 32, fontWeight: '900', color: 'black' }}>Billing</Text>
            {/* UPDATED: Darker grey (#6b7280) for readability */}
            <Text style={{ fontSize: 16, color: '#6b7280', marginTop: 4 }}>
              Add and manage debit/credit cards for paying your share.
            </Text>
          </View>

          <View style={{ width: '100%', alignItems: 'center', marginTop: 20 }}>
            
            {/* Main Action Button - Signature Green */}
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => {}}
              style={{ 
                backgroundColor: '#00966d', 
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
              <Octicons name="credit-card" size={28} color="white" style={{ marginRight: 15 }} />
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: '900', fontSize: 15, letterSpacing: 1.5 }}>
                CHOOSE PAYMENT METHOD
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}