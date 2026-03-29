-- 农业特色功能 - 数据库变更脚本
-- 执行环境: MySQL db_aps

DROP TABLE IF EXISTS `after_sales`;
CREATE TABLE `after_sales` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL COMMENT '买家ID',
    `merchant_id` BIGINT NOT NULL COMMENT '商户ID',
    `type` TINYINT NOT NULL COMMENT '0=仅退款, 1=退货退款',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '0=待审核,1=待退货,2=已完成,3=已拒绝,4=平台介入,5=已关闭',
    `reason` VARCHAR(500) NOT NULL COMMENT '申请原因',
    `evidence_urls` VARCHAR(2000) DEFAULT NULL COMMENT '凭证图片,逗号分隔',
    `refund_amount` DECIMAL(10,2) NOT NULL COMMENT '退款金额',
    `merchant_remark` VARCHAR(500) DEFAULT NULL COMMENT '商家备注',
    `return_tracking_no` VARCHAR(100) DEFAULT NULL COMMENT '退货快递单号',
    `return_company` VARCHAR(50) DEFAULT NULL COMMENT '退货快递公司',
    `appeal_reason` VARCHAR(500) DEFAULT NULL COMMENT '申诉原因',
    `admin_remark` VARCHAR(500) DEFAULT NULL COMMENT '管理员备注',
    `admin_id` BIGINT DEFAULT NULL COMMENT '处理管理员ID',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_order_id` (`order_id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_merchant_id` (`merchant_id`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='售后工单表';

-- 1. Article 表新增文章类型字段
ALTER TABLE `article`
    ADD COLUMN `article_type` TINYINT DEFAULT NULL COMMENT '文章类型: 0=种植技术, 1=食品安全, 2=农业政策, 3=农产品知识' AFTER `status`;

-- 2. 填充示例数据 (可选，答辩演示用)

-- 更新产地信息（产地地图需要）
UPDATE `product` SET `place_of_origin` = '山东烟台' WHERE `id` = 1 AND (`place_of_origin` IS NULL OR `place_of_origin` = '');
UPDATE `product` SET `place_of_origin` = '新疆吐鲁番' WHERE `id` = 2 AND (`place_of_origin` IS NULL OR `place_of_origin` = '');
UPDATE `product` SET `place_of_origin` = '四川成都' WHERE `id` = 3 AND (`place_of_origin` IS NULL OR `place_of_origin` = '');
UPDATE `product` SET `place_of_origin` = '浙江杭州' WHERE `id` = 4 AND (`place_of_origin` IS NULL OR `place_of_origin` = '');
UPDATE `product` SET `place_of_origin` = '云南昆明' WHERE `id` = 5 AND (`place_of_origin` IS NULL OR `place_of_origin` = '');
UPDATE `product` SET `place_of_origin` = '广东广州' WHERE `id` = 6 AND (`place_of_origin` IS NULL OR `place_of_origin` = '');
UPDATE `product` SET `place_of_origin` = '湖南长沙' WHERE `id` = 7 AND (`place_of_origin` IS NULL OR `place_of_origin` = '');
UPDATE `product` SET `place_of_origin` = '江苏南京' WHERE `id` = 8 AND (`place_of_origin` IS NULL OR `place_of_origin` = '');

-- 给文章添加类型
UPDATE `article` SET `article_type` = 0 WHERE `id` = 1;
UPDATE `article` SET `article_type` = 1 WHERE `id` = 2;
UPDATE `article` SET `article_type` = 2 WHERE `id` = 3;
UPDATE `article` SET `article_type` = 3 WHERE `id` = 4;
