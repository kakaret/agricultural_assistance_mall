-- 聊天功能建表 SQL
-- 需要在 db_aps 数据库中执行

-- 1. 聊天会话表
CREATE TABLE IF NOT EXISTS `chat_session` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '会话ID',
    `customer_id` BIGINT NOT NULL COMMENT '买家ID',
    `merchant_id` BIGINT NOT NULL COMMENT '商家ID',
    `product_id` BIGINT DEFAULT NULL COMMENT '关联商品ID',
    `status` INT NOT NULL DEFAULT 1 COMMENT '会话状态: 0=关闭 1=开启',
    `last_message_time` TIMESTAMP NULL DEFAULT NULL COMMENT '最后消息时间',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_customer_id` (`customer_id`),
    INDEX `idx_merchant_id` (`merchant_id`),
    INDEX `idx_customer_merchant` (`customer_id`, `merchant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='聊天会话表';

-- 2. 聊天消息表
CREATE TABLE IF NOT EXISTS `chat_message` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '消息ID',
    `session_id` BIGINT NOT NULL COMMENT '会话ID',
    `sender_id` BIGINT NOT NULL DEFAULT 0 COMMENT '发送者ID（系统消息时为0）',
    `sender_role` VARCHAR(20) NOT NULL COMMENT '发送者角色: CUSTOMER/MERCHANT/SYSTEM',
    `content` TEXT NOT NULL COMMENT '消息内容',
    `content_type` VARCHAR(20) NOT NULL DEFAULT 'TEXT' COMMENT '消息类型: TEXT/IMAGE',
    `is_read` INT NOT NULL DEFAULT 0 COMMENT '是否已读: 0=未读 1=已读',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    INDEX `idx_session_id` (`session_id`),
    INDEX `idx_sender_id` (`sender_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='聊天消息表';

-- 3. 自动回复规则表
CREATE TABLE IF NOT EXISTS `auto_reply_rule` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '规则ID',
    `merchant_id` BIGINT NOT NULL COMMENT '商家ID',
    `keyword` VARCHAR(100) NOT NULL COMMENT '触发关键词',
    `reply_content` TEXT NOT NULL COMMENT '回复内容',
    `priority` INT NOT NULL DEFAULT 0 COMMENT '优先级（数值越大优先级越高）',
    `status` INT NOT NULL DEFAULT 1 COMMENT '规则状态: 0=禁用 1=启用',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_merchant_id` (`merchant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='自动回复规则表';
