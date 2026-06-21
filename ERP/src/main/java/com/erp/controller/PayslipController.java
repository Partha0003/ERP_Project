package com.erp.controller;

import java.security.Principal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.erp.Utility.PdfGeneratorUtil;
import com.erp.dto.MyPayslipDto;
import com.erp.dto.PayslipLogDto;
import com.erp.dto.PayslipRecordDto;
import com.erp.dto.SalaryPayslipDto;
import com.erp.service.EmailService;
import com.erp.service.PayslipService;
import com.erp.service.SalaryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payslip")
@RequiredArgsConstructor
public class PayslipController {

    private final SalaryService salaryService;
    private final EmailService emailService;
    private final PayslipService payslipService;

    @GetMapping("/records")
    @PreAuthorize("hasAnyRole('HR', 'FINANCE', 'ADMIN')")
    public ResponseEntity<List<PayslipRecordDto>> getPayslipRecords(
            @RequestParam("month") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate month,
            @RequestParam(value = "employeeName", required = false) String employeeName) {
        return ResponseEntity.ok(payslipService.getPayslipRecordsForMonth(month, employeeName));
    }

    @GetMapping("/payslip/{id}")
    @PreAuthorize("hasAnyRole('HR', 'FINANCE')")
    public ResponseEntity<SalaryPayslipDto> getSalaryPreview(@PathVariable Long id) {
        return ResponseEntity.ok(payslipService.getSalaryPreviewById(id));
    }

    @GetMapping("/payslip/{id}/download")
    @PreAuthorize("hasAnyRole('HR', 'FINANCE', 'ADMIN')")
    public ResponseEntity<byte[]> downloadPayslipPdf(@PathVariable Long id) {
        byte[] pdf = payslipService.getPayslipPdfById(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Payslip_" + id + ".pdf");
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

    @PostMapping("/payslip/{id}/email")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<String> emailPayslip(@PathVariable Long id) {
        try {
            SalaryPayslipDto dto = payslipService.getSalaryPreviewById(id);
            byte[] pdf = PdfGeneratorUtil.generatePayslipPdf(dto);
            String email = salaryService.getEmployeeEmailBySalaryId(id);
            emailService.sendPayslip(email, pdf, dto.getEmployeeName());
            return ResponseEntity.ok("Payslip emailed to " + email);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/payslip/filter")
    @PreAuthorize("hasAnyRole('HR', 'FINANCE')")
    public ResponseEntity<List<SalaryPayslipDto>> filterPayslips(
            @RequestParam("month") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate month,
            @RequestParam(value = "status", required = false) Boolean isPaid,
            @RequestParam(value = "employeeName", required = false) String employeeName) {
        return ResponseEntity.ok(payslipService.filterPayslips(month, isPaid, employeeName));
    }

    @GetMapping("/payslip/{id}/download/self")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR', 'ADMIN', 'FINANCE')")
    public ResponseEntity<byte[]> downloadPayslip(
            @PathVariable Long id,
            Principal principal) {
        byte[] pdfBytes = payslipService.getPayslipPdf(id, principal.getName());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.builder("attachment")
                .filename("Payslip_" + id + ".pdf").build());

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    @GetMapping("/my-salary")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<MyPayslipDto>> getMyPayslips(Principal principal) {
        return ResponseEntity.ok(salaryService.getMyPayslips(principal.getName()));
    }

    @GetMapping("/logs/payslip/{payslipId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<List<PayslipLogDto>> getLogsForPayslip(@PathVariable Long payslipId) {
        List<PayslipLogDto> logs = salaryService.getLogsByPayslipId(payslipId);
        if (logs.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
        }
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/logs/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<List<PayslipLogDto>> getLogsForEmployee(@PathVariable Long employeeId) {
        List<PayslipLogDto> logs = salaryService.getLogsByEmployee(employeeId);
        if (logs.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
        }
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/logs/payslip/{payslipId}/filter")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<List<PayslipLogDto>> getFilteredLogsForPayslip(
            @PathVariable Long payslipId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String actionType) {
        return ResponseEntity.ok(salaryService.getFilteredLogs(payslipId, month, year, actionType));
    }
}
