package org.example.springboot.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.sql.Timestamp;

@Data
public class Article {
    @TableId(type = IdType.AUTO)
    private Long id;

    @NotBlank(message = "资讯标题不能为空")
    private String title;

    @NotBlank(message = "资讯内容不能为空")
    private String content;

    private String summary;

    private String coverImage;

    private Integer viewCount = 0;

    @NotNull(message = "状态不能为空")
    private Integer status = 1;

    private Integer articleType;  // 0=种植技术, 1=食品安全, 2=农业政策, 3=农产品知识

    private Timestamp createdAt;

    private Timestamp updatedAt;
} 