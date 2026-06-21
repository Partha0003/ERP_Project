package com.erp.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.erp.dto.PayslipRecordDto;
import com.erp.dto.SalaryPayslipDto;
import com.erp.entity.Employee;
import com.erp.entity.Payslip;
import com.erp.entity.Salary;
import com.erp.exception.PayslipNotFoundException;
import com.erp.exception.SalaryNotFoundException;
import com.erp.repository.PayslipRepository;
import com.erp.repository.SalaryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PayslipService {

    private final PayslipRepository payslipRepository;
    private final SalaryRepository salaryRepository;
    private final PdfGeneratorService pdfGenerator;

    public byte[] getPayslipPdf(Long payslipId, String username) {
        Payslip payslip = payslipRepository.findById(payslipId)
                .orElseThrow(() -> new PayslipNotFoundException("Payslip not found with ID: " + payslipId));

        if (!payslip.getEmployee().getEmail().equals(username) && !hasPrivilegedAccess()) {
            throw new AccessDeniedException("Unauthorized access to payslip");
        }

        return pdfGenerator.generatePayslipPdf(payslip);
    }

    public byte[] getPayslipPdfById(Long payslipId) {
        Payslip payslip = payslipRepository.findById(payslipId)
                .orElseThrow(() -> new PayslipNotFoundException("Payslip not found with ID: " + payslipId));
        return pdfGenerator.generatePayslipPdf(payslip);
    }

    private boolean hasPrivilegedAccess() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return false;
        }
        return auth.getAuthorities().stream()
                .anyMatch(role -> {
                    String authority = role.getAuthority();
                    return authority.equals("ROLE_HR")
                            || authority.equals("ROLE_ADMIN")
                            || authority.equals("ROLE_FINANCE");
                });
    }

    public SalaryPayslipDto getSalaryPreviewById(Long id) {
        Salary salary = salaryRepository.findById(id)
                .orElseThrow(() -> new SalaryNotFoundException("Salary not found with ID: " + id));

        Employee emp = salary.getEmployee();
        String name = emp != null ? emp.getName() : salary.getEmployeeName();
        String dept = emp != null && emp.getDepartment() != null ? emp.getDepartment().getName() : salary.getDepartment();
        double net = salary.getTotalPayable() != null ? salary.getTotalPayable() : salary.getTotalEarnings();

        return SalaryPayslipDto.builder()
                .id(salary.getId())
                .employeeName(name)
                .department(dept)
                .month(salary.getMonth().format(DateTimeFormatter.ofPattern("MMMM yyyy")))
                .baseSalary(salary.getBaseSalary())
                .bonus(salary.getBonus() != null ? salary.getBonus() : 0.0)
                .tax(salary.getTax() != null ? salary.getTax() : 0.0)
                .deduction(salary.getDeduction() != null ? salary.getDeduction() : 0.0)
                .presentDays(salary.getPresentDays())
                .absentDays(salary.getAbsentDays())
                .leaveDays(salary.getLeaveDays())
                .totalEarnings(salary.getTotalEarnings())
                .netSalary(net)
                .approvedByHR(salary.isApprovedByHR())
                .forwardedToFinance(salary.isForwardedToFinance())
                .paid(salary.isPaid())
                .status(salary.getStatus())
                .build();
    }

    public List<PayslipRecordDto> getPayslipRecordsForMonth(LocalDate month, String employeeName) {
        LocalDate payrollMonth = month.withDayOfMonth(1);
        return payslipRepository.findByPayrollMonth(payrollMonth).stream()
                .filter(p -> employeeName == null || employeeName.isBlank()
                        || p.getEmployee().getName().toLowerCase().contains(employeeName.toLowerCase()))
                .sorted(Comparator.comparing(p -> p.getEmployee().getName()))
                .map(this::mapToRecordDto)
                .collect(Collectors.toList());
    }

    private PayslipRecordDto mapToRecordDto(Payslip payslip) {
        Employee emp = payslip.getEmployee();
        LocalDate payrollMonth = payslip.getPayrollMonth() != null
                ? payslip.getPayrollMonth()
                : payslip.getDateIssued();

        return PayslipRecordDto.builder()
                .id(payslip.getId())
                .salaryId(payslip.getSalary() != null ? payslip.getSalary().getId() : null)
                .employeeName(emp.getName())
                .department(emp.getDepartment() != null ? emp.getDepartment().getName() : "")
                .month(payrollMonth.format(DateTimeFormatter.ofPattern("MMMM yyyy")))
                .year(payrollMonth.getYear())
                .netSalary(payslip.getNetSalary())
                .status(payslip.getStatus())
                .downloadUrl("/api/payslip/payslip/" + payslip.getId() + "/download")
                .build();
    }

    public List<SalaryPayslipDto> filterPayslips(LocalDate month, Boolean isPaid, String employeeName) {
        LocalDate payrollMonth = month.withDayOfMonth(1);
        List<Salary> salaries = salaryRepository.findByMonth(payrollMonth);

        return salaries.stream()
                .filter(s -> isPaid == null || s.isPaid() == isPaid)
                .filter(s -> employeeName == null || employeeName.isBlank()
                        || s.getEmployeeName().toLowerCase().contains(employeeName.toLowerCase()))
                .map(this::mapSalaryToDto)
                .collect(Collectors.toList());
    }

    private SalaryPayslipDto mapSalaryToDto(Salary salary) {
        Employee emp = salary.getEmployee();
        double net = salary.getTotalPayable() != null ? salary.getTotalPayable() : salary.getTotalEarnings();

        return SalaryPayslipDto.builder()
                .id(salary.getId())
                .employeeName(salary.getEmployeeName())
                .employeeEmail(emp != null ? emp.getEmail() : "")
                .department(salary.getDepartment())
                .month(salary.getMonth().format(DateTimeFormatter.ofPattern("MMMM yyyy")))
                .baseSalary(salary.getBaseSalary() != null ? salary.getBaseSalary() : 0.0)
                .bonus(salary.getBonus() != null ? salary.getBonus() : 0.0)
                .tax(salary.getTax() != null ? salary.getTax() : 0.0)
                .deduction(salary.getDeduction() != null ? salary.getDeduction() : 0.0)
                .presentDays(salary.getPresentDays())
                .absentDays(salary.getAbsentDays())
                .leaveDays(salary.getLeaveDays())
                .totalEarnings(salary.getTotalEarnings())
                .netSalary(net)
                .approvedByHR(salary.isApprovedByHR())
                .forwardedToFinance(salary.isForwardedToFinance())
                .paid(salary.isPaid())
                .status(salary.getStatus())
                .downloadUrl("/api/salary/" + salary.getId() + "/download-preview")
                .build();
    }
}
