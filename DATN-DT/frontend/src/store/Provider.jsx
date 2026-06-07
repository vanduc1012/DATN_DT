import Context from './Context';
import CryptoJS from 'crypto-js';
import cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { requestAuth } from '../config/UserRequest';
import { ToastContainer } from 'react-toastify';
export function Provider({ children }) {
    const [dataUser, setDataUser] = useState({});
    const [authChecked, setAuthChecked] = useState(false);

    const fetchAuth = async () => {
        try {
            const res = await requestAuth();
            if (!res.metadata) {
                console.error('Auth response missing metadata');
                cookies.remove('logged');
                return;
            }
            const secret = import.meta.env.VITE_SECRET_CRYPTO;
            if (!secret) {
                console.error('VITE_SECRET_CRYPTO not configured');
                return;
            }
            const bytes = CryptoJS.AES.decrypt(res.metadata, secret);
            const originalText = bytes.toString(CryptoJS.enc.Utf8);
            if (!originalText) {
                console.error('Failed to decrypt user data');
                cookies.remove('logged');
                return;
            }
            const user = JSON.parse(originalText);
            setDataUser(user);
        } catch (error) {
            cookies.remove('logged');
        } finally {
            setAuthChecked(true);
        }
    };

    useEffect(() => {
        fetchAuth();
    }, []);

    return (
        <Context.Provider
            value={{
                dataUser,
                fetchAuth,
                authChecked,
            }}
        >
            {children}
            <ToastContainer />
        </Context.Provider>
    );
}
