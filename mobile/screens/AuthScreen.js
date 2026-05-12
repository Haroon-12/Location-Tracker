import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';

const AuthScreen = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, register } = useContext(AuthContext);

    const handleSubmit = () => {
        if (isLogin) {
            login(email, password);
        } else {
            register(name, email, password);
        }
    };

    return (
        <LinearGradient
            colors={['#4c669f', '#3b5998', '#192f6a']}
            style={styles.container}
        >
            <View style={styles.card}>
                <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Join Us'}</Text>

                {!isLogin && (
                    <TextInput
                        placeholder="Full Name"
                        placeholderTextColor="#aaa"
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                    />
                )}

                <TextInput
                    placeholder="Email Address"
                    placeholderTextColor="#aaa"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                />

                <TextInput
                    placeholder="Password"
                    placeholderTextColor="#aaa"
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>{isLogin ? "Login" : "Sign Up"}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                    <Text style={styles.switchText}>
                        {isLogin ? "New here? Create an account" : "Already have an account? Login"}
                    </Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    card: { backgroundColor: 'white', padding: 30, borderRadius: 20, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#333' },
    input: { backgroundColor: '#f0f0f0', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
    button: { backgroundColor: '#4c669f', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    switchText: { marginTop: 20, color: '#4c669f', textAlign: 'center', fontWeight: '600' }
});

export default AuthScreen;
