import {useEffect} from 'react';
import axios from 'axios';
import {useAuth} from '@features/auth/context/AuthContext';

const AuthInterceptor = () => {
    const {getAccessToken} = useAuth();

    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            (config: any) => {
                const token = getAccessToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error: any) => Promise.reject(error)
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
        };
    }, [getAccessToken]);

    return null; // This component doesn't render anything
};

export default AuthInterceptor;
