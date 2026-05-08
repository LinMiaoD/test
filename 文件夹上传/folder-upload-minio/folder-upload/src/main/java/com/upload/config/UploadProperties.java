package com.upload.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@Configuration
@ConfigurationProperties(prefix = "upload")
public class UploadProperties {

    private long maxFileSize = 104857600L; // 100MB

    private List<String> forbiddenExtensions = Arrays.asList(
            "exe", "bat", "cmd", "sh", "ps1", "jar", "war", "php", "jsp"
    );

    private String ossPrefix = "uploads";

    public Set<String> getForbiddenSet() {
        return new HashSet<>(forbiddenExtensions);
    }
}
