package com.example.project.controler;

import com.example.project.model.Account;
import com.example.project.repository.AccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    private static final Logger logger = LoggerFactory.getLogger(TestController.class);

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private DataSource dataSource;

    @GetMapping("/password")
    public String testPassword() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String rawPassword = "123456";
        String storedHash = "$2a$10$7tJrcOd/Nt5FEJ8Zysrw5uJ8asJ7aBpVq/P9lKAzgIWVvtf8ElTQO";
        
        boolean matches = encoder.matches(rawPassword, storedHash);
        
        return String.format("""
            Testing password: %s
            Stored hash: %s
            Password matches: %s
            """, rawPassword, storedHash, matches);
    }

    @GetMapping("/update-sarah-password")
    public String updateSarahPassword() {
        try {
            Account sarahAccount = accountRepository.findByUsername("sarah_lee");
            if (sarahAccount == null) {
                return "User sarah_lee not found";
            }
            
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            String newPasswordHash = encoder.encode("123456");
            
            sarahAccount.setPasswordHash(newPasswordHash);
            accountRepository.save(sarahAccount);
            
            return String.format("""
                Updated sarah_lee password successfully!
                New hash: %s
                Test with '123456': %s
                """, newPasswordHash, encoder.matches("123456", newPasswordHash));
        } catch (Exception e) {
            return "Error updating password: " + e.getMessage();
        }
    }

    @GetMapping("/database")
    public ResponseEntity<Map<String, Object>> testDatabaseConnection() {
        Map<String, Object> response = new HashMap<>();
        
        try (Connection connection = dataSource.getConnection()) {
            boolean isValid = connection.isValid(5); // 5 seconds timeout
            response.put("status", "success");
            response.put("message", "Database connection successful");
            response.put("isValid", isValid);
            response.put("databaseProductName", connection.getMetaData().getDatabaseProductName());
            response.put("databaseProductVersion", connection.getMetaData().getDatabaseProductVersion());
            logger.info("Database connection test successful");
            return ResponseEntity.ok(response);
        } catch (SQLException e) {
            logger.error("Database connection test failed: {}", e.getMessage());
            response.put("status", "error");
            response.put("message", "Database connection failed: " + e.getMessage());
            response.put("errorCode", e.getErrorCode());
            response.put("sqlState", e.getSQLState());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/avatars")
    public ResponseEntity<Map<String, Object>> testAvatarsPath() {
        Map<String, Object> response = new HashMap<>();
        
        String currentDir = System.getProperty("user.dir");
        response.put("currentWorkingDirectory", currentDir);
        
        // Test các pattern đường dẫn có thể có
        String[] searchPatterns = {
            currentDir + "/front-end/public/avatars/",
            currentDir + "/../front-end/public/avatars/",
            currentDir + "/../../front-end/public/avatars/",
            currentDir + "/avatars/"
        };
        
        Map<String, Object> pathChecks = new HashMap<>();
        for (String path : searchPatterns) {
            Path testPath = Paths.get(path);
            boolean exists = testPath.toFile().exists();
            boolean isDirectory = testPath.toFile().isDirectory();
            
            Map<String, Object> pathInfo = new HashMap<>();
            pathInfo.put("exists", exists);
            pathInfo.put("isDirectory", isDirectory);
            pathInfo.put("absolutePath", testPath.toAbsolutePath().toString());
            
            if (exists && isDirectory) {
                File[] files = testPath.toFile().listFiles();
                pathInfo.put("fileCount", files != null ? files.length : 0);
                pathInfo.put("sampleFiles", files != null && files.length > 0 ? 
                    java.util.Arrays.stream(files).limit(5).map(File::getName).toArray() : new String[0]);
            }
            
            pathChecks.put(path, pathInfo);
        }
        
        response.put("pathChecks", pathChecks);
        response.put("status", "success");
        
        // Test tìm kiếm đệ quy
        String foundPath = searchRecursivelyForAvatars(Paths.get(currentDir));
        response.put("recursiveSearchResult", foundPath);
        
        return ResponseEntity.ok(response);
    }
    
    private String searchRecursivelyForAvatars(Path startPath) {
        try {
            // Tìm kiếm trong thư mục hiện tại
            Path targetPath = startPath.resolve("front-end/public/avatars");
            if (targetPath.toFile().exists() && targetPath.toFile().isDirectory()) {
                return targetPath.toAbsolutePath().toString();
            }
            
            // Tìm kiếm trong các thư mục con
            File[] subDirs = startPath.toFile().listFiles(File::isDirectory);
            if (subDirs != null) {
                for (File subDir : subDirs) {
                    // Bỏ qua các thư mục hệ thống
                    if (subDir.getName().startsWith(".") || 
                        subDir.getName().equals("node_modules") || 
                        subDir.getName().equals("target") ||
                        subDir.getName().equals(".git")) {
                        continue;
                    }
                    
                    String result = searchRecursivelyForAvatars(subDir.toPath());
                    if (result != null) {
                        return result;
                    }
                }
            }
            
            // Tìm kiếm trong thư mục cha
            Path parent = startPath.getParent();
            if (parent != null && !parent.equals(startPath)) {
                return searchRecursivelyForAvatars(parent);
            }
            
        } catch (Exception e) {
            System.err.println("Error searching for avatars directory: " + e.getMessage());
        }
        
        return null;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", System.currentTimeMillis());
        response.put("application", "BabyHealthHub");
        return ResponseEntity.ok(response);
    }
} 