import React, { useState, useEffect } from 'react';
import {
  Card,
  Tag,
  Button,
  Space,
  Spin,
  message,
  Typography,
  Popconfirm,
  Image,
  Row,
  Col,
  Divider,
  Tooltip,
  Breadcrumb,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
} from 'antd';
import dayjs from 'dayjs';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
  AppstoreOutlined,
  HomeOutlined,
  FileTextOutlined,
  ShopOutlined,
  PartitionOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  BarcodeOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fichesApi, uploadsApi, achatsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../theme/colors';

const { Title, Text, Paragraph } = Typography;

interface PieceJointe {
  id: number;
  nomFichier: string;
  chemin: string;
  typeMime: string;
  taille: number;
  createdAt: string;
}

interface AchatTemporaire {
  id: number;
  designation: string;
  fournisseur: string | null;
  quantite: number | null;
  prixUnitaire: number | null;
  dateDebut: string | null;
  dateFin: string | null;
  motif: string | null;
  statut: string;
  createdAt: string;
}

interface Fiche {
  id: number;
  reference: string;
  gamme: string;
  modele: string;
  titre: string;
  description: string | null;
  matricules: string | null;
  fournisseur: string | null;
  sousEnsemble: string | null;
  organe: string | null;
  valideRdLe: string | null;
  enFabricationDepuis: string | null;
  nomPieceTolerie: string | null;
  codeX3: string | null;
  createdAt: string;
  updatedAt: string;
  createur: { id: number; nom: string; email: string | null };
  piecesJointes: PieceJointe[];
  achatsTemporaires: AchatTemporaire[];
}

const getFileIcon = (typeMime: string) => {
  if (typeMime.startsWith('image/')) return <FileImageOutlined />;
  if (typeMime === 'application/pdf') return <FilePdfOutlined />;
  if (typeMime.includes('word')) return <FileWordOutlined />;
  if (typeMime.includes('excel') || typeMime.includes('spreadsheet'))
    return <FileExcelOutlined />;
  return <FileOutlined />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const FicheDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canEdit } = useAuth();

  const [fiche, setFiche] = useState<Fiche | null>(null);
  const [loading, setLoading] = useState(true);
  const [achatModalVisible, setAchatModalVisible] = useState(false);
  const [editingAchat, setEditingAchat] = useState<AchatTemporaire | null>(null);
  const [achatForm] = Form.useForm();

  const loadFiche = async () => {
    try {
      const response = await fichesApi.get(parseInt(id!));
      setFiche(response.data);
    } catch (error) {
      message.error('Erreur lors du chargement de la fiche');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiche();
  }, [id, navigate]);

  const handleDelete = async () => {
    try {
      await fichesApi.delete(parseInt(id!));
      message.success('Fiche supprimée');
      navigate('/');
    } catch (error) {
      message.error('Erreur lors de la suppression');
    }
  };

  const handleDeleteAttachment = async (pieceId: number) => {
    try {
      await uploadsApi.delete(pieceId);
      message.success('Pièce jointe supprimée');
      const response = await fichesApi.get(parseInt(id!));
      setFiche(response.data);
    } catch (error) {
      message.error('Erreur lors de la suppression');
    }
  };

  const handleDownload = (pieceId: number, nomFichier: string) => {
    const token = localStorage.getItem('token');
    const url = uploadsApi.getDownloadUrl(pieceId);
    const link = document.createElement('a');
    link.href = `${url}?token=${token}`;
    link.download = nomFichier;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getImageUrl = (chemin: string) => {
    const token = localStorage.getItem('token');
    return `${API_URL.replace('/api', '')}/uploads/${chemin}?token=${token}`;
  };

  // Gestion des achats temporaires
  const handleAddAchat = () => {
    setEditingAchat(null);
    achatForm.resetFields();
    setAchatModalVisible(true);
  };

  const handleEditAchat = (achat: AchatTemporaire) => {
    setEditingAchat(achat);
    achatForm.setFieldsValue({
      ...achat,
      dateDebut: achat.dateDebut ? dayjs(achat.dateDebut) : null,
      dateFin: achat.dateFin ? dayjs(achat.dateFin) : null,
    });
    setAchatModalVisible(true);
  };

  const handleDeleteAchat = async (achatId: number) => {
    try {
      await achatsApi.delete(parseInt(id!), achatId);
      message.success('Achat supprimé');
      loadFiche();
    } catch (error) {
      message.error('Erreur lors de la suppression');
    }
  };

  const handleAchatSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        dateDebut: values.dateDebut?.toISOString() || null,
        dateFin: values.dateFin?.toISOString() || null,
      };

      if (editingAchat) {
        await achatsApi.update(parseInt(id!), editingAchat.id, payload);
        message.success('Achat modifié');
      } else {
        await achatsApi.create(parseInt(id!), payload);
        message.success('Achat ajouté');
      }
      setAchatModalVisible(false);
      loadFiche();
    } catch (error) {
      message.error('Erreur lors de l\'enregistrement');
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'EN_COURS': return 'processing';
      case 'TERMINE': return 'success';
      case 'ANNULE': return 'default';
      default: return 'default';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'EN_COURS': return 'En cours';
      case 'TERMINE': return 'Terminé';
      case 'ANNULE': return 'Annulé';
      default: return statut;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!fiche) {
    return null;
  }

  const images = fiche.piecesJointes.filter(p => p.typeMime.startsWith('image/'));
  const otherFiles = fiche.piecesJointes.filter(p => !p.typeMime.startsWith('image/'));

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link to="/"><HomeOutlined /> Accueil</Link> },
          { title: <><FileTextOutlined /> Fiches</> },
          { title: fiche.reference },
        ]}
      />

      {/* Header Actions */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/')}
        >
          Retour à la liste
        </Button>
        {canEdit && (
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/fiches/${id}/edit`)}
              style={{
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
                border: 'none',
              }}
            >
              Modifier
            </Button>
            <Popconfirm
              title="Supprimer cette fiche ?"
              description="Cette action est irréversible."
              onConfirm={handleDelete}
              okText="Supprimer"
              cancelText="Annuler"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<DeleteOutlined />}>
                Supprimer
              </Button>
            </Popconfirm>
          </Space>
        )}
      </div>

      <Row gutter={[24, 24]}>
        {/* Main Content */}
        <Col xs={24} lg={16}>
          {/* Titre et infos principales */}
          <Card
            style={{
              borderRadius: 16,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              marginBottom: 24,
            }}
          >
            <div style={{ marginBottom: 24 }}>
              <Tag
                style={{
                  background: `${COLORS.primary}15`,
                  color: COLORS.primary,
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                  padding: '4px 12px',
                  borderRadius: 6,
                  marginBottom: 12,
                }}
              >
                {fiche.reference}
              </Tag>
              <Title level={3} style={{ margin: 0, color: COLORS.dark }}>
                {fiche.titre}
              </Title>
            </div>

            {fiche.description && (
              <div style={{ marginBottom: 24 }}>
                <Text type="secondary" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Description
                </Text>
                <Paragraph style={{ whiteSpace: 'pre-wrap', marginTop: 8, fontSize: 15, lineHeight: 1.8 }}>
                  {fiche.description}
                </Paragraph>
              </div>
            )}

            {fiche.matricules && (
              <div
                style={{
                  padding: 16,
                  background: COLORS.gray[50],
                  borderRadius: 12,
                  border: `1px solid ${COLORS.gray[100]}`,
                }}
              >
                <Text type="secondary" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Matricules concernés
                </Text>
                <Paragraph style={{ whiteSpace: 'pre-wrap', marginTop: 8, marginBottom: 0, fontFamily: 'monospace' }}>
                  {fiche.matricules}
                </Paragraph>
              </div>
            )}
          </Card>

          {/* Images */}
          {images.length > 0 && (
            <Card
              style={{
                borderRadius: 16,
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                marginBottom: 24,
              }}
              title={
                <Space>
                  <FileImageOutlined style={{ color: COLORS.primary }} />
                  <span>Photos ({images.length})</span>
                </Space>
              }
            >
              <Image.PreviewGroup>
                <Row gutter={[16, 16]}>
                  {images.map((image) => (
                    <Col key={image.id} xs={24} sm={12} md={8}>
                      <div
                        style={{
                          position: 'relative',
                          borderRadius: 12,
                          overflow: 'hidden',
                          background: COLORS.gray[50],
                          border: `1px solid ${COLORS.gray[100]}`,
                        }}
                      >
                        <Image
                          src={getImageUrl(image.chemin)}
                          alt={image.nomFichier}
                          style={{
                            width: '100%',
                            height: 200,
                            objectFit: 'cover',
                          }}
                          placeholder={
                            <div
                              style={{
                                width: '100%',
                                height: 200,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: COLORS.gray[100],
                              }}
                            >
                              <Spin />
                            </div>
                          }
                          preview={{
                            mask: (
                              <Space>
                                <EyeOutlined /> Agrandir
                              </Space>
                            ),
                          }}
                        />
                        <div
                          style={{
                            padding: '12px 16px',
                            background: '#fff',
                            borderTop: `1px solid ${COLORS.gray[100]}`,
                          }}
                        >
                          <Text
                            ellipsis
                            style={{ fontSize: 13, display: 'block' }}
                            title={image.nomFichier}
                          >
                            {image.nomFichier}
                          </Text>
                          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                            <Button
                              type="link"
                              size="small"
                              icon={<DownloadOutlined />}
                              onClick={() => handleDownload(image.id, image.nomFichier)}
                              style={{ padding: 0, height: 'auto', color: COLORS.info }}
                            >
                              Télécharger
                            </Button>
                            {canEdit && (
                              <Popconfirm
                                title="Supprimer cette image ?"
                                onConfirm={() => handleDeleteAttachment(image.id)}
                                okText="Oui"
                                cancelText="Non"
                              >
                                <Button
                                  type="link"
                                  size="small"
                                  danger
                                  icon={<DeleteOutlined />}
                                  style={{ padding: 0, height: 'auto' }}
                                >
                                  Supprimer
                                </Button>
                              </Popconfirm>
                            )}
                          </div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Image.PreviewGroup>
            </Card>
          )}

          {/* Autres fichiers */}
          {otherFiles.length > 0 && (
            <Card
              style={{
                borderRadius: 16,
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
              title={
                <Space>
                  <FileOutlined style={{ color: COLORS.primary }} />
                  <span>Documents ({otherFiles.length})</span>
                </Space>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {otherFiles.map((file) => (
                  <div
                    key={file.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: 16,
                      background: COLORS.gray[50],
                      borderRadius: 12,
                      border: `1px solid ${COLORS.gray[100]}`,
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        color: COLORS.primary,
                        marginRight: 16,
                        border: `1px solid ${COLORS.gray[200]}`,
                      }}
                    >
                      {getFileIcon(file.typeMime)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text strong ellipsis style={{ display: 'block' }}>
                        {file.nomFichier}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {formatFileSize(file.taille)}
                      </Text>
                    </div>
                    <Space>
                      <Tooltip title="Télécharger">
                        <Button
                          type="primary"
                          ghost
                          icon={<DownloadOutlined />}
                          onClick={() => handleDownload(file.id, file.nomFichier)}
                        />
                      </Tooltip>
                      {canEdit && (
                        <Popconfirm
                          title="Supprimer ce fichier ?"
                          onConfirm={() => handleDeleteAttachment(file.id)}
                          okText="Oui"
                          cancelText="Non"
                        >
                          <Button danger ghost icon={<DeleteOutlined />} />
                        </Popconfirm>
                      )}
                    </Space>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Achats Temporaires */}
          <Card
            style={{
              borderRadius: 16,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              marginTop: 24,
            }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <ShoppingCartOutlined style={{ color: COLORS.primary }} />
                  <span>Achats Temporaires ({fiche.achatsTemporaires?.length || 0})</span>
                </Space>
                {canEdit && (
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={handleAddAchat}
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
                      border: 'none',
                    }}
                  >
                    Ajouter
                  </Button>
                )}
              </div>
            }
          >
            {fiche.achatsTemporaires && fiche.achatsTemporaires.length > 0 ? (
              <Table
                dataSource={fiche.achatsTemporaires}
                rowKey="id"
                size="small"
                pagination={false}
                columns={[
                  {
                    title: 'Désignation',
                    dataIndex: 'designation',
                    key: 'designation',
                  },
                  {
                    title: 'Fournisseur',
                    dataIndex: 'fournisseur',
                    key: 'fournisseur',
                  },
                  {
                    title: 'Qté',
                    dataIndex: 'quantite',
                    key: 'quantite',
                    width: 60,
                  },
                  {
                    title: 'Prix unit.',
                    dataIndex: 'prixUnitaire',
                    key: 'prixUnitaire',
                    width: 80,
                    render: (val: number | null) => val ? `${val.toFixed(2)} €` : '-',
                  },
                  {
                    title: 'Période',
                    key: 'periode',
                    width: 180,
                    render: (_: any, record: AchatTemporaire) => {
                      const debut = record.dateDebut ? new Date(record.dateDebut).toLocaleDateString('fr-FR') : '';
                      const fin = record.dateFin ? new Date(record.dateFin).toLocaleDateString('fr-FR') : '';
                      if (debut && fin) return `${debut} → ${fin}`;
                      if (debut) return `Depuis ${debut}`;
                      return '-';
                    },
                  },
                  {
                    title: 'Statut',
                    dataIndex: 'statut',
                    key: 'statut',
                    width: 100,
                    render: (statut: string) => (
                      <Tag color={getStatutColor(statut)}>{getStatutLabel(statut)}</Tag>
                    ),
                  },
                  ...(canEdit ? [{
                    title: '',
                    key: 'actions',
                    width: 80,
                    render: (_: any, record: AchatTemporaire) => (
                      <Space size="small">
                        <Tooltip title="Modifier">
                          <Button
                            type="link"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditAchat(record)}
                          />
                        </Tooltip>
                        <Popconfirm
                          title="Supprimer cet achat ?"
                          onConfirm={() => handleDeleteAchat(record.id)}
                          okText="Oui"
                          cancelText="Non"
                        >
                          <Button
                            type="link"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>
                      </Space>
                    ),
                  }] : []),
                ]}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0', color: COLORS.gray[400] }}>
                Aucun achat temporaire enregistré
              </div>
            )}
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          <Card
            style={{
              borderRadius: 16,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              position: 'sticky',
              top: 88,
            }}
            title="Informations"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <AppstoreOutlined style={{ color: COLORS.gray[400] }} />
                  <Text type="secondary">Gamme</Text>
                </div>
                <Text strong style={{ fontSize: 15 }}>{fiche.gamme}</Text>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <AppstoreOutlined style={{ color: COLORS.gray[400] }} />
                  <Text type="secondary">Modèle</Text>
                </div>
                <Text strong style={{ fontSize: 15 }}>{fiche.modele}</Text>
              </div>

              {fiche.fournisseur && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <ShopOutlined style={{ color: COLORS.gray[400] }} />
                    <Text type="secondary">Fournisseur</Text>
                  </div>
                  <Text strong style={{ fontSize: 15 }}>{fiche.fournisseur}</Text>
                </div>
              )}

              {fiche.sousEnsemble && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <PartitionOutlined style={{ color: COLORS.gray[400] }} />
                    <Text type="secondary">Sous-ensemble</Text>
                  </div>
                  <Text strong style={{ fontSize: 15 }}>{fiche.sousEnsemble}</Text>
                </div>
              )}

              {fiche.organe && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <ToolOutlined style={{ color: COLORS.gray[400] }} />
                    <Text type="secondary">Organe</Text>
                  </div>
                  <Text strong style={{ fontSize: 15 }}>{fiche.organe}</Text>
                </div>
              )}

              {(fiche.nomPieceTolerie || fiche.codeX3) && (
                <>
                  <Divider style={{ margin: '4px 0' }} />
                  {fiche.nomPieceTolerie && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <AppstoreOutlined style={{ color: COLORS.gray[400] }} />
                        <Text type="secondary">Pièce de tôlerie</Text>
                      </div>
                      <Text strong style={{ fontSize: 15 }}>{fiche.nomPieceTolerie}</Text>
                    </div>
                  )}

                  {fiche.codeX3 && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <BarcodeOutlined style={{ color: COLORS.gray[400] }} />
                        <Text type="secondary">Code X3</Text>
                      </div>
                      <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                        {fiche.codeX3}
                      </Tag>
                    </div>
                  )}
                </>
              )}

              <Divider style={{ margin: '4px 0' }} />

              {fiche.valideRdLe && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: COLORS.success }} />
                    <Text type="secondary">Validé par la R&D le</Text>
                  </div>
                  <Text strong style={{ fontSize: 15, color: COLORS.success }}>
                    {new Date(fiche.valideRdLe).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                </div>
              )}

              {fiche.enFabricationDepuis && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <RocketOutlined style={{ color: COLORS.primary }} />
                    <Text type="secondary">En fabrication depuis</Text>
                  </div>
                  <Text strong style={{ fontSize: 15 }}>
                    {new Date(fiche.enFabricationDepuis).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                </div>
              )}

              <Divider style={{ margin: '4px 0' }} />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <UserOutlined style={{ color: COLORS.gray[400] }} />
                  <Text type="secondary">Créateur</Text>
                </div>
                <Text strong style={{ fontSize: 15 }}>{fiche.createur.nom}</Text>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <CalendarOutlined style={{ color: COLORS.gray[400] }} />
                  <Text type="secondary">Date de création</Text>
                </div>
                <Text strong style={{ fontSize: 15 }}>
                  {new Date(fiche.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <CalendarOutlined style={{ color: COLORS.gray[400] }} />
                  <Text type="secondary">Dernière modification</Text>
                </div>
                <Text strong style={{ fontSize: 15 }}>
                  {new Date(fiche.updatedAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </div>

              <Divider style={{ margin: '4px 0' }} />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <FileOutlined style={{ color: COLORS.gray[400] }} />
                  <Text type="secondary">Pièces jointes</Text>
                </div>
                <Text strong style={{ fontSize: 15 }}>
                  {fiche.piecesJointes.length} fichier{fiche.piecesJointes.length > 1 ? 's' : ''}
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Modal Achat Temporaire */}
      <Modal
        title={editingAchat ? 'Modifier l\'achat' : 'Nouvel achat temporaire'}
        open={achatModalVisible}
        onCancel={() => setAchatModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={achatForm}
          layout="vertical"
          onFinish={handleAchatSubmit}
        >
          <Form.Item
            name="designation"
            label="Désignation"
            rules={[{ required: true, message: 'La désignation est requise' }]}
          >
            <Input placeholder="Ex: Joint alternatif fournisseur B" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="fournisseur" label="Fournisseur">
                <Input placeholder="Nom du fournisseur" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="quantite" label="Quantité">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="prixUnitaire" label="Prix unitaire (€)">
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="dateDebut" label="Date début">
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="dateFin" label="Date fin">
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="statut" label="Statut" initialValue="EN_COURS">
                <Select>
                  <Select.Option value="EN_COURS">En cours</Select.Option>
                  <Select.Option value="TERMINE">Terminé</Select.Option>
                  <Select.Option value="ANNULE">Annulé</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="motif" label="Motif / Commentaire">
            <Input.TextArea rows={3} placeholder="Ex: Rupture fournisseur principal suite à crise..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setAchatModalVisible(false)}>Annuler</Button>
              <Button type="primary" htmlType="submit">
                {editingAchat ? 'Modifier' : 'Ajouter'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FicheDetail;
