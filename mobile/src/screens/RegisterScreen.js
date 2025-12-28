import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import api from '../services/api';

export default function RegisterScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!phone || !nationalId || !firstName || !lastName || !password || !confirmPassword) {
      Alert.alert('خطا', 'لطفا تمام فیلدها را پر کنید');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('خطا', 'رمز عبور و تکرار آن یکسان نیستند');
      return;
    }

    if (password.length < 6) {
      Alert.alert('خطا', 'رمز عبور باید حداقل 6 کاراکتر باشد');
      return;
    }

    if (phone.length !== 11 || !phone.startsWith('09')) {
      Alert.alert('خطا', 'شماره موبایل نامعتبر است');
      return;
    }

    if (nationalId.length !== 10) {
      Alert.alert('خطا', 'کد ملی باید 10 رقم باشد');
      return;
    }

    setLoading(true);
    try {
      const response = await api.register({
        phone,
        nationalId,
        firstName,
        lastName,
        password
      });

      if (response.success) {
        Alert.alert('موفق', 'ثبت نام با موفقیت انجام شد', [
          {
            text: 'ورود',
            onPress: () => navigation.replace('Home')
          }
        ]);
      }
    } catch (error) {
      Alert.alert('خطا', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Demo Banner */}
        <View style={styles.demoBanner}>
          <Text style={styles.demoBannerText}>🎭 حالت دمو - بدون تراکنش واقعی</Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>ثبت نام</Text>
          <Text style={styles.subtitle}>ایجاد حساب کاربری جدید</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>شماره موبایل</Text>
          <TextInput
            style={styles.input}
            placeholder="09123456789"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={11}
            textAlign="right"
          />

          <Text style={styles.label}>کد ملی</Text>
          <TextInput
            style={styles.input}
            placeholder="0012345678"
            value={nationalId}
            onChangeText={setNationalId}
            keyboardType="number-pad"
            maxLength={10}
            textAlign="right"
          />

          <Text style={styles.label}>نام</Text>
          <TextInput
            style={styles.input}
            placeholder="نام"
            value={firstName}
            onChangeText={setFirstName}
            textAlign="right"
          />

          <Text style={styles.label}>نام خانوادگی</Text>
          <TextInput
            style={styles.input}
            placeholder="نام خانوادگی"
            value={lastName}
            onChangeText={setLastName}
            textAlign="right"
          />

          <Text style={styles.label}>رمز عبور</Text>
          <TextInput
            style={styles.input}
            placeholder="حداقل 6 کاراکتر"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textAlign="right"
          />

          <Text style={styles.label}>تکرار رمز عبور</Text>
          <TextInput
            style={styles.input}
            placeholder="تکرار رمز عبور"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            textAlign="right"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'در حال ثبت نام...' : 'ثبت نام'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.linkText}>حساب کاربری دارید؟ وارد شوید</Text>
          </TouchableOpacity>
        </View>

        {/* Demo Info */}
        <View style={styles.demoInfo}>
          <Text style={styles.demoInfoText}>
            💡 در حالت دمو، اطلاعات شما محلی ذخیره می‌شود
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20
  },
  demoBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FCD34D'
  },
  demoBannerText: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: 24
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280'
  },
  form: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'right'
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16
  },
  button: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF'
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center'
  },
  linkText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500'
  },
  demoInfo: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12
  },
  demoInfoText: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center'
  }
});

