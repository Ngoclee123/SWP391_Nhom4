package com.example.project.controler;

import com.example.project.dto.AccountDTO;
import com.example.project.dto.ChangePasswordDTO;
import com.example.project.dto.ParentProfileDTO;
import com.example.project.model.Account;
import com.example.project.model.Parent;
import com.example.project.service.AccountService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private static final Logger logger = LoggerFactory.getLogger(AccountController.class);

    @Autowired
    private AccountService accountService;

    @GetMapping("/profile/{accountId}")
    public ResponseEntity<?> getParentProfile(@PathVariable Integer accountId) {
        logger.info("Fetching profile for accountId: {}", accountId);
        try {
            Account account = accountService.findById(accountId);
            if (account == null) {
                logger.warn("Account not found for accountId: {}", accountId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Account not found");
            }

            Parent parent = accountService.findParentByAccountId(accountId);
            if (parent == null) {
                logger.warn("Parent profile not found for accountId: {}", accountId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Parent profile not found");
            }

            ParentProfileDTO profileDTO = new ParentProfileDTO(
                    parent.getFullName(),
                    account.getEmail(),
                    parent.getPhoneNumber(),
                    parent.getAddress() != null ? parent.getAddress() : account.getAddress(),
                    parent.getDateOfBirth()
            );
            return ResponseEntity.ok(profileDTO);
        } catch (Exception e) {
            logger.error("Error fetching profile for accountId {}: {}", accountId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching profile");
        }
    }

    @PutMapping("/profile/{accountId}")
    public ResponseEntity<?> updateParentProfile(@PathVariable Integer accountId, @RequestBody ParentProfileDTO profileDTO) {
        logger.info("Updating profile for accountId: {}", accountId);
        try {
            Account account = accountService.findById(accountId);
            if (account == null) {
                logger.warn("Account not found for accountId: {}", accountId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Account not found");
            }

            Parent parent = accountService.findParentByAccountId(accountId);
            if (parent == null) {
                logger.warn("Parent profile not found for accountId: {}", accountId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Parent profile not found");
            }
            parent.setDateOfBirth(profileDTO.getDateOfBirth());
            parent.setFullName(profileDTO.getFullName());
            parent.setPhoneNumber(profileDTO.getPhoneNumber());
            parent.setAddress(profileDTO.getAddress());
            account.setEmail(profileDTO.getEmail());

            accountService.saveAccount(account);
            accountService.saveParent(parent);

            return ResponseEntity.ok("Profile updated successfully");
        } catch (Exception e) {
            logger.error("Error updating profile for accountId {}: {}", accountId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update profile");
        }
    }

    @PutMapping("/change-password/{accountId}")
    public ResponseEntity<?> changePassword(@PathVariable Integer accountId, @RequestBody ChangePasswordDTO changePasswordDTO) {
        logger.info("Changing password for accountId: {}", accountId);
        try {
            boolean success = accountService.changePassword(accountId, changePasswordDTO.getCurrentPassword(), changePasswordDTO.getNewPassword());
            if (!success) {
                logger.warn("Invalid current password or account not found for accountId: {}", accountId);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mật khẩu hiện tại không đúng hoặc tài khoản không tồn tại");
            }
            return ResponseEntity.ok("Đổi mật khẩu thành công");
        } catch (Exception e) {
            logger.error("Error changing password for accountId {}: {}", accountId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi đổi mật khẩu");
        }


    }

    @GetMapping("/username/{username}")
    public ResponseEntity<AccountDTO> getAccountByUsername(@PathVariable String username) {
        Account account = accountService.findByUsername(username);
        if (account == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new AccountDTO(account));
    }
}