import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountScreen() {
  const router = useRouter(); 

  const handleLogout = () => {
    // This uses the router to send the user back to the Login screen
    router.replace("/login");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, padding: 32 }}>
          
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 40, fontWeight: '800', color: 'black' }}>Account</Text>
            <Text style={{ fontSize: 16, color: '#6b7280', marginTop: 8, lineHeight: 24 }}>
              Manage your account settings and squad preferences.
            </Text>
          </View>

          <View style={{ width: '100%' }}>
            
            <TouchableOpacity 
              style={{ backgroundColor: '#2563eb', padding: 20, borderRadius: 16, marginBottom: 16 }}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 18, textAlign: 'center' }}>
                Reset Password
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ backgroundColor: '#475569', padding: 20, borderRadius: 16, marginBottom: 16 }}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 18, textAlign: 'center' }}>
                Add Email / Phone
              </Text>
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: '#e5e7eb', marginVertical: 24, width: '100%' }} />

            {/* Logout Button: This clears the 'unused router' warning */}
            <TouchableOpacity 
              onPress={handleLogout}
              style={{ borderWidth: 2, borderColor: '#2563eb', padding: 20, borderRadius: 16, marginBottom: 16 }}
            >
              <Text style={{ color: '#2563eb', fontWeight: '700', fontSize: 18, textAlign: 'center' }}>
                Log Out
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
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