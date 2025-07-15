package com.example.project.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "Feedback")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feedback_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Parent parent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    // Bỏ quan hệ với Article vì không có entity này
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "article_id")
    // private Article article;

    @Column(name = "article_id")
    private Integer articleId;

    @Column(name = "rating")
    private Integer rating;

    @Nationalized
    @Column(name = "comment", columnDefinition = "NVARCHAR(1000)")
    private String comment;

    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("false")
    @Column(name = "is_read")
    private Boolean isRead = false;
} 