package com.example.project.model;

    import jakarta.persistence.*;
    import lombok.Getter;
    import lombok.Setter;
    import org.hibernate.annotations.Fetch;
    import org.hibernate.annotations.FetchMode;
    import org.hibernate.annotations.JdbcTypeCode;
    import org.hibernate.annotations.Type;
    import org.hibernate.type.SqlTypes;

    import java.time.Instant;
    import java.time.LocalDate;
    import java.util.ArrayList;
    import java.util.List;

    @Getter
@Setter
@Entity
@Table(name = "Doctors")
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "doctor_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = true)
    private Account account; // Thay thế accountId bằng quan hệ

    @Column(name = "full_name", nullable = false, columnDefinition = "NVARCHAR(100)")
    @JdbcTypeCode(SqlTypes.NVARCHAR)
    private String fullName;

    @ManyToOne
    @JoinColumn(name = "specialty_id", nullable = false)
    private Specialty specialty;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "bio")
    private String bio;

    @Column(name = "imgs")
    private String imgs;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "locational")
    private String locational;

    @Column(name = "created_at")
    private Instant createdAt;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Fetch(FetchMode.JOIN)
    private List<DoctorAvailability> availabilities = new ArrayList<>();

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Certificate> certificates = new ArrayList<>();

    // @Column(name = "experience")
    // private Integer experience;

    // @Column(name = "patients")
    // private Integer patients;

    // @Column(name = "rating")
    // private Double rating;

    @Column(name = "status", length = 20)
    private String status = "offline";

    @Column(name = "education")
    private String education;

    @Column(name = "hospital")
    private String hospital;
}