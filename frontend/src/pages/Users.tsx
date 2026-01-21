import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Popconfirm,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { usersApi } from '../services/api';

const { Title } = Typography;

interface User {
  id: number;
  login: string;
  nom: string;
  email: string | null;
  role: string;
  actif: boolean;
  createdAt: string;
}

const roleColors: Record<string, string> = {
  ADMIN: 'red',
  EDITEUR: 'blue',
  LECTEUR: 'green',
};

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrateur',
  EDITEUR: 'Éditeur',
  LECTEUR: 'Lecteur',
};

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.list();
      setUsers(response.data);
    } catch (error) {
      message.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ role: 'LECTEUR', actif: true });
    setModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      login: user.login,
      nom: user.nom,
      email: user.email,
      role: user.role,
      actif: user.actif,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await usersApi.delete(id);
      message.success('Utilisateur supprimé');
      loadUsers();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingUser) {
        // Modification
        const updateData = { ...values };
        if (!updateData.password) {
          delete updateData.password;
        }
        await usersApi.update(editingUser.id, updateData);
        message.success('Utilisateur modifié');
      } else {
        // Création
        await usersApi.create(values);
        message.success('Utilisateur créé');
      }
      setModalVisible(false);
      loadUsers();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Erreur lors de l\'enregistrement');
    }
  };

  const columns = [
    {
      title: 'Login',
      dataIndex: 'login',
      key: 'login',
      sorter: (a: User, b: User) => a.login.localeCompare(b.login),
    },
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      sorter: (a: User, b: User) => a.nom.localeCompare(b.nom),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string | null) => email || '-',
    },
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={roleColors[role] || 'default'}>
          {roleLabels[role] || role}
        </Tag>
      ),
      filters: [
        { text: 'Administrateur', value: 'ADMIN' },
        { text: 'Éditeur', value: 'EDITEUR' },
        { text: 'Lecteur', value: 'LECTEUR' },
      ],
      onFilter: (value: any, record: User) => record.role === value,
    },
    {
      title: 'Statut',
      dataIndex: 'actif',
      key: 'actif',
      render: (actif: boolean) => (
        <Tag color={actif ? 'green' : 'red'}>
          {actif ? 'Actif' : 'Inactif'}
        </Tag>
      ),
      filters: [
        { text: 'Actif', value: true },
        { text: 'Inactif', value: false },
      ],
      onFilter: (value: any, record: User) => record.actif === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Modifier
          </Button>
          <Popconfirm
            title="Supprimer cet utilisateur ?"
            onConfirm={() => handleDelete(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Supprimer
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>
            <UserOutlined style={{ marginRight: 8 }} />
            Gestion des utilisateurs
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Nouvel utilisateur
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `${total} utilisateur(s)`,
          }}
        />
      </Card>

      <Modal
        title={editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="login"
            label="Login"
            rules={[{ required: true, message: 'Login requis' }]}
          >
            <Input placeholder="Identifiant de connexion" />
          </Form.Item>

          <Form.Item
            name="password"
            label={editingUser ? 'Nouveau mot de passe (laisser vide pour conserver)' : 'Mot de passe'}
            rules={editingUser ? [] : [{ required: true, message: 'Mot de passe requis' }]}
          >
            <Input.Password placeholder="Mot de passe" />
          </Form.Item>

          <Form.Item
            name="nom"
            label="Nom complet"
            rules={[{ required: true, message: 'Nom requis' }]}
          >
            <Input placeholder="Nom et prénom" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: 'email', message: 'Email invalide' }]}
          >
            <Input placeholder="adresse@email.com" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Rôle"
            rules={[{ required: true, message: 'Rôle requis' }]}
          >
            <Select>
              <Select.Option value="LECTEUR">Lecteur (consultation seule)</Select.Option>
              <Select.Option value="EDITEUR">Éditeur (création et modification)</Select.Option>
              <Select.Option value="ADMIN">Administrateur (tous les droits)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="actif"
            label="Compte actif"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Annuler</Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Modifier' : 'Créer'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
