import * as React from 'react';
import { View, StyleSheet, Animated, Pressable, Linking } from 'react-native';
import * as Location from 'expo-location';
import { Stack } from 'expo-router';
import { Locate } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { fetchNearbyCoffeeShops, type CoffeeShop } from '@/lib/coffee-shops';

// MapLibre calls TurboModuleRegistry.getEnforcing at import time — wrapping in
// a try/catch lets the route load and show a fallback in Expo Go.
type MLRN = typeof import('@maplibre/maplibre-react-native');
const ml: MLRN | null = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@maplibre/maplibre-react-native') as MLRN;
  } catch {
    return null;
  }
})();

type CameraRef = import('@maplibre/maplibre-react-native').CameraRef;

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
const PRIMARY = '#1BA74E';

export default function MapScreen() {
  const cameraRef = React.useRef<CameraRef>(null);
  const [coords, setCoords] = React.useState<[number, number] | null>(null);
  const [shops, setShops] = React.useState<CoffeeShop[]>([]);
  const [selected, setSelected] = React.useState<CoffeeShop | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [permissionError, setPermissionError] = React.useState(false);
  const slideAnim = React.useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: selected ? 0 : 300,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  }, [selected]);

  React.useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionError(true);
        setLoading(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords([pos.coords.longitude, pos.coords.latitude]);
      try {
        const results = await fetchNearbyCoffeeShops(
          pos.coords.latitude,
          pos.coords.longitude
        );
        setShops(results);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const geojson = React.useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: shops.map((s) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [s.lon, s.lat] },
        properties: { id: s.id, name: s.name, address: s.address ?? null },
      })),
    }),
    [shops]
  );

  // All hooks must run before this guard
  if (!ml) {
    return (
      <View className="flex-1 items-center justify-center gap-4 p-6">
        <Stack.Screen options={{ title: 'Nearby Coffee' }} />
        <Text className="text-center font-medium">Map requires a development build</Text>
        <Text className="text-muted-foreground text-center text-sm">
          Run: npx expo run:ios
        </Text>
      </View>
    );
  }

  // ml is narrowed to MLRN (non-null) from here
  const { Map: MapView, Camera, GeoJSONSource, Layer, UserLocation } = ml;

  function recenter() {
    if (!coords) return;
    cameraRef.current?.flyTo({ center: coords, zoom: 14, duration: 500 });
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <Stack.Screen options={{ title: 'Nearby Coffee' }} />

      {permissionError ? (
        <View className="flex-1 items-center justify-center gap-3 p-6">
          <Text className="text-muted-foreground text-center">
            Location access is needed to find coffee shops near you.
          </Text>
        </View>
      ) : (
        <MapView
          style={StyleSheet.absoluteFill}
          mapStyle={MAP_STYLE}
          attribution={false}
          logo={false}
          onPress={() => setSelected(null)}
        >
          {coords && (
            <Camera
              ref={cameraRef}
              initialViewState={{ center: coords, zoom: 14 }}
            />
          )}
          <UserLocation />
          {shops.length > 0 && (
            <GeoJSONSource
              id="shops"
              data={geojson}
              onPress={(e: any) => {
                e.stopPropagation();
                const id = e.nativeEvent.features[0]?.properties?.id as
                  | number
                  | undefined;
                setSelected(shops.find((s) => s.id === id) ?? null);
              }}
            >
              <Layer
                id="shop-halo"
                type="circle"
                filter={['==', ['get', 'id'], selected?.id ?? -1]}
                paint={{
                  'circle-color': PRIMARY,
                  'circle-radius': 14,
                  'circle-opacity': 0.15,
                }}
              />
              <Layer
                id="shop-dots"
                type="circle"
                paint={{
                  'circle-color': PRIMARY,
                  'circle-radius': 8,
                  'circle-stroke-color': '#ffffff',
                  'circle-stroke-width': 2,
                }}
              />
            </GeoJSONSource>
          )}
        </MapView>
      )}

      {/* Status badge */}
      <View className="absolute top-4 self-center">
        <View className="bg-card rounded-full px-4 py-2 shadow-sm shadow-black/10">
          <Text className="text-muted-foreground text-sm">
            {loading
              ? 'Finding coffee shops…'
              : permissionError
                ? 'Location unavailable'
                : `${shops.length} spots nearby`}
          </Text>
        </View>
      </View>

      {/* Recenter */}
      {coords && (
        <Pressable
          onPress={recenter}
          className="bg-card absolute right-4 rounded-full p-3 shadow-md shadow-black/15"
          style={{ bottom: selected ? 220 : 32 }}
        >
          <Locate size={20} color={PRIMARY} />
        </Pressable>
      )}

      {/* Detail sheet */}
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        pointerEvents={selected ? 'auto' : 'none'}
      >
        {selected && (
          <Card className="rounded-b-none rounded-t-2xl border-x-0 border-b-0 shadow-lg shadow-black/10">
            <CardHeader>
              <View className="flex-row items-start gap-3">
                <View className="flex-1">
                  <CardTitle className="text-lg leading-snug">
                    {selected.name}
                  </CardTitle>
                  {selected.address && (
                    <CardDescription>{selected.address}</CardDescription>
                  )}
                  {selected.openingHours && (
                    <CardDescription>{selected.openingHours}</CardDescription>
                  )}
                </View>
                <Button
                  variant="ghost"
                  size="icon"
                  className="-mr-1 -mt-1 h-8 w-8 rounded-full"
                  onPress={() => setSelected(null)}
                >
                  <Text className="text-muted-foreground leading-none">✕</Text>
                </Button>
              </View>
            </CardHeader>
            {(selected.phone ?? selected.website) && (
              <>
                <Separator />
                <CardContent className="flex-row gap-3 pt-4">
                  {selected.phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onPress={() => Linking.openURL(`tel:${selected.phone}`)}
                    >
                      <Text>Call</Text>
                    </Button>
                  )}
                  {selected.website && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onPress={() => Linking.openURL(selected.website!)}
                    >
                      <Text>Website</Text>
                    </Button>
                  )}
                </CardContent>
              </>
            )}
          </Card>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
