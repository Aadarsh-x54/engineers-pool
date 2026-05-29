package com.engineerspool.security;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPT = 5;
    private static final int LOCK_TIME_MINUTES = 15;
    
    private final Map<String, Attempt> attempts = new ConcurrentHashMap<>();

    public void loginSucceeded(String key) {
        attempts.remove(key);
    }

    public void loginFailed(String key) {
        Instant now = Instant.now();
        attempts.compute(key, (ignored, existing) -> {
            if (existing == null) {
                return new Attempt(1, Instant.MIN);
            }
            if (!existing.lockUntil.equals(Instant.MIN) && now.isAfter(existing.lockUntil)) {
                return new Attempt(1, Instant.MIN);
            }
            int newCount = existing.count + 1;
            Instant lockUntil = existing.lockUntil;
            if (newCount >= MAX_ATTEMPT) {
                lockUntil = now.plus(LOCK_TIME_MINUTES, ChronoUnit.MINUTES);
            }
            return new Attempt(newCount, lockUntil);
        });
    }

    public boolean isBlocked(String key) {
        Attempt attempt = attempts.get(key);
        if (attempt == null) {
            return false;
        }
        Instant now = Instant.now();
        if (now.isBefore(attempt.lockUntil)) {
            return true;
        }
        if (now.isAfter(attempt.lockUntil) && !attempt.lockUntil.equals(Instant.MIN)) {
            attempts.remove(key);
        }
        return false;
    }

    private record Attempt(int count, Instant lockUntil) {}
}
