package com.example.project.service;

import com.example.project.dto.AvailabilityDTO;
import com.example.project.dto.DoctorSearchDTO;
import com.example.project.dto.SlotDTO;
import com.example.project.model.Appointment;
import com.example.project.model.Certificate;
import com.example.project.model.Doctor;
import com.example.project.model.DoctorAvailability;
import com.example.project.model.Specialty;
import com.example.project.repository.AppointmentRepository;
import com.example.project.repository.DoctorRepository;
import com.example.project.repository.DoctorSpecification;
import com.example.project.repository.SpecialtyRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    private static final Logger logger = LoggerFactory.getLogger(DoctorService.class);

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private SpecialtyRepository specialtyRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    public List<Specialty> getAllSpecialties() {
        logger.info("Fetching all specialties");
        return specialtyRepository.findAll();
    }

    private DoctorSearchDTO mapDoctorToDTO(Doctor doctor) {
        if (doctor == null) {
            logger.warn("Attempted to map null doctor to DTO");
            return null;
        }

        try {
            DoctorSearchDTO dto = new DoctorSearchDTO();
            dto.setId(doctor.getId());
            dto.setFullName(doctor.getFullName());
            dto.setBio(doctor.getBio());
            dto.setPhoneNumber(doctor.getPhoneNumber());
            dto.setImgs(doctor.getImgs());
            dto.setLocational(doctor.getLocational());
            dto.setEducation(doctor.getEducation());
            dto.setHospital(doctor.getHospital());
            dto.setMorningHours(doctor.getMorningHours());
            dto.setAfternoonHours(doctor.getAfternoonHours());

            if (doctor.getAccount() != null) {
                dto.setEmail(doctor.getAccount().getEmail());
                dto.setAddress(doctor.getAccount().getAddress());
            }

            if (doctor.getSpecialty() != null) {
                dto.setSpecialtyName(doctor.getSpecialty().getName());
            }

            if (doctor.getCertificates() != null) {
                dto.setCertificates(doctor.getCertificates().stream()
                        .map(Certificate::getCertificateName)
                        .collect(Collectors.toList()));
            }

            if (doctor.getAvailabilities() != null && !doctor.getAvailabilities().isEmpty()) {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").withZone(ZoneId.systemDefault());
                dto.setAvailabilities(doctor.getAvailabilities().stream()
                        .map(avail -> {
                            AvailabilityDTO availDto = new AvailabilityDTO();
                            availDto.setStartTime(formatter.format(avail.getStartTime()));
                            availDto.setEndTime(formatter.format(avail.getEndTime()));
                            availDto.setStatus(avail.getStatus());
                            return availDto;
                        })
                        .collect(Collectors.toList()));
            }

            return dto;
        } catch (Exception e) {
            logger.error("Error mapping doctor to DTO: {}", e.getMessage());
            return null;
        }
    }
    
    public Map<String, Object> getAllDoctors() {
        logger.info("Fetching all doctors");
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Doctor> doctors = doctorRepository.findAllWithDetails();
            if (doctors.isEmpty()) {
                logger.info("No doctors found in database");
                response.put("data", Collections.emptyList());
                return response;
            }

            List<DoctorSearchDTO> doctorDTOs = doctors.stream()
                    .map(this::mapDoctorToDTO)
                    .filter(dto -> dto != null)
                    .collect(Collectors.toList());

            if (doctorDTOs.isEmpty() && !doctors.isEmpty()) {
                logger.error("Failed to map any doctors to DTOs despite having doctor records");
                response.put("error", "Lỗi xử lý dữ liệu bác sĩ");
                return response;
            }

            logger.info("Successfully fetched and mapped {} doctors", doctorDTOs.size());
            response.put("data", doctorDTOs);
            return response;
        } catch (Exception e) {
            logger.error("Error fetching all doctors: {}", e.getMessage());
            response.put("error", "Không thể tải danh sách bác sĩ");
            return response;
        }
    }

    public Page<DoctorSearchDTO> searchDoctors(
            Integer specialtyId,
            String fullName,
            String availabilityStatus,
            String location,
            String availabilityTime,
            Pageable pageable) {
        logger.info("Searching doctors with criteria: specialtyId={}, fullName={}, availabilityStatus={}, location={}, availabilityTime={}",
                specialtyId, fullName, availabilityStatus, location, availabilityTime);

        Instant searchTime = null;
        if (availabilityTime != null && !availabilityTime.trim().isEmpty()) {
            try {
                searchTime = Instant.parse(availabilityTime);
                logger.debug("Parsed availabilityTime: {}", searchTime);
            } catch (Exception e) {
                logger.error("Invalid availabilityTime format: {}", availabilityTime, e);
                throw new IllegalArgumentException("Invalid availabilityTime format");
            }
        }

        Page<Doctor> doctors = doctorRepository.findAll(
                DoctorSpecification.searchDoctors(specialtyId, fullName, availabilityStatus, location, searchTime),
                pageable
        );

        return doctors.map(this::mapDoctorToDTO);
    }

    public DoctorSearchDTO getDoctorById(Integer doctorId) {
        logger.info("Fetching doctor with ID: {}", doctorId);
        try {
            Doctor doctor = doctorRepository.findByIdWithDetails(doctorId)
                    .orElseThrow(() -> {
                        logger.error("Doctor not found with ID: {}", doctorId);
                        return new RuntimeException("Doctor not found with ID: " + doctorId);
                    });
            
            DoctorSearchDTO dto = mapDoctorToDTO(doctor);
            if (dto == null) {
                throw new RuntimeException("Error mapping doctor data for ID: " + doctorId);
            }
            return dto;
        } catch (Exception e) {
            logger.error("Error fetching doctor with ID {}: {}", doctorId, e.getMessage());
            throw e;
        }
    }

    public Doctor getDoctorEntityById(Integer doctorId) {
        logger.info("Fetching doctor entity with ID: {}", doctorId);
        return doctorRepository.findById(doctorId)
                .orElseThrow(() -> {
                    logger.error("Doctor not found with ID: {}", doctorId);
                    return new RuntimeException("Doctor not found with ID: " + doctorId);
                });
    }

    public Doctor findDoctorByAccountId(Integer accountId) {
        logger.info("Fetching doctor by account ID: {}", accountId);
        return doctorRepository.findByAccountId(accountId)
                .orElse(null);
    }

    @Transactional
    public List<SlotDTO> getAvailableSlotsForDate(Integer doctorId, LocalDate date) {
        List<SlotDTO> allSlots = new ArrayList<>();

        // 1. Lấy tất cả các ca làm việc lớn của bác sĩ trong ngày được chọn
        List<DoctorAvailability> availabilitiesToday = doctorRepository.findById(doctorId)
                .map(Doctor::getAvailabilities)
                .map(set -> set.stream()
                        .filter(a -> a.getStartTime().toLocalDate().equals(date))
                        .collect(Collectors.toList()))
                .orElse(Collections.emptyList());

        if (availabilitiesToday.isEmpty()) {
            return Collections.emptyList(); // Nếu bác sĩ không làm việc ngày này, trả về danh sách rỗng
        }

        // 2. Lấy danh sách các cuộc hẹn đã có của bác sĩ trong ngày
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
        List<Appointment> appointments = appointmentRepository.findByDoctorIdAndAppointmentDateBetween(
                doctorId, startOfDay, endOfDay);

        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        // 3. "Cắt" các ca làm việc lớn thành các slot 1 giờ
        for (DoctorAvailability availability : availabilitiesToday) {
            // Bỏ qua các block thời gian không ở trạng thái "Available"
            if (!"Available".equalsIgnoreCase(availability.getStatus())) {
                continue;
            }

            LocalDateTime slotStart = availability.getStartTime();
            LocalDateTime slotEnd = availability.getEndTime();

            while (slotStart.isBefore(slotEnd)) {
                LocalDateTime currentSlotEnd = slotStart.plusHours(1);
                
                // 4. Kiểm tra xem slot này có bị trùng với lịch hẹn nào đã có không
                boolean isBooked = false;
                for (Appointment appointment : appointments) {
                    LocalDateTime appointmentStart = appointment.getAppointmentDate();
                    // Nếu thời gian bắt đầu của một lịch hẹn nằm trong khoảng của slot hiện tại
                    if (!appointmentStart.isBefore(slotStart) && appointmentStart.isBefore(currentSlotEnd)) {
                        isBooked = true;
                        break;
                    }
                }

                allSlots.add(new SlotDTO(
                        slotStart.format(timeFormatter),
                        currentSlotEnd.format(timeFormatter),
                        isBooked ? "Booked" : "Available"
                ));
                slotStart = currentSlotEnd;
            }
        }
        
        // Sắp xếp các slot theo thời gian bắt đầu để đảm bảo thứ tự đúng
        allSlots.sort(Comparator.comparing(SlotDTO::getStartTime));

        return allSlots;
    }
}


