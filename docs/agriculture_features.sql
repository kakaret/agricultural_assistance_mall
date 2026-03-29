-- 农业特色功能 - 数据库变更脚本
-- 执行环境: MySQL db_aps

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
