package com.example.project.service;

import com.example.project.dto.ParentProfileDTO;
import com.example.project.model.Account;
import com.example.project.model.Parent;
import com.example.project.repository.AccountRepository;
import com.example.project.repository.ParentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ParentService {

    private static final Logger logger = LoggerFactory.getLogger(ParentService.class);

    @Autowired
    private ParentRepository parentRepository;

    @Autowired
    private AccountRepository accountRepository;

    public ParentProfileDTO getParentProfile(int accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        Parent parent = parentRepository.findByAccountId(accountId);
        if (parent == null) {
            throw new RuntimeException("Parent profile not found");
        }

        return new ParentProfileDTO(
                parent.getFullName(), // Ưu tiên fullName từ Parent
                account.getEmail(),
                parent.getPhoneNumber(), // Ưu tiên phoneNumber từ Parent
                parent.getAddress() != null ? parent.getAddress() : account.getAddress(),
                parent.getDateOfBirth()
        );
    }

    public void updateParentProfile(int accountId, ParentProfileDTO profileDTO) {
        Parent parent = parentRepository.findByAccountId(accountId);
        if (parent == null) {
            throw new RuntimeException("Parent profile not found");
        }
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        // Cập nhật Parent
        parent.setFullName(profileDTO.getFullName());
        parent.setPhoneNumber(profileDTO.getPhoneNumber());
        parent.setAddress(profileDTO.getAddress());

        // Cập nhật Account (chỉ email)
        account.setEmail(profileDTO.getEmail());

        // Lưu vào database
        parentRepository.save(parent);
        accountRepository.save(account);
    }

    public Integer getParentIdByUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            logger.error("Username is null or empty");
            return null;
        }

        logger.debug("Searching for account with username: {}", username);
        Account account = accountRepository.findByUsername(username);
        if (account == null) {
            logger.error("No account found for username: {}", username);
            return null;
        }

        Integer accountId = account.getId();
        logger.debug("Found account with ID: {}, searching for parent", accountId);
        Parent parent = parentRepository.findByAccountId(accountId);
        if (parent == null) {
            logger.error("No parent found for account ID: {}", accountId);
            return null;
        }

        Integer parentId = parent.getId();
        logger.debug("Found parent with ID: {}", parentId);
        return parentId;
    }
    // Thêm method mới để lấy parentId từ accountId
    public Integer getParentIdByAccountId(Integer accountId) {
        if (accountId == null) {
            logger.error("AccountId is null");
            return null;
        }


        logger.debug("Searching for parent with accountId: {}", accountId);
        Parent parent = parentRepository.findByAccountId(accountId);
        if (parent == null) {
            logger.error("No parent found for account ID: {}", accountId);
            return null;
        }


        Integer parentId = parent.getId();
        logger.debug("Found parent with ID: {}", parentId);
        return parentId;
    }

}
