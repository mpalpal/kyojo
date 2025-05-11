import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const dummyChats = [
  { id: '1', name: 'tanaka.さん' },
  { id: '2', name: 'suzuki.さん' },
];

export default function ChatIndex() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>チャット一覧</Text>

      <FlatList
        data={dummyChats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => router.push(`/chat/${item.id}`)}
          >
            <Text style={styles.chatName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  chatItem: {
    padding: 20,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  chatName: {
    fontSize: 18,
  },
});
