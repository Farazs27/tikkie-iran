import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

export default function HomeScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [profileRes, transactionsRes, requestsRes] = await Promise.all([
        api.getProfile(),
        api.getTransactions(10),
        api.getPaymentRequests()
      ]);

      setProfile(profileRes.data);
      setTransactions(transactionsRes.data);
      setPaymentRequests(requestsRes.data.filter(r => r.status === 'pending').slice(0, 3));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'خروج',
      'آیا مطمئن هستید؟',
      [
        { text: 'انصراف', style: 'cancel' },
        {
          text: 'خروج',
          style: 'destructive',
          onPress: async () => {
            await api.logout();
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  const formatAmount = (amount) => {
    return amount.toLocaleString('fa-IR');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} دقیقه پیش`;
    if (hours < 24) return `${hours} ساعت پیش`;
    if (days === 1) return 'دیروز';
    if (days < 7) return `${days} روز پیش`;
    return date.toLocaleDateString('fa-IR');
  };

  return (
    <View style={styles.container}>
      {/* Demo Banner */}
      <View style={styles.demoBanner}>
        <Text style={styles.demoBannerText}>🎭 حالت دمو - بدون تراکنش واقعی</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>سلام،</Text>
            <Text style={styles.userName}>
              {profile ? `${profile.firstName} ${profile.lastName}` : '...'}
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>خروج</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CreateRequest')}
          >
            <Text style={styles.actionIcon}>💰</Text>
            <Text style={styles.actionText}>درخواست پرداخت</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Cards')}
          >
            <Text style={styles.actionIcon}>💳</Text>
            <Text style={styles.actionText}>کارت‌های من</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Requests */}
        {paymentRequests.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>درخواست‌های در انتظار</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>همه</Text>
              </TouchableOpacity>
            </View>
            {paymentRequests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestInfo}>
                  <Text style={styles.requestAmount}>
                    {formatAmount(request.amount)} ریال
                  </Text>
                  <Text style={styles.requestDescription}>
                    {request.description}
                  </Text>
                  <Text style={styles.requestCode}>
                    کد اشتراک: {request.shareCode}
                  </Text>
                </View>
                <View style={styles.requestBadge}>
                  <Text style={styles.requestBadgeText}>در انتظار</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>تراکنش‌های اخیر</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>همه</Text>
            </TouchableOpacity>
          </View>
          {transactions.length > 0 ? (
            transactions.map((tx) => (
              <View key={tx.id} style={styles.transactionCard}>
                <View style={styles.transactionIcon}>
                  <Text style={styles.transactionIconText}>
                    {tx.type === 'sent' ? '↑' : '↓'}
                  </Text>
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionName}>{tx.otherParty}</Text>
                  <Text style={styles.transactionDescription}>
                    {tx.description}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(tx.createdAt)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    tx.type === 'sent' ? styles.amountSent : styles.amountReceived
                  ]}
                >
                  {tx.type === 'sent' ? '-' : '+'}
                  {formatAmount(tx.amount)}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                هنوز تراکنشی انجام نشده است
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  demoBanner: {
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FCD34D'
  },
  demoBannerText: {
    color: '#92400E',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center'
  },
  scrollView: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 30
  },
  welcomeText: {
    fontSize: 16,
    color: '#6B7280'
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 4
  },
  logoutButton: {
    padding: 8
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600'
  },
  quickActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151'
  },
  section: {
    padding: 20,
    paddingTop: 0
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937'
  },
  seeAllText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500'
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  requestInfo: {
    flex: 1
  },
  requestAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4
  },
  requestDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4
  },
  requestCode: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'monospace'
  },
  requestBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  requestBadgeText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600'
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12
  },
  transactionIconText: {
    fontSize: 20,
    color: '#4B5563'
  },
  transactionInfo: {
    flex: 1
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4
  },
  transactionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF'
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  amountSent: {
    color: '#EF4444'
  },
  amountReceived: {
    color: '#10B981'
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center'
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF'
  }
});

