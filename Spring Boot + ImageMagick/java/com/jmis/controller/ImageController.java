package com.imagemagick.webservice.controller;

import com.imagemagick.webservice.service.ImageMagickService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 图片处理控制器
 * 对应前端的所有API接口
 */
@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Validated
@CrossOrigin(origins = "*")
public class ImageController {

    private final ImageMagickService imageMagickService;

    /**
     * 图片压缩
     * POST /api/compress
     */
    @PostMapping("/compress")
    public ResponseEntity<Map<String, Object>> compressImage(
            @RequestParam("image") MultipartFile file,
            @RequestParam(value = "quality", defaultValue = "80") 
            @Min(value = 1, message = "质量参数必须大于等于1") 
            @Max(value = 100, message = "质量参数必须小于等于100") Integer quality) {
        
        try {
            log.info("开始压缩图片: {}, 质量: {}", file.getOriginalFilename(), quality);
            Map<String, Object> result = imageMagickService.compressImage(file, quality);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("图片压缩失败", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * 图片裁剪
     * POST /api/crop
     */
    @PostMapping("/crop")
    public ResponseEntity<Map<String, Object>> cropImage(
            @RequestParam("image") MultipartFile file,
            @RequestParam("width") @Min(value = 1, message = "宽度必须大于0") Integer width,
            @RequestParam("height") @Min(value = 1, message = "高度必须大于0") Integer height,
            @RequestParam(value = "x", defaultValue = "0") Integer x,
            @RequestParam(value = "y", defaultValue = "0") Integer y) {
        
        try {
            log.info("开始裁剪图片: {}, 尺寸: {}x{}, 偏移: ({},{})", 
                    file.getOriginalFilename(), width, height, x, y);
            Map<String, Object> result = imageMagickService.cropImage(file, width, height, x, y);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("图片裁剪失败", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * 添加文字水印
     * POST /api/watermark/text
     */
    @PostMapping("/watermark/text")
    public ResponseEntity<Map<String, Object>> addTextWatermark(
            @RequestParam("image") MultipartFile file,
            @RequestParam(value = "text", defaultValue = "Watermark") String text,
            @RequestParam(value = "position", defaultValue = "southeast") String position,
            @RequestParam(value = "fontSize", defaultValue = "24") 
            @Min(value = 8, message = "字体大小不能小于8") 
            @Max(value = 200, message = "字体大小不能大于200") Integer fontSize,
            @RequestParam(value = "color", defaultValue = "white") String color,
            @RequestParam(value = "offsetX", defaultValue = "10") Integer offsetX,
            @RequestParam(value = "offsetY", defaultValue = "10") Integer offsetY) {
        
        try {
            log.info("开始添加文字水印: {}, 文字: {}, 位置: {}", 
                    file.getOriginalFilename(), text, position);
            Map<String, Object> result = imageMagickService.addTextWatermark(
                    file, text, position, fontSize, color, offsetX, offsetY);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("添加文字水印失败", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * 调整图片尺寸
     * POST /api/resize
     */
    @PostMapping("/resize")
    public ResponseEntity<Map<String, Object>> resizeImage(
            @RequestParam("image") MultipartFile file,
            @RequestParam(value = "width", required = false) 
            @Min(value = 1, message = "宽度必须大于0") Integer width,
            @RequestParam(value = "height", required = false) 
            @Min(value = 1, message = "高度必须大于0") Integer height,
            @RequestParam(value = "maintain_ratio", defaultValue = "true") Boolean maintainRatio) {
        
        try {
            log.info("开始调整图片尺寸: {}, 新尺寸: {}x{}, 保持比例: {}", 
                    file.getOriginalFilename(), width, height, maintainRatio);
            Map<String, Object> result = imageMagickService.resizeImage(file, width, height, maintainRatio);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("调整图片尺寸失败", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * 批量处理
     * POST /api/batch
     */
    @PostMapping("/batch")
    public ResponseEntity<Map<String, Object>> batchProcess(
            @RequestParam("images") List<MultipartFile> files,
            @RequestParam("operation") String operation,
            @RequestParam(value = "quality", defaultValue = "80") 
            @Min(value = 1, message = "质量参数必须大于等于1") 
            @Max(value = 100, message = "质量参数必须小于等于100") Integer quality,
            @RequestParam(value = "width", required = false) Integer width,
            @RequestParam(value = "height", required = false) Integer height) {
        
        try {
            log.info("开始批量处理: {} 个文件, 操作: {}", files.size(), operation);
            Map<String, Object> result = imageMagickService.batchProcess(
                    files, operation, quality, width, height);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("批量处理失败", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * 获取图片信息
     * POST /api/info
     */
    @PostMapping("/info")
    public ResponseEntity<Map<String, Object>> getImageInfo(
            @RequestParam("image") MultipartFile file) {
        
        try {
            log.info("获取图片信息: {}", file.getOriginalFilename());
            Map<String, Object> result = imageMagickService.getImageInfo(file);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("获取图片信息失败", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * 健康检查
     * GET /api/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "OK");
        health.put("timestamp", System.currentTimeMillis());
        health.put("service", "ImageMagick Web Service");
        health.put("version", "1.0.0");
        
        try {
            // 测试ImageMagick是否可用
            ProcessBuilder pb = new ProcessBuilder();
            if (System.getProperty("os.name").toLowerCase().contains("win")) {
                pb.command("cmd", "/c", "convert -version");
            } else {
                pb.command("bash", "-c", "convert -version");
            }
            
            Process process = pb.start();
            boolean finished = process.waitFor(5, java.util.concurrent.TimeUnit.SECONDS);
            
            if (finished && process.exitValue() == 0) {
                health.put("imagemagick", "available");
            } else {
                health.put("imagemagick", "unavailable");
            }
        } catch (Exception e) {
            health.put("imagemagick", "error: " + e.getMessage());
        }
        
        return ResponseEntity.ok(health);
    }
}