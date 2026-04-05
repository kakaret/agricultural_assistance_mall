package org.example.springboot.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.ToString;

import java.sql.Timestamp;

/**
 * 自动回复规则表
 * 
 * 商家可以设置多条自动回复规则
 * 当买家消息包含某个关键词时，自动触发对应的回复
 */
@Data
@TableName("auto_reply_rule")
@ToString(exclude = {"merchant"})
public class AutoReplyRule {
    /**
     * 规则ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 商家ID
     */
    private Long merchantId;

    /**
     * 触发关键词
     */
    private String keyword;

    /**
     * 回复内容
     */
    private String replyContent;

    /**
     * 优先级（数值越大优先级越高，优先匹配）
     */
    private Integer priority;

    /**
     * 规则状态: 0=禁用 1=启用
     */
    private Integer status;

    /**
     * 创建时间
     */
    private Timestamp createdAt;

    /**
     * 更新时间
     */
    private Timestamp updatedAt;

    /**
     * 关联的商家信息（不映射到数据库）
     */
    @TableField(exist = false)
    private User merchant;
}
