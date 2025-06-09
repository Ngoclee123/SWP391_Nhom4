package com.example.project.repository;

import com.example.project.model.Doctor;
import com.example.project.model.DoctorAvailability;
import com.example.project.model.Specialty;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class DoctorSpecification {
    public static Specification<Doctor> searchDoctors(
            Integer specialtyId,
            String fullName,
            String availabilityStatus,
            String location,
            Instant availabilityTime) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (specialtyId != null) {
                Join<Doctor, Specialty> specialtyJoin = root.join("specialty", JoinType.LEFT);
                predicates.add(criteriaBuilder.equal(specialtyJoin.get("id"), specialtyId));
            }

            if (fullName != null && !fullName.isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("fullName")),
                        "%" + fullName.toLowerCase() + "%"
                ));
            }

            if (location != null && !location.isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("locational")),
                        "%" + location.toLowerCase() + "%"
                ));
            }

            if (availabilityStatus != null || availabilityTime != null) {
                Join<Doctor, DoctorAvailability> availabilityJoin = root.join("availabilities", JoinType.LEFT);

                if (availabilityStatus != null && !availabilityStatus.isEmpty()) {
                    predicates.add(criteriaBuilder.equal(availabilityJoin.get("status"), availabilityStatus));
                }

                if (availabilityTime != null) {
                    Timestamp timestamp = Timestamp.from(availabilityTime);
                    Path<Timestamp> startTimePath = availabilityJoin.get("startTime");
                    Path<Timestamp> endTimePath = availabilityJoin.get("endTime");
                    predicates.add(criteriaBuilder.lessThanOrEqualTo(startTimePath, timestamp)); // start_time <= availabilityTime
                    predicates.add(criteriaBuilder.greaterThanOrEqualTo(endTimePath, timestamp)); // end_time >= availabilityTime
                    // Remove the redundant conditions
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}