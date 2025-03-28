import { Button, Calendar } from 'antd';
import './Dashboard.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFileInvoice, FaUserFriends, FaUserLock } from 'react-icons/fa';
import { GrMoney } from 'react-icons/gr';
import { RiMoneyDollarCircleFill } from 'react-icons/ri';
import { Line } from 'react-chartjs-2';
import moment from 'moment'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const DasboardScreen = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [orderStatus, setOrderStatus] = useState({ paidOrders: 0, dispositOrders: 0, unpaidOrders: 0 });
  const [totals, setTotals] = useState({ KHR: 0, USD: 0 });
  const [customers, setCustomers] = useState([]);
  const [invoice, setInvoice] = useState([]);
  const [user, setUser] = useState([]);
  const [totalsData, setTotalsData] = useState(null);

  // Array of month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchCustomers();
    axios.get('http://localhost:5000/dashboard')
      .then(response => {
        const data = response.data;
        setTotals({
          KHR: Number(data.KHR) || 0,
          USD: Number(data.USD) || 0
        });
      })
      .catch(error => console.error('Error fetching dashboard data:', error));

    axios.get('http://localhost:5000/dashboard-list')
      .then(response => {
        setMonthlyData(response.data.chartData);
        setTotalsData(response.data.totalsData)

        // Get latest month order status
        const latestMonthData = response.data.orderStatusData.slice(-1)[0] || { paidOrders: 0, dispositOrders: 0, unpaidOrders: 0 };
        setOrderStatus({
          paidOrders: Number(latestMonthData.paidOrders) || 0,
          dispositOrders: Number(latestMonthData.dispositOrders) || 0,
          unpaidOrders: Number(latestMonthData.unpaidOrders) || 0
        });
      })
      .catch(error => console.log('Error fetching data:', error));
  }, []);

  const fetchCustomers = async () => {
    const resCustomer = await axios.get('http://localhost:5000/customers');
    const resInvoice = await axios.get('http://localhost:5000/invoices/getlist');
    const resUser = await axios.get('http://localhost:5000/user');

    setCustomers(resCustomer.data);
    setInvoice(resInvoice.data);
    setUser(resUser.data);
  };

  // Calculate total final amount
  const TotalfinalAmount = invoice
    .reduce((prev, curr) => prev + parseFloat(curr.finalAmount), 0)
    .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Chart data
  const chartData = {
    labels: monthlyData.map(item => monthNames[item.month - 1]),
    datasets: [
      {
        label: 'USD',
        data: monthlyData.map(item => Number(item.totalUSD)),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: false,
      },
      {
        label: 'KHR',
        data: monthlyData.map(item => Number(item.totalKHR)),
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: false,
      }
    ]
  };

  return (
    <div className="p-6 from-blue-200 to-blue-500">
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-blue-600 text-white shadow-lg p-6 rounded-2xl flex flex-col items-center">
          <FaFileInvoice className="text-5xl mb-2" />
          <div className="text-3xl font-bold">{invoice.length}</div>
          <div className="text-lg"><u>INVOICE</u></div>
        </div>

        <div className="bg-red-600 text-white shadow-lg p-6 rounded-2xl flex flex-col items-center">
          <FaUserLock className="text-5xl mb-2" />
          <div className="text-3xl font-bold">{user.length}</div>
          <div className="text-lg"><u>USER</u></div>
        </div>

        <div className="bg-green-600 text-white shadow-lg p-6 rounded-2xl flex flex-col items-center">
          <FaUserFriends className="text-5xl mb-2" />
          <div className="text-3xl font-bold">{customers.length}</div>
          <div className="text-lg"><u>CUSTOMER</u></div>
        </div>
      </div>

      {/* Balance Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-yellow-500 text-white shadow-lg p-6 rounded-2xl flex flex-col items-center">
          <RiMoneyDollarCircleFill className="text-5xl mb-2" />
          <div className="text-3xl font-bold">
            ${totals.USD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-lg"><u>BALANCE USD</u></div>
        </div>

        <div className="bg-purple-600 text-white shadow-lg p-6 rounded-2xl flex flex-col items-center">
          <GrMoney className="text-5xl mb-2" />
          <div className="text-3xl font-bold">{totals.KHR.toLocaleString('en-US')} ៛</div>
          <div className="text-lg"><u>BALANCE KHR</u></div>
        </div>
      </div>

      {/* Monthly USD and KHR Balance Chart */}
      <div className="mt-8 p-6 bg-white shadow-lg rounded-2xl">
        <h2 className="text-2xl font-bold mb-4">Monthly USD and KHR Balance {moment().format("MMM Do YY")}</h2>
        <Line data={chartData} options={{ responsive: true }} />
      </div>

      {/* Order Status of the Month */}
      <div className="mt-8 p-6 bg-gray-200 shadow-lg rounded-2xl">
        <h2 className="text-2xl font-bold mb-4"> Monthly Amount For {moment().format("MMM Do YY")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-500 text-white p-4 rounded-2xl flex flex-col items-center">
            <div className="text-2xl font-bold">

              {totalsData?.paidCurrentUSD
                ? (totalsData.paidCurrentUSD).toLocaleString() + " USD"
                : "0$"}
              {"  -  "}
              {totalsData?.paidCurrentKHR
                ? Math.floor(totalsData.paidCurrentKHR).toLocaleString() + " KHR"
                : "0៛"}
            </div>


            <div className="text-lg"><u>Paid  ({orderStatus.paidOrders || 0})</u></div>
          </div>
          <div className="bg-yellow-500 text-white p-4 rounded-2xl flex flex-col items-center">
            <div className="text-2xl font-bold"> {totalsData?.dispositCurrentUSD
              ? (totalsData.dispositCurrentUSD).toLocaleString() + " USD"
              : "0$"}
              {"  -  "}
              {totalsData?.dispositCurrentKHR
                ? Math.floor(totalsData.dispositCurrentKHR).toLocaleString() + " KHR"
                : "0៛"}</div>
            <div className="text-lg"><u>Remaining Diposit ({orderStatus.dispositOrders})</u></div>
          </div>
          <div className="bg-red-500 text-white p-4 rounded-2xl flex flex-col items-center">
            <div className="text-2xl font-bold">{totalsData?.unpaidCurrentUSD
              ? (totalsData.unpaidCurrentUSD).toLocaleString() + " USD"
              : "0$"}
              {"  -  "}
              {totalsData?.unpaidCurrentKHR
                ? Math.floor(totalsData.unpaidCurrentKHR).toLocaleString() + " KHR"
                : "0៛"}</div>
            <div className="text-lg"><u>Unpaid ({orderStatus.unpaidOrders})</u></div>
          </div>
          <div className=" bg-yellow-600 text-white p-4 rounded-2xl flex flex-col items-center">
            <div className="text-2xl font-bold">{totalsData?.dispositcsCurrentUSD
              ? (totalsData.dispositcsCurrentUSD).toLocaleString() + " USD"
              : "0$"}
              {"  -  "}
              {totalsData?.dispositcsCurrentKHR
                ? Math.floor(totalsData.dispositcsCurrentKHR).toLocaleString() + " KHR"
                : "0៛"}</div>
            <div className="text-lg"><u>Disposit ({orderStatus.dispositOrders})</u></div>
          </div>
          <div className=" bg-pink-500 text-white p-4 rounded-2xl flex flex-col items-center">
            <div className="text-2xl font-bold">{totalsData?.totalUSDCurrent
              ? (totalsData.totalUSDCurrent).toLocaleString() + " USD"
              : "0$"}
              {"  -  "}
              {totalsData?.totalKHRCurrent
                ? Math.floor(totalsData.totalKHRCurrent).toLocaleString() + " KHR"
                : "0៛"}</div>
            <div className="text-lg"><u>Total Amount  (For Month P-D-U)</u></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DasboardScreen;
