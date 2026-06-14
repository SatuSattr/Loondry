import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StatusBar, 
  ImageBackground, 
  StyleSheet, 
  Modal, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  TextInput, 
  ActivityIndicator,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const {
    email, setEmail,
    password, setPassword,
    isLoggingIn,
    loginError, setLoginError,
    isLoginDrawerOpen, setIsLoginDrawerOpen,
    showPassword, setShowPassword,
    handleLogin,
    changeThemeSetting,
    isDark,
    colors,
    styles,
    toastMounted,
    hideToast,
    t
  } = useAppContext();

  const { height: screenHeight } = Dimensions.get('window');
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    if (isLoginDrawerOpen) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(screenHeight);
    }
  }, [isLoginDrawerOpen]);

  return (
    <View style={{ flex: 1 }} onTouchStart={() => {
      if (toastMounted) {
        hideToast();
      }
    }}>
      <StatusBar barStyle="light-content" backgroundColor="#09090b" />
      
      <ImageBackground
        source={require('../assets/login-bg.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        {/* Dark Premium overlay */}
        <View style={styles.brandOverlay} />
        
        <SafeAreaView style={styles.brandContainer}>
          {/* Header with logo & floating theme toggle */}
          <View style={styles.brandHeader}>
            <Image 
              source={require('../assets/loondry-logo-brand-white.png')} 
              style={styles.brandLogoImageLarge}
              resizeMode="contain"
            />
            
            <TouchableOpacity
              style={styles.brandThemeToggle}
              onPress={() => changeThemeSetting(isDark ? 'light' : 'dark')}
            >
              <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
          
          {/* Centered content showing motto */}
          <View style={styles.brandContent}>
            <View style={styles.brandMottoBox}>
              <Text style={styles.brandMottoTitle}>
                {t('mottoTitle')}
              </Text>
              <Text style={styles.brandMottoSubtitle}>
                {t('mottoSubtitle')}
              </Text>
            </View>
          </View>
          
          {/* Bottom section with Login CTA and Copyright */}
          <View style={styles.brandFooter}>
            <TouchableOpacity 
              style={styles.brandLoginBtn} 
              onPress={() => {
                setLoginError('');
                setIsLoginDrawerOpen(true);
              }}
            >
              <Text style={styles.brandLoginBtnText}>{t('loginBtn')}</Text>
              <Ionicons name="arrow-forward" size={18} color="#09090b" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
            
            <Text style={styles.brandCopyrightText}>
              &copy; {new Date().getFullYear()} Loondry. All rights reserved.
            </Text>
          </View>
        </SafeAreaView>
      </ImageBackground>

      {/* Bottom Drawer Modal for credentials login */}
      <Modal
        visible={isLoginDrawerOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsLoginDrawerOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.drawerOverlay}>
            {/* Click outside to close */}
            <TouchableOpacity 
              style={styles.drawerDismissArea} 
              activeOpacity={1} 
              onPress={() => setIsLoginDrawerOpen(false)}
            />
            
            <Animated.View style={[{ transform: [{ translateY: slideAnim }] }, styles.drawerContent, { backgroundColor: colors.card, borderTopColor: colors.cardBorder }]}>
              {/* Top drag indicator handle */}
              <View style={[styles.drawerHandleBar, { backgroundColor: colors.mutedForeground + '30' }]} />
              
              <View style={styles.drawerHeader}>
                <Text style={[styles.drawerTitle, { color: colors.foreground }]}>{t('loginTitle')}</Text>
                <TouchableOpacity 
                  style={[styles.drawerCloseBtn, { backgroundColor: colors.mutedForeground + '15' }]} 
                  onPress={() => setIsLoginDrawerOpen(false)}
                >
                  <Ionicons name="close" size={18} color={colors.foreground} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                contentContainerStyle={styles.drawerScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {loginError ? (
                  <View style={styles.loginErrorBox}>
                    <Text style={styles.loginErrorText}>{loginError}</Text>
                  </View>
                ) : null}

                <View style={styles.inputFieldGroup}>
                  <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>{t('emailLabel')}</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
                    <Ionicons name="mail" size={16} color={colors.mutedForeground} style={styles.inputFieldIcon} />
                    <TextInput
                      style={[styles.inputField, { color: colors.foreground }]}
                      placeholder={t('emailPlaceholder')}
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        setLoginError('');
                      }}
                    />
                  </View>
                </View>

                <View style={styles.inputFieldGroup}>
                  <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>{t('passwordLabel')}</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
                    <Ionicons name="lock-closed" size={16} color={colors.mutedForeground} style={styles.inputFieldIcon} />
                    <TextInput
                      style={[styles.inputField, { color: colors.foreground, flex: 1, paddingRight: 0 }]}
                      placeholder="••••••••"
                      placeholderTextColor={colors.mutedForeground}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        setLoginError('');
                      }}
                    />
                    <TouchableOpacity 
                      style={{ 
                        paddingHorizontal: 12,
                        height: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons 
                        name={showPassword ? 'eye-off' : 'eye'} 
                        size={16} 
                        color={colors.mutedForeground} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.loginButton, { backgroundColor: colors.primary }, isLoggingIn && { opacity: 0.7 }]} 
                  onPress={handleLogin}
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <ActivityIndicator color={colors.primaryForeground} size="small" />
                  ) : (
                    <Text style={[styles.loginButtonText, { color: colors.primaryForeground }]}>{t('loginSubmit')}</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
