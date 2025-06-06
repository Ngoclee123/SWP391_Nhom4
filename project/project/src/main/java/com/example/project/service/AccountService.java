package com.example.project.service;

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
import java.util.regex.Pattern;

@Service
public class AccountService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private ParentRepository parentRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

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
        //kiem tra dinh dang dien thoai
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
}