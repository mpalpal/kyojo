// app/lost/check-item.tsx

import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CheckItemScreen() {
  const { index } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>これはあなたのものですか？</Text>
      <Text style={styles.subtext}>候補 {index}</Text>

      <TouchableOpacity style={styles.button} onPress={() => alert('確認しました！')}>
        <Text style={styles.buttonText}>はい</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.noButton]} onPress={() => router.back()}>
        <Text style={styles.buttonText}>いいえ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  subtext: { fontSize: 16, marginBottom: 40 },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 16,
  },
  noButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
