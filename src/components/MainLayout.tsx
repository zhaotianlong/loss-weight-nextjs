'use client';

import React from 'react';
import { ProLayout } from '@ant-design/pro-components';
import { useRouter, usePathname } from 'next/navigation';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  DollarOutlined,
  HomeOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  BankOutlined,
  CalculatorOutlined,
} from '@ant-design/icons';
import { Dropdown } from 'antd';
import type { MenuDataItem } from '@ant-design/pro-components';
import { useUser } from '@/contexts/UserContext';
import { canAccessPage } from '@/constants/permissions';

// 递归过滤菜单项
function filterMenuItems(items: MenuDataItem[], userRole: string): MenuDataItem[] {
  return items
    .filter((item) => {
      // 如果有子菜单，先过滤子菜单
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterMenuItems(item.children, userRole);
        // 如果所有子菜单都被过滤掉，则隐藏父菜单
        if (filteredChildren.length === 0) {
          return false;
        }
        item.children = filteredChildren;
        return true;
      }
      // 检查页面访问权限
      return item.path ? canAccessPage(userRole, item.path) : true;
    })
    .map((item) => {
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: filterMenuItems(item.children, userRole),
        };
      }
      return item;
    });
}

const baseMenuData: MenuDataItem[] = [
  {
    path: '/',
    name: '仪表板',
    icon: <DashboardOutlined />,
  },
  {
    name: '营地管理',
    icon: <HomeOutlined />,
    key: 'camp-management',
    children: [
      {
        path: '/camp-manage',
        name: '营地列表',
      },
      {
        path: '/camp-manage/facility',
        name: '营地设施',
      },
      {
        path: '/camp-manage/schedule',
        name: '营地日程设置',
      },
    ],
  },
  {
    name: '房间管理',
    icon: <BankOutlined />,
    key: 'room-management',
    children: [
      {
        path: '/room-manage/room-list',
        name: '房源管理',
      },
      {
        path: '/room-manage/room-type',
        name: '房间类型',
      },
    ],
  },
  {
    name: '人员管理',
    icon: <TeamOutlined />,
    key: 'user-management',
    children: [
      {
        path: '/user',
        name: '员工管理',
        icon: <UserOutlined />,
      },
      {
        path: '/coach/manage',
        name: '教练管理',
        icon: <TeamOutlined />,
      },
      {
        path: '/student',
        name: '学员管理',
        icon: <TeamOutlined />,
      },
    ],
  },
  {
    name: '教学管理',
    icon: <BookOutlined />,
    key: 'teaching-management',
    children: [
      {
        path: '/coach/course-types',
        name: '课程类型',
      },
      {
        path: '/coach/duty',
        name: '日程排班',
      },
      {
        path: '/coach/performance',
        name: '业绩管理',
      },
    ],
  },
  {
    name: '后勤管理',
    icon: <AppstoreOutlined />,
    key: 'logistics-management',
    children: [
      {
        path: '/logistics/recipe',
        name: '菜谱管理',
        icon: <FileTextOutlined />,
      },
      {
        path: '/logistics/finance',
        name: '财务审核',
        icon: <DollarOutlined />,
      },
      {
        path: '/logistics/salary',
        name: '工资计算',
        icon: <CalculatorOutlined />,
      },
    ],
  },
];

const getMenuState = (data: MenuDataItem[], path: string): { selectedKeys: string[], openKeys: string[] } => {
  let selectedKeys: string[] = [];
  let openKeys: string[] = [];

  const traverse = (items: MenuDataItem[], parents: string[]) => {
    for (const item of items) {
      const currentKey = item.key || item.path || '';
      
      if (item.path === path) {
        selectedKeys = [currentKey];
        openKeys = [...parents];
        return true; // Found
      }

      if (item.children) {
        if (traverse(item.children, [...parents, currentKey])) {
          return true;
        }
      }
    }
    return false;
  };

  traverse(data, []);
  return { selectedKeys, openKeys };
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useUser();
  const [openKeys, setOpenKeys] = React.useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);

  React.useEffect(() => {
    const { openKeys: newOpenKeys, selectedKeys: newSelectedKeys } = getMenuState(baseMenuData, pathname);
    if (newOpenKeys.length > 0) {
      setOpenKeys((prev) => [...new Set([...prev, ...newOpenKeys])]);
    }
    if (newSelectedKeys.length > 0) {
      setSelectedKeys(newSelectedKeys);
    }
  }, [pathname]);

  // 登录页面不需要布局，直接返回
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <ProLayout
      title="旅居健身营管理系统"
      logo="https://gw.alipayobjects.com/zos/antfincdn/PmY%24TNNDBI/logo.svg"
      location={{
        pathname,
      }}
      menu={{
        request: async () => {
          const userRole = user?.role || '';
          return filterMenuItems(baseMenuData, userRole);
        },
      }}
      menuProps={{
        selectedKeys,
        openKeys,
        onOpenChange: (keys) => setOpenKeys(keys as string[]),
      }}
      menuItemRender={(item, dom) => (
        <div
          onClick={() => {
            if (item.path) {
              router.push(item.path);
            }
          }}
        >
          {dom}
        </div>
      )}
      avatarProps={{
        src: user?.avatar || 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
        title: user?.name || '用户',
        size: 'small',
        render: (props, dom) => {
          return (
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'profile',
                    label: '个人中心',
                    onClick: () => {
                      router.push('/profile');
                    },
                  },
                  {
                    type: 'divider',
                  },
                  {
                    key: 'logout',
                    label: '退出登录',
                    danger: true,
                    onClick: () => {
                      logout();
                    },
                  },
                ],
              }}
            >
              {dom}
            </Dropdown>
          );
        },
      }}
      actionsRender={() => {
        return [
          
        ];
      }}
      headerTitleRender={(logo) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {logo}
          <div style={{ fontSize: 18, fontWeight: 600 }}>度假健身营管理后台</div>
        </div>
      )}
      layout="mix"
      splitMenus={false}
      fixSiderbar
      navTheme="light"
      contentStyle={{
        minHeight: 'calc(100vh - 56px)',
      }}
    >
      {children}
    </ProLayout>
  );
}