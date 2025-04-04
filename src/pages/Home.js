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
  List,
  Radio,
  Tabs,
  Table,
} from "antd";
import {
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FileDoneOutlined,
  ShoppingOutlined,
  EuroOutlined,
} from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import EChart from "../components/chart/EChart";

const { Title, Text } = Typography;

// View modes for the chart
const viewModes = {
  MONTHLY: "monthly",
  YEARLY: "yearly",
  DAILY: "daily",
  STATUS: "status",
};

function Home() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(viewModes.MONTHLY);
  const [selectedYear, setSelectedYear] = useState(moment().year());

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
    const filtered = invoices.filter((inv) => inv.status === status);
    const count = filtered.length;
    const total = filtered.reduce((sum, inv) => sum + inv.total, 0);
    return { count, total };
  };

  const paidStats = calculateStats("paid");
  const unpaidStats = calculateStats("unpaid");
  const partialStats = calculateStats("partially_paid");

  const todayInvoices = invoices.filter((inv) =>
    moment(inv.date).isSame(moment(), "day")
  );

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const stats = [
    {
      title: "Total Factures",
      value: invoices.length,
      icon: <FileDoneOutlined style={{ fontSize: 24 }} />,
      color: "#1890ff",
    },
    {
      title: "Chiffre d'Affaires",
      value: `${invoices
        .reduce((sum, inv) => sum + inv.total, 0)
        .toFixed(2)} TND`,
      icon: <DollarOutlined style={{ fontSize: 24 }} />,
      color: "#52c41a",
    },
    {
      title: "Factures Payées",
      value: paidStats.count,
      subValue: `${paidStats.total.toFixed(2)} TND`,
      icon: <CheckCircleOutlined style={{ fontSize: 24 }} />,
      color: "#52c41a",
    },
    {
      title: "Factures Impayées",
      value: unpaidStats.count,
      subValue: `${unpaidStats.total.toFixed(2)} TND`,
      icon: <ClockCircleOutlined style={{ fontSize: 24 }} />,
      color: "#faad14",
    },
    {
      title: "Factures Partiellement Payées",
      value: partialStats.count,
      subValue: `${partialStats.total.toFixed(2)} TND`,
      icon: <ShoppingOutlined style={{ fontSize: 24 }} />,
      color: "#fa8c16",
    },
    {
      title: "Aujourd'hui",
      value: todayInvoices.length,
      subValue: `${todayInvoices
        .reduce((sum, inv) => sum + inv.total, 0)
        .toFixed(2)} TND`,
      icon: <FileDoneOutlined style={{ fontSize: 24 }} />,
      color: "#722ed1",
    },
  ];

  const getStatusTag = (status) => {
    const statusMap = {
      paid: { color: "green", text: "Payée" },
      unpaid: { color: "red", text: "Impayée" },
      partially_paid: { color: "orange", text: "Partiellement Payée" },
    };
    return <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>;
  };

  // Year selection dropdown for the chart
  const availableYears = [
    ...new Set(invoices.map((inv) => moment(inv.date).year())),
  ].sort((a, b) => b - a);

  const getYearlyData = () => {
    const years = [
      ...new Set(invoices.map((inv) => moment(inv.date).year())),
    ].sort();

    return years.map((year) => {
      const yearInvoices = invoices.filter(
        (inv) => moment(inv.date).year() === year
      );
      const total = yearInvoices.reduce((sum, inv) => sum + inv.total, 0);

      return {
        year: year.toString(),
        total: parseFloat(total.toFixed(2)),
        count: yearInvoices.length,
      };
    });
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
                <Text
                  type="secondary"
                  style={{ marginTop: 8, display: "block" }}
                >
                  Montant: {stat.subValue}
                </Text>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      <Divider />

      <Card
        title="Analyse des Factures"
        bordered={false}
        loading={loading}
        extra={
          <div style={{ display: "flex", gap: 16 }}>
            <Radio.Group
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value={viewModes.MONTHLY}>Mensuel</Radio.Button>
              <Radio.Button value={viewModes.YEARLY}>Annuel</Radio.Button>
            </Radio.Group>

            {viewMode === viewModes.MONTHLY && (
              <Radio.Group
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                buttonStyle="solid"
              >
                {availableYears.map((year) => (
                  <Radio.Button key={year} value={year}>
                    {year}
                  </Radio.Button>
                ))}
              </Radio.Group>
            )}
          </div>
        }
      >
        {viewMode === viewModes.YEARLY ? (
          <EChart
            invoices={getYearlyData()}
            viewMode={viewMode}
            chartType="line"
            xAxis="year"
            yAxis="total"
            title="Total des Factures par Année"
          />
        ) : (
          <EChart
            invoices={invoices}
            viewMode={viewMode}
            yearFilter={viewMode === viewModes.MONTHLY ? selectedYear : null}
          />
        )}
      </Card>

      <Divider />

      <Card
        title="Statut de Paiement"
        bordered={false}
        loading={loading}
        headStyle={{ fontSize: "18px", fontWeight: "600" }}
        bodyStyle={{ padding: "24px" }}
      >
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={24} md={8}>
            <div style={{ textAlign: "center" }}>
              <Progress
                type="dashboard"
                percent={
                  Math.round((paidStats.count / invoices.length) * 100) || 0
                }
                strokeColor="#52c41a"
                strokeWidth={10}
                format={(percent) => (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "24px", fontWeight: "600" }}>
                      {percent}%
                    </span>
                    <span style={{ fontSize: "14px", color: "#52c41a" }}>
                      Payées
                    </span>
                  </div>
                )}
              />
              <div style={{ marginTop: "16px" }}>
                <Text strong>{paidStats.count} factures</Text>
                <br />
                <Text type="secondary">{paidStats.total.toFixed(2)} TND</Text>
              </div>
            </div>
          </Col>

          <Col xs={24} sm={24} md={8}>
            <div style={{ textAlign: "center" }}>
              <Progress
                type="dashboard"
                percent={
                  Math.round((unpaidStats.count / invoices.length) * 100) || 0
                }
                strokeColor="#ff4d4f"
                strokeWidth={10}
                format={(percent) => (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "24px", fontWeight: "600" }}>
                      {percent}%
                    </span>
                    <span style={{ fontSize: "14px", color: "#ff4d4f" }}>
                      Impayées
                    </span>
                  </div>
                )}
              />
              <div style={{ marginTop: "16px" }}>
                <Text strong>{unpaidStats.count} factures</Text>
                <br />
                <Text type="secondary">{unpaidStats.total.toFixed(2)} TND</Text>
              </div>
            </div>
          </Col>

          <Col xs={24} sm={24} md={8}>
            <div style={{ textAlign: "center" }}>
              <Progress
                type="dashboard"
                percent={
                  Math.round((partialStats.count / invoices.length) * 100) || 0
                }
                strokeColor="#faad14"
                strokeWidth={10}
                format={(percent) => (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "24px", fontWeight: "600" }}>
                      {percent}%
                    </span>
                    <span style={{ fontSize: "14px", color: "#faad14" }}>
                      Partielles
                    </span>
                  </div>
                )}
              />
              <div style={{ marginTop: "16px" }}>
                <Text strong>{partialStats.count} factures</Text>
                <br />
                <Text type="secondary">
                  {partialStats.total.toFixed(2)} TND
                </Text>
              </div>
            </div>
          </Col>
        </Row>

        <Divider style={{ margin: "24px 0" }} />

        <Row gutter={24}>
          <Col span={24}>
            <div
              style={{
                background: "#fafafa",
                padding: "16px",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text strong style={{ fontSize: "16px" }}>
                Total Factures: {invoices.length}
              </Text>
              <Text strong style={{ fontSize: "16px" }}>
                Montant Total:{" "}
                {invoices.reduce((sum, inv) => sum + inv.total, 0).toFixed(2)}{" "}
                TND
              </Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default Home;
