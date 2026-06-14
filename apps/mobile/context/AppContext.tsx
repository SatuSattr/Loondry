import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useColorScheme, Clipboard, Animated, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { api, setAuthToken } from '../src/api';
import { LIGHT_COLORS, DARK_COLORS, createStyles, MOCK_PROOF_BASE64 } from '../styles';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { translations, Language, TranslationKey } from './translations';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface AppContextProps {
  appReady: boolean;
  setAppReady: (ready: boolean) => void;
  initialRoute: string | null;
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  activeSlide: number;
  setActiveSlide: (slide: number) => void;
  themeSetting: 'system' | 'light' | 'dark';
  setThemeSetting: (theme: 'system' | 'light' | 'dark') => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (pass: string) => void;
  user: any;
  setUser: (user: any) => void;
  isLoggingIn: boolean;
  loginError: string;
  setLoginError: (error: string) => void;
  isLoginDrawerOpen: boolean;
  setIsLoginDrawerOpen: (open: boolean) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  isDark: boolean;
  colors: typeof LIGHT_COLORS;
  styles: any;
  transactions: any[];
  loadingTransactions: boolean;
  selectedTx: any;
  setSelectedTx: (tx: any) => void;
  isTxDetailOpen: boolean;
  setIsTxDetailOpen: (open: boolean) => void;
  pointsData: any;
  unusedVouchers: any[];
  voucherTemplates: any[];
  loadingVouchers: boolean;
  voucherSubTab: 'mine' | 'catalog';
  setVoucherSubTab: (tab: 'mine' | 'catalog') => void;
  paymentMethod: 'transfer' | 'qris';
  setPaymentMethod: (method: 'transfer' | 'qris') => void;
  voucherCodeInput: string;
  setVoucherCodeInput: (code: string) => void;
  checkingVoucher: boolean;
  appliedVoucher: any;
  setAppliedVoucher: (voucher: any) => void;
  voucherError: string;
  setVoucherError: (err: string) => void;
  isSubmittingPayment: boolean;
  showProofPicker: boolean;
  setShowProofPicker: (show: boolean) => void;
  selectedProofBase64: string | null;
  setSelectedProofBase64: (proof: string | null) => void;
  editName: string;
  setEditName: (name: string) => void;
  editPhone: string;
  setEditPhone: (phone: string) => void;
  editAddress: string;
  setEditAddress: (address: string) => void;
  isSavingProfile: boolean;
  isUploadingAvatar: boolean;
  isPasswordModalOpen: boolean;
  setIsPasswordModalOpen: (open: boolean) => void;
  currentPassword: string;
  setCurrentPassword: (pass: string) => void;
  newPassword: string;
  setNewPassword: (pass: string) => void;
  confirmPassword: string;
  setConfirmPassword: (pass: string) => void;
  isSavingPassword: boolean;
  toastMessage: string;
  toastType: 'success' | 'error' | 'info';
  toastMounted: boolean;
  toastOpacity: Animated.Value;
  toastTranslateY: Animated.AnimatedInterpolation<number>;
  txFilter: 'all' | 'active' | 'completed';
  setTxFilter: (filter: 'all' | 'active' | 'completed') => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  refreshDashboardData: (force?: boolean) => Promise<void>;
  loadVouchersTab: (force?: boolean) => Promise<void>;
  handleLogin: () => Promise<void>;
  handleLogout: () => Promise<void>;
  changeThemeSetting: (theme: 'system' | 'light' | 'dark') => Promise<void>;
  copyToClipboard: (text: string) => void;
  handleRedeemVoucher: (template: any) => Promise<void>;
  checkVoucher: () => Promise<void>;
  submitPaymentProof: () => Promise<void>;
  cancelPayment: () => Promise<void>;
  handlePickAvatar: () => Promise<void>;
  handlePickProof: () => Promise<void>;
  handleSaveProfile: () => Promise<boolean>;
  handleChangePassword: () => Promise<void>;
  openTransactionDetail: (tx: any) => Promise<void>;
  hasUnreadNotifications: boolean;
  setHasUnreadNotifications: (val: boolean) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();

  // App initialization states
  const [appReady, setAppReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [language, setLanguageState] = useState<Language>('id');
  
  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem('lnd_lang', lang);
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>) => {
    let text = translations[language]?.[key] || translations['id']?.[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };
  
  // Navigation & Theme Settings
  const [activeSlide, setActiveSlide] = useState(0);
  const [themeSetting, setThemeSetting] = useState<'system' | 'light' | 'dark'>('system');
  
  // Credentials & Server Address
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoginDrawerOpen, setIsLoginDrawerOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Dynamic state for theme mode
  const isDark = themeSetting === 'system' 
    ? systemColorScheme === 'dark' 
    : themeSetting === 'dark';
    
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
  const styles = createStyles(colors, isDark);

  // Data States
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [isTxDetailOpen, setIsTxDetailOpen] = useState(false);

  // Points & Vouchers States
  const [pointsData, setPointsData] = useState<any>({ points: 0, redemption_history: [] });
  const [unusedVouchers, setUnusedVouchers] = useState<any[]>([]);
  const [voucherTemplates, setVoucherTemplates] = useState<any[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [voucherSubTab, setVoucherSubTab] = useState<'mine' | 'catalog'>('mine');

  // Checkout States
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'qris'>('transfer');
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [checkingVoucher, setCheckingVoucher] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherError, setVoucherError] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [showProofPicker, setShowProofPicker] = useState(false);
  const [selectedProofBase64, setSelectedProofBase64] = useState<string | null>(null);

  // Profile Edit States
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Change Password States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Custom Toast Notification State
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [toastMounted, setToastMounted] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimeoutRef = useRef<any>(null);
  const lastFetchedRef = useRef<number>(0);
  const lastVouchersFetchedRef = useRef<number>(0);

  const toastTranslateY = toastOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 0],
  });

  // Transaction Filter Tab
  const [txFilter, setTxFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Notification status
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  const registerPushNotifications = async () => {
    try {
      if (Platform.OS === 'web') return;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('[AppContext] Push notification permissions denied.');
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;
      if (token) {
        console.log('[AppContext] Expo Push Token:', token);
        await api.updateDeviceToken(token);
      }
    } catch (e) {
      console.log('[AppContext] registerPushNotifications failed (expected on emulator):', e);
    }
  };

  // Trigger Toast Notification helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    
    toastOpacity.setValue(0);
    setToastMessage(message);
    setToastType(type);
    setToastMounted(true);

    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();

    toastTimeoutRef.current = setTimeout(() => {
      hideToast();
    }, 3500);
  };

  const hideToast = () => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    Animated.timing(toastOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setToastMounted(false);
      }
    });
  };

  // Load configuration from local storage on mount
  useEffect(() => {
    async function initApp() {
      console.log('[AppContext] initApp started');
      const startTime = Date.now();
      let targetPath = '/login';
      try {
        const savedToken = await AsyncStorage.getItem('lnd_token');
        const savedUserJson = await AsyncStorage.getItem('lnd_user');
        const savedTheme = await AsyncStorage.getItem('lnd_theme');
        const savedLang = await AsyncStorage.getItem('lnd_lang');

        if (savedLang) {
          setLanguageState(savedLang as Language);
        }

        console.log('[AppContext] initApp loaded storage token:', !!savedToken, 'user:', !!savedUserJson);

        if (savedTheme) {
          setThemeSetting(savedTheme as any);
        }

        if (savedToken && savedUserJson) {
          setAuthToken(savedToken);
          const parsedUser = JSON.parse(savedUserJson);
          setUser(parsedUser);
          setEditName(parsedUser.name || '');
          setEditPhone(parsedUser.customer?.phone || '');
          setEditAddress(parsedUser.customer?.address || '');
          targetPath = '/(app)/dashboard';
          
          // Verify token against backend in background
          console.log('[AppContext] initApp verifying token against backend...');
          api.getProfile().then(profileRes => {
            console.log('[AppContext] initApp token verification success');
            if (profileRes.user) {
              setUser(profileRes.user);
              AsyncStorage.setItem('lnd_user', JSON.stringify(profileRes.user));
              registerPushNotifications();
            }
          }).catch((err) => {
            console.log('[AppContext] initApp token verification failed:', err);
            // If session expired
            handleLogout();
          });
        } else {
          const onboarded = await AsyncStorage.getItem('lnd_onboarded');
          if (onboarded === 'true') {
            targetPath = '/login';
          } else {
            targetPath = '/walkthrough';
          }
        }
      } catch (err) {
        console.log('App initiation error', err);
      } finally {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 2500 - elapsedTime);
        console.log('[AppContext] initApp setting initialRoute to', targetPath, 'and appReady in', remainingTime, 'ms');
        setInitialRoute(targetPath);
        setTimeout(() => {
          setAppReady(true);
          console.log('[AppContext] initApp setting appReady = true');
        }, remainingTime);
      }
    }
    initApp();
  }, []);

  // Fetch all customer dashboard data
  const refreshDashboardData = async (force: boolean = false) => {
    console.log('[AppContext] refreshDashboardData called, user present:', !!user);
    if (!user) return;

    const now = Date.now();
    if (!force && now - lastFetchedRef.current < 5000) {
      console.log('[AppContext] refreshDashboardData throttled (last fetch was less than 5s ago)');
      return;
    }
    lastFetchedRef.current = now;

    setLoadingTransactions(true);
    try {
      console.log('[AppContext] refreshDashboardData calling getMyTransactions');
      const txRes = await api.getMyTransactions();
      setTransactions(txRes.data || []);

      console.log('[AppContext] refreshDashboardData calling getMyPoints');
      const ptsRes = await api.getMyPoints();
      setPointsData(ptsRes || { points: 0, redemption_history: [] });

      console.log('[AppContext] refreshDashboardData calling getProfile');
      const profileRes = await api.getProfile();
      if (profileRes.user) {
        setUser(profileRes.user);
        setEditName(profileRes.user.name || '');
        setEditPhone(profileRes.user.customer?.phone || '');
        setEditAddress(profileRes.user.customer?.address || '');
        await AsyncStorage.setItem('lnd_user', JSON.stringify(profileRes.user));
      }

      // Check for unread notifications
      try {
        const notiRes = await api.getNotifications();
        const unread = (notiRes.data || []).some((n: any) => !n.is_read);
        setHasUnreadNotifications(unread);
      } catch (e) {
        console.log('[AppContext] failed to check notifications in refreshDashboardData:', e);
      }

      console.log('[AppContext] refreshDashboardData successfully finished');
    } catch (err: any) {
      showToast(err.message || t('toastFailedSyncDashboard'), 'error');
      if (err.message?.includes('401') || err.message?.includes('unauthenticated')) {
        handleLogout();
      }
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Fetch unused vouchers & template list
  const loadVouchersTab = async (force: boolean = false) => {
    const now = Date.now();
    if (!force && now - lastVouchersFetchedRef.current < 5000) {
      console.log('[AppContext] loadVouchersTab throttled (last fetch was less than 5s ago)');
      return;
    }
    lastVouchersFetchedRef.current = now;

    setLoadingVouchers(true);
    try {
      const vouchersRes = await api.getMyVouchers();
      setUnusedVouchers(vouchersRes.data || []);

      const templatesRes = await api.getVoucherTemplates();
      const activeTemplates = (templatesRes.data || []).filter((t: any) => t.status === 'active');
      setVoucherTemplates(activeTemplates);
    } catch (err: any) {
      showToast(err.message || t('toastFailedLoadVouchers'), 'error');
    } finally {
      setLoadingVouchers(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setLoginError(t('loginErrorEmpty'));
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');
    try {
      const res = await api.login({ email, password });
      
      if (res.user.role !== 'customer') {
        await api.logout();
        throw new Error(t('toastOnlyCustomerAllowed'));
      }

      setUser(res.user);
      setEditName(res.user.name || '');
      setEditPhone(res.user.customer?.phone || '');
      setEditAddress(res.user.customer?.address || '');

      // Store in persistent storage
      await AsyncStorage.setItem('lnd_token', res.access_token);
      await AsyncStorage.setItem('lnd_user', JSON.stringify(res.user));

      showToast(t('toastWelcomeBack', { name: res.user.name }), 'success');
      setIsLoginDrawerOpen(false);
      registerPushNotifications();
      router.replace('/(app)/dashboard');
    } catch (err: any) {
      setLoginError(err.message || t('toastLoginFailed'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {}
    
    // Clear storage
    await AsyncStorage.removeItem('lnd_token');
    await AsyncStorage.removeItem('lnd_user');
    
    setUser(null);
    setAuthToken(null);
    setSelectedTx(null);
    setIsTxDetailOpen(false);
    showToast(t('toastLogoutSuccess'), 'info');
    router.replace('/walkthrough');
  };

  const changeThemeSetting = async (theme: 'system' | 'light' | 'dark') => {
    setThemeSetting(theme);
    await AsyncStorage.setItem('lnd_theme', theme);
    showToast(t('toastThemeChanged', { theme: theme.toUpperCase() }), 'success');
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    showToast(t('toastVoucherCopied', { code: text }), 'success');
  };

  const handleRedeemVoucher = async (template: any) => {
    if (pointsData.points < template.points_cost) {
      showToast(t('toastInsufficientPoints'), 'error');
      return;
    }

    setLoadingVouchers(true);
    try {
      const res = await api.redeemVoucher(template.id);
      showToast(res.message || t('toastVoucherRedeemed'), 'success');
      
      // Update local points
      setPointsData((prev: any) => ({
        ...prev,
        points: prev.points - template.points_cost
      }));
      
      await loadVouchersTab(true);
      setVoucherSubTab('mine'); 
    } catch (err: any) {
      showToast(err.message || t('toastVoucherRedeemFailed'), 'error');
    } finally {
      setLoadingVouchers(false);
    }
  };

  const checkVoucher = async () => {
    if (!voucherCodeInput.trim()) {
      showToast(t('toastEnterVoucherCode'), 'info');
      return;
    }
    setCheckingVoucher(true);
    setVoucherError('');
    setAppliedVoucher(null);
    try {
      const res = await api.checkVoucherCode(
        voucherCodeInput.trim(),
        selectedTx.total_price,
        user.customer.id
      );
      if (res.valid) {
        setAppliedVoucher(res);
        showToast(t('toastVoucherApplied'), 'success');
      } else {
        setVoucherError(res.message || t('toastVoucherInvalid'));
      }
    } catch (err: any) {
      setVoucherError(err.message || t('toastVoucherInvalidOrExpired'));
    } finally {
      setCheckingVoucher(false);
    }
  };

  const submitPaymentProof = async () => {
    setIsSubmittingPayment(true);
    try {
      const payload: any = {
        payment_method: paymentMethod,
        payment_proof_base64: selectedProofBase64 || MOCK_PROOF_BASE64,
        payment_proof_name: 'payment_proof.jpg',
      };

      if (appliedVoucher) {
        payload.voucher_code = appliedVoucher.voucher_code;
      }

      await api.uploadPaymentProof(selectedTx.id, payload);
      showToast(t('toastPaymentSuccess'), 'success');
      
      setIsTxDetailOpen(false);
      setSelectedTx(null);
      refreshDashboardData(true);
    } catch (err: any) {
      showToast(err.message || t('toastPaymentFailed'), 'error');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const cancelPayment = async () => {
    setIsSubmittingPayment(true);
    try {
      await api.cancelPayment(selectedTx.id);
      showToast(t('toastCancelPaymentSuccess'), 'success');
      
      setIsTxDetailOpen(false);
      setSelectedTx(null);
      refreshDashboardData(true);
    } catch (err: any) {
      showToast(err.message || t('toastCancelPaymentFailed'), 'error');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handlePickAvatar = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showToast(t('toastCameraPermissionRequired'), 'error');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      setIsUploadingAvatar(true);
      const asset = result.assets[0];
      const uri = asset.uri;
      const fileName = asset.fileName || 'avatar.jpg';

      const res = await api.updateAvatar(uri, fileName);
      setUser(res.user);
      await AsyncStorage.setItem('lnd_user', JSON.stringify(res.user));
      showToast(t('toastAvatarUpdated'), 'success');
    } catch (err: any) {
      showToast(err.message || t('toastAvatarUpdateFailed'), 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handlePickProof = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showToast(t('toastCameraPermissionRequired'), 'error');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      setSelectedProofBase64(asset.uri);
    } catch (err: any) {
      showToast(err.message || 'Failed to select image', 'error');
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      showToast(t('toastNameEmpty'), 'error');
      return false;
    }
    setIsSavingProfile(true);
    try {
      const res = await api.updateCustomerProfile({
        name: editName,
        phone: editPhone,
        address: editAddress
      });
      showToast(t('toastProfileUpdated'), 'success');
      setUser(res.user);
      await AsyncStorage.setItem('lnd_user', JSON.stringify(res.user));
      return true;
    } catch (err: any) {
      showToast(err.message || t('toastProfileUpdateFailed'), 'error');
      return false;
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast(t('toastFillPasswordFields'), 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast(t('toastPasswordMismatch'), 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast(t('toastPasswordMinLength'), 'error');
      return;
    }

    setIsSavingPassword(true);
    try {
      await api.updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword
      });
      showToast(t('toastPasswordChanged'), 'success');
      setIsPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message || t('toastPasswordChangeFailed'), 'error');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const openTransactionDetail = async (tx: any) => {
    setLoadingTransactions(true);
    try {
      const res = await api.getTransactionDetails(tx.id);
      setSelectedTx(res.data);
      setVoucherCodeInput('');
      setAppliedVoucher(null);
      setVoucherError('');
      setPaymentMethod('transfer');
      setSelectedProofBase64(null);
      setIsTxDetailOpen(true);
    } catch (err: any) {
      showToast(err.message || t('toastFailedLoadDetails'), 'error');
    } finally {
      setLoadingTransactions(false);
    }
  };

  return (
    <AppContext.Provider value={{
      appReady, setAppReady,
      initialRoute,
      language, setLanguage, t,
      activeSlide, setActiveSlide,
      themeSetting, setThemeSetting,
      email, setEmail,
      password, setPassword,
      user, setUser,
      isLoggingIn,
      loginError, setLoginError,
      isLoginDrawerOpen, setIsLoginDrawerOpen,
      showPassword, setShowPassword,
      isDark,
      colors,
      styles,
      transactions,
      loadingTransactions,
      selectedTx, setSelectedTx,
      isTxDetailOpen, setIsTxDetailOpen,
      pointsData,
      unusedVouchers,
      voucherTemplates,
      loadingVouchers,
      voucherSubTab, setVoucherSubTab,
      paymentMethod, setPaymentMethod,
      voucherCodeInput, setVoucherCodeInput,
      checkingVoucher,
      appliedVoucher, setAppliedVoucher,
      voucherError, setVoucherError,
      isSubmittingPayment,
      showProofPicker, setShowProofPicker,
      selectedProofBase64, setSelectedProofBase64,
      editName, setEditName,
      editPhone, setEditPhone,
      editAddress, setEditAddress,
      isSavingProfile,
      isUploadingAvatar,
      isPasswordModalOpen, setIsPasswordModalOpen,
      currentPassword, setCurrentPassword,
      newPassword, setNewPassword,
      confirmPassword, setConfirmPassword,
      isSavingPassword,
      toastMessage,
      toastType,
      toastMounted,
      toastOpacity,
      toastTranslateY,
      txFilter, setTxFilter,
      showToast,
      hideToast,
      refreshDashboardData,
      loadVouchersTab,
      handleLogin,
      handleLogout,
      changeThemeSetting,
      copyToClipboard,
      handleRedeemVoucher,
      checkVoucher,
      submitPaymentProof,
      cancelPayment,
      handlePickAvatar,
      handlePickProof,
      handleSaveProfile,
      handleChangePassword,
      openTransactionDetail,
      hasUnreadNotifications,
      setHasUnreadNotifications
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
