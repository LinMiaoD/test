package com.example.multi.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.multi.common.Result;
import com.example.multi.entity.mysql.User;
import com.example.multi.service.mysql.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 用户控制器（MySQL）
 * 
 * @author system
 * @date 2024-11-13
 */
@Slf4j
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * 分页查询用户
     */
    @GetMapping("/page")
    public Result<Page<User>> page(
            @RequestParam(defaultValue = "1") Long current,
            @RequestParam(defaultValue = "10") Long size,
            @RequestParam(required = false) String username) {
        
        log.info("分页查询用户，页码: {}, 每页数量: {}, 用户名: {}", current, size, username);
        
        try {
            Page<User> page = userService.pageUsers(current, size, username);
            return Result.success(page);
        } catch (Exception e) {
            log.error("分页查询用户失败", e);
            return Result.fail("查询失败: " + e.getMessage());
        }
    }

    /**
     * 根据ID查询用户
     */
    @GetMapping("/{id}")
    public Result<User> getById(@PathVariable Long id) {
        log.info("根据ID查询用户，ID: {}", id);
        
        try {
            User user = userService.getById(id);
            if (user == null) {
                return Result.fail("用户不存在");
            }
            return Result.success(user);
        } catch (Exception e) {
            log.error("查询用户失败", e);
            return Result.fail("查询失败: " + e.getMessage());
        }
    }

    /**
     * 根据用户名查询用户
     */
    @GetMapping("/username/{username}")
    public Result<User> getByUsername(@PathVariable String username) {
        log.info("根据用户名查询用户，用户名: {}", username);
        
        try {
            User user = userService.getByUsername(username);
            if (user == null) {
                return Result.fail("用户不存在");
            }
            return Result.success(user);
        } catch (Exception e) {
            log.error("查询用户失败", e);
            return Result.fail("查询失败: " + e.getMessage());
        }
    }

    /**
     * 查询所有启用的用户
     */
    @GetMapping("/enabled")
    public Result<List<User>> listEnabled() {
        log.info("查询所有启用的用户");
        
        try {
            List<User> users = userService.listEnabledUsers();
            return Result.success(users);
        } catch (Exception e) {
            log.error("查询启用用户失败", e);
            return Result.fail("查询失败: " + e.getMessage());
        }
    }

    /**
     * 创建用户
     */
    @PostMapping
    public Result<String> create(@Validated @RequestBody User user) {
        log.info("创建用户: {}", user);
        
        try {
            boolean result = userService.createUser(user);
            return result ? Result.success("创建成功") : Result.fail("创建失败");
        } catch (Exception e) {
            log.error("创建用户失败", e);
            return Result.fail("创建失败: " + e.getMessage());
        }
    }

    /**
     * 更新用户
     */
    @PutMapping
    public Result<String> update(@Validated @RequestBody User user) {
        log.info("更新用户: {}", user);
        
        try {
            boolean result = userService.updateUser(user);
            return result ? Result.success("更新成功") : Result.fail("更新失败");
        } catch (Exception e) {
            log.error("更新用户失败", e);
            return Result.fail("更新失败: " + e.getMessage());
        }
    }

    /**
     * 删除用户
     */
    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable Long id) {
        log.info("删除用户，ID: {}", id);
        
        try {
            boolean result = userService.deleteUser(id);
            return result ? Result.success("删除成功") : Result.fail("删除失败");
        } catch (Exception e) {
            log.error("删除用户失败", e);
            return Result.fail("删除失败: " + e.getMessage());
        }
    }

    /**
     * 批量创建用户
     */
    @PostMapping("/batch")
    public Result<String> batchCreate(@RequestBody List<User> users) {
        log.info("批量创建用户，数量: {}", users.size());
        
        try {
            boolean result = userService.batchCreateUsers(users);
            return result ? Result.success("批量创建成功") : Result.fail("批量创建失败");
        } catch (Exception e) {
            log.error("批量创建用户失败", e);
            return Result.fail("批量创建失败: " + e.getMessage());
        }
    }

    /**
     * 统计用户总数
     */
    @GetMapping("/count")
    public Result<Long> count() {
        log.info("统计用户总数");
        
        try {
            Long count = userService.countUsers();
            return Result.success(count);
        } catch (Exception e) {
            log.error("统计用户总数失败", e);
            return Result.fail("统计失败: " + e.getMessage());
        }
    }
}
