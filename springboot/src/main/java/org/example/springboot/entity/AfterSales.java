package org.example.springboot.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
@TableName("after_sales")
public class AfterSales {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long orderId;
    private Long userId;
    private Long merchantId;
    private Integer type;       // 0=仅退款, 1=退货退款
    private Integer status;     // 0=待审核, 1=待退货, 2=已完成, 3=已拒绝, 4=平台介入, 5=已关闭
    private String reason;
    private String evidenceUrls;
    private BigDecimal refundAmount;
    private String merchantRemark;
    private String returnTrackingNo;
    private String returnCompany;
    private String appealReason;
    private String adminRemark;
    private Long adminId;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    @TableField(exist = false)
    private Order order;

    @TableField(exist = false)
    private User user;

    @TableField(exist = false)
    private Product product;

    @TableField(exist = false)
    private User merchant;
}
