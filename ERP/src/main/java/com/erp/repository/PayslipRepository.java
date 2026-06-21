package com.erp.repository;

import com.erp.entity.Payslip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface PayslipRepository extends JpaRepository<Payslip, Long> {
    List<Payslip> findByEmployeeId(Long employeeId);

    List<Payslip> findByEmployeeIdOrderByPayrollMonthDesc(Long employeeId);

    List<Payslip> findByPayrollMonth(LocalDate payrollMonth);

    @Query("SELECT COUNT(p) > 0 FROM Payslip p WHERE p.salary.id = :salaryId")
    boolean existsBySalaryId(@Param("salaryId") Long salaryId);
}
