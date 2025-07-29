package com.example.project.controler.admin;

import com.example.project.model.Account;
import com.example.project.model.Doctor;
import com.example.project.model.Role;
import com.example.project.model.Specialty;
import com.example.project.repository.AccountRepository;
import com.example.project.repository.DoctorRepository;
import com.example.project.repository.RoleRepository;
import com.example.project.repository.SpecialtyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/admin/accounts")
public class AdminAccountController {
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private DoctorRepository doctorRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private SpecialtyRepository specialtyRepository;

    @PostMapping("/create-doctor")
    public ResponseEntity<?> createDoctorAccount(@RequestBody Account account) {
        try {
            Role doctorRole = roleRepository.findByRolename("doctor");
            if (doctorRole == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Role doctor not found");
            }
            // Tạo account
            account.setRole(doctorRole);
            account.setPasswordHash(passwordEncoder.encode(account.getPasswordHash()));
            account.setStatus(true);
            account.setCreatedAt(Instant.now());
            account.setUpdatedAt(Instant.now());
            Account savedAccount = accountRepository.save(account);

            // Tạo doctor entity với thông tin hiện có
            Doctor doctor = new Doctor();
            doctor.setAccountId(savedAccount.getId());
            doctor.setFullName(savedAccount.getFullName());
            doctor.setPhoneNumber(savedAccount.getPhoneNumber());
            doctor.setStatus("offline");
            doctor.setCreatedAt(Instant.now());
            // Nếu chưa có specialty, lấy specialty đầu tiên trong DB làm mặc định
            Specialty defaultSpecialty = specialtyRepository.findAll().stream().findFirst().orElse(null);
            if (defaultSpecialty == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No specialty found in DB");
            }
            doctor.setSpecialty(defaultSpecialty);
            doctorRepository.save(doctor);

            return ResponseEntity.status(HttpStatus.CREATED).body(savedAccount);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }
}