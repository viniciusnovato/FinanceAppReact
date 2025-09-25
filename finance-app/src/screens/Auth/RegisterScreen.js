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

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      const { data, error } = await authService.register(userData);

      if (error) {
        Alert.alert('Erro', error);
        return;
      }

      if (data) {
        await login(data.user, data.token, data.refreshToken);
        Alert.alert('Sucesso', 'Conta criada com sucesso!');
      }
    } catch (err) {
      Alert.alert('Erro', 'Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return <Loading overlay message="Criando conta..." />;
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
            <Text variant="h2" align="center" style={styles.title}>
              Criar Conta
            </Text>
            <Text variant="body1" color="secondary" align="center" style={styles.subtitle}>
              Preencha os dados para criar sua conta
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Nome completo"
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="Digite seu nome completo"
              autoCapitalize="words"
              error={errors.name}
              leftIcon="person-outline"
            />

            <Input
              label="Email"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="Digite seu email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
              leftIcon="mail-outline"
              style={styles.input}
            />

            <Input
              label="Senha"
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              placeholder="Digite sua senha"
              secureTextEntry
              error={errors.password}
              leftIcon="lock-closed-outline"
              style={styles.input}
            />

            <Input
              label="Confirmar senha"
              value={formData.confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              placeholder="Confirme sua senha"
              secureTextEntry
              error={errors.confirmPassword}
              leftIcon="lock-closed-outline"
              style={styles.input}
            />

            <Button
              title="Criar Conta"
              onPress={handleRegister}
              disabled={isLoading}
              style={styles.registerButton}
            />
          </View>

          <View style={styles.footer}>
            <Text variant="body2" color="secondary" align="center">
              Já tem uma conta?
            </Text>
            <Button
              title="Fazer login"
              variant="ghost"
              onPress={handleBackToLogin}
              style={styles.loginButton}
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
    padding: tokens.spacing.lg,
  },
  header: {
    marginBottom: tokens.spacing.xl,
    marginTop: tokens.spacing.lg,
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
  input: {
    marginTop: tokens.spacing.md,
  },
  registerButton: {
    marginTop: tokens.spacing.lg,
  },
  footer: {
    alignItems: 'center',
  },
  loginButton: {
    marginTop: tokens.spacing.sm,
  },
});

export default RegisterScreen;