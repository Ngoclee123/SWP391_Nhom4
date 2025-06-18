package com.example.project.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "Articles")
public class Article {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "article_id", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "title", nullable = false)
    private String title;

    @Nationalized
    @Lob
    @Column(name = "content", nullable = false)
    private String content;

    @Nationalized
    @Column(name = "description", length = 500)
    private String description;

    @ColumnDefault("0")
    @Column(name = "views")
    private Integer views;

    @Nationalized
    @Column(name = "img_url")
    private String imgUrl;

    @ColumnDefault("sysdatetime()")
    @Column(name = "published_at")
    private Instant publishedAt;

    @ColumnDefault("1")
    @Column(name = "status")
    private Boolean status;

    @ColumnDefault("sysdatetime()")
    @Column(name = "created_at")
    private Instant createdAt;

}