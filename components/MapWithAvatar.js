import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView from 'react-native-maps';

export default function MapWithAvatar() {
  const [position, setPosition] = useState(null);
  const [heading, setHeading] = useState(0);
  const [isMapTouched, setIsMapTouched] = useState(false);
  const mapRef = useRef(null);
  const router = useRouter();
  const touchTimeout = useRef(null);


  useEffect(() => {
    let locationSubscription = null;
    let headingSubscription = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setPosition({ latitude, longitude });

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 1,
        },
        (loc) => {
          const { latitude, longitude } = loc.coords;
          setPosition({ latitude, longitude });
        }
      );

      headingSubscription = await Location.watchHeadingAsync((hdg) => {
        setHeading(hdg.trueHeading ?? hdg.magHeading);
      });
    })();

    return () => {
      if (locationSubscription) locationSubscription.remove();
      if (headingSubscription) headingSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (position && mapRef.current && !isMapTouched) {
      mapRef.current.animateToRegion({
        ...position,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
  }, [position, isMapTouched]);

  const handleMapTouch = () => {
    setIsMapTouched(true);
    if (touchTimeout.current) clearTimeout(touchTimeout.current);
    touchTimeout.current = setTimeout(() => {
      setIsMapTouched(false);
    }, 10000); // 10秒後に自動で現在地追尾を再開
  };

  const handleLostPress = () => router.push('/lost/search');
  const handleFoundPress = () => router.push('/found/register');
  const handleTalkPress = () => router.push('/chat');
  const handleSettingsPress = () => router.push('/settings');

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={true}
        showsCompass={false}
        showsMyLocationButton={false}
        initialRegion={
          position
            ? {
                ...position,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }
            : undefined
        }
        onRegionChange={handleMapTouch}
      />

      <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
        <Ionicons name="settings-outline" size={28} color="#333" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.compassButton} onPress={() => {
        if (position && mapRef.current) {
          setIsMapTouched(false); // 手動リセット
          mapRef.current.animateToRegion({
            ...position,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }, 500);
        }
      }}>
        <Animated.View style={{ transform: [{ rotate: `${heading}deg` }] }}>
          <Ionicons name="compass-outline" size={26} color="#fff" />
        </Animated.View>
      </TouchableOpacity>

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

  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
