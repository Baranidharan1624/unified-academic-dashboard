package com.campusone.repository;

import com.campusone.model.FileCategory;
import com.campusone.model.FileMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileRepository extends JpaRepository<FileMetadata, Long> {
    List<FileMetadata> findByUploadedBy_Id(Long userId);

    default List<FileMetadata> findByUploadedById(Long userId) {
        return findByUploadedBy_Id(userId);
    }
    
    List<FileMetadata> findByCategory(FileCategory category);
}
