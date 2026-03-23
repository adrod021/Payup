import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { signUp } from "./services/auth";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
    try {
      await signUp(email, password);
      Alert.alert("Success", "Welcome to PayUp!");
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Sign Up Error", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: 'white' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 40 }}>
        
        {/* Header Section */}
        <View style={{ alignItems: 'center', marginBottom: 40, width: '100%' }}>
          <Text style={{ fontSize: 72, fontWeight: '900', color: 'black', textAlign: 'center' }}>PayUp</Text>
          <Text style={{ fontSize: 32, fontWeight: '700', color: '#1f2937', marginTop: 8 }}>Sign Up</Text>
        </View>
        
        {/* Input Section */}
        <View style={{ width: '100%' }}>
          {/* Display Name */}
          <View style={{ marginBottom: 20, width: '100%' }}>
            <Text style={{ color: '#374151', fontWeight: '700', marginBottom: 8, fontSize: 18 }}>Display Name</Text>
            <TextInput
              placeholder="Your Name"
              value={displayName}
              onChangeText={setDisplayName}
              placeholderTextColor="#9ca3af"
              style={{ borderWidth: 2, borderColor: '#e5e7eb', padding: 20, borderRadius: 16, color: 'black', backgroundColor: '#f9fafb', fontSize: 18, width: '100%' }}
            />
          </View>

          {/* Email */}
          <View style={{ marginBottom: 20, width: '100%' }}>
            <Text style={{ color: '#374151', fontWeight: '700', marginBottom: 8, fontSize: 18 }}>Email</Text>
            <TextInput
              placeholder="email@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#9ca3af"
              style={{ borderWidth: 2, borderColor: '#e5e7eb', padding: 20, borderRadius: 16, color: 'black', backgroundColor: '#f9fafb', fontSize: 18, width: '100%' }}
            />
          </View>

          {/* Password */}
          <View style={{ marginBottom: 20, width: '100%' }}>
            <Text style={{ color: '#374151', fontWeight: '700', marginBottom: 8, fontSize: 18 }}>Password</Text>
            <TextInput
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#9ca3af"
              style={{ borderWidth: 2, borderColor: '#e5e7eb', padding: 20, borderRadius: 16, color: 'black', backgroundColor: '#f9fafb', fontSize: 18, width: '100%' }}
            />
          </View>
        </View>

        {/* Create Account Button */}
        <TouchableOpacity 
          onPress={handleSignUp}
          style={{ backgroundColor: '#2563eb', padding: 20, borderRadius: 16, marginTop: 16, width: '100%', elevation: 5 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 20, letterSpacing: 1.5 }}>CREATE ACCOUNT</Text>
        </TouchableOpacity>

        {/* Back to Login */}
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 40 }}>
          <Text style={{ color: '#6b7280', textAlign: 'center', fontSize: 18 }}>
            {"Already have an account? "} <Text style={{ color: '#2563eb', fontWeight: 'bold', textDecorationLine: 'underline' }}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}