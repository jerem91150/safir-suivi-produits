import React, { useState } from 'react';
import {
  Card,
  Typography,
  Timeline,
  Tag,
  Space,
  Divider,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Empty,
  Tooltip,
} from 'antd';
import {
  CodeOutlined,
  RocketOutlined,
  BugOutlined,
  ToolOutlined,
  PlusOutlined,
  CalendarOutlined,
  TagOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { COLORS } from '../theme/colors';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ChangelogEntry {
  id: string;
  version: string;
  date: string;
  type: 'feature' | 'bugfix' | 'improvement' | 'breaking';
  title: string;
  description: string;
  status: 'done' | 'in-progress' | 'planned';
}

// Données initiales du changelog
const initialChangelog: ChangelogEntry[] = [
  {
    id: '1',
    version: '0.1.0',
    date: '2025-01-15',
    type: 'feature',
    title: 'Version initiale MVP',
    description: 'Lancement de la plateforme SAFIR Suivi Produits avec les fonctionnalités de base : gestion des fiches de suivi, authentification JWT, upload de fichiers.',
    status: 'done',
  },
  {
    id: '2',
    version: '0.1.0',
    date: '2025-01-15',
    type: 'feature',
    title: 'Gestion des utilisateurs',
    description: 'Interface d\'administration pour créer, modifier et supprimer les utilisateurs avec gestion des rôles (Lecteur, Éditeur, Admin).',
    status: 'done',
  },
  {
    id: '3',
    version: '0.1.0',
    date: '2025-01-15',
    type: 'improvement',
    title: 'Interface visuelle SAFIR',
    description: 'Refonte complète de l\'interface avec la charte graphique SAFIR : couleurs officielles, logo, design moderne.',
    status: 'done',
  },
  {
    id: '4',
    version: '0.2.0',
    date: '2025-01-20',
    type: 'feature',
    title: 'Recherche avancée',
    description: 'Ajout de filtres avancés sur les fiches : par gamme, modèle, date, et recherche textuelle.',
    status: 'planned',
  },
  {
    id: '5',
    version: '1.0.0',
    date: '2025-02-01',
    type: 'feature',
    title: 'Authentification SSO/LDAP',
    description: 'Intégration avec l\'Active Directory pour l\'authentification unique des utilisateurs.',
    status: 'planned',
  },
];

const Developer: React.FC = () => {
  const { isAdmin } = useAuth();
  const [changelog, setChangelog] = useState<ChangelogEntry[]>(initialChangelog);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const getTypeConfig = (type: ChangelogEntry['type']) => {
    switch (type) {
      case 'feature':
        return { color: COLORS.primary, icon: <RocketOutlined />, label: 'Nouvelle fonctionnalité' };
      case 'bugfix':
        return { color: COLORS.error, icon: <BugOutlined />, label: 'Correction de bug' };
      case 'improvement':
        return { color: COLORS.success, icon: <ToolOutlined />, label: 'Amélioration' };
      case 'breaking':
        return { color: COLORS.warning, icon: <ExclamationCircleOutlined />, label: 'Breaking change' };
      default:
        return { color: COLORS.gray[500], icon: <CodeOutlined />, label: 'Autre' };
    }
  };

  const getStatusConfig = (status: ChangelogEntry['status']) => {
    switch (status) {
      case 'done':
        return { color: 'success', icon: <CheckCircleOutlined />, label: 'Terminé' };
      case 'in-progress':
        return { color: 'processing', icon: <ClockCircleOutlined />, label: 'En cours' };
      case 'planned':
        return { color: 'default', icon: <CalendarOutlined />, label: 'Planifié' };
      default:
        return { color: 'default', icon: <ClockCircleOutlined />, label: 'Inconnu' };
    }
  };

  const handleAddEntry = (values: any) => {
    const newEntry: ChangelogEntry = {
      id: Date.now().toString(),
      version: values.version,
      date: values.date.format('YYYY-MM-DD'),
      type: values.type,
      title: values.title,
      description: values.description,
      status: values.status,
    };
    setChangelog([newEntry, ...changelog]);
    setIsModalOpen(false);
    form.resetFields();
    message.success('Entrée ajoutée au changelog');
  };

  const handleDeleteEntry = (id: string) => {
    setChangelog(changelog.filter(entry => entry.id !== id));
    message.success('Entrée supprimée');
  };

  // Grouper par version
  const groupedByVersion = changelog.reduce((acc, entry) => {
    if (!acc[entry.version]) {
      acc[entry.version] = [];
    }
    acc[entry.version].push(entry);
    return acc;
  }, {} as Record<string, ChangelogEntry[]>);

  // Trier les versions (plus récente en premier)
  const sortedVersions = Object.keys(groupedByVersion).sort((a, b) => {
    const partsA = a.split('.').map(Number);
    const partsB = b.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      if (partsA[i] !== partsB[i]) return partsB[i] - partsA[i];
    }
    return 0;
  });

  // Stats
  const stats = {
    total: changelog.length,
    done: changelog.filter(e => e.status === 'done').length,
    inProgress: changelog.filter(e => e.status === 'in-progress').length,
    planned: changelog.filter(e => e.status === 'planned').length,
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            <CodeOutlined style={{ marginRight: 12, color: COLORS.primary }} />
            Journal des évolutions
          </Title>
          <Text type="secondary">Suivi des développements et changements de la plateforme</Text>
        </div>
        {isAdmin && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
              border: 'none',
            }}
          >
            Ajouter une entrée
          </Button>
        )}
      </div>

      {/* Stats cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card
            size="small"
            style={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.primary }}>{stats.total}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>Total entrées</Text>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            size="small"
            style={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.success }}>{stats.done}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>Terminées</Text>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            size="small"
            style={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.info }}>{stats.inProgress}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>En cours</Text>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            size="small"
            style={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.gray[500] }}>{stats.planned}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>Planifiées</Text>
          </Card>
        </Col>
      </Row>

      {/* Changelog par version */}
      {sortedVersions.length === 0 ? (
        <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Empty description="Aucune entrée dans le changelog" />
        </Card>
      ) : (
        sortedVersions.map((version) => (
          <Card
            key={version}
            style={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Tag
                color={COLORS.primary}
                style={{
                  fontSize: 14,
                  padding: '4px 12px',
                  borderRadius: 6,
                  margin: 0,
                }}
              >
                <TagOutlined style={{ marginRight: 6 }} />
                v{version}
              </Tag>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {groupedByVersion[version].length} changement(s)
              </Text>
            </div>

            <Timeline
              items={groupedByVersion[version].map((entry) => {
                const typeConfig = getTypeConfig(entry.type);
                const statusConfig = getStatusConfig(entry.status);
                return {
                  dot: (
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: `${typeConfig.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: typeConfig.color,
                        fontSize: 14,
                      }}
                    >
                      {typeConfig.icon}
                    </div>
                  ),
                  children: (
                    <div style={{ paddingBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <Text strong style={{ fontSize: 15 }}>{entry.title}</Text>
                        <Tag color={typeConfig.color} style={{ margin: 0 }}>
                          {typeConfig.label}
                        </Tag>
                        <Tag icon={statusConfig.icon} color={statusConfig.color} style={{ margin: 0 }}>
                          {statusConfig.label}
                        </Tag>
                        {isAdmin && (
                          <Tooltip title="Supprimer">
                            <Button
                              type="text"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDeleteEntry(entry.id)}
                              style={{ marginLeft: 'auto' }}
                            />
                          </Tooltip>
                        )}
                      </div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        {dayjs(entry.date).format('DD MMMM YYYY')}
                      </Text>
                      <Paragraph
                        style={{
                          marginTop: 8,
                          marginBottom: 0,
                          color: COLORS.gray[700],
                          fontSize: 14,
                        }}
                      >
                        {entry.description}
                      </Paragraph>
                    </div>
                  ),
                };
              })}
            />
          </Card>
        ))
      )}

      {/* Roadmap résumée */}
      <Divider />
      <Card
        title={
          <Space>
            <RocketOutlined style={{ color: COLORS.accent }} />
            <span>Roadmap</span>
          </Space>
        }
        style={{
          borderRadius: 12,
          border: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <Row gutter={[24, 16]}>
          <Col xs={24} md={8}>
            <div
              style={{
                padding: 16,
                background: `${COLORS.success}10`,
                borderRadius: 8,
                borderLeft: `4px solid ${COLORS.success}`,
              }}
            >
              <Text strong style={{ color: COLORS.success }}>v0.1.0 - MVP</Text>
              <div style={{ marginTop: 8, color: COLORS.gray[600], fontSize: 13 }}>
                <div>✓ Gestion des fiches de suivi</div>
                <div>✓ Authentification JWT</div>
                <div>✓ Upload de fichiers</div>
                <div>✓ Gestion des utilisateurs</div>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div
              style={{
                padding: 16,
                background: `${COLORS.info}10`,
                borderRadius: 8,
                borderLeft: `4px solid ${COLORS.info}`,
              }}
            >
              <Text strong style={{ color: COLORS.info }}>v0.2.0 - Améliorations</Text>
              <div style={{ marginTop: 8, color: COLORS.gray[600], fontSize: 13 }}>
                <div>○ Recherche avancée</div>
                <div>○ Export PDF/Excel</div>
                <div>○ Notifications</div>
                <div>○ Historique des modifications</div>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div
              style={{
                padding: 16,
                background: `${COLORS.accent}10`,
                borderRadius: 8,
                borderLeft: `4px solid ${COLORS.accent}`,
              }}
            >
              <Text strong style={{ color: COLORS.accent }}>v1.0.0 - Production</Text>
              <div style={{ marginTop: 8, color: COLORS.gray[600], fontSize: 13 }}>
                <div>○ SSO / LDAP Active Directory</div>
                <div>○ Import données Excel</div>
                <div>○ API REST documentée</div>
                <div>○ Dashboard analytics</div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Modal ajout entrée */}
      <Modal
        title="Ajouter une entrée au changelog"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddEntry}
          initialValues={{
            status: 'planned',
            type: 'feature',
            date: dayjs(),
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="version"
                label="Version"
                rules={[{ required: true, message: 'Version requise' }]}
              >
                <Input placeholder="Ex: 1.2.0" prefix={<TagOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: 'Date requise' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Type"
                rules={[{ required: true }]}
              >
                <Select>
                  <Select.Option value="feature">
                    <Space><RocketOutlined style={{ color: COLORS.primary }} /> Nouvelle fonctionnalité</Space>
                  </Select.Option>
                  <Select.Option value="improvement">
                    <Space><ToolOutlined style={{ color: COLORS.success }} /> Amélioration</Space>
                  </Select.Option>
                  <Select.Option value="bugfix">
                    <Space><BugOutlined style={{ color: COLORS.error }} /> Correction de bug</Space>
                  </Select.Option>
                  <Select.Option value="breaking">
                    <Space><ExclamationCircleOutlined style={{ color: COLORS.warning }} /> Breaking change</Space>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Statut"
                rules={[{ required: true }]}
              >
                <Select>
                  <Select.Option value="done">
                    <Space><CheckCircleOutlined style={{ color: COLORS.success }} /> Terminé</Space>
                  </Select.Option>
                  <Select.Option value="in-progress">
                    <Space><ClockCircleOutlined style={{ color: COLORS.info }} /> En cours</Space>
                  </Select.Option>
                  <Select.Option value="planned">
                    <Space><CalendarOutlined /> Planifié</Space>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="title"
            label="Titre"
            rules={[{ required: true, message: 'Titre requis' }]}
          >
            <Input placeholder="Titre de la modification" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Description requise' }]}
          >
            <TextArea rows={4} placeholder="Description détaillée de la modification..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Annuler</Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
                  border: 'none',
                }}
              >
                Ajouter
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Developer;
