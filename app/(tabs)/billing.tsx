import Octicons from '@expo/vector-icons/Octicons';
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


//Billing Component - The interface for managing payment methods and billing information. We will not implement it, but I decided to make a place holder for it, it is just a pressable but non-functional button at the moment.
export default function BillingScreen() {
  return (
    // SafeAreaView ensures content stays within the visible screen area (avoids notches)
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        style={{ backgroundColor: 'white' }}
      >
        <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 40 }}>
          
          {/* Header Section: Clearly identifies the page purpose */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 32, fontWeight: '900', color: 'black' }}>
              Billing
            </Text>
            {/* Using a darker grey (#6b7280) to improve accessibility and readability */}
            <Text style={{ fontSize: 16, color: '#6b7280', marginTop: 4 }}>
              Add and manage debit/credit cards for paying your share.
            </Text>
          </View>

          {/* Payment Method Container */}
          <View style={{ width: '100%', alignItems: 'center', marginTop: 20 }}>
            
            {/* Main Action Button - Branded with 'Signature Green' UI theme */}
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => {
                /* TODO: Link to payment gateway or card input modal */
              }}
              style={{ 
                backgroundColor: '#00966d', 
                paddingVertical: 32, 
                borderRadius: 24, 
                width: '100%', 
                // Elevation for Android shadow
                elevation: 8,
                // Shadow properties for iOS depth
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {/* Icon from Octicons set matching the Tab layout icon */}
              <Octicons name="credit-card" size={28} color="white" style={{ marginRight: 15 }} />
              {/* Button Text */}
              <Text style={{ 
                color: 'white', 
                textAlign: 'center', 
                fontWeight: '900', 
                fontSize: 15, 
                letterSpacing: 1.5 
              }}>
                CHOOSE PAYMENT METHOD
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}