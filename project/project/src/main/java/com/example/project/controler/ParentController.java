package com.example.project.controler;

import com.example.project.dto.ParentProfileDTO;
import com.example.project.service.ParentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/parents")
public class ParentController {

    private static final Logger logger = LoggerFactory.getLogger(ParentController.class);

    @Autowired
    private ParentService parentService;

    @GetMapping("/profile/{accountId}")
    public ResponseEntity<ParentProfileDTO> getParentProfile(@PathVariable int accountId) {
        logger.info("Fetching profile for accountId: {}", accountId);
        try {
            ParentProfileDTO profile = parentService.getParentProfile(accountId);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            logger.error("Error fetching profile for accountId {}: {}", accountId, e.getMessage());
            return ResponseEntity.status(404).body(null);
        }
    }


    @GetMapping("/account/{accountId}")
    public ResponseEntity<Map<String, Object>> getParentIdByAccountId(@PathVariable int accountId) {
        logger.info("Fetching parentId for accountId: {}", accountId);
        try {
            Integer parentId = parentService.getParentIdByAccountId(accountId);
            if (parentId != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("parentId", parentId);
                response.put("accountId", accountId);
                return ResponseEntity.ok(response);
            } else {
                // Thử tạo Parent record nếu chưa có
                logger.warn("Parent not found for accountId: {}, attempting to create", accountId);
//                parentId = parentService.createParentForAccount(accountId);
                if (parentId != null) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("parentId", parentId);
                    response.put("accountId", accountId);
                    response.put("created", true);
                    return ResponseEntity.ok(response);
                } else {
                    return ResponseEntity.status(404).body(Map.of("error", "Parent not found and could not create for accountId: " + accountId));
                }
            }
        } catch (Exception e) {
            logger.error("Error fetching parentId for accountId {}: {}", accountId, e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }


    @PutMapping("/profile/{accountId}")
    public ResponseEntity<String> updateParentProfile(@PathVariable int accountId, @RequestBody ParentProfileDTO profileDTO) {
        logger.info("Updating profile for accountId: {}", accountId);
        try {
            parentService.updateParentProfile(accountId, profileDTO);
            return ResponseEntity.ok("Profile updated successfully");
        } catch (Exception e) {
            logger.error("Error updating profile for accountId {}: {}", accountId, e.getMessage());
            return ResponseEntity.status(500).body("Failed to update profile");
        }
    }
}