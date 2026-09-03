import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ApiError } from '../../api/client';
import { getPromises, PromiseSummary } from '../../api/promise';
import { getMyMoney } from '../../api/user';
import { clearSession, getSession } from '../../auth/tokenStorage';

export default function HomeScreen() {
  const [nickname, setNickname] = useState<string | null>(null);
  const [promises, setPromises] = useState<PromiseSummary[]>([]);
  const [money, setMoney] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDashboard = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true); else setIsLoading(true);
    setErrorMessage(null);
    try {
      const [session, nextPromises, moneyResponse] = await Promise.all([getSession(), getPromises(), getMyMoney()]);
      if (!session) { router.replace('/login'); return; }
      setNickname(session.nickname);
      setPromises(nextPromises);
      setMoney(moneyResponse.money);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : '대시보드를 불러오지 못했습니다. 서버 연결을 확인해주세요.');
    } finally { setIsLoading(false); setIsRefreshing(false); }
  }, []);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  const handleLogout = async () => { await clearSession(); router.replace('/login'); };

  if (isLoading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#2563eb" /><Text style={styles.loadingText}>약속 정보를 불러오는 중입니다.</Text></View>;

  return <SafeAreaView style={styles.safeArea}><FlatList
    data={promises}
    keyExtractor={(item) => String(item.promiseId)}
    contentContainerStyle={styles.listContent}
    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void loadDashboard(true)} />}
    ListHeaderComponent={<><View style={styles.header}><View><Text style={styles.eyebrow}>JIKI</Text><Text style={styles.greeting}>{nickname ?? '사용자'}님, 안녕하세요</Text></View><Pressable accessibilityRole="button" onPress={handleLogout} style={styles.logoutButton}><Text style={styles.logoutButtonText}>로그아웃</Text></Pressable></View><View style={styles.moneyCard}><Text style={styles.moneyLabel}>내 포인트</Text><Text style={styles.moneyValue}>{(money ?? 0).toLocaleString('ko-KR')} P</Text><Text style={styles.moneyDescription}>약속 이행으로 쌓은 포인트예요.</Text></View><View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>다가오는 약속</Text><Text style={styles.sectionDescription}>아래로 당겨 최신 정보로 갱신할 수 있어요.</Text></View><Text style={styles.countText}>{promises.length}개</Text></View>{errorMessage ? <View style={styles.errorBox}><Text style={styles.errorText}>{errorMessage}</Text><Pressable accessibilityRole="button" onPress={() => void loadDashboard()}><Text style={styles.retryText}>다시 시도</Text></Pressable></View> : null}</>}
    renderItem={({ item }) => <PromiseCard promise={item} />}
    ItemSeparatorComponent={() => <View style={styles.separator} />}
    ListEmptyComponent={!errorMessage ? <View style={styles.emptyCard}><Text style={styles.emptyTitle}>아직 예정된 약속이 없어요.</Text><Text style={styles.emptyDescription}>새 약속 만들기 기능을 다음 단계에서 연결할 수 있습니다.</Text></View> : null}
    ListFooterComponent={<View style={styles.footerSpace} />}
  /></SafeAreaView>;
}

function PromiseCard({ promise }: { promise: PromiseSummary }) {
  return <View style={styles.promiseCard}><View style={styles.dateBadge}><Text style={styles.dateBadgeText}>{promise.date}</Text></View><View style={styles.promiseInfo}><Text style={styles.promiseTitle} numberOfLines={1}>{promise.title}</Text><Text style={styles.promiseTime}>{promise.time}</Text><Text style={styles.creatorText}>주최: {promise.creatorUsername}</Text></View></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' }, loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }, loadingText: { marginTop: 12, color: '#64748b', fontSize: 14 }, listContent: { paddingHorizontal: 20, paddingTop: 18 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }, eyebrow: { color: '#2563eb', fontSize: 13, fontWeight: '800', letterSpacing: 1.2 }, greeting: { color: '#0f172a', fontSize: 24, fontWeight: '800', marginTop: 4 }, logoutButton: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, backgroundColor: '#ffffff' }, logoutButtonText: { color: '#475569', fontSize: 13, fontWeight: '700' }, moneyCard: { backgroundColor: '#2563eb', borderRadius: 20, padding: 22, shadowColor: '#1d4ed8', shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 }, moneyLabel: { color: '#bfdbfe', fontSize: 14, fontWeight: '700' }, moneyValue: { color: '#ffffff', fontSize: 32, fontWeight: '800', marginTop: 6 }, moneyDescription: { color: '#dbeafe', fontSize: 13, marginTop: 8 }, sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 30, marginBottom: 14 }, sectionTitle: { color: '#0f172a', fontSize: 19, fontWeight: '800' }, sectionDescription: { color: '#64748b', fontSize: 12, marginTop: 4 }, countText: { color: '#2563eb', fontSize: 14, fontWeight: '700' }, errorBox: { borderRadius: 12, backgroundColor: '#fef2f2', padding: 14, marginBottom: 14 }, errorText: { color: '#b91c1c', fontSize: 14 }, retryText: { color: '#dc2626', fontSize: 14, fontWeight: '800', marginTop: 8 }, promiseCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, backgroundColor: '#ffffff', padding: 16, borderWidth: 1, borderColor: '#e2e8f0' }, dateBadge: { alignItems: 'center', justifyContent: 'center', minWidth: 76, borderRadius: 10, backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 12 }, dateBadgeText: { color: '#1d4ed8', fontSize: 12, fontWeight: '800', textAlign: 'center' }, promiseInfo: { flex: 1, marginLeft: 14 }, promiseTitle: { color: '#0f172a', fontSize: 16, fontWeight: '800' }, promiseTime: { color: '#475569', fontSize: 14, marginTop: 5 }, creatorText: { color: '#94a3b8', fontSize: 12, marginTop: 4 }, separator: { height: 10 }, emptyCard: { alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed', borderRadius: 16, backgroundColor: '#ffffff', paddingHorizontal: 24, paddingVertical: 36 }, emptyTitle: { color: '#334155', fontSize: 16, fontWeight: '800' }, emptyDescription: { color: '#64748b', fontSize: 13, textAlign: 'center', lineHeight: 20, marginTop: 8 }, footerSpace: { height: 30 },
});
