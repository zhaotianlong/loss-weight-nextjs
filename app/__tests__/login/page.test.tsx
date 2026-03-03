/**
 * 登录页面单元测试
 */
import React from 'react'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import LoginPage from '../../login/page'
import { loginByPassword, loginByCode, sendCode } from '@/service/auth'
import { setToken } from '@/utils/auth'
import { useUser } from '@/contexts/UserContext'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/service/auth', () => ({
  loginByPassword: jest.fn(),
  loginByCode: jest.fn(),
  sendCode: jest.fn(),
}))

jest.mock('@/utils/auth', () => ({
  setToken: jest.fn(),
  getAndClearRedirectPath: jest.fn(() => null),
}))

jest.mock('@/contexts/UserContext', () => ({
  useUser: jest.fn(),
}))

jest.mock('@/utils/password', () => ({
  encryptPasswordForTransmit: jest.fn((pwd) => Promise.resolve(`encrypted_${pwd}`)),
}))

const mockPush = jest.fn()
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
}

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useUser as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      loading: false,
    })
    // Mock window.location.href
    delete (window as any).location
    ;(window as any).location = { href: '' }
  })

  it('应该渲染登录表单', async () => {
    await act(async () => {
      render(<LoginPage />)
    })

    expect(screen.getByText('减肥训练营管理系统')).toBeInTheDocument()
    expect(screen.getByText('账号密码登录')).toBeInTheDocument()
  })

  it('应该支持账号密码登录', async () => {
    const mockResponse = {
      success: true,
      data: {
        token: 'mock_token_123',
        user: {
          userId: 'emp001',
          name: '测试用户',
          role: '超级管理员',
        },
      },
    }

    ;(loginByPassword as jest.Mock).mockResolvedValue(mockResponse)

    await act(async () => {
      render(<LoginPage />)
    })

    const usernameInput = screen.getByPlaceholderText('请输入账号或手机号')
    const passwordInput = screen.getByPlaceholderText('请输入密码')
    const submitButton = screen.getByText('登录')

    fireEvent.change(usernameInput, { target: { value: 'emp001' } })
    fireEvent.change(passwordInput, { target: { value: 'admin123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(loginByPassword).toHaveBeenCalledWith({
        username: 'emp001',
        password: 'encrypted_admin123',
      })
      expect(setToken).toHaveBeenCalledWith('mock_token_123')
    })
  })

  it('应该支持验证码登录', async () => {
    const mockSendCodeResponse = {
      success: true,
      data: { code: '123456' },
    }

    const mockLoginResponse = {
      success: true,
      data: {
        token: 'mock_token_123',
        user: {
          userId: 'emp001',
          name: '测试用户',
          role: '超级管理员',
        },
      },
    }

    ;(sendCode as jest.Mock).mockResolvedValue(mockSendCodeResponse)
    ;(loginByCode as jest.Mock).mockResolvedValue(mockLoginResponse)

    await act(async () => {
      render(<LoginPage />)
    })

    // 切换到验证码登录
    const codeTab = screen.getByText('手机号验证码登录')
    fireEvent.click(codeTab)

    // 输入手机号并发送验证码
    const phoneInput = screen.getByPlaceholderText('请输入手机号')
    fireEvent.change(phoneInput, { target: { value: '13888880001' } })

    const sendCodeButton = screen.getByText('发送验证码')
    fireEvent.click(sendCodeButton)

    await waitFor(() => {
      expect(sendCode).toHaveBeenCalledWith({ phone: '13888880001' })
    })

    // 输入验证码并登录
    const codeInput = screen.getByPlaceholderText('请输入验证码')
    fireEvent.change(codeInput, { target: { value: '123456' } })

    const loginButton = screen.getByText('登录')
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(loginByCode).toHaveBeenCalledWith({
        phone: '13888880001',
        code: '123456',
      })
    })
  })

  it('应该显示表单验证错误', async () => {
    await act(async () => {
      render(<LoginPage />)
    })

    const submitButton = screen.getByText('登录')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('请输入账号或手机号')).toBeInTheDocument()
    })
  })

  it('应该处理登录失败', async () => {
    ;(loginByPassword as jest.Mock).mockRejectedValue(new Error('登录失败'))

    await act(async () => {
      render(<LoginPage />)
    })

    const usernameInput = screen.getByPlaceholderText('请输入账号或手机号')
    const passwordInput = screen.getByPlaceholderText('请输入密码')
    const submitButton = screen.getByText('登录')

    fireEvent.change(usernameInput, { target: { value: 'emp001' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(loginByPassword).toHaveBeenCalled()
    })
  })

  it('应该自动跳转已登录用户', () => {
    ;(useUser as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      loading: false,
    })

    render(<LoginPage />)

    expect(mockRouter.replace).toHaveBeenCalledWith('/')
  })
})
