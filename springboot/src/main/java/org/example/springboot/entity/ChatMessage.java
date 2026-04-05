package org.example.springboot.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.ToString;

import java.sql.Timestamp;

/**
 * 聊天消息表
 * 
 * 记录会话中的所有消息
 * 支持文字和图片消息
 */
@Data
@TableName("chat_message")
@ToString(exclude = {"session", "sender"})
public class ChatMessage {
    /**
     * 消息ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 会话ID
     */
    private Long sessionId;

    /**
     * 发送者ID（系统消息时为0）
     */
    private Long senderId;

    /**
     * 发送者角色: CUSTOMER(买家) / MERCHANT(商家) / SYSTEM(系统)
     */
    private String senderRole;

    /**
     * 消息内容（文字或图片URL）
     */
    private String content;

    /**
     * 消息类型: TEXT(文字) / IMAGE(图片)
     */
    private String contentType;

    /**
     * 是否已读: 0=未读 1=已读
     */
    private Integer isRead;

    /**
     * 创建时间
     */
    private Timestamp createdAt;

    /**
     * 关联的会话信息（不映射到数据库）
     */
    @TableField(exist = false)
    private ChatSession session;

    /**
     * 关联的发送者信息（不映射到数据库）
     */
    @TableField(exist = false)
    private User sender;
}
