package com.example.project.controler.admin;

import com.example.project.repository.CertificateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/doctors")
public class AdminDoctorCertificateController {
    @Autowired
    private CertificateRepository certificateRepository;

    // Lấy danh sách tên chứng chỉ của bác sĩ theo doctorId
    @GetMapping("/{doctorId}/certificates")
    public List<String> getCertificatesByDoctorId(@PathVariable Integer doctorId) {
        return certificateRepository.findByDoctor_Id(doctorId)
                .stream()
                .map(c -> c.getCertificateName())
                .collect(Collectors.toList());
    }
}