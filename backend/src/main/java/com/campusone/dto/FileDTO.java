package com.campusone.dto;

import com.campusone.model.FileCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileDTO {
    private Long id;
    private String fileName;
    private String originalFileName;
    private String contentType;
    private String fileType;
    private Long fileSize;
    private String filePath;
    private FileCategory fileCategory;
    private Long uploadedById;
    private String uploadedByName;
    private LocalDateTime uploadedAt;
    private LocalDateTime createdAt;
}
