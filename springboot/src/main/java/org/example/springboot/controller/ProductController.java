package org.example.springboot.controller;

import org.example.springboot.common.Result;
import org.example.springboot.entity.Product;
import org.example.springboot.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/product")
public class ProductController {
    private static final Logger LOGGER = LoggerFactory.getLogger(ProductController.class);

    @Autowired
    private ProductService productService;
    @PostMapping
    public Result<?> createProduct(@RequestBody Product product) {
        return productService.createProduct(product);
    }
    @PutMapping("/{id}")
    public Result<?> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return productService.updateProduct(id, product);
    }
    @DeleteMapping("/{id}")
    public Result<?> deleteProduct(@PathVariable Long id) {
        return productService.deleteProduct(id);
    }
    @GetMapping("/{id}")
    public Result<?> getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }
    @GetMapping("/page")
    public Result<?> getProductsByPage(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long merchantId,
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "1") Integer currentPage,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String sortField,
            @RequestParam(required = false) String sortOrder,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {
        return Result.success(productService.getProductsByPage(name, categoryId, merchantId, status,
                currentPage, size, sortField, sortOrder, minPrice, maxPrice));
    }
    @PutMapping("/{id}/status")
    public Result<?> updateProductStatus(@PathVariable Long id, @RequestParam Integer status) {
        return productService.updateProductStatus(id, status);
    }
    @DeleteMapping("/batch")
    public Result<?> deleteBatch(@RequestParam List<Long> ids) {
        return productService.deleteBatch(ids);
    }
    // 获取全部商品
    @GetMapping("/all")
    public Result<?> getAllProducts(@RequestParam(required = false) Long merchantId) {
        return Result.success(productService.getProductsByPage(null, null, merchantId, null, 1, Integer.MAX_VALUE, null, null, null, null).getRecords());
    }
    @PutMapping("/batch/status")
    public Result<?> updateBatchStatus(
            @RequestParam List<Long> ids,
            @RequestParam Integer status) {
        return productService.updateBatchStatus(ids, status);
    }

    /**
     * 获取当季商品（时令推荐）
     */
    @GetMapping("/seasonal")
    public Result<?> getSeasonalProducts(
            @RequestParam(required = false) String season,
            @RequestParam(defaultValue = "8") Integer limit) {
        return productService.getSeasonalProducts(season, limit);
    }

    /**
     * 获取产地分布统计（产地地图用）
     */
    @GetMapping("/origin-stats")
    public Result<?> getOriginStats() {
        return productService.getOriginStats();
    }

    /**
     * 按产地查询商品
     */
    @GetMapping("/by-origin")
    public Result<?> getProductsByOrigin(
            @RequestParam String origin,
            @RequestParam(defaultValue = "1") Integer currentPage,
            @RequestParam(defaultValue = "10") Integer size) {
        return productService.getProductsByOrigin(origin, currentPage, size);
    }
} 
