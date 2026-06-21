package com.erp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayslipRecordDto {
    private Long id;
    private Long salaryId;
    private String employeeName;
    private String department;
    private String month;
    private int year;
    private double netSalary;
    private String status;
    private String downloadUrl;
}
