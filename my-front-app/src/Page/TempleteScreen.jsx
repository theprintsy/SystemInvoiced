import { Button ,Calendar} from 'antd';
import './Templete.css'
import React, { useState, useEffect } from "react";
import axios from "axios";
// import { Button, Input, message, Select, Space, Table, Tag } from 'antd';
import { FaFileInvoice } from "react-icons/fa";
import { CiBadgeDollar } from "react-icons/ci";
import { FaUserFriends } from "react-icons/fa";
import { FaUserLock } from "react-icons/fa6";
import Tmp1 from "../assets/templet.png";
import Tmp2 from "../assets/Tmp2.png";
import Tmp3 from "../assets/Tmp3.png";
import Tmp4 from "../assets/Tmp4.png";
import Tmp5 from "../assets/Tmp5.png";

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

const TempleteScreen = () =>{

    const [customers, setCustomers] = useState([]);
    const [invoice, setInvoice] = useState([]);
    const [user, setUser] = useState([]);
    // const [listinvoice, setListinvoice] = useState([]);
    
    useEffect(() => {
        // fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        // const rescustomer = await axios.get("http://localhost:5000/customers");
        // const resinvoice = await axios.get("http://localhost:5000/invoices/getlist");
        // const ressetuser = await axios.get("http://localhost:5000/user");
        // setCustomers(rescustomer.data);
        // setInvoice(resinvoice.data);
        // setUser(ressetuser.data);
    };
    



    // const TotalfinalAmount = invoice.reduce((prevVal1, current1) =>{
    //     return prevVal1 + current1.finalAmount
    // },0)

    // const TotalPPC = TotalfinalAmount
    // console.log(TotalPPC)

    // const onPanelChange = (value, mode) => {
    //     console.log(value.format('YYYY-MM-DD'), mode);
    //   };


    return(
        <>
            <div className='overflow-y-auto h-150'>
                <div className="hight-tmp ">
                    <div className="tmp-img">
                        <label htmlFor=""><b>Static</b>
                        <img src={Tmp5} alt="" />
                        </label>
                        <label htmlFor=""><b>Brand</b>
                        <img src={Tmp2} alt="" />
                        </label>
                       <label htmlFor=""><b>Cross</b>
                       <img src={Tmp3} alt="" />
                       </label>
                       <label htmlFor=""><b>Dras</b>
                       <img src={Tmp4} alt="" />
                       </label>
                      <label htmlFor=""><b>Flop</b>
                      <img src={Tmp1} alt="" />   
                      </label>

                    </div>
                </div>
               
                
            </div>
        </>
    )
}
export default TempleteScreen;

