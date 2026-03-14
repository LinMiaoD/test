package com.imagemagick.webservice.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * 静态文件控制器
 * 提供前端页面访问
 */
@Slf4j
@Controller
public class StaticController {

    /**
     * 主页面
     * GET /
     */
    @GetMapping("/")
    @ResponseBody
    public ResponseEntity<String> index(HttpServletResponse response) {
        try {
            ClassPathResource resource = new ClassPathResource("static/index.html");
            if (resource.exists()) {
                String content = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
                return ResponseEntity.ok()
                        .contentType(MediaType.TEXT_HTML)
                        .body(content);
            } else {
                // 如果没有找到HTML文件，返回简单的默认页面
                return ResponseEntity.ok()
                        .contentType(MediaType.TEXT_HTML)
                        .body(getDefaultHtml());
            }
        } catch (IOException e) {
            log.error("读取主页面失败", e);
            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .body(getErrorHtml());
        }
    }

    /**
     * 获取默认HTML页面
     */
    private String getDefaultHtml() {
        return "<!DOCTYPE html>\n" +
                "<html lang=\"zh-CN\">\n" +
                "<head>\n" +
                "    <meta charset=\"UTF-8\">\n" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "    <title>ImageMagick 图片处理服务</title>\n" +
                "    <style>\n" +
                "        body { font-family: Arial, sans-serif; text-align: center; margin: 50px; }\n" +
                "        .container { max-width: 800px; margin: 0 auto; }\n" +
                "        h1 { color: #333; }\n" +
                "        .api-list { text-align: left; background: #f5f5f5; padding: 20px; border-radius: 8px; }\n" +
                "        .api-item { margin: 10px 0; font-family: monospace; }\n" +
                "        .status { color: #28a745; font-weight: bold; }\n" +
                "    </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "    <div class=\"container\">\n" +
                "        <h1>🎨 ImageMagick 图片处理服务</h1>\n" +
                "        <p class=\"status\">✅ 服务运行正常</p>\n" +
                "        <p>专业的在线图片压缩、裁剪、水印处理工具</p>\n" +
                "        \n" +
                "        <h3>📡 API 接口列表</h3>\n" +
                "        <div class=\"api-list\">\n" +
                "            <div class=\"api-item\"><strong>POST</strong> /api/compress - 图片压缩</div>\n" +
                "            <div class=\"api-item\"><strong>POST</strong> /api/crop - 图片裁剪</div>\n" +
                "            <div class=\"api-item\"><strong>POST</strong> /api/watermark/text - 添加文字水印</div>\n" +
                "            <div class=\"api-item\"><strong>POST</strong> /api/resize - 调整图片尺寸</div>\n" +
                "            <div class=\"api-item\"><strong>POST</strong> /api/batch - 批量处理</div>\n" +
                "            <div class=\"api-item\"><strong>POST</strong> /api/info - 获取图片信息</div>\n" +
                "            <div class=\"api-item\"><strong>GET</strong> /api/health - 健康检查</div>\n" +
                "        </div>\n" +
                "        \n" +
                "        <h3>📋 使用说明</h3>\n" +
                "        <p>1. 将前端HTML文件放置到 <code>src/main/resources/static/index.html</code></p>\n" +
                "        <p>2. 重新启动应用即可看到完整的Web界面</p>\n" +
                "        <p>3. 或者直接使用API接口进行图片处理</p>\n" +
                "        \n" +
                "        <p><a href=\"/api/health\">🔍 检查服务状态</a></p>\n" +
                "    </div>\n" +
                "</body>\n" +
                "</html>";
    }

    /**
     * 获取错误页面
     */
    private String getErrorHtml() {
        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "    <title>ImageMagick 图片处理服务</title>\n" +
                "    <meta charset=\"UTF-8\">\n" +
                "</head>\n" +
                "<body>\n" +
                "    <h1>ImageMagick 图片处理服务</h1>\n" +
                "    <p>❌ 页面加载出错，但API服务正常运行</p>\n" +
                "    <p><a href=\"/api/health\">检查服务状态</a></p>\n" +
                "</body>\n" +
                "</html>";
    }
}