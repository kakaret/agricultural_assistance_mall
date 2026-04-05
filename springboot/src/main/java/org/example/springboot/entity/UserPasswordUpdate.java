package org.example.springboot.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPasswordUpdate {
    private String oldPassword; // 鏃у瘑鐮?
    private String newPassword; // 鏂板瘑鐮?
}
