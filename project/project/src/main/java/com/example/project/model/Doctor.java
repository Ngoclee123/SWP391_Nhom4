package com.example.project.model;

import jakarta.persistence.*;
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
@Table(name = "Doctors")
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "doctor_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;



    @Nationalized
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Nationalized
    @Column(name = "phone_number", length = 15)
    private String phoneNumber;

    @Nationalized
    @Lob
    @Column(name = "bio")
    private String bio;

    @Nationalized
    @Column(name = "certificate")
    private String certificate;

    @Nationalized
    @Column(name = "availability")
    private String availability;

    @ColumnDefault("sysdatetime()")
    @Column(name = "created_at")
    private Instant createdAt;


    @Column(name = "specialty_id", nullable = false)
    private Integer specialty;

    @Column(name = "locational")
    private String locational;

    @Column(name = "availability_time")
    private Instant availabilityTime;

}