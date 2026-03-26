import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Firebase Imports
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";

interface Friend {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'request'; 
  sessionId?: string; 
}

export default function FriendsScreen() {
  const [email, setEmail] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]); 
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user?.email) return;

    // Listen for invites where the invitedEmail matches the current user
    const q = query(
      collection(db, "invites"),
      where("invitedEmail", "==", user.email.toLowerCase()),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newInvites = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      setFriends(newInvites.map(inv => ({
        id: inv.id, // This is the inviteId
        email: inv.invitedBy,
        status: 'request',
        sessionId: inv.sessionId 
      })));
    });

    return () => unsubscribe();
  }, [user]);

  const handleSendRequest = () => {
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail.includes('@') && cleanEmail.includes('.')) {
      setFriends((prevFriends) => [
        ...prevFriends, 
        { id: Date.now().toString(), email: cleanEmail, status: 'pending' }
      ]);
      setEmail(''); 
      Alert.alert("Success", "Friend request sent!");
    } else {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
    }
  };

  const removeFriend = (id: string) => {
    setFriends(friends.filter(f => f.id !== id));
  };

  const acceptGroupInvite = (item: Friend) => {
    if (item.sessionId) {
      // Navigate to lobby with both sessionId and inviteId for status update
      router.push({
        pathname: '/splitpay/join',
        params: { 
          sessionId: item.sessionId,
          inviteId: item.id 
        }
      });
    } else {
      setFriends(friends.map(f => f.id === item.id ? { ...f, status: 'accepted' } : f));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 40 }}>
        
        {/* Header */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 32, fontWeight: '900', color: 'black' }}>Friends</Text>
          <Text style={{ fontSize: 16, color: '#6b7280', marginTop: 4 }}>
            Send friend requests and manage active group invites.
          </Text>
        </View>

        {/* Input Section */}
        <View style={{ width: '100%', marginBottom: 32 }}>
          <TextInput
            placeholder="Enter email to add friend"
            placeholderTextColor="#6b7280"
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
              marginBottom: 12,
              color: 'black'
            }}
          />
          <TouchableOpacity 
            onPress={handleSendRequest}
            activeOpacity={0.8}
            style={{ 
              backgroundColor: '#00966d', 
              paddingVertical: 18, 
              borderRadius: 16, 
              alignItems: 'center',
              elevation: 2
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>SEND FRIEND REQUEST</Text>
          </TouchableOpacity>
        </View>

        {/* List Section */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, fontWeight: '800', color: '#6b7280', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Pending Requests & Group Invites
          </Text>
          
          <FlatList
            data={friends}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={{ marginTop: 40, alignItems: 'center' }}>
                <Ionicons name="people-outline" size={48} color="#6b7280" />
                <Text style={{ color: '#6b7280', marginTop: 8, fontWeight: '500' }}>No pending activity.</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                backgroundColor: item.status === 'request' ? '#f0fdf4' : '#f9fafb', 
                padding: 16, 
                borderRadius: 20, 
                marginBottom: 12,
                borderWidth: 1,
                borderColor: item.status === 'request' ? '#bcf0da' : '#e5e7eb'
              }}>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={{ fontSize: 15, color: '#374151', fontWeight: '700' }}>{item.email}</Text>
                  <Text style={{ fontSize: 12, color: item.status === 'request' ? '#00966d' : '#6b7280', fontWeight: '500' }}>
                    {item.status === 'request' ? 'Invited you to a group' : item.status === 'pending' ? 'Friend request pending' : 'Added to Friends'}
                  </Text>
                </View>

                {item.status === 'request' && (
                  <TouchableOpacity 
                    onPress={() => acceptGroupInvite(item)}
                    style={{ backgroundColor: '#00966d', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, marginRight: 8 }}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>JOIN</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity onPress={() => removeFriend(item.id)}>
                  <Ionicons 
                    name={item.status === 'request' ? "close-circle" : "trash-outline"} 
                    size={22} 
                    color={item.status === 'request' ? "#6b7280" : "#ef4444"} 
                  />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}