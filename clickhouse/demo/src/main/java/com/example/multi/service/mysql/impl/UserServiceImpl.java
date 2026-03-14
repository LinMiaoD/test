package com.example.multi.service.mysql.impl;

import com.baomidou.dynamic.datasource.annotation.DS;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.multi.constant.DataSourceConstant;
import com.example.multi.entity.mysql.User;
import com.example.multi.mapper.mysql.UserMapper;
import com.example.multi.service.mysql.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 用户 Service 实现类（MySQL）
 * 
 * 通过 @DS 注解指定该 Service 默认使用 MySQL 数据源
 * 
 * @author system
 * @date 2024-11-13
 */
@Slf4j
@Service
@DS(DataSourceConstant.MYSQL)
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Override
    public User getByUsername(String username) {
        log.info("查询用户，用户名: {}", username);
        return baseMapper.selectByUsername(username);
    }

    @Override
    public User getByPhone(String phone) {
        log.info("查询用户，手机号: {}", phone);
        return baseMapper.selectByPhone(phone);
    }

    @Override
    public List<User> listEnabledUsers() {
        log.info("查询所有启用的用户");
        return baseMapper.selectEnabledUsers();
    }

    @Override
    public Page<User> pageUsers(Long current, Long size, String username) {
        log.info("分页查询用户，页码: {}, 每页数量: {}, 用户名: {}", current, size, username);
        
        Page<User> page = new Page<>(current, size);
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        
        if (StringUtils.hasText(username)) {
            wrapper.like(User::getUsername, username);
        }
        
        wrapper.orderByDesc(User::getCreateTime);
        
        return this.page(page, wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean createUser(User user) {
        log.info("创建用户: {}", user);
        
        // 校验用户名是否存在
        User existUser = this.getByUsername(user.getUsername());
        if (existUser != null) {
            log.warn("用户名已存在: {}", user.getUsername());
            throw new RuntimeException("用户名已存在");
        }
        
        // 设置默认值
        if (user.getStatus() == null) {
            user.setStatus(1);
        }
        
        return this.save(user);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateUser(User user) {
        log.info("更新用户: {}", user);
        
        if (user.getId() == null) {
            throw new RuntimeException("用户ID不能为空");
        }
        
        // 校验用户是否存在
        User existUser = this.getById(user.getId());
        if (existUser == null) {
            log.warn("用户不存在，ID: {}", user.getId());
            throw new RuntimeException("用户不存在");
        }
        
        return this.updateById(user);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteUser(Long id) {
        log.info("删除用户，ID: {}", id);
        
        // 校验用户是否存在
        User existUser = this.getById(id);
        if (existUser == null) {
            log.warn("用户不存在，ID: {}", id);
            throw new RuntimeException("用户不存在");
        }
        
        // 逻辑删除
        return this.removeById(id);
    }

    @Override
    public Long countUsers() {
        log.info("统计用户总数");
        return baseMapper.countUsers();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchCreateUsers(List<User> users) {
        log.info("批量创建用户，数量: {}", users.size());
        
        // 设置默认值
        users.forEach(user -> {
            if (user.getStatus() == null) {
                user.setStatus(1);
            }
        });
        
        // 批量插入（每批1000条）
        return this.saveBatch(users, 1000);
    }
}
