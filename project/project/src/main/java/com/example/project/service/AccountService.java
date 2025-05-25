package com.example.project.service;

import com.example.project.model.Account;
import com.example.project.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AccountService {

    @Autowired
    private AccountRepository accountRepository;

    public Account getAccountById(int accountId) {
        return accountRepository.findById(accountId).orElse(null);
    }
}
