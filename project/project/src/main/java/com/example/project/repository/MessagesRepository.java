package com.example.project.repository;

import com.example.project.model.Messages;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessagesRepository extends JpaRepository<Messages, Integer> {
    List<Messages> findBySenderIdAndReceiverId(Integer senderId, Integer receiverId);
    List<Messages> findBySenderId(Integer senderId);
    List<Messages> findByReceiverId(Integer receiverId);
}