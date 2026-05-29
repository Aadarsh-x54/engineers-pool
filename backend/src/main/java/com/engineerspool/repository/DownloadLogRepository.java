package com.engineerspool.repository;

import com.engineerspool.entity.DownloadLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DownloadLogRepository extends JpaRepository<DownloadLog, UUID> {
}
