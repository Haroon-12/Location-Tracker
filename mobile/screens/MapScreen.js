import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Dimensions, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const MapScreen = ({ navigation, route }) => {
    const { userInfo } = useContext(AuthContext);
    const { groupId, groupName, groupPlan, groupExpiry, memberCount } = route.params || { groupId: 'global_test_group', groupName: 'Global', groupPlan: 'none' };
    const [location, setLocation] = useState(null);
    const [groupLocations, setGroupLocations] = useState({}); // { userId: { latitude, longitude, name } }
    const [socket, setSocket] = useState(null);
    const [tracking, setTracking] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const hasIndividualPlan = userInfo.subscription && userInfo.subscription !== 'free';
    const hasGroupPlan = groupPlan && groupPlan !== 'none' && groupPlan !== 'free';

    const mapRef = useRef(null);

    // Helper to generate initials. Handles "A" vs "An" collision logic dynamically
    const getInitials = (name, allNames) => {
        if (!name) return "?";
        const firstChar = name.charAt(0).toUpperCase();
        // Check collision
        const collision = allNames.filter(n => n && n.toUpperCase().startsWith(firstChar) && n !== name).length > 0;
        if (collision) {
            return name.substring(0, 2).toUpperCase();
        }
        return firstChar;
    };

    const mapStyle = [
        { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
        { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
        { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
        { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
        { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
        { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }] },
        { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }] },
        { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
        { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
        { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
        { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#746855" }] },
        { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }] },
        { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#f3d19c" }] },
        { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#2f3948" }] },
        { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
        { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] },
        { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] },
        { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }
    ];

    useEffect(() => {
        const newSocket = io('http://192.168.31.119:5000');
        setSocket(newSocket);

        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let initialLoc = await Location.getCurrentPositionAsync({});
            setLocation(initialLoc);

            if (newSocket) {
                newSocket.emit('join_group', groupId);
            }
        })();

        return () => newSocket.disconnect();
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('receive_location', (data) => {
            // data: { userId, latitude, longitude, name }
            if (data.userId !== userInfo.id) {
                setGroupLocations(prev => ({
                    ...prev,
                    [data.userId]: {
                        latitude: data.latitude,
                        longitude: data.longitude,
                        name: data.name,
                        updatedAt: new Date()
                    }
                }));
            }
        });

        return () => {
            socket.off('receive_location');
        };
    }, [socket]);

    useEffect(() => {
        if (tracking && location && socket && userInfo) {
            socket.emit('send_location', {
                groupId: groupId,
                userId: userInfo.id,
                name: userInfo.name, // Sending Name
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });
        }
    }, [location, tracking]);

    useEffect(() => {
        let subscriber = null;
        const startWatching = async () => {
            subscriber = await Location.watchPositionAsync({
                accuracy: Location.Accuracy.High,
                timeInterval: 3000,
                distanceInterval: 5
            }, (loc) => {
                setLocation(loc);
            });
        };

        if (tracking) {
            startWatching();
        } else {
            if (subscriber) subscriber.remove();
        }

        return () => {
            if (subscriber) subscriber.remove();
        };
    }, [tracking]);

    const focusUser = (coords) => {
        if (mapRef.current && coords) {
            mapRef.current.animateToRegion({
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            }, 800);
        }
    };

    const handleSOS = () => {
        if (socket) {
            socket.emit('sos_alert', { groupId: groupId, userId: userInfo.id });
            alert("SOS SENT!");
        }
    };

    // Prepare list data
    // Combine "You" (if tracking) + others in groupLocations
    const allNames = [
        ...(tracking ? [userInfo.name] : []),
        ...Object.values(groupLocations).map(u => u.name)
    ];

    const activeUsers = Object.keys(groupLocations).map(userId => ({
        userId,
        ...groupLocations[userId],
        isMe: false
    }));

    if (tracking && location) {
        activeUsers.unshift({
            userId: userInfo.id,
            name: userInfo.name,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            isMe: true,
            updatedAt: new Date()
        });
    }

    const renderMarker = (user) => {
        const initials = getInitials(user.name, allNames);
        return (
            <Marker
                key={user.userId}
                coordinate={{ latitude: user.latitude, longitude: user.longitude }}
                title={user.name}
            >
                <View style={[styles.markerCircle, user.isMe && styles.myMarker]}>
                    <Text style={styles.markerText}>{initials}</Text>
                </View>
                <View style={styles.markerArrow} />
            </Marker>
        );
    };

    const renderListItem = ({ item }) => {
        const initials = getInitials(item.name, allNames);
        return (
            <TouchableOpacity
                style={styles.listItem}
                onPress={() => focusUser({ latitude: item.latitude, longitude: item.longitude })}
            >
                <View style={[styles.listAvatar, item.isMe && styles.myListAvatar]}>
                    <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={styles.listInfo}>
                    <Text style={styles.listName}>{item.isMe ? "You" : item.name}</Text>
                    <Text style={styles.listStatus}>
                        {item.isMe
                            ? (tracking ? "Sharing Live Location" : "Not Sharing")
                            : "Live now"}
                    </Text>
                </View>
                {item.isMe && tracking && (
                    <TouchableOpacity onPress={() => setTracking(false)}>
                        <Text style={styles.stopText}>Stop</Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {location ? (
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    customMapStyle={mapStyle}
                    pitchEnabled={true}
                    showsBuildings={true}
                    showsIndoors={true}
                    initialRegion={{
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    showsUserLocation={true}
                    showsMyLocationButton={false}
                >
                    {activeUsers.map(user => renderMarker(user))}
                </MapView>
            ) : (
                <Text style={styles.loading}>{errorMsg || 'Loading location...'}</Text>
            )
            }

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{groupName}</Text>
            </View>

            {/* SOS Button (Moved up slightly to accommodate sheet) */}
            <TouchableOpacity style={styles.sosButton} onPress={handleSOS}>
                <Text style={styles.sosText}>SOS</Text>
            </TouchableOpacity>

            {/* Bottom Sheet List */}
            <View style={styles.bottomSheet}>
                <View style={styles.sheetHandle} />
                <Text style={styles.sheetTitle}>Live Location</Text>

                {activeUsers.length === 0 && !tracking ? (
                    <View style={styles.emptyState}>
                        <Text style={{ color: '#666', marginBottom: 10 }}>No one is sharing location.</Text>
                        <TouchableOpacity
                            style={styles.startShareBtn}
                            onPress={() => {
                                // Admin Override (System Admin)
                                if (userInfo.isAdmin) {
                                    setTracking(true); // Always start tracking if admin
                                    return;
                                }

                                // Assuming hasIndividualPlan and hasGroupPlan are defined elsewhere
                                // and userInfo is available.
                                if (hasIndividualPlan || hasGroupPlan) {
                                    setTracking(true); // Start tracking if user has a plan
                                } else {
                                    alert("You need an active plan to share your location.");
                                    // Or navigate to a plan purchase screen
                                }
                            }}
                        >
                            <Text style={styles.startShareText}>Share My Location</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={activeUsers}
                        keyExtractor={item => item.userId}
                        renderItem={renderListItem}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        style={{ maxHeight: 250 }}
                    />
                )}
                {/* Floating Start Button if list is populated but I am not sharing */}
                {!tracking && activeUsers.length > 0 && (
                    <TouchableOpacity
                        style={[styles.floatingStartBtn]}
                        onPress={() => setTracking(true)}
                    >
                        <Ionicons name="location-outline" size={20} color="white" />
                        <Text style={styles.startShareText}> Tap to Share</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View >
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { width: '100%', height: '100%' },
    loading: { flex: 1, textAlign: 'center', textAlignVertical: 'center' },
    header: {
        position: 'absolute',
        top: 50,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 10,
        borderRadius: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    backButton: { marginRight: 10 },
    headerTitle: { fontWeight: 'bold', fontSize: 16, color: '#333' },

    // Custom Marker
    markerCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#4c669f',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
        elevation: 5,
    },
    myMarker: {
        backgroundColor: '#F44336', // Different color for me
    },
    markerText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    markerArrow: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderBottomWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#4c669f', // Match marker color
        transform: [{ rotate: '180deg' }],
        alignSelf: 'center',
        marginTop: -2,
    },

    sosButton: {
        position: 'absolute',
        bottom: 300, // Higher up now
        right: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        borderWidth: 2,
        borderColor: 'white',
        zIndex: 10
    },
    sosText: { color: 'white', fontWeight: 'bold', fontSize: 12 },

    // Bottom Sheet
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        elevation: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        maxHeight: '40%'
    },
    sheetHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#ddd',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 10
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    listAvatar: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#e1e5eb',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    myListAvatar: {
        backgroundColor: '#ffebee', // Light red for me
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#555'
    },
    listInfo: {
        flex: 1
    },
    listName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
    },
    listStatus: {
        fontSize: 13,
        color: '#888'
    },
    stopText: {
        color: 'red',
        fontWeight: 'bold',
        padding: 5
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 20
    },
    startShareBtn: {
        backgroundColor: '#4c669f',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        elevation: 2
    },
    startShareText: {
        color: 'white',
        fontWeight: 'bold'
    },
    floatingStartBtn: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#4c669f',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 30,
        elevation: 5
    }
});

export default MapScreen;
