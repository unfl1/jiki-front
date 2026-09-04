import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ApiError } from '@/lib/api/client';
import { API_BASE_URL } from '@/lib/api/config';

type LoginScreenProps = { onLogin: (username: string, password: string) => Promise<void>; onOpenSignup: () => void };

export function LoginScreen({ onLogin, onOpenSignup }: LoginScreenProps) {
  const [username, setUsername] = useState(''); const [password, setPassword] = useState(''); const [errorMessage, setErrorMessage] = useState<string | null>(null); const [isSubmitting, setIsSubmitting] = useState(false);
  const handleLogin = async () => {
    if (!username.trim() || !password) { setErrorMessage('아이디와 비밀번호를 입력해주세요.'); return; }
    setErrorMessage(null); setIsSubmitting(true);
    try { await onLogin(username.trim(), password); }
    catch (error) { setErrorMessage(error instanceof ApiError ? error.message : '서버에 연결할 수 없습니다. 서버 주소와 실행 상태를 확인해주세요.'); }
    finally { setIsSubmitting(false); }
  };
  return <SafeAreaView style={styles.safeArea}><KeyboardAvoidingView style={styles.container} behavior={Platform.select({ ios: 'padding', default: undefined })}><View style={styles.content}>
    <View style={styles.brandBlock}><Text style={styles.brand}>JIKI</Text><Text style={styles.subtitle}>약속을 더 확실하게</Text></View><View style={styles.form}>
      <Text style={styles.label}>아이디</Text><TextInput value={username} onChangeText={setUsername} placeholder="아이디를 입력하세요" autoCapitalize="none" autoCorrect={false} style={styles.input} editable={!isSubmitting} returnKeyType="next" />
      <Text style={styles.label}>비밀번호</Text><TextInput value={password} onChangeText={setPassword} placeholder="비밀번호를 입력하세요" secureTextEntry style={styles.input} editable={!isSubmitting} returnKeyType="done" onSubmitEditing={handleLogin} />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      <Pressable accessibilityRole="button" disabled={isSubmitting} onPress={handleLogin} style={({ pressed }) => [styles.primaryButton, (pressed || isSubmitting) && styles.primaryButtonPressed]}>{isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>로그인</Text>}</Pressable>
      <Pressable accessibilityRole="button" onPress={onOpenSignup} style={styles.textButton}><Text style={styles.textButtonText}>계정이 없으신가요? 회원가입</Text></Pressable><Text style={styles.serverText}>개발 서버: {API_BASE_URL}</Text>
    </View>
  </View></KeyboardAvoidingView></SafeAreaView>;
}

const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: '#f8fafc' }, container: { flex: 1 }, content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 }, brandBlock: { marginBottom: 48 }, brand: { color: '#1d4ed8', fontSize: 42, fontWeight: '800', letterSpacing: 3 }, subtitle: { marginTop: 8, color: '#64748b', fontSize: 16 }, form: { gap: 10 }, label: { color: '#334155', fontSize: 14, fontWeight: '600', marginTop: 6 }, input: { height: 52, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, backgroundColor: '#ffffff', paddingHorizontal: 16, color: '#0f172a', fontSize: 16 }, errorText: { color: '#dc2626', fontSize: 14, marginTop: 4 }, primaryButton: { height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#2563eb', marginTop: 18 }, primaryButtonPressed: { opacity: 0.72 }, primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' }, textButton: { alignSelf: 'center', paddingVertical: 8 }, textButtonText: { color: '#2563eb', fontSize: 14, fontWeight: '600' }, serverText: { color: '#94a3b8', fontSize: 12, textAlign: 'center', marginTop: 8 } });
