package com.erp.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryDashboardDto {
    private long totalProducts;
    private long activeProducts;
    private long lowStockCount;
    private long totalStockUnits;
    private List<ProductDto> lowStockProducts;
}
