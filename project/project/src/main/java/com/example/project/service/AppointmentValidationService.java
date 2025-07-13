//package com.example.project.service;
//
//import com.example.project.dto.AppointmentRequestDTO;
//import com.example.project.model.Appointment;
//import com.example.project.model.Doctor;
//import com.example.project.model.DoctorAvailability;
//import com.example.project.repository.AppointmentRepository;
//import com.example.project.repository.DoctorRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.time.LocalDateTime;
//import java.time.ZoneId;
//import java.time.format.DateTimeFormatter;
//import java.time.format.DateTimeParseException;
//import java.util.List;
//import java.util.Optional;
//
//@Service
//public class AppointmentValidationService {
//
//    @Autowired
//    private AppointmentRepository appointmentRepository;
//
//    @Autowired
//    private DoctorRepository doctorRepository;
//
//    public ValidationResult validateAppointmentRequest(int patientId, AppointmentRequestDTO requestDTO) {
//        ValidationResult result = new ValidationResult();
//
//        // Validate appointment time format
//        if (!isValidDateTimeFormat(requestDTO.getAppointmentTime())) {
//            result.addError("Invalid appointment time format. Expected format: yyyy-MM-dd HH:mm:ss");
//            return result;
//        }
//
//        LocalDateTime appointmentTime = parseAppointmentTime(requestDTO.getAppointmentTime());
//
//        // Validate appointment time is not in the past
//        if (appointmentTime.isBefore(LocalDateTime.now())) {
//            result.addError("Appointment time cannot be in the past");
//            return result;
//        }
//
//        // Validate appointment time is not too far in the future (30 days)
//        if (appointmentTime.isAfter(LocalDateTime.now().plusDays(30))) {
//            result.addError("Appointment time cannot be more than 30 days in the future");
//            return result;
//        }
//
//        // Validate appointment time is not too soon (minimum 24 hours)
//        if (appointmentTime.isBefore(LocalDateTime.now().plusHours(24))) {
//            result.addError("Appointment must be scheduled at least 24 hours in advance");
//            return result;
//        }
//
//        // Validate doctor exists
//        Optional<Doctor> doctorOpt = doctorRepository.findById(requestDTO.getDoctorId());
//        if (doctorOpt.isEmpty()) {
//            result.addError("Doctor not found");
//            return result;
//        }
//
//        // Validate doctor availability
//        if (!isDoctorAvailable(requestDTO.getDoctorId(), appointmentTime)) {
//            result.addError("Doctor is not available at the selected time");
//            return result;
//        }
//
//        // Validate no conflicting appointments
//        if (hasConflictingAppointment(requestDTO.getDoctorId(), appointmentTime)) {
//            result.addError("There is already an appointment at this time");
//            return result;
//        }
//
//        // Validate total fee
//        if (requestDTO.getTotalFee() <= 0) {
//            result.addError("Total fee must be greater than 0");
//            return result;
//        }
//
//        // Validate payment method
//        if (requestDTO.getPaymentMethod() == null || requestDTO.getPaymentMethod().trim().isEmpty()) {
//            result.addError("Payment method is required");
//            return result;
//        }
//
//        return result;
//    }
//
//    private boolean isValidDateTimeFormat(String dateTimeStr) {
//        try {
//            LocalDateTime.parse(dateTimeStr, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
//            return true;
//        } catch (DateTimeParseException e) {
//            return false;
//        }
//    }
//
//    private LocalDateTime parseAppointmentTime(String appointmentTimeStr) {
//        return LocalDateTime.parse(appointmentTimeStr, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
//    }
//
//    private boolean isDoctorAvailable(int doctorId, LocalDateTime appointmentTime) {
//        Optional<Doctor> doctorOpt = doctorRepository.findByIdWithAvailabilities(doctorId,
//            appointmentTime.atZone(ZoneId.systemDefault()).toInstant());
//
//        if (doctorOpt.isEmpty()) {
//            return false;
//        }
//
//        Doctor doctor = doctorOpt.get();
//        if (doctor.getAvailabilities() == null || doctor.getAvailabilities().isEmpty()) {
//            return false;
//        }
//
//        // Check if appointment time falls within any availability slot
//        return doctor.getAvailabilities().stream()
//            .anyMatch(availability -> {
//                LocalDateTime startTime = availability.getStartTime().atZone(ZoneId.systemDefault()).toLocalDateTime();
////                LocalDateTime endTime = availability.getEndTime().atZone(ZoneId.systemDefault()).toLocalDateTime();
//                return appointmentTime.isAfter(startTime) && appointmentTime.isBefore(endTime)
//                    && "AVAILABLE".equals(availability.getStatus());
//            });
//    }
//
//    private boolean hasConflictingAppointment(int doctorId, LocalDateTime appointmentTime) {
//        // Check for appointments within 1 hour of the requested time
//        LocalDateTime startTime = appointmentTime.minusMinutes(30);
//        LocalDateTime endTime = appointmentTime.plusMinutes(30);
//
//        List<Appointment> existingAppointments = appointmentRepository.findByDoctorIdAndAppointmentTimeBetween(
//            doctorId, startTime, endTime);
//
//        return !existingAppointments.isEmpty();
//    }
//
//    public static class ValidationResult {
//        private boolean valid = true;
//        private List<String> errors = new java.util.ArrayList<>();
//
//        public boolean isValid() {
//            return valid && errors.isEmpty();
//        }
//
//        public void addError(String error) {
//            this.valid = false;
//            this.errors.add(error);
//        }
//
//        public List<String> getErrors() {
//            return errors;
//        }
//
//        public String getFirstError() {
//            return errors.isEmpty() ? null : errors.get(0);
//        }
//    }
//}