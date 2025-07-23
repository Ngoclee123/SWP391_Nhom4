package com.example.project.repository;

import com.example.project.model.Doctor;
import com.example.project.model.DoctorAvailability;
import com.example.project.model.Specialty;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.time.ZoneOffset;
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
                Join<Doctor, Specialty> specialtyJoin = root.join("specialty", JoinType.INNER);
                predicates.add(criteriaBuilder.equal(specialtyJoin.get("id"), specialtyId));
            }

            if (fullName != null && !fullName.trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("fullName")),
                        "%" + fullName.toLowerCase().trim() + "%"
                ));
            }

            if (location != null && !location.trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("locational")),
                        "%" + location.toLowerCase().trim() + "%"
                ));
            }

            if (availabilityStatus != null || availabilityTime != null) {
                Join<Doctor, DoctorAvailability> availabilityJoin = root.join("availabilities", JoinType.INNER);

                if (availabilityStatus != null && !availabilityStatus.trim().isEmpty()) {
                    predicates.add(criteriaBuilder.equal(availabilityJoin.get("status"), availabilityStatus.trim()));
                }

                if (availabilityTime != null) {
                    // Adjust availabilityTime to the start of the day in UTC to match the availability window
                    Instant startOfDay = availabilityTime.atZone(ZoneOffset.UTC).toLocalDate().atStartOfDay().toInstant(ZoneOffset.UTC);
                    System.out.println("Debug: Adjusted availabilityTime start: " + startOfDay);
                    predicates.add(criteriaBuilder.lessThanOrEqualTo(availabilityJoin.get("startTime"), availabilityTime));
                    predicates.add(criteriaBuilder.greaterThanOrEqualTo(availabilityJoin.get("endTime"), startOfDay));
                }
            }

            query.distinct(true);
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}