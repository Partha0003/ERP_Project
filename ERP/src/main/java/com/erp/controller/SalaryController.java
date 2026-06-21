package com.erp.controller;

import com.erp.dto.*;
import com.erp.entity.Salary;
import com.erp.service.*;

import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/salary")
@RequiredArgsConstructor
public class SalaryController {

    private final SalaryService salaryService;
    private final PayslipService payslipService;

    @PostMapping("/generate")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<SalaryGenerateResultDto> generateSalary(
            @RequestParam("month") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate month) {
        SalaryGenerateResultDto result = salaryService.generateMonthlySalary(month);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('HR', 'FINANCE', 'ADMIN')")
    public ResponseEntity<List<SalaryPayslipDto>> getAllSalaries(
            @RequestParam("month") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate month,
            @RequestParam(value = "employeeName", required = false) String employeeName) {
        return ResponseEntity.ok(salaryService.getAllSalariesForMonth(month, employeeName));
    }

    @GetMapping("/forwarded")
    @PreAuthorize("hasAnyRole('FINANCE', 'ADMIN')")
    public ResponseEntity<List<SalaryPayslipDto>> getForwardedSalaries(
            @RequestParam("month") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate month,
            @RequestParam(value = "employeeName", required = false) String employeeName) {
        return ResponseEntity.ok(salaryService.getForwardedSalaries(month, employeeName));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<String> approveSalary(@PathVariable Long id) {
        salaryService.approveSalary(id);
        return ResponseEntity.ok("Salary approved successfully");
    }

    @PutMapping("/{id}/forward")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<String> forwardSalary(@PathVariable Long id) {
        salaryService.forwardSalaryToFinance(id);
        return ResponseEntity.ok("Salary forwarded to Finance successfully");
    }

    @PutMapping("/{id}/mark-paid")
    @PreAuthorize("hasRole('FINANCE')")
    public ResponseEntity<String> markSalaryAsPaid(@PathVariable Long id) {
        salaryService.markAsPaid(id);
        return ResponseEntity.ok("Salary marked as paid");
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('HR', 'FINANCE')")
    public ResponseEntity<Map<String, Long>> getSummary(
            @RequestParam("month") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate month) {
        return ResponseEntity.ok(salaryService.getSalarySummary(month));
    }

    @GetMapping("/salary/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE', 'HR')")
    public ResponseEntity<SalaryDashboardSummaryDto> getSalaryDashboardSummary(
            @RequestParam("month") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate month) {
        return ResponseEntity.ok(salaryService.getSalaryDashboardSummary(month));
    }

    @GetMapping("/{id}/download-preview")
    @PreAuthorize("hasAnyRole('HR', 'FINANCE', 'ADMIN')")
    public ResponseEntity<byte[]> downloadSalaryPreview(@PathVariable Long id) {
        SalaryPayslipDto dto = salaryService.getSalaryPreview(id);
        byte[] pdf = com.erp.Utility.PdfGeneratorUtil.generatePayslipPdf(dto);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "SalaryPreview_" + dto.getEmployeeName() + ".pdf");
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

    @GetMapping("/employee/{employeeId}/history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Salary>> getSalaryHistoryByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(salaryService.getSalaryHistoryByEmployeeId(employeeId));
    }

    @PutMapping("/regenerate/{id}")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<String> regenerateSalary(@PathVariable Long id) {
        salaryService.regenerateSalaryEntry(id);
        return ResponseEntity.ok("Salary entry regenerated successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteSalaryEntry(@PathVariable Long id) {
        salaryService.deleteSalary(id);
        return ResponseEntity.ok("Salary entry deleted successfully");
    }

    @GetMapping("/status-count")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'FINANCE')")
    public ResponseEntity<Map<String, Long>> getSalaryStatusCount(
            @RequestParam("month") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate month) {
        return ResponseEntity.ok(salaryService.getSalaryStatusCounts(month));
    }
}
