import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Typography,
  Modal,
  Space,
  Descriptions,
  Avatar,
  Tag,
  notification,
  Select,
  Form,
  Input,
} from "antd";
import {
  DeleteTwoTone,
  EditTwoTone,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import axios from "axios";

const { Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;
const { Password } = Input;

const statusOptions = [
  { value: "active", label: "Actif" },
  { value: "inactive", label: "Inactif" },
];

const roleOptions = [
  { value: "user", label: "Utilisateur" },
  { value: "admin", label: "Administrateur" },
];

const UserModalAddEdit = ({
  visible,
  record,
  refetech,
  type,
  onCancel,
  stores,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (type === "EDIT" && record) {
      // Convert magasinId to array if it's not already
      const magasinId = record.magasinId
        ? Array.isArray(record.magasinId)
          ? record.magasinId
          : [record.magasinId]
        : [];

      form.setFieldsValue({
        ...record,
        magasinId,
      });
    } else {
      form.resetFields();
    }
  }, [visible, record, type]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        username: values.username,
        email: values.email,
        password: values.password,
        status: values.status,
        type: values.type,
        magasinId: values.magasinId || [],
      };

      if (type === "EDIT") {
        await axios.put(
          `https://rayhanaboutique.online/api/user/${record._id}`,
          payload
        );
        notification.success({ message: "Utilisateur mis à jour avec succès" });
      } else {
        await axios.post("https://rayhanaboutique.online/api/user", payload);
        notification.success({ message: "Utilisateur créé avec succès" });
      }

      refetech();
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
      title={
        type === "EDIT" ? "Modifier l'utilisateur" : "Créer un utilisateur"
      }
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
          name="username"
          label="Nom d'utilisateur"
          rules={[{ required: true, message: "Ce champ est requis" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Ce champ est requis" },
            { type: "email", message: "Email invalide" },
          ]}
        >
          <Input />
        </Form.Item>

        {type !== "EDIT" && (
          <Form.Item
            name="password"
            label="Mot de passe"
            rules={[{ required: true, message: "Ce champ est requis" }]}
          >
            <Password />
          </Form.Item>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="type"
              label="Rôle"
              initialValue="user"
              rules={[{ required: true, message: "Ce champ est requis" }]}
            >
              <Select>
                {roleOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="status"
              label="Statut"
              initialValue="active"
              rules={[{ required: true, message: "Ce champ est requis" }]}
            >
              <Select>
                {statusOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="magasinId"
          label="Magasins assignés"
          tooltip="Optionnel - sélectionnez un ou plusieurs magasins"
        >
          <Select
            mode="multiple"
            allowClear
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
            suffixIcon={<ShopOutlined />}
          >
            {stores.map((store) => (
              <Option key={store._id} value={store._id}>
                {store.nom}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const Admins = () => {
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [action, setAction] = useState("");
  const [selectedUser, setSelectedUser] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, storesRes] = await Promise.all([
        axios.get("https://rayhanaboutique.online/api/user"),
        axios.get("https://rayhanaboutique.online/magasins"),
      ]);

      setUsers(usersRes.data);
      setStores(storesRes.data);
    } catch (error) {
      notification.error({
        message: "Erreur de chargement des données",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (user) => {
    confirm({
      title: `Supprimer l'utilisateur ${user.username} ?`,
      icon: <ExclamationCircleOutlined />,
      async onOk() {
        try {
          setLoading(true);
          await axios.delete(`https://rayhanaboutique.online/users/${user._id}`);
          notification.success({
            message: "Utilisateur supprimé avec succès",
          });
          fetchData();
        } catch (error) {
          notification.error({
            message: "Erreur lors de la suppression",
            description: error.message,
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "_id",
      key: "_id",
      render: (id) => <Text ellipsis>{id.substring(0, 8)}...</Text>,
      width: 120,
    },
    {
      title: "Utilisateur",
      dataIndex: "username",
      key: "username",
      render: (text, record) => (
        <Space>
          <Avatar
            style={{
              backgroundColor:
                record.status === "active" ? "#87d068" : "#f5222d",
            }}
            icon={<UserOutlined />}
          />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
    },
    {
      title: "Rôle",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={type === "admin" ? "geekblue" : "green"}>{type}</Tag>
      ),
      filters: [
        { text: "Admin", value: "admin" },
        { text: "Utilisateur", value: "user" },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: "Statut",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "success" : "error"}>
          {status === "active" ? "Actif" : "Inactif"}
        </Tag>
      ),
      filters: [
        { text: "Actif", value: "active" },
        { text: "Inactif", value: "inactive" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Magasins",
      dataIndex: "magasinId",
      key: "magasinId",
      render: (magasinIds) => {
        // Ensure magasinIds is always an array
        const ids = Array.isArray(magasinIds)
          ? magasinIds
          : magasinIds
          ? [magasinIds]
          : [];
        return (
          <Space size={[0, 8]} wrap>
            {ids.length > 0 ? (
              ids.map((id) => {
                const store = stores.find((s) => s._id === id);
                return store ? (
                  <Tag key={id} icon={<ShopOutlined />}>
                    {store.nom}
                  </Tag>
                ) : null;
              })
            ) : (
              <Tag>Non assigné</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            onClick={() => {
              setSelectedUser(record);
              setAction("EDIT");
              setModalVisible(true);
            }}
          >
            <EditTwoTone />
          </Button>

          <Button
            onClick={() => {
              setSelectedUser(record);
              setDetailModalVisible(true);
            }}
          >
            <InfoCircleOutlined />
          </Button>

          <Button danger onClick={() => handleDelete(record)}>
            <DeleteTwoTone />
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="tabled">
      <Row gutter={[24, 0]}>
        <Col xs="24" xl={24}>
          <Card
            bordered={false}
            loading={loading}
            className="criclebox tablespace mb-24"
            title="Gestion des utilisateurs"
            extra={
              <Button
                type="primary"
                onClick={() => {
                  setSelectedUser({});
                  setAction("ADD");
                  setModalVisible(true);
                }}
              >
                Ajouter un utilisateur
              </Button>
            }
          >
            <Table
              columns={columns}
              dataSource={users}
              pagination={{ pageSize: 10 }}
              rowKey="_id"
              scroll={{ x: true }}
            />
          </Card>
        </Col>
      </Row>

      <UserModalAddEdit
        visible={modalVisible}
        record={selectedUser}
        refetech={fetchData}
        type={action}
        onCancel={() => setModalVisible(false)}
        stores={stores}
      />

      <Modal
        title="Détails de l'utilisateur"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Nom d'utilisateur">
            <Space>
              <Avatar
                style={{
                  backgroundColor:
                    selectedUser?.status === "active" ? "#87d068" : "#f5222d",
                }}
                icon={<UserOutlined />}
              />
              <Text strong>{selectedUser?.username || "Non spécifié"}</Text>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {selectedUser?.email || "Non spécifié"}
          </Descriptions.Item>
          <Descriptions.Item label="Rôle">
            <Tag color={selectedUser?.type === "admin" ? "geekblue" : "green"}>
              {selectedUser?.type === "admin"
                ? "Administrateur"
                : "Utilisateur"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Statut">
            <Tag
              color={selectedUser?.status === "active" ? "success" : "error"}
            >
              {selectedUser?.status === "active" ? "Actif" : "Inactif"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Magasins assignés">
            {selectedUser?.magasinId ? (
              <Space wrap>
                {(Array.isArray(selectedUser.magasinId)
                  ? selectedUser.magasinId
                  : [selectedUser.magasinId]
                ).map((id) => {
                  const store = stores.find((s) => s._id === id);
                  return store ? (
                    <Tag key={id} icon={<ShopOutlined />}>
                      {store.nom}
                    </Tag>
                  ) : null;
                })}
              </Space>
            ) : (
              <Tag>Non assigné</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Date de création">
            {selectedUser?.createdAt
              ? new Date(selectedUser.createdAt).toLocaleString()
              : "Inconnue"}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </div>
  );
};

export default Admins;
