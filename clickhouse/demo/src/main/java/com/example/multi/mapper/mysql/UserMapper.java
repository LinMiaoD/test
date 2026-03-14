package com.example.multi.mapper.mysql;

import com.baomidou.dynamic.datasource.annotation.DS;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.multi.constant.DataSourceConstant;
import com.example.multi.entity.mysql.User;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 用户 Mapper（MySQL）
 * 
 * 通过 @DS 注解指定数据源为 MySQL
 * 
 * @author system
 * @date 2024-11-13
 */
@Repository
@DS(DataSourceConstant.MYSQL)
public interface UserMapper extends BaseMapper<User> {

    /**
     * 根据用户名查询用户
     */
    @Select("SELECT * FROM t_user WHERE username = #{username} AND deleted = 0")
    User selectByUsername(@Param("username") String username);

    /**
     * 查询所有启用的用户
     */
    @Select("SELECT * FROM t_user WHERE status = 1 AND deleted = 0 ORDER BY create_time DESC")
    List<User> selectEnabledUsers();

    /**
     * 根据手机号查询用户
     */
    @Select("SELECT * FROM t_user WHERE phone = #{phone} AND deleted = 0")
    User selectByPhone(@Param("phone") String phone);

    /**
     * 统计用户数量
     */
    @Select("SELECT COUNT(*) FROM t_user WHERE deleted = 0")
    Long countUsers();
}
