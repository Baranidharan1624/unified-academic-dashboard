package com.campusone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgramDTO {
    private Long id;
    private String programName;
    private String programCode;
    private String description;
    private Integer durationYears;
    private String degreeType;
    private Long departmentId;
    private String departmentName;
}
