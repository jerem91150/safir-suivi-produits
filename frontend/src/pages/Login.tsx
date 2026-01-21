import React from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../theme/colors';

const { Title, Text, Paragraph } = Typography;

interface LoginFormValues {
  login: string;
  password: string;
}

const Login: React.FC = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onFinish = async (values: LoginFormValues) => {
    try {
      await login(values.login, values.password);
      message.success('Connexion réussie');
      navigate('/');
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Erreur de connexion');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${COLORS.darkBlue} 0%, ${COLORS.dark} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Motifs décoratifs */}
      <div
        style={{
          position: 'absolute',
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.primary}20 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.primaryLight}15 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      {/* Triangle décoratif style SAFIR */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: 0,
          height: 0,
          borderLeft: '60px solid transparent',
          borderRight: '60px solid transparent',
          borderBottom: `100px solid ${COLORS.primaryLight}20`,
          pointerEvents: 'none',
        }}
      />

      {/* Panneau gauche - Branding */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 48,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 500 }}>
          {/* Logo SAFIR */}
          <img
            src="/logos/safir.png"
            alt="SAFIR"
            style={{
              height: 80,
              marginBottom: 32,
              filter: 'brightness(0) invert(1)',
            }}
          />

          <Title
            level={2}
            style={{
              color: COLORS.primaryLight,
              fontWeight: 500,
              marginBottom: 24,
              letterSpacing: '1px',
            }}
          >
            Suivi Produits
          </Title>

          <Paragraph
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 16,
              lineHeight: 1.8,
              maxWidth: 400,
              margin: '0 auto',
            }}
          >
            Plateforme de traçabilité des évolutions produits et configurations.
            Base de connaissance partagée entre les services.
          </Paragraph>

          {/* Services */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 32,
              marginTop: 48,
              padding: '24px 0',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {[
              { value: 'SAV', label: 'Service' },
              { value: 'R&D', label: 'Innovation' },
              { value: 'PROD', label: 'Fabrication' },
              { value: 'MÉTH', label: 'Méthodes' },
            ].map((stat, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: COLORS.primaryLight,
                    letterSpacing: '0.5px',
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 11, marginTop: 4 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panneau droit - Formulaire */}
      <div
        style={{
          width: 480,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 48,
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Card
          style={{
            width: '100%',
            maxWidth: 380,
            background: '#fff',
            borderRadius: 16,
            border: 'none',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          }}
          styles={{ body: { padding: 40 } }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Title level={3} style={{ marginBottom: 8, color: COLORS.dark }}>
              Connexion
            </Title>
            <Text type="secondary">
              Accédez à votre espace de travail
            </Text>
          </div>

          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            requiredMark={false}
          >
            <Form.Item
              name="login"
              rules={[{ required: true, message: 'Identifiant requis' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: COLORS.gray[400] }} />}
                placeholder="Identifiant"
                autoComplete="username"
                style={{
                  borderRadius: 8,
                  height: 48,
                  fontSize: 15,
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Mot de passe requis' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: COLORS.gray[400] }} />}
                placeholder="Mot de passe"
                autoComplete="current-password"
                style={{
                  borderRadius: 8,
                  height: 48,
                  fontSize: 15,
                }}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                style={{
                  height: 48,
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
                  border: 'none',
                  boxShadow: `0 8px 20px ${COLORS.primary}40`,
                }}
              >
                Se connecter
              </Button>
            </Form.Item>
          </Form>

          <div
            style={{
              textAlign: 'center',
              marginTop: 24,
              paddingTop: 20,
              borderTop: `1px solid ${COLORS.gray[200]}`,
            }}
          >
            <Text type="secondary" style={{ fontSize: 13 }}>
              Problème de connexion ?{' '}
              <span style={{ color: COLORS.primary }}>Contactez l'administrateur</span>
            </Text>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 48,
          color: 'rgba(255,255,255,0.4)',
          fontSize: 12,
        }}
      >
        © {new Date().getFullYear()} SAFIR - La Porte de Parking
      </div>
    </div>
  );
};

export default Login;
