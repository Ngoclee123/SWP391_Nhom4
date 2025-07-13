package com.example.project;

import com.example.project.model.Account;
import com.example.project.repository.AccountRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test") // dùng cấu hình application-test.properties
public class AccountRepositoryTest {

    @Autowired
    private AccountRepository accountRepository;

    @Test
    public void testSaveAndFindAccountWithAllFields() {
        // Tạo mới một Account
        Account account = new Account();
        account.setUsername("john_doe");
        account.setEmail("john@example.com");
        account.setPasswordHash("secret123");
        account.setFullName("John Doe");
        account.setPhoneNumber("0123456789");
        account.setAddress("123 Main St, Hometown");
        account.setStatus(true);
        account.setCreatedAt(Instant.now());
        account.setUpdatedAt(Instant.now());

        // Lưu vào DB
        Account savedAccount = accountRepository.save(account);

        // Lấy ra từ DB
        Optional<Account> found = accountRepository.findById(savedAccount.getId());

        // Kiểm tra dữ liệu
        assertThat(found).isPresent();

        Account foundAccount = found.get();
        assertThat(foundAccount.getUsername()).isEqualTo("john_doe");
        assertThat(foundAccount.getEmail()).isEqualTo("john@example.com");
        assertThat(foundAccount.getPasswordHash()).isEqualTo("secret123");
        assertThat(foundAccount.getFullName()).isEqualTo("John Doe");
        assertThat(foundAccount.getPhoneNumber()).isEqualTo("0123456789");
        assertThat(foundAccount.getAddress()).isEqualTo("123 Main St, Hometown");
        assertThat(foundAccount.getStatus()).isTrue();
        assertThat(foundAccount.getCreatedAt()).isNotNull();
        assertThat(foundAccount.getUpdatedAt()).isNotNull();
    }
}
