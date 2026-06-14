import React, { useEffect } from 'react';
import { View, Image, Text, TouchableOpacity } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AppLayout() {
  const {
    user,
    pointsData,
    colors,
    styles,
    isDark,
    toastMounted,
    hideToast,
    t,
    hasUnreadNotifications
  } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();
  console.log('[AppLayout] Rendering, pathname:', pathname, 'user present:', !!user);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    console.log('[AppLayout] useEffect running, user present:', !!user);
    if (!user) {
      console.log('[AppLayout] Redirecting to /login because user is null');
      router.replace('/login');
    }
  }, [user]);

  if (!user) {
    console.log('[AppLayout] user is null, rendering null (blank screen)');
    return null;
  }

  // Determine current screen name for active tab styling
  const currentTab = pathname.includes('dashboard') 
    ? 'dashboard' 
    : pathname.includes('vouchers') 
    ? 'vouchers' 
    : pathname.includes('profile') 
    ? 'profile' 
    : 'dashboard';

  return (
    <SafeAreaView 
      style={styles.safeContainer}
      edges={['top', 'left', 'right']}
      onTouchStart={() => {
        if (toastMounted) {
          hideToast();
        }
      }}
    >
      {/* Header with dynamic Loondry branding */}
      <View style={styles.header}>
        <View style={styles.headerProfile}>
          <Image 
            source={isDark ? require('../../assets/loondry-logo-brand-white.png') : require('../../assets/loondry-logo-brand-colored.png')} 
            style={{ width: 130, height: 38 }} 
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity 
          style={{ padding: 4, position: 'relative' }}
          onPress={() => router.push('/(app)/notifications' as any)}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.foreground} />
          {hasUnreadNotifications && (
            <View style={{
              position: 'absolute',
              top: 4,
              right: 7,
              width: 8,
              height: 8,
              borderRadius: 8,
              backgroundColor: colors.primary,
              borderWidth: 0,
              borderColor: colors.card,
            }} />
          )}
        </TouchableOpacity>
      </View>

      {/* Render active sub-screen */}
      <View style={{ flex: 1 }}>
        <Slot />
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.bottomNavItem, currentTab === 'dashboard' && styles.bottomNavItemActive]}
          onPress={() => router.replace('/(app)/dashboard')}
        >
          <Ionicons name="list" size={20} color={currentTab === 'dashboard' ? colors.primary : colors.mutedForeground} />
          <Text style={[styles.bottomNavText, currentTab === 'dashboard' && styles.bottomNavTextActive]}>{t('tracking')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomNavItem, currentTab === 'vouchers' && styles.bottomNavItemActive]}
          onPress={() => router.replace('/(app)/vouchers')}
        >
          <Ionicons name="ticket" size={20} color={currentTab === 'vouchers' ? colors.primary : colors.mutedForeground} />
          <Text style={[styles.bottomNavText, currentTab === 'vouchers' && styles.bottomNavTextActive]}>{t('vouchers')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomNavItem, currentTab === 'profile' && styles.bottomNavItemActive]}
          onPress={() => router.replace('/(app)/profile')}
        >
          <Ionicons name="person" size={20} color={currentTab === 'profile' ? colors.primary : colors.mutedForeground} />
          <Text style={[styles.bottomNavText, currentTab === 'profile' && styles.bottomNavTextActive]}>{t('profile')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
