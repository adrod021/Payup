import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountScreen() {
  const router = useRouter(); 

  const handleLogout = () => {
    // UPDATED: Navigates back to the root (usually your login/index page)
    router.replace("/");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: 'white' }}>
        <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 40 }}>
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 32, fontWeight: '900', color: 'black' }}>Account</Text>
            <Text style={{ fontSize: 16, color: '#9ca3af', marginTop: 4 }}>
              Manage your profile and app settings.
            </Text>
          </View>

          <View style={{ width: '100%' }}>
            
            {/* Pressable but non-functional */}
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => {}}
              style={{ backgroundColor: '#2563eb', padding: 20, borderRadius: 16, marginBottom: 16 }}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 18, textAlign: 'center' }}>
                Reset Password
              </Text>
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: '#e5e7eb', marginVertical: 24, width: '100%' }} />

            {/* Functional Logout Button */}
            <TouchableOpacity 
              onPress={handleLogout}
              activeOpacity={0.7}
              style={{ 
                borderWidth: 2, 
                borderColor: '#00966d', 
                padding: 20, 
                borderRadius: 16, 
                marginBottom: 16 
              }}
            >
              <Text style={{ color: '#00966d', fontWeight: '700', fontSize: 18, textAlign: 'center' }}>
                Log Out
              </Text>
            </TouchableOpacity>

            {/* Pressable but non-functional */}
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => {}}
              style={{ backgroundColor: '#dc2626', padding: 20, borderRadius: 16 }}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 18, textAlign: 'center' }}>
                Delete Account
              </Text>
            </TouchableOpacity>
            
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}