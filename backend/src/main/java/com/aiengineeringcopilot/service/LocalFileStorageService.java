package com.aiengineeringcopilot.service;

import com.aiengineeringcopilot.config.StorageProperties;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class LocalFileStorageService implements FileStorageService {

    private final Path storageDirectory;

    public LocalFileStorageService(StorageProperties properties) {
        this.storageDirectory = Paths.get(properties.location())
                .toAbsolutePath()
                .normalize();

        try {
            Files.createDirectories(storageDirectory);
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Unable to initialize document storage",
                    exception
            );
        }
    }

    @Override
    public String store(MultipartFile file) {
        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() == null
                        ? "document"
                        : file.getOriginalFilename()
        );

        String extension = "";

        int extensionIndex = originalFilename.lastIndexOf('.');

        if (extensionIndex >= 0) {
            extension = originalFilename.substring(extensionIndex);
        }

        String storedFilename = UUID.randomUUID() + extension;

        Path destination = storageDirectory
                .resolve(storedFilename)
                .normalize();

        if (!destination.startsWith(storageDirectory)) {
            throw new IllegalStateException("Invalid storage path");
        }

        try {
            Files.copy(
                    file.getInputStream(),
                    destination
            );

            return storedFilename;

        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Unable to store document",
                    exception
            );
        }
    }

    @Override
    public void delete(String storagePath) {
        if (storagePath == null || storagePath.isBlank()) {
            return;
        }

        Path file = storageDirectory
                .resolve(storagePath)
                .normalize();

        if (!file.startsWith(storageDirectory)) {
            return;
        }

        try {
            Files.deleteIfExists(file);
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Unable to delete stored document",
                    exception
            );
        }
    }
}