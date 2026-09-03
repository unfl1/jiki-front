import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { login, signup } from './src/api/auth';
import { ApiError } from './src/api/client';
import { API_BASE_URL } from './src/api/config';
import { clearSession, getSession, saveSession, Session } from './src/auth/tokenStorage';
import { MainScreen } from './src/screens/MainScreen';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [screen, setScreen] = useState<'login' | 'signup'>('login');
  const [isRestoring, setIsRestoring] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void getSession()
      .then(setSession)
      .finally(() => setIsRestoring(false));
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setErrorMessage('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const nextSession = await login(username.trim(), password);
      await saveSession(nextSession);
      setSession(nextSession);
      setPassword('');
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : '서버에 연결할 수 없습니다. 서버 주소와 실행 상태를 확인해주세요.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await clearSession();
    setSession(null);
  };

  if (isRestoring) {
    return <LoadingScreen />;
  }

  if (session) {
    return <MainScreen nickname={session.nickname} onLogout={handleLogout} />;
  }

  if (screen === 'signup') {
    return (
      <SignupScreen
        onBack={() => setScreen('login')}
        onSignedUp={(createdUsername) => {
          setUsername(createdUsername);
          setPassword('');
          setErrorMessage(null);
          setScreen('login');
        }}
      />
    );
  }

  return (
    <LoginScreen
      username={username}
      password={password}
      errorMessage={errorMessage}
      isSubmitting={isSubmitting}
      onUsernameChange={setUsername}
      onPasswordChange={setPassword}
      onSubmit={handleLogin}
      onOpenSignup={() => setScreen('signup')}
    />
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}

type LoginScreenProps = {
  username: string;
  password: string;
  errorMessage: string | null;
  isSubmitting: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onOpenSignup: () => void;
};

function LoginScreen({
  username,
  password,
  errorMessage,
  isSubmitting,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  onOpenSignup,
}: LoginScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: 'padding', default: undefined })}
      >
        <View style={styles.content}>
          <View style={styles.brandBlock}>
            <Text style={styles.brand}>JIKI</Text>
            <Text style={styles.subtitle}>약속을 더 확실하게</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>아이디</Text>
            <TextInput
              value={username}
              onChangeText={onUsernameChange}
              placeholder="아이디를 입력하세요"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
              editable={!isSubmitting}
              returnKeyType="next"
            />

            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              value={password}
              onChangeText={onPasswordChange}
              placeholder="비밀번호를 입력하세요"
              secureTextEntry
              style={styles.input}
              editable={!isSubmitting}
              returnKeyType="done"
              onSubmitEditing={onSubmit}
            />

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={onSubmit}
              style={({ pressed }) => [
                styles.loginButton,
                (pressed || isSubmitting) && styles.loginButtonPressed,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginButtonText}>로그인</Text>
              )}
            </Pressable>

            <Pressable accessibilityRole="button" onPress={onOpenSignup} style={styles.textButton}>
              <Text style={styles.textButtonText}>계정이 없으신가요? 회원가입</Text>
            </Pressable>

            <Text style={styles.serverText}>개발 서버: {API_BASE_URL}</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SignupScreen({
  onBack,
  onSignedUp,
}: {
  onBack: () => void;
  onSignedUp: (username: string) => void;
}) {
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async () => {
    if (!username.trim() || !nickname.trim() || !email.trim() || !password) {
      setErrorMessage('모든 항목을 입력해주세요.');
      return;
    }

    if (password !== passwordConfirmation) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await signup({
        username: username.trim(),
        password1: password,
        nickname: nickname.trim(),
        email: email.trim(),
      });
      onSignedUp(username.trim());
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : '서버에 연결할 수 없습니다. 서버 주소와 실행 상태를 확인해주세요.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: 'padding', default: undefined })}
      >
        <View style={styles.content}>
          <View style={styles.signupHeader}>
            <Text style={styles.signupTitle}>회원가입</Text>
            <Text style={styles.subtitle}>JIKI에서 약속을 시작해보세요.</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>아이디</Text>
            <TextInput value={username} onChangeText={setUsername} placeholder="아이디" autoCapitalize="none" autoCorrect={false} style={styles.input} editable={!isSubmitting} />

            <Text style={styles.label}>닉네임</Text>
            <TextInput value={nickname} onChangeText={setNickname} placeholder="표시할 이름" style={styles.input} editable={!isSubmitting} />

            <Text style={styles.label}>이메일</Text>
            <TextInput value={email} onChangeText={setEmail} placeholder="example@email.com" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" style={styles.input} editable={!isSubmitting} />

            <Text style={styles.label}>비밀번호</Text>
            <TextInput value={password} onChangeText={setPassword} placeholder="비밀번호" secureTextEntry style={styles.input} editable={!isSubmitting} />

            <Text style={styles.label}>비밀번호 확인</Text>
            <TextInput value={passwordConfirmation} onChangeText={setPasswordConfirmation} placeholder="비밀번호를 다시 입력하세요" secureTextEntry style={styles.input} editable={!isSubmitting} onSubmitEditing={handleSignup} returnKeyType="done" />

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <Pressable accessibilityRole="button" disabled={isSubmitting} onPress={handleSignup} style={({ pressed }) => [styles.loginButton, (pressed || isSubmitting) && styles.loginButtonPressed]}>
              {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.loginButtonText}>회원가입</Text>}
            </Pressable>

            <Pressable accessibilityRole="button" onPress={onBack} style={styles.textButton}>
              <Text style={styles.textButtonText}>이미 계정이 있으신가요? 로그인</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  brandBlock: {
    marginBottom: 48,
  },
  brand: {
    color: '#1d4ed8',
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 3,
  },
  subtitle: {
    marginTop: 8,
    color: '#64748b',
    fontSize: 16,
  },
  form: {
    gap: 10,
  },
  label: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    color: '#0f172a',
    fontSize: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 4,
  },
  loginButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#2563eb',
    marginTop: 18,
  },
  loginButtonPressed: {
    opacity: 0.72,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  serverText: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  textButton: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  textButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  signupHeader: {
    marginBottom: 28,
  },
  signupTitle: {
    color: '#0f172a',
    fontSize: 30,
    fontWeight: '800',
  },
});
