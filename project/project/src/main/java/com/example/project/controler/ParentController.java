package com.example.project.controler;

import com.example.project.dto.ParentProfileDTO;
import com.example.project.service.ParentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/parents")
public class ParentController {

    @Autowired
    private ParentService parentService;

    @GetMapping("/profile/{accountId}")
    public ResponseEntity<ParentProfileDTO> getParentProfile(@PathVariable int accountId) {
        ParentProfileDTO profile = parentService.getParentProfile(accountId);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile/{accountId}")
    public ResponseEntity<String> updateParentProfile(@PathVariable int accountId, @RequestBody ParentProfileDTO profileDTO) {
        parentService.updateParentProfile(accountId, profileDTO);
        return ResponseEntity.ok("Profile updated successfully");
    }
}
