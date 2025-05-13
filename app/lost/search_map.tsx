// app/lost/search-map.tsx

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
// 各ピンにカスタム吹き出しを追加する。
import { Callout } from 'react-native-maps';
// 
export default function SearchMapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const { latitude, longitude } = useLocalSearchParams();

  const center = {
    latitude: Number(latitude || 35.0266),
    longitude: Number(longitude || 135.7809),
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const [markers, setMarkers] = useState<{ latitude: number; longitude: number }[]>([]);

  useEffect(() => {
    // 検索条件に応じたランダムピン（5つ）を生成
    const newMarkers = Array.from({ length: 5 }, () => ({
      latitude: center.latitude + (Math.random() - 0.5) * 0.01,
      longitude: center.longitude + (Math.random() - 0.5) * 0.01,
    }));
    setMarkers(newMarkers);
  }, []);

  const recenterMap = () => {
    mapRef.current?.animateToRegion(center, 500);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={center}
      >
        {markers.map((marker, index) => (
        <Marker key={index} coordinate={marker}>
  <Callout onPress={() => router.push(`/lost/check_item?index=${index + 1}`)}>
    <View style={{ width: 150 }}>
      <Text style={{ fontWeight: 'bold' }}>候補 {index + 1}</Text>
      <TouchableOpacity
        style={styles.calloutButton}
        onPress={() => router.push(`/lost/check_item?index=${index + 1}`)}
      >
        <Text style={styles.calloutButtonText}>チェックする</Text>
      </TouchableOpacity>
    </View>
  </Callout>
</Marker>
        ))}
      </MapView>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={26} color="#333" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.compassButton} onPress={recenterMap}>
        <Ionicons name="locate" size={24} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
  style={styles.registerButton}
  onPress={() => router.push('/lost/register')}
>
  <Text style={styles.registerButtonText}>みつからない場合は…</Text>
</TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  compassButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 25,
    padding: 10,
  },
  calloutButton: {
  marginTop: 8,
  backgroundColor: '#007AFF',
  paddingVertical: 6,
  paddingHorizontal: 10,
  borderRadius: 6,
  alignItems: 'center',
},
calloutButtonText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 14,
},
registerButton: {
  position: 'absolute',
  bottom: 30,
  left: 20,
  right: 20,
  backgroundColor: '#FF3B30',
  paddingVertical: 14,
  borderRadius: 10,
  alignItems: 'center',
},
registerButtonText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
},


});
