package com.upload.service;

import com.upload.config.UploadConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class UploadService {

    private final UploadConfig uploadConfig;

    /**
     * 初始化上传会话，返回 sessionId（对应本次上传的目标根目录）
     * @param folderName 原始文件夹名称
     */
    public String initSession(String folderName) {
        String sessionId = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss_SSS"))
                + "_" + UUID.randomUUID().toString().substring(0, 6);

        Path sessionDir = Paths.get(uploadConfig.getRootPath(), sessionId, folderName);
        try {
            Files.createDirectories(sessionDir);
            log.info("Upload session created: {}", sessionDir);
        } catch (IOException e) {
            log.error("Failed to create session dir", e);
            throw new RuntimeException("无法创建上传目录: " + e.getMessage());
        }
        return sessionId;
    }

    /**
     * 上传单个文件，保留相对路径
     *
     * @param sessionId    会话ID
     * @param relativePath 文件在原始文件夹中的相对路径（含文件名），如 "subdir/file.txt"
     * @param file         文件内容
     * @return 服务器保存的绝对路径
     */
    public String uploadFile(String sessionId, String relativePath, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }

        // 安全检查：防止路径穿越
        String safePath = sanitizePath(relativePath);

        Path targetPath = Paths.get(uploadConfig.getRootPath(), sessionId, safePath);

        // 创建父目录
        Files.createDirectories(targetPath.getParent());

        // 写文件
        file.transferTo(targetPath.toFile());
        log.debug("File saved: {}", targetPath);

        return targetPath.toString();
    }

    /**
     * 获取已上传会话的目录树
     */
    public Map<String, Object> getSessionTree(String sessionId) {
        Path sessionDir = Paths.get(uploadConfig.getRootPath(), sessionId);
        if (!Files.exists(sessionDir)) {
            throw new RuntimeException("会话不存在: " + sessionId);
        }
        return buildTree(sessionDir.toFile(), sessionDir.toString());
    }

    /**
     * 删除会话（取消上传时清理）
     */
    public void deleteSession(String sessionId) throws IOException {
        Path sessionDir = Paths.get(uploadConfig.getRootPath(), sessionId);
        if (Files.exists(sessionDir)) {
            FileUtils.deleteDirectory(sessionDir.toFile());
            log.info("Session deleted: {}", sessionId);
        }
    }

    // ── 私有工具方法 ──────────────────────────────────────

    private String sanitizePath(String relativePath) {
        // 规范化分隔符
        String normalized = relativePath.replace("\\", "/");
        // 移除开头斜杠
        if (normalized.startsWith("/")) {
            normalized = normalized.substring(1);
        }
        // 防止路径穿越
        if (normalized.contains("../") || normalized.contains("..\\")) {
            throw new SecurityException("非法路径: " + relativePath);
        }
        return normalized;
    }

    private Map<String, Object> buildTree(File file, String rootPath) {
        Map<String, Object> node = new LinkedHashMap<>();
        node.put("name", file.getName());
        node.put("path", file.getAbsolutePath().substring(rootPath.length()));
        node.put("isDir", file.isDirectory());

        if (file.isDirectory()) {
            List<Map<String, Object>> children = new ArrayList<>();
            File[] files = file.listFiles();
            if (files != null) {
                Arrays.sort(files, (a, b) -> {
                    if (a.isDirectory() != b.isDirectory()) {
                        return a.isDirectory() ? -1 : 1;
                    }
                    return a.getName().compareTo(b.getName());
                });
                for (File child : files) {
                    children.add(buildTree(child, rootPath));
                }
            }
            node.put("children", children);
        } else {
            node.put("size", file.length());
        }
        return node;
    }
}
