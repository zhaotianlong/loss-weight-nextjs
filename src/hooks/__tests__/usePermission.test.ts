/**
 * usePermission Hook 单元测试
 */
import { renderHook } from '@testing-library/react'
import { usePermission } from '../usePermission'
import { useUser } from '@/contexts/UserContext'

// Mock UserContext
jest.mock('@/contexts/UserContext', () => ({
  useUser: jest.fn(),
}))

describe('usePermission', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('应该返回权限检查方法', () => {
    ;(useUser as jest.Mock).mockReturnValue({
      user: {
        userId: 'emp001',
        role: '超级管理员',
      },
      hasPermission: jest.fn(() => true),
      hasAnyPermission: jest.fn(() => true),
      hasAllPermissions: jest.fn(() => true),
      permissions: ['camp:view', 'camp:create'],
    })

    const { result } = renderHook(() => usePermission())

    expect(result.current.hasPermission).toBeDefined()
    expect(result.current.hasAnyPermission).toBeDefined()
    expect(result.current.hasAllPermissions).toBeDefined()
    expect(result.current.user).toBeDefined()
    expect(result.current.permissions).toBeDefined()
  })

  it('应该正确识别超级管理员', () => {
    ;(useUser as jest.Mock).mockReturnValue({
      user: {
        userId: 'emp001',
        role: '超级管理员',
      },
      hasPermission: jest.fn(),
      hasAnyPermission: jest.fn(),
      hasAllPermissions: jest.fn(),
      permissions: [],
    })

    const { result } = renderHook(() => usePermission())

    expect(result.current.isSuperAdmin).toBe(true)
    expect(result.current.isCampAdmin).toBe(false)
  })

  it('应该正确识别营地管理员', () => {
    ;(useUser as jest.Mock).mockReturnValue({
      user: {
        userId: 'emp002',
        role: '营地管理员',
      },
      hasPermission: jest.fn(),
      hasAnyPermission: jest.fn(),
      hasAllPermissions: jest.fn(),
      permissions: [],
    })

    const { result } = renderHook(() => usePermission())

    expect(result.current.isSuperAdmin).toBe(false)
    expect(result.current.isCampAdmin).toBe(true)
  })
})
