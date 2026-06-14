import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl,
  StyleSheet,
  Image
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppContext } from '../../context/AppContext';
import { api, API_BASE, formatImageUrl } from '../../src/api';
import { useRouter } from 'expo-router';

export default function NotificationsScreen() {
  const { colors, styles, t, setHasUnreadNotifications } = useAppContext();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const res = await api.getNotifications();
      const list = res.data || [];
      setNotifications(list);
      // Update global unread state
      const unread = list.some((n: any) => !n.is_read);
      setHasUnreadNotifications(unread);
    } catch (e) {
      console.error('[NotificationsScreen] fetch failed:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationPress = async (item: any) => {
    if (!item.is_read) {
      // Optimistic update
      const updated = notifications.map(n => (n.id === item.id ? { ...n, is_read: true } : n));
      setNotifications(updated);
      setHasUnreadNotifications(updated.some((n: any) => !n.is_read));
      try {
        await api.markNotificationRead(item.id);
      } catch (e) {
        console.error('[NotificationsScreen] mark read failed:', e);
      }
    }
  };

  const formatNotificationTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <View style={styles.screenContainer}>
      
      {/* Sub Header / Back Navigation */}
      <View style={[
        localStyles.subHeader, 
        { borderBottomColor: colors.cardBorder, backgroundColor: colors.card }
      ]}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={localStyles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[localStyles.subHeaderTitle, { color: colors.foreground }]}>
          {t('notificationsTitle')}
        </Text>
      </View>

      {loading && notifications.length === 0 ? (
        <View style={styles.loaderCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchNotifications(false);
              }}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {notifications.length > 0 ? (
            notifications.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.txCard, 
                  { 
                    position: 'relative',
                    borderColor: item.is_read ? colors.cardBorder : colors.primary,
                    borderWidth: item.is_read ? 1 : 1.5,
                  }
                ]}
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.85}
              >
                <View style={localStyles.cardHeaderRow}>
                  <View style={localStyles.titleContainer}>
                    <Text style={[
                      localStyles.notiTitle, 
                      { color: colors.foreground, fontFamily: item.is_read ? 'Geist-SemiBold' : 'Geist-Bold' }
                    ]}>
                      {item.title}
                    </Text>
                    <Text style={localStyles.notiTime}>
                      {formatNotificationTime(item.created_at)}
                    </Text>
                  </View>
                  {!item.is_read && (
                    <View style={[localStyles.unreadDot, { backgroundColor: colors.primary }]} />
                  )}
                </View>
                
                {item.image_path && (
                  <Image
                    source={{ uri: formatImageUrl(`${API_BASE}/storage/${item.image_path}`) || undefined }}
                    style={localStyles.bannerImage}
                    resizeMode="cover"
                  />
                )}
                
                <Text style={[
                  localStyles.notiContent, 
                  { color: item.is_read ? colors.mutedForeground : colors.foreground }
                ]}>
                  {item.content}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={[styles.emptyContainer, { marginTop: 40 }]}>
              <MaterialCommunityIcons name="bell-outline" size={48} color={colors.mutedForeground} />
              <Text style={styles.emptyText}>{t('noNotifications')}</Text>
              <Text style={styles.emptyDesc}>{t('noNotificationsDesc')}</Text>
            </View>
          )}
        </ScrollView>
      )}

    </View>
  );
}

const localStyles = StyleSheet.create({
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
    marginRight: 12,
  },
  subHeaderTitle: {
    fontSize: 16,
    fontFamily: 'Geist-Bold',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  titleContainer: {
    flex: 1,
    paddingRight: 8,
  },
  notiTitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  notiTime: {
    fontSize: 9,
    fontFamily: 'Geist-Regular',
    color: '#94a3b8',
    marginTop: 2,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginTop: 6,
  },
  notiContent: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Geist-Regular',
  },
  bannerImage: {
    width: '100%',
    height: 130,
    borderRadius: 8,
    marginVertical: 8,
  }
});
