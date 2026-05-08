package com.upload.service;

import com.upload.config.UploadProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ValidationService {

    private final UploadProperties props;

    public void validate(MultipartFile file, String relativePath) {
        // 1. 大小校验
        if (file.getSize() > props.getMaxFileSize()) {
            throw new IllegalArgumentException(
                    String.format("文件超出限制: %s (%.1f MB > %.1f MB)",
                            file.getOriginalFilename(),
                            file.getSize() / 1048576.0,
                            props.getMaxFileSize() / 1048576.0)
            );
        }

        // 2. 扩展名黑名单
        String ext = getExtension(relativePath);
        if (!ext.isEmpty() && props.getForbiddenSet().contains(ext.toLowerCase())) {
            throw new IllegalArgumentException("禁止上传该类型文件: ." + ext);
        }

        // 3. 空文件
        if (file.isEmpty()) {
            throw new IllegalArgumentException("不允许上传空文件: " + relativePath);
        }
    }

    private String getExtension(String path) {
        String name = path.contains("/") ? path.substring(path.lastIndexOf('/') + 1) : path;
        int dot = name.lastIndexOf('.');
        return dot >= 0 ? name.substring(dot + 1) : "";
    }
}
