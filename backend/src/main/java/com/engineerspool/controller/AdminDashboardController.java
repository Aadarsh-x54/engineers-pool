package com.engineerspool.controller;

import com.engineerspool.dto.DashboardStatsResponse;
import com.engineerspool.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public DashboardStatsResponse dashboard() {
        return dashboardService.stats();
    }
}
