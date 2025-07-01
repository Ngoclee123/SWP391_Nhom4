    package com.example.project.model;

    import jakarta.persistence.*;
    import jakarta.persistence.CascadeType;
    import jakarta.persistence.Table;
    import jakarta.validation.constraints.Size;
    import lombok.Getter;
    import lombok.Setter;
    import org.hibernate.annotations.*;
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

        @Column(name = "account_id", nullable = false)
        private Integer accountId;

        @Column(name = "full_name", nullable = false, columnDefinition = "NVARCHAR(100) COLLATE Vietnamese_CI_AS")
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

        @Size(max = 255)
        @Nationalized
        @Column(name = "education")
        private String education;

        @Size(max = 255)
        @Nationalized
        @Column(name = "hospital")
        private String hospital;

        @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
        private List<Certificate> certificates = new ArrayList<>();

        @Column(name = "status", length = 20)
        private String status = "offline";
    }