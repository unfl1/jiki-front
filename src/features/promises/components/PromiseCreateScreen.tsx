import { useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ApiError } from '@/lib/api/client';

import { createPromise } from '../api';
import { PromiseCreatePayload } from '../types';

type PromiseCreateScreenProps = { onCompleted: () => void; onCancel: () => void };
type PickerMode = 'date' | 'time' | null;

export function PromiseCreateScreen({ onCompleted, onCancel }: PromiseCreateScreenProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [penalty, setPenalty] = useState('0');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const parsedPenalty = Number(penalty);
    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);
    if (!title.trim() || !date || !time || !latitude.trim() || !longitude.trim()) { setErrorMessage('제목, 날짜, 시간, 약속 장소 좌표를 모두 입력해주세요.'); return; }
    if (!Number.isInteger(parsedPenalty) || parsedPenalty < 0 || !Number.isFinite(parsedLatitude) || !Number.isFinite(parsedLongitude)) { setErrorMessage('벌금은 0 이상의 정수로, 위도와 경도는 숫자로 입력해주세요.'); return; }
    const payload: PromiseCreatePayload = { title: title.trim(), date, time, penalty: parsedPenalty, latitude: parsedLatitude, longitude: parsedLongitude };
    setErrorMessage(null); setIsSubmitting(true);
    try { await createPromise(payload); onCompleted(); }
    catch (error) { setErrorMessage(error instanceof ApiError ? error.message : '약속을 생성하지 못했습니다. 서버 연결을 확인해주세요.'); }
    finally { setIsSubmitting(false); }
  };

  return <SafeAreaView style={styles.safeArea}><KeyboardAvoidingView style={styles.container} behavior={Platform.select({ ios: 'padding', default: undefined })}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <View style={styles.header}><Text style={styles.title}>새 약속 만들기</Text><Text style={styles.subtitle}>장소는 다음 지도 화면에서 선택할 수 있도록 연결할 예정이에요.</Text></View><View style={styles.form}>
      <Field label="약속 제목" value={title} onChangeText={setTitle} placeholder="예: 강남역 저녁 식사" editable={!isSubmitting} />
      <SelectionField label="날짜" value={date} placeholder="날짜를 선택하세요" disabled={isSubmitting} onPress={() => setPickerMode('date')} />
      <SelectionField label="시간" value={time ? formatDisplayTime(time) : ''} placeholder="시간을 선택하세요" disabled={isSubmitting} onPress={() => setPickerMode('time')} />
      <Field label="지각 벌금 (P)" value={penalty} onChangeText={setPenalty} placeholder="0" editable={!isSubmitting} keyboardType="number-pad" />
      <View style={styles.locationSection}><Text style={styles.sectionTitle}>약속 장소</Text><Text style={styles.sectionDescription}>현재는 지도 기능 전 단계라 좌표를 직접 입력합니다.</Text></View>
      <Field label="위도" value={latitude} onChangeText={setLatitude} placeholder="예: 37.498095" editable={!isSubmitting} keyboardType="numbers-and-punctuation" />
      <Field label="경도" value={longitude} onChangeText={setLongitude} placeholder="예: 127.027610" editable={!isSubmitting} keyboardType="numbers-and-punctuation" />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      <Pressable accessibilityRole="button" disabled={isSubmitting} onPress={handleSubmit} style={({ pressed }) => [styles.submitButton, (pressed || isSubmitting) && styles.submitButtonPressed]}>{isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.submitButtonText}>약속 생성</Text>}</Pressable>
      <Pressable accessibilityRole="button" disabled={isSubmitting} onPress={onCancel} style={styles.cancelButton}><Text style={styles.cancelButtonText}>취소</Text></Pressable>
    </View>
  </ScrollView></KeyboardAvoidingView>
  {pickerMode === 'date' ? <CalendarPickerModal selectedDate={date} onSelect={(value) => { setDate(value); setPickerMode(null); }} onClose={() => setPickerMode(null)} /> : null}
  {pickerMode === 'time' ? <TimePickerModal initialValue={time} onSelect={(value) => { setTime(value); setPickerMode(null); }} onClose={() => setPickerMode(null)} /> : null}
  </SafeAreaView>;
}

function Field({ label, ...props }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; editable: boolean; keyboardType?: 'default' | 'number-pad' | 'numbers-and-punctuation' }) { return <View><Text style={styles.label}>{label}</Text><TextInput {...props} style={styles.input} autoCapitalize="none" autoCorrect={false} /></View>; }
function SelectionField({ label, value, placeholder, disabled, onPress }: { label: string; value: string; placeholder: string; disabled: boolean; onPress: () => void }) { return <View><Text style={styles.label}>{label}</Text><Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.selectionField, (pressed || disabled) && styles.selectionFieldPressed]}><Text style={value ? styles.selectionValue : styles.selectionPlaceholder}>{value || placeholder}</Text><Text style={styles.selectionIcon}>⌄</Text></Pressable></View>; }

function CalendarPickerModal({ selectedDate, onSelect, onClose }: { selectedDate: string; onSelect: (value: string) => void; onClose: () => void }) {
  const [month, setMonth] = useState(() => selectedDate ? new Date(`${selectedDate}T00:00:00`) : startOfToday());
  const [calendarView, setCalendarView] = useState<'days' | 'years' | 'months'>('days');
  const today = startOfToday(); const lastDate = new Date(today); lastDate.setFullYear(lastDate.getFullYear() + 5);
  const calendarDays = getCalendarDays(month);
  const moveMonth = (offset: number) => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  const isFirstMonth = month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();
  const isLastMonth = month.getFullYear() === lastDate.getFullYear() && month.getMonth() === lastDate.getMonth();
  return <Modal visible transparent animationType="slide" onRequestClose={onClose}><View style={styles.modalBackdrop}><View style={styles.calendarContent}>
    <View style={styles.modalHeader}><Text style={styles.modalTitle}>날짜 선택</Text><Pressable accessibilityRole="button" onPress={onClose}><Text style={styles.closeText}>닫기</Text></Pressable></View>
    {calendarView === 'days' ? <><View style={styles.calendarNavigation}><Pressable accessibilityRole="button" disabled={isFirstMonth} onPress={() => moveMonth(-1)} style={[styles.arrowButton, isFirstMonth && styles.disabledMonthButton]}><Text style={[styles.arrowText, isFirstMonth && styles.disabledMonthButtonText]}>‹</Text></Pressable><Pressable accessibilityRole="button" onPress={() => setCalendarView('years')} style={styles.monthTitleButton}><Text style={styles.monthTitle}>{month.getFullYear()}년 {month.getMonth() + 1}월</Text></Pressable><Pressable accessibilityRole="button" disabled={isLastMonth} onPress={() => moveMonth(1)} style={[styles.arrowButton, isLastMonth && styles.disabledMonthButton]}><Text style={[styles.arrowText, isLastMonth && styles.disabledMonthButtonText]}>›</Text></Pressable></View><View style={styles.weekdays}>{['일', '월', '화', '수', '목', '금', '토'].map((day) => <Text key={day} style={styles.weekday}>{day}</Text>)}</View><View style={styles.calendarGrid}>{calendarDays.map((day, index) => { if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />; const value = formatDate(new Date(month.getFullYear(), month.getMonth(), day)); const isDisabled = value < formatDate(today) || value > formatDate(lastDate); const isSelected = value === selectedDate; return <Pressable key={value} accessibilityRole="button" disabled={isDisabled} onPress={() => onSelect(value)} style={[styles.dayCell, isSelected && styles.selectedDay]}><Text style={[styles.dayText, isDisabled && styles.disabledDayText, isSelected && styles.selectedDayText]}>{day}</Text></Pressable>; })}</View></> : null}
    {calendarView === 'years' ? <CalendarChoice title="연도 선택" values={Array.from({ length: 6 }, (_, index) => String(today.getFullYear() + index))} selectedValue={String(month.getFullYear())} suffix="년" onSelect={(value) => { setMonth((current) => new Date(Number(value), current.getMonth(), 1)); setCalendarView('months'); }} /> : null}
    {calendarView === 'months' ? <CalendarChoice title={`${month.getFullYear()}년 월 선택`} values={Array.from({ length: 12 }, (_, index) => String(index + 1))} selectedValue={String(month.getMonth() + 1)} suffix="월" onSelect={(value) => { setMonth((current) => new Date(current.getFullYear(), Number(value) - 1, 1)); setCalendarView('days'); }} /> : null}
  </View></View></Modal>;
}

function CalendarChoice({ title, values, selectedValue, suffix, onSelect }: { title: string; values: string[]; selectedValue: string; suffix: string; onSelect: (value: string) => void }) {
  return <View style={styles.choiceContainer}><Text style={styles.choiceTitle}>{title}</Text><View style={styles.choiceGrid}>{values.map((value) => <Pressable key={value} accessibilityRole="button" onPress={() => onSelect(value)} style={[styles.choiceCell, value === selectedValue && styles.selectedChoiceCell]}><Text style={[styles.choiceText, value === selectedValue && styles.selectedChoiceText]}>{value}{suffix}</Text></Pressable>)}</View></View>;
}

function TimePickerModal({ initialValue, onSelect, onClose }: { initialValue: string; onSelect: (value: string) => void; onClose: () => void }) {
  const initial = toTimeParts(initialValue); const [meridiem, setMeridiem] = useState(initial.meridiem); const [hour, setHour] = useState(initial.hour); const [minute, setMinute] = useState(initial.minute);
  return <Modal visible transparent animationType="slide" onRequestClose={onClose}><View style={styles.modalBackdrop}><View style={styles.timeContent}>
    <View style={styles.modalHeader}><Text style={styles.modalTitle}>시간 선택</Text><Pressable accessibilityRole="button" onPress={onClose}><Text style={styles.closeText}>취소</Text></Pressable></View>
    <View style={styles.timePickerBody}><View style={styles.wheelLabels}><Text style={styles.wheelLabel}>오전/오후</Text><Text style={styles.wheelLabel}>시</Text><Text style={styles.wheelLabel}>분</Text></View>
    <View style={styles.wheels}><Wheel values={meridiemOptions} selectedValue={meridiem} onValueChange={setMeridiem} /><Wheel values={hourOptions} selectedValue={hour} onValueChange={setHour} /><Wheel values={minuteOptions} selectedValue={minute} onValueChange={setMinute} /></View></View>
    <Pressable accessibilityRole="button" onPress={() => onSelect(toTwentyFourHourTime(meridiem, hour, minute))} style={styles.confirmButton}><Text style={styles.confirmButtonText}>선택 완료</Text></Pressable>
  </View></View></Modal>;
}

function Wheel({ values, selectedValue, onValueChange }: { values: string[]; selectedValue: string; onValueChange: (value: string) => void }) {
  const listRef = useRef<FlatList<string>>(null);
  const selectedIndex = Math.max(values.indexOf(selectedValue), 0);
  const updateValueFromOffset = (offset: number) => { const index = Math.round(offset / 44); onValueChange(values[Math.min(Math.max(index, 0), values.length - 1)]); };
  const selectValue = (item: string, index: number) => { onValueChange(item); listRef.current?.scrollToOffset({ offset: index * 44, animated: true }); };
  return <View style={styles.wheel}><View pointerEvents="none" style={styles.wheelSelectionIndicator} /><FlatList ref={listRef} data={values} keyExtractor={(item) => item} initialScrollIndex={selectedIndex} getItemLayout={(_, index) => ({ length: 44, offset: 44 * index, index })} contentContainerStyle={styles.wheelListContent} showsVerticalScrollIndicator={false} snapToInterval={44} decelerationRate="fast" scrollEventThrottle={16} onScroll={(event) => updateValueFromOffset(event.nativeEvent.contentOffset.y)} renderItem={({ item, index }) => <Pressable accessibilityRole="button" onPress={() => selectValue(item, index)} style={styles.wheelItem}><Text style={[styles.wheelText, item === selectedValue && styles.selectedWheelText]}>{item}</Text></Pressable>} /></View>;
}

function startOfToday() { const today = new Date(); today.setHours(0, 0, 0, 0); return today; }
function formatDate(value: Date) { return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`; }
function getCalendarDays(month: Date): Array<number | null> {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const dayCount = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const days = [...Array<number | null>(firstDay).fill(null), ...Array.from({ length: dayCount }, (_, index) => index + 1)];

  // Every calendar keeps six weeks visible, so its height never changes by month.
  return [...days, ...Array<number | null>(42 - days.length).fill(null)];
}
function toTimeParts(value: string) { const [hourValue, minuteValue] = value.split(':').map(Number); const safeHour = Number.isFinite(hourValue) ? hourValue : 9; const safeMinute = Number.isFinite(minuteValue) ? minuteValue : 0; return { meridiem: safeHour >= 12 ? 'PM' : 'AM', hour: String(safeHour % 12 || 12), minute: String(safeMinute).padStart(2, '0') }; }
function toTwentyFourHourTime(meridiem: string, hour: string, minute: string) { const parsedHour = Number(hour) % 12 + (meridiem === 'PM' ? 12 : 0); return `${String(parsedHour).padStart(2, '0')}:${minute}`; }
function formatDisplayTime(value: string) { const parts = toTimeParts(value); return `${parts.meridiem === 'AM' ? '오전' : '오후'} ${parts.hour}:${parts.minute}`; }

const meridiemOptions = ['AM', 'PM'];
const hourOptions = Array.from({ length: 12 }, (_, index) => String(index + 1));
const minuteOptions = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' }, container: { flex: 1 }, content: { flexGrow: 1, padding: 24 }, header: { marginBottom: 26 }, title: { color: '#0f172a', fontSize: 28, fontWeight: '800' }, subtitle: { color: '#64748b', fontSize: 14, lineHeight: 20, marginTop: 8 }, form: { gap: 16 }, label: { color: '#334155', fontSize: 14, fontWeight: '700', marginBottom: 8 }, input: { height: 52, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, backgroundColor: '#ffffff', paddingHorizontal: 16, color: '#0f172a', fontSize: 16 }, selectionField: { height: 52, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, backgroundColor: '#ffffff', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, selectionFieldPressed: { opacity: 0.68 }, selectionValue: { color: '#0f172a', fontSize: 16 }, selectionPlaceholder: { color: '#94a3b8', fontSize: 16 }, selectionIcon: { color: '#475569', fontSize: 18 }, locationSection: { borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 20, marginTop: 4 }, sectionTitle: { color: '#0f172a', fontSize: 17, fontWeight: '800' }, sectionDescription: { color: '#64748b', fontSize: 13, marginTop: 5 }, errorText: { color: '#dc2626', fontSize: 14 }, submitButton: { height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#2563eb', marginTop: 8 }, submitButtonPressed: { opacity: 0.72 }, submitButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '800' }, cancelButton: { alignItems: 'center', paddingVertical: 12 }, cancelButtonText: { color: '#475569', fontSize: 14, fontWeight: '700' }, modalBackdrop: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.42)' }, calendarContent: { width: '92%', maxWidth: 390, borderTopLeftRadius: 22, borderTopRightRadius: 22, backgroundColor: '#ffffff', paddingBottom: 22 }, timeContent: { width: '92%', maxWidth: 390, height: 480, borderTopLeftRadius: 22, borderTopRightRadius: 22, backgroundColor: '#ffffff', paddingBottom: 28 }, timePickerBody: { flex: 1, justifyContent: 'center' }, modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }, modalTitle: { color: '#0f172a', fontSize: 18, fontWeight: '800' }, closeText: { color: '#2563eb', fontSize: 14, fontWeight: '800' }, calendarNavigation: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingTop: 12 }, monthButton: { alignItems: 'center', justifyContent: 'center', minWidth: 52, height: 34, borderRadius: 8, backgroundColor: '#eff6ff' }, disabledMonthButton: { backgroundColor: '#f1f5f9' }, monthButtonText: { color: '#1d4ed8', fontSize: 13, fontWeight: '800' }, disabledMonthButtonText: { color: '#cbd5e1' }, monthTitle: { color: '#0f172a', fontSize: 17, fontWeight: '800' }, weekdays: { flexDirection: 'row', paddingHorizontal: 12, marginTop: 14 }, weekday: { width: '14.2857%', color: '#64748b', fontSize: 12, fontWeight: '700', textAlign: 'center' }, calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginTop: 5 }, dayCell: { width: '14.2857%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 18 }, dayText: { color: '#1e293b', fontSize: 14, fontWeight: '600' }, disabledDayText: { color: '#cbd5e1' }, selectedDay: { backgroundColor: '#2563eb' }, selectedDayText: { color: '#ffffff' }, wheelLabels: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 18 }, wheelLabel: { width: '30%', color: '#64748b', fontSize: 13, fontWeight: '700', textAlign: 'center' }, wheels: { flexDirection: 'row', justifyContent: 'space-around', height: 176, marginTop: 10 }, wheel: { width: '30%', height: 176, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#dbeafe' }, wheelItem: { height: 44, alignItems: 'center', justifyContent: 'center' }, selectedWheelItem: { backgroundColor: '#eff6ff', borderRadius: 8 }, wheelText: { color: '#94a3b8', fontSize: 18 }, selectedWheelText: { color: '#1d4ed8', fontSize: 20, fontWeight: '800' }, confirmButton: { height: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#2563eb', marginHorizontal: 20, marginTop: 18 }, confirmButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  wheelListContent: { paddingVertical: 66 },
  wheelSelectionIndicator: { position: 'absolute', left: 0, right: 0, top: 66, height: 44, borderRadius: 8, backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe' },
  arrowButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: '#eff6ff' },
  arrowText: { color: '#1d4ed8', fontSize: 28, lineHeight: 30 },
  monthTitleButton: { paddingHorizontal: 12, paddingVertical: 8 },
  choiceContainer: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 14 },
  choiceTitle: { color: '#0f172a', fontSize: 17, fontWeight: '800', marginBottom: 18 },
  choiceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  choiceCell: { width: '30%', height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#f8fafc' },
  selectedChoiceCell: { backgroundColor: '#2563eb' },
  choiceText: { color: '#334155', fontSize: 15, fontWeight: '700' },
  selectedChoiceText: { color: '#ffffff' },
});
