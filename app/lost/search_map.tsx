// app/lost/search-map.tsx

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
// 各ピンにカスタム吹き出しを追加する。
import { Callout } from 'react-native-maps';
// 

type MarkerType = 'new' | 'claimed' | 'taken'

type MarkerData = {
  id: number;
  latitude: number;
  longitude: number;
  location_notes: string;
  image_url: string | null;
};

export default function SearchMapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const { latitude, longitude, lost_item_id } = useLocalSearchParams();
  console.log("lost_item_id (from search_map):", lost_item_id);


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
    const fetchMarkers = async () => {
      try {

        const res = await fetch(`https://fc59-2400-4150-9180-b500-8891-8d59-e8f4-33ed.ngrok-free.app/api/matched-found-items?lost_item_id=${lost_item_id}`, {
          method: 'GET'
        });
        if (!res.ok) {
          console.error('❌ HTTPエラー', res.status);
          return;
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error('❌ 不正な形式のレスポンス:', data);
          return;
        }

        setMarkers(data);
      } catch (error) {
        console.error('❌ ネットワークまたはJSONパースエラー:', error);
      }
    };

    if (!lost_item_id) return;

    const timeout = setTimeout(() => {
      fetchMarkers();
      console.log("Markers:", markers);
    }, 300);

    return () => clearTimeout(timeout);
}, [lost_item_id]);


  return (
    <View style={styles.container}>
      <MapView ref={mapRef} style={styles.map} initialRegion={center} key={markers.length}>
        {markers.map((marker, index) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
          >
            <Callout onPress={() => router.push(`/lost/check_item?id=${marker.id}`)}>
              <View style={{ width: 200 }}>
                {marker.image_url && (
                  <Image
                    source={{ uri: `https://fc59-2400-4150-9180-b500-8891-8d59-e8f4-33ed.ngrok-free.app/${marker.image_url}` }}
                    style={{ width: '100%', height: 100, borderRadius: 6, marginBottom: 8 }}
                    resizeMode="cover"
                  />
                )}
                <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Found:</Text>
                <Text numberOfLines={3}>{marker.location_notes}</Text>
                <TouchableOpacity
                  style={styles.calloutButton}
                  onPress={() => router.push(`/lost/check_item?id=${marker.id}`)}
                >
                  <Text style={styles.calloutButtonText}>チェックする</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}
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

      <TouchableOpacity style={styles.registerButton} onPress={() => router.push('/lost/register')}>
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
