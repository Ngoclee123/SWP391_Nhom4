package com.example.project.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "Vaccines")
public class Vaccine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vaccine_id", nullable = false)
    private Integer id;

    @Size(max = 100)
    @NotNull
    @Nationalized
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Nationalized
    @Size(max = 1000)
    @Column(name = "description", columnDefinition = "nvarchar(max)")
    private String description;

    @Size(max = 50)
    @Nationalized
    @Column(name = "recommended_age", length = 50)
    private String recommendedAge;

    @Size(max = 255)
    @Column(name = "image")
    private String image;

    @Column(name = "price", columnDefinition = "DECIMAL(10, 2)")
    private BigDecimal price; // Thêm trường price
}