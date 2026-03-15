/**
 * Unit Tests for Form Validators
 */

import {
  isValidUsername,
  isValidPassword,
  isValidEmail,
  isValidPhone,
  isRequired,
  minLength,
  maxLength
} from '@/utils/validators'

describe('Form Validators', () => {
  describe('isValidUsername', () => {
    it('should accept valid usernames', () => {
      expect(isValidUsername('user123')).toBe(true)
      expect(isValidUsername('john_doe')).toBe(true)
      expect(isValidUsername('ABC123')).toBe(true)
    })

    it('should reject invalid usernames', () => {
      expect(isValidUsername('ab')).toBe(false) // Too short
      expect(isValidUsername('a'.repeat(21))).toBe(false) // Too long
      expect(isValidUsername('user@name')).toBe(false) // Invalid char
      expect(isValidUsername('user name')).toBe(false) // Space
      expect(isValidUsername('')).toBe(false) // Empty
    })
  })

  describe('isValidPassword', () => {
    it('should accept valid passwords', () => {
      expect(isValidPassword('123456')).toBe(true)
      expect(isValidPassword('password123')).toBe(true)
      expect(isValidPassword('Abc@1234')).toBe(true)
    })

    it('should reject invalid passwords', () => {
      expect(isValidPassword('12345')).toBe(false) // Too short
      expect(isValidPassword('a'.repeat(21))).toBe(false) // Too long
      expect(isValidPassword('')).toBe(false) // Empty
    })
  })

  describe('isValidEmail', () => {
    it('should accept valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true)
      expect(isValidEmail('test.email@domain.co')).toBe(true)
      expect(isValidEmail('user+tag@example.com')).toBe(true)
    })

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('user@')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('isValidPhone', () => {
    it('should accept valid phone numbers', () => {
      expect(isValidPhone('13800138000')).toBe(true)
      expect(isValidPhone('15912345678')).toBe(true)
      expect(isValidPhone('18687654321')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('12345678901')).toBe(false) // Invalid prefix
      expect(isValidPhone('1380013800')).toBe(false) // Too short
      expect(isValidPhone('138001380000')).toBe(false) // Too long
      expect(isValidPhone('')).toBe(false)
    })
  })

  describe('isRequired', () => {
    it('should validate required fields', () => {
      expect(isRequired('value')).toBe(true)
      expect(isRequired('  value  ')).toBe(true)
      expect(isRequired('')).toBe(false)
      expect(isRequired('   ')).toBe(false)
      expect(isRequired(null)).toBe(false)
      expect(isRequired(undefined)).toBe(false)
    })
  })

  describe('minLength', () => {
    it('should validate minimum length', () => {
      expect(minLength(5)('hello')).toBe(true)
      expect(minLength(5)('hello world')).toBe(true)
      expect(minLength(5)('hi')).toBe(false)
    })
  })

  describe('maxLength', () => {
    it('should validate maximum length', () => {
      expect(maxLength(10)('hello')).toBe(true)
      expect(maxLength(10)('hello worl')).toBe(true)
      expect(maxLength(10)('hello world!')).toBe(false)
    })
  })
})
