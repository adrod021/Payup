import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { login } from "./services/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await login(email, password);
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Login Error", error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: 'white' }}>
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <View style={{ alignItems: 'center', marginBottom: 48, width: '100%' }}>
            <Text style={{ 
              fontSize: 72, 
              fontWeight: '900', 
              color: 'black', 
              textAlign: 'center',
              marginTop: -20 
            }}>
              PayUp
            </Text>
            <Text style={{ fontSize: 32, fontWeight: '700', color: '#1f2937', marginTop: 4 }}>Login</Text>
          </View>
          
          {/* Inputs */}
          <View style={{ width: '100%' }}>
            <View style={{ marginBottom: 24, width: '100%' }}>
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

            <View style={{ marginBottom: 24, width: '100%' }}>
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

          {/* Green Login Button */}
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={handleLogin}
            style={{ backgroundColor: '#00966d', padding: 20, borderRadius: 16, marginTop: 16, width: '100%', elevation: 5 }}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 20, letterSpacing: 1.5 }}>LOGIN</Text>
          </TouchableOpacity>

          {/* Green Sign Up Link */}
          <TouchableOpacity onPress={() => router.push("/signup")} style={{ marginTop: 40 }}>
            <Text style={{ color: '#6b7280', textAlign: 'center', fontSize: 18 }}>
              {"Don't have an account? "} 
              <Text style={{ color: '#00966d', fontWeight: 'bold' }}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}