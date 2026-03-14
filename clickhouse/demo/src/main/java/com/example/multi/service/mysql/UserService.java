package com.example.multi.service.mysql;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.example.multi.entity.mysql.User;

import java.util.List;

/**
 * 用户 Service 接口（MySQL）
 * 
 * @author system
 * @date 2024-11-13
 */
public interface UserService extends IService<User> {

    /**
     * 根据用户名查询用户
     */
    User getByUsername(String username);

    /**
     * 根据手机号查询用户
     */
    User getByPhone(String phone);

    /**
     * 查询所有启用的用户
     */
    List<User> listEnabledUsers();

    /**
     * 分页查询用户
     */
    Page<User> pageUsers(Long current, Long size, String username);

    /**
     * 创建用户
     */
    boolean createUser(User user);

    /**
     * 更新用户
     */
    boolean updateUser(User user);

    /**
     * 删除用户（逻辑删除）
     */
    boolean deleteUser(Long id);

    /**
     * 统计用户总数
     */
    Long countUsers();

    /**
     * 批量创建用户
     */
    boolean batchCreateUsers(List<User> users);
}
