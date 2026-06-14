import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  TextInput, 
  ActivityIndicator, 
  Modal,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../context/AppContext';
import { formatImageUrl } from '../../src/api';
import { LinearGradient } from 'expo-linear-gradient';

const getRankInfo = (points: number) => {
  if (points >= 1000) return { name: 'Platinum', color: '#0ea5e9' };
  if (points >= 500) return { name: 'Gold', color: '#eab308' };
  if (points >= 200) return { name: 'Silver', color: '#94a3b8' };
  return { name: 'Bronze', color: '#cd7f32' };
};

export default function ProfileScreen() {
  const {
    user,
    handlePickAvatar,
    isUploadingAvatar,
    editName,
    setEditName,
    editPhone,
    setEditPhone,
    editAddress,
    setEditAddress,
    isSavingProfile,
    handleSaveProfile,
    setIsPasswordModalOpen,
    isPasswordModalOpen,
    handleLogout,
    changeThemeSetting,
    themeSetting,
    colors,
    styles,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isSavingPassword,
    handleChangePassword,
    language,
    setLanguage,
    t,
    pointsData,
    isDark,
  } = useAppContext();

  const [isEditing, setIsEditing] = useState(false);
  const { height: screenHeight } = Dimensions.get('window');
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    if (isPasswordModalOpen) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(screenHeight);
    }
  }, [isPasswordModalOpen]);

  return (
    <ScrollView contentContainerStyle={styles.profileContainer} keyboardShouldPersistTaps="handled">
      
      {/* Profile Header with Gradient Background */}
      <LinearGradient
        colors={[colors.primary, colors.primaryGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.profileHeaderCard, { backgroundColor: 'transparent', borderWidth: isDark ? 1 : 0, borderColor: 'rgba(255,255,255,0.1)' }]}
      >
        <TouchableOpacity 
          style={styles.profileAvatarContainer}
          onPress={handlePickAvatar}
          disabled={isUploadingAvatar}
          activeOpacity={0.8}
        >
          {user?.avatar_url ? (
            <Image 
              source={{ uri: formatImageUrl(user.avatar_url) || '' }} 
              style={[styles.profileAvatarImageLarge, { borderColor: '#ffffff' }]} 
            />
          ) : (
            <View style={[styles.profileAvatarLarge, { borderColor: '#ffffff', borderWidth: 2, backgroundColor: 'rgba(255,255,255,0.22)' }]}>
              <Text style={styles.profileAvatarTextLarge}>
                {user?.name ? user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() : 'C'}
              </Text>
            </View>
          )}
          {isUploadingAvatar ? (
            <View style={[styles.profileAvatarImageLarge, { position: 'absolute', top: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', borderColor: '#ffffff' }]}>
              <ActivityIndicator color="#ffffff" />
            </View>
          ) : (
            <View style={[styles.avatarEditBadge, { borderColor: colors.primary, backgroundColor: colors.success }]}>
              <Ionicons name="camera" size={12} color="#ffffff" />
            </View>
          )}
        </TouchableOpacity>
        
        <Text style={[styles.profileHeaderName, { color: '#ffffff' }]}>{user?.name}</Text>
        <Text style={[styles.profileHeaderEmail, { color: 'rgba(255, 255, 255, 0.75)' }]}>{user?.email}</Text>
        
        {/* Rank and Points Badges Row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 }}>
          {/* Rank Badge */}
          <View style={{
            backgroundColor: getRankInfo(pointsData?.points || 0).color,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: '#ffffff',
          }}>
            <Text style={{
              color: '#ffffff',
              fontSize: 9,
              fontFamily: 'Geist-Bold',
              letterSpacing: 0.5,
            }}>
              {getRankInfo(pointsData?.points || 0).name.toUpperCase() + ' RANK'}
            </Text>
          </View>

          {/* Points Badge */}
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.22)',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: '#ffffff',
          }}>
            <Text style={{
              color: '#ffffff',
              fontSize: 9,
              fontFamily: 'Geist-Bold',
            }}>
              {(pointsData?.points || 0) + ' PTS'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Theme customizer section */}
      <View style={styles.profileCard}>
        <Text style={styles.profileCardTitle}>{t('appThemeTitle')}</Text>
        <View style={styles.themeToggleGroup}>
          {(['system', 'light', 'dark'] as const).map((tVal) => (
            <TouchableOpacity
              key={tVal}
              style={[
                styles.themeToggleBtn, 
                themeSetting === tVal && styles.themeToggleBtnActive
              ]}
              onPress={() => changeThemeSetting(tVal)}
            >
              <Ionicons 
                name={tVal === 'system' ? 'phone-portrait-outline' : tVal === 'light' ? 'sunny-outline' : 'moon-outline'} 
                size={16} 
                color={themeSetting === tVal ? colors.primaryForeground : colors.mutedForeground} 
              />
              <Text style={[
                styles.themeToggleText,
                themeSetting === tVal && styles.themeToggleTextActive
              ]}>
                {tVal === 'system' ? t('themeSystem') : tVal === 'light' ? t('themeLight') : t('themeDark')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Language Settings Section */}
      <View style={styles.profileCard}>
        <Text style={styles.profileCardTitle}>{t('languageSetting')}</Text>
        <View style={styles.themeToggleGroup}>
          <TouchableOpacity
            style={[
              styles.themeToggleBtn, 
              language === 'id' && styles.themeToggleBtnActive
            ]}
            onPress={() => setLanguage('id')}
          >
            <Ionicons 
              name="flag-outline" 
              size={16} 
              color={language === 'id' ? colors.primaryForeground : colors.mutedForeground} 
            />
            <Text style={[
              styles.themeToggleText,
              language === 'id' && styles.themeToggleTextActive
            ]}>
              Indonesia
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.themeToggleBtn, 
              language === 'en' && styles.themeToggleBtnActive
            ]}
            onPress={() => setLanguage('en')}
          >
            <Ionicons 
              name="globe-outline" 
              size={16} 
              color={language === 'en' ? colors.primaryForeground : colors.mutedForeground} 
            />
            <Text style={[
              styles.themeToggleText,
              language === 'en' && styles.themeToggleTextActive
            ]}>
              English
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Details (Inputs toggled by isEditing state) */}
      <View style={styles.profileCard}>
        <Text style={styles.profileCardTitle}>{t('profileDetails')}</Text>

        <Text style={styles.inputLabel}>{t('fullName')}</Text>
        <View style={[styles.inputContainer, !isEditing && { backgroundColor: colors.background, opacity: 0.75 }]}>
          <Ionicons name="person" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
          <TextInput
            style={[styles.textInput, !isEditing && { color: colors.mutedForeground }]}
            placeholder={t('namePlaceholder')}
            placeholderTextColor={colors.mutedForeground}
            value={editName}
            onChangeText={setEditName}
            editable={isEditing}
          />
        </View>

        <Text style={[styles.inputLabel, { marginTop: 12 }]}>{t('whatsAppNumber')}</Text>
        <View style={[styles.inputContainer, !isEditing && { backgroundColor: colors.background, opacity: 0.75 }]}>
          <Ionicons name="logo-whatsapp" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
          <TextInput
            style={[styles.textInput, !isEditing && { color: colors.mutedForeground }]}
            placeholder="0812xxxx"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="phone-pad"
            value={editPhone}
            onChangeText={setEditPhone}
            editable={isEditing}
          />
        </View>

        <Text style={[styles.inputLabel, { marginTop: 12 }]}>{t('address')}</Text>
        <View style={[styles.inputContainer, { height: 90, alignItems: 'flex-start' }, !isEditing && { backgroundColor: colors.background, opacity: 0.75 }]}>
          <Ionicons name="location" size={16} color={colors.mutedForeground} style={[styles.inputIcon, { marginTop: 10 }]} />
          <TextInput
            style={[styles.textInput, { height: 80, textAlignVertical: 'top' }, !isEditing && { color: colors.mutedForeground }]}
            placeholder={t('addressPlaceholder')}
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={3}
            value={editAddress}
            onChangeText={setEditAddress}
            editable={isEditing}
          />
        </View>

        <TouchableOpacity 
          style={styles.saveProfileBtn} 
          onPress={async () => {
            if (isEditing) {
              const success = await handleSaveProfile();
              if (success) {
                setIsEditing(false);
              }
            } else {
              setIsEditing(true);
            }
          }}
          disabled={isSavingProfile}
        >
          {isSavingProfile ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={styles.saveProfileBtnText}>
              {isEditing ? t('saveProfileBtn') : t('editProfileBtn')}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.passwordModalBtn}
        onPress={() => setIsPasswordModalOpen(true)}
      >
        <Ionicons name="key" size={18} color={colors.primary} />
        <Text style={styles.passwordModalBtnText}>{t('changePasswordBtn')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out" size={18} color="#ffffff" />
        <Text style={styles.logoutBtnText}>{t('logoutBtn')}</Text>
      </TouchableOpacity>

      {/* App Version Info Note */}
      <Text style={{
        textAlign: 'center',
        fontSize: 11,
        color: colors.mutedForeground,
        fontFamily: 'Geist-Regular',
        marginTop: 24,
        marginBottom: 8
      }}>
        Loondry Mobile App v1.0.0
      </Text>

      {/* Change Password sliding bottom drawer */}
      <Modal
        visible={isPasswordModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsPasswordModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(15,23,42,0.7)' }]}>
            {/* Click outside to close */}
            <TouchableOpacity 
              style={styles.drawerDismissArea} 
              activeOpacity={1} 
              onPress={() => setIsPasswordModalOpen(false)}
            />
            
            <Animated.View style={[{ transform: [{ translateY: slideAnim }] }, styles.drawerContent, { backgroundColor: colors.card, borderTopColor: colors.cardBorder }]}>
              {/* Top drag indicator handle */}
              <View style={[styles.drawerHandleBar, { backgroundColor: colors.mutedForeground + '30' }]} />
              
              <View style={styles.drawerHeader}>
                <Text style={[styles.drawerTitle, { color: colors.foreground }]}>{t('passwordModalTitle')}</Text>
                <TouchableOpacity 
                  style={[styles.drawerCloseBtn, { backgroundColor: colors.mutedForeground + '15' }]} 
                  onPress={() => setIsPasswordModalOpen(false)}
                >
                  <Ionicons name="close" size={18} color={colors.foreground} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                contentContainerStyle={styles.drawerScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.inputLabel}>{t('currentPasswordLabel')}</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-open" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="..."
                      placeholderTextColor={colors.mutedForeground}
                      secureTextEntry
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                    />
                  </View>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.inputLabel}>{t('newPasswordLabel')}</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="..."
                      placeholderTextColor={colors.mutedForeground}
                      secureTextEntry
                      value={newPassword}
                      onChangeText={setNewPassword}
                    />
                  </View>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.inputLabel}>{t('confirmPasswordLabel')}</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="checkmark-circle-outline" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="..."
                      placeholderTextColor={colors.mutedForeground}
                      secureTextEntry
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.saveProfileBtn, { backgroundColor: colors.primary, marginTop: 20 }]}
                  onPress={handleChangePassword}
                  disabled={isSavingPassword}
                >
                  {isSavingPassword ? (
                    <ActivityIndicator color={colors.primaryForeground} size="small" />
                  ) : (
                    <Text style={styles.saveProfileBtnText}>{t('save')}</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </ScrollView>
  );
}
