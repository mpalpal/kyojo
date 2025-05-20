import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function FoundReportScreen() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [region, setRegion] = useState({
    latitude: 35.0266,
    longitude: 135.7809,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 0.7,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      setImages(result.assets.slice(0, 2).map(asset => asset.uri));
    }
  };

  const canRegister = images.length === 2 && region.latitude && region.longitude;

  const handleRegister = () => {
    if (!canRegister) return;
    console.log('登録された情報:', { images, region });
    // router.push(...) ← ここで遷移先を設定可能
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Let's make a report!</Text>

      {/* 写真アップロード */}
      <Text style={styles.sectionTitle}>Take 2 photos!</Text>
      <View style={styles.imageRow}>
        {[0, 1].map((i) => (
          <TouchableOpacity key={i} style={styles.imageBox} onPress={pickImages}>
            {images[i] ? (
              <Image source={{ uri: images[i] }} style={styles.image} />
            ) : (
              <Text style={styles.plus}>＋</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* 地図 */}
      <Text style={styles.sectionTitle}>Where did you find it?</Text>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        <Marker coordinate={region} />
      </MapView>

      {/* 登録ボタン */}
      <TouchableOpacity
        style={[styles.registerButton, !canRegister && { backgroundColor: '#ccc' }]}
        onPress={handleRegister}
        disabled={!canRegister}
      >
        <Text style={styles.registerText}>REGISTER</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: '#fff' },
  back: { fontSize: 24, marginBottom: 10 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 20, marginBottom: 8 },
  imageRow: { flexDirection: 'row', justifyContent: 'space-between' },
  imageBox: {
    width: '48%',
    height: 120,
    borderWidth: 1,
    borderColor: '#aaa',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  image: { width: '100%', height: '100%', borderRadius: 8 },
  plus: { fontSize: 30, color: '#aaa' },
  map: { height: 200, borderRadius: 10, marginTop: 10 },
  registerButton: {
    backgroundColor: '#007AFF',
    marginTop: 30,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  registerText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
