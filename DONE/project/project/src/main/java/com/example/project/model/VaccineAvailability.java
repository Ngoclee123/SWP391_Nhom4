package com.example.project.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;

@Getter
@Setter
@Entity
public class VaccineAvailability {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "availability_id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "vaccine_id", nullable = false)
    private Vaccine vaccine;

    @NotNull
    @Column(name = "available_date", nullable = false)
    private Instant availableDate;

    @Size(max = 255)
    @NotNull
    @Nationalized
    @Column(name = "location", nullable = false)
    private String location;

    @ColumnDefault("10")
    @Column(name = "capacity")
    private Integer capacity;

    @ColumnDefault("sysdatetime()")
    @Column(name = "created_at")
    private Instant createdAt;

}