package com.upload.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Data;

@Data
@Configuration
@ConfigurationProperties(prefix = "upload")
public class UploadConfig {
    private String rootPath = "/tmp/uploads";
    private int maxConcurrent = 5;
}
