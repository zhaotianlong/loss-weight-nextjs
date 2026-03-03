/**
 * Token 管理工具单元测试
 */
import {
  setToken,
  getToken,
  removeToken,
  isAuthenticated,
  saveRedirectPath,
  getAndClearRedirectPath,
} from '../auth'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
})

describe('auth utils', () => {
  beforeEach(() => {
    localStorageMock.clear()
    sessionStorageMock.clear()
    jest.clearAllMocks()
  })

  describe('setToken', () => {
    it('应该保存 token 到 localStorage', () => {
      const token = 'test_token_123'
      setToken(token)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', token)
    })
  })

  describe('getToken', () => {
    it('应该从 localStorage 获取 token', () => {
      const token = 'test_token_123'
      localStorageMock.setItem('auth_token', token)
      expect(getToken()).toBe(token)
    })

    it('应该返回 null 当 token 不存在时', () => {
      expect(getToken()).toBeNull()
    })
  })

  describe('removeToken', () => {
    it('应该删除 token 和 redirect path', () => {
      localStorageMock.setItem('auth_token', 'test_token')
      sessionStorageMock.setItem('redirect_path', '/dashboard')
      
      removeToken()
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('redirect_path')
    })
  })

  describe('isAuthenticated', () => {
    it('应该返回 true 当 token 存在时', () => {
      localStorageMock.setItem('auth_token', 'test_token')
      expect(isAuthenticated()).toBe(true)
    })

    it('应该返回 false 当 token 不存在时', () => {
      expect(isAuthenticated()).toBe(false)
    })
  })

  describe('saveRedirectPath', () => {
    it('应该保存路径到 sessionStorage', () => {
      const path = '/dashboard'
      saveRedirectPath(path)
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith('redirect_path', path)
    })

    it('不应该保存登录页路径', () => {
      saveRedirectPath('/login')
      expect(sessionStorageMock.setItem).not.toHaveBeenCalled()
    })
  })

  describe('getAndClearRedirectPath', () => {
    it('应该获取并清除保存的路径', () => {
      const path = '/dashboard'
      sessionStorageMock.setItem('redirect_path', path)
      
      const result = getAndClearRedirectPath()
      
      expect(result).toBe(path)
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('redirect_path')
    })

    it('应该返回 null 当路径不存在时', () => {
      const result = getAndClearRedirectPath()
      expect(result).toBeNull()
    })
  })
})
