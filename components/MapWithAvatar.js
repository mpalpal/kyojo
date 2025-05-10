import { Ionicons } from '@expo/vector-icons'; // 👈 アイコン用
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function MapWithAvatar() {
  const [position, setPosition] = useState({
    latitude: 35.0266,
    longitude: 135.7809,
  });

  const mapRef = useRef(null);

  useEffect(() => {
    let locationSubscription;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 1,
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          setPosition({ latitude, longitude });
        }
      );
    })();

    return () => {
      locationSubscription?.remove();
    };
  }, []);

  const handleLostPress = () => {
    console.log('失くした！ボタンが押されました');
  };

  const handleFoundPress = () => {
    console.log('見つけた！ボタンが押されました');
  };

  const handleTalkPress = () => {
    console.log('話す！ボタンが押されました');
  };

  const handleSettingsPress = () => {
    console.log('⚙️ 設定ボタンが押されました');
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          ...position,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        <Marker coordinate={position} title="あなた" />
      </MapView>

      {/* ⚙️ 設定ボタン */}
      <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
        <Ionicons name="settings-outline" size={28} color="#333" />
      </TouchableOpacity>

      {/* アクションボタン群 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleLostPress}>
          <Text style={styles.buttonText}>失くした！</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleFoundPress}>
          <Text style={styles.buttonText}>見つけた！</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleTalkPress}>
          <Text style={styles.buttonText}>話す！</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  settingsButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
