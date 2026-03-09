package com.campusone.controller;

import com.campusone.service.BulkImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/import")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminBulkImportController {

    private final BulkImportService bulkImportService;

    @PostMapping("/users")
    public ResponseEntity<Map<String, Object>> importUsers(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userType") String userType) {
        
        try {
            BulkImportService.BulkImportResult result = bulkImportService.importUsers(file, userType);
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalRecords", result.getTotalRecords());
            response.put("successfulImports", result.getSuccessfulImports());
            response.put("failedRecords", result.getFailedRecords());
            
            List<Map<String, Object>> errors = result.getFailedRecordsList().stream()
                .map(error -> {
                    Map<String, Object> errorMap = new HashMap<>();
                    errorMap.put("row", error.getRowNumber());
                    errorMap.put("email", error.getEmail());
                    errorMap.put("error", error.getErrorMessage());
                    return errorMap;
                })
                .toList();
            
            response.put("errors", errors);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to process file: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}

