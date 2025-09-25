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
import { authService } from '../../services';
import { tokens } from '../../styles/tokens';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = () => {
    if (!email.trim()) {
      setError('Email é obrigatório');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email inválido');
      return false;
    }

    setError('');
    return true;
  };

  const handleSendEmail = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      const { data, error: apiError } = await authService.forgotPassword(email.trim());

      if (apiError) {
        setError(apiError);
        return;
      }

      setEmailSent(true);
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    setError('');
  };

  if (isLoading) {
    return <Loading overlay message="Enviando email..." />;
  }

  if (emailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successContainer}>
            <Text variant="h2" align="center" style={styles.successTitle}>
              Email Enviado!
            </Text>
            <Text variant="body1" color="secondary" align="center" style={styles.successMessage}>
              Enviamos um link de recuperação para {email}. 
              Verifique sua caixa de entrada e spam.
            </Text>
            
            <Button
              title="Reenviar Email"
              variant="outline"
              onPress={handleResendEmail}
              style={styles.resendButton}
            />
            
            <Button
              title="Voltar ao Login"
              onPress={handleBackToLogin}
              style={styles.backButton}
            />
          </View>
        </View>
      </SafeAreaView>
    );
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
              Recuperar Senha
            </Text>
            <Text variant="body1" color="secondary" align="center" style={styles.subtitle}>
              Digite seu email para receber um link de recuperação
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (error) setError('');
              }}
              placeholder="Digite seu email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={error}
              leftIcon="mail-outline"
            />

            <Button
              title="Enviar Link de Recuperação"
              onPress={handleSendEmail}
              disabled={isLoading}
              style={styles.sendButton}
            />
          </View>

          <View style={styles.footer}>
            <Button
              title="Voltar ao Login"
              variant="ghost"
              onPress={handleBackToLogin}
              style={styles.backToLoginButton}
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
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: tokens.spacing.lg,
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
  sendButton: {
    marginTop: tokens.spacing.lg,
  },
  footer: {
    alignItems: 'center',
  },
  backToLoginButton: {
    marginTop: tokens.spacing.sm,
  },
  successContainer: {
    alignItems: 'center',
  },
  successTitle: {
    color: tokens.colors.status.success,
    marginBottom: tokens.spacing.md,
  },
  successMessage: {
    marginBottom: tokens.spacing.xl,
    textAlign: 'center',
  },
  resendButton: {
    marginBottom: tokens.spacing.md,
    width: '100%',
  },
  backButton: {
    width: '100%',
  },
});

export default ForgotPasswordScreen;