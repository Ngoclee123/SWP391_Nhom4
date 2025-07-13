package com.example.project.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class SlotDTO {
    private String startTime;
    private String endTime;
    private String status; // "Available" or "Booked"
}