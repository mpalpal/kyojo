import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { auth } from '../../firebase/firebase';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleRegister = async () => {
    if (!email.endsWith('@kyoto-u.ac.jp')) {
      Alert.alert(
        '許可されていないメールアドレス',
        '京都大学のメールアドレス（@kyoto-u.ac.jp）を入力してください。'
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert('パスワードエラー', 'パスワードは6文字以上である必要があります。');
      return;
    }

    if (password !== confirm) {
      Alert.alert('パスワード不一致', '確認用パスワードが一致しません。');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('登録成功');
      router.replace('/'); // 登録後のトップ画面へ遷移
    } catch (error: any) {
      Alert.alert('登録エラー', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.title}>新規登録</Text>
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
            placeholder="パスワード（6文字以上）"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="パスワード（確認）"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>アカウントを作成</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.linkText}>ログイン画面に戻る</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#28A745',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  linkText: { color: '#007AFF', marginTop: 20, textAlign: 'center' },
});
