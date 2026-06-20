package com.erp.service;

import com.erp.dto.*;
import com.erp.entity.InventoryCategory;
import com.erp.entity.Product;
import com.erp.repository.InventoryCategoryRepository;
import com.erp.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final ProductRepository productRepository;
    private final InventoryCategoryRepository categoryRepository;

    public InventoryDashboardDto getDashboard() {
        List<Product> all = productRepository.findAll();
        List<ProductDto> lowStock = productRepository.findLowStockProducts().stream()
                .map(this::toProductDto)
                .collect(Collectors.toList());

        return InventoryDashboardDto.builder()
                .totalProducts(all.size())
                .activeProducts(all.stream().filter(p -> Boolean.TRUE.equals(p.getActive())).count())
                .lowStockCount(lowStock.size())
                .totalStockUnits(all.stream().mapToLong(p -> p.getStockQuantity() != null ? p.getStockQuantity() : 0).sum())
                .lowStockProducts(lowStock)
                .build();
    }

    public List<ProductDto> getAllProducts(String search) {
        List<Product> products = (search == null || search.isBlank())
                ? productRepository.findAll()
                : productRepository.findByNameContainingIgnoreCase(search);
        return products.stream().map(this::toProductDto).collect(Collectors.toList());
    }

    public ProductDto getProduct(Long id) {
        return toProductDto(productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id)));
    }

    public ProductDto createProduct(ProductDto dto) {
        if (productRepository.findBySku(dto.getSku()).isPresent()) {
            throw new RuntimeException("SKU already exists: " + dto.getSku());
        }
        InventoryCategory category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Product product = Product.builder()
                .name(dto.getName())
                .sku(dto.getSku())
                .category(category)
                .description(dto.getDescription())
                .stockQuantity(dto.getStockQuantity() != null ? dto.getStockQuantity() : 0)
                .lowStockThreshold(dto.getLowStockThreshold() != null ? dto.getLowStockThreshold() : 10)
                .unitPrice(dto.getUnitPrice() != null ? dto.getUnitPrice() : 0.0)
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();
        return toProductDto(productRepository.save(product));
    }

    public ProductDto updateProduct(Long id, ProductDto dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));

        if (dto.getName() != null) product.setName(dto.getName());
        if (dto.getSku() != null) product.setSku(dto.getSku());
        if (dto.getDescription() != null) product.setDescription(dto.getDescription());
        if (dto.getStockQuantity() != null) product.setStockQuantity(dto.getStockQuantity());
        if (dto.getLowStockThreshold() != null) product.setLowStockThreshold(dto.getLowStockThreshold());
        if (dto.getUnitPrice() != null) product.setUnitPrice(dto.getUnitPrice());
        if (dto.getActive() != null) product.setActive(dto.getActive());
        if (dto.getCategoryId() != null) {
            InventoryCategory category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }
        return toProductDto(productRepository.save(product));
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public ProductDto updateStock(Long id, StockUpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        int current = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        int qty = request.getQuantity() != null ? request.getQuantity() : 0;

        switch (request.getOperation() != null ? request.getOperation().toUpperCase() : "SET") {
            case "ADD" -> product.setStockQuantity(current + qty);
            case "REMOVE" -> product.setStockQuantity(Math.max(0, current - qty));
            default -> product.setStockQuantity(Math.max(0, qty));
        }
        return toProductDto(productRepository.save(product));
    }

    public List<InventoryCategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream().map(this::toCategoryDto).collect(Collectors.toList());
    }

    public InventoryCategoryDto createCategory(InventoryCategoryDto dto) {
        InventoryCategory category = InventoryCategory.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .build();
        return toCategoryDto(categoryRepository.save(category));
    }

    public InventoryCategoryDto updateCategory(Long id, InventoryCategoryDto dto) {
        InventoryCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        if (dto.getName() != null) category.setName(dto.getName());
        if (dto.getDescription() != null) category.setDescription(dto.getDescription());
        return toCategoryDto(categoryRepository.save(category));
    }

    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    private ProductDto toProductDto(Product p) {
        boolean lowStock = p.getStockQuantity() != null && p.getLowStockThreshold() != null
                && p.getStockQuantity() <= p.getLowStockThreshold();
        return ProductDto.builder()
                .id(p.getId())
                .name(p.getName())
                .sku(p.getSku())
                .categoryId(p.getCategory().getId())
                .categoryName(p.getCategory().getName())
                .description(p.getDescription())
                .stockQuantity(p.getStockQuantity())
                .lowStockThreshold(p.getLowStockThreshold())
                .unitPrice(p.getUnitPrice())
                .active(p.getActive())
                .lowStock(lowStock)
                .build();
    }

    private InventoryCategoryDto toCategoryDto(InventoryCategory c) {
        return InventoryCategoryDto.builder()
                .id(c.getId())
                .name(c.getName())
                .description(c.getDescription())
                .build();
    }
}
