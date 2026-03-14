/**
 * Form validation utilities
 * Common validation rules for Element UI forms
 */

/**
 * Validate email format
 * @param {*} rule - Validation rule
 * @param {string} value - Input value
 * @param {Function} callback - Callback function
 */
export function validateEmail(rule, value, callback) {
    if (!value) {
        callback()
        return
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(value)) {
        callback(new Error('请输入正确的邮箱地址'))
    } else {
        callback()
    }
}

/**
 * Validate phone number format (Chinese mobile)
 * @param {*} rule - Validation rule
 * @param {string} value - Input value
 * @param {Function} callback - Callback function
 */
export function validatePhone(rule, value, callback) {
    if (!value) {
        callback()
        return
    }

    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(value)) {
        callback(new Error('请输入正确的手机号码'))
    } else {
        callback()
    }
}

/**
 * Validate username format
 * Username should be 3-20 characters, alphanumeric and underscore only
 * @param {*} rule - Validation rule
 * @param {string} value - Input value
 * @param {Function} callback - Callback function
 */
export function validateUsername(rule, value, callback) {
    if (!value) {
        callback()
        return
    }

    if (value.length < 3 || value.length > 20) {
        callback(new Error('用户名长度应在3-20个字符之间'))
        return
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/
    if (!usernameRegex.test(value)) {
        callback(new Error('用户名只能包含字母、数字和下划线'))
    } else {
        callback()
    }
}

/**
 * Validate password strength
 * Password should be at least 6 characters
 * @param {*} rule - Validation rule
 * @param {string} value - Input value
 * @param {Function} callback - Callback function
 */
export function validatePassword(rule, value, callback) {
    if (!value) {
        callback()
        return
    }

    if (value.length < 6) {
        callback(new Error('密码长度至少为6个字符'))
    } else {
        callback()
    }
}

/**
 * Validate required field
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation rule object
 */
export function requiredRule(fieldName) {
    return {
        required: true,
        message: `请输入${fieldName}`,
        trigger: 'blur'
    }
}

/**
 * Validate length range
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation rule object
 */
export function lengthRule(min, max, fieldName = '内容') {
    return {
        min,
        max,
        message: `${fieldName}长度应在${min}-${max}个字符之间`,
        trigger: 'blur'
    }
}

/**
 * Email validation rule for Element UI
 */
export const emailRule = {
    validator: validateEmail,
    trigger: 'blur'
}

/**
 * Phone validation rule for Element UI
 */
export const phoneRule = {
    validator: validatePhone,
    trigger: 'blur'
}

/**
 * Username validation rule for Element UI
 */
export const usernameRule = {
    validator: validateUsername,
    trigger: 'blur'
}

/**
 * Password validation rule for Element UI
 */
export const passwordRule = {
    validator: validatePassword,
    trigger: 'blur'
}

/**
 * Validate positive number
 * @param {*} rule - Validation rule
 * @param {*} value - Input value
 * @param {Function} callback - Callback function
 */
export function validatePositiveNumber(rule, value, callback) {
    if (value === '' || value === null || value === undefined) {
        callback()
        return
    }

    const num = Number(value)
    if (isNaN(num) || num <= 0) {
        callback(new Error('请输入大于0的数字'))
    } else {
        callback()
    }
}

/**
 * Validate non-negative number
 * @param {*} rule - Validation rule
 * @param {*} value - Input value
 * @param {Function} callback - Callback function
 */
export function validateNonNegativeNumber(rule, value, callback) {
    if (value === '' || value === null || value === undefined) {
        callback()
        return
    }

    const num = Number(value)
    if (isNaN(num) || num < 0) {
        callback(new Error('请输入大于等于0的数字'))
    } else {
        callback()
    }
}

/**
 * Validate URL format
 * @param {*} rule - Validation rule
 * @param {string} value - Input value
 * @param {Function} callback - Callback function
 */
export function validateUrl(rule, value, callback) {
    if (!value) {
        callback()
        return
    }

    try {
        new URL(value)
        callback()
    } catch (error) {
        callback(new Error('请输入正确的URL地址'))
    }
}
