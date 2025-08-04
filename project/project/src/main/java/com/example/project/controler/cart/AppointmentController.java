package com.example.project.controler.cart;


import com.example.project.dto.AppointmentRequestDTO;
import com.example.project.dto.AppointmentDTO;
import com.example.project.model.Appointment;
import com.example.project.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.example.project.model.Doctor;
import com.example.project.service.DoctorService;
import com.example.project.repository.AccountRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.example.project.model.Account;


import java.time.LocalDateTime;


@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:3000")
public class AppointmentController {


    @Autowired
    private AppointmentService appointmentService;
    @Autowired
    private DoctorService doctorService;
    @Autowired
    private AccountRepository accountRepository;


    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(@RequestBody AppointmentRequestDTO requestDTO) {
        try {
            Appointment appointment = appointmentService.createAppointment(requestDTO);
            Map<String, Object> response = new HashMap<>();
            response.put("appointmentId", appointment.getAppointmentId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Bad Request");
            errorResponse.put("message", e.getMessage() != null ? e.getMessage() : "Unknown error");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }


    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getPatientAppointments(
            @PathVariable Integer patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            List<Appointment> appointments = appointmentService.getAppointmentsByPatient(patientId);
            System.out.println("DEBUG: Total appointments found: " + appointments.size());
            List<AppointmentDTO> dtos = new ArrayList<>();
            for (Appointment a : appointments) {
                AppointmentDTO dto = new AppointmentDTO();
                dto.setId(a.getAppointmentId());
                dto.setPatientId(a.getPatient() != null ? a.getPatient().getId() : null);
                dto.setDoctorId(a.getDoctor() != null ? a.getDoctor().getId() : null);
                dto.setSpecialtyId(a.getSpecialty() != null ? a.getSpecialty().getId() : null);
                dto.setServiceId(null);
                dto.setAppointmentDate(a.getAppointmentDate());
                dto.setDuration(a.getDuration());
                dto.setPriority(a.getPriority());
                dto.setConsultationType(a.getConsultationType());
                dto.setStatus(a.getStatus());
                dto.setNotes(a.getNotes());
                dto.setCreatedAt(a.getCreatedAt());
                dtos.add(dto);
            }
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", e.getMessage() != null ? e.getMessage() : "Unknown error");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }


    @PutMapping("/{appointmentId}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Integer appointmentId, @RequestHeader(required = false) Integer accountId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("{\"error\": \"Unauthorized\", \"message\": \"Full authentication is required\"}");
            }


            // Lấy accountId từ token nếu header không có
            Account account = accountRepository.findByUsername(authentication.getName()); // Sử dụng orElse(null)
            System.out.println("Account found: " + (account != null ? "Yes" : "No")); // Log để debug
            Integer tokenAccountId = (account != null) ? account.getId() : null;
            accountId = (accountId != null) ? accountId : tokenAccountId;


            if (accountId == null) {
                return ResponseEntity.status(401).body("{\"error\": \"Unauthorized\", \"message\": \"No valid accountId provided\"}");
            }


            if (appointmentId == null || appointmentId <= 0) {
                return ResponseEntity.status(400).body("{\"error\": \"Bad Request\", \"message\": \"Invalid appointmentId\"}");
            }


            Appointment appointment = appointmentService.getAppointmentById(appointmentId);
            if (appointment == null || appointment.getPatient() == null || appointment.getPatient().getParent() == null) {
                return ResponseEntity.status(400).body("{\"error\": \"Bad Request\", \"message\": \"Invalid appointment or patient data\"}");
            }
            Integer parentId = appointment.getPatient().getParent().getId();
//            if (!parentId.equals(accountId)) {
//                return ResponseEntity.status(403).body("{\"error\": \"Forbidden\", \"message\": \"You do not have permission to cancel this appointment\"}");
//            }


            // Kiểm tra và log dữ liệu trước khi cập nhật
            System.out.println("Before update - Appointment ID: " + appointmentId + ", Status: " + appointment.getStatus() + ", Appointment Date: " + appointment.getAppointmentDate());
            if (appointment.getAppointmentDate() == null) {
                return ResponseEntity.status(400).body("{\"error\": \"Bad Request\", \"message\": \"Appointment date is required\"}");
            }


            // Chỉ cập nhật trạng thái, không thay đổi các cột khác
            appointmentService.updateAppointmentStatus(appointmentId, "Cancelled");
            Appointment updatedAppointment = appointmentService.getAppointmentById(appointmentId);
            System.out.println("After update - Appointment ID: " + appointmentId + ", Status: " + updatedAppointment.getStatus() + ", Appointment Date: " + updatedAppointment.getAppointmentDate());


            return ResponseEntity.ok("{\"message\": \"Appointment cancelled successfully\"}");
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", e.getMessage() != null ? e.getMessage() : "Unknown error");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }


    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable int id, @RequestParam String status) {
        try {
            // Security check: chỉ cho phép doctor update appointment của chính họ
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("{\"error\": \"Unauthorized\", \"message\": \"Full authentication is required\"}");
            }
            
            // Lấy appointment để kiểm tra doctor
            Appointment appointment = appointmentService.getAppointmentById(id);
            if (appointment == null) {
                return ResponseEntity.status(404).body("{\"error\": \"Not Found\", \"message\": \"Appointment not found\"}");
            }
            
            // Kiểm tra xem user hiện tại có phải là doctor của appointment này không
            String username = authentication.getName();
            Integer accountIdInToken = doctorService.getAccountIdByUsername(username);
            if (accountIdInToken == null || !appointment.getDoctor().getAccountId().equals(accountIdInToken)) {
                return ResponseEntity.status(403).body("{\"error\": \"Forbidden\", \"message\": \"You can only update your own appointments\"}");
            }
            
            appointmentService.updateAppointmentStatus(id, status);
            return ResponseEntity.ok("{\"message\": \"Cập nhật trạng thái thành công!\"}");
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Bad Request");
            errorResponse.put("message", e.getMessage() != null ? e.getMessage() : "Unknown error");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }


    // Lấy tất cả lịch hẹn của bác sĩ
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getAppointmentsByDoctor(@PathVariable Integer doctorId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("{\"error\": \"Unauthorized\", \"message\": \"Full authentication is required\"}");
        }
        String username = authentication.getName();
        Doctor doctor = doctorService.getDoctorEntityById(doctorId);
        if (doctor == null) {
            return ResponseEntity.status(404).body("{\"error\": \"Not Found\", \"message\": \"Doctor not found\"}");
        }
        Integer accountIdInToken = doctorService.getAccountIdByUsername(username);
        if (accountIdInToken == null || !doctor.getAccountId().equals(accountIdInToken)) {
            return ResponseEntity.status(403).body("{\"error\": \"Forbidden\", \"message\": \"You do not have permission to view your own appointments\"}");
        }
        List<Appointment> appointments = appointmentService.getAppointmentsByDoctorId(doctorId);
        List<AppointmentDTO> dtos = new ArrayList<>();
        for (Appointment a : appointments) {
            AppointmentDTO dto = new AppointmentDTO();
            dto.setId(a.getAppointmentId());
            dto.setPatientId(a.getPatient() != null ? a.getPatient().getId() : null);
            dto.setDoctorId(a.getDoctor() != null ? a.getDoctor().getId() : null);
            dto.setSpecialtyId(a.getSpecialty() != null ? a.getSpecialty().getId() : null);
            dto.setServiceId(null);
            dto.setAppointmentDate(a.getAppointmentDate());
            dto.setDuration(a.getDuration());
            dto.setPriority(a.getPriority());
            dto.setConsultationType(a.getConsultationType());
            dto.setStatus(a.getStatus());
            dto.setNotes(a.getNotes());
            dto.setCreatedAt(a.getCreatedAt());
            dtos.add(dto);
        }
        return ResponseEntity.ok(dtos);
    }


    // Lấy lịch hẹn sắp tới của bác sĩ
    @GetMapping("/doctor/{doctorId}/upcoming")
    public List<Appointment> getUpcomingAppointments(@PathVariable Integer doctorId) {
        return appointmentService.getUpcomingAppointments(doctorId);
    }


    // Lấy lịch hẹn đã hoàn thành của bác sĩ
    @GetMapping("/doctor/{doctorId}/completed")
    public List<Appointment> getCompletedAppointments(@PathVariable Integer doctorId) {
        return appointmentService.getCompletedAppointments(doctorId);
    }


    // Lấy lịch hẹn theo trạng thái bất kỳ
    @GetMapping("/doctor/{doctorId}/status/{status}")
    public List<Appointment> getAppointmentsByStatus(@PathVariable Integer doctorId, @PathVariable String status) {
        return appointmentService.getAppointmentsByStatus(doctorId, status);
    }


    @GetMapping("/parent/{parentId}")
    public List<AppointmentDTO> getAppointmentsByParentId(@PathVariable Integer parentId) {
        return appointmentService.getAppointmentsByParentId(parentId);
    }


    // Get completed appointments between parent and doctor for feedback validation
    @GetMapping("/parent/{parentId}/doctor/{doctorId}/completed")
    public ResponseEntity<List<AppointmentDTO>> getCompletedAppointmentsByParentAndDoctor(
            @PathVariable Integer parentId,
            @PathVariable Integer doctorId) {
        try {
            List<AppointmentDTO> completedAppointments = appointmentService.getCompletedAppointmentsByParentAndDoctor(parentId, doctorId);
            return ResponseEntity.ok(completedAppointments);
        } catch (Exception e) {
            System.err.println("Error fetching completed appointments: " + e.getMessage());
            return ResponseEntity.ok(new ArrayList<>());
        }
    }


    // Get completed appointments between account and doctor for feedback validation
    @GetMapping("/account/{accountId}/doctor/{doctorId}/completed")
    public ResponseEntity<List<AppointmentDTO>> getCompletedAppointmentsByAccountAndDoctor(
            @PathVariable Integer accountId,
            @PathVariable Integer doctorId) {
        try {
            List<AppointmentDTO> completedAppointments = appointmentService.getCompletedAppointmentsByAccountAndDoctor(accountId, doctorId);
            return ResponseEntity.ok(completedAppointments);
        } catch (Exception e) {
            System.err.println("Error fetching completed appointments by account: " + e.getMessage());
            return ResponseEntity.ok(new ArrayList<>());
        }
    }
}

