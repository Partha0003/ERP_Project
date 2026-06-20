package com.erp.controller;

import com.erp.dto.*;
import com.erp.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@PreAuthorize("hasRole('INVENTORY') or hasRole('ADMIN')")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/dashboard")
    public ResponseEntity<InventoryDashboardDto> getDashboard() {
        return ResponseEntity.ok(inventoryService.getDashboard());
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductDto>> getProducts(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(inventoryService.getAllProducts(search));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ProductDto> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getProduct(id));
    }

    @PostMapping("/products")
    public ResponseEntity<ProductDto> createProduct(@RequestBody ProductDto dto) {
        return ResponseEntity.ok(inventoryService.createProduct(dto));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ProductDto> updateProduct(@PathVariable Long id, @RequestBody ProductDto dto) {
        return ResponseEntity.ok(inventoryService.updateProduct(id, dto));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        inventoryService.deleteProduct(id);
        return ResponseEntity.ok("Product deleted");
    }

    @PutMapping("/products/{id}/stock")
    public ResponseEntity<ProductDto> updateStock(@PathVariable Long id, @RequestBody StockUpdateRequest request) {
        return ResponseEntity.ok(inventoryService.updateStock(id, request));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<InventoryCategoryDto>> getCategories() {
        return ResponseEntity.ok(inventoryService.getAllCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<InventoryCategoryDto> createCategory(@RequestBody InventoryCategoryDto dto) {
        return ResponseEntity.ok(inventoryService.createCategory(dto));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<InventoryCategoryDto> updateCategory(@PathVariable Long id, @RequestBody InventoryCategoryDto dto) {
        return ResponseEntity.ok(inventoryService.updateCategory(id, dto));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<String> deleteCategory(@PathVariable Long id) {
        inventoryService.deleteCategory(id);
        return ResponseEntity.ok("Category deleted");
    }
}
