package com.engineerspool.service;

import com.engineerspool.dto.GoogleLoginRequest;
import com.engineerspool.dto.GoogleTokenInfo;
import com.engineerspool.dto.LoginRequest;
import com.engineerspool.dto.LoginResponse;
import com.engineerspool.dto.PasswordChangeRequest;
import com.engineerspool.entity.User;
import com.engineerspool.exception.BadRequestException;
import com.engineerspool.exception.NotFoundException;
import com.engineerspool.repository.UserRepository;
import com.engineerspool.security.AppUserDetailsService;
import com.engineerspool.security.JwtService;
import com.engineerspool.security.LoginAttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AppUserDetailsService userDetailsService;
    private final LoginAttemptService loginAttemptService;
    private final jakarta.servlet.http.HttpServletRequest httpServletRequest;

    @Value("${app.security.google-client-id:}")
    private String googleClientId;

    private final RestTemplate restTemplate = new RestTemplate();

    public LoginResponse login(LoginRequest request) {
        String ip = getClientIp();
        if (loginAttemptService.isBlocked(ip)) {
            throw new BadRequestException("Too many failed login attempts. This IP address is temporarily locked. Please try again in 15 minutes.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
            UserDetails principal = (UserDetails) authentication.getPrincipal();
            
            loginAttemptService.loginSucceeded(ip);

            String token = jwtService.generateToken(principal);
            Set<String> roles = principal.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toSet());
            return new LoginResponse(token, jwtService.getExpirationInstant(), principal.getUsername(), roles);
        } catch (Exception ex) {
            loginAttemptService.loginFailed(ip);
            throw ex;
        }
    }

    private String getClientIp() {
        String xfHeader = httpServletRequest.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isBlank()) {
            return httpServletRequest.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }

    public LoginResponse loginWithGoogle(GoogleLoginRequest request) {
        GoogleTokenInfo tokenInfo = verifyGoogleToken(request.credential());
        String email = tokenInfo.email();

        UserDetails principal;
        try {
            principal = userDetailsService.loadUserByUsername(email);
        } catch (Exception ex) {
            throw new BadRequestException("Google email '" + email + "' is not registered as an administrator.");
        }

        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            throw new BadRequestException("User does not have administrator privileges.");
        }

        if (!principal.isEnabled()) {
            throw new BadRequestException("User account is disabled.");
        }

        String token = jwtService.generateToken(principal);
        Set<String> roles = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        return new LoginResponse(token, jwtService.getExpirationInstant(), principal.getUsername(), roles);
    }

    private GoogleTokenInfo verifyGoogleToken(String credential) {
        try {
            String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + credential;
            GoogleTokenInfo tokenInfo = restTemplate.getForObject(url, GoogleTokenInfo.class);
            if (tokenInfo == null) {
                throw new BadRequestException("Failed to verify Google token: empty response.");
            }
            if (tokenInfo.iss() == null || (!tokenInfo.iss().equals("https://accounts.google.com") && !tokenInfo.iss().equals("accounts.google.com"))) {
                throw new BadRequestException("Invalid token issuer.");
            }
            if (googleClientId != null && !googleClientId.isBlank() && !googleClientId.equals(tokenInfo.aud())) {
                throw new BadRequestException("Token audience does not match client ID.");
            }
            if (!"true".equalsIgnoreCase(tokenInfo.emailVerified())) {
                throw new BadRequestException("Google email is not verified.");
            }
            return tokenInfo;
        } catch (Exception ex) {
            throw new BadRequestException("Google token verification failed: " + ex.getMessage());
        }
    }

    @Transactional
    public void changePassword(PasswordChangeRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new NotFoundException("Admin user not found."));
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect.");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }
}
