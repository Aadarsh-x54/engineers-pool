package com.engineerspool;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.util.Map;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("local")
class LocalProfileStartupTest {

    private static final String FRONTEND_ORIGIN =
            "https://engineers-pool-frontend-1315932840.netlify.app";

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private MockMvc mockMvc;

    @DynamicPropertySource
    static void useInMemoryDatabaseForTest(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url",
                () -> "jdbc:h2:mem:local-profile-test;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1");
        registry.add("app.cors.allowed-origins", () -> FRONTEND_ORIGIN);
    }

    @Test
    void startsWithLocalProfileAndReportsHealthy() throws Exception {
        ResponseEntity<Map> response = restTemplate.getForEntity("/actuator/health", Map.class);
        ResponseEntity<List> semesters = restTemplate.getForEntity("/api/notes/rgpv/semesters", List.class);
        ResponseEntity<List> branches = restTemplate.getForEntity("/api/notes/rgpv/semesters/1/branches", List.class);
        ResponseEntity<List> categories = restTemplate.getForEntity("/api/notes/programming", List.class);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("UP", response.getBody().get("status"));
        assertEquals(8, semesters.getBody().size());
        assertEquals(32, branches.getBody().size());
        assertEquals(14, categories.getBody().size());
        mockMvc.perform(options("/api/notes/popular")
                        .header("Origin", FRONTEND_ORIGIN)
                        .header("Access-Control-Request-Method", "GET")
                        .header("Access-Control-Request-Headers", "content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", FRONTEND_ORIGIN));
    }
}
