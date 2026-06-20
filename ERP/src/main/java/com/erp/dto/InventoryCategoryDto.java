package com.erp.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryCategoryDto {
    private Long id;
    private String name;
    private String description;
}
