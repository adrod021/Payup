import { ThemedText } from '@/components/themed-text';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        
        <ThemedText type="title" style={{ marginBottom: 8, fontSize: 32 }}>PayUp</ThemedText>
        <ThemedText style={{ color: '#6b7280', marginBottom: 40 }}>Welcome to the Split Hub</ThemedText>

        {/* MAIN SPLIT PAY BUTTON */}
        <TouchableOpacity 
          className="bg-emerald-600 rounded-3xl p-8 w-full items-center shadow-lg"
          style={{ marginBottom: 24, flexDirection: 'row', justifyContent: 'center' }}
        >
          <MaterialCommunityIcons name="currency-usd" size={32} color="white" style={{ marginRight: 10 }} />
          <ThemedText className="text-white font-bold text-2xl">Start Split Pay</ThemedText>
        </TouchableOpacity>

        <ThemedText style={{ color: '#6b7280', marginBottom: 20 }}>Choose your role below</ThemedText>

        {/* HOST vs. PARTICIPANT SECTION */}
        <View style={{ width: '100%', gap: 16 }}>
          
          {/* HOST: Create Group */}
          <View className="bg-gray-100 rounded-2xl p-6 border border-gray-200" style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="people" size={24} color="#2563eb" style={{ marginRight: 8 }} />
              <ThemedText className="text-blue-600 font-bold text-lg">Create Group (Host)</ThemedText>
            </View>
            <ThemedText style={{ color: '#4b5563', fontSize: 14 }}>Add participants and choose your split method.</ThemedText>
            
            {/* Host Specific Buttons */}
            <TouchableOpacity 
              className="bg-gray-200 rounded-xl p-4 w-full items-center border border-gray-300"
              style={{ flexDirection: 'row', justifyContent: 'center' }}
            >
              <Ionicons name="receipt-outline" size={20} color="#4b5563" style={{ marginRight: 8 }} />
              <ThemedText className="text-gray-700 font-semibold">Split by Item</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-gray-200 rounded-xl p-4 w-full items-center border border-gray-300"
              style={{ flexDirection: 'row', justifyContent: 'center' }}
            >
              <MaterialCommunityIcons name="clover" size={20} color="#4b5563" style={{ marginRight: 8 }} />
              <ThemedText className="text-gray-700 font-semibold">Roulette</ThemedText>
            </TouchableOpacity>
          </View>

          {/* PARTICIPANT: Join Group */}
          <View className="bg-gray-100 rounded-2xl p-6 border border-gray-200" style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="enter" size={24} color="#059669" style={{ marginRight: 8 }} />
              <ThemedText className="text-emerald-600 font-bold text-lg">Join Group (Participant)</ThemedText>
            </View>
            <ThemedText style={{ color: '#4b5563', fontSize: 14 }}>Wait for the host to scan or start the split.</ThemedText>
            
            <TouchableOpacity 
              className="bg-emerald-100 rounded-xl p-4 w-full items-center border border-emerald-300"
              style={{ flexDirection: 'row', justifyContent: 'center' }}
            >
              <ThemedText className="text-emerald-700 font-semibold">Wait for Host</ThemedText>
            </TouchableOpacity>
          </View>

        </View>

        <View style={{ marginTop: 40, width: '100%' }}>
          <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Activity</ThemedText>
          <View className="bg-gray-50 rounded-xl p-4 items-center">
            <ThemedText style={{ color: '#9ca3af', fontStyle: 'italic' }}>No active sessions</ThemedText>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}