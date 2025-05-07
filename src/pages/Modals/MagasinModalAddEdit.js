import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import axios from "axios";

const { Text } = Typography;

const MagasinModalAddEdit = (props) => {
  const { visible, onCancel, action, record, refetch } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (action === "EDIT" && record) {
        form.setFieldsValue({
          nom: record.nom,
          responsable: record.responsable,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, record, action, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      if (action === "EDIT") {
        await axios.put(`https://rayhanaboutique.online/magasins/${record._id}`, values);
        message.success("Magasin mis à jour avec succès");
      } else {
        await axios.post("https://rayhanaboutique.online/magasins", values);
        message.success("Magasin créé avec succès");
      }

      refetch();
      onCancel();
    } catch (error) {
      message.error("Erreur lors de l'enregistrement du magasin");
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={action === "EDIT" ? "MODIFIER LE MAGASIN" : "AJOUTER UN NOUVEAU MAGASIN"}
      visible={visible}
      width={600}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText={action === "EDIT" ? "Mettre à jour" : "Créer"}
      cancelText="Annuler"
      destroyOnClose
    >
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Card>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="nom"
                label="Nom du Magasin"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                  { max: 100, message: "Maximum 100 caractères" }
                ]}
              >
                <Input placeholder="Entrez le nom du magasin" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="responsable"
                label="Responsable"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                  { max: 100, message: "Maximum 100 caractères" }
                ]}
              >
                <Input placeholder="Entrez le nom du responsable" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
};

export default MagasinModalAddEdit;