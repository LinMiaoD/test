package com.upload.controller;

import com.upload.model.FileUploadResult;
import com.upload.model.R;
import com.upload.service.MinioService;
import com.upload.service.ValidationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final MinioService       minioService;
    private final ValidationService  validationService;

    // ── 1. 初始化会话 ─────────────────────────────────────
    /**
     * POST /api/upload/init
     * Body: { "folderName": "myFolder" }
     */
    @PostMapping("/init")
    public R<Map<String, String>> init(@RequestBody Map<String, String> body) {
        String folderName = body.getOrDefault("folderName", "upload");
        String sessionId  = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"))
                + "_" + UUID.randomUUID().toString().substring(0, 6);

        Map<String, String> data = new HashMap<>();
        data.put("sessionId",  sessionId);
        data.put("folderName", folderName);
        log.info("Session init: sessionId={} folder={}", sessionId, folderName);
        return R.ok("会话创建成功", data);
    }

    // ── 2. 秒传检查 ───────────────────────────────────────
    /**
     * POST /api/upload/check
     * Body: { "md5": "xxx", "sessionId": "yyy", "relativePath": "folder/sub/file.txt" }
     */
    @PostMapping("/check")
    public R<Map<String, Object>> check(@RequestBody Map<String, String> body) {
        String md5          = body.get("md5");
        String sessionId    = body.get("sessionId");
        String relativePath = body.get("relativePath");

        if (md5 == null || md5.isEmpty()) {
            return R.fail("md5 不能为空");
        }

        String existingKey = minioService.checkInstant(md5, sessionId, relativePath);
        Map<String, Object> data = new HashMap<>();
        data.put("instant", existingKey != null);
        data.put("ossKey",  existingKey);
        return R.ok(data);
    }

    // ── 3. 上传单文件 ─────────────────────────────────────
    /**
     * POST /api/upload/file
     * Form: sessionId, relativePath, file
     */
    @PostMapping("/file")
    public R<FileUploadResult> uploadFile(
            @RequestParam("sessionId")    String sessionId,
            @RequestParam("relativePath") String relativePath,
            @RequestParam("file")         MultipartFile file) {
        try {
            // 校验
            validationService.validate(file, relativePath);

            // 上传（含秒传逻辑）
            FileUploadResult result = minioService.upload(sessionId, relativePath, file);
            return R.ok(result.isInstant() ? "秒传成功" : "上传成功", result);

        } catch (IllegalArgumentException e) {
            log.warn("Validation failed: {}", e.getMessage());
            return R.fail(e.getMessage());
        } catch (SecurityException e) {
            log.warn("Security violation: {}", e.getMessage());
            return R.fail("路径非法");
        } catch (Exception e) {
            log.error("Upload failed: relativePath={}", relativePath, e);
            return R.fail("上传失败: " + e.getMessage());
        }
    }

    // ── 4. 获取目录树 ─────────────────────────────────────
    /**
     * GET /api/upload/tree/{sessionId}
     */
    @GetMapping("/tree/{sessionId}")
    public R<Map<String, Object>> getTree(@PathVariable String sessionId) {
        try {
            Map<String, Object> tree = minioService.getSessionTree(sessionId);
            return R.ok(tree);
        } catch (Exception e) {
            log.error("getTree failed: sessionId={}", sessionId, e);
            return R.fail("获取目录树失败: " + e.getMessage());
        }
    }

    // ── 5. 取消上传（清理 OSS） ───────────────────────────
    /**
     * DELETE /api/upload/session/{sessionId}
     */
    @DeleteMapping("/session/{sessionId}")
    public R<Void> cancel(@PathVariable String sessionId) {
        try {
            minioService.deleteSession(sessionId);
            return R.ok("已取消并清理 OSS 对象", null);
        } catch (Exception e) {
            log.error("cancel failed: sessionId={}", sessionId, e);
            return R.fail("清理失败: " + e.getMessage());
        }
    }

    // ── 6. 获取上传文件URL列表 ───────────────────────────
    /**
     * GET /api/upload/files/{sessionId}
     */
    @GetMapping("/files/{sessionId}")
    public R<List<Map<String, String>>> getFileUrls(@PathVariable String sessionId) {
        try {
            List<Map<String, String>> files = minioService.getSessionFiles(sessionId);
            return R.ok(files);
        } catch (Exception e) {
            log.error("getFileUrls failed: sessionId={}", sessionId, e);
            return R.fail("获取文件列表失败: " + e.getMessage());
        }
    }
}
