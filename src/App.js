import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Line } from "react-chartjs-2";
import axios from "axios";
import "./styles.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);

const App = () => {
  const columns = [
    { name: "Date", selector: "date", sortable: true },
    { name: "Revenue", selector: "revenue", sortable: true },
    { name: "Cost of Goods Sold", selector: "cogs", sortable: true },
    { name: "Ads Cost", selector: "ads_cost", sortable: true },
    { name: "Profit & Loss", selector: "p_l", sortable: true }
  ];

  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        "https://dev-api2.profasee.com/reports/test-data"
      );
      response.data.payload.results.map((entry, index) => {
        response.data.payload.results[index].revenue = parseFloat(
          response.data.payload.results[index].revenue
        );
        response.data.payload.results[index].cogs = parseFloat(
          response.data.payload.results[index].cogs
        );
        response.data.payload.results[index].ads_cost = parseFloat(
          response.data.payload.results[index].ads_cost
        );
        response.data.payload.results[index].date = convertToDateString(response.data.payload.results[index].date)
        response.data.payload.results[index].p_l = calculateProfitLoss(entry);
      });
      setData(response.data.payload.results);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const prepareChartData = data => {
    const dates = data.map(entry => convertToDateString(entry.date));
    const revenues = data.map(entry => parseFloat(entry.revenue));

    return {
      labels: dates,
      datasets: [
        {
          label: "Revenue",
          data: revenues,
          fill: false,
          borderColor: "rgb(90, 180, 180)",
          tension: 0.1
        }
      ]
    };
  };

  const convertToDateString = isoTimestamp => {
    const dateObj = new Date(isoTimestamp);
    const year = dateObj.getUTCFullYear();
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getUTCDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const calculateProfitLoss = entry => {
    const revenue = parseFloat(entry.revenue);
    const cogs = parseFloat(entry.cogs);
    const adsCost = parseFloat(entry.ads_cost);

    const profitLoss = revenue - cogs - adsCost;

    return profitLoss.toFixed(2);
  };

  const Graph = ({ data }) => {
    const chartData = prepareChartData(data);

    return (
      <div>
        <div className="text-center p-4 text-lg font-bold text-cyan-950">Revenue Graph</div>
        <Line data={chartData} />
      </div>
    );
  };

  const DataTableComponent = () => {
    return (
      <div className="table-responsive bg-slate-100">
        <div className="text-center p-4 text-lg font-bold text-cyan-950">
          Profit and Loss (P&L)
        </div>
        <DataTable columns={columns} data={data} pagination selectableRows />
      </div>
    );
  };

  return (
    <div className="w-full max-w-full p-8 bg-slate-100">
      <div className="relative flex flex-col min-w-0 break-words bg-white border-0 shadow-soft-xl rounded-2xl bg-clip-border">
        <div>
          <Graph data={data} />
          <DataTableComponent />
        </div>
      </div>
    </div>
  );
};

export default App;
