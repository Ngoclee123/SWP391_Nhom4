import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import UserService from '../service/userService';
import DoctorService from '../service/DoctorService';
import axiosClient from '../api/axiosClient';

const ChatButton = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [stompClient, setStompClient] = useState(null);
    const [connecting, setConnecting] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [specialties, setSpecialties] = useState([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState(null);
    const [availableDoctors, setAvailableDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDoctorInfo, setSelectedDoctorInfo] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [messageHistory, setMessageHistory] = useState({});
    const messageAreaRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const colors = [
        '#4F46E5', '#06B6D4', '#10B981', '#F59E0B',
        '#EF4444', '#8B5CF6', '#F97316', '#84CC16'
    ];

    // Hàm kiểm tra và thêm tin nhắn, tránh trùng lặp
    const addMessage = (message, doctorUsername) => {
        const targetDoctor = doctorUsername || selectedDoctor;
        if (!targetDoctor) return;

        setMessageHistory(prev => {
            const doctorMessages = prev[targetDoctor] || [];
            
            // Kiểm tra trùng lặp dựa trên nội dung, thời gian và người gửi
            const isDuplicate = doctorMessages.some(msg => 
                msg.content === message.content && 
                msg.sender === message.sender && 
                Math.abs(new Date(msg.sentAt) - new Date(message.sentAt)) < 1000
            );
            
            if (!isDuplicate) {
                const newMessages = [...doctorMessages, {
                    ...message,
                    id: message.id || Date.now() + Math.random(),
                    sentAt: message.sentAt || new Date().toISOString()
                }].sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
                
                return { ...prev, [targetDoctor]: newMessages };
            }
            return prev;
        });
    };

    // Cập nhật messages hiện tại dựa trên selectedDoctor
    useEffect(() => {
        if (selectedDoctor && messageHistory[selectedDoctor]) {
            setMessages(messageHistory[selectedDoctor]);
        } else {
            setMessages([]);
        }
    }, [selectedDoctor, messageHistory]);

    // Lấy lịch sử tin nhắn
    const fetchMessageHistory = async (senderId, receiverId, doctorUsername) => {
        try {
const token = UserService.getToken();
            if (!token) {
                setErrorMessage('Vui lòng đăng nhập để sử dụng chat.');
                return;
            }

            console.log('Fetching message history:', { senderId, receiverId, doctorUsername });
            const response = await axiosClient.get(`/api/messages/history/${senderId}/${receiverId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const historyMessages = response.data || [];
            console.log('Message history loaded:', historyMessages.length, 'messages');
            
            // Lưu lịch sử tin nhắn vào state
            setMessageHistory(prev => ({
                ...prev,
                [doctorUsername]: historyMessages.map(msg => ({
                    ...msg,
                    id: msg.id || Date.now() + Math.random(),
                    sentAt: msg.sentAt || new Date().toISOString()
                }))
            }));
            
            setErrorMessage('');
        } catch (error) {
            console.error('Error fetching message history:', error);
            if (error.response?.status === 401) {
                setErrorMessage('Lỗi xác thực: Vui lòng đăng nhập lại.');
                // Có thể redirect tới trang login
            } else {
                setErrorMessage('Lỗi khi tải lịch sử tin nhắn.');
            }
        }
    };

    // Kết nối WebSocket
    const connect = (doctorUsername) => {
        if (!UserService.isLoggedIn()) {
            setErrorMessage('Vui lòng đăng nhập để sử dụng chat.');
            return;
        }

        // Đóng kết nối cũ nếu có
        if (stompClient) {
            stompClient.deactivate();
            setStompClient(null);
        }

        const user = {
            username: UserService.getUsername(),
            fullName: UserService.getFullName(),
            accountId: UserService.getAccountId()
        };

        if (!user.username) {
            setErrorMessage('Không thể lấy thông tin người dùng.');
            return;
        }

        setUsername(user.username);
        setConnecting(true);
        setErrorMessage('');

        const socket = new SockJS('http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${UserService.getToken()}`,
            },
            debug: (str) => console.log('WebSocket Debug:', str),
            onConnect: () => {
                console.log('Connected to WebSocket for doctor:', doctorUsername);
                setConnecting(false);
                setStompClient(client);
                
                // Subscribe to personal message queue
                client.subscribe(`/user/${user.username}/queue/messages`, (payload) => {
                    try {
                        const message = JSON.parse(payload.body);
console.log('Received message:', message);
                        
                        // Xác định bác sĩ tương ứng với tin nhắn
                        const messageDoctorUsername = message.sender === user.username ? message.receiver : message.sender;
                        addMessage(message, messageDoctorUsername);
                    } catch (error) {
                        console.error('Error parsing message:', error);
                    }
                });

                // Subscribe to notifications
                client.subscribe(`/user/${user.username}/queue/notifications`, (payload) => {
                    try {
                        const notification = JSON.parse(payload.body);
                        console.log('Received notification:', notification);
                        // Có thể xử lý notification riêng biệt
                    } catch (error) {
                        console.error('Error parsing notification:', error);
                    }
                });

                // Send join message
                client.publish({
                    destination: '/app/chat.sendPrivateMessage',
                    body: JSON.stringify({ 
                        sender: user.username, 
                        receiver: doctorUsername, 
                        type: 'JOIN',
                        content: `${user.fullName} đã tham gia cuộc trò chuyện`,
                        sentAt: new Date().toISOString() 
                    })
                });
            },
            onStompError: (error) => {
                console.error('WebSocket connection error:', error);
                setConnecting(false);
                setErrorMessage('Không thể kết nối đến server chat. Vui lòng kiểm tra kết nối mạng và thử lại!');
            },
            onDisconnect: () => {
                console.log('Disconnected from WebSocket');
                setStompClient(null);
                setConnecting(false);
            }
        });

        try {
            client.activate();
        } catch (error) {
            console.error('Error activating WebSocket client:', error);
            setConnecting(false);
            setErrorMessage('Lỗi khi kích hoạt kết nối WebSocket.');
        }
    };

    // Lấy danh sách chuyên khoa
    const fetchSpecialties = async () => {
        try {
            setErrorMessage('');
            const response = await DoctorService.getAllSpecialties();
            console.log('Specialties response:', response);
            
            if (response && Array.isArray(response) && response.length > 0) {
                setSpecialties(response);
            } else {
                setSpecialties([]);
                setErrorMessage('Không có chuyên khoa nào để hiển thị.');
            }
        } catch (error) {
            console.error('Error fetching specialties:', error);
            setSpecialties([]);
setErrorMessage('Lỗi khi tải danh sách chuyên khoa.');
        }
    };

    // Chọn chuyên khoa và lấy danh sách bác sĩ
    const handleSelectSpecialty = async (specialtyId) => {
        setSelectedSpecialty(specialtyId);
        setSelectedDoctor(null);
        setSelectedDoctorInfo(null);
        setMessages([]);
        setErrorMessage('');
        
        try {
            const response = await DoctorService.getAllDoctorsBySpecialty(specialtyId);
            console.log('Doctors response:', response);
            
            if (response && response.data && Array.isArray(response.data)) {
                setAvailableDoctors(response.data);
                if (response.data.length === 0) {
                    setErrorMessage('Không có bác sĩ nào trong chuyên khoa này.');
                }
            } else {
                setAvailableDoctors([]);
                setErrorMessage('Không có bác sĩ nào trong chuyên khoa này.');
            }
        } catch (error) {
            console.error('Error fetching doctors:', error);
            setErrorMessage(error.response?.status === 401 ? 'Lỗi xác thực: Vui lòng đăng nhập lại.' : 'Lỗi khi tải danh sách bác sĩ.');
            setAvailableDoctors([]);
        }
    };

    // Chọn bác sĩ
    const handleSelectDoctor = async (doctor) => {
        setSelectedDoctor(doctor.username);
        setSelectedDoctorInfo(doctor);
        setMessages([]);
        setErrorMessage('');
        
        try {
            // Lấy lịch sử tin nhắn
            await fetchMessageHistory(UserService.getAccountId(), doctor.id, doctor.username);
            
            // Kết nối WebSocket
            connect(doctor.username);
        } catch (error) {
            console.error('Error selecting doctor:', error);
            setErrorMessage('Lỗi khi chọn bác sĩ.');
        }
    };

    // Gửi tin nhắn
    const sendMessage = (e) => {
        e.preventDefault();
        if (!messageInput.trim()) return;
        
        if (!stompClient || !selectedDoctor) {
            setErrorMessage('Chưa kết nối được tới server hoặc chưa chọn bác sĩ.');
            return;
        }

        const chatMessage = {
            sender: username,
            receiver: selectedDoctor,
            content: messageInput.trim(),
            type: 'CHAT',
            sentAt: new Date().toISOString()
        };

        try {
            stompClient.publish({
                destination: '/app/chat.sendPrivateMessage',
                body: JSON.stringify(chatMessage)
            });
            
            // Thêm tin nhắn vào UI ngay lập tức
            addMessage(chatMessage, selectedDoctor);
            setMessageInput('');
        } catch (error) {
            console.error('Error sending message:', error);
            setErrorMessage('Lỗi khi gửi tin nhắn.');
        }
    };

    // Tạo màu avatar
    const getAvatarColor = (sender) => {
        if (!sender) return colors[0];
        let hash = 0;
for (let i = 0; i < sender.length; i++) {
            hash = 31 * hash + sender.charCodeAt(i);
        }
        return colors[Math.abs(hash % colors.length)];
    };

    // Xử lý nhập liệu
    const handleInputChange = (e) => {
        setMessageInput(e.target.value);
        
        // Xử lý typing indicator
        setIsTyping(true);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1000);
    };

    // Cuộn xuống cuối khu vực tin nhắn
    useEffect(() => {
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    }, [messages]);

    // Xử lý mở/đóng chat
    useEffect(() => {
        if (isChatOpen && UserService.isLoggedIn()) {
            setSelectedSpecialty(null);
            setSelectedDoctor(null);
            setSelectedDoctorInfo(null);
            setMessages([]);
            setMessageHistory({});
            fetchSpecialties();
        }
        
        // Cleanup khi đóng chat
        return () => {
            if (!isChatOpen && stompClient) {
                stompClient.deactivate();
                setStompClient(null);
            }
        };
    }, [isChatOpen]);

    // Cleanup khi component unmount
    useEffect(() => {
        return () => {
            if (stompClient) {
                stompClient.deactivate();
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    // Tính toán số tin nhắn chưa đọc
    const unreadCount = Object.values(messageHistory).flat()
        .filter(msg => msg.receiver === username && msg.type === 'CHAT').length;

    if (!UserService.isLoggedIn()) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <button
                className={`relative bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transform transition-all duration-300 ${isChatOpen ? 'rotate-180' : ''}`}
                onClick={() => setIsChatOpen(!isChatOpen)}
            >
                <div className="relative">
                    <svg 
                        className={`w-6 h-6 transition-opacity duration-300 ${isChatOpen ? 'opacity-0' : 'opacity-100'}`} 
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 11.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <svg
className={`w-6 h-6 absolute top-0 left-0 transition-opacity duration-300 ${isChatOpen ? 'opacity-100' : 'opacity-0'}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isChatOpen && (
                <div className="w-80 sm:w-96 h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col absolute bottom-20 right-0 overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex justify-between items-center relative">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.431 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">Chat Trực Tuyến</h2>
                                <p className="text-sm text-blue-100">
                                    {selectedDoctorInfo ? `Dr. ${selectedDoctorInfo.fullName}` : 'Baby Health Hub Support'}
                                </p>
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
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Chọn chuyên khoa */}
                        {!selectedSpecialty && (
<div className="p-4 flex-1 overflow-y-auto">
                                <h3 className="text-lg font-semibold mb-4">Chọn chuyên khoa</h3>
                                <div className="space-y-2">
                                    {specialties.length > 0 ? (
                                        specialties.map((specialty) => (
                                            <button
                                                key={specialty.id}
                                                onClick={() => handleSelectSpecialty(specialty.id)}
                                                className="w-full text-left p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
                                            >
                                                {specialty.name}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500">Đang tải chuyên khoa...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Chọn bác sĩ */}
                        {selectedSpecialty && !selectedDoctor && (
                            <div className="p-4 flex-1 overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">Chọn bác sĩ</h3>
                                    <button
                                        onClick={() => {
                                            setSelectedSpecialty(null);
                                            setAvailableDoctors([]);
                                        }}
                                        className="text-blue-500 hover:text-blue-700 text-sm"
                                    >
                                        ← Quay lại
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {availableDoctors.length > 0 ? (
                                        availableDoctors.map((doctor) => (
                                            <button
                                                key={doctor.id}
                                                onClick={() => handleSelectDoctor(doctor)}
                                                className="w-full text-left p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
                                            >
                                                <div className="font-medium">{doctor.fullName}</div>
<div className="text-sm text-gray-600">{doctor.specialty}</div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500">Đang tải danh sách bác sĩ...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Khu vực chat */}
                        {selectedDoctor && (
                            <>
                                {/* Connection status */}
                                {connecting && (
                                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-400 border-t-transparent"></div>
                                        <span className="text-yellow-700 text-sm font-medium">Đang kết nối...</span>
                                    </div>
                                )}

                                {/* Messages area */}
                                <div ref={messageAreaRef} className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white space-y-3">
                                    {messages.length > 0 ? (
                                        messages.map((message, index) => (
                                            <div
                                                key={message.id || index}
                                                className={`flex items-start space-x-3 ${message.sender === username ? 'justify-end' : ''}`}
                                            >
                                                {message.sender !== username && (
                                                    <div 
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                                                        style={{ backgroundColor: getAvatarColor(message.sender) }}
                                                    >
                                                        {message.sender?.charAt(0)?.toUpperCase() || 'D'}
                                                    </div>
                                                )}
                                                <div
                                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                                                        message.sender === username 
                                                            ? 'bg-blue-500 text-white'
: 'bg-white border border-gray-200'
                                                    }`}
                                                >
                                                    <p className="text-sm">{message.content}</p>
                                                    <p className="text-xs mt-1 opacity-70">
                                                        {new Date(message.sentAt).toLocaleTimeString('vi-VN', { 
                                                            hour: '2-digit', 
                                                            minute: '2-digit' 
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500">Chưa có tin nhắn nào</p>
                                            <p className="text-sm text-gray-400">Gửi tin nhắn đầu tiên để bắt đầu trò chuyện</p>
                                        </div>
                                    )}
                                    
                                    {/* Typing indicator */}
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

                                {/* Input area */}
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
                                                disabled={!stompClient || connecting}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={!messageInput.trim() || !stompClient || connecting}
                                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                            <span className="hidden sm:inline">Gửi</span>
                                        </button>
                                    </form>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Error message */}
                    {errorMessage && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-3">
                            <p className="text-red-700 text-sm">{errorMessage}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatButton;