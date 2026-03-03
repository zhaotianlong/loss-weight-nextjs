# Ant Design 集成指南

## 📦 安装步骤

### 1. 安装依赖包
```bash
npm install antd @ant-design/icons
```

### 2. 配置 Next.js

已在 `app/layout.tsx` 中配置 Ant Design 主题：

```typescript
import { ConfigProvider, AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <ConfigProvider locale={zhCN}>
          <AntdApp>{children}</AntdApp>
        </ConfigProvider>
      </body>
    </html>
  );
}
```

### 3. 禁用 Tailwind CSS 冲突

在 `tailwind.config.ts` 中禁用 preflight：

```typescript
export default {
  corePlugins: {
    preflight: false,
  },
};
```

## 🎨 主题配置

已配置的主题颜色：

```typescript
theme={{
  token: {
    colorPrimary: '#1890ff',      // 主色
    colorSuccess: '#52c41a',      // 成功色
    colorWarning: '#faad14',      // 警告色
    colorError: '#ff4d4f',        // 错误色
    colorInfo: '#1890ff',         // 信息色
  },
}}
```

## 📋 已集成的页面

### ✅ 已更新为 Ant Design
- ✅ 仪表板布局 (`app/dashboard/layout.tsx`)
- ✅ 仪表板首页 (`app/dashboard/page.tsx`)
- ✅ 学员管理页面 (`app/dashboard/students/page.tsx`)
- ✅ 课程管理页面 (`app/dashboard/courses/page.tsx`)

### 📝 待更新页面（框架已准备）
- 菜谱管理 (`app/dashboard/recipes/`)
- 费用管理 (`app/dashboard/tuition/`)
- 营地管理 (`app/dashboard/camps/`)
- 员工管理 (`app/dashboard/staff/`)
- 报表统计 (`app/dashboard/reports/`)

## 🔧 常用 Ant Design 组件

### 表单
```typescript
import { Form, Input, Button, Select, DatePicker } from 'antd';
```

### 数据展示
```typescript
import { Table, Card, List, Statistic, Tree } from 'antd';
```

### 反馈
```typescript
import { Modal, Drawer, Notification, Message, Popconfirm } from 'antd';
```

### 导航
```typescript
import { Menu, Tabs, Breadcrumb, Pagination } from 'antd';
```

### 布局
```typescript
import { Layout, Row, Col, Space, Divider } from 'antd';
```

### 其他
```typescript
import { Badge, Tag, Avatar, Empty, Spin, Progress } from 'antd';
```

## 📐 Layout 组件示例

```typescript
import { Layout } from 'antd';

const { Header, Sider, Content, Footer } = Layout;

export default function MyLayout() {
  return (
    <Layout>
      <Sider width={200}>侧边栏</Sider>
      <Layout>
        <Header>顶部栏</Header>
        <Content>主要内容</Content>
        <Footer>底部</Footer>
      </Layout>
    </Layout>
  );
}
```

## 📊 Table 组件示例

```typescript
import { Table } from 'antd';

const columns = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '年龄',
    dataIndex: 'age',
    key: 'age',
  },
];

const data = [
  { key: '1', name: '张三', age: 28 },
  { key: '2', name: '李四', age: 30 },
];

export default function MyTable() {
  return <Table dataSource={data} columns={columns} />;
}
```

## 🎯 表单集成示例

```typescript
import { Form, Input, Button } from 'antd';

export default function MyForm() {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Success:', values);
  };

  return (
    <Form form={form} onFinish={onFinish} layout="vertical">
      <Form.Item
        label="用户名"
        name="username"
        rules={[{ required: true, message: '请输入用户名' }]}
      >
        <Input placeholder="输入用户名" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Form.Item>
    </Form>
  );
}
```

## 🎨 图标使用

```typescript
import {
  UserOutlined,
  HomeOutlined,
  SettingOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  PlusOutlined,
} from '@ant-design/icons';

// 在组件中使用
<Button icon={<PlusOutlined />}>新增</Button>
```

## 🔍 更多资源

- [Ant Design 官网](https://ant.design/)
- [Ant Design 组件库](https://ant.design/components/overview/)
- [Ant Design Icons](https://ant.design/components/icon/)
- [Ant Design Pro 模板](https://pro.ant.design/)

## 💡 最佳实践

1. **使用 ConfigProvider** - 全局配置主题和国际化
2. **使用 message/notification** - 进行用户反馈
3. **使用 Form 组件** - 简化表单开发
4. **使用 Table 组件** - 高效展示数据
5. **响应式设计** - 使用 Row/Col 进行响应式布局
6. **保持一致性** - 遵循 Ant Design 的设计规范

## 🚀 下一步

继续使用 Ant Design 组件完成其他页面的开发：

1. 菜谱管理页面
2. 费用管理页面
3. 营地管理页面
4. 员工管理页面
5. 报表统计页面

所有页面使用 Ant Design 组件库进行开发，确保 UI 一致性和用户体验。

