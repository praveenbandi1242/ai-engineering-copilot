package com.aiengineeringcopilot.service;

import com.aiengineeringcopilot.dto.DocumentResponse;
import com.aiengineeringcopilot.entity.Document;
import com.aiengineeringcopilot.entity.DocumentStatus;
import com.aiengineeringcopilot.repository.DocumentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private DocumentService documentService;

    @Test
    void shouldUploadPdfDocument() {

        MultipartFile file = new MockMultipartFile(
                "file",
                "Architecture.pdf",
                "application/pdf",
                "test content".getBytes()
        );

        Document savedDocument = new Document();
        savedDocument.setId(1L);
        savedDocument.setName("Architecture.pdf");
        savedDocument.setContentType("application/pdf");
        savedDocument.setSize(file.getSize());
        savedDocument.setStoragePath("stored-file.pdf");
        savedDocument.setStatus(DocumentStatus.READY);

        Instant now = Instant.now();

        savedDocument.setCreatedAt(now);
        savedDocument.setUpdatedAt(now);

        when(fileStorageService.store(file))
                .thenReturn("stored-file.pdf");

        when(documentRepository.save(any(Document.class)))
                .thenReturn(savedDocument);

        DocumentResponse response =
                documentService.uploadDocument(file);

        assertEquals(1L, response.id());
        assertEquals("Architecture.pdf", response.name());
        assertEquals("application/pdf", response.contentType());
        assertEquals(DocumentStatus.READY, response.status());

        verify(fileStorageService).store(file);
        verify(documentRepository).save(any(Document.class));
    }

    @Test
    void shouldRejectEmptyFile() {

        MultipartFile file = new MockMultipartFile(
                "file",
                "Architecture.pdf",
                "application/pdf",
                new byte[0]
        );

        assertThrows(
                IllegalArgumentException.class,
                () -> documentService.uploadDocument(file)
        );

        verifyNoInteractions(fileStorageService);
        verifyNoInteractions(documentRepository);
    }

    @Test
    void shouldRejectUnsupportedFileType() {

        MultipartFile file = new MockMultipartFile(
                "file",
                "notes.txt",
                "text/plain",
                "test".getBytes()
        );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> documentService.uploadDocument(file)
                );

        assertEquals(
                "Only PDF documents are supported",
                exception.getMessage()
        );

        verifyNoInteractions(fileStorageService);
        verifyNoInteractions(documentRepository);
    }

    @Test
    void shouldRejectFilesLargerThan10Mb() {

        byte[] content = new byte[11 * 1024 * 1024];

        MultipartFile file = new MockMultipartFile(
                "file",
                "large.pdf",
                "application/pdf",
                content
        );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> documentService.uploadDocument(file)
                );

        assertEquals(
                "Document size must not exceed 10 MB",
                exception.getMessage()
        );

        verifyNoInteractions(fileStorageService);
        verifyNoInteractions(documentRepository);
    }

    @Test
    void shouldDeleteStoredFileWhenDatabaseSaveFails() {

        MultipartFile file = new MockMultipartFile(
                "file",
                "Architecture.pdf",
                "application/pdf",
                "test content".getBytes()
        );

        when(fileStorageService.store(file))
                .thenReturn("stored-file.pdf");

        when(documentRepository.save(any(Document.class)))
                .thenThrow(new RuntimeException("Database failure"));

        assertThrows(
                RuntimeException.class,
                () -> documentService.uploadDocument(file)
        );

        verify(fileStorageService).store(file);
        verify(fileStorageService).delete("stored-file.pdf");
    }

    @Test
    void shouldGetDocumentById() {
        Document document = new Document();

        document.setId(1L);
        document.setName("Architecture.pdf");
        document.setContentType("application/pdf");
        document.setSize(2457600L);
        document.setStoragePath("documents/test.pdf");
        document.setStatus(DocumentStatus.READY);

        when(documentRepository.findById(1L))
                .thenReturn(Optional.of(document));

        DocumentResponse response = documentService.getDocumentById(1L);

        assertEquals(1L, response.id());
        assertEquals("Architecture.pdf", response.name());
        assertEquals("application/pdf", response.contentType());
        assertEquals(2457600L, response.size());
        assertEquals(DocumentStatus.READY, response.status());

        verify(documentRepository).findById(1L);
    }

    @Test
    void shouldRejectUnknownDocumentId() {
        when(documentRepository.findById(999L))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> documentService.getDocumentById(999L)
        );

        assertEquals("Document not found", exception.getMessage());

        verify(documentRepository).findById(999L);
    }

    @Test
    void shouldDeleteDocument() {
        Document document = new Document();

        document.setId(2L);
        document.setName("Architecture.pdf");
        document.setStoragePath(
                "./data/documents/architecture-test.pdf"
        );

        when(documentRepository.findById(2L))
                .thenReturn(Optional.of(document));

        documentService.deleteDocument(2L);

        verify(documentRepository).delete(document);
        verify(fileStorageService).delete(
                "./data/documents/architecture-test.pdf"
        );
    }

    @Test
    void shouldRejectDeleteWhenDocumentDoesNotExist() {
        when(documentRepository.findById(99999L))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> documentService.deleteDocument(99999L)
                );

        assertEquals("Document not found", exception.getMessage());

        verify(documentRepository, never())
                .delete(any(Document.class));

        verify(fileStorageService, never())
                .delete(anyString());
    }
}