package com.engineerspool;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.util.Map;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("local")
class LocalProfileStartupTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @DynamicPropertySource
    static void useInMemoryDatabaseForTest(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url",
                () -> "jdbc:h2:mem:local-profile-test;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1");
    }

    @Test
    void startsWithLocalProfileAndReportsHealthy() {
        ResponseEntity<Map> response = restTemplate.getForEntity("/actuator/health", Map.class);
        ResponseEntity<List> semesters = restTemplate.getForEntity("/api/notes/rgpv/semesters", List.class);
        ResponseEntity<List> branches = restTemplate.getForEntity("/api/notes/rgpv/semesters/1/branches", List.class);
        ResponseEntity<List> categories = restTemplate.getForEntity("/api/notes/programming", List.class);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("UP", response.getBody().get("status"));
        assertEquals(8, semesters.getBody().size());
        assertEquals(32, branches.getBody().size());
        assertEquals(14, categories.getBody().size());
    }
}
