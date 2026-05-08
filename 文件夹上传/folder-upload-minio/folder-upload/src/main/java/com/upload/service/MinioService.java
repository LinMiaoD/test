package com.upload.service;

import com.upload.config.MinioConfig;
import com.upload.config.UploadProperties;
import com.upload.model.FileUploadResult;
import io.minio.*;
import io.minio.errors.ErrorResponseException;
import io.minio.messages.Item;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class MinioService {

    private final MinioClient minioClient;
    private final MinioConfig.MinioProperties minioProps;
    private final UploadProperties uploadProps;

    // ── 秒传检查 ──────────────────────────────────────────

    /**
     * 前端在上传前先发文件 MD5，查询 OSS 是否已存在相同对象。
     * 若存在，直接返回已有的 ossKey，实现秒传。
     *
     * @param md5          文件 MD5（前端 SparkMD5 计算）
     * @param sessionId    本次会话
     * @param relativePath 相对路径
     * @return null 表示不存在，需要正常上传；非 null 表示命中秒传
     */
    public String checkInstant(String md5, String sessionId, String relativePath) {
        // 用 md5 作为 OSS 对象的 tag 查找已有对象
        // 简化实现：以 md5 为文件名在 md5index/ 下记录映射
        String indexKey = "md5index/" + md5;
        try {
            StatObjectResponse stat = minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(minioProps.getBucket())
                            .object(indexKey)
                            .build()
            );
            // 取出已存储的 ossKey
            Map<String, String> tags = stat.userMetadata();
            return tags.getOrDefault("x-amz-meta-osskey", null);
        } catch (ErrorResponseException e) {
            if ("NoSuchKey".equals(e.errorResponse().code())) {
                return null; // 不存在
            }
            log.warn("statObject error for md5={}: {}", md5, e.getMessage());
            return null;
        } catch (Exception e) {
            log.warn("checkInstant error: {}", e.getMessage());
            return null;
        }
    }

    // ── 上传文件 ──────────────────────────────────────────

    /**
     * 上传单个文件到 MinIO，同时写入 md5index 用于后续秒传。 C:\Users\Administrator\Desktop\学习资料\learning-notes-programming\文件夹上传\folder-upload-minio\folder-upload\frontend\index.html
     */
    public FileUploadResult upload(String sessionId,
                                   String relativePath,
                                   MultipartFile file) throws Exception {
        // 1. 计算 MD5
        byte[] bytes = file.getBytes();
        String md5 = DigestUtils.md5Hex(bytes);

        // 2. 先检查秒传
        String existingKey = checkInstant(md5, sessionId, relativePath);
        if (existingKey != null) {
            log.info("Instant hit: relativePath={} md5={}", relativePath, md5);
            return FileUploadResult.builder()
                    .ossKey(existingKey)
                    .relativePath(relativePath)
                    .size(file.getSize())
                    .instant(true)
                    .md5(md5)
                    .build();
        }

        // 3. 安全检查
        validatePath(relativePath);

        // 4. 构造 OSS key：prefix/sessionId/相对路径
        String ossKey = buildOssKey(sessionId, relativePath);

        // 5. 上传到 MinIO
        try (InputStream is = file.getInputStream()) {
            Map<String, String> userMeta = new HashMap<>();
            userMeta.put("relative-path", relativePath);
            userMeta.put("session-id", sessionId);
            userMeta.put("md5", md5);

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(minioProps.getBucket())
                            .object(ossKey)
                            .stream(is, bytes.length, -1)
                            .contentType(file.getContentType())
                            .userMetadata(userMeta)
                            .build()
            );
        }

        // 6. 写 md5index（value 存 ossKey，方便秒传查找）
        writeMd5Index(md5, ossKey);

        log.info("Uploaded: ossKey={} size={} md5={}", ossKey, file.getSize(), md5);

        return FileUploadResult.builder()
                .ossKey(ossKey)
                .relativePath(relativePath)
                .size(file.getSize())
                .instant(false)
                .md5(md5)
                .build();
    }

    // ── 获取目录树 ────────────────────────────────────────

    /**
     * 列出 sessionId 下所有对象，组装成树形结构。
     */
    public Map<String, Object> getSessionTree(String sessionId) {
        String prefix = buildSessionPrefix(sessionId) + "/";
        Iterable<Result<Item>> results = minioClient.listObjects(
                ListObjectsArgs.builder()
                        .bucket(minioProps.getBucket())
                        .prefix(prefix)
                        .recursive(true)
                        .build()
        );

        // 收集所有文件路径和大小
        Map<String, Long> fileMap = new LinkedHashMap<>();
        try {
            for (Result<Item> r : results) {
                Item item = r.get();
                if (!item.isDir()) {
                    String key = item.objectName();
                    // 去掉 prefix，只保留相对路径
                    String rel = key.startsWith(prefix) ? key.substring(prefix.length()) : key;
                    fileMap.put(rel, item.size());
                }
            }
        } catch (Exception e) {
            log.error("listObjects error: {}", e.getMessage());
        }

        return buildTree(fileMap);
    }

    // ── 删除 session 下所有对象 ───────────────────────────
    public void deleteSession(String sessionId) {
        String prefix = buildSessionPrefix(sessionId) + "/";
        Iterable<Result<Item>> results = minioClient.listObjects(
                ListObjectsArgs.builder()
                        .bucket(minioProps.getBucket())
                        .prefix(prefix)
                        .recursive(true)
                        .build()
        );
        try {
            for (Result<Item> r : results) {
                String key = r.get().objectName();
                minioClient.removeObject(
                        RemoveObjectArgs.builder()
                                .bucket(minioProps.getBucket())
                                .object(key)
                                .build()
                );
                log.debug("Removed: {}", key);
            }
            log.info("Session deleted: {}", sessionId);
        } catch (Exception e) {
            log.error("deleteSession error: {}", e.getMessage());
        }
    }

    // ── 获取会话文件URL列表 ────────────────────────────────

    /**
     * 获取会话下所有文件的URL列表
     */
    public List<Map<String, String>> getSessionFiles(String sessionId) {
        String prefix = buildSessionPrefix(sessionId) + "/";
        List<Map<String, String>> files = new ArrayList<>();

        try {
            Iterable<Result<Item>> results = minioClient.listObjects(
                    ListObjectsArgs.builder()
                            .bucket(minioProps.getBucket())
                            .prefix(prefix)
                            .recursive(true)
                            .build()
            );

            for (Result<Item> r : results) {
                Item item = r.get();
                if (!item.isDir()) {
                    String key = item.objectName();
                    // 相对路径（去掉prefix）
                    String relPath = key.startsWith(prefix) ? key.substring(prefix.length()) : key;
                    // 构建完整的访问URL
                    String fileUrl = buildFileUrl(key);

                    Map<String, String> fileInfo = new HashMap<>();
                    fileInfo.put("relativePath", relPath);
                    fileInfo.put("ossKey", key);
                    fileInfo.put("url", fileUrl);
                    fileInfo.put("size", String.valueOf(item.size()));
                    files.add(fileInfo);
                }
            }
        } catch (Exception e) {
            log.error("getSessionFiles error: {}", e.getMessage());
        }
        return files;
    }

    /**
     * 构建文件访问URL
     */
    private String buildFileUrl(String ossKey) {
        String endpoint = minioProps.getEndpoint();
        String bucket = minioProps.getBucket();
//        return String.format("%s/%s/%s", endpoint, bucket, ossKey);
        return String.format("/%s", ossKey);
    }

    // ── 私有工具 ──────────────────────────────────────────

    private String buildOssKey(String sessionId, String relativePath) {
        String safe = relativePath.replace("\\", "/");
        if (safe.startsWith("/")) safe = safe.substring(1);
        String prefix = uploadProps.getOssPrefix();
        return (prefix.isEmpty() ? "" : prefix + "/") + sessionId + "/" + safe;
    }

    private String buildSessionPrefix(String sessionId) {
        String prefix = uploadProps.getOssPrefix();
        return (prefix.isEmpty() ? "" : prefix + "/") + sessionId;
    }

    private void writeMd5Index(String md5, String ossKey) {
        try {
            String indexKey = "md5index/" + md5;
            Map<String, String> meta = new HashMap<>();
            meta.put("x-amz-meta-osskey", ossKey);
            byte[] empty = new byte[0];
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(minioProps.getBucket())
                            .object(indexKey)
                            .stream(new java.io.ByteArrayInputStream(empty), 0, -1)
                            .userMetadata(meta)
                            .build()
            );
        } catch (Exception e) {
            log.warn("writeMd5Index failed for md5={}: {}", md5, e.getMessage());
        }
    }

    private void validatePath(String relativePath) {
        String normalized = relativePath.replace("\\", "/");
        if (normalized.contains("../") || normalized.contains("..\\")) {
            throw new SecurityException("非法路径: " + relativePath);
        }
    }

    /**
     * 将平铺的 relativePath->size 映射组装成嵌套树。
     */
    private Map<String, Object> buildTree(Map<String, Long> fileMap) {
        // 虚拟根节点
        Map<String, Object> root = new LinkedHashMap<>();
        root.put("name", "root");
        root.put("isDir", true);
        root.put("children", new ArrayList<Map<String, Object>>());

        for (Map.Entry<String, Long> entry : fileMap.entrySet()) {
            String[] parts = entry.getKey().split("/");
            insertNode(root, parts, 0, entry.getValue());
        }
        return root;
    }

    @SuppressWarnings("unchecked")
    private void insertNode(Map<String, Object> parent, String[] parts, int depth, long size) {
        if (depth >= parts.length) return;
        List<Map<String, Object>> children = (List<Map<String, Object>>) parent.get("children");
        String name = parts[depth];
        boolean isLast = (depth == parts.length - 1);

        // 查找已存在的节点
        Map<String, Object> node = null;
        for (Map<String, Object> c : children) {
            if (name.equals(c.get("name"))) {
                node = c;
                break;
            }
        }

        if (node == null) {
            node = new LinkedHashMap<>();
            node.put("name", name);
            if (isLast) {
                node.put("isDir", false);
                node.put("size", size);
            } else {
                node.put("isDir", true);
                node.put("children", new ArrayList<Map<String, Object>>());
            }
            children.add(node);
        }

        if (!isLast) {
            insertNode(node, parts, depth + 1, size);
        }
    }
}
