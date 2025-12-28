import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Share
} from 'react-native';
import api from '../services/api';

export default function CreateRequestScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateRequest = async () => {
    if (!amount || !description) {
      Alert.alert('خطا', 'لطفا تمام فیلدها را پر کنید');
      return;
    }

    const amountNum = parseInt(amount.replace(/,/g, ''));
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('خطا', 'مبلغ نامعتبر است');
      return;
    }

    setLoading(true);
    try {
      const response = await api.createPaymentRequest({
        amount: amountNum,
        description,
        expiryDays: 7
      });

      Alert.alert(
        'موفق',
        'درخواست پرداخت ایجاد شد',
        [
          {
            text: 'اشتراک‌گذاری',
            onPress: () => handleShare(response.data)
          },
          {
            text: 'بازگشت',
            onPress: () => navigation.goBack()
          }
        ]
      );

      setAmount('');
      setDescription('');
    } catch (error) {
      Alert.alert('خطا', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (data) => {
    try {
      const message = `
درخواست پرداخت تیکی ایران

مبلغ: ${data.amount.toLocaleString('fa-IR')} ریال
توضیحات: ${data.description}
کد اشتراک: ${data.shareCode}

${data.shareLink}
      `.trim();

      await Share.share({
        message,
        title: 'درخواست پرداخت'
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const formatAmount = (text) => {
    const num = text.replace(/[^0-9]/g, '');
    if (num === '') return '';
    return parseInt(num).toLocaleString('fa-IR');
  };

  const handleAmountChange = (text) => {
    setAmount(formatAmount(text));
  };

  return (
    <View style={styles.container}>
      {/* Demo Banner */}
      <View style={styles.demoBanner}>
        <Text style={styles.demoBannerText}>🎭 حالت دمو - بدون تراکنش واقعی</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>درخواست پرداخت جدید</Text>
          <Text style={styles.subtitle}>
            یک درخواست پرداخت ایجاد کنید و با دوستان خود به اشتراک بگذارید
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>مبلغ (ریال)</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="۰"
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="number-pad"
              textAlign="center"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>توضیحات</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="مثال: هزینه ناهار، بدهی قبلی، ..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlign="right"
            />
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ℹ️ درخواست شما به مدت 7 روز معتبر خواهد بود
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCreateRequest}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'در حال ایجاد...' : 'ایجاد درخواست'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Demo Examples */}
        <View style={styles.examplesSection}>
          <Text style={styles.examplesTitle}>💡 مثال‌های رایج:</Text>
          <View style={styles.examplesList}>
            <TouchableOpacity
              style={styles.exampleButton}
              onPress={() => {
                setAmount('500000');
                setDescription('هزینه ناهار');
              }}
            >
              <Text style={styles.exampleText}>هزینه ناهار - ۵۰۰,۰۰۰ ریال</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.exampleButton}
              onPress={() => {
                setAmount('1200000');
                setDescription('بدهی قبلی');
              }}
            >
              <Text style={styles.exampleText}>بدهی قبلی - ۱,۲۰۰,۰۰۰ ریال</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.exampleButton}
              onPress={() => {
                setAmount('750000');
                setDescription('خرید مشترک');
              }}
            >
              <Text style={styles.exampleText}>خرید مشترک - ۷۵۰,۰۰۰ ریال</Text>
            </TouchableOpacity>
          </View>
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
    padding: 20,
    paddingBottom: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'right'
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
    lineHeight: 20
  },
  form: {
    padding: 20,
    paddingTop: 0
  },
  amountContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  amountLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8
  },
  amountInput: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1F2937',
    padding: 0
  },
  inputContainer: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'right'
  },
  descriptionInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top'
  },
  infoBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20
  },
  infoText: {
    fontSize: 13,
    color: '#4338CA',
    textAlign: 'right'
  },
  button: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center'
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF'
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  examplesSection: {
    padding: 20,
    paddingTop: 0
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'right'
  },
  examplesList: {
    gap: 8
  },
  exampleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  exampleText: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'right'
  }
});

