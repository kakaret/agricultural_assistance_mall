package org.example.springboot.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.ToString;

import java.sql.Timestamp;

/**
 * 聊天会话表
 * 
 * 一个买家和一个商家之间只能有一个会话
 * 多次发起咨询时会复用同一会话，更新 product_id
 */
@Data
@TableName("chat_session")
@ToString(exclude = {"customer", "merchant", "product"})
public class ChatSession {
    /**
     * 会话ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 买家ID
     */
    private Long customerId;

    /**
     * 商家ID
     */
    private Long merchantId;

    /**
     * 关联商品ID（从哪个商品发起的咨询）
     */
    private Long productId;

    /**
     * 会话状态: 0=关闭 1=开启
     */
    private Integer status;

    /**
     * 最后消息时间（用于排序会话列表）
     */
    private Timestamp lastMessageTime;

    /**
     * 创建时间
     */
    private Timestamp createdAt;

    /**
     * 更新时间
     */
    private Timestamp updatedAt;

    /**
     * 关联的买家信息（不映射到数据库）
     */
    @TableField(exist = false)
    private User customer;

    /**
     * 关联的商家信息（不映射到数据库）
     */
    @TableField(exist = false)
    private User merchant;

    /**
     * 关联的商品信息（不映射到数据库）
     */
    @TableField(exist = false)
    private Product product;
}
