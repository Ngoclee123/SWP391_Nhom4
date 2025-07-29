package com.example.project.service;

import com.example.project.dto.DoctorSearchDTO;
import com.example.project.dto.DoctorDTO;
import com.example.project.model.Doctor;
import com.example.project.model.Specialty;
import com.example.project.model.Certificate;
import com.example.project.model.Account;
import com.example.project.model.Role;
import com.example.project.repository.DoctorRepository;
import com.example.project.repository.DoctorSpecification;
import com.example.project.repository.SpecialtyRepository;
import com.example.project.repository.CertificateRepository;
import com.example.project.repository.AccountRepository;
import com.example.project.repository.RoleRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminManagementDoctorService {

    private static final Logger logger = LoggerFactory.getLogger(DoctorService.class);

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private SpecialtyRepository specialtyRepository;

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private RoleRepository roleRepository;

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
            dto.setEducation(doctor.getEducation());
            dto.setHospital(doctor.getHospital());
            // Thêm ngày sinh
            dto.setDateOfBirth(doctor.getDateOfBirth() != null ? doctor.getDateOfBirth().toString() : null);
            // Đảm bảo status luôn là 'online' hoặc 'offline' (không dấu, chữ thường)
            String status = doctor.getStatus();
            if (status != null) {
                status = status.trim().toLowerCase();
                if (!status.equals("online") && !status.equals("offline")) {
                    status = "offline";
                }
            } else {
                status = "offline";
            }
            dto.setStatus(status);

            // Map the first available slot (filtered by query)
            doctor.getAvailabilities().stream().findFirst().ifPresent(da -> {
                dto.setAvailabilityStatus(da.getStatus());
                dto.setStartTime(da.getStartTime().toString());
                dto.setEndTime(da.getEndTime().toString());
            });
            if (doctor.getAccount() != null) {
                dto.setAccountId(doctor.getAccount().getId());
                dto.setAccountUsername(doctor.getAccount().getUsername());
                dto.setAccountEmail(doctor.getAccount().getEmail());
                dto.setAccountRole(doctor.getAccount().getRole() != null ? doctor.getAccount().getRole().getRolename() : null);
                dto.setAccountPhoneNumber(doctor.getAccount().getPhoneNumber());
                dto.setAccountAddress(doctor.getAccount().getAddress());
                dto.setAccountStatus(doctor.getAccount().getStatus());
            }
            return dto;
        });
    }

    public DoctorSearchDTO getDoctorById(Integer doctorId) {
        logger.info("Fetching doctor with ID: {}", doctorId);
        Doctor doctor = doctorRepository.findByIdWithAvailabilities(doctorId)
                .orElseThrow(() -> {
                    logger.error("Doctor not found with ID: {}", doctorId);
                    return new RuntimeException("Doctor not found with ID: " + doctorId);
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
        dto.setEducation(doctor.getEducation());
        dto.setHospital(doctor.getHospital());
        // Thêm ngày sinh
        dto.setDateOfBirth(doctor.getDateOfBirth() != null ? doctor.getDateOfBirth().toString() : null);
        // Đảm bảo status luôn là 'online' hoặc 'offline' (không dấu, chữ thường)
        String status = doctor.getStatus();
        if (status != null) {
            status = status.trim().toLowerCase();
            if (!status.equals("online") && !status.equals("offline")) {
                status = "offline";
            }
        } else {
            status = "offline";
        }
        dto.setStatus(status);

        doctor.getAvailabilities().stream().findFirst().ifPresent(da -> {
            dto.setAvailabilityStatus(da.getStatus());
            dto.setStartTime(da.getStartTime().toString());
            dto.setEndTime(da.getEndTime().toString());
        });

        if (doctor.getAccount() != null) {
            dto.setAccountId(doctor.getAccount().getId());
            dto.setAccountUsername(doctor.getAccount().getUsername());
            dto.setAccountEmail(doctor.getAccount().getEmail());
            dto.setAccountRole(doctor.getAccount().getRole() != null ? doctor.getAccount().getRole().getRolename() : null);
            dto.setAccountPhoneNumber(doctor.getAccount().getPhoneNumber());
            dto.setAccountAddress(doctor.getAccount().getAddress());
            dto.setAccountStatus(doctor.getAccount().getStatus());
        }

        return dto;
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

    public List<Doctor> getOnlineDoctors() {
        return doctorRepository.findOnlineDoctors();
    }

    // ADMIN: Lưu (tạo/cập nhật) bác sĩ và certificates
    @Transactional
    public Doctor saveDoctor(DoctorDTO doctorDTO) {
        Doctor doctor;
        if (doctorDTO.getId() != null) {
            // Update existing doctor
            doctor = doctorRepository.findById(doctorDTO.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Doctor not found with ID: " + doctorDTO.getId()));
        } else {
            // Create new doctor - tự động tạo account
            doctor = new Doctor();
            doctor.setCreatedAt(Instant.now());

            // Tạo account mới cho bác sĩ
            Account newAccount = new Account();
            String username = "doctor_" + System.currentTimeMillis();
            newAccount.setUsername(username);
            newAccount.setPasswordHash("123456"); // Password mặc định
            newAccount.setEmail(doctorDTO.getFullName().toLowerCase().replace(" ", "") + "@hospital.com");
            newAccount.setFullName(doctorDTO.getFullName());
            newAccount.setPhoneNumber(doctorDTO.getPhoneNumber());
            newAccount.setAddress(doctorDTO.getLocational());
            newAccount.setStatus(true);

            // Set role DOCTOR
            Role doctorRole = roleRepository.findByRolename("DOCTOR");
            if (doctorRole == null) {
                // Tạo role DOCTOR nếu chưa có
                doctorRole = new Role();
                doctorRole.setRolename("DOCTOR");
                doctorRole = roleRepository.save(doctorRole);
            }
            newAccount.setRole(doctorRole);

            // Lưu account
            Account savedAccount = accountRepository.save(newAccount);
            // QUAN TRỌNG: Set accountId cho Doctor entity
            doctor.setAccountId(savedAccount.getId());
        }

        // Set các trường cơ bản
        doctor.setFullName(doctorDTO.getFullName());
        doctor.setSpecialty(specialtyRepository.findById(doctorDTO.getSpecialtyId())
                .orElseThrow(() -> new IllegalArgumentException("Specialty not found with ID: " + doctorDTO.getSpecialtyId())));
        doctor.setImgs(doctorDTO.getImgs());
        doctor.setBio(doctorDTO.getBio());
        doctor.setDateOfBirth(doctorDTO.getDateOfBirth());
        doctor.setLocational(doctorDTO.getLocational());
        doctor.setEducation(doctorDTO.getEducation());
        doctor.setHospital(doctorDTO.getHospital());
        doctor.setPhoneNumber(doctorDTO.getPhoneNumber());
        doctor.setStatus(doctorDTO.getStatus());

        // Lưu doctor trước để có id
        Doctor savedDoctor = doctorRepository.save(doctor);

        // Xử lý certificates
        if (doctorDTO.getCertificates() != null) {
            // Đảm bảo savedDoctor có ID trước khi quản lý certificates
            if (savedDoctor.getId() == null) {
                logger.error("Saved doctor ID is null after persistence. Cannot manage certificates for this doctor.");
            } else {
                // Xóa certificates cũ cho bác sĩ này
                List<Certificate> oldCerts = certificateRepository.findByDoctor_Id(savedDoctor.getId());
                if (oldCerts != null && !oldCerts.isEmpty()) {
                    certificateRepository.deleteAll(oldCerts);
                }

                // Lưu certificates mới
                for (String certName : doctorDTO.getCertificates()) {
                    if (certName != null && !certName.trim().isEmpty()) {
                        Certificate cert = new Certificate();
                        cert.setDoctor(savedDoctor); // Liên kết certificate với bác sĩ đã lưu
                        cert.setCertificateName(certName.trim());
                        certificateRepository.save(cert);
                    }
                }
            }
        }

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
}

