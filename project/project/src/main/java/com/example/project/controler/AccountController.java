package com.example.project.controler;

import com.example.project.dto.ChangePasswordDTO;
import com.example.project.dto.ParentProfileDTO;
import com.example.project.model.Account;
import com.example.project.model.Parent;
import com.example.project.model.Role;
import com.example.project.service.AccountService;
import com.example.project.repository.RoleRepository;
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

    @Autowired
    private RoleRepository roleRepository;

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

    // CRUD for Account (Admin)
    @GetMapping("")
    public ResponseEntity<?> getAllAccounts() {
        try {
            return ResponseEntity.ok(accountService.findAll());
        } catch (Exception e) {
            logger.error("Error fetching accounts: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching accounts");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAccountById(@PathVariable Integer id) {
        try {
            Account account = accountService.findById(id);
            if (account == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Account not found");
            }
            return ResponseEntity.ok(account);
        } catch (Exception e) {
            logger.error("Error fetching account: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching account");
        }
    }

    @PostMapping("")
    public ResponseEntity<?> createAccount(@RequestBody Account account, @RequestParam String role) {
        try {
            // Không cần account_id khi tạo mới, để database tự sinh
            // if (account.getId() != null) {
            //     return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Không cần truyền account_id khi tạo mới");
            // }
            // Lấy role từ tên (rolename) gửi lên từ front-end
            if (role == null || role.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Role is required");
            }
            var roleEntity = roleRepository.findByRolename(role);
            if (roleEntity == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Role not found");
            }
            account.setRole(roleEntity);
            Account created = accountService.saveAccount(account);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            logger.error("Error creating account: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating account");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAccount(@PathVariable Integer id, @RequestBody Account account) {
        try {
            Account existing = accountService.findById(id);
            if (existing == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Account not found");
            }
            account.setId(id);
            Account updated = accountService.saveAccount(account);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            logger.error("Error updating account: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating account");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAccount(@PathVariable Integer id) {
        try {
            boolean deleted = accountService.deleteAccount(id);
            if (!deleted) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Account not found");
            }
            return ResponseEntity.ok("Account deleted successfully");
        } catch (Exception e) {
            logger.error("Error deleting account: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting account");
        }
    }

}