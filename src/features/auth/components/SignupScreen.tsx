import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

import { signup } from '@/features/auth/api';
import { ApiError } from '@/lib/api/client';

type SignupScreenProps = { onCompleted: () => void; onBack: () => void };

export function SignupScreen({ onCompleted, onBack }: SignupScreenProps) {
  const [username, setUsername] = useState(''); const [nickname, setNickname] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [passwordConfirmation, setPasswordConfirmation] = useState(''); const [errorMessage, setErrorMessage] = useState<string | null>(null); const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSignup = async () => {
    if (!username.trim() || !nickname.trim() || !email.trim() || !password) { setErrorMessage('모든 항목을 입력해주세요.'); return; }
    if (password !== passwordConfirmation) { setErrorMessage('비밀번호가 일치하지 않습니다.'); return; }
    setErrorMessage(null); setIsSubmitting(true);
    try { await signup({ username: username.trim(), password1: password, nickname: nickname.trim(), email: email.trim() }); onCompleted(); }
    catch (error) { setErrorMessage(error instanceof ApiError ? error.message : '서버에 연결할 수 없습니다. 서버 주소와 실행 상태를 확인해주세요.'); }
    finally { setIsSubmitting(false); }
  };
  return <SafeAreaView style={styles.safeArea}><KeyboardAvoidingView style={styles.container} behavior={Platform.select({ ios: 'padding', default: undefined })}><View style={styles.content}>
    <View style={styles.header}><Text style={styles.title}>회원가입</Text><Text style={styles.subtitle}>JIKI에서 약속을 시작해보세요.</Text></View><View style={styles.form}>
      <Text style={styles.label}>아이디</Text><TextInput value={username} onChangeText={setUsername} placeholder="아이디" autoCapitalize="none" autoCorrect={false} style={styles.input} editable={!isSubmitting} />
      <Text style={styles.label}>닉네임</Text><TextInput value={nickname} onChangeText={setNickname} placeholder="표시할 이름" style={styles.input} editable={!isSubmitting} />
      <Text style={styles.label}>이메일</Text><TextInput value={email} onChangeText={setEmail} placeholder="example@email.com" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" style={styles.input} editable={!isSubmitting} />
      <Text style={styles.label}>비밀번호</Text><TextInput value={password} onChangeText={setPassword} placeholder="비밀번호" secureTextEntry style={styles.input} editable={!isSubmitting} />
      <Text style={styles.label}>비밀번호 확인</Text><TextInput value={passwordConfirmation} onChangeText={setPasswordConfirmation} placeholder="비밀번호를 다시 입력하세요" secureTextEntry style={styles.input} editable={!isSubmitting} onSubmitEditing={handleSignup} returnKeyType="done" />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      <Pressable accessibilityRole="button" disabled={isSubmitting} onPress={handleSignup} style={({ pressed }) => [styles.primaryButton, (pressed || isSubmitting) && styles.primaryButtonPressed]}>{isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>회원가입</Text>}</Pressable>
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.textButton}><Text style={styles.textButtonText}>이미 계정이 있으신가요? 로그인</Text></Pressable>
    </View>
  </View></KeyboardAvoidingView></SafeAreaView>;
}

const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: '#f8fafc' }, container: { flex: 1 }, content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 }, header: { marginBottom: 28 }, title: { color: '#0f172a', fontSize: 30, fontWeight: '800' }, subtitle: { marginTop: 8, color: '#64748b', fontSize: 16 }, form: { gap: 10 }, label: { color: '#334155', fontSize: 14, fontWeight: '600', marginTop: 6 }, input: { height: 52, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, backgroundColor: '#ffffff', paddingHorizontal: 16, color: '#0f172a', fontSize: 16 }, errorText: { color: '#dc2626', fontSize: 14, marginTop: 4 }, primaryButton: { height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#2563eb', marginTop: 18 }, primaryButtonPressed: { opacity: 0.72 }, primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' }, textButton: { alignSelf: 'center', paddingVertical: 8 }, textButtonText: { color: '#2563eb', fontSize: 14, fontWeight: '600' } });
