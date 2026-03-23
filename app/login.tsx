import { ThemedText } from "@/components/themed-text";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { login, signUp } from "./services/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
    try {
      await signUp(email, password);
      // If you have a separate profile creation service, call it here
      Alert.alert("Success", "Account created!");
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Sign Up Error", error.message);
    }
  };

  const handleLogin = async () => {
    try {
      await login(email, password);
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Login Error", error.message);
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-white">
      <ThemedText type="title" className="mb-8 text-center">
        Bill Splitter
      </ThemedText>
      
      <View className="space-y-4">
        <TextInput
          placeholder="Display Name (Sign up only)"
          value={displayName}
          onChangeText={setDisplayName}
          className="border border-gray-300 p-4 rounded-xl mb-3"
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          className="border border-gray-300 p-4 rounded-xl mb-3"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="border border-gray-300 p-4 rounded-xl mb-3"
        />
      </View>

      <TouchableOpacity 
        onPress={handleLogin}
        className="bg-blue-600 p-4 rounded-xl mt-6"
      >
        <Text className="text-white text-center font-semibold">Login</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={handleSignUp}
        className="mt-4"
      >
        <Text className="text-blue-600 text-center text-base">
          { "Don't have an account? Sign Up" }
        </Text>
      </TouchableOpacity>
    </View>
  );
}