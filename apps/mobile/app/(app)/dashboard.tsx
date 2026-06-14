import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Modal, 
  Image, 
  TextInput, 
  StyleSheet,
  Animated,
  Dimensions,
  RefreshControl
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppContext } from '../../context/AppContext';
import { API_BASE, formatImageUrl } from '../../src/api';
import { MOCK_PROOF_BASE64 } from '../../styles';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const hexToRgba = (hex: string, opacity: number) => {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const getRankInfo = (points: number) => {
  if (points >= 1000) return { name: 'Platinum', color: '#0ea5e9' };
  if (points >= 500) return { name: 'Gold', color: '#eab308' };
  if (points >= 200) return { name: 'Silver', color: '#94a3b8' };
  return { name: 'Bronze', color: '#cd7f32' };
};

export default function DashboardScreen() {
  const {
    colors,
    styles,
    isDark,
    user,
    transactions,
    loadingTransactions,
    selectedTx,
    isTxDetailOpen,
    setIsTxDetailOpen,
    setSelectedTx,
    pointsData,
    paymentMethod,
    setPaymentMethod,
    voucherCodeInput,
    setVoucherCodeInput,
    checkingVoucher,
    appliedVoucher,
    setAppliedVoucher,
    voucherError,
    setVoucherError,
    isSubmittingPayment,
    handlePickProof,
    selectedProofBase64,
    setSelectedProofBase64,
    txFilter,
    setTxFilter,
    refreshDashboardData,
    checkVoucher,
    submitPaymentProof,
    cancelPayment,
    openTransactionDetail,
    showToast,
    t
  } = useAppContext();

  const { height: screenHeight } = Dimensions.get('window');
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    if (isTxDetailOpen) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(screenHeight);
    }
  }, [isTxDetailOpen]);

  console.log('[DashboardScreen] Rendering, transactions count:', transactions.length);

  // Sync state transitions to trigger refreshes
  useEffect(() => {
    console.log('[DashboardScreen] useEffect running (mount)');
    refreshDashboardData();
    return () => {
      console.log('[DashboardScreen] useEffect cleanup (unmount)');
    };
  }, []);

  // Filter Transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (txFilter === 'all') return true;
    if (txFilter === 'active') {
      return ['antrian', 'dicuci', 'disetrika', 'siap diambil'].includes(tx.status);
    }
    if (txFilter === 'completed') {
      return tx.status === 'diambil';
    }
    return true;
  });

  return (
    <View style={styles.screenContainer}>
      

      {/* Loyalty Points display card */}
      <TouchableOpacity 
        style={styles.dashboardPointsCard}
        onPress={() => router.replace('/(app)/vouchers')}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[colors.primary, (colors as any).primaryGradientEnd || '#2575a5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
          }}
        >
          {/* Left Column: Avatar + Name + Customer Badge */}
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            {user?.avatar_url ? (
              <Image 
                source={{ uri: formatImageUrl(user.avatar_url) || '' }} 
                style={{ width: 46, height: 46, borderRadius: 23, marginRight: 12, borderWidth: 1.5, borderColor: '#ffffff' }} 
              />
            ) : (
              <View style={{ 
                width: 46, 
                height: 46, 
                borderRadius: 23, 
                marginRight: 12, 
                borderWidth: 1.5, 
                borderColor: '#ffffff',
                backgroundColor: 'rgba(255,255,255,0.22)',
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Text style={{ color: '#ffffff', fontFamily: 'Geist-Bold', fontSize: 15 }}>
                  {user?.name ? user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() : 'C'}
                </Text>
              </View>
            )}
            
            <View style={{ flex: 1 }}>
              <View style={{
                backgroundColor: getRankInfo(pointsData.points || 0).color,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 4,
                alignSelf: 'flex-start',
                marginBottom: 4,
                borderWidth: 1,
                borderColor: '#ffffff',
              }}>
                <Text style={{
                  color: '#ffffff',
                  fontSize: 8,
                  fontFamily: 'Geist-Bold',
                  letterSpacing: 0.5,
                }}>
                  {getRankInfo(pointsData.points || 0).name.toUpperCase() + ' RANK'}
                </Text>
              </View>
              <Text 
                style={{ color: '#ffffff', fontSize: 15, fontFamily: 'Geist-Bold' }}
                numberOfLines={1}
              >
                {user?.name}
              </Text>
            </View>
          </View>

          {/* Right Column: Points + Tukar Voucher CTA */}
          <View style={{ alignItems: 'flex-end', marginLeft: 12 }}>
            <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)', fontFamily: 'Geist-Medium', textTransform: 'uppercase' }}>
              {t('loyaltyBalance')}
            </Text>
            <Text style={{ fontSize: 18, fontFamily: 'Geist-Bold', color: '#ffffff', marginTop: 1 }}>
              {pointsData.points || 0}
            </Text>
            <View style={{
              flexDirection: 'row', 
              alignItems: 'center', 
              backgroundColor: 'rgba(255,255,255,0.18)',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              marginTop: 6
            }}>
              <Text style={{ color: '#ffffff', fontSize: 9, fontFamily: 'Geist-Bold', marginRight: 2 }}>
                {t('redeemVoucher')}
              </Text>
              <Ionicons name="chevron-forward" size={10} color="#ffffff" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.welcomeBanner}>
        <View>
          <Text style={styles.bannerTitle}>{t('laundryStatus')}</Text>
          <Text style={styles.bannerSubtitle}>{t('realtimeTracking')}</Text>
        </View>
      </View>

      {/* Tab Filter */}
      <View style={styles.filterTabs}>
        {(['all', 'active', 'completed'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterTab, txFilter === filter && styles.filterTabActive]}
            onPress={() => setTxFilter(filter)}
          >
            <Text style={[styles.filterTabText, txFilter === filter && styles.filterTabTextActive]}>
              {filter === 'all' ? t('filterAll') : filter === 'active' ? t('filterActive') : t('filterCompleted')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loadingTransactions && transactions.length === 0 ? (
        <View style={styles.loaderCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={loadingTransactions}
              onRefresh={() => refreshDashboardData(true)}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => {
              let statusColor = colors.mutedForeground;
              let statusBg = isDark ? 'rgba(71,85,105,0.2)' : 'rgba(241,245,249,0.8)';
              
              if (tx.status === 'antrian') {
                statusColor = colors.mutedForeground;
              } else if (tx.status === 'dicuci') {
                statusColor = colors.info;
                statusBg = isDark ? 'rgba(14,165,233,0.15)' : 'rgba(14,165,233,0.1)';
              } else if (tx.status === 'disetrika') {
                statusColor = colors.warning;
                statusBg = isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.1)';
              } else if (tx.status === 'siap diambil') {
                statusColor = colors.success;
                statusBg = isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)';
              } else if (tx.status === 'diambil') {
                statusColor = colors.success;
                statusBg = isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)';
              }

              const isPaid = tx.payment_status === 'paid';
              const isPendingConfirm = tx.payment_status === 'pending_confirmation';

              return (
                <TouchableOpacity
                  key={tx.id}
                  style={[styles.txCard, { overflow: 'hidden', position: 'relative' }]}
                  onPress={() => openTransactionDetail(tx)}
                >
                  <LinearGradient
                    colors={[hexToRgba(statusColor, isDark ? 0.22 : 0.12), 'transparent']}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0.5, y: 0.5 }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      left: 0,
                      bottom: 0,
                      zIndex: 0,
                    }}
                  />
                  <View style={styles.txCardHeader}>
                    <Text style={styles.invoiceCode}>{tx.invoice_code}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusBg, flexDirection: 'row', alignItems: 'center' }]}>
                      {tx.status === 'diambil' && (
                        <Ionicons name="checkmark-circle" size={11} color={statusColor} style={{ marginRight: 3 }} />
                      )}
                      <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                        {tx.status === 'antrian' ? t('statusAntrian') : tx.status === 'dicuci' ? t('statusDicuci') : tx.status === 'disetrika' ? t('statusDisetrika') : tx.status === 'siap diambil' ? t('statusSiapAmbil') : t('statusDiambil')}
                      </Text>
                    </View>
                  </View>

                  <LinearGradient
                    colors={[colors.cardBorder, 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ height: 1, marginBottom: 8 }}
                  />

                  <View style={styles.txCardBody}>
                    <View style={styles.txInfoRow}>
                      <MaterialCommunityIcons name="layers-triple" size={14} color={colors.mutedForeground} />
                      <Text style={styles.txInfoText}>
                        {tx.service?.service_name || 'Layanan'} ({tx.weight} {tx.service?.unit || 'Kg'})
                      </Text>
                    </View>
                    <View style={styles.txInfoRow}>
                      <Ionicons name="calendar-outline" size={14} color={colors.mutedForeground} />
                      <Text style={styles.txInfoText}>
                        {new Date(tx.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </Text>
                    </View>
                  </View>

                  <LinearGradient
                    colors={[colors.cardBorder, 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ height: 1, marginTop: 2, marginBottom: 8 }}
                  />

                  <View style={styles.txCardFooter}>
                    <View>
                      <Text style={styles.priceLabel}>
                        {t('price')} |{' '}
                        <Text style={{ fontFamily: 'Geist-Bold', fontWeight: 'bold' }}>
                          {isPaid 
                            ? t('paymentPaid') 
                            : isPendingConfirm 
                            ? t('paymentPendingConfirmation') 
                            : t('paymentPending')}
                        </Text>
                      </Text>
                      <Text style={styles.priceValue}>Rp {Number(tx.total_price).toLocaleString('id-ID')}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="text-box-search-outline" size={48} color={colors.mutedForeground} />
              <Text style={styles.emptyText}>{t('noHistory')}</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* 1. Transaction Detail Modal */}
      <Modal
        visible={isTxDetailOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsTxDetailOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
            {selectedTx && (
              <View style={{ flex: 1 }}>
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle}>{selectedTx.invoice_code}</Text>
                    <Text style={styles.modalSubtitle}>{selectedTx.service?.service_name}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.closeModalBtn} 
                    onPress={() => setIsTxDetailOpen(false)}
                  >
                    <Ionicons name="close" size={24} color={colors.foreground} />
                  </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.modalScroll}>
                  
                  {/* Stepper Status tracker */}
                  <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>{t('detailStatusTitle')}</Text>
                    
                    <View style={styles.stepperContainer}>
                      {['antrian', 'dicuci', 'disetrika', 'siap diambil', 'diambil'].map((step, idx) => {
                        const statuses = ['antrian', 'dicuci', 'disetrika', 'siap diambil', 'diambil'];
                        const currentIdx = statuses.indexOf(selectedTx.status);
                        const isCompleted = statuses.indexOf(step) <= currentIdx;
                        const isActive = step === selectedTx.status;

                        let stepLabel = '';
                        let stepIcon = 'ellipse-outline';

                        if (step === 'antrian') {
                          stepLabel = t('stepAntrian');
                          stepIcon = 'time';
                        } else if (step === 'dicuci') {
                          stepLabel = t('stepDicuci');
                          stepIcon = 'water';
                        } else if (step === 'disetrika') {
                          stepLabel = t('stepDisetrika');
                          stepIcon = 'flash';
                        } else if (step === 'siap diambil') {
                          stepLabel = t('stepSiapAmbil');
                          stepIcon = 'checkmark-done';
                        } else if (step === 'diambil') {
                          stepLabel = t('stepDiambil');
                          stepIcon = 'home';
                        }

                        return (
                          <View key={step} style={styles.stepRow}>
                            <View style={styles.stepLeft}>
                              <View style={[
                                styles.stepDot, 
                                isCompleted && styles.stepDotCompleted,
                                isActive && styles.stepDotActive
                              ]}>
                                <Ionicons 
                                  name={stepIcon as any} 
                                  size={14} 
                                  color={
                                    isActive 
                                      ? colors.primary 
                                      : isCompleted 
                                      ? colors.primaryForeground 
                                      : colors.mutedForeground
                                  } 
                                />
                              </View>
                              {idx < 4 && (
                                <View style={[
                                  styles.stepLine, 
                                  statuses.indexOf(statuses[idx + 1]) <= currentIdx && styles.stepLineCompleted
                                ]} />
                              )}
                            </View>
                            <View style={styles.stepRight}>
                              <Text style={[
                                  styles.stepLabelText,
                                  isCompleted && styles.stepLabelTextCompleted,
                                  isActive && styles.stepLabelTextActive
                                ]}
                                numberOfLines={1}
                              >
                                {stepLabel}
                              </Text>
                              {selectedTx.logs?.find((l: any) => l.status === step) && (
                                <Text style={styles.stepTimeText}>
                                  {new Date(selectedTx.logs.find((l: any) => l.status === step).created_at).toLocaleTimeString('id-ID', {
                                    hour: '2-digit', minute: '2-digit'
                                  })}
                                </Text>
                              )}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>

                  {/* Condition Images Gallery */}
                  <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>{t('photoConditionTitle')}</Text>
                    {selectedTx.images && selectedTx.images.length > 0 ? (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryScroll}>
                        {selectedTx.images.map((img: any) => {
                          const imageUrl = img.image_path.startsWith('http') 
                            ? img.image_path 
                            : `${API_BASE}/storage/${img.image_path}`;
                          
                          return (
                            <View key={img.id} style={{ position: 'relative', marginRight: 8 }}>
                              <Image 
                                source={{ uri: imageUrl }} 
                                style={[styles.galleryImage, { marginRight: 0 }]} 
                                resizeMode="cover"
                              />
                              <View style={{
                                position: 'absolute',
                                bottom: 6,
                                left: 6,
                                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                                paddingHorizontal: 8,
                                paddingVertical: 3,
                                borderRadius: 4,
                                borderWidth: 0.5,
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                              }}>
                                <Text style={{
                                  color: '#ffffff',
                                  fontSize: 9,
                                  fontFamily: 'Geist-Bold',
                                  textTransform: 'uppercase',
                                  letterSpacing: 0.5,
                                }}>
                                  {img.type === 'before' ? t('photoBefore') : t('photoAfter')}
                                </Text>
                              </View>
                            </View>
                          );
                        })}
                      </ScrollView>
                    ) : (
                      <Text style={styles.noImagesText}>
                        {t('noPhotosUploaded')}
                      </Text>
                    )}
                  </View>

                  {/* Summary details */}
                  <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>{t('txSummaryTitle')}</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{t('laundryQty')}</Text>
                      <Text style={styles.detailValue}>{selectedTx.weight} {selectedTx.service?.unit || 'Kg'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{t('unitPrice')}</Text>
                      <Text style={styles.detailValue}>Rp {Number(selectedTx.service?.price || 0).toLocaleString('id-ID')} / {selectedTx.service?.unit || 'Kg'}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{t('subtotal')}</Text>
                      <Text style={styles.detailValue}>Rp {Number(selectedTx.total_price).toLocaleString('id-ID')}</Text>
                    </View>

                    {(selectedTx.discount > 0) && (
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.success }]}>{t('discountVoucher')}</Text>
                        <Text style={[styles.detailValue, { color: colors.success }]}>- Rp {Number(selectedTx.discount).toLocaleString('id-ID')}</Text>
                      </View>
                    )}

                    {appliedVoucher && (
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.success }]}>{t('newDiscount')}</Text>
                        <Text style={[styles.detailValue, { color: colors.success }]}>- Rp {Number(appliedVoucher.discount).toLocaleString('id-ID')}</Text>
                      </View>
                    )}

                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { fontWeight: 'bold' }]}>{t('totalPayment')}</Text>
                      <Text style={[styles.detailValue, { fontWeight: 'bold', fontSize: 16, color: colors.primary }]}>
                        Rp {Number(
                          selectedTx.total_price - 
                          (selectedTx.discount || 0) - 
                          (appliedVoucher ? appliedVoucher.discount : 0)
                        ).toLocaleString('id-ID')}
                      </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{t('paymentMethod')}</Text>
                      <Text style={styles.detailValue}>{selectedTx.payment_method?.toUpperCase() || t('notSelected')}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{t('paymentStatus')}</Text>
                      <Text style={[
                        styles.detailValue, 
                        { 
                          color: selectedTx.payment_status === 'paid' 
                            ? colors.success 
                            : selectedTx.payment_status === 'pending_confirmation' 
                            ? colors.warning 
                            : colors.danger, 
                          fontWeight: 'bold' 
                        }
                      ]}>
                        {selectedTx.payment_status === 'paid' 
                          ? t('paymentPaid') 
                          : selectedTx.payment_status === 'pending_confirmation' 
                          ? t('paymentPendingConfirmation') 
                          : t('paymentPending')}
                      </Text>
                    </View>

                    {selectedTx.payment_status === 'paid' && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{t('paymentTime')}</Text>
                        <Text style={styles.detailValue}>
                          {selectedTx.paid_at ? new Date(selectedTx.paid_at).toLocaleString('id-ID') : '-'}
                        </Text>
                      </View>
                    )}
                  </View>

                  {selectedTx.payment_status === 'paid' && selectedTx.payment_proof && (
                    <View style={styles.sectionCard}>
                      <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>{t('paymentProofHeader')}</Text>
                      <View style={{ width: '100%', height: 300, backgroundColor: colors.background, borderRadius: 8, overflow: 'hidden' }}>
                        <Image 
                          source={{ uri: selectedTx.payment_proof.startsWith('http') ? selectedTx.payment_proof : `${API_BASE}/storage/${selectedTx.payment_proof}` }} 
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="contain"
                        />
                      </View>
                    </View>
                  )}

                  {/* Payment checkout form (ONLY if pending) */}
                  {selectedTx.payment_status === 'pending' && (
                    <View style={[styles.sectionCard, { borderColor: colors.primary, borderWidth: 1 }]}>
                      <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('paymentConfirmation')}</Text>
                      
                      <Text style={styles.inputLabel}>{t('selectPaymentMethod')}</Text>
                      <View style={styles.paymentSelector}>
                        {(['transfer', 'qris'] as const).map((method) => (
                          <TouchableOpacity
                            key={method}
                            style={[
                              styles.payMethodBtn, 
                              paymentMethod === method && styles.payMethodBtnActive
                            ]}
                            onPress={() => setPaymentMethod(method)}
                          >
                            <Text style={[
                              styles.payMethodText,
                              paymentMethod === method && styles.payMethodTextActive
                            ]}>
                              {method.toUpperCase()}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      {/* Voucher Redeem Input */}
                      <Text style={styles.inputLabel}>{t('useVoucherCodeOpt')}</Text>
                      <View style={styles.voucherCodeCheckContainer}>
                        <TextInput
                          style={styles.voucherCodeCheckInput}
                          placeholder={t('enterVoucherPlaceholder')}
                          placeholderTextColor={colors.mutedForeground}
                          autoCapitalize="characters"
                          value={voucherCodeInput}
                          onChangeText={(text) => {
                            setVoucherCodeInput(text);
                            setAppliedVoucher(null);
                            setVoucherError('');
                          }}
                        />
                        <TouchableOpacity 
                          style={styles.voucherCheckBtn} 
                          onPress={checkVoucher}
                          disabled={checkingVoucher}
                        >
                          {checkingVoucher ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                          ) : (
                            <Text style={styles.voucherCheckBtnText}>{t('applyBtn')}</Text>
                          )}
                        </TouchableOpacity>
                      </View>

                      {appliedVoucher && (
                        <View style={styles.voucherSuccessBox}>
                          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                          <Text style={styles.voucherSuccessText}>
                            {t('voucherAppliedSuccess', { discount: Number(appliedVoucher.discount).toLocaleString('id-ID') })}
                          </Text>
                        </View>
                      )}
                      {voucherError ? (
                        <View style={styles.voucherErrorBox}>
                          <Ionicons name="alert-circle" size={16} color={colors.danger} />
                          <Text style={styles.voucherErrorText}>{voucherError}</Text>
                        </View>
                      ) : null}

                      {/* Payment Proof Selection */}
                      <View style={{ marginTop: 5 }}>
                        <Text style={styles.inputLabel}>{t('uploadPaymentProofLabel')}</Text>
                        <TouchableOpacity 
                          style={styles.proofPickerBtn}
                          onPress={handlePickProof}
                        >
                          {selectedProofBase64 ? (
                            <View style={{ width: '100%', alignItems: 'center', padding: 8 }}>
                              <View style={{ width: '100%', height: 300, backgroundColor: colors.background, borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
                                <Image 
                                  source={{ uri: selectedProofBase64 }} 
                                  style={{ width: '100%', height: '100%' }}
                                  resizeMode="contain"
                                />
                              </View>
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="checkmark-circle" size={16} color={colors.success} style={{ marginRight: 4 }} />
                                <Text style={[styles.proofPreviewText, { color: colors.success, fontWeight: 'bold' }]}>
                                  {t('proofLoadedSuccess')}
                                </Text>
                              </View>
                            </View>
                          ) : (
                            <View style={styles.proofPickerPlaceholder}>
                              <Ionicons name="image-outline" size={24} color={colors.mutedForeground} />
                              <Text style={styles.proofPickerText}>{t('selectProofFile')}</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity 
                        style={[
                          styles.submitPaymentBtn,
                          !selectedProofBase64 && styles.submitPaymentBtnDisabled
                        ]}
                        disabled={isSubmittingPayment || !selectedProofBase64}
                        onPress={submitPaymentProof}
                      >
                        {isSubmittingPayment ? (
                          <ActivityIndicator color={colors.primaryForeground} />
                        ) : (
                          <Text style={styles.submitPaymentBtnText}>{t('confirmPaymentBtn')}</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Warning and Cancel Confirmation (if pending_confirmation) */}
                  {selectedTx.payment_status === 'pending_confirmation' && (
                    <View style={[styles.sectionCard, { borderColor: colors.warning, borderWidth: 1 }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <Ionicons name="information-circle-outline" size={22} color={colors.warning} />
                        <Text style={[styles.sectionTitle, { color: colors.warning, marginLeft: 8, marginBottom: 0 }]}>
                          {t('paymentConfirmation')}
                        </Text>
                      </View>
                      
                      <Text style={{ color: colors.mutedForeground, fontSize: 13, lineHeight: 18, marginBottom: 16 }}>
                        {t('paymentPendingWarning')}
                      </Text>
                      
                      {selectedTx.payment_proof && (
                        <View style={{ marginBottom: 16 }}>
                          <Text style={[styles.inputLabel, { marginBottom: 6 }]}>{t('paymentProofHeader')}:</Text>
                          <View style={{ width: '100%', height: 300, backgroundColor: colors.background, borderRadius: 8, overflow: 'hidden' }}>
                            <Image 
                              source={{ uri: selectedTx.payment_proof.startsWith('http') ? selectedTx.payment_proof : `${API_BASE}/storage/${selectedTx.payment_proof}` }} 
                              style={{ width: '100%', height: '100%' }}
                              resizeMode="contain"
                            />
                          </View>
                        </View>
                      )}

                      <TouchableOpacity 
                        style={[styles.submitPaymentBtn, { backgroundColor: colors.danger, borderColor: colors.danger }]}
                        disabled={isSubmittingPayment}
                        onPress={cancelPayment}
                      >
                        {isSubmittingPayment ? (
                          <ActivityIndicator color={colors.primaryForeground} />
                        ) : (
                          <Text style={styles.submitPaymentBtnText}>{t('cancelPaymentConfirmationBtn')}</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>


    </View>
  );
}
