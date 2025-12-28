import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput
} from 'react-native';
import api from '../services/api';

export default function CardsScreen({ navigation }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cvv2, setCvv2] = useState('');
  const [expiry, setExpiry] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const response = await api.getCards();
      setCards(response.data);
    } catch (error) {
      Alert.alert('خطا', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async () => {
    if (!cardNumber || !cvv2 || !expiry) {
      Alert.alert('خطا', 'لطفا تمام فیلدها را پر کنید');
      return;
    }

    if (cardNumber.length !== 16) {
      Alert.alert('خطا', 'شماره کارت باید 16 رقم باشد');
      return;
    }

    setAdding(true);
    try {
      await api.addCard({ cardNumber, cvv2, expiry });
      Alert.alert('موفق', 'کارت با موفقیت اضافه شد');
      setCardNumber('');
      setCvv2('');
      setExpiry('');
      setShowAddCard(false);
      await loadCards();
    } catch (error) {
      Alert.alert('خطا', error.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteCard = (cardId) => {
    Alert.alert(
      'حذف کارت',
      'آیا مطمئن هستید؟',
      [
        { text: 'انصراف', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteCard(cardId);
              await loadCards();
            } catch (error) {
              Alert.alert('خطا', error.message);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Demo Banner */}
      <View style={styles.demoBanner}>
        <Text style={styles.demoBannerText}>🎭 حالت دمو - بدون تراکنش واقعی</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>کارت‌های من</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddCard(!showAddCard)}
          >
            <Text style={styles.addButtonText}>
              {showAddCard ? 'انصراف' : '+ افزودن کارت'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add Card Form */}
        {showAddCard && (
          <View style={styles.addCardForm}>
            <Text style={styles.formTitle}>افزودن کارت جدید</Text>
            
            <Text style={styles.label}>شماره کارت</Text>
            <TextInput
              style={styles.input}
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="number-pad"
              maxLength={16}
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>CVV2</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  value={cvv2}
                  onChangeText={setCvv2}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                />
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>تاریخ انقضا</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  value={expiry}
                  onChangeText={setExpiry}
                  maxLength={5}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, adding && styles.buttonDisabled]}
              onPress={handleAddCard}
              disabled={adding}
            >
              <Text style={styles.submitButtonText}>
                {adding ? 'در حال افزودن...' : 'افزودن کارت'}
              </Text>
            </TouchableOpacity>

            <View style={styles.demoInfo}>
              <Text style={styles.demoInfoText}>
                💡 در حالت دمو، هر شماره کارت 16 رقمی معتبر پذیرفته می‌شود
              </Text>
            </View>
          </View>
        )}

        {/* Cards List */}
        <View style={styles.cardsContainer}>
          {cards.length > 0 ? (
            cards.map((card) => (
              <View key={card.id} style={styles.cardItem}>
                <View style={styles.cardHeader}>
                  <Text style={styles.bankName}>{card.bankName}</Text>
                  {card.isPrimary && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>اصلی</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardNumber}>{card.cardNumber}</Text>
                <Text style={styles.holderName}>{card.holderName}</Text>
                
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteCard(card.id)}
                >
                  <Text style={styles.deleteButtonText}>حذف</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>💳</Text>
              <Text style={styles.emptyStateText}>
                هنوز کارتی اضافه نکرده‌اید
              </Text>
              <Text style={styles.emptyStateSubtext}>
                برای استفاده از تیکی ایران، لطفا کارت خود را اضافه کنید
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
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#6B7280'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937'
  },
  addButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  addCardForm: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'right'
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'right'
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  halfInput: {
    flex: 1
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF'
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  demoInfo: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginTop: 12
  },
  demoInfoText: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center'
  },
  cardsContainer: {
    padding: 20,
    paddingTop: 0
  },
  cardItem: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  bankName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  primaryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  primaryBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600'
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 12,
    fontFamily: 'monospace'
  },
  holderName: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center'
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center'
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center'
  }
});

