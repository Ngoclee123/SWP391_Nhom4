package com.example.project.service;

import com.example.project.dto.AvailabilityDTO;
import com.example.project.dto.DoctorSearchDTO;
import com.example.project.dto.SlotDTO;
import com.example.project.model.*;
import com.example.project.repository.AppointmentRepository;
import com.example.project.repository.DoctorRepository;
import com.example.project.repository.DoctorSpecification;
import com.example.project.repository.SpecialtyRepository;
import com.example.project.repository.AccountRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    private static final Logger logger = LoggerFactory.getLogger(DoctorService.class);

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private SpecialtyRepository specialtyRepository;

    @Autowired
    private AccountRepository accountRepository;

    public List<Specialty> getAllSpecialties() {
        logger.info("Fetching all specialties");
        return specialtyRepository.findAll();
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

        // Clean up empty strings
        if (fullName != null && fullName.trim().isEmpty()) {
            fullName = null;
        }
        if (availabilityStatus != null && availabilityStatus.trim().isEmpty()) {
            availabilityStatus = null;
        }
        if (location != null && location.trim().isEmpty()) {
            location = null;
        }

        Instant searchTime = null;
        if (availabilityTime != null && !availabilityTime.trim().isEmpty()) {
            try {
                // Parse the UTC ISO string sent from the frontend
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

        return doctors.map(doctor -> {
            DoctorSearchDTO dto = new DoctorSearchDTO();
            dto.setId(doctor.getId());
            dto.setFullName(doctor.getFullName());
            dto.setBio(doctor.getBio());
            dto.setPhoneNumber(doctor.getPhoneNumber());
            dto.setImgs(doctor.getImgs());
            dto.setLocational(doctor.getLocational());
            dto.setSpecialtyId(doctor.getSpecialty() != null ? doctor.getSpecialty().getId() : null);
            dto.setSpecialtyName(doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : null);

            // Map the first available slot (filtered by query)
            doctor.getAvailabilities().stream().findFirst().ifPresent(da -> {
                dto.setAvailabilityStatus(da.getStatus());
                dto.setStartTime(da.getStartTime().toString());
                dto.setEndTime(da.getEndTime().toString());
            });

            // Map certificates
            dto.setCertificates(
                doctor.getCertificates() != null
                    ? doctor.getCertificates().stream().map(c -> c.getCertificateName()).collect(java.util.stream.Collectors.toList())
                    : new java.util.ArrayList<>()
            );

            return dto;
        });
    }

    public DoctorSearchDTO getDoctorById(Integer doctorId) {
        logger.info("Fetching doctor with ID: {}", doctorId);
        Doctor doctor = doctorRepository.findByIdWithAvailabilitiesAndCertificates(doctorId)
                .orElseThrow(() -> {
                    logger.error("Doctor not found with ID: {}", doctorId);
                    return new RuntimeException("Doctor not found with ID: " + doctorId);
                });

        // Sử dụng mapDoctorToDTO để đảm bảo lấy đúng email từ account
        return mapDoctorToDTO(doctor);
    }

    public DoctorSearchDTO getDoctorByAccountId(Integer accountId) {
        logger.info("Fetching doctor by account ID: {}", accountId);
        Doctor doctor = doctorRepository.findByAccountId(accountId)
                .orElseThrow(() -> {
                    logger.error("Doctor not found with account ID: {}", accountId);
                    return new RuntimeException("Doctor not found with account ID: " + accountId);
                });

        DoctorSearchDTO dto = new DoctorSearchDTO();
        dto.setId(doctor.getId());
        dto.setFullName(doctor.getFullName());
        dto.setBio(doctor.getBio());
        dto.setPhoneNumber(doctor.getPhoneNumber());
        dto.setImgs(doctor.getImgs());
        dto.setLocational(doctor.getLocational());
        dto.setSpecialtyId(doctor.getSpecialty() != null ? doctor.getSpecialty().getId() : null);
        dto.setSpecialtyName(doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : null);
        // Lấy thông tin lịch làm việc đầu tiên (nếu có)
        doctor.getAvailabilities().stream().findFirst().ifPresent(da -> {
            dto.setAvailabilityStatus(da.getStatus());
            dto.setStartTime(da.getStartTime().toString());
            dto.setEndTime(da.getEndTime().toString());
        });

        return dto;
    }

    public List<DoctorSearchDTO> getAvailableDoctorsBySpecialty(Integer specialtyId) {
        logger.info("Fetching available doctors for specialtyId: {}", specialtyId);
        List<Doctor> doctors = doctorRepository.findAll(
                DoctorSpecification.searchDoctors(specialtyId, null, "Available", null, Instant.now())
        );
        return doctors.stream().map(doctor -> {
            DoctorSearchDTO dto = new DoctorSearchDTO();
            dto.setId(doctor.getId());
            dto.setFullName(doctor.getFullName());
            dto.setBio(doctor.getBio());
            dto.setPhoneNumber(doctor.getPhoneNumber());
            dto.setImgs(doctor.getImgs());
            dto.setLocational(doctor.getLocational());
            dto.setSpecialtyId(doctor.getSpecialty() != null ? doctor.getSpecialty().getId() : null);
            dto.setSpecialtyName(doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : null);
            doctor.getAvailabilities().stream().findFirst().ifPresent(da -> {
                dto.setAvailabilityStatus(da.getStatus());
                dto.setStartTime(da.getStartTime().toString());
                dto.setEndTime(da.getEndTime().toString());
            });
            return dto;
        }).collect(Collectors.toList());
    }

    public List<DoctorSearchDTO> getAllDoctorsBySpecialty(Integer specialtyId) {
        logger.info("Fetching all doctors for specialtyId: {}", specialtyId);
        List<Doctor> doctors = doctorRepository.findBySpecialtyId(specialtyId);
        if (doctors == null) {
            return List.of();
        }
        return doctors.stream().map(doctor -> {
            DoctorSearchDTO dto = new DoctorSearchDTO();
            dto.setId(doctor.getId());
            dto.setFullName(doctor.getFullName());
            dto.setUsername(doctor.getAccount() != null ? doctor.getAccount().getUsername() : null); // Lấy username từ Account
            dto.setBio(doctor.getBio());
            dto.setPhoneNumber(doctor.getPhoneNumber());
            dto.setImgs(doctor.getImgs());
            dto.setLocational(doctor.getLocational());
            dto.setSpecialtyId(doctor.getSpecialty() != null ? doctor.getSpecialty().getId() : null);
            dto.setSpecialtyName(doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : null);
            return dto;
        }).collect(Collectors.toList());
    }


    // New method to fetch Doctor entity
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
        return doctorRepository.findByAccountId(accountId).orElse(null);
    }

    public Integer getAccountIdByUsername(String username) {
        Account account = accountRepository.findByUsername(username);
        return account != null ? account.getId() : null;
    }

    //Ngọc


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
            dto.setDateOfBirth(doctor.getDateOfBirth() != null ? doctor.getDateOfBirth().toString() : null);
            dto.setStatus(doctor.getStatus());

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

            // Tính rating trung bình và số lượng feedback
            // Đã chuyển sang tính ở frontend theo yêu cầu trước đó
            // Không cần tính ở đây nữa

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





    // ADMIN: Lưu (tạo/cập nhật) bác sĩ và certificates
    @Transactional
    public Doctor saveDoctor(Doctor doctor) {
        if (doctor.getSpecialty() == null || doctor.getSpecialty().getId() == null) {
            throw new IllegalArgumentException("Specialty is required");
        }
        Specialty specialty = specialtyRepository.findById(doctor.getSpecialty().getId())
                .orElseThrow(() -> new IllegalArgumentException("Specialty not found"));
        doctor.setSpecialty(specialty);
        // Lưu các trường mới
        // imgs, bio, dateOfBirth, locational, education, hospital, phoneNumber, status đã có trong entity
        // Không cần xử lý certificates ở đây nữa
        Doctor savedDoctor = doctorRepository.save(doctor);
        return savedDoctor;
    }

    // ADMIN: Xóa bác sĩ
    public boolean deleteDoctor(Integer id) {
        if (!doctorRepository.existsById(id)) {
            return false;
        }
        doctorRepository.deleteById(id);
        return true;
    }

    // Lấy danh sách bác sĩ được gợi ý dựa trên đánh giá cao
    public List<DoctorSearchDTO> getRecommendedDoctors(int limit) {
        logger.info("Fetching recommended doctors with limit: {}", limit);
        
        try {
            // Lấy tất cả doctors và giới hạn số lượng
            List<Doctor> allDoctors = doctorRepository.findAll();
            List<Doctor> limitedDoctors = allDoctors.stream()
                .limit(limit)
                .collect(Collectors.toList());
            
            List<DoctorSearchDTO> recommendedDoctors = new ArrayList<>();
            
            for (Doctor doctor : limitedDoctors) {
                DoctorSearchDTO dto = new DoctorSearchDTO();
                dto.setId(doctor.getId());
                dto.setFullName(doctor.getFullName());
                dto.setBio(doctor.getBio());
                dto.setPhoneNumber(doctor.getPhoneNumber());
                dto.setImgs(doctor.getImgs());
                dto.setLocational(doctor.getLocational());
                dto.setSpecialtyId(doctor.getSpecialty() != null ? doctor.getSpecialty().getId() : null);
                dto.setSpecialtyName(doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : null);
                
                // Rating sẽ được tính ở frontend theo yêu cầu trước đó
                // Không cần set averageRating và feedbackCount ở đây
                
                // Map certificates
                dto.setCertificates(
                    doctor.getCertificates() != null
                        ? doctor.getCertificates().stream().map(c -> c.getCertificateName()).collect(java.util.stream.Collectors.toList())
                        : new java.util.ArrayList<>()
                );
                
                recommendedDoctors.add(dto);
            }
            
            logger.info("Successfully fetched {} recommended doctors", recommendedDoctors.size());
            return recommendedDoctors;
            
        } catch (Exception e) {
            logger.error("Error fetching recommended doctors: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    // Lấy danh sách bác sĩ online
    public List<DoctorSearchDTO> getOnlineDoctors() {
        logger.info("Fetching online doctors");
        try {
            List<Doctor> onlineDoctors = doctorRepository.findOnlineDoctors();
            return onlineDoctors.stream().map(doctor -> {
                DoctorSearchDTO dto = new DoctorSearchDTO();
                dto.setId(doctor.getId());
                dto.setFullName(doctor.getFullName());
                dto.setBio(doctor.getBio());
                dto.setPhoneNumber(doctor.getPhoneNumber());
                dto.setImgs(doctor.getImgs());
                dto.setLocational(doctor.getLocational());
                dto.setSpecialtyId(doctor.getSpecialty() != null ? doctor.getSpecialty().getId() : null);
                dto.setSpecialtyName(doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : null);
                dto.setStatus(doctor.getStatus());
                
                // Map certificates
                dto.setCertificates(
                    doctor.getCertificates() != null
                        ? doctor.getCertificates().stream().map(c -> c.getCertificateName()).collect(java.util.stream.Collectors.toList())
                        : new java.util.ArrayList<>()
                );
                
                return dto;
            }).collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error fetching online doctors: {}", e.getMessage());
            return new ArrayList<>();
        }
    }






}


