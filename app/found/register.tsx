// app/found/register.tsx
// 落とし物を見つけた人が落とし物を登録する画面
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { MapPressEvent, Marker } from 'react-native-maps';


export default function RegisterFoundItem() {
  const router = useRouter();
  const [images, setImages] = useState<(string | null)[]>([null, null]);
  const [locationNotes, setLocationNotes] = useState('');
  
  const initialRegion = {
    latitude: 35.0266,
    longitude: 135.7809,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  const [region, setRegion] = useState(initialRegion);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const pickImageAtIndex = async (index: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: false,
      quality: 0.7,
    });
    if (!result.canceled) {
      const newImages = [...images];
      newImages[index] = result.assets[0].uri;
      setImages(newImages);
    }
  };

  const removeImageAtIndex = (index: number) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
  };

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  const handleRegister = async () => {
    if (images.some((uri) => uri === null)) {
      Alert.alert('画像が足りません', '2枚の画像を選んでください。');
      return;
    }

    if (!selectedLocation) {
      Alert.alert('場所を指定してください。', 'マップをタップして場所を選んでください。');
      return;
    }

    const formData = new FormData();

    images.forEach((uri, index) => {
      if (uri) {
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename ?? '');
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('images', {
          uri,
          name: filename,
          type,
        } as any);
      }
    });

    
    formData.append('kind', '不明'); // Or ask user for kind if needed
    formData.append('date_found', new Date().toISOString());
    formData.append('latitude', String(selectedLocation.latitude));
    formData.append('longitude', String(selectedLocation.longitude));
    formData.append('location_notes', locationNotes);

    try {
      const response = await fetch('https://bca2-2400-4150-9180-b500-8891-8d59-e8f4-33ed.ngrok-free.app/api/found-items', {
      method: 'POST',
      body: formData,
      });

      if (!response.ok) throw new Error('登録に失敗しました');

      Alert.alert('登録完了', '落とし物が登録されました', [
        {
          text: 'OK',
          onPress: () => router.push('/found/thank'), // thank you page
        },
      ]);
    
    } catch (error) {
        Alert.alert('エラー', (error as Error).message);
    }
  };

  const isReadyToSubmit = images.every((uri) => uri !== null) && selectedLocation;

  useEffect(() => {
  (async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('位置情報へのアクセスが拒否されました');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    const newRegion = {
      latitude,
      longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };

    setRegion(newRegion);
    setSelectedLocation({ latitude, longitude });
  })();
}, []);


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← 戻る</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Let's make a report!</Text>
      <Text style={styles.subLabel}>Take 2 photos!</Text>

      <View style={styles.imageGrid}>
        {images.map((uri, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => (uri ? removeImageAtIndex(index) : pickImageAtIndex(index))}
            style={styles.imageTile}
          >
            {uri ? (
              <Image source={{ uri }} style={styles.imageTileImage} />
            ) : (
              <Text style={styles.imageTilePlus}>＋</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subLabel}>Where did you find it?</Text>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
      >
        {selectedLocation && <Marker coordinate={selectedLocation} />}
      </MapView>
      
      <Text style={styles.subLabel}> 場所の詳細（ex.教室名）</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        placeholder="例：◯◯公園のベンチ付近"
        value={locationNotes}
        onChangeText={setLocationNotes}
      />

      <TouchableOpacity
        style={[
          styles.registerButton,
          !isReadyToSubmit && { backgroundColor: '#ccc' },
        ]}
        onPress={handleRegister}
        disabled={!isReadyToSubmit}
      >
        <Text style={styles.registerButtonText}>REGISTER</Text>
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
    fontSize: 22,
    marginBottom: 10,
  },
  subLabel: {
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },
  imageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 8,
  },
  imageTile: {
    width: '48%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  imageTileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imageTilePlus: {
    fontSize: 36,
    color: '#999',
  },
  map: {
    height: 200,
    borderRadius: 10,
    marginTop: 8,
  },
  registerButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});


// import * as ImagePicker from 'expo-image-picker';
// import { useRouter } from 'expo-router';
// import React, { useState } from 'react';
// import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import MapView, { Marker } from 'react-native-maps';
// export default function RegisterFoundItem() {
//   const router = useRouter();
//   const [images, setImages] = useState<string[]>([]);
//   const [region, setRegion] = useState({
//     latitude: 35.0266,
//     longitude: 135.7809,
//     latitudeDelta: 0.005,
//     longitudeDelta: 0.005,
//   });
//   const pickImages = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       allowsMultipleSelection: true,
//       quality: 0.7,
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//     });
//     if (!result.canceled) {
//       setImages(result.assets.slice(0, 2).map(asset => asset.uri));
//     }
//   };
//   const canRegister = images.length === 2 && region.latitude && region.longitude;
//   const handleRegister = () => {
//     if (!canRegister) return;
//     console.log('登録された情報:', { images, region });
//     // router.push(...) ← ここで遷移先を設定可能
//   };
//   return (
//     <View style={styles.container}>
//       <TouchableOpacity onPress={() => router.back()}>
//         <Text style={styles.back}>←</Text>
//       </TouchableOpacity>
//       <Text style={styles.title}>Let's make a report!</Text>
//       {/* 写真アップロード */}
//       <Text style={styles.sectionTitle}>Take 2 photos!</Text>
//       <View style={styles.imageRow}>
//         {[0, 1].map((i) => (
//           <TouchableOpacity key={i} style={styles.imageBox} onPress={pickImages}>
//             {images[i] ? (
//               <Image source={{ uri: images[i] }} style={styles.image} />
//             ) : (
//               <Text style={styles.plus}>＋</Text>
//             )}
//           </TouchableOpacity>
//         ))}
//       </View>
//       {/* 地図 */}
//       <Text style={styles.sectionTitle}>Where did you find it?</Text>
//       <MapView
//         style={styles.map}
//         region={region}
//         onRegionChangeComplete={setRegion}
//       >
//         <Marker coordinate={region} />
//       </MapView>
//       {/* 登録ボタン */}
//       <TouchableOpacity
//         style={[styles.registerButton, !canRegister && { backgroundColor: '#ccc' }]}
//         onPress={handleRegister}
//         disabled={!canRegister}
//       >
//         <Text style={styles.registerText}>REGISTER</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }
// const styles = StyleSheet.create({
//   container: { flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: '#fff' },
//   back: { fontSize: 24, marginBottom: 10 },
//   title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
//   sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 20, marginBottom: 8 },
//   imageRow: { flexDirection: 'row', justifyContent: 'space-between' },
//   imageBox: {
//     width: '48%',
//     height: 120,
//     borderWidth: 1,
//     borderColor: '#aaa',
//     borderStyle: 'dashed',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 8,
//   },
//   image: { width: '100%', height: '100%', borderRadius: 8 },
//   plus: { fontSize: 30, color: '#aaa' },
//   map: { height: 200, borderRadius: 10, marginTop: 10 },
//   registerButton: {
//     backgroundColor: '#007AFF',
//     marginTop: 30,
//     padding: 16,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   registerText: { color: '#fff', fontSize: 18, fontWeight: '600' },
// });