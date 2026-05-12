import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';


const DashboardScreen = ({ navigation }) => {
    const { userInfo, logout } = useContext(AuthContext);
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (userInfo) fetchGroups();
        });
        return unsubscribe;
    }, [navigation, userInfo]);

    const fetchGroups = async () => {
        try {
            const res = await axios.get(`http://192.168.31.119:5000/api/groups/user/${userInfo.id}`);
            setGroups(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const renderGroupItem = ({ item, index }) => (
        <TouchableOpacity
            style={styles.groupItem}
            onPress={() => navigation.navigate('Map', {
                groupId: item._id,
                groupName: item.name,
                groupPlan: item.plan,
                groupExpiry: item.planExpiry,
                memberCount: item.members ? item.members.length : 1
            })}
        >
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{item.name}</Text>
                <Text style={styles.lastMsg}>{item.members ? item.members.length : 1} Members • Tap to view</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.header}>
                <Text style={styles.headerTitle}>Circles</Text>
                <TouchableOpacity onPress={logout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </LinearGradient>

            <FlatList
                data={groups}
                keyExtractor={(item) => item._id}
                renderItem={renderGroupItem}
                contentContainerStyle={styles.list}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('Groups')}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f0f0' },
    header: { padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: 'white' },
    logoutText: { color: 'white', fontWeight: 'bold' },
    list: { padding: 10 },
    groupItem: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, alignItems: 'center', elevation: 2 },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    avatarText: { fontSize: 20, fontWeight: 'bold', color: '#555' },
    groupInfo: { flex: 1 },
    groupName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    lastMsg: { color: '#888', marginTop: 2 },
    time: { color: '#aaa', fontSize: 12 },
    fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#4c669f', justifyContent: 'center', alignItems: 'center', elevation: 5 },
    fabText: { fontSize: 30, color: 'white', fontWeight: 'bold' }
});

export default DashboardScreen;
