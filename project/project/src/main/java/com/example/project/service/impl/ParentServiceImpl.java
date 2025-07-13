package com.example.project.service.impl;

import com.example.project.dto.ParentProfileDTO;
import com.example.project.model.Account;
import com.example.project.model.Parent;
import com.example.project.repository.AccountRepository;
import com.example.project.repository.ParentRepository;
import com.example.project.service.ParentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;

@Service
public class ParentServiceImpl extends ParentService {

    @Autowired
    private ParentRepository parentRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Override
    public ParentProfileDTO getParentProfile(int accountId) {
        Parent parent = parentRepository.findByAccountId(accountId);
        if (parent == null) {
            throw new RuntimeException("Parent not found for account ID: " + accountId);
        }
        ParentProfileDTO dto = new ParentProfileDTO();

        dto.setFullName(parent.getFullName());
        dto.setPhoneNumber(parent.getPhoneNumber());
        dto.setAddress(parent.getAddress());
        return dto;
    }

    @Override
    public void updateParentProfile(int accountId, ParentProfileDTO profileDTO) {
        Parent parent = parentRepository.findByAccountId(accountId);
        if (parent == null) {
            throw new RuntimeException("Parent not found for account ID: " + accountId);
        }
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found for ID: " + accountId));

        // Update Parent
        parent.setFullName(profileDTO.getFullName());
        parent.setPhoneNumber(profileDTO.getPhoneNumber());
        parent.setAddress(profileDTO.getAddress());

        // Update Account
        account.setFullName(profileDTO.getFullName());
        account.setPhoneNumber(profileDTO.getPhoneNumber());
        account.setAddress(profileDTO.getAddress());
        account.setUpdatedAt(Instant.from(LocalDateTime.now()));

        parentRepository.save(parent);
        accountRepository.save(account);
    }
}