import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LostOptionsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* ← 戻るボタン */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Search ボタン */}
        <TouchableOpacity style={styles.bigButton} onPress={() => router.push('/lost/search')}>
            <MaterialIcons name="search" size={30} color="#fff" />
            <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>


        {/* Record ボタン */}
        <TouchableOpacity style={styles.bigButton} onPress={() => console.log('Record')}>
          <MaterialIcons name="menu-book" size={30} color="#fff" />
          <Text style={styles.buttonText}>Record</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 30,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  bigButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 12,
    marginVertical: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 16,
    fontWeight: '600',
  },
});
