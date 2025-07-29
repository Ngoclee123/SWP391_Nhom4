package com.example.project.service.impl;

import com.example.project.dto.FeedbackDTO;
import com.example.project.model.Appointment;
import com.example.project.model.Doctor;
import com.example.project.model.Feedback;
import com.example.project.model.Parent;
import com.example.project.repository.AppointmentRepository;
import com.example.project.repository.DoctorRepository;
import com.example.project.repository.FeedbackRepository;
import com.example.project.repository.ParentRepository;
import com.example.project.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FeedbackServiceImpl implements FeedbackService {
    @Autowired
    private FeedbackRepository feedbackRepository;
    @Autowired
    private ParentRepository parentRepository;
    @Autowired
    private DoctorRepository doctorRepository;
    @Autowired
    private AppointmentRepository appointmentRepository;

    @Override
    public Feedback addFeedback(FeedbackDTO dto) {
        Feedback feedback = new Feedback();
        Optional<Parent> parentOpt = parentRepository.findById(dto.getParentId());
        if (parentOpt.isEmpty()) throw new RuntimeException("Parent not found");
        feedback.setParent(parentOpt.get());
        if (dto.getDoctorId() != null) {
            Optional<Doctor> doctorOpt = doctorRepository.findById(dto.getDoctorId());
            if (doctorOpt.isEmpty()) throw new RuntimeException("Doctor not found");
            feedback.setDoctor(doctorOpt.get());
        }
        if (dto.getAppointmentId() == null) throw new RuntimeException("Phải chọn lịch khám để đánh giá!");
        boolean valid = appointmentRepository.existsByAppointmentIdAndPatient_Parent_IdAndDoctor_IdAndStatus(
            dto.getAppointmentId(), dto.getParentId(), dto.getDoctorId(), "Completed"
        );
        if (!valid) throw new RuntimeException("Bạn chỉ có thể đánh giá sau khi đã khám bác sĩ này!");

        if (feedbackRepository.existsByAppointment_AppointmentId(dto.getAppointmentId())) {
            throw new RuntimeException("Bạn đã đánh giá lịch khám này rồi!");
        }

        Appointment appointment = new Appointment();
        appointment.setAppointmentId(dto.getAppointmentId());
        feedback.setAppointment(appointment);
        feedback.setRating(dto.getRating());
        feedback.setComment(dto.getComment());
        feedback.setCreatedAt(LocalDateTime.now());
        return feedbackRepository.save(feedback);
    }

    @Override
    public List<Feedback> getFeedbacksByDoctorId(Integer doctorId) {
        return feedbackRepository.findByDoctor_Id(doctorId);
    }
} 