package com.example.project.controler;

import com.example.project.dto.DoctorStatsDTO;
import com.example.project.service.DoctorStatsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*")
public class DoctorStatsController {
    
    private static final Logger logger = LoggerFactory.getLogger(DoctorStatsController.class);
    
    @Autowired
    private DoctorStatsService doctorStatsService;
    
    /**
     * Lấy thống kê số lượt khám của các bác sĩ trong tháng
     * GET /api/stats/doctors?year=2025&month=1
     */
    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorStatsDTO>> getDoctorStats(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        
        try {
            // Sử dụng tháng hiện tại nếu không được cung cấp
            if (year == null || month == null) {
                LocalDate now = LocalDate.now();
                year = year != null ? year : now.getYear();
                month = month != null ? month : now.getMonthValue();
            }
            
            // Validate month
            if (month < 1 || month > 12) {
                return ResponseEntity.badRequest().build();
            }
            
            logger.info("Getting doctor stats for {}/{}", month, year);
            
            List<DoctorStatsDTO> stats = doctorStatsService.getDoctorStatsForMonth(year, month);
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            logger.error("Error getting doctor stats: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Lấy thống kê tổng quan cho dashboard
     * GET /api/stats/dashboard?year=2025&month=1
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        
        try {
            // Sử dụng tháng hiện tại nếu không được cung cấp
            if (year == null || month == null) {
                LocalDate now = LocalDate.now();
                year = year != null ? year : now.getYear();
                month = month != null ? month : now.getMonthValue();
            }
            
            // Validate month
            if (month < 1 || month > 12) {
                return ResponseEntity.badRequest().build();
            }
            
            logger.info("Getting dashboard stats for {}/{}", month, year);
            
            Map<String, Object> stats = doctorStatsService.getDashboardStats(year, month);
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            logger.error("Error getting dashboard stats: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
