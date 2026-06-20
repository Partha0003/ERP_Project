package com.erp.request;

import com.erp.entity.USER_ROLE;

import lombok.Data;

@Data
public class SignupRequest {
    private String fullName;
    private String email;
    private String password;
    private USER_ROLE role;
}
