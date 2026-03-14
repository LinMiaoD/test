package com.imagemagick.webservice.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * ImageMagick图片处理服务
 */
@Slf4j
@Service
public class ImageMagickService {

    private static final String UPLOADS_DIR = "uploads";
    private static final String OUTPUT_DIR = "output";
    private static final int COMMAND_TIMEOUT_SECONDS = 300;
    
    // 支持的图片格式
    private static final Set<String> SUPPORTED_FORMATS = new HashSet<>(Arrays.asList(
            "jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff", "svg"
    ));

    /**
     * 压缩图片
     */
    public Map<String, Object> compressImage(MultipartFile file, Integer quality) throws Exception {
        validateImageFile(file);
        
        String inputPath = saveUploadedFile(file);
        String outputFilename = "compressed_" + generateUniqueFilename(file.getOriginalFilename());
        String outputPath = OUTPUT_DIR + File.separator + outputFilename;
        
        try {
            // 构建ImageMagick命令
            String command = String.format("convert \"%s\" -quality %d \"%s\"", 
                    inputPath, quality != null ? quality : 80, outputPath);
            
            executeImageMagickCommand(command);
            
            // 删除临时文件
            deleteFile(inputPath);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "图片压缩完成");
            result.put("downloadUrl", "/output/" + outputFilename);
            result.put("filename", outputFilename);
            
            return result;
            
        } catch (Exception e) {
            deleteFile(inputPath);
            deleteFile(outputPath);
            throw e;
        }
    }

    /**
     * 裁剪图片
     */
    public Map<String, Object> cropImage(MultipartFile file, Integer width, Integer height, 
                                       Integer x, Integer y) throws Exception {
        validateImageFile(file);
        
        if (width == null || height == null || width <= 0 || height <= 0) {
            throw new IllegalArgumentException("宽度和高度必须大于0");
        }
        
        String inputPath = saveUploadedFile(file);
        String outputFilename = "cropped_" + generateUniqueFilename(file.getOriginalFilename());
        String outputPath = OUTPUT_DIR + File.separator + outputFilename;
        
        try {
            int offsetX = x != null ? x : 0;
            int offsetY = y != null ? y : 0;
            
            String command = String.format("convert \"%s\" -crop %dx%d+%d+%d \"%s\"",
                    inputPath, width, height, offsetX, offsetY, outputPath);
            
            executeImageMagickCommand(command);
            deleteFile(inputPath);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "图片裁剪完成");
            result.put("downloadUrl", "/output/" + outputFilename);
            result.put("filename", outputFilename);
            
            return result;
            
        } catch (Exception e) {
            deleteFile(inputPath);
            deleteFile(outputPath);
            throw e;
        }
    }

    /**
     * 添加文字水印
     */
    public Map<String, Object> addTextWatermark(MultipartFile file, String text, String position,
                                              Integer fontSize, String color, Integer offsetX, 
                                              Integer offsetY) throws Exception {
        validateImageFile(file);
        
        String inputPath = saveUploadedFile(file);
        String outputFilename = "watermarked_" + generateUniqueFilename(file.getOriginalFilename());
        String outputPath = OUTPUT_DIR + File.separator + outputFilename;
        
        try {
            String watermarkText = StringUtils.isBlank(text) ? "Watermark" : text;
            String gravity = StringUtils.isBlank(position) ? "southeast" : position;
            int fontsize = fontSize != null ? fontSize : 24;
            String fontColor = StringUtils.isBlank(color) ? "white" : color;
            int xOffset = offsetX != null ? offsetX : 10;
            int yOffset = offsetY != null ? offsetY : 10;
            
            String command = String.format(
                    "convert \"%s\" -pointsize %d -fill \"%s\" -gravity %s -annotate +%d+%d \"%s\" \"%s\"",
                    inputPath, fontsize, fontColor, gravity, xOffset, yOffset, watermarkText, outputPath);
            
            executeImageMagickCommand(command);
            deleteFile(inputPath);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "文字水印添加完成");
            result.put("downloadUrl", "/output/" + outputFilename);
            result.put("filename", outputFilename);
            
            return result;
            
        } catch (Exception e) {
            deleteFile(inputPath);
            deleteFile(outputPath);
            throw e;
        }
    }

    /**
     * 调整图片尺寸
     */
    public Map<String, Object> resizeImage(MultipartFile file, Integer width, Integer height, 
                                         Boolean maintainRatio) throws Exception {
        validateImageFile(file);
        
        if (width == null && height == null) {
            throw new IllegalArgumentException("至少需要提供宽度或高度");
        }
        
        String inputPath = saveUploadedFile(file);
        String outputFilename = "resized_" + generateUniqueFilename(file.getOriginalFilename());
        String outputPath = OUTPUT_DIR + File.separator + outputFilename;
        
        try {
            String sizeParam;
            boolean maintain = maintainRatio != null ? maintainRatio : true;
            
            if (width != null && height != null) {
                if (maintain) {
                    sizeParam = width + "x" + height;
                } else {
                    sizeParam = width + "x" + height + "!";
                }
            } else if (width != null) {
                sizeParam = width + "x";
            } else {
                sizeParam = "x" + height;
            }
            
            String command = String.format("convert \"%s\" -resize %s \"%s\"",
                    inputPath, sizeParam, outputPath);
            
            executeImageMagickCommand(command);
            deleteFile(inputPath);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "图片尺寸调整完成");
            result.put("downloadUrl", "/output/" + outputFilename);
            result.put("filename", outputFilename);
            
            return result;
            
        } catch (Exception e) {
            deleteFile(inputPath);
            deleteFile(outputPath);
            throw e;
        }
    }

    /**
     * 批量处理图片
     */
    public Map<String, Object> batchProcess(List<MultipartFile> files, String operation, 
                                          Integer quality, Integer width, Integer height) throws Exception {
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("请上传图片文件");
        }
        
        if (files.size() > 10) {
            throw new IllegalArgumentException("批量处理最多支持10个文件");
        }
        
        List<Map<String, Object>> results = new ArrayList<>();
        
        for (MultipartFile file : files) {
            Map<String, Object> result = new HashMap<>();
            result.put("original", file.getOriginalFilename());
            
            try {
                validateImageFile(file);
                
                Map<String, Object> processResult;
                if ("compress".equals(operation)) {
                    processResult = compressImage(file, quality);
                } else if ("resize".equals(operation)) {
                    processResult = resizeImage(file, width, height, true);
                } else {
                    throw new IllegalArgumentException("不支持的操作类型: " + operation);
                }
                
                result.put("success", true);
                result.put("processed", processResult.get("filename"));
                result.put("downloadUrl", processResult.get("downloadUrl"));
                
            } catch (Exception e) {
                result.put("success", false);
                result.put("error", e.getMessage());
                log.error("批量处理文件失败: " + file.getOriginalFilename(), e);
            }
            
            results.add(result);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "批量处理完成");
        response.put("results", results);
        
        return response;
    }

    /**
     * 获取图片信息
     */
    public Map<String, Object> getImageInfo(MultipartFile file) throws Exception {
        validateImageFile(file);
        
        String inputPath = saveUploadedFile(file);
        
        try {
            String command = String.format("identify -verbose \"%s\"", inputPath);
            String output = executeImageMagickCommand(command);
            
            deleteFile(inputPath);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("info", output);
            
            return result;
            
        } catch (Exception e) {
            deleteFile(inputPath);
            throw e;
        }
    }

    /**
     * 验证图片文件
     */
    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("请上传图片文件");
        }
        
        String originalFilename = file.getOriginalFilename();
        if (StringUtils.isBlank(originalFilename)) {
            throw new IllegalArgumentException("文件名不能为空");
        }
        
        String extension = FilenameUtils.getExtension(originalFilename).toLowerCase();
        if (!SUPPORTED_FORMATS.contains(extension)) {
            throw new IllegalArgumentException("不支持的文件格式，支持格式: " + SUPPORTED_FORMATS);
        }
        
        // 文件大小限制 (50MB)
        if (file.getSize() > 50 * 1024 * 1024) {
            throw new IllegalArgumentException("文件大小不能超过50MB");
        }
    }

    /**
     * 保存上传的文件
     */
    private String saveUploadedFile(MultipartFile file) throws IOException {
        String filename = generateUniqueFilename(file.getOriginalFilename());
        String filePath = UPLOADS_DIR + File.separator + filename;
        
        Path uploadPath = Paths.get(filePath);
        Files.createDirectories(uploadPath.getParent());
        Files.write(uploadPath, file.getBytes());
        
        return filePath;
    }

    /**
     * 生成唯一文件名
     */
    private String generateUniqueFilename(String originalFilename) {
        String extension = FilenameUtils.getExtension(originalFilename);
        String uuid = UUID.randomUUID().toString().replace("-", "");
        return uuid + "." + extension;
    }

    /**
     * 执行ImageMagick命令
     */
    private String executeImageMagickCommand(String command) throws Exception {
        log.info("执行ImageMagick命令: {}", command);
        
        ProcessBuilder processBuilder = new ProcessBuilder();
        
        // 设置命令 - 兼容Windows和Linux
        if (System.getProperty("os.name").toLowerCase().contains("win")) {
            processBuilder.command("cmd", "/c", command);
        } else {
            processBuilder.command("bash", "-c", command);
        }
        
        processBuilder.redirectErrorStream(true);
        Process process = processBuilder.start();
        
        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream(), "UTF-8"))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }
        
        boolean finished = process.waitFor(COMMAND_TIMEOUT_SECONDS, TimeUnit.SECONDS);
        if (!finished) {
            process.destroyForcibly();
            throw new RuntimeException("ImageMagick命令执行超时");
        }
        
        int exitCode = process.exitValue();
        if (exitCode != 0) {
            String errorMsg = "ImageMagick命令执行失败，退出码: " + exitCode + 
                    ", 输出: " + output.toString();
            log.error(errorMsg);
            throw new RuntimeException(errorMsg);
        }
        
        return output.toString();
    }

    /**
     * 删除文件
     */
    private void deleteFile(String filePath) {
        if (StringUtils.isNotBlank(filePath)) {
            try {
                File file = new File(filePath);
                if (file.exists()) {
                    boolean deleted = file.delete();
                    if (deleted) {
                        log.debug("删除文件: {}", filePath);
                    }
                }
            } catch (Exception e) {
                log.warn("删除文件失败: {}", filePath, e);
            }
        }
    }
}