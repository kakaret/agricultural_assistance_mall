package org.example.springboot.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.example.springboot.entity.AutoReplyRule;
import org.apache.ibatis.annotations.Mapper;

/**
 * 自动回复规则 Mapper
 * 
 * 继承 BaseMapper，自动获得 CRUD 操作：
 * - selectById(id)
 * - selectOne(queryWrapper)
 * - selectPage(page, queryWrapper)
 * - insert(entity)
 * - updateById(entity)
 * - deleteById(id)
 */
@Mapper
public interface AutoReplyRuleMapper extends BaseMapper<AutoReplyRule> {
}
