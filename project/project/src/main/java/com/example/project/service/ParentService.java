package com.example.project.service;

import com.example.project.dto.ParentProfileDTO;

public interface ParentService {
    ParentProfileDTO getParentProfile(int accountId);
    void updateParentProfile(int accountId, ParentProfileDTO profileDTO);
}