import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { MapPressEvent, Marker } from 'react-native-maps';
import DateTimePickerModal from 'react-native-modal-datetime-picker';


export default function SearchDetailScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [images, setImages] = useState<string[]>([]);

  const SUPPORTED_CATEGORIES = [
    { label: '📱 Phone', value: 'phone' },
    { label: '👛 Wallet', value: 'wallet' },
    { label: '🎒 Bag', value: 'bag' },
    { label: '🔑 Keys', value: 'keys' },
    { label: '📦 Others', value: 'others' }
  ];

  // Inside your component
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedKind, setSelectedKind] = useState(SUPPORTED_CATEGORIES[0]);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false); 
  const [kind, setKind] = useState('📱 Phone'); // initial state
  const [details, setDetails] = useState('');
  const [locationNotes, setLocationNotes] = useState('');
  const [region, setRegion] = useState({
    latitude: 35.0266,
    longitude: 135.7809,
    latitudeDelta: 0.002,
    longitudeDelta: 0.002,
  });
  const [selectedLocations, setSelectedLocations] = useState<
    { latitude: number; longitude: number }[]
  >([]);

  const [quizShown, setQuizShown] = useState(false);
  const [quizzes, setQuizzes] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);

  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date(),
  });
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [activePicker, setActivePicker] = useState<'from' | null>(null);

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
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const generateQuizzes = (detailsText: string): string[] => {
    if (!detailsText) return [];
    return [
      '本体の色は何色ですか？',
      '待受画面に写っている動物はなんですか？',
    ];
  };

  const handleSubmit = async () => {
    if (selectedLocations.length === 0) {
      Alert.alert('場所を指定してください。', 'マップをタップして場所を選択してください。');
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

    // form submission
    const formData = new FormData();

    if (images.length > 0) {
      images.forEach((uri, index) => {
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename ?? '');
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('images', {
          uri,
          name: filename,
          type,
        } as any);
      });
    }

    formData.append('kind', kind);
    formData.append('details', details);
    formData.append('location_notes', locationNotes);
    formData.append('date_from', dateRange.from.toISOString());
    formData.append('date_to', dateRange.to.toISOString());

    selectedLocations.forEach((loc, i) => {
      formData.append(`locations[${i}][latitude]`, String(loc.latitude));
      formData.append(`locations[${i}][longitude]`, String(loc.longitude));
    });

    answers.forEach((answer, i) => {
      formData.append(`quiz_answers[${i}]`, answer);
    });

    try {
      const response = await fetch('https://fc59-2400-4150-9180-b500-8891-8d59-e8f4-33ed.ngrok-free.app/api/lost-items', {
        method: 'POST',
        body: formData,
        // headers: {
        //   'Content-Type': 'multipart/form-data',
        // },
      });
      if (!response.ok) {
        throw new Error('送信に失敗しました');
      }

      const data = await response.json();
      const lostItemId = data.item_id;

      Alert.alert('送信完了', '検索条件が保存されました');

      router.push(`/lost/search_map?latitude=${region.latitude}&longitude=${region.longitude}&lost_item_id=${lostItemId}`);
    } catch (error) {
      Alert.alert('エラー', (error as Error).message);
    }
  }


  // 地図タップ時の処理
  const handleMapPress = (event: MapPressEvent) => {
    if (selectedLocations.length >= 3) {
      Alert.alert('マーカーは最大3つまでです。');
      return;
    }

    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocations(prev => [...prev, { latitude, longitude }]);
  };

  const handleMarkerPress = (index: number) => {
    setSelectedLocations(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllMarkers = () => {
    setSelectedLocations([]);
  };

  const centerOnCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('位置情報へのアクセスが拒否されました。');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const newRegion = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.002,
      longitudeDelta: 0.002,
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 1000);
  };

  useEffect(() => {
    centerOnCurrentLocation();
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      // enableOnAndroid
      // extraScrollHeight={100}
      // keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← 戻る</Text>
      </TouchableOpacity>

      <Text style={styles.label}>📷 PHOTO（任意）</Text>
      <TouchableOpacity onPress={pickImage} style={styles.imageUpload}>
        <Text>＋ 画像を選ぶ</Text>
      </TouchableOpacity>
      <ScrollView horizontal>
        {images.map((uri, i) => (
          <View key={i} style={{ position: 'relative', marginRight: 8 }}>
            <Image source={{ uri }} style={styles.image} />
            <TouchableOpacity onPress={() => removeImage(i)} style={styles.removeImageButton}>
              <Text style={styles.removeImageText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* <Text style={styles.label}> KIND（落とし物の種類）</Text>
      <TextInput style={styles.input} value={kind} onChangeText={setKind} placeholder="例：赤い財布" /> */}

      <Text style={styles.label}> KIND（落とし物の種類）</Text>
      <TouchableOpacity
        style={styles.categoryButton}
        onPress={() => setMenuVisible(true)}
      >
        <Text style={styles.categoryButtonText}>{selectedKind.label}</Text>
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setMenuVisible(false)}
        >
          <View style={styles.dropdownMenu}>
            {SUPPORTED_CATEGORIES.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedKind(item);
                  setKind(item.value);
                  setMenuVisible(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>



      <Text style={styles.label}> WHEN（落とした日を選択）</Text>
      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => {
            setActivePicker('from');
            setDatePickerVisible(true);
          }}
          style={styles.dateButton}
        >
          <MaterialIcons name="calendar-today" size={20} color="#007AFF" />
          <Text style={{ marginLeft: 8 }}>{dateRange.from.toLocaleDateString()}</Text>
        </TouchableOpacity>

        <Text style={{ marginHorizontal: 8 }}>〜</Text>

        <View style={[styles.dateButton, { backgroundColor: '#f0f0f0' }]}>
          <MaterialIcons name="calendar-today" size={20} color="#ccc" />
          <Text style={{ marginLeft: 8, color: '#999' }}>{new Date().toLocaleDateString()}</Text>
        </View>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        maximumDate={new Date()}
        onConfirm={(date) => {
          setDatePickerVisible(false);
          if (activePicker === 'from') {
            setDateRange({ from: date, to: new Date() });
          }
          setActivePicker(null);
        }}
        onCancel={() => {
          setDatePickerVisible(false);
          setActivePicker(null);
        }}
        date={dateRange.from}
      />

      <Text style={styles.label}> WHERE</Text>
      <View style={{ position: 'relative' }}>
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          onPress={handleMapPress}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {selectedLocations.map((loc, i) => (
            <Marker
              key={i}
              coordinate={loc}
              onPress={() => handleMarkerPress(i)}
            />
          ))}
        </MapView>
        <TouchableOpacity style={styles.gpsButton} onPress={centerOnCurrentLocation}>
          <Text style={styles.gpsButtonText}>📍</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={clearAllMarkers}>
          <Text style={styles.clearButtonText}>🗑️ ピン削除</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}> 場所の詳細（ex.教室名）</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        placeholder="例：◯◯公園のベンチ付近"
        value={locationNotes}
        onChangeText={setLocationNotes}
      />

      <Text style={styles.label}>💬 落とし物の詳細</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        multiline
        placeholder="補足説明など"
        value={details}
        onChangeText={setDetails}
      />

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

      <TouchableOpacity style={styles.searchButton} onPress={handleSubmit}>
        <Text style={styles.searchButtonText}>
          {quizShown ? 'この条件で検索する' : '次へ'}
        </Text>
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
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    minWidth: 100,
    flexDirection: 'row',
    alignItems: 'center',
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
    height: 300,
    borderRadius: 10,
    marginTop: 8,
  },
  clearButton: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  clearButtonText: {
    color: '#333',
    fontSize: 12,
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
  categoryButton: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  paddingVertical: 12,
  paddingHorizontal: 16,
  backgroundColor: '#fff',
  marginBottom: 10,
  },
  categoryButtonText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 30,
  },

  dropdownMenu: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },

  dropdownItem: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },

  dropdownItemText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
    width: '100%',
  },
});
