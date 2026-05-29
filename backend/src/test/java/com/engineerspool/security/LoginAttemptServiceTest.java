package com.engineerspool.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LoginAttemptServiceTest {

    private LoginAttemptService loginAttemptService;
    private static final String IP_ADDRESS = "192.168.1.100";

    @BeforeEach
    void setUp() {
        loginAttemptService = new LoginAttemptService();
    }

    @Test
    void testNotBlockedInitially() {
        assertFalse(loginAttemptService.isBlocked(IP_ADDRESS), "IP should not be blocked initially");
    }

    @Test
    void testBlockedAfterFiveFailedAttempts() {
        // First 4 failed attempts - should not be blocked
        for (int i = 0; i < 4; i++) {
            loginAttemptService.loginFailed(IP_ADDRESS);
            assertFalse(loginAttemptService.isBlocked(IP_ADDRESS), "IP should not be blocked after " + (i + 1) + " failures");
        }

        // 5th failed attempt - should be blocked
        loginAttemptService.loginFailed(IP_ADDRESS);
        assertTrue(loginAttemptService.isBlocked(IP_ADDRESS), "IP should be blocked after 5 failed attempts");
    }

    @Test
    void testResetAfterSuccess() {
        // Fail 4 times
        for (int i = 0; i < 4; i++) {
            loginAttemptService.loginFailed(IP_ADDRESS);
        }

        // Succeeded - should reset count
        loginAttemptService.loginSucceeded(IP_ADDRESS);

        // Fail 2 more times - should still be false
        loginAttemptService.loginFailed(IP_ADDRESS);
        loginAttemptService.loginFailed(IP_ADDRESS);
        assertFalse(loginAttemptService.isBlocked(IP_ADDRESS), "IP should not be blocked since counter was reset");

        // Fail 3 more times (total 5 after reset) - should lock now
        loginAttemptService.loginFailed(IP_ADDRESS);
        loginAttemptService.loginFailed(IP_ADDRESS);
        loginAttemptService.loginFailed(IP_ADDRESS);
        assertTrue(loginAttemptService.isBlocked(IP_ADDRESS), "IP should be blocked after 5 failures post-reset");
    }
}
