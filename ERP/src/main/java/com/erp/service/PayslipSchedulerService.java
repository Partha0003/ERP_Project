package com.erp.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.erp.dto.SalaryGenerateResultDto;

import java.time.LocalDate;

@Service
public class PayslipSchedulerService {

    private final SalaryService salaryService;
    private static final Logger log = LoggerFactory.getLogger(PayslipSchedulerService.class);

    public PayslipSchedulerService(SalaryService salaryService) {
        this.salaryService = salaryService;
    }

    @Scheduled(cron = "0 0 0 1 * ?", zone = "Asia/Kolkata")
    public void generateMonthlySalaries() {
        LocalDate currentMonth = LocalDate.now().withDayOfMonth(1);
        SalaryGenerateResultDto result = salaryService.generateMonthlySalary(currentMonth);
        log.info("Scheduled salary generation for {}: {}", currentMonth, result.getMessage());
        if (!result.getWarnings().isEmpty()) {
            log.warn("Salary generation warnings: {}", result.getWarnings());
        }
    }
}
