//package com.example.project.service;
//
//import com.example.project.dto.DoctorStatsDTO;
//import com.example.project.model.Doctor;
//import com.example.project.repository.AppointmentRepository;
//import com.example.project.repository.DoctorRepository;
//import com.example.project.repository.VaccinationRepository;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.time.Instant;
//import java.time.LocalDate;
//import java.time.YearMonth;
//import java.time.ZoneOffset;
//import java.util.*;
//import java.util.stream.Collectors;
//
//@Service
//public class DoctorStatsService {
//
//    private static final Logger logger = LoggerFactory.getLogger(DoctorStatsService.class);
//
//    @Autowired
//    private DoctorRepository doctorRepository;
//
//    @Autowired
//    private AppointmentRepository appointmentRepository;
//
//    @Autowired
//    private VaccinationRepository vaccinationRepository;
//
//    @Autowired
//    private com.example.project.repository.PatientRepository patientRepository;
//
//    /**
//     * Lấy thống kê số lượt khám của các bác sĩ trong tháng
//     * @param year Năm
//     * @param month Tháng (1-12)
//     * @return Danh sách thống kê bác sĩ
//     */
//    public List<DoctorStatsDTO> getDoctorStatsForMonth(int year, int month) {
//        try {
//            logger.info("Fetching doctor stats for month: {}/{}", month, year);
//
//            // Tính toán khoảng thời gian của tháng cho Appointments (LocalDate)
//            YearMonth yearMonth = YearMonth.of(year, month);
//            LocalDate startOfMonth = yearMonth.atDay(1);
//            LocalDate endOfMonth = yearMonth.atEndOfMonth();
//
//            // Chuyển sang LocalDateTime để truyền vào repository
//            java.time.LocalDateTime startDateTime = startOfMonth.atStartOfDay();
//            java.time.LocalDateTime endDateTime = endOfMonth.atTime(23, 59, 59);
//
//            // Tính toán khoảng thời gian của tháng cho Vaccinations (Instant)
//            Instant startInstant = startOfMonth.atStartOfDay().toInstant(ZoneOffset.UTC);
//            Instant endInstant = endOfMonth.atTime(23, 59, 59).toInstant(ZoneOffset.UTC);
//
//            logger.info("Date range: {} to {}", startOfMonth, endOfMonth);
//
//            // Lấy thống kê từ Appointments
//            List<Object[]> appointmentStats = new ArrayList<>();
//            try {
//                appointmentStats = appointmentRepository.countAppointmentsByDoctorInMonth(startDateTime, endDateTime);
//                logger.debug("Appointment stats: {}", appointmentStats.size());
//            } catch (Exception e) {
//                logger.error("Error getting appointment stats: {}", e.getMessage());
//            }
//
//            Map<Integer, Long> appointmentCountMap = appointmentStats.stream()
//                    .collect(Collectors.toMap(
//                            row -> (Integer) row[0],
//                            row -> (Long) row[1]
//                    ));
//
//            // Lấy thống kê từ Vaccinations
//            List<Object[]> vaccinationStats = new ArrayList<>();
//            try {
//                vaccinationStats = vaccinationRepository.countVaccinationsByDoctorInMonth(startInstant, endInstant);
//                logger.debug("Vaccination stats: {}", vaccinationStats.size());
//            } catch (Exception e) {
//                logger.error("Error getting vaccination stats: {}", e.getMessage());
//            }
//
//            Map<Integer, Long> vaccinationCountMap = vaccinationStats.stream()
//                    .collect(Collectors.toMap(
//                            row -> (Integer) row[0],
//                            row -> (Long) row[1]
//                    ));
//
//            // Lấy tất cả bác sĩ có hoạt động trong tháng
//            Set<Integer> activeDoctorIds = new HashSet<>();
//            activeDoctorIds.addAll(appointmentCountMap.keySet());
//            activeDoctorIds.addAll(vaccinationCountMap.keySet());
//
//            logger.info("Found {} active doctors", activeDoctorIds.size());
//
//            // Tạo danh sách thống kê
//            List<DoctorStatsDTO> stats = new ArrayList<>();
//
//            for (Integer doctorId : activeDoctorIds) {
//                try {
//                    Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
//                    if (doctorOpt.isPresent()) {
//                        Doctor doctor = doctorOpt.get();
//                        Long appointmentCount = appointmentCountMap.getOrDefault(doctorId, 0L);
//                        Long vaccinationCount = vaccinationCountMap.getOrDefault(doctorId, 0L);
//
//                        DoctorStatsDTO stat = new DoctorStatsDTO(
//                                doctor.getId(),
//                                doctor.getFullName(),
//                                doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : "Chưa xác định",
//                                appointmentCount,
//                                vaccinationCount
//                        );
//
//                        stats.add(stat);
//
//                        logger.debug("Doctor {}: {} appointments, {} vaccinations",
//                                doctor.getFullName(), appointmentCount, vaccinationCount);
//                    }
//                } catch (Exception e) {
//                    logger.error("Error processing doctor {}: {}", doctorId, e.getMessage());
//                }
//            }
//
//            // Sắp xếp theo tổng số lượt khám giảm dần
//            stats.sort((a, b) -> Long.compare(b.getTotalExaminations(), a.getTotalExaminations()));
//
//            logger.info("Returning {} doctor stats", stats.size());
//            return stats;
//
//        } catch (Exception e) {
//            logger.error("Error getting doctor stats for month: {}", e.getMessage(), e);
//            return new ArrayList<>();
//        }
//    }
//
//    /**
//     * Lấy thống kê tổng quan cho dashboard
//     */
//    public Map<String, Object> getDashboardStats(int year, int month) {
//        try {
//            logger.info("Getting dashboard stats for {}/{}", month, year);
//
//            List<DoctorStatsDTO> doctorStats = getDoctorStatsForMonth(year, month);
//
//            long totalAppointments = doctorStats.stream()
//                    .mapToLong(DoctorStatsDTO::getAppointmentCount)
//                    .sum();
//
//            long totalVaccinations = doctorStats.stream()
//                    .mapToLong(DoctorStatsDTO::getVaccinationCount)
//                    .sum();
//
//            long totalExaminations = totalAppointments + totalVaccinations;
//
//            // Lấy thống kê bệnh nhân
//            long totalPatients = 0;
//            try {
//                totalPatients = patientRepository.count();
//                logger.debug("Total patients: {}", totalPatients);
//            } catch (Exception e) {
//                logger.error("Error getting total patients: {}", e.getMessage());
//            }
//
//            // Lấy lịch hẹn hôm nay
//            long todayAppointments = 0;
//            try {
//                java.time.LocalDateTime startOfDay = java.time.LocalDate.now().atStartOfDay();
//                java.time.LocalDateTime endOfDay = java.time.LocalDate.now().atTime(23, 59, 59);
//                todayAppointments = appointmentRepository.countByAppointmentDateBetween(startOfDay, endOfDay);
//                logger.debug("Today appointments: {}", todayAppointments);
//            } catch (Exception e) {
//                logger.error("Error getting today appointments: {}", e.getMessage());
//            }
//
//            // Lấy số bác sĩ online
//            long onlineDoctors = 0;
//            try {
//                onlineDoctors = doctorRepository.countByStatus("online");
//                logger.debug("Online doctors: {}", onlineDoctors);
//            } catch (Exception e) {
//                logger.error("Error getting online doctors: {}", e.getMessage());
//            }
//
//            Map<String, Object> dashboardStats = new HashMap<>();
//            dashboardStats.put("totalExaminations", totalExaminations);
//            dashboardStats.put("totalAppointments", totalAppointments);
//            dashboardStats.put("totalVaccinations", totalVaccinations);
//            dashboardStats.put("activeDoctors", doctorStats.size());
//            dashboardStats.put("topDoctors", doctorStats.stream().limit(5).collect(Collectors.toList()));
//            dashboardStats.put("totalPatients", totalPatients);
//            dashboardStats.put("todayAppointments", todayAppointments);
//            dashboardStats.put("onlineDoctors", onlineDoctors);
//
//            logger.info("Dashboard stats: {}", dashboardStats);
//            return dashboardStats;
//
//        } catch (Exception e) {
//            logger.error("Error getting dashboard stats: {}", e.getMessage(), e);
//            // Trả về dữ liệu mặc định nếu có lỗi
//            Map<String, Object> defaultStats = new HashMap<>();
//            defaultStats.put("totalExaminations", 0);
//            defaultStats.put("totalAppointments", 0);
//            defaultStats.put("totalVaccinations", 0);
//            defaultStats.put("activeDoctors", 0);
//            defaultStats.put("topDoctors", new ArrayList<>());
//            defaultStats.put("totalPatients", 0);
//            defaultStats.put("todayAppointments", 0);
//            defaultStats.put("onlineDoctors", 0);
//            return defaultStats;
//        }
//    }
//}


package com.example.project.service;

import com.example.project.dto.DoctorStatsDTO;
import com.example.project.model.Doctor;
import com.example.project.repository.AppointmentRepository;
import com.example.project.repository.DoctorRepository;
import com.example.project.repository.VaccinationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;
import java.time.Year;

@Service
public class DoctorStatsService {

    private static final Logger logger = LoggerFactory.getLogger(DoctorStatsService.class);

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private VaccinationRepository vaccinationRepository;

    @Autowired
    private com.example.project.repository.PatientRepository patientRepository;

    /**
     * Lấy thống kê số lượt khám của các bác sĩ trong tháng
     * @param year Năm
     * @param month Tháng (1-12)
     * @return Danh sách thống kê bác sĩ
     */
    public List<DoctorStatsDTO> getDoctorStatsForMonth(int year, int month) {
        try {
            logger.info("Fetching doctor stats for month: {}/{}", month, year);

            // Tính toán khoảng thời gian của tháng cho Appointments (LocalDate)
            YearMonth yearMonth = YearMonth.of(year, month);
            LocalDate startOfMonth = yearMonth.atDay(1);
            LocalDate endOfMonth = yearMonth.atEndOfMonth();
            java.time.LocalDateTime startDateTime = startOfMonth.atStartOfDay();
            java.time.LocalDateTime endDateTime = endOfMonth.atTime(23, 59, 59);

            // Tính toán khoảng thời gian của năm cho Appointments
            LocalDate startOfYear = LocalDate.of(year, 1, 1);
            LocalDate endOfYear = LocalDate.of(year, 12, 31);
            java.time.LocalDateTime startYearDateTime = startOfYear.atStartOfDay();
            java.time.LocalDateTime endYearDateTime = endOfYear.atTime(23, 59, 59);

            // Lấy thống kê từ Appointments trong tháng
            List<Object[]> appointmentStats = new ArrayList<>();
            try {
                appointmentStats = appointmentRepository.countAppointmentsByDoctorInMonth(startDateTime, endDateTime);
                logger.debug("Appointment stats: {}", appointmentStats.size());
            } catch (Exception e) {
                logger.error("Error getting appointment stats: {}", e.getMessage());
            }
            Map<Integer, Long> appointmentCountMap = appointmentStats.stream()
                    .collect(Collectors.toMap(
                            row -> (Integer) row[0],
                            row -> (Long) row[1]
                    ));

            // Lấy thống kê tổng lượt khám trong năm
            List<Object[]> yearStats = new ArrayList<>();
            try {
                yearStats = appointmentRepository.countAppointmentsByDoctorInMonth(startYearDateTime, endYearDateTime);
            } catch (Exception e) {
                logger.error("Error getting year appointment stats: {}", e.getMessage());
            }
            Map<Integer, Long> yearCountMap = yearStats.stream()
                    .collect(Collectors.toMap(
                            row -> (Integer) row[0],
                            row -> (Long) row[1]
                    ));

            // Lấy tất cả bác sĩ có hoạt động trong tháng hoặc năm
            Set<Integer> activeDoctorIds = new HashSet<>();
            activeDoctorIds.addAll(appointmentCountMap.keySet());
            activeDoctorIds.addAll(yearCountMap.keySet());

            logger.info("Found {} active doctors", activeDoctorIds.size());

            // Tạo danh sách thống kê
            List<DoctorStatsDTO> stats = new ArrayList<>();
            for (Integer doctorId : activeDoctorIds) {
                try {
                    Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
                    if (doctorOpt.isPresent()) {
                        Doctor doctor = doctorOpt.get();
                        Long appointmentCount = appointmentCountMap.getOrDefault(doctorId, 0L); // trong tháng
                        Long totalInYear = yearCountMap.getOrDefault(doctorId, 0L); // trong năm
                        DoctorStatsDTO stat = new DoctorStatsDTO(
                                doctor.getId(),
                                doctor.getFullName(),
                                doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : "Chưa xác định",
                                appointmentCount,
                                0L // bỏ vaccinationCount, dùng totalInYear cho setTotalExaminations
                        );
                        stat.setTotalExaminations(totalInYear);
                        stats.add(stat);
                    }
                } catch (Exception e) {
                    logger.error("Error processing doctor {}: {}", doctorId, e.getMessage());
                }
            }
            // Sắp xếp theo tổng số lượt khám giảm dần
            stats.sort((a, b) -> Long.compare(b.getTotalExaminations(), a.getTotalExaminations()));
            logger.info("Returning {} doctor stats", stats.size());
            return stats;
        } catch (Exception e) {
            logger.error("Error getting doctor stats for month: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * Lấy thống kê tổng quan cho dashboard
     */
    public Map<String, Object> getDashboardStats(int year, int month) {
        try {
            logger.info("Getting dashboard stats for {}/{}", month, year);

            List<DoctorStatsDTO> doctorStats = getDoctorStatsForMonth(year, month);

            long totalAppointments = doctorStats.stream()
                    .mapToLong(DoctorStatsDTO::getAppointmentCount)
                    .sum();

            long totalVaccinations = doctorStats.stream()
                    .mapToLong(DoctorStatsDTO::getVaccinationCount)
                    .sum();

            long totalExaminations = totalAppointments + totalVaccinations;

            // Lấy thống kê bệnh nhân
            long totalPatients = 0;
            try {
                totalPatients = patientRepository.count();
                logger.debug("Total patients: {}", totalPatients);
            } catch (Exception e) {
                logger.error("Error getting total patients: {}", e.getMessage());
            }

            // Lấy lịch hẹn hôm nay
            long todayAppointments = 0;
            try {
                java.time.LocalDateTime startOfDay = java.time.LocalDate.now().atStartOfDay();
                java.time.LocalDateTime endOfDay = java.time.LocalDate.now().atTime(23, 59, 59);
                todayAppointments = appointmentRepository.countByAppointmentDateBetween(startOfDay, endOfDay);
                logger.debug("Today appointments: {}", todayAppointments);
            } catch (Exception e) {
                logger.error("Error getting today appointments: {}", e.getMessage());
            }

            // Lấy số bác sĩ online
            long onlineDoctors = 0;
            try {
                onlineDoctors = doctorRepository.countByStatus("online");
                logger.debug("Online doctors: {}", onlineDoctors);
            } catch (Exception e) {
                logger.error("Error getting online doctors: {}", e.getMessage());
            }

            Map<String, Object> dashboardStats = new HashMap<>();
            dashboardStats.put("totalExaminations", totalExaminations);
            dashboardStats.put("totalAppointments", totalAppointments);
            dashboardStats.put("totalVaccinations", totalVaccinations);
            dashboardStats.put("activeDoctors", doctorStats.size());
            dashboardStats.put("topDoctors", doctorStats.stream().limit(5).collect(Collectors.toList()));
            dashboardStats.put("totalPatients", totalPatients);
            dashboardStats.put("todayAppointments", todayAppointments);
            dashboardStats.put("onlineDoctors", onlineDoctors);

            logger.info("Dashboard stats: {}", dashboardStats);
            return dashboardStats;

        } catch (Exception e) {
            logger.error("Error getting dashboard stats: {}", e.getMessage(), e);
            // Trả về dữ liệu mặc định nếu có lỗi
            Map<String, Object> defaultStats = new HashMap<>();
            defaultStats.put("totalExaminations", 0);
            defaultStats.put("totalAppointments", 0);
            defaultStats.put("totalVaccinations", 0);
            defaultStats.put("activeDoctors", 0);
            defaultStats.put("topDoctors", new ArrayList<>());
            defaultStats.put("totalPatients", 0);
            defaultStats.put("todayAppointments", 0);
            defaultStats.put("onlineDoctors", 0);
            return defaultStats;
        }
    }
}