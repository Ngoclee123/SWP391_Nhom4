    package com.example.project.model;

    import com.example.project.dto.DoctorSearchDTO;
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
    import java.util.HashSet;
    import java.util.List;
    import java.util.Set;

    @Getter
    @Setter
    @Entity
    @Table(name = "Doctors")
    public class Doctor {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "doctor_id")
        private Integer id;

        @OneToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "account_id", referencedColumnName = "account_id")
        private Account account;

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

        @Column(name = "education")
        private String education;

        @Column(name = "hospital")
        private String hospital;

        @Column(name = "morning_hours")
        private String morningHours;

        @Column(name = "afternoon_hours")
        private String afternoonHours;

        @Column(name = "created_at")
        private LocalDate createdAt;

        @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
        @Fetch(FetchMode.JOIN)
        private Set<DoctorAvailability> availabilities = new HashSet<>();

        @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
        private Set<Certificate> certificates = new HashSet<>();

        public Integer getId() {
            return id;
        }


    }