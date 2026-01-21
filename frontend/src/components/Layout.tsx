import React, { useState } from 'react';
import {
  Layout as AntLayout,
  Menu,
  Avatar,
  Typography,
  Space,
  Dropdown,
  Badge,
  Tooltip,
  theme,
} from 'antd';
import {
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
  TeamOutlined,
  DashboardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  BellOutlined,
  SearchOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../theme/colors';

const { Header, Sider, Content } = AntLayout;
const { Text } = Typography;

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin, canEdit } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Tableau de bord',
    },
    {
      key: '/fiches',
      icon: <FileTextOutlined />,
      label: 'Fiches de suivi',
      onClick: () => navigate('/'),
    },
    ...(isAdmin
      ? [
          {
            type: 'divider' as const,
          },
          {
            key: '/users',
            icon: <TeamOutlined />,
            label: 'Utilisateurs',
          },
          {
            key: '/settings',
            icon: <SettingOutlined />,
            label: 'Paramètres',
          },
          {
            key: '/developer',
            icon: <CodeOutlined />,
            label: 'Développeur',
          },
        ]
      : []),
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Mon profil',
      disabled: true,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Déconnexion',
      danger: true,
      onClick: handleLogout,
    },
  ];

  const getRoleBadge = () => {
    if (isAdmin) return { color: COLORS.accent, text: 'Admin' };
    if (canEdit) return { color: COLORS.primary, text: 'Éditeur' };
    return { color: COLORS.primaryLight, text: 'Lecteur' };
  };

  const roleBadge = getRoleBadge();

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        style={{
          background: COLORS.darkBlue,
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          overflow: 'auto',
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0 16px' : '0 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        >
          {collapsed ? (
            <div
              style={{
                width: 36,
                height: 36,
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>S</span>
            </div>
          ) : (
            <img
              src="/logos/safir.png"
              alt="SAFIR"
              style={{
                height: 32,
                filter: 'brightness(0) invert(1)',
              }}
            />
          )}
        </div>

        {/* Menu */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname === '/' ? '/fiches' : location.pathname]}
          items={menuItems}
          onClick={({ key }) => {
            if (key === '/fiches') {
              navigate('/');
            } else {
              navigate(key);
            }
          }}
          style={{
            background: 'transparent',
            borderRight: 'none',
            marginTop: 16,
          }}
          theme="dark"
        />

        {/* User info en bas du sidebar */}
        {!collapsed && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: 16,
              borderTop: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
                }}
                icon={<UserOutlined />}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: '#fff',
                    fontWeight: 500,
                    fontSize: 14,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.nom}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: roleBadge.color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {roleBadge.text}
                </div>
              </div>
            </div>
          </div>
        )}
      </Sider>

      <AntLayout style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.2s' }}>
        {/* Header */}
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 99,
            height: 64,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Tooltip title={collapsed ? 'Ouvrir le menu' : 'Réduire le menu'}>
              <div
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: COLORS.gray[600],
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = COLORS.gray[100];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {collapsed ? <MenuUnfoldOutlined style={{ fontSize: 18 }} /> : <MenuFoldOutlined style={{ fontSize: 18 }} />}
              </div>
            </Tooltip>

            {/* Breadcrumb / Title */}
            <div>
              <Text strong style={{ fontSize: 16, color: COLORS.dark }}>
                {location.pathname === '/' && 'Fiches de suivi'}
                {location.pathname === '/users' && 'Gestion des utilisateurs'}
                {location.pathname === '/settings' && 'Paramètres'}
                {location.pathname === '/developer' && 'Journal des évolutions'}
                {location.pathname.startsWith('/fiches/') && location.pathname.includes('/edit') && 'Modifier la fiche'}
                {location.pathname === '/fiches/new' && 'Nouvelle fiche'}
                {location.pathname.match(/^\/fiches\/\d+$/) && 'Détail de la fiche'}
              </Text>
            </div>
          </div>

          <Space size={8}>
            {/* Search */}
            <Tooltip title="Rechercher">
              <div
                style={{
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                  cursor: 'pointer',
                  color: COLORS.gray[500],
                }}
              >
                <SearchOutlined style={{ fontSize: 18 }} />
              </div>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <Badge count={0} size="small">
                <div
                  style={{
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    cursor: 'pointer',
                    color: COLORS.gray[500],
                  }}
                >
                  <BellOutlined style={{ fontSize: 18 }} />
                </div>
              </Badge>
            </Tooltip>

            <div style={{ width: 1, height: 24, background: COLORS.gray[200], margin: '0 8px' }} />

            {/* User dropdown */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 12px 4px 4px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = COLORS.gray[100];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Avatar
                  size={36}
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
                  }}
                  icon={<UserOutlined />}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text strong style={{ fontSize: 13, lineHeight: 1.3 }}>{user?.nom}</Text>
                  <Text type="secondary" style={{ fontSize: 11, lineHeight: 1.2 }}>{roleBadge.text}</Text>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* Content */}
        <Content
          style={{
            padding: 24,
            background: COLORS.background.default,
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <div style={{ maxWidth: 1600, margin: '0 auto' }}>
            <Outlet />
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
