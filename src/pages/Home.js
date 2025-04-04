import { useEffect, useState } from "react";
import { 
  Card, 
  Col, 
  Row, 
  Typography, 
  Statistic, 
  Divider, 
  Progress,
  Tag,
  Badge,
  List
} from "antd";
import { 
  DollarOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseCircleOutlined,
  FileDoneOutlined,
  ShoppingOutlined
} from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import Echart from "../components/chart/EChart";

const { Title, Text } = Typography;

function Home() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:3000/invoice");
        setInvoices(response.data);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Calculate statistics
  const calculateStats = (status) => {
    const filtered = invoices.filter(inv => inv.status === status);
    const count = filtered.length;
    const total = filtered.reduce((sum, inv) => sum + inv.total, 0);
    return { count, total };
  };

  const paidStats = calculateStats('paid');
  const unpaidStats = calculateStats('unpaid');
  const partialStats = calculateStats('partially_paid');

  const todayInvoices = invoices.filter(inv => 
    moment(inv.date).isSame(moment(), 'day')
  );

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const stats = [
    {
      title: "Total Factures",
      value: invoices.length,
      icon: <FileDoneOutlined style={{ fontSize: 24 }} />,
      color: '#1890ff',
    },
    {
      title: "Chiffre d'Affaires",
      value: `${invoices.reduce((sum, inv) => sum + inv.total, 0).toFixed(2)} TND`,
      icon: <DollarOutlined style={{ fontSize: 24 }} />,
      color: '#52c41a',
    },
    {
      title: "Factures Payées",
      value: paidStats.count,
      subValue: `${paidStats.total.toFixed(2)} TND`,
      icon: <CheckCircleOutlined style={{ fontSize: 24 }} />,
      color: '#52c41a',
    },
    {
      title: "Factures Impayées",
      value: unpaidStats.count,
      subValue: `${unpaidStats.total.toFixed(2)} TND`,
      icon: <ClockCircleOutlined style={{ fontSize: 24 }} />,
      color: '#faad14',
    },
    {
      title: "Factures Partiellement Payées",
      value: partialStats.count,
      subValue: `${partialStats.total.toFixed(2)} TND`,
      icon: <ShoppingOutlined style={{ fontSize: 24 }} />,
      color: '#fa8c16',
    },
    {
      title: "Aujourd'hui",
      value: todayInvoices.length,
      subValue: `${todayInvoices.reduce((sum, inv) => sum + inv.total, 0).toFixed(2)} TND`,
      icon: <FileDoneOutlined style={{ fontSize: 24 }} />,
      color: '#722ed1',
    },
  ];

  const getStatusTag = (status) => {
    const statusMap = {
      'paid': { color: 'green', text: 'Payée' },
      'unpaid': { color: 'red', text: 'Impayée' },
      'partially_paid': { color: 'orange', text: 'Partiellement Payée' }
    };
    return <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>;
  };

  return (
    <div className="layout-content">
      <Row gutter={[24, 24]}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={24} md={12} lg={8} xl={8} key={index}>
            <Card bordered={false} loading={loading}>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{ color: stat.color }}
              />
              {stat.subValue && (
                <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                  Montant: {stat.subValue}
                </Text>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      <Divider />

      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          <Card 
            title="Analyse des Factures" 
            bordered={false}
            loading={loading}
          >
            <Echart data={invoices} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card 
            title="Statut de Paiement" 
            bordered={false}
            loading={loading}
          >
            <Progress
              type="dashboard"
              percent={Math.round((paidStats.count / invoices.length) * 100) || 0}
              strokeColor="#52c41a"
              format={percent => `${percent}% Payées`}
            />
            <div style={{ marginTop: 24 }}>
              <Progress
                percent={Math.round((unpaidStats.count / invoices.length) * 100) || 0}
                strokeColor="#ff4d4f"
                status="active"
              />
              <Text>Impayées ({unpaidStats.count})</Text>
            </div>
            <div style={{ marginTop: 16 }}>
              <Progress
                percent={Math.round((partialStats.count / invoices.length) * 100) || 0}
                strokeColor="#faad14"
                status="active"
              />
              <Text>Partiellement Payées ({partialStats.count})</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card 
            title="Dernières Factures" 
            bordered={false}
            loading={loading}
          >
            <List
              itemLayout="horizontal"
              dataSource={recentInvoices}
              renderItem={(invoice) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <>
                        <Text strong>Facture #{invoice.invoiceNumber}</Text>
                        <Text style={{ marginLeft: 16 }}>
                          {moment(invoice.date).format('DD/MM/YYYY HH:mm')}
                        </Text>
                        {getStatusTag(invoice.status)}
                      </>
                    }
                    description={
                      <>
                        <div>Client: {invoice.customerName}</div>
                        <div>Total: {invoice.total.toFixed(2)} TND</div>
                        <div>Articles: {invoice.items.length}</div>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Home;