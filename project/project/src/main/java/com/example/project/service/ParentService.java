package com.example.project.service;

import com.example.project.dto.ParentProfileDTO;
import com.example.project.model.Account;
import com.example.project.model.Parent;
import com.example.project.repository.AccountRepository;
import com.example.project.repository.ParentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ParentService {

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
        // Find the Account by username
        Account account = accountRepository.findByUsername(username);
        if (account == null) {
            return null; // or throw an exception depending on your security requirements
        }

        // Find the Parent by accountId
        Parent parent = parentRepository.findByAccountId(account.getId());
        if (parent == null) {
            return null; // or throw an exception
        }

        return parent.getId();
    }
}