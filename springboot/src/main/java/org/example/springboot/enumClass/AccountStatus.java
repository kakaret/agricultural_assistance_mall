package org.example.springboot.enumClass;
public enum AccountStatus {
    DISABLED(0),
    ENABLED(1);

    private final int value;

    AccountStatus(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    public static AccountStatus fromValue(int value) {
        for (AccountStatus status : AccountStatus.values()) {
            if (status.getValue() == value) {
                return status;
            }
        }
        throw new IllegalArgumentException("鏈煡鐨勮处鍙风姸鎬? " + value);
    }
}