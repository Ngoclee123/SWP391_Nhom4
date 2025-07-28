package com.example.project;


import com.example.project.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ProjectApplication implements CommandLineRunner {
	@Autowired
	private AccountService accountService;

	@Override
	public void run(String... args) throws Exception {
		accountService.printAllAccounts();
	}

	public static void main(String[] args) {
		SpringApplication.run(ProjectApplication.class, args);
	}
}
