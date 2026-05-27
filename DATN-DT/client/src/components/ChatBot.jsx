import { useState, useRef, useEffect } from 'react';
import { Button, Input, Spin, Badge, Tooltip, Typography } from 'antd';
import { SendOutlined, CloseOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import { useStore } from '../hooks/useStore';
import { useNavigate } from 'react-router-dom';
import { requestChatbot, requestGetMessageChatbot } from '../config/UserRequest';

const { Text } = Typography;

function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const { dataUser } = useStore();
    const navigate = useNavigate();

    // Quick questions
    const quickQuestions = [
        { icon: '💰', text: 'Giá thuê sân' },
        { icon: '⏰', text: 'Giờ mở cửa' },
        { icon: '📅', text: 'Khung giờ trống hôm nay' },
        { icon: '📋', text: 'Cách đặt sân' },
    ];

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: 'nearest',
            });
        }, 100);
    };

    useEffect(() => {
        const fetchMessageChatbot = async () => {
            try {
                const res = await requestGetMessageChatbot();
                setMessages(res.metadata);
            } catch (error) {
                console.error('Error fetching messages:', error);
                setMessages([
                    {
                        _id: 'welcome',
                        sender: 'bot',
                        content:
                            '⚽ Xin chào! Tôi là SânBóngBot\n\nTôi có thể giúp bạn:\n• Xem giá thuê sân\n• Thông tin giờ mở cửa\n• Hướng dẫn đặt sân\n• Gợi ý khung giờ trống\n\nHãy hỏi tôi bất cứ điều gì! 😊',
                        timestamp: new Date(),
                    },
                ]);
            }
        };
        if (!dataUser._id) return;
        fetchMessageChatbot();
    }, [dataUser._id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!isLoading) {
            scrollToBottom();
        }
    }, [isLoading]);

    useEffect(() => {
        if (isOpen && messages.length > 0) {
            scrollToBottom();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0);
        }
    }, [isOpen]);

    const handleSend = async (customMessage = null) => {
        const messageToSend = customMessage || inputValue;
        if (!messageToSend.trim()) return;

        if (!dataUser._id) {
            const shouldLogin = window.confirm(
                '🔐 Bạn cần đăng nhập để sử dụng chatbot. Bạn có muốn đăng nhập ngay bây giờ không?',
            );
            if (shouldLogin) {
                navigate('/login');
            }
            return;
        }

        const userMessage = {
            _id: Date.now().toString(),
            sender: 'user',
            content: messageToSend,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        setTimeout(() => scrollToBottom(), 50);

        try {
            const res = await requestChatbot({ question: messageToSend });

            const botMessage = {
                _id: (Date.now() + 1).toString(),
                sender: 'bot',
                content: res.metadata,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMessage]);

            setTimeout(() => scrollToBottom(), 100);

            if (!isOpen) {
                setUnreadCount((prev) => prev + 1);
            }
        } catch (error) {
            const errorMessage = {
                _id: (Date.now() + 1).toString(),
                sender: 'bot',
                content: '❌ Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);

            setTimeout(() => scrollToBottom(), 100);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen ? (
                <div
                    className="rounded-3xl shadow-2xl w-[380px] h-[600px] flex flex-col overflow-hidden"
                    style={{
                        background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}
                >
                    {/* Header */}
                    <div className="relative p-4">
                        <div
                            className="absolute inset-0"
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                opacity: 0.9,
                            }}
                        />
                        <div className="relative flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        backdropFilter: 'blur(10px)',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                    }}
                                >
                                    ⚽
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg tracking-wide">SânBóngBot</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                        <span className="text-green-300 text-xs">Đang hoạt động</span>
                                    </div>
                                </div>
                            </div>
                            <Button
                                type="text"
                                icon={<CloseOutlined />}
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center"
                            />
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        className="flex-1 overflow-y-auto p-4 space-y-4"
                        style={{
                            background: 'linear-gradient(180deg, rgba(26,26,46,0.95) 0%, rgba(15,52,96,0.95) 100%)',
                        }}
                    >
                        {messages.map((message, index) => (
                            <div
                                key={message._id || index}
                                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`flex items-end gap-2 max-w-[85%] ${
                                        message.sender === 'user' ? 'flex-row-reverse' : ''
                                    }`}
                                >
                                    {message.sender === 'bot' && (
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                                            style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            }}
                                        >
                                            ⚽
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <div
                                            className={`rounded-2xl px-4 py-3 ${
                                                message.sender === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'
                                            }`}
                                            style={
                                                message.sender === 'user'
                                                    ? {
                                                          background:
                                                              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                          color: 'white',
                                                      }
                                                    : {
                                                          background: 'rgba(255,255,255,0.08)',
                                                          border: '1px solid rgba(255,255,255,0.1)',
                                                          color: '#e0e0e0',
                                                      }
                                            }
                                        >
                                            <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                                {message.content}
                                            </p>
                                        </div>
                                        <Text
                                            className={`text-xs mt-1 opacity-60 ${
                                                message.sender === 'user' ? 'text-right' : 'text-left'
                                            }`}
                                            style={{ color: '#888' }}
                                        >
                                            {formatTime(message.timestamp)}
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex items-end gap-2">
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                                        style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        }}
                                    >
                                        ⚽
                                    </div>
                                    <div
                                        className="rounded-2xl rounded-bl-sm px-4 py-3"
                                        style={{
                                            background: 'rgba(255,255,255,0.08)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1">
                                                <span
                                                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                                                    style={{ animationDelay: '0ms' }}
                                                ></span>
                                                <span
                                                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                                                    style={{ animationDelay: '150ms' }}
                                                ></span>
                                                <span
                                                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                                                    style={{ animationDelay: '300ms' }}
                                                ></span>
                                            </div>
                                            <Text className="text-gray-400 text-sm">Đang suy nghĩ...</Text>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-1" />
                    </div>

                    {/* Quick Questions */}
                    {messages.length <= 1 && (
                        <div className="px-4 py-2 flex gap-2 flex-wrap" style={{ background: 'rgba(15,52,96,0.9)' }}>
                            {quickQuestions.map((q, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSend(q.text)}
                                    className="px-3 py-1.5 rounded-full text-xs transition-all duration-200 hover:scale-105"
                                    style={{
                                        background: 'rgba(102,126,234,0.2)',
                                        border: '1px solid rgba(102,126,234,0.4)',
                                        color: '#a5b4fc',
                                    }}
                                >
                                    {q.icon} {q.text}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div
                        className="p-4"
                        style={{
                            background: 'rgba(15,52,96,0.95)',
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        <div
                            className="flex items-center gap-2 p-2 rounded-2xl"
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}
                        >
                            <Input.TextArea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Nhập câu hỏi của bạn..."
                                autoSize={{ minRows: 1, maxRows: 3 }}
                                className="flex-1 border-0 bg-transparent text-white placeholder-gray-500 focus:shadow-none"
                                style={{
                                    background: 'transparent',
                                    color: 'white',
                                    resize: 'none',
                                }}
                                disabled={isLoading}
                            />
                            <Button
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={() => handleSend()}
                                disabled={isLoading || !inputValue.trim()}
                                className="rounded-xl w-10 h-10 flex items-center justify-center border-0"
                                style={{
                                    background: inputValue.trim()
                                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                        : 'rgba(255,255,255,0.1)',
                                }}
                            />
                        </div>
                        {!dataUser._id && (
                            <Text className="text-xs text-orange-400 mt-2 block text-center">
                                🔐 Đăng nhập để sử dụng đầy đủ tính năng
                            </Text>
                        )}
                    </div>
                </div>
            ) : (
                <Tooltip title="Chat với SânBóngBot" placement="left">
                    <div className="relative">
                        <button
                            onClick={() => setIsOpen(true)}
                            className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-110 group"
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                boxShadow: '0 8px 32px rgba(102,126,234,0.4)',
                            }}
                        >
                            <span className="text-3xl group-hover:animate-bounce">⚽</span>
                        </button>
                        {unreadCount > 0 && (
                            <Badge
                                count={unreadCount}
                                className="absolute -top-1 -right-1"
                                style={{ backgroundColor: '#ef4444' }}
                            />
                        )}
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse border-2 border-white"></div>
                    </div>
                </Tooltip>
            )}
        </div>
    );
}

export default Chatbot;
