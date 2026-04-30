import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signUp } from "./services/auth";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // Changed from displayName
  const [loading, setLoading] = useState(false); 
  const router = useRouter();

  // Handle creating a new account
  const handleSignUp = async () => {
    // Basic validation
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true); 

    try {
      // Send the info to our auth service
      await signUp(email, password, username);
      
      Alert.alert("Success", "Welcome to PayUp!");
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Sign Up Error", error.message);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: 'white' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 40 }}>
          
          <View style={{ alignItems: 'center', marginBottom: 40, width: '100%' }}>
            <Text style={{ fontSize: 72, fontWeight: 'bold', color: 'black', textAlign: 'center', letterSpacing: -1 }}>
              PayUp
            </Text>
            <Text style={{ fontSize: 28, fontWeight: '600', color: '#4b5563', marginTop: 4 }}>
              Sign Up
            </Text>
          </View>
          
          <View style={{ width: '100%' }}>
            {/* Username input area */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: '#374151', fontWeight: '700', marginBottom: 8, fontSize: 16 }}>Username</Text>
              <TextInput
                placeholder="Pick a username"
                value={username}
                onChangeText={setUsername}
                placeholderTextColor="#9ca3af"
                style={{ borderWidth: 2, borderColor: '#e5e7eb', padding: 18, borderRadius: 16, color: 'black', backgroundColor: '#f9fafb', fontSize: 18 }}
              />
            </View>

            {/* Email input area */}
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

            {/* Password input area */}
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

          {/* Submit button */}
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={handleSignUp}
            disabled={loading} 
            style={{ 
              backgroundColor: loading ? '#057a5b' : '#00966d', 
              padding: 20, 
              borderRadius: 16, 
              width: '100%', 
              elevation: 4, 
              shadowColor: '#000', 
              shadowOffset: { width: 0, height: 2 }, 
              shadowOpacity: 0.1, 
              shadowRadius: 4 
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 }}>
                CREATE ACCOUNT
              </Text>
            )}
          </TouchableOpacity>

          {/* Back to Login */}
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