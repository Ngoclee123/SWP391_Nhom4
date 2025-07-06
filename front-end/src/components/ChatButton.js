import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import UserService from '../service/userService';
import DoctorService from '../service/DoctorService';
import axiosClient from '../api/axiosClient';
import io from 'socket.io-client';

const ChatButton = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [stompClient, setStompClient] = useState(null);
    const [connecting, setConnecting] = useState(false);
    const [specialties, setSpecialties] = useState([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState(null);
    const [availableDoctors, setAvailableDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDoctorInfo, setSelectedDoctorInfo] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [messageHistory, setMessageHistory] = useState({});
    const [isTyping, setIsTyping] = useState(false);
    const [onlineStatus, setOnlineStatus] = useState(true);
    const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
    const [callStatus, setCallStatus] = useState(null); // null, 'calling', 'accepted', 'rejected'
    const [roomName, setRoomName] = useState('');
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [rtcPeerConnection, setRtcPeerConnection] = useState(null);
    const [isCaller, setIsCaller] = useState(false);
    const messageAreaRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const socketRef = useRef(null);

    const colors = [
        '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
        '#f59e0b', '#84cc16', '#22c55e', '#10b981', '#06b6d4'
    ];

    const iceServers = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };

    const streamConstraints = { audio: true, video: true };

    const getAvatarColor = (sender) => {
        let hash = 0;
        for (let i = 0; i < sender.length; i++) {
            hash = 31 * hash + sender.charCodeAt(i);
        }
        return colors[Math.abs(hash % colors.length)];
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / 60000);

        if (diffInMinutes < 1) return 'Vừa xong';
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;

        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const addMessage = (message, doctorUsername) => {
        const targetDoctor = doctorUsername || selectedDoctor;
        if (!targetDoctor) return;

        setMessageHistory(prev => {
            const doctorMessages = prev[targetDoctor] || [];
            const isDuplicate = doctorMessages.some(msg =>
                msg.content === message.content && msg.sender === message.sender &&
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

    const fetchMessageHistory = async (senderId, receiverId, doctorUsername) => {
        try {
            const token = UserService.getToken();
            if (!token) return;

            const response = await axiosClient.get(`/api/messages/history/${senderId}/${receiverId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const historyMessages = response.data || [];
            setMessageHistory(prev => ({
                ...prev,
                [doctorUsername]: historyMessages.map(msg => ({
                    ...msg,
                    id: msg.id || Date.now() + Math.random(),
                    sentAt: msg.sentAt || new Date().toISOString()
                }))
            }));
        } catch (error) {
            console.error('Lỗi khi lấy lịch sử tin nhắn:', error);
            setErrorMessage('Không thể tải lịch sử tin nhắn');
        }
    };

    const connect = (doctorUsername) => {
        if (!UserService.isLoggedIn()) return;

        if (stompClient) {
            stompClient.deactivate();
            setStompClient(null);
        }

        const user = {
            username: UserService.getUsername(),
            fullName: UserService.getFullName(),
            accountId: UserService.getAccountId()
        };

        setUsername(user.username);
        setConnecting(true);

        const socket = new SockJS('http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: { Authorization: `Bearer ${UserService.getToken()}` },
            onConnect: () => {
                setConnecting(false);
                setStompClient(client);
                setOnlineStatus(true);

                client.subscribe(`/user/${user.username}/queue/messages`, (payload) => {
                    const message = JSON.parse(payload.body);
                    const messageDoctorUsername = message.sender === user.username ? message.receiver : message.sender;
                    addMessage(message, messageDoctorUsername);
                });

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
                console.error('Lỗi WebSocket:', error);
                setConnecting(false);
                setOnlineStatus(false);
                setErrorMessage('Không thể kết nối chat');
            }
        });

        client.activate();
    };

    const disconnect = () => {
        if (stompClient) {
            stompClient.deactivate();
            setStompClient(null);
        }
        setSelectedDoctor(null);
        setSelectedDoctorInfo(null);
        setMessages([]);
        setOnlineStatus(false);
        cleanup();
    };

    const fetchSpecialties = async () => {
        try {
            const response = await DoctorService.getAllSpecialties();
            setSpecialties(response || []);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách chuyên khoa:', error);
            setErrorMessage('Không thể tải danh sách chuyên khoa');
        }
    };

    const handleSelectSpecialty = async (specialtyId) => {
        setSelectedSpecialty(specialtyId);
        setSelectedDoctor(null);
        setSelectedDoctorInfo(null);
        try {
            const response = await DoctorService.getAllDoctorsBySpecialty(specialtyId);
            setAvailableDoctors(response?.data || []);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách bác sĩ:', error);
            setErrorMessage('Không thể tải danh sách bác sĩ');
        }
    };

    const handleSelectDoctor = async (doctor) => {
        setSelectedDoctor(doctor.username);
        setSelectedDoctorInfo(doctor);
        await fetchMessageHistory(UserService.getAccountId(), doctor.id, doctor.username);
        connect(doctor.username);
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !stompClient || !selectedDoctor) return;

        const chatMessage = {
            sender: username,
            receiver: selectedDoctor,
            content: messageInput.trim(),
            type: 'CHAT',
            sentAt: new Date().toISOString()
        };

        stompClient.publish({
            destination: '/app/chat.sendPrivateMessage',
            body: JSON.stringify(chatMessage)
        });

        addMessage(chatMessage, selectedDoctor);
        setMessageInput('');
    };

    const initiateCall = () => {
        if (!selectedDoctor) return;
        const room = `${username}-${selectedDoctor}-${Date.now()}`;
        setRoomName(room);
        setCallStatus('calling');
        socketRef.current.emit('callRequest', {
            doctorUsername: selectedDoctor,
            room,
            callerUsername: username
        });
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
        setCallStatus(null);
        cleanup();
    };

    useEffect(() => {
        if (selectedDoctor && messageHistory[selectedDoctor]) {
            setMessages(messageHistory[selectedDoctor]);
        } else {
            setMessages([]);
        }
    }, [selectedDoctor, messageHistory]);

    useEffect(() => {
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (isChatOpen && UserService.isLoggedIn()) {
            fetchSpecialties();
            socketRef.current = io('http://localhost:8000', {
                query: { token: `Bearer ${UserService.getToken()}` }
            });

            socketRef.current.on('connect', () => {
                console.log('Socket.IO connected');
            });

            socketRef.current.on('callResponse', (data) => {
                if (data.accepted) {
                    setCallStatus('accepted');
                    setIsVideoCallOpen(true);
                    socketRef.current.emit('joinRoom', data.room);
                } else {
                    setCallStatus('rejected');
                    setTimeout(() => setCallStatus(null), 3000);
                }
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
                        setErrorMessage('Không thể truy cập camera/mic');
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
                        setErrorMessage('Không thể truy cập camera/mic');
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
                setCallStatus(null);
                cleanup();
            });

            return () => {
                socketRef.current.disconnect();
            };
        }
    }, [isChatOpen]);

    if (!UserService.isLoggedIn()) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Button */}
            <button
                className={`relative bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/25 hover:scale-110 transform transition-all duration-300 group ${isChatOpen ? 'rotate-45' : ''}`}
                onClick={() => setIsChatOpen(!isChatOpen)}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative">
                    {isChatOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 11.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    )}
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">!</span>
                </div>
            </button>

            {/* Chat Window */}
            {isChatOpen && (
                <div className="w-96 h-[600px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col absolute bottom-20 right-0 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white p-5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent"></div>
                        <div className="relative flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                                        {selectedDoctorInfo ? (
                                            <span className="text-lg font-semibold">
                                                {selectedDoctorInfo.fullName.charAt(0).toUpperCase()}
                                            </span>
                                        ) : (
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.431 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    {selectedDoctorInfo && (
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${onlineStatus ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">
                                        {selectedDoctorInfo ? `BS. ${selectedDoctorInfo.fullName}` : 'Chat Trực Tuyến'}
                                    </h2>
                                    <p className="text-sm text-blue-100 flex items-center">
                                        {selectedDoctorInfo ? (
                                            <>
                                                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${onlineStatus ? 'bg-green-300' : 'bg-gray-300'}`}></span>
                                                {onlineStatus ? 'Đang trực tuyến' : 'Không hoạt động'}
                                            </>
                                        ) : (
                                            'Chọn bác sĩ để bắt đầu'
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {selectedDoctor && (
                                    <>
                                        <button
                                            onClick={initiateCall}
                                            className="text-white hover:text-blue-200 p-2 rounded-full hover:bg-white/10 transition-all duration-200"
                                            title="Gọi video"
                                            disabled={callStatus === 'calling'}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={disconnect}
                                            className="text-white hover:text-red-300 p-2 rounded-full hover:bg-white/10 transition-all duration-200"
                                            title="Rời khỏi cuộc trò chuyện"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => setIsChatOpen(false)}
                                    className="text-white hover:text-blue-200 p-2 rounded-full hover:bg-white/10 transition-all duration-200"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                        {/* Call Status Notification */}
                        {callStatus === 'calling' && (
                            <div className="p-4 bg-blue-50 text-blue-700 text-center">
                                Đang gọi BS. {selectedDoctorInfo?.fullName}...
                            </div>
                        )}
                        {callStatus === 'rejected' && (
                            <div className="p-4 bg-red-50 text-red-700 text-center">
                                BS. {selectedDoctorInfo?.fullName} đã từ chối cuộc gọi
                            </div>
                        )}

                        {/* Video Call Window */}
                        {isVideoCallOpen && (
                            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                                <div className="bg-white rounded-3xl w-[800px] h-[600px] flex flex-col overflow-hidden">
                                    <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-4 flex justify-between items-center">
                                        <h3 className="text-lg font-bold">Gọi video với BS. {selectedDoctorInfo?.fullName}</h3>
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

                        {/* Chọn chuyên khoa */}
                        {!selectedSpecialty && (
                            <div className="p-6 flex-1 overflow-y-auto">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Chọn chuyên khoa</h3>
                                    <p className="text-gray-600 text-sm">Vui lòng chọn chuyên khoa phù hợp để được tư vấn</p>
                                </div>
                                <div className="space-y-3">
                                    {specialties.map((specialty, index) => (
                                        <button
                                            key={specialty.id}
                                            onClick={() => handleSelectSpecialty(specialty.id)}
                                            className="w-full text-left p-4 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 hover:border-blue-200 transition-all duration-200 group transform hover:scale-[1.02]"
                                            style={{ animationDelay: `${index * 100}ms` }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                                                        {specialty.name}
                                                    </span>
                                                </div>
                                                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Chọn bác sĩ */}
                        {selectedSpecialty && !selectedDoctor && (
                            <div className="p-6 flex-1 overflow-y-auto">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">Chọn bác sĩ</h3>
                                        <p className="text-gray-600 text-sm">Các bác sĩ đang trực tuyến</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedSpecialty(null)}
                                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center text-sm bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Quay lại
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {availableDoctors.map((doctor, index) => (
                                        <button
                                            key={doctor.id}
                                            onClick={() => handleSelectDoctor(doctor)}
                                            className="w-full text-left p-4 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 hover:border-blue-200 transition-all duration-200 group transform hover:scale-[1.02]"
                                            style={{ animationDelay: `${index * 100}ms` }}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md"
                                                    style={{ backgroundColor: getAvatarColor(doctor.fullName) }}
                                                >
                                                    {doctor.fullName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                                        BS. {doctor.fullName}
                                                    </div>
                                                    <div className="text-sm text-gray-600">{doctor.specialty}</div>
                                                    <div className="flex items-center mt-1">
                                                        <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                                        <span className="text-xs text-green-600 font-medium">Đang trực tuyến</span>
                                                    </div>
                                                </div>
                                                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 11.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Chat area */}
                        {selectedDoctor && !isVideoCallOpen && (
                            <>
                                <div ref={messageAreaRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                                    {connecting ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="flex items-center space-x-3">
                                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                                                <span className="text-gray-600">Đang kết nối...</span>
                                            </div>
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 11.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                            </div>
                                            <h4 className="text-gray-800 font-medium mb-2">Bắt đầu cuộc trò chuyện</h4>
                                            <p className="text-gray-600 text-sm">Gửi tin nhắn đầu tiên để bắt đầu tư vấn</p>
                                        </div>
                                    ) : (
                                        messages.map((message, index) => (
                                            <div key={message.id || index} className={`flex items-end space-x-3 ${message.sender === username ? 'justify-end' : ''}`}>
                                                {message.sender !== username && (
                                                    <div
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-md flex-shrink-0"
                                                        style={{ backgroundColor: getAvatarColor(message.sender) }}
                                                    >
                                                        {message.sender?.charAt(0)?.toUpperCase() || 'D'}
                                                    </div>
                                                )}
                                                <div className={`max-w-xs px-4 py-3 rounded-2xl shadow-sm ${message.sender === username ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md' : 'bg-white border border-gray-200 rounded-bl-md'}`}>
                                                    <p className="text-sm leading-relaxed">{message.content}</p>
                                                    <p className={`text-xs mt-2 ${message.sender === username ? 'text-blue-100' : 'text-gray-500'}`}>
                                                        {formatTime(message.sentAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    {isTyping && (
                                        <div className="flex items-end space-x-3">
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-md"
                                                style={{ backgroundColor: getAvatarColor(selectedDoctor) }}
                                            >
                                                D
                                            </div>
                                            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-white border-t border-gray-200">
                                    <form onSubmit={sendMessage} className="flex gap-3">
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={messageInput}
                                                onChange={(e) => setMessageInput(e.target.value)}
                                                placeholder="Nhập tin nhắn..."
                                                className="w-full p-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                disabled={!stompClient || connecting}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                </svg>
                                            </button>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={!messageInput.trim() || !stompClient || connecting}
                                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        </button>
                                    </form>
                                </div>
                            </>
                        )}
                    </div>

                    {errorMessage && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4 rounded-lg animate-in slide-in-from-top-2">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="text-red-700 font-medium">Lỗi kết nối</p>
                                    <p className="text-red-600 text-sm">{errorMessage}</p>
                                </div>
                                <button
                                    onClick={() => setErrorMessage('')}
                                    className="ml-auto text-red-400 hover:text-red-600 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatButton;