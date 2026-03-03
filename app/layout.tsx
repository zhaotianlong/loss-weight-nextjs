import type { Metadata } from 'next';
import AntdProvider from './antd-provider';
import InitMock from '@/mocks/InitMock';
import { UserProvider } from '@/contexts/UserContext';
import AuthGuard from '@/components/AuthGuard';
import MainLayout from '@/components/MainLayout';
import './globals.css';

export const metadata: Metadata = {
  title: '减肥训练营管理系统',
  description: '专业的减肥训练营管理后台系统',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdProvider>
          <InitMock>
            <UserProvider>
              <AuthGuard>
                <MainLayout>{children}</MainLayout>
              </AuthGuard>
            </UserProvider>
          </InitMock>
        </AntdProvider>
      </body>
    </html>
  );
}
