// app/login.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    const res = await fetch('https://5149-133-3-201-39.ngrok-free.app/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username: email, password : password }).toString(),
    });

    if (res.ok) {
      const { access_token } = await res.json();
      await AsyncStorage.setItem('token', access_token);
      router.replace('/home');
      
    } else {
      alert('ログイン失敗');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Email</Text>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" />
      <Text>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="ログイン" onPress={handleLogin} />
      <Button title="新規登録へ" onPress={() => router.push('/register')} />
    </View>
  );
}
