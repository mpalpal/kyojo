// app/lost/register.tsx

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function RegisterLostItem() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>データベースに登録</Text>
      <Text>この画面では、見つからなかったものを登録できます。</Text>
      <Text style={styles.note}>（※ この画面の内容は仮です）</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  note: { marginTop: 20, color: '#888' },
});
