import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import "../global.css";
import { auth } from './firebase';

export const unstable_settings = {
  // Ensures that the tab bar remains the entry point anchor
  anchor: '(tabs)',
};

/**
 * ROOT LAYOUT
 * The top-level entry point of the app. 
 * Manages global themes, authentication-based routing, and the navigation stack.
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const segments = useSegments();

  // AUTH OBSERVER: Listens for login/logout events from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, [initializing]);

  // PROTECTION LOGIC: Redirects users based on their login status
  useEffect(() => {
    if (initializing) return;

    const inTabsGroup = segments[0] === '(tabs)';

    // If no user is logged in and they try to access a private tab, force them to Login
    if (!user && inTabsGroup) {
      router.replace('/login' as any); 
    } 
    // If a user is logged in but tries to go to the Login page, bounce them to the app
    else if (user && (segments[0] as any) === 'login') {
      router.replace('/(tabs)' as any);
    }
  }, [user, segments, initializing, router]); 

  // Prevent UI flashes while checking auth status
  if (initializing) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* Global Stack Navigator: headerShown: false hides the default header for a custom look */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Hiding headers for the SplitPay feature flow */}
        <Stack.Screen name="splitpay/index" options={{ headerShown: false }} />
        <Stack.Screen name="splitpay/join/index" options={{ headerShown: false }} />
        
        {/* Modals are given headers for navigation clarity */}
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}