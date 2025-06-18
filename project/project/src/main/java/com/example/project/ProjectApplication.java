package com.example.project;


import com.example.project.model.DoctorAvailability;
import com.example.project.repository.DoctorAvailabilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ProjectApplication implements CommandLineRunner {

	@Autowired

	public static void main(String[] args) {
		SpringApplication.run(ProjectApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {

		}
	}

