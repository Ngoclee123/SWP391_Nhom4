<<<<<<< HEAD
    package com.example.project.repository;

    import com.example.project.model.Patient;
    import org.springframework.data.jpa.repository.JpaRepository;
    import org.springframework.stereotype.Repository;

    import java.util.List;

    @Repository
    public interface PatientRepository extends JpaRepository<Patient, Integer> {
        List<Patient> findByParentId(Integer parentId);

        // Lấy tất cả bệnh nhân cho admin
        List<Patient> findAll();
        // Tổng số bệnh nhân
        long count();

        // Số bệnh nhân mới theo ngày
        long countByCreatedAtBetween(java.time.Instant start, java.time.Instant end);

        // Số bệnh nhân theo trạng thái
        long countByStatus(String status);

        // Đếm theo trạng thái, trả về list object [status, count]
        @org.springframework.data.jpa.repository.Query("SELECT p.status, COUNT(p) FROM Patient p GROUP BY p.status")
        java.util.List<Object[]> countGroupByStatus();

        // Đếm theo ngày/tháng/năm (dùng native query cho linh hoạt)
        @org.springframework.data.jpa.repository.Query(value = "SELECT CAST(created_at AS DATE) as date, COUNT(*) FROM Patients WHERE created_at IS NOT NULL GROUP BY CAST(created_at AS DATE)", nativeQuery = true)
        java.util.List<Object[]> countGroupByDate();

        @org.springframework.data.jpa.repository.Query(value = "SELECT DATEPART(YEAR, created_at) as year, DATEPART(MONTH, created_at) as month, COUNT(*) FROM Patients WHERE created_at IS NOT NULL GROUP BY DATEPART(YEAR, created_at), DATEPART(MONTH, created_at)", nativeQuery = true)
        java.util.List<Object[]> countGroupByMonth();

        @org.springframework.data.jpa.repository.Query(value = "SELECT DATEPART(YEAR, created_at) as year, COUNT(*) FROM Patients WHERE created_at IS NOT NULL GROUP BY DATEPART(YEAR, created_at)", nativeQuery = true)
        java.util.List<Object[]> countGroupByYear();
=======
    package com.example.project.repository;

    import com.example.project.model.Patient;
    import org.springframework.data.jpa.repository.JpaRepository;
    import org.springframework.stereotype.Repository;

    import java.util.List;

    @Repository
    public interface PatientRepository extends JpaRepository<Patient, Integer> {
        List<Patient> findByParentId(Integer parentId);
>>>>>>> ngocle_new
    }