import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal, FlatList } from 'react-native';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const SubscriptionScreen = ({ navigation }) => {
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const { userInfo } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [adminGroups, setAdminGroups] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null); // { amount, name }

    useEffect(() => {
        if (userInfo) fetchAdminGroups();
    }, [userInfo]);

    const fetchAdminGroups = async () => {
        try {
            const res = await axios.get(`http://192.168.31.119:5000/api/groups/user/${userInfo.id}`);
            // Filter only groups where user is admin
            const admins = res.data.filter(g =>
                (typeof g.admin === 'string' && g.admin === userInfo.id) ||
                (g.admin._id && g.admin._id === userInfo.id)
            );
            setAdminGroups(admins);
        } catch (e) {
            console.error("Failed to fetch groups", e);
        }
    };

    const fetchPaymentSheetParams = async (amount, metadata = {}) => {
        const response = await fetch('http://192.168.31.119:5000/api/subscription/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: amount,
                currency: 'usd',
                metadata: { userId: userInfo.id, ...metadata }
            }),
        });
        const { clientSecret } = await response.json();
        return { clientSecret };
    };

    const initializePaymentSheet = async (amount, metadata) => {
        const { clientSecret } = await fetchPaymentSheetParams(amount, metadata);

        const { error } = await initPaymentSheet({
            paymentIntentClientSecret: clientSecret,
            merchantDisplayName: 'LocationApp',
        });
        if (!error) {
            setLoading(true);
        }
    };

    const openPaymentSheet = async (amount, planName, groupId = null) => {
        await initializePaymentSheet(amount, { plan: planName, groupId });
        const { error } = await presentPaymentSheet();

        if (error) {
            Alert.alert(`Error code: ${error.code}`, error.message);
        } else {
            // Confirm on backend
            try {
                await axios.post('http://192.168.31.119:5000/api/subscription/confirm', {
                    userId: userInfo.id,
                    plan: planName,
                    groupId: groupId
                });
                Alert.alert('Success', 'Subscription Activated!');
            } catch (e) {
                Alert.alert('Error', 'Payment successful but activation failed. Contact support.');
            }
        }
    };

    const handleGroupBuy = (amount, planName) => {
        if (adminGroups.length === 0) {
            Alert.alert("No Groups", "You must be an admin of a group to buy a group plan.");
            return;
        }
        setSelectedPlan({ amount, planName });
        setModalVisible(true);
    };

    const PlanCard = ({ title, price, duration, color, amount, planName, isGroup }) => (
        <TouchableOpacity
            onPress={() => isGroup ? handleGroupBuy(amount, planName) : openPaymentSheet(amount, planName)}
            activeOpacity={0.8}
        >
            <LinearGradient colors={color} style={styles.card}>
                <Text style={styles.planTitle}>{title}</Text>
                <Text style={styles.planPrice}>{price}</Text>
                <Text style={styles.planDuration}>{duration}</Text>
                <View style={styles.btn}>
                    <Text style={styles.btnText}>Subscribe</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <StripeProvider publishableKey="pk_test_placeholder">
            <View style={styles.container}>
                <Text style={styles.header}>Unlock Premium</Text>

                <ScrollView contentContainerStyle={styles.scroll}>
                    <Text style={styles.sectionHeader}>Individual Plans</Text>
                    <PlanCard
                        title="Weekly"
                        price="$7"
                        duration="per week"
                        color={['#4facfe', '#00f2fe']}
                        amount={700}
                        planName="individual_weekly"
                    />
                    <PlanCard
                        title="Monthly"
                        price="$25"
                        duration="per month"
                        color={['#43e97b', '#38f9d7']}
                        amount={2500}
                        planName="individual_monthly"
                    />
                    <PlanCard
                        title="Yearly"
                        price="$275"
                        duration="per year"
                        color={['#fa709a', '#fee140']}
                        amount={27500}
                        planName="individual_yearly"
                    />

                    <Text style={styles.sectionHeader}>Duo Plans (2 People)</Text>
                    <Text style={styles.subHeader}>Perfect for couples or best friends.</Text>
                    <PlanCard
                        title="Duo Monthly"
                        price="$35"
                        duration="per month"
                        color={['#f093fb', '#f5576c']}
                        amount={3500}
                        planName="duo_monthly"
                        isGroup={true}
                    />
                    <PlanCard
                        title="Duo Yearly"
                        price="$349"
                        duration="per year"
                        color={['#f093fb', '#f5576c']}
                        amount={34900}
                        planName="duo_yearly"
                        isGroup={true}
                    />

                    <Text style={styles.sectionHeader}>Family Plans (Up to 5)</Text>
                    <Text style={styles.subHeader}>Complete safety for the whole family.</Text>
                    <PlanCard
                        title="Family Monthly"
                        price="$110"
                        duration="per month"
                        color={['#8ec5fc', '#e0c3fc']}
                        amount={11000}
                        planName="family_monthly"
                        isGroup={true}
                    />
                    <PlanCard
                        title="Family Yearly"
                        price="$1250"
                        duration="per year"
                        color={['#8ec5fc', '#e0c3fc']}
                        amount={125000}
                        planName="family_yearly"
                        isGroup={true}
                    />
                </ScrollView>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Select a Circle</Text>
                            <Text style={styles.modalSub}>Which group do you want to upgrade?</Text>

                            <FlatList
                                data={adminGroups}
                                keyExtractor={item => item._id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.groupItem}
                                        onPress={() => {
                                            setModalVisible(false);
                                            openPaymentSheet(selectedPlan.amount, selectedPlan.planName, item._id);
                                        }}
                                    >
                                        <Text style={styles.groupName}>{item.name}</Text>
                                        <Ionicons name="chevron-forward" size={20} color="#666" />
                                    </TouchableOpacity>
                                )}
                            />

                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                                <Text style={styles.closeText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </StripeProvider>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
    header: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
    sectionHeader: { fontSize: 22, fontWeight: 'bold', marginLeft: 20, marginTop: 20, marginBottom: 10, color: '#333' },
    subHeader: { fontSize: 16, color: '#666', marginLeft: 20, marginBottom: 15 },
    scroll: { paddingHorizontal: 20, paddingBottom: 50 },
    card: { padding: 25, borderRadius: 20, marginBottom: 20, alignItems: 'center', elevation: 5 },
    planTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 5 },
    planPrice: { fontSize: 36, fontWeight: 'bold', color: 'white', marginBottom: 5 },
    planDuration: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 20 },
    btn: { backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25 },
    btnText: { fontWeight: 'bold', fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 30, maxHeight: '60%' },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
    modalSub: { color: '#666', textAlign: 'center', marginBottom: 20 },
    groupItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', justifyContent: 'space-between' },
    groupName: { fontSize: 18, fontWeight: '500' },
    closeBtn: { marginTop: 20, alignSelf: 'center', padding: 10 },
    closeText: { color: 'red', fontWeight: 'bold' }
});

export default SubscriptionScreen;
