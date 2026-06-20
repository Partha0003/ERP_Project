package com.erp.service;

import com.erp.dto.EmployeeLeaveDto;
import com.erp.entity.Attendance;
import com.erp.entity.Attendance.AttendanceStatus;
import com.erp.entity.Employee;
import com.erp.entity.EmployeeLeave;
import com.erp.repository.AttendanceRepository;
import com.erp.repository.EmployeeLeaveRepository;
import com.erp.repository.EmployeeRepository;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeLeaveService {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeLeaveService.class);

    private final EmployeeRepository employeeRepository;
    private final EmployeeLeaveRepository employeeLeaveRepository;
    private final AttendanceRepository attendanceRepository;

    public Page<EmployeeLeaveDto> getMyLeaves(Pageable pageable) {
        Employee employee = getCurrentEmployee();
        return employeeLeaveRepository.findByEmployee(employee, pageable).map(this::mapToDto);
    }

    @Transactional
    public EmployeeLeaveDto createLeaveRequest(EmployeeLeaveDto dto) {
        Employee employee = getCurrentEmployee();
        logger.info("Creating leave request for employee: {}", employee.getEmail());

        validateLeaveDates(dto.getStartDate(), dto.getEndDate());

        if (employeeLeaveRepository.hasOverlappingActiveLeave(employee, dto.getStartDate(), dto.getEndDate())) {
            throw new IllegalStateException("You already have a pending or approved leave request for this period.");
        }

        EmployeeLeave leave = EmployeeLeave.builder()
                .employee(employee)
                .leaveType(dto.getLeaveType())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .reason(dto.getReason())
                .status(EmployeeLeave.LeaveStatus.PENDING)
                .appliedDate(LocalDate.now())
                .build();

        EmployeeLeave savedLeave = employeeLeaveRepository.save(leave);
        logger.info("Leave request saved with ID: {}", savedLeave.getId());
        return mapToDto(savedLeave);
    }

    @Transactional
    public EmployeeLeaveDto updateLeaveStatus(Long id, String status) {
        logger.info("Updating leave status for ID: {} to {}", id, status);

        EmployeeLeave leave = employeeLeaveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found with ID: " + id));

        EmployeeLeave.LeaveStatus newStatus;
        try {
            newStatus = EmployeeLeave.LeaveStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid leave status: " + status);
        }

        if (leave.getStatus() != EmployeeLeave.LeaveStatus.PENDING) {
            throw new IllegalStateException("Only pending leave requests can be updated.");
        }

        leave.setStatus(newStatus);
        EmployeeLeave updatedLeave = employeeLeaveRepository.save(leave);

        if (newStatus == EmployeeLeave.LeaveStatus.APPROVED) {
            syncAttendanceForApprovedLeave(updatedLeave);
        }

        logger.info("Leave status updated for ID: {} to {}", id, updatedLeave.getStatus());
        return mapToDto(updatedLeave);
    }

    public Page<EmployeeLeaveDto> getAllLeaves(Pageable pageable) {
        return employeeLeaveRepository.findAll(pageable).map(this::mapToDto);
    }

    public Page<EmployeeLeaveDto> getFilteredLeaves(String status, String employeeName,
                                                    LocalDate startDate, LocalDate endDate, Pageable pageable) {
        EmployeeLeave.LeaveStatus leaveStatus = null;
        if (status != null && !status.isBlank()) {
            leaveStatus = EmployeeLeave.LeaveStatus.valueOf(status.toUpperCase());
        }
        String nameFilter = (employeeName != null && !employeeName.isBlank()) ? employeeName : null;
        return employeeLeaveRepository.findFiltered(leaveStatus, nameFilter, startDate, endDate, pageable)
                .map(this::mapToDto);
    }

    public List<EmployeeLeaveDto> getLeaveRequestsByDateRange(LocalDate startDate, LocalDate endDate) {
        return employeeLeaveRepository.findByStartDateBetween(startDate, endDate).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private Employee getCurrentEmployee() {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return employeeRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Employee not found with email: " + currentEmail));
    }

    private void validateLeaveDates(LocalDate startDate, LocalDate endDate) {
        LocalDate today = LocalDate.now();
        if (startDate.isBefore(today)) {
            throw new IllegalArgumentException("Start date cannot be in the past.");
        }
        if (endDate.isBefore(today)) {
            throw new IllegalArgumentException("End date cannot be in the past.");
        }
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date cannot be after end date.");
        }
    }

    private void syncAttendanceForApprovedLeave(EmployeeLeave leave) {
        Employee employee = leave.getEmployee();
        LocalDate start = leave.getStartDate();
        LocalDate end = leave.getEndDate();

        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            final LocalDate currentDate = date;
            attendanceRepository.findByEmployeeIdAndDate(employee.getId(), currentDate)
                    .ifPresentOrElse(existing -> {
                        existing.setStatus(AttendanceStatus.LEAVE);
                        existing.setPresent(false);
                        existing.setRemarks("Approved leave: " + leave.getLeaveType());
                        attendanceRepository.save(existing);
                    }, () -> attendanceRepository.save(Attendance.builder()
                            .employee(employee)
                            .date(currentDate)
                            .status(AttendanceStatus.LEAVE)
                            .present(false)
                            .remarks("Approved leave: " + leave.getLeaveType())
                            .overtime(false)
                            .build()));
        }
        logger.info("Synced attendance as LEAVE for employee {} from {} to {}", employee.getId(), start, end);
    }

    private EmployeeLeaveDto mapToDto(EmployeeLeave leave) {
        EmployeeLeaveDto dto = new EmployeeLeaveDto();
        dto.setId(leave.getId());
        dto.setEmployeeId(leave.getEmployee().getId());
        dto.setEmployeeName(leave.getEmployee().getName());
        dto.setLeaveType(leave.getLeaveType());
        dto.setStartDate(leave.getStartDate());
        dto.setEndDate(leave.getEndDate());
        dto.setReason(leave.getReason());
        dto.setStatus(leave.getStatus().toString());
        dto.setAppliedDate(leave.getAppliedDate());
        return dto;
    }
}
