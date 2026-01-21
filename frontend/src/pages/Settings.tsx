import React from 'react';
import {
  Card,
  Typography,
  Descriptions,
  Tag,
  Space,
  Divider,
  Row,
  Col,
} from 'antd';
import {
  SettingOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  InfoCircleOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { COLORS } from '../theme/colors';

const { Title, Text, Paragraph } = Typography;

const Settings: React.FC = () => {
  const appInfo = {
    version: '0.1.0',
    environment: import.meta.env.MODE || 'development',
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          <SettingOutlined style={{ marginRight: 12, color: COLORS.primary }} />
          Paramètres
        </Title>
        <Text type="secondary">Configuration et informations système</Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Informations application */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <InfoCircleOutlined style={{ color: COLORS.primary }} />
                <span>Informations de l'application</span>
              </Space>
            }
            style={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Application">
                <Text strong>SAFIR - Suivi Produits</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Version">
                <Tag color="blue">{appInfo.version}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Environnement">
                <Tag color={appInfo.environment === 'production' ? 'green' : 'orange'}>
                  {appInfo.environment}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="API">
                <Text code style={{ fontSize: 12 }}>{appInfo.apiUrl}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Base de données */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <DatabaseOutlined style={{ color: COLORS.primary }} />
                <span>Base de données</span>
              </Space>
            }
            style={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Type">
                <Text strong>SQLite</Text>
              </Descriptions.Item>
              <Descriptions.Item label="ORM">
                <Text>Prisma 7</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Statut">
                <Tag color="green">Connecté</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Fonctionnalités */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <SafetyCertificateOutlined style={{ color: COLORS.primary }} />
                <span>Fonctionnalités</span>
              </Space>
            }
            style={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Authentification JWT</Text>
                <Tag color="green">Activé</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Upload de fichiers</Text>
                <Tag color="green">Activé</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Prévisualisation images</Text>
                <Tag color="green">Activé</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>SSO / LDAP</Text>
                <Tag color="orange">À venir (v2)</Tag>
              </div>
            </div>
          </Card>
        </Col>

        {/* Rôles et permissions */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <CloudServerOutlined style={{ color: COLORS.primary }} />
                <span>Rôles et permissions</span>
              </Space>
            }
            style={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Tag color={COLORS.accent}>ADMIN</Tag>
                  <Text strong>Administrateur</Text>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Tous les droits : gestion des utilisateurs, création, modification, suppression
                </Text>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Tag color={COLORS.primary}>EDITEUR</Tag>
                  <Text strong>Éditeur</Text>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Création et modification des fiches de suivi
                </Text>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Tag color={COLORS.primaryLight}>LECTEUR</Tag>
                  <Text strong>Lecteur</Text>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Consultation seule des fiches de suivi
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Card
        style={{
          borderRadius: 12,
          border: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          background: COLORS.gray[50],
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <img
            src="/logos/safir.png"
            alt="SAFIR"
            style={{ height: 40, marginBottom: 16 }}
          />
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            SAFIR - La Porte de Parking
            <br />
            Plateforme de suivi des évolutions produits
            <br />
            © {new Date().getFullYear()} - Tous droits réservés
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
