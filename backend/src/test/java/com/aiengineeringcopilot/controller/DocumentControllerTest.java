package com.aiengineeringcopilot.controller;

import com.aiengineeringcopilot.dto.DocumentResponse;
import com.aiengineeringcopilot.entity.DocumentStatus;
import com.aiengineeringcopilot.service.DocumentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.mock.web.MockMultipartFile;

import static org.mockito.ArgumentMatchers.any;

@WebMvcTest(DocumentController.class)
class DocumentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DocumentService documentService;

    @Test
    void shouldReturnDocuments() throws Exception {

        DocumentResponse document = new DocumentResponse(
                1L,
                "Architecture.pdf",
                "application/pdf",
                2457600L,
                DocumentStatus.READY,
                Instant.parse("2026-09-07T10:00:00Z"),
                Instant.parse("2026-09-07T10:00:00Z")
        );

        given(documentService.getAllDocuments())
                .willReturn(List.of(document));

        mockMvc.perform(get("/api/documents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Architecture.pdf"))
                .andExpect(jsonPath("$[0].contentType").value("application/pdf"))
                .andExpect(jsonPath("$[0].status").value("READY"));
    }

    @Test
    void shouldReturnEmptyListWhenNoDocumentsExist() throws Exception {

        given(documentService.getAllDocuments())
                .willReturn(List.of());

        mockMvc.perform(get("/api/documents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void shouldUploadDocument() throws Exception {

        DocumentResponse response = new DocumentResponse(
                1L,
                "Architecture.pdf",
                "application/pdf",
                2457600L,
                DocumentStatus.READY,
                Instant.parse("2026-09-08T00:00:00Z"),
                Instant.parse("2026-09-08T00:00:00Z")
        );

        given(documentService.uploadDocument(any()))
                .willReturn(response);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "Architecture.pdf",
                "application/pdf",
                "test content".getBytes()
        );

        mockMvc.perform(
                        multipart("/api/documents")
                                .file(file)
                )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name")
                        .value("Architecture.pdf"))
                .andExpect(jsonPath("$.contentType")
                        .value("application/pdf"))
                .andExpect(jsonPath("$.status")
                        .value("READY"));
    }

    @Test
    void shouldGetDocumentById() throws Exception {
        DocumentResponse response = new DocumentResponse(
                2L,
                "Architecture.pdf",
                "application/pdf",
                2457600L,
                DocumentStatus.READY,
                Instant.parse("2026-09-08T00:48:13.753067Z"),
                Instant.parse("2026-09-08T00:48:13.753067Z")
        );

        when(documentService.getDocumentById(2L))
                .thenReturn(response);

        mockMvc.perform(get("/api/documents/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.name").value("Architecture.pdf"))
                .andExpect(jsonPath("$.contentType")
                        .value("application/pdf"))
                .andExpect(jsonPath("$.size").value(2457600))
                .andExpect(jsonPath("$.status").value("READY"));
    }

    @Test
    void shouldReturn404WhenDocumentDoesNotExist() throws Exception {
        when(documentService.getDocumentById(999L))
                .thenThrow(new IllegalArgumentException("Document not found"));

        mockMvc.perform(get("/api/documents/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message")
                        .value("Document not found"));
    }

    @Test
    void shouldDeleteDocument() throws Exception {
        doNothing()
                .when(documentService)
                .deleteDocument(2L);

        mockMvc.perform(delete("/api/documents/2"))
                .andExpect(status().isNoContent());

        verify(documentService)
                .deleteDocument(2L);
    }

    @Test
    void shouldReturn404WhenDeletingMissingDocument() throws Exception {
        doThrow(new IllegalArgumentException("Document not found"))
                .when(documentService)
                .deleteDocument(99999L);

        mockMvc.perform(delete("/api/documents/99999"))
                .andExpect(status().isNotFound());
    }
}