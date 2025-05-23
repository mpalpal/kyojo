import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../../firebase/firebase';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.endsWith('@kyoto-u.ac.jp')) {
      Alert.alert('許可されていないメールアドレス', '京都大学のメールアドレス（@kyoto-u.ac.jp）を入力してください。');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('ログイン成功');
      router.replace('/'); // ログイン後の遷移先
    } catch (error: any) {
      Alert.alert('ログインエラー', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ログイン</Text>
      <TextInput
        style={styles.input}
        placeholder="メールアドレス（@kyoto-u.ac.jp）"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="パスワード"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>ログイン</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/auth/register')}>
        <Text style={styles.linkText}>アカウントを作成する</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, marginBottom: 16, fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF', padding: 16, borderRadius: 10, alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  linkText: { color: '#007AFF', marginTop: 20, textAlign: 'center' },
});
