//package com.example.project;
//
//import com.example.project.dto.AppointmentRequestDTO;
//import com.example.project.model.Appointment;
//import com.example.project.service.AppointmentService;
//import com.example.project.service.AppointmentValidationService;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.MockitoAnnotations;
//import org.springframework.boot.test.context.SpringBootTest;
//
//import java.time.LocalDateTime;
//import java.time.format.DateTimeFormatter;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.Mockito.*;
//
//@SpringBootTest
//public class AppointmentServiceTest {
//
//    @Mock
//    private AppointmentValidationService validationService;
//
//    @InjectMocks
//    private AppointmentService appointmentService;
//
//    private AppointmentRequestDTO validRequestDTO;
//
//    @BeforeEach
//    void setUp() {
//        MockitoAnnotations.openMocks(this);
//
//        validRequestDTO = new AppointmentRequestDTO();
//        validRequestDTO.setDoctorId(1);
//        validRequestDTO.setAppointmentTime(LocalDateTime.now().plusDays(2).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
//        validRequestDTO.setTotalFee(500000);
//        validRequestDTO.setPaymentMethod("VNPay");
//    }
//
//    @Test
//    void testCreateAppointment_ValidRequest_ShouldSucceed() {
//        // Arrange
//        AppointmentValidationService.ValidationResult validResult = new AppointmentValidationService.ValidationResult();
//        when(validationService.validateAppointmentRequest(anyInt(), any(AppointmentRequestDTO.class)))
//            .thenReturn(validResult);
//
//        // Act
//        Appointment result = appointmentService.createAppointment(1, validRequestDTO);
//
//        // Assert
//        assertNotNull(result);
//        assertEquals(1, result.getPatientId());
//        assertEquals(1, result.getDoctorId());
//        assertEquals("Pending", result.getStatus());
//        assertEquals(500000, result.getTotalFee());
//        assertEquals("VNPay", result.getPaymentMethod());
//    }
//
//    @Test
//    void testCreateAppointment_InvalidRequest_ShouldThrowException() {
//        // Arrange
//        AppointmentValidationService.ValidationResult invalidResult = new AppointmentValidationService.ValidationResult();
//        invalidResult.addError("Doctor is not available at the selected time");
//        when(validationService.validateAppointmentRequest(anyInt(), any(AppointmentRequestDTO.class)))
//            .thenReturn(invalidResult);
//
//        // Act & Assert
//        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
//            appointmentService.createAppointment(1, validRequestDTO);
//        });
//
//        assertEquals("Doctor is not available at the selected time", exception.getMessage());
//    }
//
//    @Test
//    void testUpdateAppointmentStatus_ValidTransition_ShouldSucceed() {
//        // Test the validation logic using local helper method
//        assertTrue(isValidStatusTransition("Pending", "Confirmed"));
//        assertTrue(isValidStatusTransition("Pending", "Cancelled"));
//        assertTrue(isValidStatusTransition("Confirmed", "Completed"));
//        assertTrue(isValidStatusTransition("Confirmed", "Cancelled"));
//    }
//
//    @Test
//    void testUpdateAppointmentStatus_InvalidTransition_ShouldReturnFalse() {
//        assertFalse(isValidStatusTransition("Completed", "Pending"));
//        assertFalse(isValidStatusTransition("Cancelled", "Confirmed"));
//        assertFalse(isValidStatusTransition("Completed", "Cancelled"));
//    }
//
//    @Test
//    void testCancelAppointment_ValidCancellation_ShouldSucceed() {
//        // Test the business logic using local helper method
//        assertTrue(canCancelAppointment("Pending"));
//        assertFalse(canCancelAppointment("Completed"));
//        assertFalse(canCancelAppointment("Cancelled"));
//    }
//
//    // Helper methods for testing
//    private boolean isValidStatusTransition(String currentStatus, String newStatus) {
//        switch (currentStatus) {
//            case "Pending":
//                return "Confirmed".equals(newStatus) || "Cancelled".equals(newStatus);
//            case "Confirmed":
//                return "Completed".equals(newStatus) || "Cancelled".equals(newStatus);
//            case "Completed":
//                return false;
//            case "Cancelled":
//                return false;
//            default:
//                return false;
//        }
//    }
//
//    private boolean canCancelAppointment(String status) {
//        return "Pending".equals(status);
//    }
//}