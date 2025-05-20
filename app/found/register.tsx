// app/found/register.tsx
// 落とし物を見つけた人が落とし物を登録する画面

import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { MapPressEvent, Marker } from 'react-native-maps';


export default function RegisterFoundItem() {
    const router = useRouter();
    const [images, setImages] = useState<string[]>([]);
    // const [showFromPicker, setShowFromPicker] = useState(false);
    // const [showToPicker, setShowToPicker] = useState(false);
    const initialRegion = {
        latitude: 35.0266,
        longitude: 135.7809,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    };
    const [region, setRegion] = useState(initialRegion);
    // ピンとして表示する位置
    const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    } | null>(null);

    // 画像選択のための関数
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            allowsMultipleSelection: true,
            quality: 0.7,
        });
        if (!result.canceled) {
            setImages([...images, ...result.assets.map(asset => asset.uri)]);
        }
    };
    // 画像を削除する関数
    const removeImage = (index: number) => {
        setImages(prevImages => prevImages.filter((_, i) => i !== index));
    };

    // const isLocationChanged = () => {
    //     return (
    //         region.latitude !== initialRegion.latitude ||
    //         region.longitude !== initialRegion.longitude    
    //     );
    // };
    const handleSearch = () => {
        if (images.length < 2) {
            Alert.alert(
                '画像が足りません',
                '画像を2枚以上選択してください。',)
            return;
        }
        if (!selectedLocation) {
            Alert.alert(
                '場所を指定してください。',
                'マップを移動して場所を選択してください。',)
            return;
        }
        router.push(
            `/found/tmp?latitude=${region.latitude}&longitude=${region.longitude}`
        );
    };

    // 地図タップ時の処理
    const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← 戻る</Text>
      </TouchableOpacity>

      {/* PHOTO */}
      <Text style={styles.label}>📷 PHOTO（2枚以上必須）</Text>
      <TouchableOpacity onPress={pickImage} style={styles.imageUpload}>
        <Text>＋ 画像を選ぶ</Text>
      </TouchableOpacity>
      <ScrollView horizontal>
        {images.map((uri, i) => (
          <View key={i} style={{ position: 'relative', marginRight: 8 }}>
            <Image source={{ uri }} style={styles.image} />
            <TouchableOpacity
              onPress={() => removeImage(i)}
              style={styles.removeImageButton}
            >
              <Text style={styles.removeImageText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* WHERE */}
      <Text style={styles.label}>🗺️ WHERE（場所を動かして指定）</Text>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
        >
        {selectedLocation && (
            <Marker coordinate={selectedLocation} />
        )}
        </MapView>


      {/* 検索ボタン */}
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>この条件で検索する</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 80,
    backgroundColor: '#fff',
  },
  back: {
    marginBottom: 20,
    color: '#007AFF',
    fontSize: 16,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  imageUpload: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  image: {
    width: 80,
    height: 80,
    marginRight: 8,
    borderRadius: 6,
  },
  map: {
    height: 200,
    borderRadius: 10,
    marginTop: 8,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  removeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
