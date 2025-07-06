package com.example.project.config.websocket;// package com.example.project.config.websocket;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.corundumstudio.socketio.annotation.OnEvent;
import com.example.project.config.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Component
@Slf4j
public class VideoCallSocketHandler {

    private final SocketIOServer server;
    private final JwtUtil jwtUtil;
    private static final Map<String, String> users = new HashMap<>(); // clientId -> username
    private static final Map<String, String> rooms = new HashMap<>(); // room -> clientId

    @Autowired
    public VideoCallSocketHandler(SocketIOServer server, JwtUtil jwtUtil) {
        this.server = server;
        this.jwtUtil = jwtUtil;
        server.addListeners(this);
    }

    @PostConstruct
    public void start() {
        server.start();
        log.info("Socket.IO server started on {}:{}", server.getConfiguration().getHostname(), server.getConfiguration().getPort());
    }

    @PreDestroy
    public void stop() {
        server.stop();
        log.info("Socket.IO server stopped");
    }

    @OnConnect
    public void onConnect(SocketIOClient client) {
        String authToken = client.getHandshakeData().getSingleUrlParam("token");
        if (authToken != null && authToken.startsWith("Bearer ")) {
            String jwt = authToken.substring(7);
            if (jwtUtil.validateToken(jwt)) {
                String username = jwtUtil.extractUsername(jwt);
                String clientId = client.getSessionId().toString();
                users.put(clientId, username);
                log.info("Client connected: {} (username: {})", clientId, username);
            } else {
                client.disconnect();
                log.warn("Invalid JWT token for client: {}", client.getSessionId());
            }
        } else {
            client.disconnect();
            log.warn("Missing Authorization token for client: {}", client.getSessionId());
        }
    }

    @OnDisconnect
    public void onDisconnect(SocketIOClient client) {
        String clientId = client.getSessionId().toString();
        String username = users.get(clientId);
        String room = rooms.entrySet().stream()
                .filter(entry -> entry.getValue().equals(clientId))
                .map(Map.Entry::getKey)
                .findFirst()
                .orElse(null);

        if (room != null) {
            users.remove(clientId);
            rooms.remove(room);
            client.getNamespace().getRoomOperations(room).sendEvent("userDisconnected", username);
            log.info("Client disconnected: {} (username: {}) from room: {}", clientId, username, room);
        }
    }

    @OnEvent("callRequest")
    public void onCallRequest(SocketIOClient client, Map<String, Object> payload, AckRequest ackRequest) {
        String doctorUsername = (String) payload.get("doctorUsername");
        String room = (String) payload.get("room");
        String callerUsername = users.get(client.getSessionId().toString());

        // Gửi thông báo cuộc gọi đến bác sĩ
        server.getAllClients().forEach(c -> {
            if (Objects.equals(users.get(c.getSessionId().toString()), doctorUsername)) {
                c.sendEvent("incomingCall", Map.of(
                        "callerUsername", callerUsername,
                        "room", room
                ));
            }
        });
        log.info("Call request from {} to {} for room {}", callerUsername, doctorUsername, room);
    }

    @OnEvent("callResponse")
    public void onCallResponse(SocketIOClient client, Map<String, Object> payload) {
        String room = (String) payload.get("room");
        String callerUsername = (String) payload.get("callerUsername");
        boolean accepted = (Boolean) payload.get("accepted");
        String doctorUsername = users.get(client.getSessionId().toString());

        // Thông báo lại cho người gọi
        server.getAllClients().forEach(c -> {
            if (Objects.equals(users.get(c.getSessionId().toString()), callerUsername)) {
                c.sendEvent("callResponse", Map.of(
                        "accepted", accepted,
                        "room", room,
                        "doctorUsername", doctorUsername
                ));
            }
        });

        if (accepted) {
            client.joinRoom(room);
            users.put(client.getSessionId().toString(), room);
            rooms.put(room, client.getSessionId().toString());
            client.sendEvent("joined", room);
        }
        log.info("Call response from {} to {} for room {}: {}", doctorUsername, callerUsername, room, accepted ? "Accepted" : "Rejected");
    }

    @OnEvent("joinRoom")
    public void onJoinRoom(SocketIOClient client, String room) {
        int connectedClients = server.getRoomOperations(room).getClients().size();
        String username = users.get(client.getSessionId().toString());

        if (connectedClients == 0) {
            client.joinRoom(room);
            client.sendEvent("created", room);
            users.put(client.getSessionId().toString(), room);
            rooms.put(room, client.getSessionId().toString());
            log.info("User {} created room {}", username, room);
        } else if (connectedClients == 1) {
            client.joinRoom(room);
            client.sendEvent("joined", room);
            users.put(client.getSessionId().toString(), room);
            client.sendEvent("setCaller", rooms.get(room));
            log.info("User {} joined room {}", username, room);
        } else {
            client.sendEvent("full", room);
            log.warn("Room {} is full for user {}", room, username);
        }
    }

    @OnEvent("ready")
    public void onReady(SocketIOClient client, String room) {
        client.getNamespace().getBroadcastOperations().sendEvent("ready", room);
        log.info("User {} is ready in room {}", users.get(client.getSessionId().toString()), room);
    }

    @OnEvent("candidate")
    public void onCandidate(SocketIOClient client, Map<String, Object> payload) {
        String room = (String) payload.get("room");
        client.getNamespace().getRoomOperations(room).sendEvent("candidate", payload);
        log.info("ICE candidate in room {} from {}", room, users.get(client.getSessionId().toString()));
    }

    @OnEvent("offer")
    public void onOffer(SocketIOClient client, Map<String, Object> payload) {
        String room = (String) payload.get("room");
        Object sdp = payload.get("sdp");
        client.getNamespace().getRoomOperations(room).sendEvent("offer", sdp);
        log.info("Offer in room {} from {}", room, users.get(client.getSessionId().toString()));
    }

    @OnEvent("answer")
    public void onAnswer(SocketIOClient client, Map<String, Object> payload) {
        String room = (String) payload.get("room");
        Object sdp = payload.get("sdp");
        client.getNamespace().getRoomOperations(room).sendEvent("answer", sdp);
        log.info("Answer in room {} from {}", room, users.get(client.getSessionId().toString()));
    }

    @OnEvent("leaveRoom")
    public void onLeaveRoom(SocketIOClient client, String room) {
        client.leaveRoom(room);
        users.remove(client.getSessionId().toString());
        rooms.remove(room);
        client.getNamespace().getRoomOperations(room).sendEvent("userDisconnected", users.get(client.getSessionId().toString()));
        log.info("User {} left room {}", users.get(client.getSessionId().toString()), room);
    }
}