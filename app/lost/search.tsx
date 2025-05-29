import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import MapView, { MapPressEvent, Marker } from 'react-native-maps';

export default function SearchDetailScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [images, setImages] = useState<string[]>([]);
  const [kind, setKind] = useState('');
  const [details, setDetails] = useState('');
  const [dateFrom, setDateFrom] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [region, setRegion] = useState({
    latitude: 35.0266,
    longitude: 135.7809,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const [quizShown, setQuizShown] = useState(false);
  const [quizzes, setQuizzes] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets.map(asset => asset.uri)]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const generateQuizzes = (detailsText: string): string[] => {
    if (!detailsText) return [];
    return [
      '本体の色は何色ですか？',
      '待受画面に写っている動物はなんですか？'
    ];
  };

  const handleSubmit = () => {
    if (!selectedLocation) {
      Alert.alert('場所を指定してください。', 'マップを移動して場所を選択してください。');
      return;
    }

    if (!quizShown) {
      const generated = generateQuizzes(details);
      setQuizzes(generated);
      setAnswers(Array(generated.length).fill(''));
      setQuizShown(true);
      return;
    }

    for (let i = 0; i < answers.length; i++) {
      if (!answers[i].trim()) {
        Alert.alert('すべてのクイズに回答してください。');
        return;
      }
    }

    router.push(`/lost/search_map?latitude=${region.latitude}&longitude=${region.longitude}`);
  };

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  const centerOnCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('位置情報へのアクセスが拒否されました。');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const newRegion = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 1000);
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      enableOnAndroid
      extraScrollHeight={100}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← 戻る</Text>
      </TouchableOpacity>

      {/* PHOTO */}
      <Text style={styles.label}>📷 PHOTO</Text>
      <TouchableOpacity onPress={pickImage} style={styles.imageUpload}>
        <Text>＋ 画像を選ぶ</Text>
      </TouchableOpacity>
      <KeyboardAwareScrollView horizontal>
        {images.map((uri, i) => (
          <View key={i} style={{ position: 'relative', marginRight: 8 }}>
            <Image source={{ uri }} style={styles.image} />
            <TouchableOpacity onPress={() => removeImage(i)} style={styles.removeImageButton}>
              <Text style={styles.removeImageText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </KeyboardAwareScrollView>

      {/* KIND */}
      <Text style={styles.label}>🧾 KIND</Text>
      <TextInput style={styles.input} value={kind} onChangeText={setKind} placeholder="例：赤い財布" />

      {/* WHEN */}
      <Text style={styles.label}>📅 WHEN（日時指定）</Text>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => setShowFromPicker(true)} style={styles.dateButton}>
          <Text>{dateFrom.toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}</Text>
        </TouchableOpacity>
        <Text>〜</Text>
        <View style={[styles.dateButton, { backgroundColor: '#f0f0f0' }]}>
          <Text>{new Date().toLocaleDateString()}</Text>
        </View>
      </View>

      {showFromPicker && (
        <DateTimePicker
          value={dateFrom}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          is24Hour={true}
          minuteInterval={60}
          onChange={(event, selectedDate) => {
            setShowFromPicker(false);
            if (selectedDate) setDateFrom(selectedDate);
          }}
        />
      )}

      {/* WHERE */}
      <Text style={styles.label}>🗺️ WHERE</Text>
      <View style={{ position: 'relative' }}>
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          onPress={handleMapPress}
        >
          {selectedLocation && <Marker coordinate={selectedLocation} />}
        </MapView>
        <TouchableOpacity style={styles.gpsButton} onPress={centerOnCurrentLocation}>
          <Text style={styles.gpsButtonText}>📍</Text>
        </TouchableOpacity>
      </View>

      {/* DETAILS */}
      <Text style={styles.label}>💬 DETAILS</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        multiline
        placeholder="補足説明など"
        value={details}
        onChangeText={setDetails}
      />

      {/* QUIZZES */}
      {quizShown && quizzes.map((q, i) => (
        <View key={i} style={{ marginTop: 20 }}>
          <Text style={styles.label}>📝 クイズ{i + 1}</Text>
          <Text style={{ marginBottom: 8 }}>{q}</Text>
          <TextInput
            style={styles.input}
            value={answers[i]}
            onChangeText={text => {
              const updated = [...answers];
              updated[i] = text;
              setAnswers(updated);
            }}
            placeholder="回答を入力"
          />
        </View>
      ))}

      {/* SUBMIT BUTTON */}
      <TouchableOpacity style={styles.searchButton} onPress={handleSubmit}>
        <Text style={styles.searchButtonText}>
          {quizShown ? 'この条件で検索する' : '次へ'}
        </Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
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
    minWidth: 100,
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
  gpsButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  gpsButtonText: {
    fontSize: 20,
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
