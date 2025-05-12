import React from "react";
import { Modal, Table, Tag, Space, Typography, Divider } from "antd";
import dayjs from "dayjs";

const { Text, Title } = Typography;

const MagasinIdInvoicesModal = ({ visible, onCancel, invoices }) => {
  // Group invoices by customer
  const customerStats = invoices.reduce((acc, invoice) => {
    if (!acc[invoice.magasinId._id]) {
      acc[invoice.magasinId._id] = {
        magasin:invoice.magasinId,
        customerId: invoice.customerId,
        customerName: invoice.customerName,
        customerAddress: invoice.customerAddress,
        customerPhone: invoice.customerPhone,
        totalInvoices: 0,
        totalAmount: 0,
        totalPayed: 0,
        totalNotPayed: 0,
        invoices: [],
      };
    }

    acc[invoice.magasinId._id].totalInvoices += 1;
    acc[invoice.magasinId._id].totalAmount += invoice.total;
    acc[invoice.magasinId._id].totalPayed += invoice.payed;
    acc[invoice.magasinId._id].totalNotPayed += invoice.notpayed;
    acc[invoice.magasinId._id].invoices.push(invoice);

    return acc;
  }, {});

  const customerData = Object.values(customerStats);

  const columns = [
    {
      title: "Magasin",
      dataIndex: "magasinId",
      key: "magasinId",
      render: (text, record) => (
        <div>
          <Text type="secondary">{record.magasin.nom}</Text>
        </div>
      ),
    },
    {
      title: "Factures",
      dataIndex: "totalInvoices",
      key: "totalInvoices",
      align: "center",
    },
    {
      title: "Total (TND)",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => amount.toFixed(2),
      align: "right",
    },
    {
      title: "Payé (TND)",
      dataIndex: "totalPayed",
      key: "totalPayed",
      render: (amount) => amount.toFixed(2),
      align: "right",
    },
    {
      title: "Reste (TND)",
      dataIndex: "totalNotPayed",
      key: "totalNotPayed",
      render: (amount) => (
        <Text type={amount > 0 ? "danger" : "success"}>
          {amount.toFixed(2)}
        </Text>
      ),
      align: "right",
    },
    {
      title: "Statut",
      key: "status",
      render: (_, record) => (
        <Tag
          color={
            record.totalNotPayed === 0
              ? "green"
              : record.totalPayed > 0
              ? "orange"
              : "red"
          }
        >
          {record.totalNotPayed === 0
            ? "Tout payé"
            : record.totalPayed > 0
            ? "Partiel"
            : "Non payé"}
        </Tag>
      ),
      align: "center",
    },
  ];

  const expandedRowRender = (record) => {

    const invoiceColumns = [
      {
        title: "N° Facture",
        dataIndex: "invoiceNumber",
        key: "invoiceNumber",
      },
      {
        title: "Date",
        dataIndex: "date",
        key: "date",
        render: (date) => dayjs(date).format("DD/MM/YYYY"),
      },
      {
        title: "Total (TND)",
        dataIndex: "total",
        key: "total",
        render: (total) => total.toFixed(2),
        align: "right",
      },
      {
        title: "Payé (TND)",
        dataIndex: "payed",
        key: "payed",
        render: (payed) => payed.toFixed(2),
        align: "right",
      },
      {
        title: "Reste (TND)",
        dataIndex: "notpayed",
        key: "notpayed",
        render: (notpayed) => (
          <Text type={notpayed > 0 ? "danger" : "success"}>
            {notpayed.toFixed(2)}
          </Text>
        ),
        align: "right",
      },
      {
        title: "Statut",
        dataIndex: "status",
        key: "status",
        render: (status) => (
          <Tag
            color={
              status === "paid"
                ? "green"
                : status === "partially_paid"
                ? "orange"
                : "red"
            }
          >
            {status === "paid"
              ? "Payée"
              : status === "partially_paid"
              ? "Partielle"
              : "Non payée"}
          </Tag>
        ),
      },
    ];

    return (
      <Table
        columns={invoiceColumns}
        dataSource={record.invoices}
        pagination={false}
        rowKey="_id"
      />
    );
  };

  return (
    <Modal
      title="Détails des factures par client"
      visible={visible}
      onCancel={onCancel}
      width="90%"
      footer={null}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <div>
          <Title level={5}>Résumé global</Title>
          <Space size="large">
            <div>
              <Text strong>Nombre total de clients:</Text> {customerData.length}
            </div>
            <div>
              <Text strong>Nombre total de factures:</Text> {invoices.length}
            </div>
            <div>
              <Text strong>Montant total:</Text>{" "}
              {invoices.reduce((sum, inv) => sum + inv.total, 0).toFixed(2)} TND
            </div>
          </Space>
        </div>

        <Divider />

        <Table
          columns={columns}
          dataSource={customerData}
          rowKey="customerId"
          expandable={{ expandedRowRender }}
          pagination={false}
          summary={(pageData) => {
            const totalAmount = pageData.reduce(
              (sum, item) => sum + item.totalAmount,
              0
            );
            const totalPayed = pageData.reduce(
              (sum, item) => sum + item.totalPayed,
              0
            );
            const totalNotPayed = pageData.reduce(
              (sum, item) => sum + item.totalNotPayed,
              0
            );

            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={2}>
                  <Text strong>Total</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <Text strong>{totalAmount.toFixed(2)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right">
                  <Text strong>{totalPayed.toFixed(2)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  <Text strong type={totalNotPayed > 0 ? "danger" : "success"}>
                    {totalNotPayed.toFixed(2)}
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="center">
                  <Tag color={totalNotPayed === 0 ? "green" : "orange"}>
                    {totalNotPayed === 0 ? "Tout payé" : "En cours"}
                  </Tag>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Space>
    </Modal>
  );
};

export default MagasinIdInvoicesModal;
