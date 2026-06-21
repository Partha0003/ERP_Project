package com.erp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalaryGenerateResultDto {
    private int generatedCount;
    private int skippedCount;
    private List<String> warnings = new ArrayList<>();
    private String message;
}
