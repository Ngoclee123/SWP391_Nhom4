package com.example.project.dto;

import com.example.project.model.Account;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class AccountDTO {
    private Integer id;
    private String username;
    private String email;
    private String fullName;
    private String roleName;
    private String address;
    private Boolean status;
    private String phoneNumber;

    // Constructor nhận Account - sửa để set đầy đủ các trường
    public AccountDTO(Account account) {
        this.id = account.getId();
        this.username = account.getUsername();
        this.email = account.getEmail();
        this.fullName = account.getFullName();
        this.phoneNumber = account.getPhoneNumber();
        this.address = account.getAddress();
        this.status = account.getStatus();
        this.roleName = account.getRole() != null ? account.getRole().getRolename() : null;
    }

    // Default constructor
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Boolean getStatus() {
        return status;
    }

    public void setStatus(Boolean status) {
        this.status = status;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    // Static method để chuyển đổi từ Account sang AccountDTO
    public static AccountDTO toDTO(Account account) {
        return new AccountDTO(account);
    }
}