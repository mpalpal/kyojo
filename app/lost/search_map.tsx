// app/lost/search-map.tsx

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
// 各ピンにカスタム吹き出しを追加する。
import { Callout } from 'react-native-maps';
// 

type MarkerType = 'new' | 'claimed' | 'taken'

type MarkerData = {
  latitude: number;
  longitude: number;
  type: MarkerType;
};

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

  const [markers, setMarkers] = useState<MarkerData[]>([]);

  const recenterMap = () => {
    mapRef.current?.animateToRegion(center, 500);
  };

  useEffect(() => {
  const types: MarkerType[] = ['new', 'claimed', 'taken'];

  // 各タイプでランダムに1〜2個ずつピンを生成
  const newMarkers = types.flatMap(type =>
      Array.from({ length: Math.floor(Math.random() * 2) + 1 }, () => ({
        latitude: center.latitude + (Math.random() - 0.5) * 0.01,
        longitude: center.longitude + (Math.random() - 0.5) * 0.01,
        type,
      }))
    );

    setMarkers(newMarkers);
  }, []);


  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={center}
      >

        {markers.map((marker, index) => {
        let pinColor;
        switch (marker.type) {
          case 'new':
            pinColor = 'red';
            break;
          case 'claimed':
            pinColor = 'green';
            break;
          case 'taken':
            pinColor = 'blue';
            break;
        }

  return (
    <Marker
      key={index}
      coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
      pinColor={pinColor}
    >
      <Callout onPress={() => router.push(`/lost/check_item?index=${index + 1}`)}>
        <View style={{ width: 150 }}>
          <Text style={{ fontWeight: 'bold' }}>
            候補 {index + 1}（{marker.type === 'new'
              ? '新たな落とし物'
              : marker.type === 'claimed'
              ? '主張あり'
              : '持ち帰り済み'}）
          </Text>
          <TouchableOpacity
            style={styles.calloutButton}
            onPress={() => router.push(`/lost/check_item?index=${index + 1}`)}
          >
            <Text style={styles.calloutButtonText}>チェックする</Text>
          </TouchableOpacity>
        </View>
      </Callout>
    </Marker>
  );
})}

      </MapView>

      {/* 凡例 */}
      <View style={styles.legend}>
        <Text style={{ color: 'red' }}>🔴 新たな落とし物</Text>
        <Text style={{ color: 'green' }}>🟢 主張あり</Text>
        <Text style={{ color: 'blue' }}>🔵 持ち帰り済み</Text>
      </View>

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
legend: {
    position: 'absolute',
    bottom: 100,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 10,
    borderRadius: 8,
  },

});
