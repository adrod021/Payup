import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signUp } from "./services/auth";

/**
 * SIGN UP SCREEN
 * Facilitates account creation and distinguishes between email and phone registrations.
 */
export default function SignUpScreen() {
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
    const cleanIdentifier = identifier.trim();
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    // Ensures no empty fields are submitted
    if (!cleanIdentifier || !cleanUsername || !cleanPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    // Firebase Auth default requirement is at least 6 characters
    if (cleanPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }

    // Detects if the user is signing up with an email or a phone number
    const isEmail = cleanIdentifier.includes("@");
    
    // Front-end verification for data integrity
    if (isEmail) {
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(cleanIdentifier)) {
        Alert.alert("Error", "Please enter a valid email address.");
        return;
      }
    } else {
      // Ensures phone numbers meet a minimum digit length
      const phoneDigits = cleanIdentifier.replace(/\D/g, "");
      if (phoneDigits.length < 10) {
        Alert.alert("Error", "Please enter a valid 10-digit phone number.");
        return;
      }
    }

    /**
     * Firebase Auth requires an email. If the user provided a phone number,
     * we generate a placeholder email to maintain account consistency.
     */
    const emailToAuth = isEmail 
      ? cleanIdentifier.toLowerCase() 
      : `${cleanIdentifier}@payup-placeholder.com`;
    
    const phoneNumber = isEmail ? "" : cleanIdentifier;

    try {
      // Submits data to the auth service and directs user to the main app on success
      await signUp(emailToAuth, cleanPassword, cleanUsername, phoneNumber);
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
            <Text style={{ fontSize: 72, fontWeight: '900', color: 'black', textAlign: 'center' }}>PayUp</Text>
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
              Already have an account? <Text style={{ color: '#00966d', fontWeight: 'bold' }}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}