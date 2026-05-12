import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import axios from 'axios';

const HistoryScreen = ({ route }) => {
    const userId = route.params?.userId || null;
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`http://192.168.31.119:5000/api/location/${userId}`);
            setHistory(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    if (history.length === 0) return <View style={styles.container} />;

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: history[0].latitude,
                    longitude: history[0].longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                <Polyline
                    coordinates={history.map(loc => ({ latitude: loc.latitude, longitude: loc.longitude }))}
                    strokeColor="#000"
                    strokeWidth={3}
                />
                {history.length > 0 && (
                    <Marker coordinate={{ latitude: history[0].latitude, longitude: history[0].longitude }} title="Latest" />
                )}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { width: '100%', height: '100%' }
});

export default HistoryScreen;
