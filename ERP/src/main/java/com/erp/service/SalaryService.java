package com.erp.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.erp.dto.MyPayslipDto;
import com.erp.dto.PayslipLogDto;
import com.erp.dto.SalaryDashboardSummaryDto;
import com.erp.dto.SalaryGenerateResultDto;
import com.erp.dto.SalaryPayslipDto;
import com.erp.entity.Attendance;
import com.erp.entity.Employee;
import com.erp.entity.Payslip;
import com.erp.entity.PayslipLog;
import com.erp.entity.Salary;
import com.erp.entity.SalaryCalculator;
import com.erp.exception.DuplicateRecordException;
import com.erp.exception.EmployeeNotFoundException;
import com.erp.exception.PayrollWorkflowException;
import com.erp.exception.SalaryNotFoundException;
import com.erp.repository.AttendanceRepository;
import com.erp.repository.EmployeeRepository;
import com.erp.repository.PayslipLogRepository;
import com.erp.repository.PayslipRepository;
import com.erp.repository.SalaryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SalaryService {

    private static final Logger logger = LoggerFactory.getLogger(SalaryService.class);

    private final SalaryCalculator salaryCalculator;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final SalaryRepository salaryRepository;
    private final PayslipRepository payslipRepository;
    private final PayslipLogRepository payslipLogRepository;

    public SalaryGenerateResultDto generateMonthlySalary(LocalDate monthDate) {
        YearMonth ym = YearMonth.from(monthDate);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();
        List<String> warnings = new ArrayList<>();
        int generated = 0;
        int skipped = 0;

        List<Employee> employees = employeeRepository.findAllByIsActiveTrue();
        for (Employee emp : employees) {
            if (salaryRepository.existsByEmployeeIdAndMonth(emp.getId(), start)) {
                skipped++;
                continue;
            }

            List<Attendance> attendanceList = attendanceRepository
                    .findByEmployeeIdAndDateBetween(emp.getId(), start, end);

            if (attendanceList.isEmpty()) {
                warnings.add("No attendance for " + emp.getName()
                        + " — salary generated using base salary only.");
                logger.warn("No attendance found for Employee ID: {} for month {}", emp.getId(), start);
            }

            long presentDays = attendanceList.stream()
                    .filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT)
                    .count();
            long leaveDays = attendanceList.stream()
                    .filter(a -> a.getStatus() == Attendance.AttendanceStatus.LEAVE)
                    .count();
            long absentDays = attendanceList.stream()
                    .filter(a -> a.getStatus() == Attendance.AttendanceStatus.ABSENT)
                    .count();

            double tax = salaryCalculator.calculateMonthlyTax(emp);
            double netSalary = salaryCalculator.calculateNetSalary(emp, attendanceList, ym);

            Salary salary = Salary.builder()
                    .employee(emp)
                    .employeeName(emp.getName())
                    .department(emp.getDepartment().getName())
                    .month(start)
                    .baseSalary(emp.getBaseSalary() != null ? emp.getBaseSalary() : 0.0)
                    .presentDays((int) presentDays)
                    .leaveDays((int) leaveDays)
                    .absentDays((int) absentDays)
                    .totalPayable(netSalary)
                    .finalSalary(netSalary)
                    .approvedByHR(false)
                    .forwardedToFinance(false)
                    .paid(false)
                    .date(LocalDate.now())
                    .bonus(emp.getBonus() != null ? emp.getBonus() : 0.0)
                    .tax(tax)
                    .deduction(emp.getDeduction() != null ? emp.getDeduction() : 0.0)
                    .build();

            salary.calculateTotalPayable();
            salaryRepository.save(salary);
            generated++;

            logger.info("Generated salary for Employee ID: {} for month {}. Net Payable: {}",
                    emp.getId(), ym, netSalary);
        }

        String message = String.format("Generated %d salary record(s) for %s. Skipped %d duplicate(s).",
                generated, ym, skipped);
        return new SalaryGenerateResultDto(generated, skipped, warnings, message);
    }

    public List<SalaryPayslipDto> getAllSalariesForMonth(LocalDate month, String employeeName) {
        LocalDate payrollMonth = month.withDayOfMonth(1);
        return salaryRepository.findByMonth(payrollMonth).stream()
                .filter(s -> employeeName == null || employeeName.isBlank()
                        || s.getEmployeeName().toLowerCase().contains(employeeName.toLowerCase()))
                .sorted(Comparator.comparing(Salary::getEmployeeName))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<SalaryPayslipDto> getForwardedSalaries(LocalDate month, String employeeName) {
        LocalDate payrollMonth = month.withDayOfMonth(1);
        return salaryRepository.findByMonthAndForwardedToFinanceTrue(payrollMonth).stream()
                .filter(s -> employeeName == null || employeeName.isBlank()
                        || s.getEmployeeName().toLowerCase().contains(employeeName.toLowerCase()))
                .sorted(Comparator.comparing(Salary::getEmployeeName))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public void approveSalary(Long id) {
        Salary salary = salaryRepository.findById(id)
                .orElseThrow(() -> new SalaryNotFoundException("Salary not found"));
        if (salary.isApprovedByHR()) {
            throw new PayrollWorkflowException("Salary is already approved by HR.");
        }
        salary.setApprovedByHR(true);
        salaryRepository.save(salary);
    }

    public void forwardSalaryToFinance(Long id) {
        Salary salary = salaryRepository.findById(id)
                .orElseThrow(() -> new SalaryNotFoundException("Salary not found"));
        if (!salary.isApprovedByHR()) {
            throw new PayrollWorkflowException("Salary must be approved by HR first.");
        }
        if (salary.isForwardedToFinance()) {
            throw new PayrollWorkflowException("Salary is already forwarded to Finance.");
        }
        salary.setForwardedToFinance(true);
        salaryRepository.save(salary);
    }

    public void markAsPaid(Long id) {
        Salary salary = salaryRepository.findById(id)
                .orElseThrow(() -> new SalaryNotFoundException("Salary not found"));
        if (!salary.isForwardedToFinance()) {
            throw new PayrollWorkflowException("Salary not forwarded to Finance yet.");
        }
        if (salary.isPaid()) {
            throw new PayrollWorkflowException("Salary is already marked as paid.");
        }

        salary.setPaid(true);
        salaryRepository.save(salary);
        createPayslipFromSalary(salary);
    }

    private Payslip createPayslipFromSalary(Salary salary) {
        if (payslipRepository.existsBySalaryId(salary.getId())) {
            throw new DuplicateRecordException("Payslip already exists for this salary record.");
        }

        Payslip payslip = new Payslip();
        payslip.setSalary(salary);
        payslip.setEmployee(salary.getEmployee());
        payslip.setPayrollMonth(salary.getMonth());
        payslip.setBaseSalary(salary.getBaseSalary());
        payslip.setBonus(salary.getBonus());
        double totalDeduction = (salary.getDeduction() != null ? salary.getDeduction() : 0.0)
                + (salary.getTax() != null ? salary.getTax() : 0.0);
        payslip.setDeduction(totalDeduction);
        payslip.setTotalPayable(salary.getTotalPayable());
        payslip.setDateIssued(LocalDate.now());
        payslip.setStatus("Paid");
        payslip.setDownloadUrl("/api/payslip/payslip/" + payslip.getId() + "/download/self");

        return payslipRepository.save(payslip);
    }

    public Map<String, Long> getSalarySummary(LocalDate month) {
        LocalDate payrollMonth = month.withDayOfMonth(1);
        List<Salary> salaries = salaryRepository.findByMonth(payrollMonth);

        Map<String, Long> summary = new HashMap<>();
        summary.put("total", (long) salaries.size());
        summary.put("approved", salaries.stream().filter(Salary::isApprovedByHR).count());
        summary.put("forwarded", salaries.stream().filter(Salary::isForwardedToFinance).count());
        summary.put("paid", salaries.stream().filter(Salary::isPaid).count());
        return summary;
    }

    public List<SalaryPayslipDto> getSalaryHistoryForEmployee(Long employeeId) {
        if (employeeId == null) {
            throw new IllegalArgumentException("Employee ID must not be null");
        }

        return salaryRepository.findByEmployeeId(employeeId).stream()
                .sorted(Comparator.comparing(Salary::getMonth).reversed())
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private SalaryPayslipDto mapToDto(Salary salary) {
        double net = salary.getTotalPayable() != null ? salary.getTotalPayable() : salary.getTotalEarnings();
        return SalaryPayslipDto.builder()
                .id(salary.getId())
                .employeeName(salary.getEmployeeName())
                .employeeEmail(salary.getEmployee() != null ? salary.getEmployee().getEmail() : "")
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

    public SalaryDashboardSummaryDto getSalaryDashboardSummary(LocalDate month) {
        LocalDate payrollMonth = month.withDayOfMonth(1);
        Double totalPayout = salaryRepository.sumPaidPayoutByMonth(payrollMonth);
        Long pendingPayslipsCount = salaryRepository.countPendingHrApprovalByMonth(payrollMonth);
        Long forwardedPayslipsCount = salaryRepository.countForwardedPendingByMonth(payrollMonth);
        Long paidCount = salaryRepository.countPaidByMonth(payrollMonth);

        return new SalaryDashboardSummaryDto(
                totalPayout != null ? totalPayout : 0.0,
                pendingPayslipsCount != null ? pendingPayslipsCount : 0L,
                forwardedPayslipsCount != null ? forwardedPayslipsCount : 0L,
                paidCount != null ? paidCount : 0L);
    }

    public List<MyPayslipDto> getMyPayslips(String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found"));

        List<Payslip> payslips = payslipRepository.findByEmployeeIdOrderByPayrollMonthDesc(employee.getId());
        if (payslips.isEmpty()) {
            return Collections.emptyList();
        }

        return payslips.stream()
                .map(p -> new MyPayslipDto(
                        p.getId(),
                        Month.of(p.getMonth()).getDisplayName(TextStyle.FULL, Locale.ENGLISH),
                        p.getYear(),
                        p.getNetSalary(),
                        p.getStatus(),
                        "/api/payslip/payslip/" + p.getId() + "/download/self"))
                .collect(Collectors.toList());
    }

    public void logAction(Long payslipId, String action, String doneBy) {
        Payslip payslip = payslipRepository.findById(payslipId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid payslip ID"));

        PayslipLog.Action actionEnum = PayslipLog.Action.valueOf(action);

        PayslipLog log = new PayslipLog();
        log.setPayslip(payslip);
        log.setAction(actionEnum);
        log.setDoneBy(doneBy);
        log.setTimestamp(LocalDateTime.now());

        payslipLogRepository.save(log);
    }

    public List<PayslipLogDto> getLogsByPayslipId(Long payslipId) {
        List<PayslipLog> logs = payslipLogRepository.findByPayslipIdOrderByTimestampDesc(payslipId);

        return logs.stream()
                .map(log -> new PayslipLogDto(
                        log.getAction(),
                        log.getDoneBy(),
                        log.getTimestamp()))
                .collect(Collectors.toList());
    }

    public List<PayslipLogDto> getLogsByEmployee(Long employeeId) {
        List<Payslip> payslips = payslipRepository.findByEmployeeId(employeeId);
        List<Long> ids = payslips.stream().map(Payslip::getId).collect(Collectors.toList());

        List<PayslipLog> logs = payslipLogRepository.findByPayslipIdInOrderByTimestampDesc(ids);

        return logs.stream()
                .map(log -> new PayslipLogDto(
                        log.getAction(),
                        log.getDoneBy(),
                        log.getTimestamp()))
                .collect(Collectors.toList());
    }

    public List<PayslipLogDto> getFilteredLogs(Long payslipId, Integer month, Integer year, String actionType) {
        List<PayslipLog> logs = payslipLogRepository.findByPayslipId(payslipId);

        return logs.stream()
                .filter(log -> (month == null || log.getTimestamp().getMonthValue() == month)
                        && (year == null || log.getTimestamp().getYear() == year)
                        && (actionType == null || actionType.isBlank()
                                || log.getAction().name().equalsIgnoreCase(actionType)))
                .map(log -> new PayslipLogDto(
                        log.getAction().name(),
                        log.getDoneBy(),
                        log.getTimestamp()))
                .collect(Collectors.toList());
    }

    public List<PayslipLogDto> getFilteredLogsByEmployee(Long employeeId, Integer month, Integer year,
            String actionType) {
        List<PayslipLog> logs = payslipLogRepository.findByEmployeeId(employeeId);

        return logs.stream()
                .filter(log -> (month == null || log.getTimestamp().getMonthValue() == month)
                        && (year == null || log.getTimestamp().getYear() == year)
                        && (actionType == null || actionType.isBlank()
                                || log.getAction().name().equalsIgnoreCase(actionType)))
                .map(log -> new PayslipLogDto(
                        log.getAction().name(),
                        log.getDoneBy(),
                        log.getTimestamp()))
                .collect(Collectors.toList());
    }

    public String getEmployeeEmailBySalaryId(Long id) {
        Salary salary = salaryRepository.findById(id)
                .orElseThrow(() -> new SalaryNotFoundException("Salary not found"));
        if (salary.getEmployee() != null) {
            return salary.getEmployee().getEmail();
        }
        return employeeRepository.findAll().stream()
                .filter(e -> e.getName().equals(salary.getEmployeeName()))
                .map(Employee::getEmail)
                .findFirst()
                .orElseThrow(() -> new EmployeeNotFoundException("Employee email not found for salary"));
    }

    public SalaryPayslipDto getSalaryPreview(Long id) {
        Salary salary = salaryRepository.findById(id)
                .orElseThrow(() -> new SalaryNotFoundException("Salary not found"));
        return mapToDto(salary);
    }

    public List<Salary> getSalaryHistoryByEmployeeId(Long employeeId) {
        return salaryRepository.findByEmployeeIdOrderByDateDesc(employeeId);
    }

    public void regenerateSalaryEntry(Long id) {
        Salary salary = salaryRepository.findById(id)
                .orElseThrow(() -> new SalaryNotFoundException("Salary entry not found for ID: " + id));

        if (salary.isPaid()) {
            throw new PayrollWorkflowException("Cannot regenerate a salary that has already been paid.");
        }

        YearMonth ym = YearMonth.from(salary.getMonth());
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();
        Employee emp = salary.getEmployee();

        List<Attendance> attendanceList = attendanceRepository
                .findByEmployeeIdAndDateBetween(emp.getId(), start, end);

        long presentDays = attendanceList.stream()
                .filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT)
                .count();
        long leaveDays = attendanceList.stream()
                .filter(a -> a.getStatus() == Attendance.AttendanceStatus.LEAVE)
                .count();
        long absentDays = attendanceList.stream()
                .filter(a -> a.getStatus() == Attendance.AttendanceStatus.ABSENT)
                .count();

        double tax = salaryCalculator.calculateMonthlyTax(emp);
        double netSalary = salaryCalculator.calculateNetSalary(emp, attendanceList, ym);

        salary.setPresentDays((int) presentDays);
        salary.setLeaveDays((int) leaveDays);
        salary.setAbsentDays((int) absentDays);
        salary.setTax(tax);
        salary.setTotalPayable(netSalary);
        salary.setFinalSalary(netSalary);
        salary.setApprovedByHR(false);
        salary.setForwardedToFinance(false);
        salary.setPaid(false);
        salary.calculateTotalPayable();
        salaryRepository.save(salary);
    }

    public void deleteSalary(Long id) {
        Salary salary = salaryRepository.findById(id)
                .orElseThrow(() -> new SalaryNotFoundException("Salary entry not found for ID: " + id));
        if (salary.isPaid()) {
            throw new PayrollWorkflowException("Cannot delete a salary that has been paid.");
        }
        salaryRepository.delete(salary);
    }

    public Map<String, Long> getSalaryStatusCounts(LocalDate month) {
        LocalDate payrollMonth = month.withDayOfMonth(1);
        List<Salary> salaries = salaryRepository.findByMonth(payrollMonth);

        return salaries.stream()
                .collect(Collectors.groupingBy(Salary::getStatus, Collectors.counting()));
    }
}
