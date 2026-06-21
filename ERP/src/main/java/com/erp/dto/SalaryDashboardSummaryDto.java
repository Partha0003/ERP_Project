package com.erp.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SalaryDashboardSummaryDto {

    private Double totalPayout;
    private Long pendingPayslipsCount;
    private Long forwardedPayslipsCount;
    private Long paidCount;
}
