import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Banner from './components/Banner';
import FeaturedFields from './components/FeaturedFields';
import Feedback from './components/Feedback';
import Footer from './components/Footer';
import HomeBlog from './components/HomeBlog';
import Chatbot from './components/ChatBot';

function App() {
    return (
        <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
            <Header />
            <Banner />
            <FeaturedFields />
            <Feedback />
            <HomeBlog />
            <Footer />
            <Chatbot />
        </div>
    );
}

export default App;
