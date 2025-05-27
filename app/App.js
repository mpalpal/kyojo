import { ExpoRoot } from 'expo-router';

export default function App() {
  const ctx = require.context('./app'); // ← app フォルダを Expo Router に渡す
  return <ExpoRoot context={ctx} />;
}
