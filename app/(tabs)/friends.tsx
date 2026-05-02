import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// firebase imports
import { and, collection, deleteDoc, doc, getDoc, onSnapshot, or, query, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { sendFriendRequest } from "../services/invite";
import type { User as AppUser } from '../types';

interface Friend {
  id: string;
  identifier: string; 
  username?: string;
  status: 'pending_friend' | 'accepted'; 
}

export default function FriendsScreen() {
  const [searchInput, setSearchInput] = useState(''); 
  const [pendingActivity, setPendingActivity] = useState<Friend[]>([]); 
  const [friendsList, setFriendsList] = useState<Friend[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) return;

    // Only tracking Friend Requests now to ensure users join sessions via the main loading screen
    const qFriendReqs = query(
      collection(db, "friendRequests"),
      or(
        and(where("toUid", "==", user.uid), where("status", "==", "pending")),
        and(where("toIdentifier", "==", user.email?.toLowerCase()), where("status", "==", "pending")),
        and(where("toIdentifier", "==", user.phoneNumber), where("status", "==", "pending"))
      )
    );

    const qAccepted = query(collection(db, "users", user.uid, "friends"));

    const unsubFriendReqs = onSnapshot(qFriendReqs, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({
        id: doc.id,
        identifier: doc.data().fromIdentifier,
        username: doc.data().fromUsername,
        status: 'pending_friend' as const
      }));
      setPendingActivity(reqs);
    });

    const unsubAccepted = onSnapshot(qAccepted, (snapshot) => {
      const accepted = snapshot.docs.map(doc => ({
        id: doc.id,
        identifier: doc.data().identifier,
        username: doc.data().username,
        status: 'accepted' as const
      }));
      setFriendsList(accepted);
    });

    return () => {
      unsubFriendReqs();
      unsubAccepted();
    };
  }, [user, router]);

  const handleAcceptFriend = async (request: Friend) => {
    try {
      if (!user?.uid) return;
      
      const requestRef = doc(db, "friendRequests", request.id);
      const requestSnap = await getDoc(requestRef);
      const requestData = requestSnap.data();

      if (!requestData) return;

      const myProfileSnap = await getDoc(doc(db, "users", user.uid));
      const myUsername = myProfileSnap.data()?.username || user.displayName || "User";

      await updateDoc(requestRef, { status: 'accepted' });

      await setDoc(doc(db, "users", user.uid, "friends", requestData.fromUid), {
        username: requestData.fromUsername || "User",
        identifier: requestData.fromIdentifier,
        addedAt: new Date().toISOString()
      });

      await setDoc(doc(db, "users", requestData.fromUid, "friends", user.uid), {
        username: myUsername,
        identifier: user.email || user.phoneNumber || "User",
        addedAt: new Date().toISOString()
      });

      Alert.alert("Success", "Friend added!");
    } catch (error) {
      console.error("Accept Error", error);
    }
  };

  const handleDeclineRequest = async (item: Friend) => {
    try {
      await deleteDoc(doc(db, "friendRequests", item.id));
    } catch (error) {
      console.error("Decline Error", error);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      if (!user?.uid) return;
      await deleteDoc(doc(db, "users", user.uid, "friends", friendId));
      await deleteDoc(doc(db, "users", friendId, "friends", user.uid));
      setActiveMenuId(null);
      Alert.alert("Removed", "Friend has been removed.");
    } catch (error) {
      console.error("Remove Error", error);
    }
  };

  const handleSendRequest = async () => {
    if (!searchInput.trim() || !user) return;
    try {
      await sendFriendRequest(user as AppUser, searchInput.trim());
      setSearchInput('');
      Alert.alert("Sent", "Friend request sent!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "User not found.");
    }
  };

  const renderItem = ({ item, isFriend }: { item: Friend, isFriend: boolean }) => {
    return (
      <View style={{ 
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', 
        padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#f3f4f6',
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
        zIndex: activeMenuId === item.id ? 10 : 1
      }}>
        <View style={{ 
          width: 44, height: 44, borderRadius: 22, backgroundColor: '#e5e7eb', 
          justifyContent: 'center', alignItems: 'center', marginRight: 12
        }}>
          <Ionicons name="person" size={20} color="#4b5563" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, color: '#1f2937', fontWeight: '700' }}>{item.username || item.identifier}</Text>
          {!isFriend && (
            <Text style={{ fontSize: 13, color: '#6b7280' }}>Sent a friend request</Text>
          )}
        </View>

        {isFriend ? (
          <View style={{ position: 'relative' }}>
            <TouchableOpacity onPress={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}>
              <Ionicons name="ellipsis-vertical" size={20} color="#9ca3af" />
            </TouchableOpacity>
            
            {activeMenuId === item.id && (
              <View style={{ 
                position: 'absolute', right: 0, top: 35, backgroundColor: 'white', 
                borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', width: 160,
                elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, zIndex: 999,
                overflow: 'hidden'
              }}>
                <TouchableOpacity 
                  onPress={() => handleRemoveFriend(item.id)}
                  style={{ backgroundColor: '#fee2e2', paddingVertical: 12, paddingHorizontal: 10, alignItems: 'center' }}
                >
                  <Text style={{ color: '#ef4444', fontWeight: '800', fontSize: 14 }}>REMOVE FRIEND</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity 
              onPress={() => handleAcceptFriend(item)} 
              style={{ backgroundColor: '#ecfdf5', padding: 8, borderRadius: 10, marginRight: 8 }}
            >
              <Ionicons name="checkmark" size={20} color="#10b981" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleDeclineRequest(item)} 
              style={{ backgroundColor: '#fef2f2', padding: 8, borderRadius: 10 }}
            >
              <Ionicons name="close" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const EmptyListComponent = ({ message, icon }: { message: string, icon: keyof typeof Ionicons.glyphMap }) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
      <Ionicons name={icon} size={40} color="#d1d5db" style={{ marginBottom: 8 }} />
      <Text style={{ textAlign: 'center', color: '#9ca3af', fontSize: 14, fontWeight: '500' }}>{message}</Text>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={() => setActiveMenuId(null)}>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 20 }}>
          <Text style={{ fontSize: 32, fontWeight: '900', color: 'black' }}>Friends</Text>
          
          <View style={{ flexDirection: 'row', marginTop: 24, marginBottom: 32 }}>
            <TextInput
              placeholder="Email or Phone Number..."
              placeholderTextColor="#9ca3af"
              value={searchInput}
              onChangeText={setSearchInput}
              autoCapitalize="none"
              style={{ flex: 1, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16, padding: 16, marginRight: 8 }}
            />
            <TouchableOpacity onPress={handleSendRequest} style={{ backgroundColor: '#00966d', padding: 16, borderRadius: 16 }}>
              <Ionicons name="person-add" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 12, fontWeight: '800', color: '#9ca3af', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Friend Requests</Text>
          <FlatList
            data={pendingActivity}
            keyExtractor={(item) => item.id}
            renderItem={({item}) => renderItem({item, isFriend: false})}
            style={{ maxHeight: '35%' }}
            contentContainerStyle={pendingActivity.length === 0 ? { flexGrow: 1 } : null}
            ListEmptyComponent={<EmptyListComponent message="No new requests" icon="mail-outline" />}
          />

          <Text style={{ fontSize: 12, fontWeight: '800', color: '#9ca3af', marginTop: 20, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Your Friends</Text>
          <FlatList
            data={friendsList}
            keyExtractor={(item) => item.id}
            renderItem={({item}) => renderItem({item, isFriend: true})}
            contentContainerStyle={friendsList.length === 0 ? { flexGrow: 1 } : null}
            ListEmptyComponent={<EmptyListComponent message="Add friends to split bills easily!" icon="people-outline" />}
          />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}