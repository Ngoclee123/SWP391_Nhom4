package com.example.project.service;

import com.example.project.model.Account;
import com.example.project.repository.AccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AccountService {
    private static final Logger logger = LoggerFactory.getLogger(AccountService.class);
    @Autowired
    private AccountRepository accountRepository;

    public Account getAccountById(int accountId) {
        return accountRepository.findById(accountId).orElse(null);
    }


    public Account findByUsername(String username) {
        return accountRepository.findByUsername(username);
    }

    public void printAllAccounts() {
        List<Account> accounts = accountRepository.findAll();
        if (accounts.isEmpty()) {
            logger.info("No accounts found in the database.");
            System.out.println("No accounts found in the database.");
        } else {
            logger.info("Found {} accounts in the database.", accounts.size());
            System.out.println("Total accounts: " + accounts.size());
            for (Account account : accounts) {
                System.out.println("Account ID: " + account.getId());
                System.out.println("Username: " + account.getUsername());
                System.out.println("Email: " + account.getEmail());
                System.out.println("Password Hash: " + account.getPasswordHash());
                System.out.println("Full Name: " + account.getFullName());
                System.out.println("Phone Number: " + account.getPhoneNumber());
                System.out.println("Address: " + account.getAddress());
                System.out.println("Status: " + account.getStatus());
                System.out.println("Created At: " + account.getCreatedAt());
                System.out.println("Updated At: " + account.getUpdatedAt());
                System.out.println("------------------------");
            }
        }

    }
    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }
}
