import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppContext } from '../../context/AppContext';

const getRankWeight = (rank: string | null | undefined): number => {
  if (!rank) return 0;
  return { bronze: 0, silver: 1, gold: 2, platinum: 3 }[rank.toLowerCase()] ?? 0;
};

const getRankName = (points: number): string => {
  if (points >= 1000) return 'platinum';
  if (points >= 500) return 'gold';
  if (points >= 200) return 'silver';
  return 'bronze';
};

export default function VouchersScreen() {
  const {
    unusedVouchers,
    voucherTemplates,
    loadingVouchers,
    voucherSubTab,
    setVoucherSubTab,
    pointsData,
    loadVouchersTab,
    copyToClipboard,
    handleRedeemVoucher,
    colors,
    styles,
    language,
    t,
    user,
  } = useAppContext();

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const isDateExpired = (dateStr: string | null | undefined): boolean => {
    if (!dateStr) return false;
    try {
      const expiryDate = new Date(dateStr);
      if (dateStr.length <= 10) {
        expiryDate.setHours(23, 59, 59, 999);
      }
      return expiryDate < new Date();
    } catch (e) {
      return false;
    }
  };

  const activeUnusedVouchers = unusedVouchers.filter((v) => !isDateExpired(v.expires_at));
  const activeTemplates = voucherTemplates.filter((t) => !isDateExpired(t.end_date));

  useEffect(() => {
    loadVouchersTab();
  }, [voucherSubTab]);

  return (
    <View style={styles.screenContainer}>
      <View style={styles.voucherSubTabs}>
        <TouchableOpacity 
          style={[styles.voucherSubTab, voucherSubTab === 'mine' && styles.voucherSubTabActive]}
          onPress={() => setVoucherSubTab('mine')}
        >
          <Text style={[styles.voucherSubTabText, voucherSubTab === 'mine' && styles.voucherSubTabTextActive]}>
            {t('myVouchersTab')} ({activeUnusedVouchers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.voucherSubTab, voucherSubTab === 'catalog' && styles.voucherSubTabActive]}
          onPress={() => setVoucherSubTab('catalog')}
        >
          <Text style={[styles.voucherSubTabText, voucherSubTab === 'catalog' && styles.voucherSubTabTextActive]}>
            {t('redeemPointsTab')}
          </Text>
        </TouchableOpacity>
      </View>

      {loadingVouchers && activeUnusedVouchers.length === 0 && activeTemplates.length === 0 ? (
        <View style={styles.loaderCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={loadingVouchers}
              onRefresh={() => loadVouchersTab(true)}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {voucherSubTab === 'mine' ? (
            activeUnusedVouchers.length > 0 ? (
              activeUnusedVouchers.map((v) => {
                const expiresAt = v.expires_at ? formatDate(v.expires_at) : t('unlimitedExpiry');
                return (
                  <View key={v.id} style={styles.voucherCard}>
                    <View style={styles.voucherSidePattern}>
                      <MaterialCommunityIcons name="ticket-percent" size={24} color={colors.primaryForeground} />
                    </View>
                    <View style={styles.voucherCardDetails}>
                      <Text style={styles.voucherName} numberOfLines={1}>{v.voucher?.name || 'Voucher Diskon'}</Text>
                      <Text style={styles.voucherDetailText}>
                        {v.voucher?.discount_type === 'percentage' 
                          ? t('discountPercent', { value: Number(v.voucher.discount_value) })
                          : t('discountFlat', { value: Number(v.voucher?.discount_value || v.discount_value).toLocaleString() })}
                      </Text>
                      
                      <View style={styles.codeContainer}>
                        <Text style={styles.voucherCodeText}>{v.voucher_code}</Text>
                        <TouchableOpacity 
                          style={styles.copyBtn} 
                          onPress={() => copyToClipboard(v.voucher_code)}
                        >
                          <Ionicons name="copy-outline" size={13} color={colors.primary} />
                          <Text style={styles.copyBtnText}>{t('copy')}</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.voucherExpiry}>{t('expiryDate')}{expiresAt}</Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="ticket-outline" size={48} color={colors.mutedForeground} />
                <Text style={styles.emptyText}>{t('noActiveVouchers')}</Text>
                <Text style={styles.emptyDesc}>{t('collectPointsDesc')}</Text>
              </View>
            )
          ) : (
            activeTemplates.length > 0 ? (
              activeTemplates.map((template) => {
                const discountText = template.discount_type === 'percentage'
                  ? t('discountPercent', { value: Number(template.discount_value) })
                  : t('discountFlat', { value: Number(template.discount_value).toLocaleString() });
                  
                const minSpendText = template.min_transaction 
                  ? `${t('minSpendText')}${Number(template.min_transaction).toLocaleString()}` 
                  : t('noMinSpend');

                const isMaxReached = template.max_uses_per_user && template.user_redemptions_count !== undefined
                  ? template.user_redemptions_count >= template.max_uses_per_user
                  : false;

                const userRank = getRankName(pointsData.points || 0);
                const isRankSufficient = !template.min_rank || getRankWeight(userRank) >= getRankWeight(template.min_rank);

                const canRedeem = pointsData.points >= template.points_cost && !isMaxReached && isRankSufficient;

                return (
                  <View key={template.id} style={[styles.catalogCard, !canRedeem && styles.catalogCardDisabled]}>
                    <View style={styles.catalogCardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.catalogTitle}>{template.name}</Text>
                        <Text style={styles.catalogCode}>{template.code}</Text>
                      </View>
                      <View style={styles.pointsCostBox}>
                        <Text style={styles.pointsCostText}>{template.points_cost} Pts</Text>
                      </View>
                    </View>

                    <View style={styles.catalogDetails}>
                      <View style={styles.catalogRow}>
                        <Ionicons name="gift-outline" size={14} color={colors.primary} />
                        <Text style={styles.catalogDetailVal}>{discountText} {template.max_discount ? `(${t('maxDiscountText')}${Number(template.max_discount).toLocaleString()})` : ''}</Text>
                      </View>
                      <View style={styles.catalogRow}>
                        <Ionicons name="card-outline" size={14} color={colors.primary} />
                        <Text style={styles.catalogDetailVal}>{minSpendText}</Text>
                      </View>
                      <View style={styles.catalogRow}>
                        <Ionicons name="calendar-outline" size={14} color={colors.primary} />
                        <Text style={styles.catalogDetailVal}>
                          {t('validityPeriod')}{formatDate(template.start_date)}{t('to')}{formatDate(template.end_date)}
                        </Text>
                      </View>
                      {template.min_rank && (
                        <View style={styles.catalogRow}>
                          <Ionicons name="shield-outline" size={14} color={colors.primary} />
                          <Text style={[styles.catalogDetailVal, { textTransform: 'capitalize', fontWeight: 'bold' }]}>
                            {t('minRankText')}{template.min_rank}
                          </Text>
                        </View>
                      )}
                      {template.max_uses_per_user !== null && template.max_uses_per_user > 0 && (
                        <View style={styles.catalogRow}>
                          <Ionicons name="sync-outline" size={14} color={colors.primary} />
                          <Text style={styles.catalogDetailVal}>
                            {t('stockText', { count: template.max_uses_per_user - (template.user_redemptions_count || 0) })}
                          </Text>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity 
                      style={[styles.redeemBtn, !canRedeem && styles.redeemBtnDisabled]}
                      disabled={!canRedeem}
                      onPress={() => handleRedeemVoucher(template)}
                    >
                      <Text style={styles.redeemBtnText}>
                        {isMaxReached 
                          ? t('limitReached') 
                          : !isRankSufficient
                            ? t('needRankText', { rank: template.min_rank.toUpperCase() })
                            : canRedeem 
                              ? t('redeemBtn') 
                              : t('needPointsText', { points: template.points_cost - pointsData.points })}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="tag-outline" size={48} color={colors.mutedForeground} />
                <Text style={styles.emptyText}>{t('noCatalog')}</Text>
              </View>
            )
          )}
        </ScrollView>
      )}
    </View>
  );
}
