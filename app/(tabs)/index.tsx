import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [showOptions, setShowOptions] = useState(false);
  const [showHostOptions, setShowHostOptions] = useState(false); 
  const router = useRouter();

  const handleBack = () => {
    if (showHostOptions) {
      setShowHostOptions(false);
    } else {
      setShowOptions(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: 'white' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          
          <View style={{ alignItems: 'center', marginBottom: 48, width: '100%' }}>
            {/* Raised only the PayUp text with marginTop: -40 */}
            <Text style={{ 
              fontSize: 72, 
              fontWeight: '900', 
              color: 'black', 
              textAlign: 'center',
              marginTop: -40 
            }}>
              PayUp
            </Text>
            
            {!showOptions && (
              <Text style={{ fontSize: 24, color: '#9ca3af', marginTop: 4 }}>Home</Text>
            )}
          </View>

          {!showOptions ? (
            <TouchableOpacity 
              onPress={() => setShowOptions(true)}
              style={{ 
                backgroundColor: '#059669', 
                paddingVertical: 40, 
                borderRadius: 24, 
                width: '100%', 
                elevation: 8 
              }}
            >
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: '900', fontSize: 36, letterSpacing: 2 }}>
                SPLIT PAY
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: '100%', alignItems: 'center' }}>
              
              <TouchableOpacity 
                onPress={handleBack}
                style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
              >
                <Ionicons name="arrow-back" size={24} color="#059669" />
                <Text style={{ color: '#059669', fontWeight: 'bold', fontSize: 18, marginLeft: 8 }}>Back</Text>
              </TouchableOpacity>

              <View style={{ 
                backgroundColor: '#f3f4f6', 
                padding: 24, 
                borderRadius: 24, 
                width: '100%', 
                borderWidth: 2, 
                borderColor: '#e5e7eb' 
              }}>
                <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 20, textAlign: 'center' }}>
                  {showHostOptions ? "Host a Session" : "Start Your Session"}
                </Text>

                {!showHostOptions ? (
                  <>
                    <TouchableOpacity 
                      onPress={() => router.push('/splitpay/join')}
                      style={{ backgroundColor: '#059669', padding: 20, borderRadius: 16, marginBottom: 12 }}
                    >
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>Join Group (Participant)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      onPress={() => setShowHostOptions(true)} 
                      style={{ backgroundColor: '#2563eb', padding: 20, borderRadius: 16 }}
                    >
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>Create Group (Host)</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#6b7280', marginBottom: 12, textAlign: 'center' }}>Select Method:</Text>
                    
                    <TouchableOpacity 
                      onPress={() => router.push('/splitpay/create/scan')}
                      style={{ borderWidth: 2, borderColor: '#2563eb', padding: 18, borderRadius: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                    >
                      <Ionicons name="receipt" size={20} color="#2563eb" style={{ marginRight: 10 }} />
                      <Text style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 16 }}>Split by Item</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      onPress={() => router.push('/splitpay/create/roulette_spin')} 
                      style={{ borderWidth: 2, borderColor: '#475569', padding: 18, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                    >
                      <Image 
                        source={require('../../assets/images/roulette_7400514.png')} 
                        style={{ width: 24, height: 24, marginRight: 10, tintColor: '#475569' }} 
                        resizeMode="contain"
                      />
                      <Text style={{ color: '#475569', fontWeight: 'bold', fontSize: 16 }}>Roulette</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}