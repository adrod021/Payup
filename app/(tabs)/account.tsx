import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../firebase";

import { useAuth } from "../hooks/useAuth";
import { logout } from "../services/auth";

export default function AccountScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [extraData, setExtraData] = useState<any>(null);

  useEffect(() => {
    const currentUser = user as any;
    if (!currentUser?.uid) return;

    const userRef = doc(db, "users", currentUser.uid);
    
    // real-time listener for user profile data
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setExtraData(docSnap.data());
      }
    }, (err) => {
      console.error("Error listening to user details:", err);
    });

    return () => unsubscribe();
  }, [user]);

  const handleEditField = (field: string, currentVal: string) => {
    const currentUser = user as any;
    if (!currentUser?.uid) return;

    Alert.prompt(
      `Edit ${field}`,
      `Enter your new ${field.toLowerCase()}:`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Update",
          onPress: async (newValue?: string) => {
            if (!newValue || newValue === currentVal) return;
            try {
              const userRef = doc(db, "users", currentUser.uid);
              await updateDoc(userRef, { [field]: newValue });
              Alert.alert("Success", `${field} updated.`);
            } catch {
              Alert.alert("Update Failed", "Could not save changes.");
            }
          },
        },
      ],
      "plain-text",
      currentVal
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Logout Failed", error.message);
    }
  };

  const ProfileRow = ({ 
    label, 
    value, 
    icon, 
    fieldKey, 
    showEdit = false, 
    color = "#00966d" 
  }: { 
    label: string; 
    value: string; 
    icon: any; 
    fieldKey?: string;
    showEdit?: boolean;
    color?: string 
  }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
      <View style={{ backgroundColor: '#f3f4f6', borderRadius: 12, marginRight: 16, padding: 10 }}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, fontWeight: '800', color: '#9ca3af', textTransform: 'uppercase' }}>{label}</Text>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937' }}>
          {value || "Not Set"}
        </Text>
      </View>
      {showEdit && (
        <TouchableOpacity onPress={() => handleEditField(fieldKey || label, value)}>
          <Ionicons name="pencil-sharp" size={18} color="#9ca3af" />
        </TouchableOpacity>
      )}
    </View>
  );

  // Logic to handle null emails for phone-based accounts
  const displayEmail = extraData?.email || 
    (user?.email?.includes("payup-placeholder.com") ? "Not linked" : user?.email) || 
    "Not linked";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }} style={{ backgroundColor: 'white' }}>
        <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 40 }}>
          
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 32, fontWeight: '900', color: 'black' }}>Account</Text>
            <Text style={{ fontSize: 16, color: '#9ca3af', marginTop: 4 }}>
              Manage your profile and app settings.
            </Text>
          </View>

          <View style={{ 
            backgroundColor: '#ffffff', borderRadius: 24, padding: 24, marginBottom: 32,
            borderWidth: 1, borderColor: '#f3f4f6', elevation: 2
          }}>
            <Text style={{ fontSize: 18, fontWeight: '800', marginBottom: 20, color: '#111827' }}>
              Profile Information
            </Text>
            
            <ProfileRow 
              label="Username" 
              value={extraData?.username || user?.displayName || "New User"} 
              icon="person-outline" 
            />

            <ProfileRow 
              label="Email" 
              fieldKey="email"
              value={displayEmail} 
              icon="mail-outline" 
              showEdit={true}
            />

            <ProfileRow 
              label="Phone Number" 
              fieldKey="phoneNumber"
              value={extraData?.phoneNumber || "Not linked"} 
              icon="call-outline" 
              showEdit={true}
            />

            <ProfileRow 
              label="Account Type" 
              value={extraData?.role === 'admin' ? "Administrator" : "Standard User"} 
              icon="shield-checkmark-outline" 
              color={extraData?.role === 'admin' ? "#2563eb" : "#00966d"}
            />
          </View>

          <View style={{ width: '100%' }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => Alert.alert("Coming Soon", "Password reset is under development.")}
              style={{ backgroundColor: '#2563eb', padding: 20, borderRadius: 20, marginBottom: 16 }}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 16, textAlign: 'center' }}>Reset Password</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.7}
              style={{ backgroundColor: '#00966d', padding: 20, borderRadius: 20, marginBottom: 16 }}
            >
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 16, textAlign: 'center' }}>Log Out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => Alert.alert("Caution", "Account deletion is permanent.")}
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