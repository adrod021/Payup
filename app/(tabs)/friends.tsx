import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Firebase imports
import { collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { sendFriendRequest } from "../services/invite";

// Defines the shape of friend requests and group invites for the list
interface Friend {
  id: string;
  email: string;
  displayName?: string;
  status: 'pending_friend' | 'accepted' | 'group_invite'; 
  sessionId?: string; 
}

export default function FriendsScreen() {
  const [emailInput, setEmailInput] = useState(''); 
  const [friends, setFriends] = useState<Friend[]>([]); 
  const { user } = useAuth();
  const router = useRouter();

  // Listen for real-time updates to friend requests and group invites
  useEffect(() => {
    if (!user?.email) return;

    const userEmail = user.email.toLowerCase();

    // 1. Query for pending group split invites
    const qInvites = query(
      collection(db, "invites"),
      where("invitedEmail", "==", userEmail),
      where("status", "==", "pending")
    );

    // 2. Query for pending friend requests sent to the user
    const qFriendReqs = query(
      collection(db, "friendRequests"),
      where("to", "==", userEmail),
      where("status", "==", "pending")
    );

    // Listen for group invites and update the local state list
    const unsubInvites = onSnapshot(qInvites, (snapshot) => {
      const invites = snapshot.docs.map(doc => ({
        id: doc.id,
        email: doc.data().invitedBy,
        status: 'group_invite' as const,
        sessionId: doc.data().sessionId
      }));
      // Filter out old group invites and merge with new ones
      setFriends(prev => [...prev.filter(f => f.status !== 'group_invite'), ...invites]);
    });

    // Listen for friend requests and update the local state list
    const unsubFriendReqs = onSnapshot(qFriendReqs, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({
        id: doc.id,
        email: doc.data().from,
        displayName: doc.data().from.split('@')[0],
        status: 'pending_friend' as const
      }));
      // Filter out old friend requests and merge with new ones
      setFriends(prev => [...prev.filter(f => f.status !== 'pending_friend'), ...reqs]);
    });

    // Clean up listeners when the component is destroyed
    return () => {
      unsubInvites();
      unsubFriendReqs();
    };
  }, [user]);

  // Updates the friend request status to accepted in Firestore
  const handleAcceptFriend = async (id: string) => {
    try {
      const requestRef = doc(db, "friendRequests", id);
      await updateDoc(requestRef, { status: 'accepted' });
      Alert.alert("Success", "Friend added!");
    } catch {
      Alert.alert("Error", "Could not accept request.");
    }
  };

  // Deletes the friend request document from Firestore
  const handleDeclineFriend = async (id: string) => {
    try {
      await deleteDoc(doc(db, "friendRequests", id));
    } catch {
      Alert.alert("Error", "Could not decline request.");
    }
  };

  // Sends a new friend request using the email provided in the input
  const handleSendRequest = async () => {
    if (!emailInput.trim()) return;
    if (!user?.email) return;

    try {
      await sendFriendRequest(user.email, emailInput);
      setEmailInput('');
      Alert.alert("Sent", "Friend request sent!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Could not send request.");
    }
  };

  // Navigates to the join screen for a specific split session
  const acceptGroupInvite = (item: Friend) => {
    router.push({
      pathname: '/splitpay/join' as any,
      params: { sessionId: item.sessionId, inviteId: item.id }
    });
  };

  // Renders each item in the FlatList based on its type (Friend vs Group)
  const renderFriendItem = ({ item }: { item: Friend }) => {
    const isGroupInvite = item.status === 'group_invite';

    return (
      <View style={{ 
        flexDirection: 'row', alignItems: 'center', 
        backgroundColor: isGroupInvite ? '#f0fdf4' : '#ffffff', 
        padding: 16, borderRadius: 20, marginBottom: 12,
        borderWidth: 1, borderColor: isGroupInvite ? '#bcf0da' : '#f3f4f6'
      }}>
        {/* Avatar icon: mailbox for group invites, person for friend requests */}
        <View style={{ 
          width: 44, height: 44, borderRadius: 22, 
          backgroundColor: isGroupInvite ? '#00966d' : '#e5e7eb', 
          justifyContent: 'center', alignItems: 'center', marginRight: 12
        }}>
          <Ionicons name={isGroupInvite ? "mail" : "person"} size={20} color="white" />
        </View>

        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ fontSize: 16, color: '#1f2937', fontWeight: '700' }}>
            {item.displayName || item.email.split('@')[0]}
          </Text>
          <Text style={{ fontSize: 13, color: isGroupInvite ? '#059669' : '#6b7280' }}>
            {isGroupInvite ? "Invited you to Split" : "Sent a friend request"}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {isGroupInvite ? (
            <TouchableOpacity 
              onPress={() => acceptGroupInvite(item)}
              style={{ backgroundColor: '#00966d', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>JOIN</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity 
                onPress={() => handleAcceptFriend(item.id)}
                style={{ backgroundColor: '#ecfdf5', padding: 8, borderRadius: 10, marginRight: 8 }}
              >
                <Ionicons name="checkmark" size={20} color="#10b981" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleDeclineFriend(item.id)}
                style={{ backgroundColor: '#fef2f2', padding: 8, borderRadius: 10 }}
              >
                <Ionicons name="close" size={20} color="#ef4444" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 20 }}>
        <Text style={{ fontSize: 32, fontWeight: '900', color: 'black' }}>Friends</Text>
        <Text style={{ fontSize: 16, color: '#6b7280', marginTop: 4, marginBottom: 24 }}>
          Manage your connections and invites.
        </Text>

        {/* Input section for adding friends by email */}
        <View style={{ flexDirection: 'row', marginBottom: 32 }}>
          <TextInput
            placeholder="Friend's email..."
            placeholderTextColor="#9ca3af"
            value={emailInput}
            onChangeText={setEmailInput}
            autoCapitalize="none"
            style={{ 
              flex: 1, backgroundColor: '#f9fafb', borderWidth: 1, 
              borderColor: '#e5e7eb', borderRadius: 16, padding: 16, 
              marginRight: 8, color: 'black'
            }}
          />
          <TouchableOpacity 
            onPress={handleSendRequest}
            style={{ backgroundColor: '#00966d', padding: 16, borderRadius: 16, justifyContent: 'center' }}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <Text style={{ 
          fontSize: 12, fontWeight: '800', color: '#9ca3af', 
          marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1.2 
        }}>
          Pending Activity
        </Text>
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={renderFriendItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={{ marginTop: 60, alignItems: 'center' }}>
              <Ionicons name="notifications-off-outline" size={40} color="#9ca3af" />
              <Text style={{ color: '#9ca3af', fontWeight: '600', marginTop: 10 }}>No requests pending</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}