//account screen for user profile management, logout, and account settings. 
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../hooks/useAuth";
import { logout } from "../services/auth";

export default function AccountScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // Signs out and sends user back to login
  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Logout Failed", error.message);
    }
  };

  // Reusable row for profile info
  const ProfileRow = ({ label, value, icon, color = "#00966d" }: { label: string; value: string; icon: any, color?: string }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
      <View style={{ backgroundColor: '#f3f4f6', borderRadius: 12, marginRight: 16, padding: 10 }}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, fontWeight: '800', color: '#9ca3af', textTransform: 'uppercase' }}>
          {label}
        </Text>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937' }}>
          {value || "Not Set"}
        </Text>
      </View>
    </View>
  );

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

          {/* Profile card with user data from useAuth hook */}
          <View style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: 24, 
            padding: 24, 
            marginBottom: 32,
            borderWidth: 1,
            borderColor: '#f3f4f6',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 2
          }}>
            <Text style={{ fontSize: 18, fontWeight: '800', marginBottom: 20, color: '#111827' }}>
              Profile Information
            </Text>
            
            <ProfileRow 
              label="Username" 
              value={user?.displayName || "New User"} 
              icon="person-outline" 
            />
            <ProfileRow 
              label="Email" 
              value={user?.email || "No email found"} 
              icon="mail-outline" 
            />
            <ProfileRow 
              label="Account Type" 
              value={user?.role === 'admin' ? "Administrator" : "Standard User"} 
              icon="shield-checkmark-outline" 
              color={user?.role === 'admin' ? "#2563eb" : "#00966d"}
            />
            <ProfileRow 
              label="Phone Number" 
              value={"Add phone number"} 
              icon="call-outline" 
            />
          </View>

          {/* Action buttons */}
          <View style={{ width: '100%' }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => Alert.alert("Coming Soon", "This feature is being worked on.")}
              style={{
                backgroundColor: '#2563eb',
                padding: 20,
                borderRadius: 20,
                marginBottom: 16,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>Reset Password</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.7}
              style={{
                backgroundColor: '#00966d',
                padding: 20,
                borderRadius: 20,
                marginBottom: 16,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 16, textAlign: 'center' }}>Log Out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => Alert.alert("Caution", "This feature is being worked on.")}
              style={{ backgroundColor: '#ef4444', padding: 20, borderRadius: 20, marginBottom: 32 }}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 16, textAlign: 'center' }}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}