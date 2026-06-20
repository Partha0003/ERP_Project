package com.erp.config;

import com.erp.entity.*;
import com.erp.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final String DEMO_PASSWORD = "Admin@123";

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final EmployeeLeaveRepository employeeLeaveRepository;
    private final SalaryRepository salaryRepository;
    private final PayslipRepository payslipRepository;
    private final InventoryCategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded — skipping demo data.");
            seedLeavesIfEmpty();
            return;
        }

        log.info("Seeding demo ERP data...");

        Department hrDept = departmentRepository.save(new Department(null, "HR", new ArrayList<>()));
        Department financeDept = departmentRepository.save(new Department(null, "Finance", new ArrayList<>()));
        Department engDept = departmentRepository.save(new Department(null, "Engineering", new ArrayList<>()));
        Department invDept = departmentRepository.save(new Department(null, "Inventory", new ArrayList<>()));

        String encoded = passwordEncoder.encode(DEMO_PASSWORD);

        userRepository.save(User.builder().fullName("System Admin").email("admin@erp.com").password(encoded)
                .role(USER_ROLE.ADMIN).status(USER_STATUS.ACTIVE).isActive(true).department(engDept).build());
        userRepository.save(User.builder().fullName("HR Manager").email("hr@erp.com").password(encoded)
                .role(USER_ROLE.HR).status(USER_STATUS.ACTIVE).isActive(true).department(hrDept).build());
        userRepository.save(User.builder().fullName("Finance Manager").email("finance@erp.com").password(encoded)
                .role(USER_ROLE.FINANCE).status(USER_STATUS.ACTIVE).isActive(true).department(financeDept).build());
        userRepository.save(User.builder().fullName("Inventory Manager").email("inventory@erp.com").password(encoded)
                .role(USER_ROLE.INVENTORY).status(USER_STATUS.ACTIVE).isActive(true).department(invDept).build());

        String[] names = {"Alice Kumar", "Bob Singh", "Carol Das", "David Rao", "Eva Menon",
                "Frank Nair", "Grace Pillai", "Henry Jose", "Ivy Thomas", "Jack Mathew"};
        Department[] depts = {engDept, engDept, hrDept, financeDept, engDept, engDept, hrDept, financeDept, engDept, invDept};
        double[] salaries = {55000, 62000, 48000, 71000, 58000, 65000, 47000, 73000, 60000, 52000};

        List<Employee> employees = new ArrayList<>();
        for (int i = 0; i < names.length; i++) {
            Employee emp = Employee.builder()
                    .name(names[i])
                    .email("employee" + (i + 1) + "@erp.com")
                    .phone("98765432" + String.format("%02d", i))
                    .role(USER_ROLE.EMPLOYEE)
                    .department(depts[i])
                    .isActive(true)
                    .password(encoded)
                    .baseSalary(salaries[i])
                    .bonus(2000.0)
                    .deduction(500.0)
                    .performanceRating(4.0 + (i % 3) * 0.3)
                    .build();
            employees.add(employeeRepository.save(emp));
        }

        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
        LocalDate today = LocalDate.now();
        for (Employee emp : employees) {
            for (LocalDate d = monthStart; !d.isAfter(today); d = d.plusDays(1)) {
                if (d.getDayOfWeek().getValue() >= 6) continue;
                Attendance.AttendanceStatus status = Attendance.AttendanceStatus.PRESENT;
                if (d.getDayOfMonth() % 11 == 0) status = Attendance.AttendanceStatus.ABSENT;
                attendanceRepository.save(Attendance.builder()
                        .employee(emp).date(d).present(status == Attendance.AttendanceStatus.PRESENT)
                        .status(status).overtime(false).build());
            }
        }

        seedLeaveRequests(employees, today);

        for (int i = 0; i < employees.size(); i++) {
            Employee emp = employees.get(i);
            double net = emp.getBaseSalary() + emp.getBonus() - emp.getDeduction() - 1200;
            Salary salary = Salary.builder()
                    .employee(emp).employeeName(emp.getName()).department(emp.getDepartment().getName())
                    .month(monthStart).baseSalary(emp.getBaseSalary()).bonus(emp.getBonus())
                    .tax(1200.0).deduction(emp.getDeduction()).presentDays(18).leaveDays(1).absentDays(1)
                    .finalSalary(net).totalPayable(net).date(LocalDate.now())
                    .approvedByHR(i < 8).forwardedToFinance(i < 6).paid(i < 3)
                    .build();
            salary.calculateTotalPayable();
            salary = salaryRepository.save(salary);

            if (salary.isPaid()) {
                Payslip payslip = new Payslip();
                payslip.setEmployee(emp);
                payslip.setBaseSalary(salary.getBaseSalary());
                payslip.setBonus(salary.getBonus());
                payslip.setDeduction(salary.getDeduction());
                payslip.setTotalPayable(salary.getTotalPayable());
                payslip.setDateIssued(monthStart);
                payslip.setStatus("Paid");
                payslipRepository.save(payslip);
            }
        }

        InventoryCategory electronics = categoryRepository.save(
                InventoryCategory.builder().name("Electronics").description("Electronic items").build());
        InventoryCategory office = categoryRepository.save(
                InventoryCategory.builder().name("Office Supplies").description("Stationery and office items").build());
        InventoryCategory furniture = categoryRepository.save(
                InventoryCategory.builder().name("Furniture").description("Office furniture").build());

        productRepository.save(Product.builder().name("Laptop Dell XPS").sku("SKU-LAP-001").category(electronics)
                .description("Business laptop").stockQuantity(25).lowStockThreshold(5).unitPrice(85000.0).active(true).build());
        productRepository.save(Product.builder().name("Wireless Mouse").sku("SKU-MOU-001").category(electronics)
                .description("Ergonomic mouse").stockQuantity(8).lowStockThreshold(10).unitPrice(1200.0).active(true).build());
        productRepository.save(Product.builder().name("A4 Paper Ream").sku("SKU-PAP-001").category(office)
                .description("500 sheets").stockQuantity(120).lowStockThreshold(20).unitPrice(350.0).active(true).build());
        productRepository.save(Product.builder().name("Office Chair").sku("SKU-CHA-001").category(furniture)
                .description("Ergonomic chair").stockQuantity(3).lowStockThreshold(5).unitPrice(12000.0).active(true).build());
        productRepository.save(Product.builder().name("Whiteboard Marker").sku("SKU-MAR-001").category(office)
                .description("Pack of 4").stockQuantity(45).lowStockThreshold(15).unitPrice(180.0).active(true).build());

        log.info("Demo data seeded. Login: admin@erp.com / {} (also hr@, finance@, inventory@, employee1@erp.com)", DEMO_PASSWORD);
    }

    private void seedLeavesIfEmpty() {
        if (employeeLeaveRepository.count() > 0) {
            return;
        }
        List<Employee> employees = employeeRepository.findAll();
        if (employees.isEmpty()) {
            return;
        }
        log.info("Seeding leave requests...");
        seedLeaveRequests(employees, LocalDate.now());
    }

    private void seedLeaveRequests(List<Employee> employees, LocalDate today) {
        // 5 pending
        saveLeave(employees.get(0), "Sick", today.plusDays(3), today.plusDays(4), "Medical checkup", EmployeeLeave.LeaveStatus.PENDING);
        saveLeave(employees.get(1), "Casual", today.plusDays(7), today.plusDays(7), "Personal errand", EmployeeLeave.LeaveStatus.PENDING);
        saveLeave(employees.get(3), "Annual", today.plusDays(10), today.plusDays(12), "Family function", EmployeeLeave.LeaveStatus.PENDING);
        saveLeave(employees.get(5), "Sick", today.plusDays(5), today.plusDays(6), "Flu recovery", EmployeeLeave.LeaveStatus.PENDING);
        saveLeave(employees.get(7), "Casual", today.plusDays(14), today.plusDays(15), "Travel plans", EmployeeLeave.LeaveStatus.PENDING);

        // 3 approved — sync attendance
        EmployeeLeave approved1 = saveLeave(employees.get(2), "Casual", today.plusDays(1), today.plusDays(2), "Personal work", EmployeeLeave.LeaveStatus.APPROVED);
        EmployeeLeave approved2 = saveLeave(employees.get(4), "Annual", today.plusDays(8), today.plusDays(9), "Short trip", EmployeeLeave.LeaveStatus.APPROVED);
        EmployeeLeave approved3 = saveLeave(employees.get(6), "Sick", today.plusDays(4), today.plusDays(4), "Doctor visit", EmployeeLeave.LeaveStatus.APPROVED);
        syncLeaveAttendance(approved1);
        syncLeaveAttendance(approved2);
        syncLeaveAttendance(approved3);

        // 2 rejected
        saveLeave(employees.get(8), "Unpaid", today.plusDays(20), today.plusDays(22), "Extended break", EmployeeLeave.LeaveStatus.REJECTED);
        saveLeave(employees.get(9), "Casual", today.plusDays(6), today.plusDays(6), "Late request", EmployeeLeave.LeaveStatus.REJECTED);
    }

    private EmployeeLeave saveLeave(Employee employee, String type, LocalDate start, LocalDate end,
                                    String reason, EmployeeLeave.LeaveStatus status) {
        return employeeLeaveRepository.save(EmployeeLeave.builder()
                .employee(employee)
                .leaveType(type)
                .startDate(start)
                .endDate(end)
                .reason(reason)
                .status(status)
                .appliedDate(todayOrPast(start))
                .build());
    }

    private LocalDate todayOrPast(LocalDate start) {
        LocalDate today = LocalDate.now();
        return start.isBefore(today) ? start : today;
    }

    private void syncLeaveAttendance(EmployeeLeave leave) {
        Employee employee = leave.getEmployee();
        for (LocalDate date = leave.getStartDate(); !date.isAfter(leave.getEndDate()); date = date.plusDays(1)) {
            final LocalDate currentDate = date;
            attendanceRepository.findByEmployeeIdAndDate(employee.getId(), currentDate)
                    .ifPresentOrElse(existing -> {
                        existing.setStatus(Attendance.AttendanceStatus.LEAVE);
                        existing.setPresent(false);
                        existing.setRemarks("Approved leave: " + leave.getLeaveType());
                        attendanceRepository.save(existing);
                    }, () -> attendanceRepository.save(Attendance.builder()
                            .employee(employee)
                            .date(currentDate)
                            .status(Attendance.AttendanceStatus.LEAVE)
                            .present(false)
                            .remarks("Approved leave: " + leave.getLeaveType())
                            .overtime(false)
                            .build()));
        }
    }
}
