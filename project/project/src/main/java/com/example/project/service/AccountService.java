package com.example.project.service;


import com.example.project.dto.NewPasswordDTO;
import com.example.project.dto.RegisterRequestDTO;
import com.example.project.dto.ResetPasswordRequestDTO;
import com.example.project.model.Account;
import com.example.project.model.Parent;
import com.example.project.model.PasswordReset;
import com.example.project.model.Role;
import com.example.project.repository.AccountRepository;
import com.example.project.repository.ParentRepository;
import com.example.project.repository.PasswordResetRepository;

import com.example.project.dto.RegisterRequestDTO;
import com.example.project.model.Account;
import com.example.project.model.Parent;
import com.example.project.model.Role;
import com.example.project.repository.AccountRepository;
import com.example.project.repository.ParentRepository;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

import java.util.UUID;

import java.util.regex.Pattern;

@Service
public class AccountService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private ParentRepository parentRepository;

    @Autowired
    private PasswordResetRepository passwordResetRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private EmailService emailService;

    public Account findByUsername(String username) {
        return accountRepository.findByUsername(username);
    }

    public Account findById(Integer accountId) {
        return accountRepository.findById(accountId).orElse(null);
    }

    public Parent findParentByAccountId(Integer accountId) {
        return parentRepository.findByAccountId(accountId);
    }

    public void saveAccount(Account account) {
        accountRepository.save(account);
    }

    public void saveParent(Parent parent) {
        parentRepository.save(parent);
    }

    public void printAllAccounts() {
        accountRepository.findAll().forEach(account ->
                System.out.println("Account: " + account.getUsername() + ", Full Name: " + account.getFullName()));
    }

    public Iterable<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    public Account getAccountById(int patientId) {
        return accountRepository.findById(patientId).orElse(null);
    }

    public boolean changePassword(Integer accountId, String currentPassword, String newPassword) {
        Account account = accountRepository.findById(accountId).orElse(null);
        if (account == null) {
            return false; // Tài khoản không tồn tại
        }

        // Kiểm tra mật khẩu hiện tại
        if (!passwordEncoder.matches(currentPassword, account.getPasswordHash())) {
            return false; // Mật khẩu hiện tại không đúng
        }

        // Mã hóa và cập nhật mật khẩu mới
        account.setPasswordHash(passwordEncoder.encode(newPassword));
        account.setUpdatedAt(Instant.now());
        accountRepository.save(account);
        return true;
    }

    @Transactional
    public Account registerAccount(RegisterRequestDTO request) {
        // Kiểm tra dữ liệu đầu vào
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new RuntimeException("Tên đăng nhập không được để trống");
        }
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email không được để trống");
        }
        if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            throw new RuntimeException("Họ tên không được để trống");
        }
        if (request.getPassword() == null || request.getPassword().length() < 8) {
            throw new RuntimeException("Mật khẩu phải có ít nhất 8 ký tự");
        }
        if (request.getPhoneNumber() == null || request.getPhoneNumber().trim().isEmpty()) {
            throw new RuntimeException("Số điện thoại không được để trống");
        }

        // Kiểm tra định dạng email
        String emailRegex = "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$";
        if (!Pattern.matches(emailRegex, request.getEmail())) {
            throw new RuntimeException("Email không hợp lệ");
        }
        // Kiểm tra định dạng điện thoại
        String phoneRegex = "^\\+?[0-9]{10,15}$";
        if (!Pattern.matches(phoneRegex, request.getPhoneNumber())) {
            throw new RuntimeException("Số điện thoại không hợp lệ");
        }
        // Kiểm tra username đã tồn tại chưa
        if (accountRepository.findByUsername(request.getUsername()) != null) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }
        // Kiểm tra email đã tồn tại
        if (accountRepository.findByEmail(request.getEmail()) != null) {
            throw new RuntimeException("Email đã được sử dụng");
        }

        // Tạo tài khoản mới
        Account account = new Account();
        account.setUsername(request.getUsername());
        account.setFullName(request.getFullName());
        account.setEmail(request.getEmail());
        account.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        account.setPhoneNumber(request.getPhoneNumber());
        account.setStatus(true); // Tài khoản mặc định là active
        account.setCreatedAt(Instant.now());
        account.setUpdatedAt(Instant.now());

        // Gán vai trò mặc định (giả sử Role có id = 1 là vai trò "USER")
        Role role = new Role();
        role.setId(1); // Cần thay đổi nếu bạn có cách lấy role khác
        account.setRole(role);

        // Lưu tài khoản
        account = accountRepository.saveAndFlush(account);

        // Tạo một Parent liên quan đến tài khoản này
        Parent parent = new Parent();
        parent.setAccount(account);
        parent.setFullName(request.getFullName());
        parent.setPhoneNumber(request.getPhoneNumber());
        parent.setCreatedAt(Instant.now());

        parentRepository.save(parent);

        return account;
    }

    @Transactional
    public Account processGoogleAccount(String email, String fullName) {
        Account account = accountRepository.findByEmail(email);
        if (account == null) {
            account = new Account();
            account.setEmail(email);
            account.setFullName(fullName);
            account.setUsername(email.split("@")[0]); // Tạm thời dùng email làm username
            account.setPasswordHash(passwordEncoder.encode("")); // Không cần password cho Google login
            account.setStatus(true);
            account.setCreatedAt(Instant.now());
            account.setUpdatedAt(Instant.now());

            // Gán vai trò mặc định (USER)
            Role role = new Role();
            role.setId(1); // Role USER
            account.setRole(role);

            account = accountRepository.saveAndFlush(account);

            // Tạo Parent với thông tin từ Google
            Parent parent = new Parent();
            parent.setAccount(account);
            parent.setFullName(fullName);
            parent.setPhoneNumber(""); // Cần cập nhật sau nếu có
            parent.setAddress(""); // Cần cập nhật sau nếu có
            parent.setCreatedAt(Instant.now());
            parentRepository.save(parent);
        } else {
            // Cập nhật thông tin nếu cần
            account.setFullName(fullName);
            account.setUpdatedAt(Instant.now());
            accountRepository.save(account);

            Parent parent = parentRepository.findByAccountId(account.getId());
            if (parent != null) {
                parent.setFullName(fullName);
                parentRepository.save(parent);
            }
        }
        return account;
    }

    @Transactional
    public String requestPasswordReset(ResetPasswordRequestDTO request) {
        Account account = accountRepository.findByUsername(request.getUsername());
        if (account == null) {
            throw new RuntimeException("Tên đăng nhập không tồn tại");
        }

        String email = account.getEmail();
        if (email == null || email.isEmpty()) {
            throw new RuntimeException("Tài khoản này không có email liên kết");
        }

        String token = UUID.randomUUID().toString();
        PasswordReset passwordReset = new PasswordReset();
        passwordReset.setAccount(account);
        passwordReset.setToken(token);
        passwordReset.setExpiresAt(Instant.now().plusSeconds(3600)); // Token hết hạn sau 1 giờ
        passwordReset.setCreatedAt(Instant.now());
        passwordResetRepository.save(passwordReset);

        // Gửi email với liên kết đặt lại mật khẩu
        String resetLink = "http://localhost:3000/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(email, resetLink);

        return token;
    }

    @Transactional
    public boolean resetPassword(NewPasswordDTO request) {
        PasswordReset passwordReset = passwordResetRepository.findByToken(request.getToken());
        if (passwordReset == null || passwordReset.getExpiresAt().isBefore(Instant.now())) {
            return false; // Token không hợp lệ hoặc đã hết hạn
        }

        Account account = passwordReset.getAccount();
        if (request.getNewPassword() == null || request.getNewPassword().length() < 8) {
            throw new RuntimeException("Mật khẩu mới phải có ít nhất 8 ký tự");
        }

        account.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        account.setUpdatedAt(Instant.now());
        accountRepository.save(account);

        // Xóa token sau khi sử dụng
        passwordResetRepository.delete(passwordReset);
        return true;
    }

}