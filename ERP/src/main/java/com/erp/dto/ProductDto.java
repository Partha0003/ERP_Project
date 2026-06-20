package com.erp.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDto {
    private Long id;
    private String name;
    private String sku;
    private Long categoryId;
    private String categoryName;
    private String description;
    private Integer stockQuantity;
    private Integer lowStockThreshold;
    private Double unitPrice;
    private Boolean active;
    private Boolean lowStock;
}
