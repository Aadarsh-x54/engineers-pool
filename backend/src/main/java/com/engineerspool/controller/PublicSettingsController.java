package com.engineerspool.controller;

import com.engineerspool.dto.SettingResponse;
import com.engineerspool.service.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/settings")
public class PublicSettingsController {

    private final SettingsService settingsService;

    @GetMapping("/whatsapp")
    public SettingResponse whatsapp() {
        return settingsService.getWhatsappNumber();
    }
}
