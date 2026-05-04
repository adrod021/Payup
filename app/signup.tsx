import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signUp } from "./services/auth";

export default function SignUpScreen() {
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
    if (!identifier.trim() || !username.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    // Logic to separate email and phone number from the single identifier input
    const isEmail = identifier.includes("@");
    
    // If it's an email, use it. If it's a phone, create a placeholder email for Firebase Auth.
    const emailToAuth = isEmail 
      ? identifier.trim().toLowerCase() 
      : `${identifier.trim()}@payup-placeholder.com`;
    
    // If it's not an email, we treat it as the phone number.
    const phoneNumber = isEmail ? "" : identifier.trim();

    try {
      // Pass all 4 arguments to the updated signUp service
      await signUp(emailToAuth, password, username, phoneNumber);
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Sign Up Error", error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: 'white' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 40 }}>
          
          <View style={{ alignItems: 'center', marginBottom: 48, width: '100%' }}>
            <Text style={{ fontSize: 72, fontWeight: '900', color: 'black', textAlign: 'center' }}>
              PayUp
            </Text>
            <Text style={{ fontSize: 32, fontWeight: '700', color: '#1f2937', marginTop: 4 }}>Sign Up</Text>
          </View>

          <View style={{ width: '100%' }}>
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: '#374151', fontWeight: '700', marginBottom: 8, fontSize: 18 }}>Username</Text>
              <TextInput
                placeholder="Display Name"
                value={username}
                onChangeText={setUsername}
                placeholderTextColor="#9ca3af"
                style={{ borderWidth: 2, borderColor: '#e5e7eb', padding: 20, borderRadius: 16, color: 'black', backgroundColor: '#f9fafb', fontSize: 18 }}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: '#374151', fontWeight: '700', marginBottom: 8, fontSize: 18 }}>Email or Phone</Text>
              <TextInput
                placeholder="Email or Phone Number"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                // Changed to 'default' so users can type letters (email) or numbers (phone)
                keyboardType="default" 
                placeholderTextColor="#9ca3af"
                style={{ borderWidth: 2, borderColor: '#e5e7eb', padding: 20, borderRadius: 16, color: 'black', backgroundColor: '#f9fafb', fontSize: 18 }}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: '#374151', fontWeight: '700', marginBottom: 8, fontSize: 18 }}>Password</Text>
              <TextInput
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#9ca3af"
                style={{ borderWidth: 2, borderColor: '#e5e7eb', padding: 20, borderRadius: 16, color: 'black', backgroundColor: '#f9fafb', fontSize: 18 }}
              />
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleSignUp}
            activeOpacity={0.8}
            style={{ backgroundColor: '#00966d', padding: 20, borderRadius: 16, marginTop: 16, width: '100%', elevation: 5 }}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 20, letterSpacing: 1.5 }}>CREATE ACCOUNT</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 40 }}>
            <Text style={{ color: '#6b7280', textAlign: 'center', fontSize: 18 }}>
              {"Already have an account? "} 
              <Text style={{ color: '#00966d', fontWeight: 'bold' }}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}