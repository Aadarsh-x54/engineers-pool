package com.engineerspool.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PasswordStrengthValidatorTest {

    private PasswordStrengthValidator validator;

    @BeforeEach
    void setUp() {
        validator = new PasswordStrengthValidator();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "P@ssw0rd1",
            "Strong@123",
            "Valid!999",
            "Upper_Lower1!",
            "Admin$2026"
    })
    void testValidPasswords(String password) {
        assertTrue(validator.isValid(password, null), "Password should be valid: " + password);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "short1!",        // too short (< 8 chars)
            "Short12",        // no special character
            "short@99",       // no uppercase
            "SHORT@99",       // no lowercase
            "ShortUpper!",    // no digit
            "12345678!",      // no letters
            "abcDEFghi",      // no digit or special
            "",               // empty
    })
    void testInvalidPasswords(String password) {
        assertFalse(validator.isValid(password, null), "Password should be invalid: " + password);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "null"
    })
    void testNullPassword() {
        assertFalse(validator.isValid(null, null), "Null password should be invalid");
    }
}
