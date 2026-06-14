import { StyleSheet, Platform, Dimensions } from 'react-native';

export const LIGHT_COLORS = {
  background: '#f1f5f9',     // Slate-100 (from hsl(210 20% 98%))
  foreground: '#0f172a',     // Slate-900 (from hsl(222 47% 11%))
  card: '#ffffff',           // White (from hsl(0 0% 100%))
  cardBorder: '#e2e8f0',     // Slate-200 (from hsl(210 20% 90%))
  primary: '#4196d2',        // Custom blue (from hsl(205 62% 54%))
  primaryGradientEnd: '#2575a5', // Sleek gradient end matching primary blue
  primaryForeground: '#ffffff',
  secondary: '#f1f5f9',      // Slate-100 (from hsl(210 20% 95%))
  secondaryForeground: '#0f172a',
  muted: '#f1f5f9',
  mutedForeground: '#64748b', // Slate-500 (from hsl(215 16% 47%))
  success: '#10b981',        // Emerald
  warning: '#f59e0b',        // Amber
  danger: '#ef4444',         // Red
  info: '#0ea5e9',           // Cyan
  disabled: '#cbd5e1'
};

export const DARK_COLORS = {
  background: '#060814',     // Custom very dark deep blue (from hsl(222 47% 6%))
  foreground: '#f8fafc',     // Slate-50 (from hsl(210 20% 98%))
  card: '#0b0f19',           // Custom dark blue card (from hsl(222 47% 9%))
  cardBorder: '#1e293b',     // Slate-800 (from hsl(222 20% 16%))
  primary: '#5fb2e2',        // Sky Blue (from hsl(202 69% 63%))
  primaryGradientEnd: '#1a3a5f', // Dark ocean blue gradient end
  primaryForeground: '#060814',
  secondary: '#1e293b',      // Slate-800 (from hsl(222 20% 15%))
  secondaryForeground: '#f8fafc',
  muted: '#0f172a',          // Slate-900 (from hsl(222 20% 12%))
  mutedForeground: '#94a3b8', // Slate-400 (from hsl(215 16% 70%))
  success: '#10b981',        // Emerald
  warning: '#f59e0b',        // Amber
  danger: '#ef4444',         // Red
  info: '#0ea5e9',           // Cyan
  disabled: '#475569'
};


export const { width, height } = Dimensions.get('window');
export const MOCK_PROOF_BASE64 = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export const createStyles = (colors: typeof LIGHT_COLORS, isDark: boolean) => StyleSheet.create({
  safeContainer: {
    fontFamily: 'Geist-Regular',
    flex: 1,
    backgroundColor: colors.background,
  },
  walkthroughContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  skipBtn: {
    alignSelf: 'flex-end',
    padding: 8,
    marginTop: Platform.OS === 'ios' ? 10 : 20,
  },
  skipBtnText: {
    fontFamily: 'Geist-Medium',
    fontSize: 14,
    color: colors.mutedForeground,
  },
  walkthroughContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  walkthroughImage: {
    width: width - 48,
    height: height * 0.38,
    borderRadius: 16,
    marginBottom: 40,
  },
  walkthroughTitle: {
    fontFamily: 'Geist-Bold',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  walkthroughDesc: {
    fontFamily: 'Geist-Regular',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  walkthroughFooter: {
    marginBottom: Platform.OS === 'ios' ? 20 : 30,
    alignItems: 'center',
    width: '100%',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  nextBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 52,
    width: '100%',
    borderRadius: 12,
  },
  nextBtnText: {
    fontFamily: 'Geist-Bold',
    fontSize: 16,
  },
  screenContainer: {
    flex: 1,
  },
  loaderCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Custom Toast Style
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 70 : 40,
    left: 20,
    right: 20,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 9999,
  },
  toastText: {
    color: '#ffffff',
    marginLeft: 10,
    fontFamily: 'Geist-SemiBold',
    fontSize: 13,
    flex: 1,
  },
  toastSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
  },
  toastError: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
  },
  toastInfo: {
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
  },

  // Header styles
  header: {
    fontFamily: 'Geist-Regular',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 9,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerLogoIcon: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  headerGreeting: {
    fontSize: 10,
    color: colors.mutedForeground,
    fontFamily: 'Geist-Medium',
  },
  headerName: {
    fontSize: 14,
    fontFamily: 'Geist-Bold',
    color: colors.foreground,
  },
  pointsBadge: {
    fontFamily: 'Geist-Regular',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(251,191,36,0.12)' : 'rgba(251,191,36,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.25)',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pointsBadgeText: {
    color: '#fbbf24',
    fontSize: 12,
    fontFamily: 'Geist-Bold',
    marginLeft: 4,
  },

  inputContainer: {
    fontFamily: 'Geist-Regular',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  inputIcon: {
    fontFamily: 'Geist-Regular',
    marginRight: 8,
  },
  textInput: {
    fontFamily: 'Geist-Regular',
    flex: 1,
    color: colors.foreground,
    fontSize: 13,
    height: '100%',
  },

  // Login Screen styles
  ambientGlow: {
    position: 'absolute',
    top: '20%',
    left: '-20%',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.04)' : 'rgba(59, 130, 246, 0.06)',
    zIndex: 1,
  },
  floatingThemeToggle: {
    fontFamily: 'Geist-Regular',
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  brandOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 9, 11, 0.65)',
  },
  brandContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  brandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 10 : 20,
  },
  brandLogoImageLarge: {
    height: 48,
    width: 140,
  },
  brandThemeToggle: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
  },
  brandContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  brandMottoBox: {
    marginBottom: 40,
  },
  brandMottoTitle: {
    fontFamily: 'Geist-Black',
    fontSize: 34,
    color: '#ffffff',
    lineHeight: 44,
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  brandMottoSubtitle: {
    fontFamily: 'Geist-Medium',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 24,
    maxWidth: 280,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  brandFooter: {
    marginBottom: Platform.OS === 'ios' ? 10 : 20,
    width: '100%',
  },
  brandLoginBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  brandLoginBtnText: {
    fontFamily: 'Geist-Bold',
    fontSize: 16,
    color: '#09090b',
  },
  brandCopyrightText: {
    fontFamily: 'Geist-Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    marginTop: 24,
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  drawerDismissArea: {
    flex: 1,
  },
  drawerContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: height * 0.75,
  },
  drawerHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  drawerTitle: {
    fontFamily: 'Geist-Bold',
    fontSize: 20,
  },
  drawerCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerScrollContent: {
    paddingBottom: 20,
  },
  loginErrorBox: {
    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  loginErrorText: {
    color: colors.danger,
    fontSize: 13,
    fontFamily: 'Geist-Medium',
    textAlign: 'center',
  },
  inputFieldGroup: {
    fontFamily: 'Geist-Regular',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 10, // text-xs
    fontFamily: 'Geist-Bold',
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  inputWrapper: {
    fontFamily: 'Geist-Regular',
    position: 'relative',
    height: 40,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8, // rounded-lg
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputFieldIcon: {
    fontFamily: 'Geist-Regular',
    position: 'absolute',
    left: 12,
    top: 11,
    zIndex: 5,
  },
  inputField: {
    fontFamily: 'Geist-Regular',
    flex: 1,
    height: '100%',
    paddingLeft: 40,
    paddingRight: 12,
    color: colors.foreground,
    fontSize: 14,
  },
  loginButton: {
    fontFamily: 'Geist-Regular',
    backgroundColor: colors.primary,
    borderRadius: 8, // rounded-lg
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24, // mt-6
  },
  loginButtonText: {
    color: colors.primaryForeground,
    fontSize: 14,
    fontFamily: 'Geist-Bold',
  },

  // Dashboard Styles
  welcomeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  bannerTitle: {
    fontSize: 18,
    fontFamily: 'Geist-Bold',
    color: colors.foreground,
  },
  bannerSubtitle: {
    fontFamily: 'Geist-Regular',
    fontSize: 11,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  refreshBtn: {
    fontFamily: 'Geist-Regular',
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  dashboardPointsCard: {
    fontFamily: 'Geist-Regular',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: isDark ? 1 : 0,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.15 : 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  pointsLabel: {
    fontSize: 10,
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    fontFamily: 'Geist-Medium',
  },
  pointsValue: {
    fontSize: 20,
    fontFamily: 'Geist-Bold',
    color: colors.foreground,
    marginTop: 2,
  },
  pointsAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsActionText: {
    color: colors.success,
    fontSize: 11,
    fontFamily: 'Geist-Bold',
    marginRight: 3,
  },

  // Filter Tabs
  filterTabs: {
    fontFamily: 'Geist-Regular',
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 3,
    marginHorizontal: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  filterTabActive: {
    fontFamily: 'Geist-Regular',
    backgroundColor: colors.primary,
  },
  filterTabText: {
    fontSize: 12,
    fontFamily: 'Geist-SemiBold',
    color: colors.mutedForeground,
  },
  filterTabTextActive: {
    fontFamily: 'Geist-Regular',
    color: colors.primaryForeground,
  },

  // Transactions List Scroll
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
  },
  txCard: {
    fontFamily: 'Geist-Regular',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  txCardHeader: {
    fontFamily: 'Geist-Regular',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
  },
  invoiceCode: {
    fontSize: 13,
    
    color: colors.foreground,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statusBadge: {
    fontFamily: 'Geist-Regular',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 9,
    fontFamily: 'Geist-Bold',
  },
  txCardBody: {
    marginBottom: 10,
  },
  txInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  txInfoText: {
    fontFamily: 'Geist-Regular',
    fontSize: 12,
    color: colors.foreground,
    marginLeft: 6,
  },
  txCardFooter: {
    fontFamily: 'Geist-Regular',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  priceLabel: {
    fontFamily: 'Geist-Regular',
    fontSize: 9,
    color: colors.mutedForeground,
  },
  priceValue: {
    fontSize: 13,
    fontFamily: 'Geist-Bold',
    color: colors.primary,
  },
  payBadge: {
    fontFamily: 'Geist-Regular',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  payBadgeText: {
    fontSize: 9,
    fontFamily: 'Geist-Bold',
  },

  // Empty List
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: colors.mutedForeground,
    fontSize: 14,
    fontFamily: 'Geist-SemiBold',
    marginTop: 10,
  },
  emptyDesc: {
    fontFamily: 'Geist-Regular',
    color: colors.mutedForeground,
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },

  // Bottom Navigation Bar
  bottomNav: {
    fontFamily: 'Geist-Regular',
    flexDirection: 'row',
    height: 56,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  bottomNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  bottomNavItemActive: {
    fontFamily: 'Geist-Regular',
    borderTopWidth: 2,
    borderTopColor: colors.primary,
  },
  bottomNavText: {
    fontFamily: 'Geist-Regular',
    fontSize: 10,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  bottomNavTextActive: {
    color: colors.primary,
    fontFamily: 'Geist-Bold',
  },

  // Vouchers Tabs
  voucherSubTabs: {
    fontFamily: 'Geist-Regular',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  voucherSubTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  voucherSubTabActive: {
    fontFamily: 'Geist-Regular',
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  voucherSubTabText: {
    fontSize: 13,
    color: colors.mutedForeground,
    fontFamily: 'Geist-SemiBold',
  },
  voucherSubTabTextActive: {
    color: colors.primary,
    fontFamily: 'Geist-Bold',
  },

  // Voucher card styles
  voucherCard: {
    fontFamily: 'Geist-Regular',
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    height: 98,
  },
  voucherSidePattern: {
    fontFamily: 'Geist-Regular',
    width: 48,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voucherCardDetails: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  voucherName: {
    fontSize: 13,
    fontFamily: 'Geist-Bold',
    color: colors.foreground,
  },
  voucherDetailText: {
    fontSize: 12,
    color: colors.success,
    fontFamily: 'Geist-SemiBold',
  },
  codeContainer: {
    fontFamily: 'Geist-Regular',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  voucherCodeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: colors.foreground,
    fontSize: 11,
    
  },
  copyBtn: {
    fontFamily: 'Geist-Regular',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: colors.cardBorder,
    paddingLeft: 6,
  },
  copyBtnText: {
    color: colors.primary,
    fontSize: 9,
    fontFamily: 'Geist-Bold',
    marginLeft: 2,
  },
  voucherExpiry: {
    fontFamily: 'Geist-Regular',
    fontSize: 9,
    color: colors.mutedForeground,
  },

  // Voucher Catalog card styles
  catalogCard: {
    fontFamily: 'Geist-Regular',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  catalogCardDisabled: {
    opacity: 0.65,
  },
  catalogCardHeader: {
    fontFamily: 'Geist-Regular',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingBottom: 8,
    marginBottom: 8,
  },
  catalogTitle: {
    fontSize: 13,
    fontFamily: 'Geist-Bold',
    color: colors.foreground,
  },
  catalogCode: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: colors.primary,
    
    marginTop: 2,
  },
  pointsCostBox: {
    backgroundColor: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pointsCostText: {
    color: colors.success,
    fontFamily: 'Geist-Bold',
    fontSize: 11,
  },
  catalogDetails: {
    marginBottom: 10,
  },
  catalogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  catalogDetailVal: {
    fontFamily: 'Geist-Regular',
    fontSize: 11,
    color: colors.foreground,
    marginLeft: 6,
  },
  redeemBtn: {
    fontFamily: 'Geist-Regular',
    backgroundColor: colors.success,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redeemBtnDisabled: {
    fontFamily: 'Geist-Regular',
    backgroundColor: colors.disabled,
  },
  redeemBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Geist-Bold',
  },

  // Profile page styles
  profileContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  profileHeaderCard: {
    fontFamily: 'Geist-Regular',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  profileAvatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  profileAvatarImageLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  profileAvatarLarge: {
    fontFamily: 'Geist-Regular',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarTextLarge: {
    color: colors.primaryForeground,
    fontSize: 24,
    fontFamily: 'Geist-Bold',
  },
  profileHeaderName: {
    color: colors.foreground,
    fontSize: 18,
    fontFamily: 'Geist-Bold',
  },
  profileHeaderEmail: {
    fontFamily: 'Geist-Regular',
    color: colors.mutedForeground,
    fontSize: 12,
    marginTop: 2,
  },
  profileRoleBadge: {
    fontFamily: 'Geist-Regular',
    backgroundColor: isDark ? 'rgba(84,183,242,0.12)' : 'rgba(59,130,246,0.1)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(84,183,242,0.25)' : 'rgba(59,130,246,0.2)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 8,
  },
  profileRoleBadgeText: {
    color: colors.primary,
    fontFamily: 'Geist-Bold',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  profileCard: {
    fontFamily: 'Geist-Regular',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 12,
  },
  profileCardTitle: {
    color: colors.foreground,
    fontSize: 14,
    fontFamily: 'Geist-Bold',
    marginBottom: 10,
  },
  themeToggleGroup: {
    fontFamily: 'Geist-Regular',
    flexDirection: 'row',
    backgroundColor: colors.background,
    padding: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  themeToggleBtn: {
    fontFamily: 'Geist-Regular',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  themeToggleBtnActive: {
    fontFamily: 'Geist-Regular',
    backgroundColor: colors.primary,
  },
  themeToggleText: {
    color: colors.mutedForeground,
    fontSize: 11,
    fontFamily: 'Geist-SemiBold',
    marginLeft: 4,
  },
  themeToggleTextActive: {
    color: colors.primaryForeground,
    fontFamily: 'Geist-Bold',
  },
  saveProfileBtn: {
    fontFamily: 'Geist-Regular',
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  saveProfileBtnText: {
    color: colors.primaryForeground,
    fontFamily: 'Geist-Bold',
    fontSize: 13,
  },
  passwordModalBtn: {
    fontFamily: 'Geist-Regular',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 12,
  },
  passwordModalBtnText: {
    color: colors.primary,
    fontFamily: 'Geist-Bold',
    fontSize: 13,
    marginLeft: 6,
  },
  logoutBtn: {
    fontFamily: 'Geist-Regular',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    borderRadius: 8,
    paddingVertical: 12,
  },
  logoutBtnText: {
    color: '#ffffff',
    fontFamily: 'Geist-Bold',
    fontSize: 13,
    marginLeft: 6,
  },

  // Modal Overlays
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    fontFamily: 'Geist-Regular',
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: height * 0.85,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  modalHeader: {
    fontFamily: 'Geist-Regular',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Geist-Bold',
    color: colors.foreground,
  },
  modalSubtitle: {
    fontFamily: 'Geist-Regular',
    fontSize: 11,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  closeModalBtn: {
    fontFamily: 'Geist-Regular',
    padding: 2,
  },
  modalScroll: {
    padding: 16,
  },
  sectionCard: {
    fontFamily: 'Geist-Regular',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Geist-Bold',
    color: colors.foreground,
    marginBottom: 10,
  },

  // Stepper styles
  stepperContainer: {
    paddingLeft: 6,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 48,
  },
  stepLeft: {
    alignItems: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  stepDot: {
    fontFamily: 'Geist-Regular',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  stepDotActive: {
    fontFamily: 'Geist-Regular',
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  stepDotCompleted: {
    fontFamily: 'Geist-Regular',
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepLine: {
    fontFamily: 'Geist-Regular',
    width: 2,
    flex: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: -2,
    zIndex: 1,
  },
  stepLineCompleted: {
    fontFamily: 'Geist-Regular',
    backgroundColor: colors.primary,
  },
  stepRight: {
    flex: 1,
    paddingBottom: 12,
    justifyContent: 'center',
  },
  stepLabelText: {
    fontSize: 12,
    fontFamily: 'Geist-Medium',
    color: colors.mutedForeground,
  },
  stepLabelTextActive: {
    color: colors.primary,
    fontFamily: 'Geist-Bold',
  },
  stepLabelTextCompleted: {
    color: colors.foreground,
    fontFamily: 'Geist-SemiBold',
  },
  stepTimeText: {
    fontFamily: 'Geist-Regular',
    fontSize: 9,
    color: colors.mutedForeground,
    marginTop: 1,
  },

  // Condition Images Gallery
  galleryScroll: {
    paddingVertical: 2,
  },
  galleryImage: {
    fontFamily: 'Geist-Regular',
    width: 120,
    height: 90,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  noImagesText: {
    fontFamily: 'Geist-Regular',
    color: colors.mutedForeground,
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },

  // Detail item summary rows
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontFamily: 'Geist-Regular',
    fontSize: 12,
    color: colors.mutedForeground,
  },
  detailValue: {
    fontFamily: 'Geist-Regular',
    fontSize: 12,
    color: colors.foreground,
  },
  divider: {
    fontFamily: 'Geist-Regular',
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 8,
  },

  // Checkout form styling
  paymentSelector: {
    fontFamily: 'Geist-Regular',
    flexDirection: 'row',
    backgroundColor: colors.background,
    padding: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 12,
  },
  payMethodBtn: {
    fontFamily: 'Geist-Regular',
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  payMethodBtnActive: {
    fontFamily: 'Geist-Regular',
    backgroundColor: colors.primary,
  },
  payMethodText: {
    fontSize: 11,
    fontFamily: 'Geist-Bold',
    color: colors.mutedForeground,
  },
  payMethodTextActive: {
    fontFamily: 'Geist-Regular',
    color: colors.primaryForeground,
  },

  // Voucher apply code
  voucherCodeCheckContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  voucherCodeCheckInput: {
    fontFamily: 'Geist-Regular',
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 10,
    color: colors.foreground,
    fontSize: 12,
    height: 38,
  },
  voucherCheckBtn: {
    fontFamily: 'Geist-Regular',
    backgroundColor: colors.primary,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voucherCheckBtnText: {
    color: colors.primaryForeground,
    fontFamily: 'Geist-Bold',
    fontSize: 12,
  },
  voucherSuccessBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(16,185,129,0.2)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  voucherSuccessText: {
    color: colors.success,
    fontSize: 11,
    fontFamily: 'Geist-Medium',
    marginLeft: 4,
    flex: 1,
  },
  voucherErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(239,68,68,0.2)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  voucherErrorText: {
    color: colors.danger,
    fontSize: 11,
    fontFamily: 'Geist-Medium',
    marginLeft: 4,
    flex: 1,
  },

  // Proof Picker Btn
  proofPickerBtn: {
    fontFamily: 'Geist-Regular',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  proofPickerPlaceholder: {
    alignItems: 'center',
  },
  proofPickerText: {
    fontFamily: 'Geist-Regular',
    color: colors.mutedForeground,
    fontSize: 11,
    marginTop: 4,
  },
  proofPreviewContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  proofPreviewText: {
    color: colors.success,
    fontFamily: 'Geist-Bold',
    fontSize: 11,
    marginLeft: 6,
  },

  // Submit payment checkout
  submitPaymentBtn: {
    fontFamily: 'Geist-Regular',
    backgroundColor: colors.success,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitPaymentBtnDisabled: {
    fontFamily: 'Geist-Regular',
    backgroundColor: colors.disabled,
  },
  submitPaymentBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: 'Geist-Bold',
  },

  // Mock proof picker overlay
  proofPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  proofPickerBox: {
    fontFamily: 'Geist-Regular',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  proofPickerTitle: {
    fontSize: 14,
    fontFamily: 'Geist-Bold',
    color: colors.foreground,
    textAlign: 'center',
  },
  proofPickerDesc: {
    fontFamily: 'Geist-Regular',
    fontSize: 11,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginVertical: 10,
    lineHeight: 14,
  },
  mockOption: {
    fontFamily: 'Geist-Regular',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  mockOptionName: {
    color: colors.foreground,
    fontFamily: 'Geist-Bold',
    fontSize: 12,
  },
  mockOptionDetail: {
    fontFamily: 'Geist-Regular',
    color: colors.mutedForeground,
    fontSize: 9,
    marginTop: 1,
  },
  cancelProofPickerBtn: {
    fontFamily: 'Geist-Regular',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  cancelProofPickerText: {
    color: colors.danger,
    fontFamily: 'Geist-Bold',
    fontSize: 13,
  },

  // Small Modals (e.g. Change Password)
  smallModalContent: {
    fontFamily: 'Geist-Regular',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: height * 0.15,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  modalActions: {
    fontFamily: 'Geist-Regular',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 12,
  },
  cancelBtn: {
    fontFamily: 'Geist-Regular',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cancelBtnText: {
    color: colors.foreground,
    fontSize: 12,
    fontFamily: 'Geist-SemiBold',
  },
  saveBtn: {
    fontFamily: 'Geist-Regular',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
  },
  saveBtnText: {
    color: colors.primaryForeground,
    fontSize: 12,
    fontFamily: 'Geist-Bold',
  }
});

