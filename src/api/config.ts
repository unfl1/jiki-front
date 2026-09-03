import { Platform } from 'react-native';

// 웹에서는 localhost, Android 에뮬레이터에서는 호스트 PC를 뜻하는 10.0.2.2를 사용한다.
// 실제 휴대폰에서는 EXPO_PUBLIC_API_BASE_URL에 PC의 LAN 주소나 HTTPS 터널 주소를 설정한다.
const defaultBaseUrl = Platform.select({
  android: 'http://10.0.2.2:8080',
  default: 'http://localhost:8080',
});

export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? defaultBaseUrl).replace(/\/$/, '');
