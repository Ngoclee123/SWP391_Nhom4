package com.example.project.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

@Getter
@Setter
@Entity
@Table(name = "Role")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Role {
    @Id
    @Column(name = "role_id", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "rolename", nullable = false, length = 50)
    private String rolename;

    @Nationalized
    @Lob
    @Column(name = "description")
    private String description;

}