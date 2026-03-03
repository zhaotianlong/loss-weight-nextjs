/**
 * AuthGuard 组件单元测试
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useRouter, usePathname } from 'next/navigation'
import AuthGuard from '../AuthGuard'
import { useUser } from '@/contexts/UserContext'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}))

jest.mock('@/contexts/UserContext', () => ({
  useUser: jest.fn(),
}))

const mockPush = jest.fn()
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
}

describe('AuthGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('应该允许访问登录页', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/login')
    ;(useUser as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      loading: false,
    })

    render(
      <AuthGuard>
        <div>Login Page</div>
      </AuthGuard>
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('应该重定向未登录用户到登录页', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/dashboard')
    ;(useUser as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      loading: false,
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('应该显示加载状态', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/dashboard')
    ;(useUser as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      loading: true,
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    // 应该显示加载状态（Spin组件）
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('应该允许已登录用户访问', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/dashboard')
    ;(useUser as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      loading: false,
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
