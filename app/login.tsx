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
      Alert.alert("Success", "Welcome to the Squad!");
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
      <View className="mb-10 items-center">
        <ThemedText type="title" className="text-5xl font-bold mb-2 text-black text-center">
          PayUp
        </ThemedText>
        <Text className="text-gray-500 text-lg">
          By Split Squad
        </Text>
      </View>
      
      <View>
        <TextInput
          placeholder="Display Name (Sign up only)"
          value={displayName}
          onChangeText={setDisplayName}
          placeholderTextColor="#9ca3af"
          className="border border-gray-300 p-4 rounded-xl mb-3 text-black"
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#9ca3af"
          className="border border-gray-300 p-4 rounded-xl mb-3 text-black"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#9ca3af"
          className="border border-gray-300 p-4 rounded-xl mb-3 text-black"
        />
      </View>

      <TouchableOpacity 
        onPress={handleLogin}
        className="bg-blue-600 p-4 rounded-xl mt-6"
      >
        <Text className="text-white text-center font-semibold text-lg">Login</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={handleSignUp}
        className="mt-6"
      >
        <Text className="text-blue-600 text-center text-base">
          {"Don't have an account?"} <Text className="font-bold underline">Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}