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

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const demoUsers = api.getDemoUsers();

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('خطا', 'لطفا تمام فیلدها را پر کنید');
      return;
    }

    setLoading(true);
    try {
      const response = await api.login(phone, password);
      if (response.success) {
        navigation.replace('Home');
      }
    } catch (error) {
      Alert.alert('خطا', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (user) => {
    setPhone(user.phone);
    setPassword('demo1234');
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

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>تیکی ایران</Text>
          <Text style={styles.subtitle}>پرداخت آسان و سریع</Text>
        </View>

        {/* Quick Demo Section */}
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>🚀 ورود سریع با حساب‌های دمو:</Text>
          {demoUsers.map((user, index) => (
            <TouchableOpacity
              key={index}
              style={styles.demoUserButton}
              onPress={() => fillDemoCredentials(user)}
            >
              <Text style={styles.demoUserName}>
                {user.firstName} {user.lastName}
              </Text>
              <Text style={styles.demoUserPhone}>{user.phone}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Login Form */}
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

          <Text style={styles.label}>رمز عبور</Text>
          <TextInput
            style={styles.input}
            placeholder="رمز عبور"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textAlign="right"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'در حال ورود...' : 'ورود'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.linkText}>حساب کاربری ندارید؟ ثبت نام کنید</Text>
          </TouchableOpacity>
        </View>

        {/* Demo Info */}
        <View style={styles.demoInfo}>
          <Text style={styles.demoInfoText}>
            💡 رمز عبور همه حساب‌های دمو: demo1234
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
    marginBottom: 30,
    marginTop: 20
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280'
  },
  demoSection: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#C7D2FE'
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4338CA',
    marginBottom: 12,
    textAlign: 'right'
  },
  demoUserButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  demoUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937'
  },
  demoUserPhone: {
    fontSize: 14,
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
    padding: 12,
    marginTop: 10
  },
  demoInfoText: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center'
  }
});

