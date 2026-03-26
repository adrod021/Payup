import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: 'white' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 40 }}>
          
          <View style={{ alignItems: 'center', marginBottom: 40, width: '100%' }}>
            {/* PayUp Header: TRUE System Default (No Italic, No Custom Weight) */}
            <Text style={{ 
              fontSize: 72, 
              fontWeight: 'bold', // Standard System Bold
              color: 'black', 
              textAlign: 'center',
              letterSpacing: -1, // Makes the default font look more like a "logo"
            }}>
              PayUp
            </Text>
            <Text style={{ fontSize: 28, fontWeight: '600', color: '#4b5563', marginTop: 4 }}>
              Sign Up
            </Text>
          </View>
          
          <View style={{ width: '100%' }}>
            {/* Display Name Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: '#374151', fontWeight: '700', marginBottom: 8, fontSize: 16 }}>Display Name</Text>
              <TextInput
                placeholder="Your Name"
                value={displayName}
                onChangeText={setDisplayName}
                placeholderTextColor="#9ca3af"
                style={{ borderWidth: 2, borderColor: '#e5e7eb', padding: 18, borderRadius: 16, color: 'black', backgroundColor: '#f9fafb', fontSize: 18 }}
              />
            </View>

            {/* Email Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: '#374151', fontWeight: '700', marginBottom: 8, fontSize: 16 }}>Email</Text>
              <TextInput
                placeholder="email@example.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#9ca3af"
                style={{ borderWidth: 2, borderColor: '#e5e7eb', padding: 18, borderRadius: 16, color: 'black', backgroundColor: '#f9fafb', fontSize: 18 }}
              />
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: '#374151', fontWeight: '700', marginBottom: 8, fontSize: 16 }}>Password</Text>
              <TextInput
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#9ca3af"
                style={{ borderWidth: 2, borderColor: '#e5e7eb', padding: 18, borderRadius: 16, color: 'black', backgroundColor: '#f9fafb', fontSize: 18 }}
              />
            </View>
          </View>

          {/* GREEN Button (#00966d) */}
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={handleSignUp}
            style={{ backgroundColor: '#00966d', padding: 20, borderRadius: 16, width: '100%', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 }}>CREATE ACCOUNT</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 32 }}>
            <Text style={{ color: '#6b7280', textAlign: 'center', fontSize: 16 }}>
              {"Already have an account? "} 
              <Text style={{ color: '#00966d', fontWeight: 'bold' }}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}