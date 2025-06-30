

import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import UserService from '../service/userService';

const ChatButton = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [stompClient, setStompClient] = useState(null);
    const [connecting, setConnecting] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messageAreaRef = useRef(null);

    const colors = [
        '#4F46E5', '#06B6D4', '#10B981', '#F59E0B',
        '#EF4444', '#8B5CF6', '#F97316', '#84CC16'
    ];

    useEffect(() => {
        if (isChatOpen && !stompClient && UserService.isLoggedIn()) {
            connect();
        }
        return () => {
            if (stompClient) {
                stompClient.deactivate();
            }
        };
    }, [isChatOpen, stompClient]);

    const connect = () => {
        const user = {
            username: UserService.getUsername(),
            fullName: UserService.getFullName(),
            accountId: UserService.getAccountId()
        };
        if (!user.username) return;

        setUsername(user.username);
        setConnecting(true);

        const socket = new SockJS('http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${UserService.getToken()}`,
            },
            debug: (str) => console.log(str),
            onConnect: () => {
                setConnecting(false);
                setStompClient(client);
                client.subscribe('/topic/public', (payload) => onMessageReceived(payload));
                client.publish({
                    destination: '/app/chat.sendMessage',
                    body: JSON.stringify({ sender: user.username, type: 'JOIN' })
                });
            },
            onStompError: (error) => {
                console.error('Lỗi kết nối WebSocket:', error);
                setConnecting(false);
                alert('Không thể kết nối đến server chat. Vui lòng thử lại!');
            }
        });
        client.activate();
    };

    const onMessageReceived = (payload) => {
        const message = JSON.parse(payload.body);
        setMessages((prev) => [...prev, message]);
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (messageInput.trim() && stompClient) {
            const chatMessage = {
                sender: username,
                content: messageInput,
                type: 'CHAT'
            };
            stompClient.publish({
                destination: '/app/chat.sendMessage',
                body: JSON.stringify(chatMessage)
            });
            setMessageInput('');
        }
    };

    const getAvatarColor = (sender) => {
        let hash = 0;
        for (let i = 0; i < sender.length; i++) {
            hash = 31 * hash + sender.charCodeAt(i);
        }
        return colors[Math.abs(hash % colors.length)];
    };

    const handleInputChange = (e) => {
        setMessageInput(e.target.value);
        // Simulate typing indicator
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 1000);
    };

    useEffect(() => {
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    }, [messages]);

    if (!UserService.isLoggedIn()) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Button with enhanced design */}
            <button
                className={`relative bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transform transition-all duration-300 ${
                    isChatOpen ? 'rotate-180' : ''
                }`}
                onClick={() => setIsChatOpen(!isChatOpen)}
            >
                <div className="relative">
                    {/* Chat Icon */}
                    <svg 
                        className={`w-6 h-6 transition-opacity duration-300 ${isChatOpen ? 'opacity-0' : 'opacity-100'}`} 
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {/* Close Icon */}
                    <svg 
                        className={`w-6 h-6 absolute top-0 left-0 transition-opacity duration-300 ${isChatOpen ? 'opacity-100' : 'opacity-0'}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                
                {/* Notification Badge */}
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                    {messages.length > 99 ? '99+' : messages.length}
                </span>
            </button>

            {/* Chat Window with enhanced design */}
            {isChatOpen && (
                <div className="w-80 sm:w-96 h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col absolute bottom-20 right-0 overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header with gradient */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex justify-between items-center relative">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.431 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">Chat Trực Tuyến</h2>
                                <p className="text-sm text-blue-100">Baby Health Hub Support</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsChatOpen(false)}
                            className="text-white hover:text-blue-200 hover:bg-white/10 p-2 rounded-full transition-all duration-200"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>
                    </div>

                    {/* Connection Status */}
                    {connecting && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-400 border-t-transparent"></div>
                            <span className="text-yellow-700 text-sm font-medium">Đang kết nối...</span>
                        </div>
                    )}

                    {/* Messages Area */}
                    <div ref={messageAreaRef} className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white space-y-3">
                        {messages.length === 0 && !connecting && (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.431 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 text-sm">Chào mừng bạn đến với chat hỗ trợ!</p>
                                <p className="text-gray-400 text-xs mt-1">Hãy bắt đầu cuộc trò chuyện...</p>
                            </div>
                        )}
                        
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex items-start space-x-3 animate-in slide-in-from-bottom-2 duration-300`}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0"
                                    style={{ backgroundColor: getAvatarColor(message.sender) }}
                                >
                                    {message.sender[0].toUpperCase()}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    {message.type === 'JOIN' && (
                                        <div className="bg-green-100 border border-green-200 rounded-lg p-3">
                                            <p className="text-green-800 text-sm">
                                                <span className="font-semibold">{message.sender}</span> đã tham gia cuộc trò chuyện! 🎉
                                            </p>
                                        </div>
                                    )}
                                    {message.type === 'LEAVE' && (
                                        <div className="bg-red-100 border border-red-200 rounded-lg p-3">
                                            <p className="text-red-800 text-sm">
                                                <span className="font-semibold">{message.sender}</span> đã rời khỏi! 👋
                                            </p>
                                        </div>
                                    )}
                                    {message.type === 'CHAT' && (
                                        <div className={`rounded-lg p-3 shadow-sm ${
                                            message.sender === username 
                                                ? 'bg-blue-500 text-white ml-8' 
                                                : 'bg-white border border-gray-200'
                                        }`}>
                                            {message.sender !== username && (
                                                <p className="font-semibold text-gray-700 text-xs mb-1">{message.sender}</p>
                                            )}
                                            <p className={`text-sm ${message.sender === username ? 'text-white' : 'text-gray-700'}`}>
                                                {message.content}
                                            </p>
                                            <p className={`text-xs mt-1 ${
                                                message.sender === username ? 'text-blue-100' : 'text-gray-400'
                                            }`}>
                                                {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        
                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex items-center space-x-2 text-gray-500 text-sm animate-pulse">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <span>Đang soạn tin...</span>
                            </div>
                        )}
                    </div>

                    {/* Input Area with enhanced design */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <form onSubmit={sendMessage} className="flex gap-3">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={messageInput}
                                    onChange={handleInputChange}
                                    placeholder="Nhập tin nhắn của bạn..."
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                    autoComplete="off"
                                />
                                {/* Emoji button */}
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    😊
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={!messageInput.trim()}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                <span className="hidden sm:inline">Gửi</span>
                            </button>
                        </form>
                        
                        {/* Online status */}
                        <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                            Đang trực tuyến
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatButton;