package org.example.springboot.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.example.springboot.entity.ChatMessage;
import org.apache.ibatis.annotations.Mapper;

/**
 * 聊天消息 Mapper
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
public interface ChatMessageMapper extends BaseMapper<ChatMessage> {
}
