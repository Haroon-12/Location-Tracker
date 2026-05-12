import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Modal, Share } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

import { Ionicons } from '@expo/vector-icons';

const GroupScreen = () => {
    const { userInfo } = useContext(AuthContext);
    const [groups, setGroups] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [mode, setMode] = useState('create'); // 'create' or 'join'
    const [inputVal, setInputVal] = useState('');
    const [loading, setLoading] = useState(false);

    const BASE_URL = 'http://192.168.31.119:5000/api/groups';

    useEffect(() => {
        if (userInfo) fetchGroups();
    }, [userInfo]);

    const fetchGroups = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/user/${userInfo.id}`);
            setGroups(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleAction = async () => {
        setLoading(true);
        try {
            if (mode === 'create') {
                await axios.post(`${BASE_URL}/create`, { name: inputVal, userId: userInfo.id });
                Alert.alert('Success', 'Circle Created!');
            } else {
                await axios.post(`${BASE_URL}/join`, { inviteCode: inputVal, userId: userInfo.id });
                Alert.alert('Success', 'Joined Circle!');
            }
            setInputVal('');
            setModalVisible(false);
            fetchGroups();
        } catch (e) {
            Alert.alert('Error', 'Action failed. Check code or connection.');
        }
        setLoading(false);
    };

    const handleDelete = (groupId) => {
        Alert.alert(
            "Delete Circle",
            "Are you sure? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await axios.delete(`${BASE_URL}/${groupId}`, { data: { userId: userInfo.id } });
                            fetchGroups();
                        } catch (e) {
                            console.error(e);
                            Alert.alert("Error", "Could not delete group");
                        }
                    }
                }
            ]
        );
    };

    const handleShare = async (code) => {
        try {
            await Share.share({
                message: `Join my circle on Location App! Use code: ${code}`,
            });
        } catch (error) {
            alert(error.message);
        }
    };

    const renderItem = ({ item, index }) => {
        const isAdmin = item.admin && (typeof item.admin === 'string' ? item.admin === userInfo.id : item.admin._id === userInfo.id);
        return (
            <View style={styles.cardContainer}>
                <LinearGradient colors={['#ffffff', '#f8f9fa']} style={styles.card}>
                    <View style={styles.iconBg}>
                        <Text style={styles.iconText}>{item.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.groupName}>{item.name}</Text>
                        <Text style={styles.code}>{item.members ? item.members.length : 1} Members</Text>
                        <Text style={styles.code}>Code: {item.inviteCode}</Text>
                    </View>

                    <TouchableOpacity onPress={() => handleShare(item.inviteCode)} style={{ padding: 10 }}>
                        <Ionicons name="share-social-outline" size={24} color="#4c669f" />
                    </TouchableOpacity>

                    {isAdmin && (
                        <TouchableOpacity onPress={() => handleDelete(item._id)} style={{ padding: 10 }}>
                            <Ionicons name="trash-outline" size={24} color="red" />
                        </TouchableOpacity>
                    )}
                </LinearGradient>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.header}>
                <Text style={styles.headerTitle}>My Circles</Text>
                <TouchableOpacity onPress={() => { setMode('create'); setModalVisible(true); }} style={styles.addButton}>
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </LinearGradient>

            <FlatList
                data={groups}
                keyExtractor={item => item._id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />

            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.joinBtn} onPress={() => { setMode('join'); setModalVisible(true); }}>
                    <Text style={styles.joinText}>Join Existing Circle</Text>
                </TouchableOpacity>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{mode === 'create' ? 'Create New Circle' : 'Join a Circle'}</Text>
                        <Text style={styles.modalSub}>{mode === 'create' ? 'Name your circle (e.g. Family)' : 'Enter the invite code shared with you'}</Text>

                        <TextInput
                            style={styles.input}
                            placeholder={mode === 'create' ? "Circle Name" : "Invite Code"}
                            placeholderTextColor="#999"
                            value={inputVal}
                            onChangeText={setInputVal}
                        />

                        <TouchableOpacity style={styles.modalBtn} onPress={handleAction}>
                            <Text style={styles.modalBtnText}>{loading ? "Processing..." : (mode === 'create' ? "Create" : "Join")}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                            <Text style={styles.closeText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    header: { padding: 20, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: 'white' },
    addButton: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 20 },
    list: { padding: 20 },
    cardContainer: { marginBottom: 15, borderRadius: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    card: { flexDirection: 'row', padding: 20, alignItems: 'center', borderRadius: 15 },
    iconBg: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#e1e5eb', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    iconText: { fontSize: 20, fontWeight: 'bold', color: '#4c669f' },
    info: { flex: 1 },
    groupName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    code: { color: '#888', marginTop: 4, fontSize: 13, letterSpacing: 1 },
    actionRow: { padding: 20, paddingBottom: 40 },
    joinBtn: { backgroundColor: 'white', padding: 18, borderRadius: 15, alignItems: 'center', elevation: 2 },
    joinText: { color: '#4c669f', fontWeight: 'bold', fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 30, alignItems: 'center', elevation: 10 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    modalSub: { color: '#666', textAlign: 'center', marginBottom: 25 },
    input: { width: '100%', backgroundColor: '#f5f5f5', padding: 15, borderRadius: 10, marginBottom: 20, fontSize: 16 },
    modalBtn: { width: '100%', backgroundColor: '#4c669f', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
    modalBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    closeBtn: { padding: 10 },
    closeText: { color: '#999', fontWeight: '600' }
});

export default GroupScreen;
