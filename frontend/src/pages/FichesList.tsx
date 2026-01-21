import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Card,
  Input,
  Select,
  Button,
  Space,
  Tag,
  message,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Typography,
  Empty,
  Tooltip,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PaperClipOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { fichesApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../theme/colors';

const { Text, Title } = Typography;

interface Fiche {
  id: number;
  reference: string;
  gamme: string;
  modele: string;
  titre: string;
  description: string | null;
  matricules: string | null;
  createdAt: string;
  updatedAt: string;
  createur: { id: number; nom: string };
  piecesJointes: { id: number; nomFichier: string; typeMime: string }[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Card de statistique personnalisée
const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: number | string;
  color: string;
  suffix?: string;
}> = ({ icon, title, value, color, suffix }) => (
  <Card
    style={{
      borderRadius: 16,
      border: 'none',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      height: '100%',
    }}
    styles={{ body: { padding: 20 } }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
          fontSize: 22,
        }}
      >
        {icon}
      </div>
      <div>
        <Text type="secondary" style={{ fontSize: 13 }}>{title}</Text>
        <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.dark, lineHeight: 1.2, marginTop: 4 }}>
          {value}
          {suffix && <span style={{ fontSize: 14, fontWeight: 400, marginLeft: 4 }}>{suffix}</span>}
        </div>
      </div>
    </div>
  </Card>
);

const FichesList: React.FC = () => {
  const navigate = useNavigate();
  const { canEdit } = useAuth();

  const [fiches, setFiches] = useState<Fiche[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Filtres
  const [search, setSearch] = useState('');
  const [gamme, setGamme] = useState<string | undefined>();
  const [modele, setModele] = useState<string | undefined>();
  const [filters, setFilters] = useState<{ gammes: string[]; modeles: string[] }>({
    gammes: [],
    modeles: [],
  });

  // Stats
  const [stats, setStats] = useState({
    totalFiches: 0,
    totalGammes: 0,
    recentUpdates: 0,
  });

  const loadFiches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fichesApi.list({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        gamme,
        modele,
      });
      setFiches(response.data.data);
      setPagination(response.data.pagination);
      setStats((prev) => ({ ...prev, totalFiches: response.data.pagination.total }));
    } catch (error) {
      message.error('Erreur lors du chargement des fiches');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, gamme, modele]);

  const loadFilters = async () => {
    try {
      const response = await fichesApi.getFilters();
      setFilters(response.data);
      setStats((prev) => ({
        ...prev,
        totalGammes: response.data.gammes.length,
      }));
    } catch (error) {
      console.error('Erreur chargement filtres:', error);
    }
  };

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadFiches();
  }, [loadFiches]);

  // Calculer les mises à jour récentes (7 derniers jours)
  useEffect(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recent = fiches.filter((f) => new Date(f.updatedAt) > sevenDaysAgo).length;
    setStats((prev) => ({ ...prev, recentUpdates: recent }));
  }, [fiches]);

  const handleDelete = async (id: number) => {
    try {
      await fichesApi.delete(id);
      message.success('Fiche supprimée');
      loadFiches();
    } catch (error) {
      message.error('Erreur lors de la suppression');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setGamme(undefined);
    setModele(undefined);
  };

  const hasFilters = search || gamme || modele;

  const columns = [
    {
      title: 'Référence',
      dataIndex: 'reference',
      key: 'reference',
      width: 130,
      render: (text: string) => (
        <Tag
          style={{
            background: `${COLORS.primary}15`,
            color: COLORS.primary,
            border: 'none',
            fontWeight: 600,
            borderRadius: 6,
            padding: '2px 10px',
          }}
        >
          {text}
        </Tag>
      ),
    },
    {
      title: 'Titre',
      dataIndex: 'titre',
      key: 'titre',
      ellipsis: true,
      render: (text: string, record: Fiche) => (
        <div>
          <div style={{ fontWeight: 500, color: COLORS.dark }}>{text}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.gamme} • {record.modele}
          </Text>
        </div>
      ),
    },
    {
      title: 'Créateur',
      dataIndex: ['createur', 'nom'],
      key: 'createur',
      width: 150,
      render: (text: string) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Fichiers',
      key: 'piecesJointes',
      width: 90,
      align: 'center' as const,
      render: (_: any, record: Fiche) =>
        record.piecesJointes.length > 0 ? (
          <Badge
            count={record.piecesJointes.length}
            style={{ backgroundColor: COLORS.info }}
            size="small"
          >
            <PaperClipOutlined style={{ fontSize: 16, color: COLORS.gray[400] }} />
          </Badge>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: 'Mise à jour',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 130,
      render: (date: string) => {
        const d = new Date(date);
        const isRecent = (Date.now() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
        return (
          <Tooltip title={d.toLocaleString('fr-FR')}>
            <Text type="secondary" style={{ color: isRecent ? COLORS.success : undefined }}>
              {d.toLocaleDateString('fr-FR')}
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 120,
      render: (_: any, record: Fiche) => (
        <Space size={4}>
          <Tooltip title="Voir">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/fiches/${record.id}`);
              }}
              style={{ color: COLORS.gray[500] }}
            />
          </Tooltip>
          {canEdit && (
            <>
              <Tooltip title="Modifier">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/fiches/${record.id}/edit`);
                  }}
                  style={{ color: COLORS.info }}
                />
              </Tooltip>
              <Popconfirm
                title="Supprimer cette fiche ?"
                description="Cette action est irréversible."
                onConfirm={() => handleDelete(record.id)}
                okText="Supprimer"
                cancelText="Annuler"
                okButtonProps={{ danger: true }}
              >
                <Tooltip title="Supprimer">
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Tooltip>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <StatCard
            icon={<FileTextOutlined />}
            title="Total des fiches"
            value={stats.totalFiches}
            color={COLORS.primary}
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            icon={<AppstoreOutlined />}
            title="Gammes de produits"
            value={stats.totalGammes}
            color={COLORS.info}
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            icon={<ClockCircleOutlined />}
            title="Mises à jour récentes"
            value={stats.recentUpdates}
            color={COLORS.success}
            suffix="cette semaine"
          />
        </Col>
      </Row>

      {/* Main Card */}
      <Card
        style={{
          borderRadius: 16,
          border: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
        styles={{ body: { padding: 0 } }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${COLORS.gray[100]}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <Title level={5} style={{ margin: 0 }}>
              Fiches de suivi
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Gérez les évolutions et configurations produits
            </Text>
          </div>
          <Space>
            <Tooltip title="Rafraîchir">
              <Button
                icon={<ReloadOutlined />}
                onClick={loadFiches}
                loading={loading}
              />
            </Tooltip>
            {canEdit && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/fiches/new')}
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
                  border: 'none',
                  boxShadow: `0 4px 12px ${COLORS.primary}40`,
                }}
              >
                Nouvelle fiche
              </Button>
            )}
          </Space>
        </div>

        {/* Filters */}
        <div
          style={{
            padding: '16px 24px',
            background: COLORS.gray[50],
            borderBottom: `1px solid ${COLORS.gray[100]}`,
          }}
        >
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} sm={24} md={10} lg={8}>
              <Input
                placeholder="Rechercher une fiche..."
                prefix={<SearchOutlined style={{ color: COLORS.gray[400] }} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
                style={{ borderRadius: 8 }}
              />
            </Col>
            <Col xs={12} sm={8} md={5} lg={4}>
              <Select
                placeholder="Toutes les gammes"
                value={gamme}
                onChange={setGamme}
                allowClear
                style={{ width: '100%' }}
                suffixIcon={<FilterOutlined />}
              >
                {filters.gammes.map((g) => (
                  <Select.Option key={g} value={g}>
                    {g}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} sm={8} md={5} lg={4}>
              <Select
                placeholder="Tous les modèles"
                value={modele}
                onChange={setModele}
                allowClear
                style={{ width: '100%' }}
              >
                {filters.modeles.map((m) => (
                  <Select.Option key={m} value={m}>
                    {m}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            {hasFilters && (
              <Col>
                <Button type="link" onClick={clearFilters} style={{ color: COLORS.primary }}>
                  Effacer les filtres
                </Button>
              </Col>
            )}
          </Row>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={fiches}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total, range) => (
              <Text type="secondary">
                {range[0]}-{range[1]} sur {total} fiches
              </Text>
            ),
            onChange: (page, pageSize) =>
              setPagination((prev) => ({ ...prev, page, limit: pageSize })),
            style: { padding: '16px 24px', margin: 0 },
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/fiches/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  hasFilters
                    ? 'Aucune fiche ne correspond à vos critères'
                    : 'Aucune fiche de suivi'
                }
              >
                {canEdit && !hasFilters && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/fiches/new')}
                  >
                    Créer la première fiche
                  </Button>
                )}
              </Empty>
            ),
          }}
          style={{ borderRadius: '0 0 16px 16px' }}
        />
      </Card>
    </div>
  );
};

export default FichesList;
