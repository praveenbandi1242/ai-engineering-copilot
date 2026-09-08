package com.aiengineeringcopilot.dto;

import com.aiengineeringcopilot.entity.DocumentStatus;

import java.time.Instant;

public record DocumentResponse(
        Long id,
        String name,
        String contentType,
        Long size,
        DocumentStatus status,
        Instant createdAt,
        Instant updatedAt
) {
}