import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AppProvider, useAppContext } from '../context/AppContext';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar, Animated, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Prevent splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const {
    appReady,
    isDark,
    colors,
    styles,
    toastMounted,
    toastOpacity,
    toastTranslateY,
    toastType,
    toastMessage,
    hideToast,
  } = useAppContext();

  const [fontsLoaded] = useFonts({
    'Geist-Regular': require('../assets/fonts/Geist-Regular.ttf'),
    'Geist-Medium': require('../assets/fonts/Geist-Medium.ttf'),
    'Geist-SemiBold': require('../assets/fonts/Geist-SemiBold.ttf'),
    'Geist-Bold': require('../assets/fonts/Geist-Bold.ttf'),
    'Geist-Black': require('../assets/fonts/Geist-Black.ttf'),
    'Geist-Light': require('../assets/fonts/Geist-Light.ttf'),
    'Geist-Thin': require('../assets/fonts/Geist-Thin.ttf'),
  });

  console.log('[RootLayoutContent] Rendering, appReady:', appReady, 'fontsLoaded:', fontsLoaded);

  useEffect(() => {
    console.log('[RootLayoutContent] useEffect running, appReady:', appReady, 'fontsLoaded:', fontsLoaded);
    if (appReady && fontsLoaded) {
      console.log('[RootLayoutContent] Hiding splash screen');
      SplashScreen.hideAsync();
    }
  }, [appReady, fontsLoaded]);

  if (!appReady || !fontsLoaded) {
    console.log('[RootLayoutContent] appReady or fontsLoaded is false, rendering null');
    return null;
  }

  return (
    <Animated.View 
      style={{ flex: 1, backgroundColor: colors.background }}
      onTouchStart={() => {
        if (toastMounted) {
          hideToast();
        }
      }}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.card} />
      
      <Stack screenOptions={{ headerShown: false }} />

      {/* Global Toast Notification */}
      <Animated.View 
        pointerEvents={toastMounted ? "auto" : "none"}
        style={[
          styles.toastContainer,
          toastType === 'success' && styles.toastSuccess,
          toastType === 'error' && styles.toastError,
          toastType === 'info' && styles.toastInfo,
          {
            opacity: toastOpacity,
            transform: [{ translateY: toastTranslateY }],
            elevation: toastMounted ? 6 : 0,
            shadowOpacity: toastMounted ? 0.2 : 0,
            paddingHorizontal: 0,
            paddingVertical: 0,
          }
        ]}
      >
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={hideToast}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            paddingHorizontal: 16,
            paddingVertical: 14,
          }}
        >
          <Ionicons 
            name={toastType === 'success' ? 'checkmark-circle' : toastType === 'error' ? 'alert-circle' : 'information-circle'} 
            size={18} 
            color="#ffffff" 
          />
          <Text style={styles.toastText}>{toastMessage || ''}</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <RootLayoutContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}
