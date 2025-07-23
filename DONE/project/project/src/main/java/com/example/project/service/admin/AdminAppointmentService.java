package com.example.project.service.admin;

import com.example.project.dto.AppointmentDTO;
import com.example.project.model.Appointment;
import com.example.project.model.Doctor;
import com.example.project.service.DoctorService;
import com.example.project.repository.AppointmentRepository;
import com.example.project.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class AdminAppointmentService {
    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private DoctorRepository doctorRepository;
    @Autowired
    private DoctorService doctorService;

    private String normalizeStatus(String status) {
        if (status == null) return null;
        switch (status.toLowerCase()) {
            case "pending": return "Pending";
            case "confirmed": return "Confirmed";
            case "completed": return "Completed";
            case "cancelled": return "Cancelled";
            default: return status;
        }
    }

    public AppointmentDTO updateAppointment(int appointmentId, AppointmentDTO appointmentDTO) {
        Optional<Appointment> optional = appointmentRepository.findById(appointmentId);
        if (!optional.isPresent()) {
            return null;
        }
        Appointment appointment = optional.get();

        // Lấy ngày và giờ từ DTO
        if (appointmentDTO.getAppointmentDate() != null && appointmentDTO.getAppointmentTime() != null && !appointmentDTO.getAppointmentTime().isEmpty()) {
            LocalDate date = appointmentDTO.getAppointmentDate().toLocalDate();
            String[] timeParts = appointmentDTO.getAppointmentTime().split(":");
            int hour = Integer.parseInt(timeParts[0]);
            int minute = Integer.parseInt(timeParts[1]);
            LocalDateTime newDateTime = date.atTime(hour, minute);

            // So sánh với giờ cũ
            LocalDateTime oldDateTime = appointment.getAppointmentDate();
            boolean isTimeChanged = oldDateTime.getHour() != hour || oldDateTime.getMinute() != minute || !oldDateTime.toLocalDate().equals(date);

            if (isTimeChanged) {
                Integer doctorId = appointmentDTO.getDoctorId() != null ? appointmentDTO.getDoctorId() : appointment.getDoctor().getId();
                List<com.example.project.dto.SlotDTO> slots = doctorService.getAvailableSlotsForDate(doctorId, date);
                boolean validSlot = slots.stream().anyMatch(slot ->
                    slot.getStartTime().equals(String.format("%02d:%02d", hour, minute)) &&
                    "Available".equalsIgnoreCase(slot.getStatus())
                );
                if (!validSlot) {
                    throw new IllegalArgumentException("Thời gian hẹn không hợp lệ với lịch làm việc của bác sĩ");
                }
            }
            appointment.setAppointmentDate(newDateTime);
        } else if (appointmentDTO.getAppointmentDate() != null && (appointmentDTO.getAppointmentTime() == null || appointmentDTO.getAppointmentTime().isEmpty())) {
            // Nếu không chọn giờ mới, giữ nguyên giờ cũ (chỉ cập nhật ngày nếu cần)
            LocalDate oldDate = appointment.getAppointmentDate().toLocalDate();
            LocalDate newDate = appointmentDTO.getAppointmentDate().toLocalDate();
            if (!oldDate.equals(newDate)) {
                // Giữ nguyên giờ cũ, chỉ đổi ngày
                LocalDateTime oldDateTime = appointment.getAppointmentDate();
                LocalDateTime newDateTimeKeepTime = newDate.atTime(oldDateTime.getHour(), oldDateTime.getMinute());
                appointment.setAppointmentDate(newDateTimeKeepTime);
            }
        }
        if (appointmentDTO.getDuration() != null) {
            appointment.setDuration(appointmentDTO.getDuration());
        }
        if (appointmentDTO.getPriority() != null) {
            appointment.setPriority(appointmentDTO.getPriority());
        }
        if (appointmentDTO.getConsultationType() != null) {
            appointment.setConsultationType(appointmentDTO.getConsultationType());
        }
        if (appointmentDTO.getStatus() != null) {
            appointment.setStatus(normalizeStatus(appointmentDTO.getStatus()));
        }
        if (appointmentDTO.getNotes() != null) {
            appointment.setNotes(appointmentDTO.getNotes());
        }
        if (appointmentDTO.getPaymentMethod() != null) {
            appointment.setPaymentMethod(appointmentDTO.getPaymentMethod());
        }
        if (appointmentDTO.getTotalFee() != null) {
            appointment.setTotalFee(appointmentDTO.getTotalFee());
        }
        Appointment savedAppointment = appointmentRepository.save(appointment);
        // Convert lại sang DTO (có thể dùng mapper hoặc tự build)
        AppointmentDTO result = new AppointmentDTO();
        result.setId(savedAppointment.getAppointmentId());
        result.setPatientId(savedAppointment.getPatient().getId());
        result.setDoctorId(savedAppointment.getDoctor().getId());
        result.setAppointmentDate(savedAppointment.getAppointmentDate());
        result.setDuration(savedAppointment.getDuration());
        result.setPriority(savedAppointment.getPriority());
        result.setConsultationType(savedAppointment.getConsultationType());
        result.setStatus(normalizeStatus(savedAppointment.getStatus()));
        result.setNotes(savedAppointment.getNotes());
        result.setPaymentMethod(savedAppointment.getPaymentMethod());
        result.setTotalFee(savedAppointment.getTotalFee());
        // ... add các trường khác nếu cần
        return result;
    }
} 