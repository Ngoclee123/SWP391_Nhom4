//package com.example.project.repository;
//
//import com.example.project.model.Doctor;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import org.springframework.stereotype.Repository;
//
//import java.time.Instant;
//import java.util.List;
//import java.util.Optional;
//@Repository
//public interface DoctorRepository extends JpaRepository<Doctor, Integer>, JpaSpecificationExecutor<Doctor> {
//    @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.availabilities")
//    List<Doctor> findAllWithAvailabilities();
//
//    @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.availabilities WHERE d.id = :id")
//    Optional<Doctor> findByIdWithAvailabilities(@Param("id") Integer id);
//
//    @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.availabilities da WHERE d.id = :id " +
//            "AND (:searchTime IS NULL OR (da.startTime <= :searchTime AND da.endTime >= :searchTime))")
//    Optional<Doctor> findByIdWithAvailabilities(@Param("id") Integer id, @Param("searchTime") Instant searchTime);
//
//    @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.availabilities LEFT JOIN FETCH d.certificates WHERE d.id = :id")
//    Optional<Doctor> findByIdWithAvailabilitiesAndCertificates(@Param("id") Integer id);
//
//    List<Doctor> findBySpecialtyId(Integer specialtyId);
//
//
//
//    @Query("SELECT DISTINCT d FROM Doctor d " +
//            "LEFT JOIN FETCH d.account a " +
//            "LEFT JOIN FETCH d.specialty s " +
//            "LEFT JOIN FETCH d.certificates c " +
//            "LEFT JOIN FETCH d.availabilities av " +
//            "WHERE d.id = :id " +
//            "ORDER BY av.startTime DESC")
//    Optional<Doctor> findByIdWithDetails(@Param("id") Integer id);
//
//
//    @Query("SELECT DISTINCT d FROM Doctor d " +
//            "LEFT JOIN FETCH d.account a " +
//            "LEFT JOIN FETCH d.specialty s " +
//            "LEFT JOIN FETCH d.certificates c " +
//            "LEFT JOIN FETCH d.availabilities av " +
//            "ORDER BY d.id")
//    List<Doctor> findAllWithDetails();
//
//    Optional<Doctor> findByAccountId(Integer accountId);
//
//    @Query("SELECT d FROM Doctor d WHERE LOWER(d.status) = 'online'")
//    List<Doctor> findOnlineDoctors();
//
//    @org.springframework.data.jpa.repository.Query("SELECT COUNT(d) FROM Doctor d WHERE LOWER(d.status) = LOWER(:status)")
//    long countByStatus(@org.springframework.data.repository.query.Param("status") String status);
//
//}

package com.example.project.repository;

import com.example.project.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Integer>, JpaSpecificationExecutor<Doctor> {
    @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.availabilities")
    List<Doctor> findAllWithAvailabilities();

    @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.availabilities WHERE d.id = :id")
    Optional<Doctor> findByIdWithAvailabilities(@Param("id") Integer id);

    @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.availabilities da WHERE d.id = :id " +
            "AND (:searchTime IS NULL OR (da.startTime <= :searchTime AND da.endTime >= :searchTime))")
    Optional<Doctor> findByIdWithAvailabilities(@Param("id") Integer id, @Param("searchTime") Instant searchTime);

    @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.availabilities LEFT JOIN FETCH d.certificates WHERE d.id = :id")
    Optional<Doctor> findByIdWithAvailabilitiesAndCertificates(@Param("id") Integer id);

    List<Doctor> findBySpecialtyId(Integer specialtyId);



    @Query("SELECT DISTINCT d FROM Doctor d " +
            "LEFT JOIN FETCH d.account a " +
            "LEFT JOIN FETCH d.specialty s " +
            "LEFT JOIN FETCH d.certificates c " +
            "LEFT JOIN FETCH d.availabilities av " +
            "WHERE d.id = :id " +
            "ORDER BY av.startTime DESC")
    Optional<Doctor> findByIdWithDetails(@Param("id") Integer id);


    @Query("SELECT DISTINCT d FROM Doctor d " +
            "LEFT JOIN FETCH d.account a " +
            "LEFT JOIN FETCH d.specialty s " +
            "LEFT JOIN FETCH d.certificates c " +
            "LEFT JOIN FETCH d.availabilities av " +
            "ORDER BY d.id")
    List<Doctor> findAllWithDetails();

    Optional<Doctor> findByAccountId(Integer accountId);

    @Query("SELECT d FROM Doctor d WHERE LOWER(d.status) = 'online'")
    List<Doctor> findOnlineDoctors();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(d) FROM Doctor d WHERE LOWER(d.status) = LOWER(:status)")
    long countByStatus(@org.springframework.data.repository.query.Param("status") String status);

}