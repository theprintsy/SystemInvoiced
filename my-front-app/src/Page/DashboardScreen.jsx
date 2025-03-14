import { Button ,Calendar} from 'antd';
import './Dashboard.css'
import React, { useState, useEffect } from "react";
import axios from "axios";
// import { Button, Input, message, Select, Space, Table, Tag } from 'antd';
import { FaFileInvoice } from "react-icons/fa";
import { CiBadgeDollar } from "react-icons/ci";
import { FaUserFriends } from "react-icons/fa";
import { FaUserLock } from "react-icons/fa6";

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

    const [customers, setCustomers] = useState([]);
    const [invoice, setInvoice] = useState([]);
    const [user, setUser] = useState([]);
    // const [listinvoice, setListinvoice] = useState([]);
    
    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        const rescustomer = await axios.get("http://localhost:5000/customers");
        const resinvoice = await axios.get("http://localhost:5000/invoices/getlist");
        const ressetuser = await axios.get("http://localhost:5000/user");
        setCustomers(rescustomer.data);
        setInvoice(resinvoice.data);
        setUser(ressetuser.data); 
    };
    



    // const TotalfinalAmount = Math.round(invoice.reduce((prev, curr) => prev + parseFloat(curr.finalAmount), 0));
    const TotalfinalAmount = invoice
  .reduce((prevVal1, current1) => prevVal1 + parseFloat(current1.finalAmount), 0)
  .toFixed(2); // Ensures 2 decimal places



    const TotalPPC = TotalfinalAmount
    console.log(TotalPPC)

    const onPanelChange = (value, mode) => {
        console.log(value.format('YYYY-MM-DD'), mode);
      };


    return(
        <>
            <div>
                <div className="width-dash">
                    <div className="box-dash">
                        <div className="icon-dash"><FaFileInvoice /></div>
                        <div className="view-dash">{invoice.length}</div>
                        <div className="title-dash"><u>INVOICE</u></div>
                    </div>
                    <div className="box-dash">
                        <div className="icon-dash"><span><FaUserLock /></span></div>
                        <div className="view-dash">{user.length}</div>
                        <div className="title-dash"><u>USER</u></div>
                    </div>
                    <div className="box-dash">
                        <div className="icon-dash"><FaUserFriends /></div>
                        <div className="view-dash">{customers.length}</div>
                        <div className="title-dash"><u>CUSTOMER</u></div>
                    </div>
                   
                </div>
                <div className="main-balence">
                <div className="width-balence">
                    <div className="balence-icon"><span><CiBadgeDollar /></span></div>
                    <div className="balence-view">{TotalPPC}$</div>
                    <div className="balence-title"><u>BALENCE</u></div>
                </div>
                </div>
               
               
                <Calendar onPanelChange={onPanelChange} />
                
                
            </div>
        </>
    )
}
export default DasboardScreen;

