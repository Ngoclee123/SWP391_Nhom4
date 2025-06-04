package com.example.project.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

@Getter
@Setter
@Entity
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