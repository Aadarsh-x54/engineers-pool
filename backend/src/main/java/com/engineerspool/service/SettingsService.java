package com.engineerspool.service;

import com.engineerspool.dto.SettingResponse;
import com.engineerspool.entity.AppSetting;
import com.engineerspool.repository.AppSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SettingsService {

    public static final String WHATSAPP_NUMBER = "whatsapp_number";

    private final AppSettingRepository appSettingRepository;

    @Transactional(readOnly = true)
    public SettingResponse getWhatsappNumber() {
        String value = appSettingRepository.findById(WHATSAPP_NUMBER)
                .map(AppSetting::getValue)
                .orElse("+910000000000");
        return new SettingResponse(WHATSAPP_NUMBER, value);
    }

    @Transactional
    public SettingResponse updateWhatsappNumber(String value) {
        AppSetting setting = appSettingRepository.findById(WHATSAPP_NUMBER)
                .orElseGet(() -> AppSetting.builder().key(WHATSAPP_NUMBER).value(value).build());
        setting.setValue(value);
        AppSetting saved = appSettingRepository.save(setting);
        return new SettingResponse(saved.getKey(), saved.getValue());
    }
}
