package com.example.project.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
<<<<<<< HEAD

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
=======
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import jakarta.persistence.PrePersist;

import com.example.project.model.Service;
>>>>>>> ngocle_new

@Getter
@Setter
@Entity
@Table(name = "Appointments")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "appointment_id")
    private Integer appointmentId;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;


<<<<<<< HEAD
=======
    @ManyToOne
    @JoinColumn(name = "service_id")
    private Service service;
>>>>>>> ngocle_new

    @Column(name = "appointment_date", nullable = false)
    private LocalDateTime appointmentDate;

    @Column(name = "duration", nullable = false)
    private Integer duration;

    @Column(name = "priority")
    private String priority;

    @Column(name = "consultation_type")
    private String consultationType;

    @Column(name = "status")
    private String status;

    @Column(name = "notes")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialty_id")
    private Specialty specialty;

    @Column(name = "appointment_time")
    private OffsetDateTime appointmentTime;

    @Size(max = 255)
    @NotNull
    @Column(name = "payment_method", nullable = false)
    private String paymentMethod;

    @Column(name = "total_fee")
<<<<<<< HEAD
    private BigDecimal totalFee;
=======
    private Double totalFee;
>>>>>>> ngocle_new

    @Column(name = "symptoms")
    private String symptoms;

<<<<<<< HEAD
    @Column(name = "service_id")
    private Integer serviceId;

    // Fields from second file that were not in the first and do not duplicate
    // None were unique that are not already included in more complete form

=======
>>>>>>> ngocle_new
    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (appointmentTime == null && appointmentDate != null) {
            appointmentTime = appointmentDate.atOffset(ZoneOffset.ofHours(7));
        }
    }

    public LocalDateTime getAppointmentDate() {
        return this.appointmentDate;
    }
<<<<<<< HEAD

}
=======
}
>>>>>>> ngocle_new
