import { Outlet } from 'react-router-dom';
import Chatbot from '../components/ChatBot';

function RootLayout() {
    return (
        <>
            <Outlet />
            <Chatbot />
        </>
    );
}

export default RootLayout;
