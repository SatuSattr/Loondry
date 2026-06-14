import React, { useEffect } from 'react';
import { View, Text, Image, ActivityIndicator, StatusBar} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { width, height } from '../styles';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function IndexScreen() {
  const { colors, isDark, appReady, initialRoute } = useAppContext();

  useEffect(() => {
    console.log('[IndexScreen] useEffect check, appReady:', appReady, 'initialRoute:', initialRoute);
    if (appReady && initialRoute) {
      console.log('[IndexScreen] Performing router.replace to:', initialRoute);
      router.replace(initialRoute as any);
    }
  }, [appReady, initialRoute]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={{ alignItems: 'center' }}>
        <Image 
          source={isDark ? require('../assets/loondry-logo-brand-white.png') : require('../assets/loondry-logo-brand-colored.png')} 
          style={{ width: width * 0.6, height: height * 0.15 }}
          resizeMode="contain"
        />
        <Text style={{
          color: colors.mutedForeground,
          fontSize: 12,
          fontFamily: 'Geist-Medium',
          marginTop: 10,
          letterSpacing: 2,
        }}>
          PREMIUM LAUNDRY & FABRIC CARE
        </Text>
      </View>
      <View style={{ position: 'absolute', bottom: 50 }}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    </SafeAreaView>
  );
}
