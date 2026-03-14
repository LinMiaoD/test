package com.imagemagick.webservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.util.unit.DataSize;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import javax.servlet.MultipartConfigElement;
import java.io.File;

/**
 * ImageMagick Web服务主启动类
 * 
 * @author ImageMagick Web Service
 * @version 1.0.0
 */
@SpringBootApplication
public class ImageMagickWebServiceApplication {

    public static void main(String[] args) {
        // 创建必要的目录
        createDirectories();
        
        SpringApplication.run(ImageMagickWebServiceApplication.class, args);
        System.out.println("=================================");
        System.out.println("ImageMagick Web服务启动成功!");
        System.out.println("访问地址: http://localhost:8080");
        System.out.println("健康检查: http://localhost:8080/actuator/health");
        System.out.println("=================================");
    }

    /**
     * 创建必要的目录
     */
    private static void createDirectories() {
        String[] dirs = {"uploads", "output", "static"};
        for (String dir : dirs) {
            File directory = new File(dir);
            if (!directory.exists()) {
                boolean created = directory.mkdirs();
                if (created) {
                    System.out.println("创建目录: " + dir);
                }
            }
        }
    }

    /**
     * 配置文件上传
     */
    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();
        // 文件大小限制 50MB
        factory.setMaxFileSize(DataSize.ofMegabytes(50));
        // 请求大小限制 100MB
        factory.setMaxRequestSize(DataSize.ofMegabytes(100));
        return factory.createMultipartConfig();
    }

    /**
     * Web配置
     */
    @Bean
    public WebMvcConfigurer webMvcConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                // 配置CORS跨域
                registry.addMapping("/**")
                        .allowedOriginPatterns("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true)
                        .maxAge(3600);
            }

            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                // 静态资源映射
                registry.addResourceHandler("/output/**")
                        .addResourceLocations("file:output/");
                        
                registry.addResourceHandler("/static/**")
                        .addResourceLocations("classpath:/static/");
                        
                registry.addResourceHandler("/**")
                        .addResourceLocations("classpath:/static/");
            }
        };
    }
}