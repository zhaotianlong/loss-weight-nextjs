/**
 * 密码加密工具单元测试
 */
import {
  hashPassword,
  verifyPassword,
  encryptPasswordForTransmit,
  hashPasswordSync,
  verifyPasswordSync,
} from '../password'

// Mock crypto API
const mockCrypto = {
  subtle: {
    importKey: jest.fn(),
    deriveBits: jest.fn(),
    digest: jest.fn(),
  },
  getRandomValues: jest.fn((arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256)
    }
    return arr
  }),
}

// 设置全局 crypto
Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true,
})

describe('password utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('encryptPasswordForTransmit', () => {
    it('应该使用 SHA-256 加密密码', async () => {
      // 使用真实的crypto API进行测试
      const result = await encryptPasswordForTransmit('testpassword')

      expect(result).toMatch(/^[0-9a-f]{64}$/) // 64个十六进制字符
      expect(result.length).toBe(64)
    })

    it('应该对相同密码生成相同哈希', async () => {
      const result1 = await encryptPasswordForTransmit('testpassword')
      const result2 = await encryptPasswordForTransmit('testpassword')

      expect(result1).toBe(result2)
    })
  })

  describe('hashPassword', () => {
    it('应该生成哈希密码', async () => {
      // 使用真实的crypto API进行测试
      const result = await hashPassword('testpassword')

      expect(result).toMatch(/^[0-9a-f]{32}:[0-9a-f]{64}$/) // salt:hash 格式
    })

    it('应该使用提供的盐值', async () => {
      // 使用真实的crypto API进行测试
      const salt = 'testsalt123456789012345678901234'
      const result = await hashPassword('testpassword', salt)

      expect(result).toContain(salt)
      expect(result.split(':')[0]).toBe(salt)
    })

    it('应该为相同密码生成不同的哈希（因为盐值不同）', async () => {
      // 使用真实的crypto API进行测试
      const password = 'testpassword'
      const result1 = await hashPassword(password)
      const result2 = await hashPassword(password)

      // 由于盐值不同，哈希应该不同
      expect(result1).not.toBe(result2)
    })
  })

  describe('verifyPassword', () => {
    it('应该验证正确的密码', async () => {
      // 使用真实的crypto API进行测试
      const password = 'testpassword123'
      const hashedPassword = await hashPassword(password)
      const isValid = await verifyPassword(password, hashedPassword)

      expect(isValid).toBe(true)
    })

    it('应该拒绝错误的密码', async () => {
      // 使用真实的crypto API进行测试
      const password = 'testpassword123'
      const wrongPassword = 'wrongpassword456'
      const hashedPassword = await hashPassword(password)
      const isValid = await verifyPassword(wrongPassword, hashedPassword)

      expect(isValid).toBe(false)
    })

    it('应该返回 false 当哈希格式无效', async () => {
      const isValid = await verifyPassword('testpassword', 'invalid-format')
      expect(isValid).toBe(false)
    })
  })

  describe('hashPasswordSync', () => {
    it('应该生成同步哈希密码', () => {
      const result = hashPasswordSync('testpassword')

      expect(result).toMatch(/^[0-9a-f]{32}:[0-9a-f]{64}$/) // salt:hash 格式
    })

    it('应该使用提供的盐值', () => {
      const salt = 'testsalt123456789012345678901234'
      const result = hashPasswordSync('testpassword', salt)

      expect(result).toContain(salt)
    })
  })

  describe('verifyPasswordSync', () => {
    it('应该验证正确的密码', () => {
      const hashedPassword = hashPasswordSync('testpassword')
      const isValid = verifyPasswordSync('testpassword', hashedPassword)

      expect(isValid).toBe(true)
    })

    it('应该拒绝错误的密码', () => {
      const hashedPassword = hashPasswordSync('testpassword')
      const isValid = verifyPasswordSync('wrongpassword', hashedPassword)

      expect(isValid).toBe(false)
    })

    it('应该返回 false 当哈希格式无效', () => {
      const isValid = verifyPasswordSync('testpassword', 'invalid-format')
      expect(isValid).toBe(false)
    })
  })
})
