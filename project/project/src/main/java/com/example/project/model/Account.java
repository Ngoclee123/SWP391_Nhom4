package com.example.project.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.Collection;

@Getter
@Setter
@Entity
@Table(name = "Accounts")
public class Account implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_id", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "username", nullable = false, length = 50)
    private String username;

    @Nationalized
    @Column(name = "email", nullable = false, length = 100)
    private String email;

    @Nationalized
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Nationalized
    @Column(name = "full_name", length = 100)
    private String fullName;

    @Nationalized
    @Column(name = "phone_number", length = 15)
    private String phoneNumber;

    @Nationalized
    @Column(name = "address")
    private String address;

    @ColumnDefault("1")
    @Column(name = "status")
    private Boolean status;

    @ColumnDefault("sysdatetime()")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("sysdatetime()")
    @Column(name = "updated_at")
    private Instant updatedAt;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String roleName = (role != null && role.getRolename() != null) ? role.getRolename() : "USER";
        return java.util.Collections.<GrantedAuthority>singletonList(new SimpleGrantedAuthority(roleName));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return status != null ? status : true;
    }
}