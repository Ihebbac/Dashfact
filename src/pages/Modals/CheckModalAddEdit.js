import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";

const { Text } = Typography;

const CheckModalAddEdit = (props) => {
  const { visible, onCancel, action, record, refetch } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (action === "EDIT" && record) {
        // Format dates for the form
        const formattedRecord = {
          ...record,
          dateCheck: moment(record.dateCheck),
          dateDepotCheck: moment(record.dateDepotCheck),
        };
        form.setFieldsValue(formattedRecord);
      } else {
        form.resetFields();
        // Set default values for new check
        form.setFieldsValue({
          status: 'validé',
          montant_in: 0,
          montant_ou: 0,
          dateCheck: moment(),
          dateDepotCheck: moment(),
        });
      }
    }
  }, [visible, record]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Format dates for API
      const payload = {
        ...values,
        dateCheck: values.dateCheck.format('YYYY-MM-DD'),
        dateDepotCheck: values.dateDepotCheck.format('YYYY-MM-DD'),
      };

      if (action === "EDIT") {
        await axios.put(`http://127.0.0.1:3000/checks/${record._id}`, payload);
        message.success("Chèque mis à jour avec succès");
      } else {
        await axios.post("http://127.0.0.1:3000/checks", payload);
        message.success("Chèque créé avec succès");
      }

      refetch();
      onCancel();
    } catch (error) {
      message.error("Erreur lors de l'enregistrement du chèque");
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={action === "EDIT" ? "MODIFIER LE CHÈQUE" : "AJOUTER UN NOUVEAU CHÈQUE"}
      visible={visible}
      width={700}
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
            <Col span={12}>
              <Form.Item
                name="nom"
                label="Nom"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                  { max: 100, message: "Maximum 100 caractères" }
                ]}
              >
                <Input placeholder="Entrez le nom" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="numCheck"
                label="Numéro de chèque"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                  { max: 50, message: "Maximum 50 caractères" }
                ]}
              >
                <Input placeholder="Entrez le numéro du chèque" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="nomPersonne"
                label="Nom de la personne"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                  { max: 100, message: "Maximum 100 caractères" }
                ]}
              >
                <Input placeholder="Entrez le nom de la personne" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="status"
                label="Statut"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                ]}
              >
                <Select placeholder="Sélectionnez le statut">
                  <Select.Option value="validé">Validé</Select.Option>
                  <Select.Option value="rejeté">Rejeté</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="dateCheck"
                label="Date du chèque"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                ]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="DD/MM/YYYY" 
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="dateDepotCheck"
                label="Date de dépôt"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                ]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="DD/MM/YYYY" 
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="montant_in"
                label="Montant entrant (TND)"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                  { type: 'number', min: 0, message: "Doit être positif" }
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={0} 
                  step={0.01} 
                  formatter={value => `${value} TND`}
                  parser={value => value.replace(' TND', '')}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="montant_ou"
                label="Montant sortant (TND)"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                  { type: 'number', min: 0, message: "Doit être positif" }
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={0} 
                  step={0.01} 
                  formatter={value => `${value} TND`}
                  parser={value => value.replace(' TND', '')}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
};

export default CheckModalAddEdit;