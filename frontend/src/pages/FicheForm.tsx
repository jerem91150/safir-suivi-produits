import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  message,
  Upload,
  Spin,
  DatePicker,
  Divider,
} from 'antd';
import dayjs from 'dayjs';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { useParams, useNavigate } from 'react-router-dom';
import { fichesApi, uploadsApi } from '../services/api';

const { TextArea } = Input;

interface FicheFormValues {
  reference: string;
  gamme: string;
  modele: string;
  titre: string;
  description?: string;
  matricules?: string;
  fournisseur?: string;
  sousEnsemble?: string;
  organe?: string;
  valideRdLe?: dayjs.Dayjs;
  enFabricationDepuis?: dayjs.Dayjs;
}

const FicheForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (isEdit) {
      const loadFiche = async () => {
        setLoading(true);
        try {
          const response = await fichesApi.get(parseInt(id));
          const fiche = response.data;
          form.setFieldsValue({
            reference: fiche.reference,
            gamme: fiche.gamme,
            modele: fiche.modele,
            titre: fiche.titre,
            description: fiche.description || '',
            matricules: fiche.matricules || '',
            fournisseur: fiche.fournisseur || '',
            sousEnsemble: fiche.sousEnsemble || '',
            organe: fiche.organe || '',
            valideRdLe: fiche.valideRdLe ? dayjs(fiche.valideRdLe) : null,
            enFabricationDepuis: fiche.enFabricationDepuis ? dayjs(fiche.enFabricationDepuis) : null,
          });
        } catch (error) {
          message.error('Erreur lors du chargement de la fiche');
          navigate('/');
        } finally {
          setLoading(false);
        }
      };

      loadFiche();
    }
  }, [id, isEdit, form, navigate]);

  const onFinish = async (values: FicheFormValues) => {
    setSubmitting(true);
    try {
      let ficheId: number;

      // Convertir les dates dayjs en ISO string pour le backend
      const payload = {
        ...values,
        valideRdLe: values.valideRdLe ? values.valideRdLe.toISOString() : null,
        enFabricationDepuis: values.enFabricationDepuis ? values.enFabricationDepuis.toISOString() : null,
      };

      if (isEdit) {
        await fichesApi.update(parseInt(id), payload);
        ficheId = parseInt(id);
        message.success('Fiche modifiée avec succès');
      } else {
        const response = await fichesApi.create(payload);
        ficheId = response.data.id;
        message.success('Fiche créée avec succès');
      }

      // Upload des fichiers s'il y en a
      if (fileList.length > 0) {
        const files = fileList
          .filter((f) => f.originFileObj)
          .map((f) => f.originFileObj as File);

        if (files.length > 0) {
          await uploadsApi.upload(ficheId, files);
          message.success(`${files.length} fichier(s) uploadé(s)`);
        }
      }

      navigate(`/fiches/${ficheId}`);
    } catch (error: any) {
      message.error(
        error.response?.data?.error || 'Erreur lors de l\'enregistrement'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Retour
        </Button>
      </Space>

      <Card title={isEdit ? 'Modifier la fiche' : 'Nouvelle fiche de suivi'}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: 800 }}
        >
          <Form.Item
            name="reference"
            label="Référence"
            rules={[
              { required: true, message: 'La référence est requise' },
              { max: 50, message: 'Maximum 50 caractères' },
            ]}
          >
            <Input placeholder="Ex: COU.002" style={{ maxWidth: 200 }} />
          </Form.Item>

          <Space size="large" style={{ display: 'flex', flexWrap: 'wrap' }}>
            <Form.Item
              name="gamme"
              label="Gamme"
              rules={[{ required: true, message: 'La gamme est requise' }]}
            >
              <Input placeholder="Ex: COUPE-FEU" style={{ width: 200 }} />
            </Form.Item>

            <Form.Item
              name="modele"
              label="Modèle"
              rules={[{ required: true, message: 'Le modèle est requis' }]}
            >
              <Input placeholder="Ex: CF30" style={{ width: 200 }} />
            </Form.Item>
          </Space>

          <Form.Item
            name="titre"
            label="Titre"
            rules={[
              { required: true, message: 'Le titre est requis' },
              { max: 200, message: 'Maximum 200 caractères' },
            ]}
          >
            <Input placeholder="Titre de la modification" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea
              rows={6}
              placeholder="Description détaillée de la modification..."
            />
          </Form.Item>

          <Form.Item
            name="matricules"
            label="Matricules concernés"
          >
            <TextArea
              rows={3}
              placeholder="Ex: CF30-2024-001 à CF30-2024-150"
            />
          </Form.Item>

          <Divider orientation="left">Informations complémentaires</Divider>

          <Space size="large" style={{ display: 'flex', flexWrap: 'wrap' }}>
            <Form.Item
              name="fournisseur"
              label="Fournisseur"
            >
              <Input placeholder="Nom du fournisseur" style={{ width: 200 }} />
            </Form.Item>

            <Form.Item
              name="sousEnsemble"
              label="Sous-ensemble"
            >
              <Input placeholder="Ex: Châssis" style={{ width: 200 }} />
            </Form.Item>

            <Form.Item
              name="organe"
              label="Organe"
            >
              <Input placeholder="Ex: Joint" style={{ width: 200 }} />
            </Form.Item>
          </Space>

          <Space size="large" style={{ display: 'flex', flexWrap: 'wrap' }}>
            <Form.Item
              name="valideRdLe"
              label="Validé par la R&D le"
            >
              <DatePicker
                format="DD/MM/YYYY"
                placeholder="Sélectionner une date"
                style={{ width: 200 }}
              />
            </Form.Item>

            <Form.Item
              name="enFabricationDepuis"
              label="En fabrication depuis"
            >
              <DatePicker
                format="DD/MM/YYYY"
                placeholder="Sélectionner une date"
                style={{ width: 200 }}
              />
            </Form.Item>
          </Space>

          <Divider />

          <Form.Item label="Pièces jointes">
            <Upload
              fileList={fileList}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
              beforeUpload={() => false}
              multiple
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx"
            >
              <Button icon={<UploadOutlined />}>
                Ajouter des fichiers
              </Button>
            </Upload>
            <div style={{ marginTop: 8, color: '#888' }}>
              Formats acceptés : images, PDF, Word, Excel (max 10 Mo par fichier)
            </div>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={submitting}
              >
                {isEdit ? 'Enregistrer' : 'Créer la fiche'}
              </Button>
              <Button onClick={() => navigate(-1)}>Annuler</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default FicheForm;
