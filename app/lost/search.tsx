// app/lost/search-detail.tsx

import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView from 'react-native-maps';

export default function SearchDetailScreen() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [kind, setKind] = useState('');
  const [details, setDetails] = useState('');
  const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() });
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [region, setRegion] = useState({
    latitude: 35.0266,
    longitude: 135.7809,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
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

  // 検索ボタンを押したときの処理
  const handleSearch = () => {
  router.push(
    `/lost/search_map?latitude=${region.latitude}&longitude=${region.longitude}`
  );
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← 戻る</Text>
      </TouchableOpacity>

      {/* PHOTO */}
      <Text style={styles.label}>📷 PHOTO</Text>
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


      {/* KIND */}
      <Text style={styles.label}>🧾 KIND</Text>
      <TextInput style={styles.input} value={kind} onChangeText={setKind} placeholder="例：赤い財布" />

      {/* WHEN */}
      <Text style={styles.label}>📅 WHEN（範囲指定）</Text>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => setShowFromPicker(true)} style={styles.dateButton}>
          <Text>{dateRange.from.toDateString()}</Text>
        </TouchableOpacity>
        <Text>〜</Text>
        <TouchableOpacity onPress={() => setShowToPicker(true)} style={styles.dateButton}>
          <Text>{dateRange.to.toDateString()}</Text>
        </TouchableOpacity>
      </View>
      {showFromPicker && (
        <DateTimePicker
          value={dateRange.from}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowFromPicker(false);
            if (selectedDate) {
              setDateRange(prev => ({ ...prev, from: selectedDate }));
            }
          }}
        />
      )}
      {showToPicker && (
        <DateTimePicker
          value={dateRange.to}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowToPicker(false);
            if (selectedDate) {
              setDateRange(prev => ({ ...prev, to: selectedDate }));
            }
          }}
        />
      )}

      {/* WHERE */}
      <Text style={styles.label}>🗺️ WHERE</Text>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      />

      {/* DETAILS */}
      <Text style={styles.label}>💬 DETAILS</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        multiline
        placeholder="補足説明など"
        value={details}
        onChangeText={setDetails}
      />

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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
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
