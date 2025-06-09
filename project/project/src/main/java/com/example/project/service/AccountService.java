package com.example.project.service;

import com.example.project.model.Account;
import com.example.project.model.Parent;
import com.example.project.repository.AccountRepository;
import com.example.project.repository.ParentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AccountService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private ParentRepository parentRepository;

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
}