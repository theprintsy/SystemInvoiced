import { Button ,Calendar} from 'antd';
import './Dashboard.css'
import React, { useState, useEffect } from "react";
import axios from "axios";
// import { Button, Input, message, Select, Space, Table, Tag } from 'antd';
import { FaFileInvoice } from "react-icons/fa";
import { CiBadgeDollar } from "react-icons/ci";
import { FaUserFriends } from "react-icons/fa";
import { FaUserLock } from "react-icons/fa6";
import { GrMoney } from "react-icons/gr";
import { RiMoneyDollarCircleFill } from "react-icons/ri";

import {
    DeleteOutlined,
    DesktopOutlined,
    DiffOutlined,
    DollarOutlined,
    EyeInvisibleOutlined,
    FileOutlined,
    PieChartOutlined,
    PrinterOutlined,
    TeamOutlined,
    
    UsergroupAddOutlined,
    
    UserOutlined,
  } from '@ant-design/icons';

const DasboardScreen = () =>{
    const [totals, setTotals] = useState({ KHR: 0, USD: 0 });

    const [customers, setCustomers] = useState([]);
    const [invoice, setInvoice] = useState([]);
    const [user, setUser] = useState([]);
    // const [listinvoice, setListinvoice] = useState([]);
    
    useEffect(() => {
        fetchCustomers();
        axios.get('http://localhost:5000/dashboard')
        .then(response => {
            const data = response.data; // Now data is an object, not an array
            const totalAmounts = {
                KHR: Number(data.KHR) || 0, // Convert to number
                USD: Number(data.USD) || 0
            };
    
            setTotals(totalAmounts);
        })
        .catch(error => console.error("Error fetching dashboard data:", error));
    
    }, []);

    const fetchCustomers = async () => {
        const rescustomer = await axios.get("http://localhost:5000/customers");
        const resinvoice = await axios.get("http://localhost:5000/invoices/getlist");
        const ressetuser = await axios.get("http://localhost:5000/user");
        // const ressettotal = await axios.get("http://localhost:5000/invoices/total-by-currency");
        setCustomers(rescustomer.data);
        setInvoice(resinvoice.data);
        setUser(ressetuser.data); 
        // setTotals(ressettotal.data); 
    };
    



    // const TotalfinalAmount = Math.round(invoice.reduce((prev, curr) => prev + parseFloat(curr.finalAmount), 0));
    const TotalfinalAmount = invoice
  .reduce((prevVal1, current1) => prevVal1 + parseFloat(current1.finalAmount), 0)
  .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); // Ensures 2 decimal places



    const TotalPPC = TotalfinalAmount
    console.log(TotalPPC)

    const onPanelChange = (value, mode) => {
        console.log(value.format('YYYY-MM-DD'), mode);
      };


    return(
        <>
      <div className="p-6  from-blue-200 to-blue-500">
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
          <div className="text-3xl font-bold">${totals.USD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="text-lg"><u>BALANCE USD</u></div>
        </div>

        <div className="bg-purple-600 text-white shadow-lg p-6 rounded-2xl flex flex-col items-center">
          <GrMoney className="text-5xl mb-2" />
          <div className="text-3xl font-bold">{totals.KHR.toLocaleString('en-US')} ៛</div>
          <div className="text-lg"><u>BALANCE KHR</u></div>
        </div>
      </div>
    </div>
        </>
    )
}
export default DasboardScreen;

