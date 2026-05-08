package com.upload.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FileUploadResult {
    /** 文件在 OSS 中的完整 key */
    private String ossKey;
    /** 相对路径（保留目录结构） */
    private String relativePath;
    /** 文件大小 */
    private long   size;
    /** 是否命中秒传 */
    private boolean instant;
    /** 文件 MD5 */
    private String md5;
}
