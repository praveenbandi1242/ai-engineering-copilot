package com.aiengineeringcopilot.repository;

import com.aiengineeringcopilot.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<Document, Long> {
}