import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 1. Define the shape of a friend object
interface Friend {
  id: string;
  email: string;
}

export default function FriendsScreen() {
  const [email, setEmail] = useState('');
  // 2. Explicitly type the state as an array of Friend objects
  const [friends, setFriends] = useState<Friend[]>([]); 

  const handleInvite = () => {
    const cleanEmail = email.toLowerCase().trim();

    if (cleanEmail.includes('@') && cleanEmail.includes('.')) {
      // 3. Use functional update for state safety
      setFriends((prevFriends) => [
        ...prevFriends, 
        { id: Date.now().toString(), email: cleanEmail }
      ]);
      setEmail(''); 
    } else {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, paddingTop: 80 }}>
        
        <View style={{ alignItems: 'center', marginBottom: 48, width: '100%' }}>
          <Text style={{ fontSize: 72, fontWeight: '900', color: 'black', textAlign: 'center' }}>PayUp</Text>
          <Text style={{ fontSize: 24, color: '#9ca3af', marginTop: 4, textAlign: 'center' }}>Friends</Text>
        </View>

        <View style={{ width: '100%', marginBottom: 40 }}>
          <TextInput
            placeholder="Enter friend's email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ 
              fontSize: 16, 
              backgroundColor: '#f9fafb', 
              borderWidth: 1, 
              borderColor: '#e5e7eb', 
              borderRadius: 16, 
              padding: 20, 
              marginBottom: 12 
            }}
          />
          
          <TouchableOpacity 
            onPress={handleInvite}
            activeOpacity={0.8}
            style={{ 
              backgroundColor: '#059669', 
              paddingVertical: 20, 
              borderRadius: 24, 
              width: '100%', 
              elevation: 4,
              alignItems: 'center' 
            }}
          >
            <Text style={{ color: 'white', fontWeight: '900', fontSize: 18, letterSpacing: 1 }}>
              SEND INVITE
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ width: '100%', flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#9ca3af', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 2 }}>
            Pending & Friends
          </Text>
          
          <FlatList
            data={friends}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={() => (
              <View style={{ marginTop: 20, alignItems: 'center' }}>
                <Text style={{ color: '#d1d5db', fontStyle: 'italic' }}>No friends added yet.</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', // Fixed typo: itemsCenter -> alignItems
                backgroundColor: '#f3f4f6', 
                padding: 16, 
                borderRadius: 16, 
                marginBottom: 10,
                borderWidth: 1,
                borderColor: '#e5e7eb'
              }}>
                <Ionicons name="mail-outline" size={20} color="#6b7280" style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 15, color: '#374151', fontWeight: '600' }}>{item.email}</Text>
              </View>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}