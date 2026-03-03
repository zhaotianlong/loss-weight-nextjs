/**
 * PermissionGuard 组件单元测试
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import PermissionGuard from '../PermissionGuard'
import { usePermission } from '@/hooks/usePermission'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/hooks/usePermission', () => ({
  usePermission: jest.fn(),
}))

const mockPush = jest.fn()
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
}

describe('PermissionGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('应该允许有权限的用户访问', () => {
    ;(usePermission as jest.Mock).mockReturnValue({
      hasPermission: jest.fn(() => true),
      hasAnyPermission: jest.fn(() => true),
      hasAllPermissions: jest.fn(() => true),
    })

    render(
      <PermissionGuard permission="camp:view">
        <div>Protected Content</div>
      </PermissionGuard>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('应该拒绝无权限的用户访问', () => {
    ;(usePermission as jest.Mock).mockReturnValue({
      hasPermission: jest.fn(() => false),
      hasAnyPermission: jest.fn(() => false),
      hasAllPermissions: jest.fn(() => false),
    })

    render(
      <PermissionGuard permission="camp:view">
        <div>Protected Content</div>
      </PermissionGuard>
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.getByText('403')).toBeInTheDocument()
    expect(screen.getByText('抱歉，您没有权限访问此页面')).toBeInTheDocument()
  })

  it('应该支持多个权限（任一）', () => {
    ;(usePermission as jest.Mock).mockReturnValue({
      hasPermission: jest.fn(),
      hasAnyPermission: jest.fn(() => true),
      hasAllPermissions: jest.fn(() => false),
    })

    render(
      <PermissionGuard permissions={['camp:view', 'camp:create']} requireAll={false}>
        <div>Protected Content</div>
      </PermissionGuard>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('应该支持多个权限（全部）', () => {
    ;(usePermission as jest.Mock).mockReturnValue({
      hasPermission: jest.fn(),
      hasAnyPermission: jest.fn(() => false),
      hasAllPermissions: jest.fn(() => true),
    })

    render(
      <PermissionGuard permissions={['camp:view', 'camp:create']} requireAll={true}>
        <div>Protected Content</div>
      </PermissionGuard>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('应该使用自定义 fallback', () => {
    ;(usePermission as jest.Mock).mockReturnValue({
      hasPermission: jest.fn(() => false),
      hasAnyPermission: jest.fn(() => false),
      hasAllPermissions: jest.fn(() => false),
    })

    render(
      <PermissionGuard permission="camp:view" fallback={<div>Custom Fallback</div>}>
        <div>Protected Content</div>
      </PermissionGuard>
    )

    expect(screen.getByText('Custom Fallback')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})
