import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return <NativeTabs disableTransparentOnScrollEdge><NativeTabs.Trigger name="home"><NativeTabs.Trigger.Label>홈</NativeTabs.Trigger.Label><NativeTabs.Trigger.Icon sf="house.fill" md="home" /></NativeTabs.Trigger></NativeTabs>;
}
