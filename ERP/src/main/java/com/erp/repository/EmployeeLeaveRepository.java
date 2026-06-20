package com.erp.repository;

import com.erp.entity.Employee;
import com.erp.entity.EmployeeLeave;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeLeaveRepository extends JpaRepository<EmployeeLeave, Long> {
    // Method to find EmployeeLeave records based on Employee and a date range
    List<EmployeeLeave> findByEmployeeAndStartDateBetween(Employee employee, LocalDate startDate, LocalDate endDate);
    List<EmployeeLeave> findByStartDateBetween(LocalDate startDate, LocalDate endDate);
    Page<EmployeeLeave> findByEmployee(Employee employee, Pageable pageable);

    Page<EmployeeLeave> findByStatus(EmployeeLeave.LeaveStatus status, Pageable pageable);

    boolean existsByEmployeeIdAndStartDateLessThanEqualAndEndDateGreaterThanEqualAndStatus(
            Long employeeId, LocalDate endDate, LocalDate startDate, EmployeeLeave.LeaveStatus status);

    @Query("SELECT COUNT(el) > 0 FROM EmployeeLeave el WHERE el.employee = :employee " +
           "AND el.status IN ('PENDING', 'APPROVED') " +
           "AND el.startDate <= :endDate AND el.endDate >= :startDate")
    boolean hasOverlappingActiveLeave(@Param("employee") Employee employee,
                                      @Param("startDate") LocalDate startDate,
                                      @Param("endDate") LocalDate endDate);

    @Query("SELECT el FROM EmployeeLeave el WHERE " +
           "(:status IS NULL OR el.status = :status) AND " +
           "(:employeeName IS NULL OR LOWER(el.employee.name) LIKE LOWER(CONCAT('%', :employeeName, '%'))) AND " +
           "(:startDate IS NULL OR el.startDate >= :startDate) AND " +
           "(:endDate IS NULL OR el.endDate <= :endDate)")
    Page<EmployeeLeave> findFiltered(@Param("status") EmployeeLeave.LeaveStatus status,
                                     @Param("employeeName") String employeeName,
                                     @Param("startDate") LocalDate startDate,
                                     @Param("endDate") LocalDate endDate,
                                     Pageable pageable);
}

