package com.aiengineeringcopilot.service;

import com.aiengineeringcopilot.dto.DocumentResponse;
import com.aiengineeringcopilot.entity.Document;
import com.aiengineeringcopilot.entity.DocumentStatus;
import com.aiengineeringcopilot.repository.DocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@Service
public class DocumentService {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf"
    );

    private final DocumentRepository documentRepository;
    private final FileStorageService fileStorageService;

    public DocumentService(
            DocumentRepository documentRepository,
            FileStorageService fileStorageService
    ) {
        this.documentRepository = documentRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getAllDocuments() {
        return documentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public DocumentResponse getDocumentById(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Document not found"
                ));

        return toResponse(document);
    }

    @Transactional
    public DocumentResponse uploadDocument(MultipartFile file) {

        validate(file);

        String storagePath = fileStorageService.store(file);

        try {
            Document document = new Document();

            document.setName(file.getOriginalFilename());
            document.setContentType(file.getContentType());
            document.setSize(file.getSize());
            document.setStoragePath(storagePath);
            document.setStatus(DocumentStatus.READY);

            Document savedDocument =
                    documentRepository.save(document);

            return toResponse(savedDocument);

        } catch (RuntimeException exception) {
            fileStorageService.delete(storagePath);
            throw exception;
        }
    }

    private void validate(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Please select a document to upload"
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "Document size must not exceed 10 MB"
            );
        }

        String contentType = file.getContentType();

        if (contentType == null ||
                !ALLOWED_CONTENT_TYPES.contains(contentType)) {

            throw new IllegalArgumentException(
                    "Only PDF documents are supported"
            );
        }
    }

    public void deleteDocument(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Document not found"
                ));

        String storagePath = document.getStoragePath();

        documentRepository.delete(document);

        if (storagePath != null && !storagePath.isBlank()) {
            fileStorageService.delete(storagePath);
        }
    }

    private DocumentResponse toResponse(Document document) {
        return new DocumentResponse(
                document.getId(),
                document.getName(),
                document.getContentType(),
                document.getSize(),
                document.getStatus(),
                document.getCreatedAt(),
                document.getUpdatedAt()
        );
    }
}