package com.example.project.repository;

import com.example.project.model.Account;
import com.example.project.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    
    List<Notification> findByAccountOrderByCreatedAtDesc(Account account);
    
    Page<Notification> findByAccountOrderByCreatedAtDesc(Account account, Pageable pageable);
    
    List<Notification> findByAccountAndIsReadFalseOrderByCreatedAtDesc(Account account);
    
    long countByAccountAndIsReadFalse(Account account);
    
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.account.id = :accountId AND n.notificationId = :notificationId")
    void markAsRead(Integer accountId, Integer notificationId);
    
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.account.id = :accountId")
    void markAllAsRead(Integer accountId);
    
    @Query("SELECT n FROM Notification n WHERE n.notificationType = :type AND n.referenceId = :referenceId")
    List<Notification> findByTypeAndReferenceId(String type, Integer referenceId);
    
    List<Notification> findByNotificationTypeAndReferenceId(String notificationType, Integer referenceId);
} 