package com.example.project.dto;

import com.example.project.model.Account;

public class AccountDTO {
    private Integer id;
    private String username;
    private String email;
    private String fullName;
    private String roleName;

    // Constructor nhận Account
    public AccountDTO(Account account) {
        this.id = account.getId();
        this.username = account.getUsername();
        this.email = account.getEmail();
        this.fullName = account.getFullName();
        this.roleName = account.getRole() != null ? account.getRole().getRolename() : null;
    }

    // Default constructor (nếu cần)
    public AccountDTO() {}

    // Getters và Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
}