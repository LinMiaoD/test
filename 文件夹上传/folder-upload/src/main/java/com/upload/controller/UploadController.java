package com.upload.controller;

import com.upload.config.ApiResult;
import com.upload.service.UploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final UploadService uploadService;

    /**
     * 初始化上传会话
     * POST /api/upload/init
     * Body: { "folderName": "myFolder" }
     */
    @PostMapping("/init")
    public ApiResult<Map<String, String>> init(@RequestBody Map<String, String> body) {
        String folderName = body.getOrDefault("folderName", "upload_" + System.currentTimeMillis());
        try {
            String sessionId = uploadService.initSession(folderName);
            Map<String, String> data = new HashMap<>();
            data.put("sessionId", sessionId);
            data.put("folderName", folderName);
            return ApiResult.ok("会话创建成功", data);
        } catch (Exception e) {
            log.error("Init session failed", e);
            return ApiResult.fail("初始化失败: " + e.getMessage());
        }
    }

    /**
     * 上传单个文件（前端逐文件调用）
     * POST /api/upload/file
     * Form: sessionId, relativePath, file
     */
    @PostMapping("/file")
    public ApiResult<Map<String, Object>> uploadFile(
            @RequestParam("sessionId") String sessionId,
            @RequestParam("relativePath") String relativePath,
            @RequestParam("file") MultipartFile file) {

        try {
            String savedPath = uploadService.uploadFile(sessionId, relativePath, file);

            Map<String, Object> data = new HashMap<>();
            data.put("relativePath", relativePath);
            data.put("savedPath", savedPath);
            data.put("size", file.getSize());
            data.put("originalName", file.getOriginalFilename());

            return ApiResult.ok("上传成功", data);
        } catch (SecurityException e) {
            log.warn("Security violation: {}", e.getMessage());
            return ApiResult.fail("路径非法: " + e.getMessage());
        } catch (Exception e) {
            log.error("File upload failed: relativePath={}", relativePath, e);
            return ApiResult.fail("上传失败: " + e.getMessage());
        }
    }

    /**
     * 获取已上传的目录树
     * GET /api/upload/tree/{sessionId}
     */
    @GetMapping("/tree/{sessionId}")
    public ApiResult<Map<String, Object>> getTree(@PathVariable String sessionId) {
        try {
            Map<String, Object> tree = uploadService.getSessionTree(sessionId);
            return ApiResult.ok(tree);
        } catch (Exception e) {
            log.error("Get tree failed: sessionId={}", sessionId, e);
            return ApiResult.fail("获取目录树失败: " + e.getMessage());
        }
    }

    /**
     * 取消上传，清理临时目录
     * DELETE /api/upload/session/{sessionId}
     */
    @DeleteMapping("/session/{sessionId}")
    public ApiResult<Void> cancelSession(@PathVariable String sessionId) {
        try {
            uploadService.deleteSession(sessionId);
            return ApiResult.ok("已取消并清理", null);
        } catch (Exception e) {
            log.error("Delete session failed: sessionId={}", sessionId, e);
            return ApiResult.fail("清理失败: " + e.getMessage());
        }
    }
}
