package com.erp.controller;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.erp.dto.EmployeeLeaveDto;
import com.erp.service.EmployeeLeaveService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/leaves")
public class EmployeeLeaveController {

    private final EmployeeLeaveService employeeLeaveService;

    @PreAuthorize("hasRole('EMPLOYEE')")
    @PostMapping
    public ResponseEntity<EmployeeLeaveDto> requestLeave(@Valid @RequestBody EmployeeLeaveDto dto) {
        return ResponseEntity.ok(employeeLeaveService.createLeaveRequest(dto));
    }

    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    @PutMapping("/{id}/status")
    public ResponseEntity<EmployeeLeaveDto> updateLeaveStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(employeeLeaveService.updateLeaveStatus(id, status));
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    @GetMapping
    public ResponseEntity<Page<EmployeeLeaveDto>> getAllLeaveRequests(
            Pageable pageable,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String employeeName,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        if (status != null || employeeName != null || startDate != null || endDate != null) {
            return ResponseEntity.ok(
                    employeeLeaveService.getFilteredLeaves(status, employeeName, startDate, endDate, pageable));
        }
        return ResponseEntity.ok(employeeLeaveService.getAllLeaves(pageable));
    }

    @PreAuthorize("hasRole('EMPLOYEE')")
    @GetMapping("/my")
    public ResponseEntity<Page<EmployeeLeaveDto>> getMyLeaves(Pageable pageable) {
        return ResponseEntity.ok(employeeLeaveService.getMyLeaves(pageable));
    }

    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    @GetMapping("/filter")
    public ResponseEntity<java.util.List<EmployeeLeaveDto>> getLeaveRequestsByDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return ResponseEntity.ok(employeeLeaveService.getLeaveRequestsByDateRange(startDate, endDate));
    }
}
