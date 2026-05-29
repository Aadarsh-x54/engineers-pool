package com.engineerspool.config;

import com.engineerspool.entity.Role;
import com.engineerspool.entity.User;
import com.engineerspool.repository.RoleRepository;
import com.engineerspool.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Set;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    @Value("${app.security.admin-email}")
    private String adminEmail;

    @Value("${app.security.admin-password}")
    private String adminPassword;

    private static final String PREVIOUS_DEV_PASSWORD = "ChangeMe123!";

    @Bean
    CommandLineRunner ensureAdminUser(
            RoleRepository roleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_ADMIN").build()));

            userRepository.findByEmailIgnoreCase(adminEmail)
                    .ifPresentOrElse(existingAdmin -> {
                        if (passwordEncoder.matches(PREVIOUS_DEV_PASSWORD, existingAdmin.getPasswordHash())) {
                            existingAdmin.setPasswordHash(passwordEncoder.encode(adminPassword));
                            existingAdmin.getRoles().add(adminRole);
                            userRepository.save(existingAdmin);
                        }
                    }, () -> userRepository.save(User.builder()
                            .name("Engineers Pool Admin")
                            .email(adminEmail)
                            .passwordHash(passwordEncoder.encode(adminPassword))
                            .enabled(true)
                            .roles(new HashSet<>(Set.of(adminRole)))
                            .build()));
        };
    }
}
