import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Text, Loading } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services';
import { tokens } from '../../styles/tokens';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { data, error } = await authService.login(email.trim(), password);

      if (error) {
        Alert.alert('Erro', error);
        return;
      }

      if (data) {
        await login(data.user, data.token, data.refreshToken);
      }
    } catch (err) {
      Alert.alert('Erro', 'Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  if (isLoading) {
    return <Loading overlay message="Fazendo login..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text variant="h1" align="center" style={styles.title}>
              Finance App
            </Text>
            <Text variant="body1" color="secondary" align="center" style={styles.subtitle}>
              Faça login para continuar
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Digite seu email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
              leftIcon="mail-outline"
            />

            <Input
              label="Senha"
              value={password}
              onChangeText={setPassword}
              placeholder="Digite sua senha"
              secureTextEntry
              error={errors.password}
              leftIcon="lock-closed-outline"
              style={styles.passwordInput}
            />

            <Button
              title="Entrar"
              onPress={handleLogin}
              disabled={isLoading}
              style={styles.loginButton}
            />

            <Button
              title="Esqueci minha senha"
              variant="ghost"
              onPress={handleForgotPassword}
              style={styles.forgotButton}
            />
          </View>

          <View style={styles.footer}>
            <Text variant="body2" color="secondary" align="center">
              Não tem uma conta?
            </Text>
            <Button
              title="Criar conta"
              variant="outline"
              onPress={handleRegister}
              style={styles.registerButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: tokens.spacing.lg,
  },
  header: {
    marginBottom: tokens.spacing.xl,
  },
  title: {
    color: tokens.colors.primary.main,
    marginBottom: tokens.spacing.sm,
  },
  subtitle: {
    marginBottom: tokens.spacing.lg,
  },
  form: {
    marginBottom: tokens.spacing.xl,
  },
  passwordInput: {
    marginTop: tokens.spacing.md,
  },
  loginButton: {
    marginTop: tokens.spacing.lg,
  },
  forgotButton: {
    marginTop: tokens.spacing.md,
  },
  footer: {
    alignItems: 'center',
  },
  registerButton: {
    marginTop: tokens.spacing.sm,
    width: '100%',
  },
});

export default LoginScreen;