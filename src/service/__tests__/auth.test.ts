/**
 * 认证服务单元测试
 */
import { loginByPassword, loginByCode, sendCode, getCurrentUser } from '../auth'
import { http } from '@/lib/request'

// Mock request module
jest.mock('@/lib/request', () => ({
  http: {
    post: jest.fn(),
    get: jest.fn(),
  },
}))

describe('auth service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('loginByPassword', () => {
    it('应该使用账号登录', async () => {
      const mockResponse = {
        success: true,
        data: {
          token: 'mock_token_123',
          user: {
            userId: 'emp001',
            id: 'emp001',
            name: '测试用户',
            phone: '13888880001',
            role: '超级管理员',
            status: 1,
          },
        },
      }

      ;(http.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await loginByPassword({
        username: 'emp001',
        password: 'encrypted_password',
      })

      expect(http.post).toHaveBeenCalledWith('/auth/login', {
        username: 'emp001',
        password: 'encrypted_password',
      })
      expect(result).toEqual(mockResponse)
    })

    it('应该使用手机号登录', async () => {
      const mockResponse = {
        success: true,
        data: {
          token: 'mock_token_123',
          user: {
            userId: 'emp001',
            id: 'emp001',
            name: '测试用户',
            phone: '13888880001',
            role: '超级管理员',
            status: 1,
          },
        },
      }

      ;(http.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await loginByPassword({
        phone: '13888880001',
        password: 'encrypted_password',
      })

      expect(http.post).toHaveBeenCalledWith('/auth/login', {
        phone: '13888880001',
        password: 'encrypted_password',
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('loginByCode', () => {
    it('应该使用验证码登录', async () => {
      const mockResponse = {
        success: true,
        data: {
          token: 'mock_token_123',
          user: {
            userId: 'emp001',
            id: 'emp001',
            name: '测试用户',
            phone: '13888880001',
            role: '超级管理员',
            status: 1,
          },
        },
      }

      ;(http.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await loginByCode({
        phone: '13888880001',
        code: '123456',
      })

      expect(http.post).toHaveBeenCalledWith('/auth/login-by-code', {
        phone: '13888880001',
        code: '123456',
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('sendCode', () => {
    it('应该发送验证码', async () => {
      const mockResponse = {
        success: true,
        data: {
          code: '123456',
        },
        message: '验证码已发送',
      }

      ;(http.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await sendCode({
        phone: '13888880001',
      })

      expect(http.post).toHaveBeenCalledWith('/auth/send-code', {
        phone: '13888880001',
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getCurrentUser', () => {
    it('应该获取当前用户信息', async () => {
      const mockResponse = {
        success: true,
        data: {
          userId: 'emp001',
          id: 'emp001',
          name: '测试用户',
          phone: '13888880001',
          role: '超级管理员',
          status: 1,
        },
      }

      ;(http.get as jest.Mock).mockResolvedValue(mockResponse)

      const result = await getCurrentUser()

      expect(http.get).toHaveBeenCalledWith('/auth/me')
      expect(result).toEqual(mockResponse)
    })
  })
})
