/*!
  =========================================================
  * Muse Ant Design Dashboard - v1.0.0
  =========================================================
  * Product Page: https://www.creative-tim.com/product/muse-ant-design-dashboard
  * Copyright 2021 Creative Tim (https://www.creative-tim.com)
  * Licensed under MIT (https://github.com/creativetimofficial/muse-ant-design-dashboard/blob/main/LICENSE.md)
  * Coded by Creative Tim
  =========================================================
  * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import ReactApexChart from "react-apexcharts";
import { Row, Col, Typography } from "antd";
import eChart from "./configs/eChart";
import moment from "moment";
function EChart({ data }) {
  const { Title, Paragraph } = Typography;

  const items = [
    {
      Title: "3,6K",
      user: "Users",
    },
    {
      Title: "2m",
      user: "Clicks",
    },
    {
      Title: "$772",
      user: "Sales",
    },
    {
      Title: "82",
      user: "Items",
    },
  ];

  // 1. Define month names in correct order
  function processOrders(orders) {
    const monthlyData = {};

    orders.forEach((order) => {
      const date = moment(order.orderDate);
      if (!date.isValid()) return;

      const year = date.year();
      const monthName = `${date.format("MMMM")} ${year}`;
      const sortKey = date.format("YYYY-MM");

      monthlyData[sortKey] = {
        display: monthName,
        total: (monthlyData[sortKey]?.total || 0) + order.totalPrice,
        sortValue: date.valueOf(), // Timestamp for sorting
      };
    });

    return monthlyData;
  }

  function updateChart(orders) {
    const monthlyData = processOrders(orders);

    const sortedEntries = Object.entries(monthlyData).sort(
      (a, b) => a[1].sortValue - b[1].sortValue
    );

    eChart.series[0].data = sortedEntries.map((entry) => entry[1].total);
  }

  updateChart(data.filter((el) => el.status === "valide"));

  return (
    <>
      <div id="chart">
        <ReactApexChart
          className="bar-chart"
          options={eChart.options}
          series={eChart.series}
          type="bar"
          height={400}
        />
      </div>
    </>
  );
}

export default EChart;
