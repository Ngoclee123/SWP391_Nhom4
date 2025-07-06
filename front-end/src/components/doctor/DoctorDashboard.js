import React, { useState, useEffect, useRef } from 'react';
import Profile from './Profile';
import Schedule from './Schedule';
import Appointments from './Appointments';
import MedicalRecords from './MedicalRecords';
import Feedback from './Feedback';
import DoctorDashboardService from '../../service/DoctorDashboardService';
import UserService from '../../service/userService';
import { jwtDecode } from 'jwt-decode';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import axiosClient from '../../api/axiosClient';
import io from 'socket.io-client';

const DoctorDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [doctorId, setDoctorId] = useState(null);
    const [userName, setUserName] = useState('Doctor User');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [stats, setStats] = useState({
        totalPatients: 0,
        todaysAppointments: 0,
        completedWeek: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [messages, setMessages] = useState([]);
    const [stompClient, setStompClient] = useState(null);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [fetchError, setFetchError] = useState('');
    const [incomingCall, setIncomingCall] = useState(null);
    const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [rtcPeerConnection, setRtcPeerConnection] = useState(null);
    const [isCaller, setIsCaller] = useState(false);
    const [roomName, setRoomName] = useState('');
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const socketRef = useRef(null);

    const iceServers = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };

    const streamConstraints = { audio: true, video: true };

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
            setMessages(response.data || []);
            setFetchError('');
        } catch (error) {
            console.error('Lỗi khi lấy lịch sử tin nhắn:', error);
            setFetchError(error.response?.status === 401 ? 'Lỗi xác thực' : 'Lỗi tải tin nhắn');
        }
    };

    const connectWebSocket = (username) => {
        if (!UserService.isLoggedIn() || stompClient) return;

        const socket = new SockJS('http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: { Authorization: `Bearer ${UserService.getToken()}` },
            onConnect: () => {
                console.log('Đã kết nối WebSocket');
                setStompClient(client);
                client.subscribe(`/user/${username}/queue/messages`, (payload) => {
                    const message = JSON.parse(payload.body);
                    addMessage({ ...message, sentAt: message.sentAt || new Date().toISOString() });
                });
                client.subscribe(`/user/${username}/queue/notifications`, (payload) => {
                    const notification = JSON.parse(payload.body);
                    addMessage({ ...notification, sentAt: notification.sentAt || new Date().toISOString() });
                });
            },
            onStompError: (error) => {
                console.error('Lỗi WebSocket:', error);
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

            addMessage({
                ...chatMessage,
                id: Date.now()
            });

            stompClient.publish({
                destination: '/app/chat.sendPrivateMessage',
                body: JSON.stringify(chatMessage)
            });
            setMessageInput('');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const handleSelectChat = async (user) => {
        setSelectedChat(user);
        try {
            const response = await axiosClient.get(`/api/accounts/username/${user}`);
            const receiverId = response.data.id;
            await fetchMessageHistory(UserService.getAccountId(), receiverId);
        } catch (error) {
            console.error('Lỗi khi lấy ID người nhận:', error);
            setFetchError('Không thể lấy thông tin người nhận');
        }
    };

    const handleCallResponse = (accepted) => {
        if (!incomingCall) return;
        socketRef.current.emit('callResponse', {
            room: incomingCall.room,
            callerUsername: incomingCall.callerUsername,
            accepted
        });
        if (accepted) {
            setRoomName(incomingCall.room);
            setIsVideoCallOpen(true);
            socketRef.current.emit('joinRoom', incomingCall.room);
        }
        setIncomingCall(null);
    };

    const cleanup = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (rtcPeerConnection) {
            rtcPeerConnection.close();
        }
        setLocalStream(null);
        setRemoteStream(null);
        setRtcPeerConnection(null);
        setIsCaller(false);
    };

    const toggleTrack = (trackType) => {
        if (!localStream) return;
        const track = trackType === 'video' ? localStream.getVideoTracks()[0] : localStream.getAudioTracks()[0];
        track.enabled = !track.enabled;
    };

    const endCall = () => {
        socketRef.current.emit('leaveRoom', roomName);
        setIsVideoCallOpen(false);
        cleanup();
    };

    useEffect(() => {
        const initializeDashboard = async () => {
            try {
                const token = UserService.getToken();
                if (!token) {
                    setError('Vui lòng đăng nhập lại');
                    window.location.href = '/login';
                    return;
                }

                const decoded = jwtDecode(token);
                const accountId = decoded.accountId;
                const userNameFromToken = decoded.fullName || decoded.sub || 'Doctor User';
                setUserName(userNameFromToken);

                const doctorData = await DoctorDashboardService.getDoctorByAccountId(accountId);
                if (doctorData?.id) {
                    setDoctorId(doctorData.id);
                    setStats({
                        totalPatients: 1234,
                        todaysAppointments: 45,
                        completedWeek: 89,
                    });
                    connectWebSocket(userNameFromToken);
                } else {
                    setError('Không tìm thấy ID bác sĩ');
                }
            } catch (err) {
                const errorMessage = err.response?.data?.message || 'Không thể tải thông tin bác sĩ';
                setError(errorMessage);
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
            } finally {
                setLoading(false);
            }
        };

        initializeDashboard();
        return () => {
            if (stompClient) {
                stompClient.deactivate();
                setStompClient(null);
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        socketRef.current = io('http://localhost:8000', {
            query: { token: `Bearer ${UserService.getToken()}` }
        });

        socketRef.current.on('incomingCall', (data) => {
            setIncomingCall(data);
        });

        socketRef.current.on('created', (room) => {
            navigator.mediaDevices.getUserMedia(streamConstraints)
                .then(stream => {
                    setLocalStream(stream);
                    localVideoRef.current.srcObject = stream;
                    setIsCaller(true);
                })
                .catch(err => {
                    console.error('Lỗi truy cập thiết bị media:', err);
                    setFetchError('Không thể truy cập camera/mic');
                });
        });

        socketRef.current.on('joined', (room) => {
            navigator.mediaDevices.getUserMedia(streamConstraints)
                .then(stream => {
                    setLocalStream(stream);
                    localVideoRef.current.srcObject = stream;
                    socketRef.current.emit('ready', room);
                })
                .catch(err => {
                    console.error('Lỗi truy cập thiết bị media:', err);
                    setFetchError('Không thể truy cập camera/mic');
                });
        });

        socketRef.current.on('ready', () => {
            if (isCaller) {
                const pc = new RTCPeerConnection(iceServers);
                setRtcPeerConnection(pc);
                pc.onicecandidate = (e) => {
                    if (e.candidate) {
                        socketRef.current.emit('candidate', {
                            type: 'candidate',
                            label: e.candidate.sdpMLineIndex,
                            id: e.candidate.sdpMid,
                            candidate: e.candidate.candidate,
                            room: roomName
                        });
                    }
                };
                pc.ontrack = (e) => {
                    setRemoteStream(e.streams[0]);
                    remoteVideoRef.current.srcObject = e.streams[0];
                };
                localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
                pc.createOffer()
                    .then(offer => {
                        pc.setLocalDescription(offer);
                        socketRef.current.emit('offer', { sdp: offer, room: roomName });
                    })
                    .catch(console.error);
            }
        });

        socketRef.current.on('offer', (sdp) => {
            if (!isCaller) {
                const pc = new RTCPeerConnection(iceServers);
                setRtcPeerConnection(pc);
                pc.onicecandidate = (e) => {
                    if (e.candidate) {
                        socketRef.current.emit('candidate', {
                            type: 'candidate',
                            label: e.candidate.sdpMLineIndex,
                            id: e.candidate.sdpMid,
                            candidate: e.candidate.candidate,
                            room: roomName
                        });
                    }
                };
                pc.ontrack = (e) => {
                    setRemoteStream(e.streams[0]);
                    remoteVideoRef.current.srcObject = e.streams[0];
                };
                localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
                pc.setRemoteDescription(new RTCSessionDescription(sdp))
                    .then(() => pc.createAnswer())
                    .then(answer => {
                        pc.setLocalDescription(answer);
                        socketRef.current.emit('answer', { sdp: answer, room: roomName });
                    })
                    .catch(console.error);
            }
        });

        socketRef.current.on('answer', (sdp) => {
            if (isCaller) {
                rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(sdp))
                    .catch(console.error);
            }
        });

        socketRef.current.on('candidate', (data) => {
            if (rtcPeerConnection) {
                rtcPeerConnection.addIceCandidate(new RTCIceCandidate({
                    sdpMLineIndex: data.label,
                    candidate: data.candidate
                }))
                    .catch(console.error);
            }
        });

        socketRef.current.on('userDisconnected', () => {
            setRemoteStream(null);
            setIsVideoCallOpen(false);
            cleanup();
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
            <div className="text-center">
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-indigo-200 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-24 h-24 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
                </div>
                <p className="mt-6 text-indigo-700 font-semibold text-lg">Đang tải bảng điều khiển...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-xl p-12 rounded-3xl shadow-2xl border border-red-100 text-center max-w-md">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-red-700 mb-2">Có lỗi xảy ra</h3>
                <p className="text-red-600 font-medium">{error}</p>
            </div>
        </div>
    );

    if (!doctorId) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-xl p-12 rounded-3xl shadow-2xl border border-gray-100 text-center max-w-md">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy</h3>
                <p className="text-gray-600 font-medium">Không có ID bác sĩ</p>
            </div>
        </div>
    );

    const menuItems = [
        { id: 'overview', label: 'Tổng quan', icon: '📊', color: 'from-blue-500 to-blue-600' },
        { id: 'appointments', label: 'Lịch hẹn', icon: '📅', color: 'from-green-500 to-green-600' },
        { id: 'schedule', label: 'Lịch làm việc', icon: '⏰', color: 'from-purple-500 to-purple-600' },
        { id: 'records', label: 'Hồ sơ khám bệnh', icon: '📋', color: 'from-orange-500 to-orange-600' },
        { id: 'feedback', label: 'Phản hồi', icon: '💬', color: 'from-pink-500 to-pink-600' },
        { id: 'profile', label: 'Hồ sơ chuyên môn', icon: '👤', color: 'from-indigo-500 to-indigo-600' },
        { id: 'messages', label: 'Tin nhắn', icon: '📩', color: 'from-cyan-500 to-cyan-600' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="flex h-screen">
                {/* Sidebar */}
                <div className={`${sidebarCollapsed ? 'w-20' : 'w-80'} bg-white/70 backdrop-blur-2xl shadow-2xl border-r border-white/20 transition-all duration-300 ease-in-out`}>
                    <div className="p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''}`}>
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-xl">🏥</span>
                                </div>
                                {!sidebarCollapsed && (
                                    <div className="ml-3">
                                        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                            BabyHealthHub
                                        </h2>
                                        <p className="text-xs text-gray-500 font-medium">Doctor Dashboard</p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <svg className={`w-5 h-5 text-gray-600 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        </div>
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-3xl mb-6 text-white shadow-xl">
                            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                    <span className="text-2xl">👨‍⚕️</span>
                                </div>
                                {!sidebarCollapsed && (
                                    <div>
                                        <p className="font-bold text-lg">{userName}</p>
                                        <p className="text-sm opacity-90">Bác sĩ chuyên khoa</p>
                                        <div className="flex items-center mt-1">
                                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                            <span className="text-xs">Đang hoạt động</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <nav className="space-y-2 flex-1">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-4 rounded-2xl font-medium transition-all duration-300 group ${
                                        activeTab === item.id
                                            ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105`
                                            : 'text-gray-700 hover:bg-gray-100 hover:shadow-md'
                                    }`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    {!sidebarCollapsed && <span className="font-semibold">{item.label}</span>}
                                    {!sidebarCollapsed && activeTab === item.id && (
                                        <div className="ml-auto">
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </nav>
                        {!sidebarCollapsed && (
                            <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
                                <h4 className="font-semibold text-emerald-800 mb-2">Thao tác nhanh</h4>
                                <div className="space-y-2">
                                    <button className="w-full text-left text-sm text-emerald-700 hover:text-emerald-900 transition-colors">
                                        📞 Gọi khẩn cấp
                                    </button>
                                    <button className="w-full text-left text-sm text-emerald-700 hover:text-emerald-900 transition-colors">
                                        📋 Tạo báo cáo
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="bg-white/70 backdrop-blur-2xl shadow-lg border-b border-white/20 p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Bảng điều khiển bác sĩ
                                </h1>
                                <p className="text-gray-600 mt-1 font-medium">Quản lý và theo dõi hoạt động một cách hiệu quả</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm..."
                                        className="pl-10 pr-4 py-3 bg-white/50 backdrop-blur-xl border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                    <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <div className="relative">
                                    <button className="p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5 5-5h-5l-5 5 5 5z" />
                                        </svg>
                                    </button>
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                                        {messages.filter(msg => msg.type === 'NOTIFICATION').length}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg">
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Incoming Call Notification */}
                    {incomingCall && (
                        <div className="fixed top-20 right-6 bg-white rounded-3xl shadow-2xl p-6 w-80 z-50 border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800">Cuộc gọi đến</h3>
                            <p className="text-gray-600 mt-2">Từ: {incomingCall.callerUsername}</p>
                            <div className="flex space-x-4 mt-4">
                                <button
                                    onClick={() => handleCallResponse(true)}
                                    className="flex-1 bg-green-500 text-white py-2 rounded-xl hover:bg-green-600 transition-all"
                                >
                                    Chấp nhận
                                </button>
                                <button
                                    onClick={() => handleCallResponse(false)}
                                    className="flex-1 bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 transition-all"
                                >
                                    Từ chối
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Video Call Window */}
                    {isVideoCallOpen && (
                        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                            <div className="bg-white rounded-3xl w-[800px] h-[600px] flex flex-col overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-4 flex justify-between items-center">
                                    <h3 className="text-lg font-bold">Gọi video với {incomingCall?.callerUsername}</h3>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => toggleTrack('video')}
                                            className="p-2 bg-white/20 rounded-full hover:bg-white/30"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => toggleTrack('audio')}
                                            className="p-2 bg-white/20 rounded-full hover:bg-white/30"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={endCall}
                                            className="p-2 bg-red-500 rounded-full hover:bg-red-600"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 relative bg-gray-900">
                                    <video
                                        ref={remoteVideoRef}
                                        autoPlay
                                        className="w-full h-full object-contain"
                                    ></video>
                                    <video
                                        ref={localVideoRef}
                                        autoPlay
                                        muted
                                        className="absolute bottom-4 right-4 w-40 h-40 object-contain rounded-lg border-2 border-white"
                                    ></video>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 overflow-auto p-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                <div className="bg-white/70 backdrop-blur-2xl p-8 rounded-3xl shadow-xl border border-white/20">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                                Chào mừng trở lại! 👋
                                            </h3>
                                            <p className="text-gray-600 text-lg">Tổng quan về hoạt động hôm nay</p>
                                        </div>
                                        <div className="text-6xl opacity-20">
                                            🩺
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="bg-white/70 backdrop-blur-2xl p-8 rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl shadow-lg">
                                                👥
                                            </div>
                                            <div className="text-right">
                                                <p className="text-4xl font-bold text-blue-600">{stats.totalPatients}</p>
                                                <p className="text-sm text-gray-600 font-medium">Tổng bệnh nhân</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-emerald-600 font-semibold">
                                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                            +12% so với tháng trước
                                        </div>
                                    </div>
                                    <div className="bg-white/70 backdrop-blur-2xl p-8 rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-3xl flex items-center justify-center text-white text-3xl shadow-lg">
                                                📅
                                            </div>
                                            <div className="text-right">
                                                <p className="text-4xl font-bold text-green-600">{stats.todaysAppointments}</p>
                                                <p className="text-sm text-gray-600 font-medium">Lịch hẹn hôm nay</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-emerald-600 font-semibold">
                                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                            +8% so với hôm qua
                                        </div>
                                    </div>
                                    <div className="bg-white/70 backdrop-blur-2xl p-8 rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center text-white text-3xl shadow-lg">
                                                ✅
                                            </div>
                                            <div className="text-right">
                                                <p className="text-4xl font-bold text-purple-600">{stats.completedWeek}</p>
                                                <p className="text-sm text-gray-600 font-medium">Hoàn thành tuần</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-emerald-600 font-semibold">
                                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                            +15% so với tuần trước
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/70 backdrop-blur-2xl p-8 rounded-3xl shadow-xl border border-white/20">
                                    <h4 className="text-2xl font-bold text-gray-800 mb-6">Biểu đồ hoạt động</h4>
                                    <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center">
                                        <p className="text-gray-500 text-lg">Biểu đồ thống kê sẽ được hiển thị tại đây</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'appointments' && <Appointments doctorId={doctorId} />}
                        {activeTab === 'schedule' && <Schedule doctorId={doctorId} />}
                        {activeTab === 'records' && <MedicalRecords doctorId={doctorId} />}
                        {activeTab === 'feedback' && <Feedback doctorId={doctorId} />}
                        {activeTab === 'profile' && <Profile doctorId={doctorId} />}
                        {activeTab === 'messages' && (
                            <div className="bg-white/70 backdrop-blur-2xl p-8 rounded-3xl shadow-xl border border-white/20">
                                <h4 className="text-3xl font-bold text-gray-800 mb-8">Tin nhắn</h4>
                                <div className="flex h-[600px] bg-gray-50 rounded-2xl overflow-hidden">
                                    <div className="w-1/3 bg-white border-r border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h5 className="text-xl font-bold text-gray-800">Cuộc trò chuyện</h5>
                                            <button className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {[...new Set(messages.map(msg => msg.sender !== userName ? msg.sender : msg.receiver))].map((user, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleSelectChat(user)}
                                                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                                                        selectedChat === user
                                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                                            : 'bg-gray-50 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                                            selectedChat === user
                                                                ? 'bg-white/20 text-white'
                                                                : 'bg-blue-100 text-blue-600'
                                                        }`}>
                                                            {user.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">{user}</p>
                                                            <p className={`text-sm ${selectedChat === user ? 'text-white/80' : 'text-gray-500'}`}>
                                                                Nhấn để xem tin nhắn
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="w-2/3 flex flex-col">
                                        {selectedChat ? (
                                            <>
                                                <div className="p-6 bg-white border-b border-gray-200">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                                                {selectedChat.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <h5 className="text-xl font-bold text-gray-800">{selectedChat}</h5>
                                                                <p className="text-sm text-gray-500">Đang hoạt động</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <button className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                </svg>
                                                            </button>
                                                            <button className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                                    {messages
                                                        .filter(msg =>
                                                            (msg.sender === selectedChat && msg.receiver === userName) ||
                                                            (msg.sender === userName && msg.receiver === selectedChat)
                                                        )
                                                        .map((msg, index) => (
                                                            <div key={index} className={`flex ${msg.sender === userName ? 'justify-end' : 'justify-start'}`}>
                                                                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
                                                                    msg.sender === userName
                                                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                                                        : 'bg-white text-gray-800 border border-gray-200'
                                                                }`}>
                                                                    <div className="flex items-center space-x-2 mb-2">
                                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                                            msg.sender === userName ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
                                                                        }`}>
                                                                            {msg.sender === userName ? '👨‍⚕️' : '👤'}
                                                                        </div>
                                                                        <span className={`text-xs font-medium ${
                                                                            msg.sender === userName ? 'text-white/80' : 'text-gray-500'
                                                                        }`}>
                                                                            {msg.sender === userName ? 'Bác sĩ' : msg.sender}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                                                    <p className={`text-xs mt-2 ${
                                                                        msg.sender === userName ? 'text-white/70' : 'text-gray-400'
                                                                    }`}>
                                                                        {new Date(msg.sentAt).toLocaleTimeString('vi-VN', {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    {fetchError && (
                                                        <div className="text-center p-4">
                                                            <p className="text-red-500 text-sm font-medium">{fetchError}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-6 bg-white border-t border-gray-200">
                                                    <form onSubmit={sendMessage} className="flex items-center space-x-4">
                                                        <button
                                                            type="button"
                                                            className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                                        >
                                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                            </svg>
                                                        </button>
                                                        <input
                                                            type="text"
                                                            value={messageInput}
                                                            onChange={(e) => setMessageInput(e.target.value)}
                                                            placeholder="Nhập tin nhắn..."
                                                            className="flex-1 p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                        />
                                                        <button
                                                            type="submit"
                                                            disabled={!messageInput.trim()}
                                                            className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                            </svg>
                                                        </button>
                                                    </form>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex-1 flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 11.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-gray-700 mb-2">Chọn cuộc trò chuyện</h3>
                                                    <p className="text-gray-500">Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;