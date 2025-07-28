package com.example.project.service;

import com.example.project.model.Refund;
import com.example.project.repository.RefundRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RefundService {

    @Autowired
    private RefundRepository refundRepository;

    public Refund saveRefund(Refund refund) {
        return refundRepository.save(refund);
    }
}