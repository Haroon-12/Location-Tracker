import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Use machine's LAN IP address
    const BASE_URL = 'http://192.168.31.119:5000/api';

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const res = await axios.post(`${BASE_URL}/auth/login`, {
                email,
                password
            });
            setUserToken(res.data.token);
            setUserInfo(res.data.user);
            AsyncStorage.setItem('userToken', res.data.token);
            AsyncStorage.setItem('userInfo', JSON.stringify(res.data.user));
        } catch (e) {
            console.log(`Login error ${e}`);
            alert('Login failed');
        }
        setIsLoading(false);
    };

    const register = async (name, email, password) => {
        setIsLoading(true);
        try {
            const res = await axios.post(`${BASE_URL}/auth/register`, {
                name,
                email,
                password
            });
            setUserToken(res.data.token);
            setUserInfo(res.data.user);
            AsyncStorage.setItem('userToken', res.data.token);
            AsyncStorage.setItem('userInfo', JSON.stringify(res.data.user));
        } catch (e) {
            console.log(`Register error ${e}`);
            alert('Registration failed');
        }
        setIsLoading(false);
    };

    const logout = () => {
        setIsLoading(true);
        setUserToken(null);
        AsyncStorage.removeItem('userToken');
        AsyncStorage.removeItem('userInfo');
        setIsLoading(false);
    };

    const isLoggedIn = async () => {
        try {
            setIsLoading(true);
            let userToken = await AsyncStorage.getItem('userToken');
            let userInfo = await AsyncStorage.getItem('userInfo');
            setUserToken(userToken);
            setUserInfo(userInfo ? JSON.parse(userInfo) : null);
            setIsLoading(false);
        } catch (e) {
            console.log(`isLogged in error ${e}`);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        <AuthContext.Provider value={{ login, logout, register, isLoading, userToken, userInfo }}>
            {children}
        </AuthContext.Provider>
    );
};
