import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import axiosClient from '../../api/axiosClient';
import UserService from '../../service/userService';

const ChatDoctor = ({ userName }) => {
    const [messages, setMessages] = useState([]);
    const [stompClient, setStompClient] = useState(null);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [fetchError, setFetchError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [initialChats, setInitialChats] = useState([]); // Danh sách người dùng ban đầu
    const messageAreaRef = useRef(null);

    // Utility functions
    const addMessage = (message) => {
        setMessages(prev => {
            if (message.id) {
                const isDuplicate = prev.some(msg => msg.id === message.id);
                if (isDuplicate) return prev;
            }
            const newMessages = [...prev, message];
            return newMessages.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
        });
    };

    const fetchMessageHistory = async (senderId, receiverId) => {
        try {
            const response = await axiosClient.get(`/api/messages/history/${senderId}/${receiverId}`);
            console.log('Message history response:', response.data); // Debug log
            const historyMessages = response.data?.data || []; // Giả định response.data là { data: [], message: "" }
            setMessages(prev => {
                const existingMessages = prev.filter(msg => msg.id);
                const uniqueMessages = historyMessages.filter(newMsg =>
                    !existingMessages.some(existing => existing.id === newMsg.id)
                );
                return [...existingMessages, ...uniqueMessages].sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
            });
            setFetchError('');
        } catch (error) {
            console.error('Error fetching message history:', error);
            setFetchError(error.response?.status === 401 ? 'Lỗi xác thực' : 'Lỗi tải tin nhắn');
        }
    };

    const fetchInitialChats = async () => {
        try {
            const senderId = UserService.getAccountId();
            const response = await axiosClient.get(`/api/messages/chats/${senderId}`);
            console.log('Initial chats response:', response.data); // Debug log
            const chats = response.data?.data || [];
            const usernames = chats.map(chat => chat.username);
            setInitialChats(usernames);
            if (usernames.length > 0) {
                const firstChat = usernames[0];
                setSelectedChat(firstChat);
                await fetchMessageHistory(senderId, chats.find(chat => chat.username === firstChat)?.id || senderId);
            }
        } catch (error) {
            console.error('Error fetching initial chats:', error);
            setFetchError('Không thể tải danh sách cuộc trò chuyện');
        }
    };

    const connectWebSocket = (username) => {
        if (!UserService.isLoggedIn() || stompClient) return;

        const socket = new SockJS('http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: { Authorization: `Bearer ${UserService.getToken()}` },
            onConnect: () => {
                console.log('Connected to WebSocket');
                setStompClient(client);
                client.subscribe(`/user/${username}/queue/messages`, (payload) => {
                    const message = JSON.parse(payload.body);
                    console.log('Received message:', message); // Debug log
                    addMessage({ ...message, sentAt: message.sentAt || new Date().toISOString() });
                });
                client.subscribe(`/user/${username}/queue/notifications`, (payload) => {
                    const notification = JSON.parse(payload.body);
                    addMessage({ ...notification, sentAt: notification.sentAt || new Date().toISOString() });
                });
            },
            onStompError: (error) => {
                console.error('WebSocket error:', error);
                setFetchError('Không thể kết nối chat');
            },
            onDisconnect: () => setStompClient(null)
        });
        client.activate();
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (messageInput.trim() && stompClient && selectedChat) {
            const chatMessage = {
                sender: userName,
                receiver: selectedChat,
                content: messageInput,
                type: 'CHAT',
                sentAt: new Date().toISOString()
            };
            addMessage({ ...chatMessage, id: Date.now() });
            stompClient.publish({
                destination: '/app/chat.sendPrivateMessage',
                body: JSON.stringify(chatMessage)
            });
            setMessageInput('');
        }
    };

    const handleSelectChat = async (user) => {
        setSelectedChat(user);
        try {
            const response = await axiosClient.get(`/api/accounts/username/${user}`);
            if (!response || !response.id) {
                setFetchError('Không thể lấy thông tin người nhận');
                return;
            }
            const receiverId = response.id;
            await fetchMessageHistory(UserService.getAccountId(), receiverId);
        } catch (error) {
            console.error('Error fetching receiver ID:', error);
            setFetchError('Không thể tải thông tin người nhận');
        }
    };

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    }, [messages]);

    // Connect WebSocket and fetch initial chats
    useEffect(() => {
        if (userName) {
            connectWebSocket(userName);
            fetchInitialChats();
        }
        return () => {
            if (stompClient) {
                stompClient.deactivate();
                setStompClient(null);
            }
        };
    }, [userName]);

    // Filter chat list based on search query
    const filteredChats = [...new Set([...initialChats, ...messages.map(msg => msg.sender !== userName ? msg.sender : msg.receiver)])]
        .filter(user => user.toLowerCase().includes(searchQuery.toLowerCase()));

    // Generate avatar color based on username
    const getAvatarColor = (username) => {
        const colors = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#84CC16'];
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = 31 * hash + username.charCodeAt(i);
        }
        return colors[Math.abs(hash % colors.length)];
    };

    return (
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl h-[600px] flex flex-col">
            <h4 className="text-2xl font-bold text-blue-600 mb-6">Tin nhắn</h4>
            <div className="flex flex-1 overflow-hidden">
                {/* Chat list */}
                <div className="w-1/3 border-r pr-4 flex flex-col">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm người dùng..."
                        className="mb-4 p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1 overflow-y-auto">
                        {filteredChats.length > 0 ? (
                            filteredChats.map((user, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSelectChat(user)}
                                    className={`w-full flex items-center space-x-3 p-3 rounded-lg mb-2 transition-all duration-300 ${
                                        selectedChat === user ? 'bg-blue-100' : 'bg-gray-100'
                                    } hover:bg-blue-200`}
                                >
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                                        style={{ backgroundColor: getAvatarColor(user) }}
                                    >
                                        {user.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-medium">{user}</p>
                                        <p className="text-xs text-gray-500">Trực tuyến</p>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">Không tìm thấy cuộc trò chuyện nào</p>
                        )}
                    </div>
                </div>

                {/* Chat area */}
                <div className="w-2/3 pl-4 flex flex-col">
                    {selectedChat ? (
                        <>
                            <div className="flex items-center space-x-3 mb-4">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium"
                                    style={{ backgroundColor: getAvatarColor(selectedChat) }}
                                >
                                    {selectedChat.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h5 className="text-lg font-semibold">Trò chuyện với {selectedChat}</h5>
                                    <p className="text-xs text-gray-500">Trực tuyến</p>
                                </div>
                            </div>
                            <div ref={messageAreaRef} className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-xl">
                                {messages
                                    .filter(
                                        (msg) =>
                                            (msg.sender === selectedChat && msg.receiver === userName) ||
                                            (msg.sender === userName && msg.receiver === selectedChat)
                                    )
                                    .map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`flex ${
                                                msg.sender === userName ? 'justify-end' : 'justify-start'
                                            }`}
                                        >
                                            <div
                                                className={`max-w-xs lg:max-w-md p-3 rounded-xl shadow-sm ${
                                                    msg.sender === userName
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-white border border-gray-200'
                                                }`}
                                            >
                                                <p className="text-sm">{msg.content}</p>
                                                <p className="text-xs mt-1 opacity-70">
                                                    {new Date(msg.sentAt).toLocaleString('vi-VN', {
                                                        dateStyle: 'short',
                                                        timeStyle: 'short',
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                {fetchError && (
                                    <p className="text-red-500 text-sm text-center">{fetchError}</p>
                                )}
                                {messages.length === 0 && !fetchError && (
                                    <p className="text-gray-500 text-center py-8">
                                        Chưa có tin nhắn nào. Gửi tin nhắn để bắt đầu!
                                    </p>
                                )}
                            </div>
                            <form onSubmit={sendMessage} className="flex gap-3 mt-4">
                                <input
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage(e)}
                                    placeholder={`Nhắn tin cho ${selectedChat || 'người dùng'}...`}
                                    className="flex-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!messageInput.trim()}
                                    className="bg-blue-500 text-white p-3 rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                        />
                                    </svg>
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            <p>Chọn một cuộc trò chuyện để bắt đầu</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatDoctor;