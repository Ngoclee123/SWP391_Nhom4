package com.example.project.controler.admin;

import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@RestController
@RequestMapping("/api/admin/doctors")
public class AdminDoctorAvatarController {
    @PostMapping("/upload-avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }
            String fileName = System.currentTimeMillis() + "_" + StringUtils.cleanPath(file.getOriginalFilename());

            // Đường dẫn tương đối từ thư mục chạy BE lên front-end/public/avatars
            Path avatarsDir = Paths.get(System.getProperty("user.dir"), "..", "front-end", "public", "avatars").normalize().toAbsolutePath();
            if (!Files.exists(avatarsDir)) {
                Files.createDirectories(avatarsDir);
            }
            Path avatarFilePath = avatarsDir.resolve(fileName);
            Files.copy(file.getInputStream(), avatarFilePath, StandardCopyOption.REPLACE_EXISTING);

            String avatarFileUrl = "/avatars/" + fileName;
            return ResponseEntity.ok().body(avatarFileUrl);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }
}