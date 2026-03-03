/**
 * 权限常量单元测试
 */
import {
  Permission,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isSuperAdmin,
  canAccessPage,
  rolePermissions,
} from '../permissions'

describe('permissions', () => {
  describe('hasPermission', () => {
    it('超级管理员应该有所有权限', () => {
      expect(hasPermission('超级管理员', Permission.CAMP_VIEW)).toBe(true)
      expect(hasPermission('超级管理员', Permission.CAMP_CREATE)).toBe(true)
      expect(hasPermission('超级管理员', Permission.CAMP_EDIT)).toBe(true)
      expect(hasPermission('超级管理员', Permission.CAMP_DELETE)).toBe(true)
    })

    it('营地管理员应该有学员和房间权限', () => {
      expect(hasPermission('营地管理员', Permission.STUDENT_VIEW)).toBe(true)
      expect(hasPermission('营地管理员', Permission.STUDENT_CREATE)).toBe(true)
      expect(hasPermission('营地管理员', Permission.ROOM_VIEW)).toBe(true)
    })

    it('营地管理员不应该有营地管理权限', () => {
      expect(hasPermission('营地管理员', Permission.CAMP_VIEW)).toBe(false)
      expect(hasPermission('营地管理员', Permission.CAMP_CREATE)).toBe(false)
    })

    it('后勤管理员应该有后勤相关权限', () => {
      expect(hasPermission('后勤管理', Permission.RECIPE_VIEW)).toBe(true)
      expect(hasPermission('后勤管理', Permission.RECIPE_CREATE)).toBe(true)
      expect(hasPermission('后勤管理', Permission.FINANCE_VIEW)).toBe(true)
    })

    it('教练管理员应该有课程和教练管理相关权限', () => {
      expect(hasPermission('教练管理', Permission.COURSE_VIEW)).toBe(true)
      expect(hasPermission('教练管理', Permission.COURSE_CREATE)).toBe(true)
      expect(hasPermission('教练管理', Permission.USER_VIEW)).toBe(true)
    })
  })

  describe('hasAnyPermission', () => {
    it('应该检查是否有任一权限', () => {
      expect(
        hasAnyPermission('超级管理员', [
          Permission.CAMP_VIEW,
          Permission.CAMP_CREATE,
        ])
      ).toBe(true)

      expect(
        hasAnyPermission('营地管理员', [
          Permission.CAMP_VIEW,
          Permission.STUDENT_VIEW,
        ])
      ).toBe(true)

      expect(
        hasAnyPermission('营地管理员', [
          Permission.CAMP_VIEW,
          Permission.CAMP_CREATE,
        ])
      ).toBe(false)
    })
  })

  describe('hasAllPermissions', () => {
    it('应该检查是否有所有权限', () => {
      expect(
        hasAllPermissions('超级管理员', [
          Permission.CAMP_VIEW,
          Permission.CAMP_CREATE,
        ])
      ).toBe(true)

      expect(
        hasAllPermissions('营地管理员', [
          Permission.STUDENT_VIEW,
          Permission.STUDENT_CREATE,
        ])
      ).toBe(true)

      expect(
        hasAllPermissions('营地管理员', [
          Permission.CAMP_VIEW,
          Permission.STUDENT_VIEW,
        ])
      ).toBe(false)
    })
  })

  describe('isSuperAdmin', () => {
    it('应该正确识别超级管理员', () => {
      expect(isSuperAdmin('超级管理员')).toBe(true)
      expect(isSuperAdmin('营地管理员')).toBe(false)
      expect(isSuperAdmin('后勤管理')).toBe(false)
      expect(isSuperAdmin('教练管理')).toBe(false)
    })
  })

  describe('canAccessPage', () => {
    it('超级管理员应该可以访问所有页面', () => {
      expect(canAccessPage('超级管理员', '/camp-manage')).toBe(true)
      expect(canAccessPage('超级管理员', '/user')).toBe(true)
      expect(canAccessPage('超级管理员', '/student')).toBe(true)
    })

    it('营地管理员不应该访问营地管理页面', () => {
      expect(canAccessPage('营地管理员', '/camp-manage')).toBe(false)
      expect(canAccessPage('营地管理员', '/room-manage/room-type')).toBe(false)
    })

    it('营地管理员应该可以访问其他页面', () => {
      expect(canAccessPage('营地管理员', '/student')).toBe(true)
      expect(canAccessPage('营地管理员', '/user')).toBe(true)
    })

    it('后勤管理员应该只能访问后勤相关页面', () => {
      expect(canAccessPage('后勤管理', '/')).toBe(true)
      expect(canAccessPage('后勤管理', '/logistics')).toBe(true)
      expect(canAccessPage('后勤管理', '/logistics/recipe')).toBe(true)
      expect(canAccessPage('后勤管理', '/camp-manage')).toBe(false)
      expect(canAccessPage('后勤管理', '/student')).toBe(false)
    })

    it('教练管理员应该只能访问教练相关页面', () => {
      expect(canAccessPage('教练管理', '/')).toBe(true)
      expect(canAccessPage('教练管理', '/coach')).toBe(true)
      expect(canAccessPage('教练管理', '/coach/manage')).toBe(true)
      expect(canAccessPage('教练管理', '/coach/private')).toBe(true)
      expect(canAccessPage('教练管理', '/camp-manage')).toBe(false)
      expect(canAccessPage('教练管理', '/student')).toBe(false)
    })
  })

  describe('rolePermissions', () => {
    it('应该为每个角色定义权限', () => {
      expect(rolePermissions['超级管理员']).toBeDefined()
      expect(rolePermissions['营地管理员']).toBeDefined()
      expect(rolePermissions['后勤管理']).toBeDefined()
      expect(rolePermissions['教练管理']).toBeDefined()
    })

    it('超级管理员应该有最多权限', () => {
      const superAdminPerms = rolePermissions['超级管理员']
      const campAdminPerms = rolePermissions['营地管理员']

      expect(superAdminPerms.length).toBeGreaterThan(campAdminPerms.length)
    })
  })
})
