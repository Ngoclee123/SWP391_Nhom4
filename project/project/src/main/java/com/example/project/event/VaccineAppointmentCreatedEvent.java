package com.example.project.event;

import org.springframework.context.ApplicationEvent;

public class VaccineAppointmentCreatedEvent extends ApplicationEvent {
    private final Integer appointmentId;

    public VaccineAppointmentCreatedEvent(Object source, Integer appointmentId) {
        super(source);
        this.appointmentId = appointmentId;
    }

    public Integer getAppointmentId() {
        return appointmentId;
    }
} 