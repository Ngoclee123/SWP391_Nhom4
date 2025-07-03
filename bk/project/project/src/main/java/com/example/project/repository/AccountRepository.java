package com.example.project.repository;


import com.example.project.model.Account;
import com.example.project.dto.AccountStatsDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AccountRepository extends JpaRepository<Account, Integer> {
    Account findByUsername(String username);
    Account findByEmail(String email);
    @Query("SELECT a FROM Account a JOIN FETCH a.role")
    java.util.List<Account> findAllWithRole();
    
    @Query("SELECT new com.example.project.dto.AccountStatsDTO(a.role.rolename, COUNT(a)) FROM Account a GROUP BY a.role.rolename")
    List<AccountStatsDTO> countAccountsByRole();
}
