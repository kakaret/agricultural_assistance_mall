-- ============================================
-- 消息系统建表脚本
-- 日期: 2026-04-05
-- 表: chat_session, chat_message, auto_reply_rule
-- ============================================

SET NAMES utf8mb4;

-- ----------------------------
-- 聊天会话表
-- ----------------------------
DROP TABLE IF EXISTS `chat_message`;
DROP TABLE IF EXISTS `auto_reply_rule`;
DROP TABLE IF EXISTS `chat_session`;

CREATE TABLE `chat_session` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '会话ID',
  `customer_id` bigint NOT NULL COMMENT '买家ID',
  `merchant_id` bigint NOT NULL COMMENT '商家ID',
  `product_id` bigint DEFAULT NULL COMMENT '关联商品ID',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '会话状态: 0关闭 1开启',
  `last_message_time` timestamp NULL DEFAULT NULL COMMENT '最后消息时间',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  INDEX `idx_customer` (`customer_id`),
  INDEX `idx_merchant` (`merchant_id`),
  UNIQUE INDEX `uk_customer_merchant` (`customer_id`, `merchant_id`),
  CONSTRAINT `fk_session_customer` FOREIGN KEY (`customer_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_session_merchant` FOREIGN KEY (`merchant_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '聊天会话表';

-- ----------------------------
-- 聊天消息表
-- ----------------------------
CREATE TABLE `chat_message` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '消息ID',
  `session_id` bigint NOT NULL COMMENT '会话ID',
  `sender_id` bigint NOT NULL COMMENT '发送者ID (0=系统)',
  `sender_role` varchar(20) NOT NULL COMMENT 'CUSTOMER/MERCHANT/SYSTEM',
  `content` text NOT NULL COMMENT '消息内容 (文字或图片URL)',
  `content_type` varchar(10) NOT NULL DEFAULT 'TEXT' COMMENT 'TEXT/IMAGE',
  `is_read` tinyint NOT NULL DEFAULT 0 COMMENT '0未读 1已读',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  INDEX `idx_session_time` (`session_id`, `created_at`),
  INDEX `idx_sender` (`sender_id`),
  CONSTRAINT `fk_message_session` FOREIGN KEY (`session_id`) REFERENCES `chat_session` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '聊天消息表';

-- ----------------------------
-- 自动回复规则表
-- ----------------------------
CREATE TABLE `auto_reply_rule` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '规则ID',
  `merchant_id` bigint NOT NULL COMMENT '商家ID',
  `keyword` varchar(100) NOT NULL COMMENT '触发关键词',
  `reply_content` text NOT NULL COMMENT '回复内容',
  `priority` int NOT NULL DEFAULT 0 COMMENT '优先级 (大的优先匹配)',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '0禁用 1启用',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  INDEX `idx_merchant_status` (`merchant_id`, `status`),
  CONSTRAINT `fk_rule_merchant` FOREIGN KEY (`merchant_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '自动回复规则表';
