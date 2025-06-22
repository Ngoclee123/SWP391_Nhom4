package com.example.project.repository;


import com.example.project.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AccountRepository extends JpaRepository<Account, Integer> {
    Account findByUsername(String username);
    Account findByEmail(String email);
    @Query("SELECT a FROM Account a JOIN FETCH a.role")
    java.util.List<Account> findAllWithRole();
}
