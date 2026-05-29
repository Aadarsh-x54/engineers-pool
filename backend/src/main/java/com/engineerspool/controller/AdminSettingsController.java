package com.engineerspool.controller;

import com.engineerspool.dto.SettingRequest;
import com.engineerspool.dto.SettingResponse;
import com.engineerspool.service.SettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/settings")
public class AdminSettingsController {

    private final SettingsService settingsService;

    @PutMapping("/whatsapp")
    public SettingResponse updateWhatsapp(@Valid @RequestBody SettingRequest request) {
        return settingsService.updateWhatsappNumber(request.value());
    }
}
