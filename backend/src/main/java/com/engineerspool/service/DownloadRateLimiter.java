package com.engineerspool.service;

import com.engineerspool.exception.RateLimitException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class DownloadRateLimiter {

    private final int downloadsPerMinute;
    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    public DownloadRateLimiter(@Value("${app.rate-limit.downloads-per-minute}") int downloadsPerMinute) {
        this.downloadsPerMinute = downloadsPerMinute;
    }

    public void check(String key) {
        Instant now = Instant.now();
        Window window = windows.compute(key, (ignored, existing) -> {
            if (existing == null || now.isAfter(existing.resetAt)) {
                return new Window(new AtomicInteger(1), now.plus(1, ChronoUnit.MINUTES));
            }
            existing.count.incrementAndGet();
            return existing;
        });
        if (window.count.get() > downloadsPerMinute) {
            throw new RateLimitException("Too many downloads. Please wait a minute and try again.");
        }
    }

    private record Window(AtomicInteger count, Instant resetAt) {
    }
}
