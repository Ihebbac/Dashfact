import { Modal, Form, Input, Select, Space, Button, notification } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import axios from "axios";

const { Option } = Select;
const { TextArea } = Input;

const ClientModalAddEdit = ({
  visible,
  record,
  refetch,
  action,
  stores,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (action === "EDIT" && record) {
      // Convert magasinId to array if it's not already

      let magasin = user.magasinId[0];

      const magasinId = magasin
        ? Array.isArray(magasin)
          ? magasin
          : [magasin]
        : [];

      form.setFieldsValue({
        ...record,
        magasinId,
      });
    } else {
      form.resetFields();
    }
  }, [visible, record, action]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        nom: values.nom,
        adresse: values.adresse,
        telephone: values.telephone,
        email: values.email,
        notes: values.notes,
        magasinId: values.magasinId || [],
      };

      if (action === "EDIT") {
        await axios.put(
          `https://rayhanaboutique.online/clients/${record._id}`,
          payload
        );
        notification.success({ message: "Client mis à jour avec succès" });
      } else {
        await axios.post("https://rayhanaboutique.online/clients", payload);
        notification.success({ message: "Client créé avec succès" });
      }

      refetch();
      onCancel();
    } catch (error) {
      console.error("Error:", error);
      notification.error({
        message: "Erreur",
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      title={action === "EDIT" ? "Modifier le client" : "Créer un client"}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Annuler
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Enregistrer
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="nom"
          label="Nom complet"
          rules={[{ required: true, message: "Ce champ est requis" }]}
        >
          <Input prefix={<UserOutlined />} />
        </Form.Item>

        <Form.Item name="adresse" label="Adresse">
          <Input prefix={<EnvironmentOutlined />} />
        </Form.Item>

        <Form.Item
          name="telephone"
          label="Téléphone"
          rules={[{ required: true, message: "Ce champ est requis" }]}
        >
          <Input prefix={<PhoneOutlined />} />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[{ type: "email", message: "Email invalide" }]}
        >
          <Input prefix={<MailOutlined />} />
        </Form.Item>

        <Form.Item
          name="magasinId"
          label="Magasins associés"
          tooltip="Sélectionnez un ou plusieurs magasins"
        >
          <Select
            mode="multiple"
            disabled={user.type === "user"}
            allowClear
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
            suffixIcon={<ShopOutlined />}
          >
            {stores?.map((store) => (
              <Option key={store._id} value={store._id}>
                {store.nom}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="notes" label="Notes">
          <TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ClientModalAddEdit;
