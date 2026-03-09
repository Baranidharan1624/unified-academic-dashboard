package com.campusone.service;

import com.campusone.dto.FileDTO;
import com.campusone.exception.ResourceNotFoundException;
import com.campusone.model.FileCategory;
import com.campusone.model.FileMetadata;
import com.campusone.model.User;
import com.campusone.repository.FileRepository;
import com.campusone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FileService {

    private final FileRepository fileRepository;
    private final UserRepository userRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Value("${file.max-size:10485760}")
    private long maxFileSize;

    private static final List<String> ALLOWED_TYPES = List.of(
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "application/zip"
    );

    private static final List<String> ALLOWED_EXTENSIONS = List.of(
        "pdf", "docx", "jpg", "jpeg", "png", "zip"
    );

    @Transactional
    public FileDTO uploadFile(MultipartFile file, String fileCategory, Long userId) {
        // Validate file
        validateFile(file);

        // Get user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Determine category
        FileCategory category = FileCategory.valueOf(fileCategory.toUpperCase());

        // Create upload directory
        String subDir = getSubDirectory(category);
        Path uploadPath = Paths.get(uploadDir, subDir);
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID().toString() + "." + extension;
        Path filePath = uploadPath.resolve(uniqueFilename);

        // Copy file
        try {
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Could not save file", e);
        }

        // Save metadata
        FileMetadata metadata = FileMetadata.builder()
            .fileName(uniqueFilename)
            .originalFileName(originalFilename)
            .filePath(filePath.toString())
            .fileSize(file.getSize())
            .contentType(file.getContentType())
            .category(category)
            .uploadedBy(user)
            .build();

        FileMetadata saved = fileRepository.save(metadata);
        return mapToDTO(saved);
    }

    public FileDTO getFileMetadata(Long fileId) {
        FileMetadata file = fileRepository.findById(fileId)
            .orElseThrow(() -> new ResourceNotFoundException("File not found with id: " + fileId));
        return mapToDTO(file);
    }

    public Resource downloadFile(Long fileId) {
        FileMetadata file = fileRepository.findById(fileId)
            .orElseThrow(() -> new ResourceNotFoundException("File not found with id: " + fileId));

        Path filePath = Paths.get(file.getFilePath());
        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found or not readable");
            }
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("Invalid file path");
        }
    }

    @Transactional
    public void deleteFile(Long fileId) {
        FileMetadata file = fileRepository.findById(fileId)
            .orElseThrow(() -> new ResourceNotFoundException("File not found with id: " + fileId));

        // Delete physical file
        try {
            Path filePath = Paths.get(file.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log but continue with database deletion
            e.printStackTrace();
        }

        // Delete metadata
        fileRepository.delete(file);
    }

    public List<FileDTO> getFilesByUser(Long userId) {
        return fileRepository.findByUploadedById(userId).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public List<FileDTO> getFilesByCategory(String category) {
        FileCategory cat = FileCategory.valueOf(category.toUpperCase());
        return fileRepository.findByCategory(cat).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("File size exceeds maximum limit of " + (maxFileSize / 1024 / 1024) + "MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("File type not allowed. Allowed types: " + ALLOWED_EXTENSIONS);
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null) {
            String extension = getFileExtension(originalFilename).toLowerCase();
            if (!ALLOWED_EXTENSIONS.contains(extension)) {
                throw new IllegalArgumentException("File extension not allowed. Allowed: " + ALLOWED_EXTENSIONS);
            }
        }
    }

    private String getSubDirectory(FileCategory category) {
        return switch (category) {
            case ASSIGNMENT -> "assignments";
            case PROFILE -> "profile";
            case REPORT -> "reports";
            case MATERIAL -> "materials";
            case OTHER -> "other";
        };
    }

    private String getFileExtension(String filename) {
        if (filename == null) return "";
        int lastDot = filename.lastIndexOf('.');
        return lastDot > 0 ? filename.substring(lastDot + 1) : "";
    }

    private FileDTO mapToDTO(FileMetadata file) {
        return FileDTO.builder()
            .id(file.getId())
            .fileName(file.getFileName())
            .originalFileName(file.getOriginalFileName())
            .filePath(file.getFilePath())
            .fileSize(file.getFileSize())
            .fileType(file.getContentType())
            .fileCategory(file.getCategory())
            .uploadedById(file.getUploadedBy().getId())
            .uploadedByName(file.getUploadedBy().getFullName())
            .createdAt(file.getUploadedAt())
            .build();
    }
}
