import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Spin,
  notification,
  Radio,
  Badge,
} from "antd";
import { useForm } from "antd/lib/form/Form";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

const { Option } = Select;

const AddOrUpdateAdmin = (props) => {
  const { visible, onCancel, type, record, refetech } = props;
  const [loading, setLoading] = useState(false);
  const [form] = useForm();

  useEffect(() => {
    if (type === "EDIT") {
      form.setFieldsValue({
        ...record,
      });
    } else {
      form.resetFields();
    }
  }, [form, record, visible, type]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      if (type === "EDIT") {
        await axios.put(`http://127.0.0.1:3000/api/user/${record._id}`, values);
        notification.success({ message: "Utilisateur modifié avec succès" });
      } else {
        await axios.post("http://127.0.0.1:3000/api/auth/add", values);
        notification.success({ message: "Utilisateur créé avec succès" });
      }
      refetech();
      onCancel();
    } catch (error) {
      notification.error({
        message: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        type === "EDIT" ? "Modifier l'utilisateur" : "Ajouter un utilisateur"
      }
      visible={visible}
      destroyOnClose
      onOk={() => form.submit()}
      confirmLoading={loading}
      onCancel={onCancel}
      width={800}
    >
      <Form
        form={form}
        onFinish={handleFinish}
        layout="vertical"
        initialValues={{
          type: "user",
          status: "active",
        }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="username"
              label="Nom d'utilisateur"
              rules={[
                {
                  required: true,
                  message: "Veuillez saisir le nom d'utilisateur",
                },
              ]}
            >
              <Input placeholder="Entrez le nom d'utilisateur" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Veuillez saisir un email valide",
                },
              ]}
            >
              <Input placeholder="Entrez l'email" />
            </Form.Item>
          </Col>

          {type !== "EDIT" && (
            <Col span={24}>
              <Form.Item
                name="password"
                label="Mot de passe"
                rules={[
                  {
                    required: true,
                    message: "Veuillez saisir un mot de passe",
                  },
                  {
                    min: 6,
                    message:
                      "Le mot de passe doit contenir au moins 6 caractères",
                  },
                ]}
              >
                <Input.Password placeholder="Entrez le mot de passe" />
              </Form.Item>
            </Col>
          )}

          <Col span={12}>
            <Form.Item
              name="type"
              label="Type d'utilisateur"
              rules={[
                {
                  required: true,
                  message: "Veuillez sélectionner le type",
                },
              ]}
            >
              <Select>
                <Option value="user">Utilisateur standard</Option>
                <Option value="admin">Administrateur</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="status"
              label="Statut"
              rules={[
                {
                  required: true,
                  message: "Veuillez sélectionner le statut",
                },
              ]}
            >
              <Radio.Group>
                <Radio value="active">
                  <Badge status="success" text="Actif" />
                </Radio>
                <Radio value="inactive">
                  <Badge status="error" text="Inactif" />
                </Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddOrUpdateAdmin;
