package com.erp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.erp.config.JwtProvider;
import com.erp.entity.Department;
import com.erp.entity.USER_ROLE;
import com.erp.entity.USER_STATUS;
import com.erp.entity.User;
import com.erp.entity.Employee;
import com.erp.repository.UserRepository;
import com.erp.repository.EmployeeRepository;
import com.erp.repository.DepartmentRepository;
import com.erp.request.LoginRequest;
import com.erp.request.SignupRequest;
import com.erp.response.AuthResponse;
import com.erp.service.CustomerUserDetailsService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private CustomerUserDetailsService customerUserDetailsService;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return new ResponseEntity<>(new AuthResponse("Email is required"), HttpStatus.BAD_REQUEST);
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            return new ResponseEntity<>(new AuthResponse("Password is required"), HttpStatus.BAD_REQUEST);
        }
        if (request.getRole() == null) {
            return new ResponseEntity<>(new AuthResponse("Role cannot be null"), HttpStatus.BAD_REQUEST);
        }

        String email = request.getEmail().trim();

        if (userRepository.findByEmail(email) != null || employeeRepository.findByEmail(email).isPresent()) {
            return new ResponseEntity<>(new AuthResponse("Email already in use"), HttpStatus.BAD_REQUEST);
        }

        USER_ROLE role = request.getRole();
        if (role.name().startsWith("ROLE_")) {
            role = USER_ROLE.valueOf(role.name().replace("ROLE_", ""));
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        UserDetails userDetails;
        Long employeeId = null;

        if (role == USER_ROLE.EMPLOYEE) {
            if (request.getFullName() == null || request.getFullName().isBlank()) {
                return new ResponseEntity<>(new AuthResponse("Full name is required"), HttpStatus.BAD_REQUEST);
            }

            Department department = departmentRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("No department available. Ask admin to create a department first."));

            Employee employee = Employee.builder()
                    .name(request.getFullName().trim())
                    .email(email)
                    .phone("0000000000")
                    .role(USER_ROLE.EMPLOYEE)
                    .department(department)
                    .isActive(true)
                    .password(encodedPassword)
                    .baseSalary(0.0)
                    .bonus(0.0)
                    .deduction(0.0)
                    .build();

            Employee savedEmployee = employeeRepository.save(employee);
            employeeId = savedEmployee.getId();
            userDetails = customerUserDetailsService.loadUserByUsername(email);
        } else {
            User user = User.builder()
                    .fullName(request.getFullName())
                    .email(email)
                    .password(encodedPassword)
                    .role(role)
                    .status(USER_STATUS.ACTIVE)
                    .isActive(true)
                    .build();
            userRepository.save(user);
            userDetails = customerUserDetailsService.loadUserByUsername(email);
        }

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        String jwt = jwtProvider.generateToken(authentication);

        return new ResponseEntity<>(
                new AuthResponse(jwt, "Registration success", role, employeeId),
                HttpStatus.CREATED);
    }

    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signin(@RequestBody LoginRequest request) {
        String email = request.getEmail();
        String password = request.getPassword();

        UserDetails userDetails = customerUserDetailsService.loadUserByUsername(email);

        if (userDetails == null || !passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        String jwt = jwtProvider.generateToken(authentication);

        String role = authentication.getAuthorities().stream().findFirst().get().getAuthority();
        String roleWithoutPrefix = role.replace("ROLE_", "");
        USER_ROLE userRole = USER_ROLE.valueOf(roleWithoutPrefix);

        Long employeeId = null;
        if (userRole == USER_ROLE.EMPLOYEE) {
            employeeId = employeeRepository.findByEmail(email).map(Employee::getId).orElse(null);
        }

        return new ResponseEntity<>(
            new AuthResponse(jwt, "Login success", userRole, employeeId),
            HttpStatus.OK
        );
    }
}
