import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Input, message, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { formatDateClient } from '../Config/Support';
import './add.css'
import { FaUserPlus } from "react-icons/fa";
import { SiTicktick } from "react-icons/si";
import { IoRadioButtonOn } from "react-icons/io5";
import { CiMoneyBill } from "react-icons/ci";
import { GiReceiveMoney } from "react-icons/gi";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { AiFillEdit, AiOutlineDelete } from "react-icons/ai";
import { CiEdit } from "react-icons/ci";
import { LuSaveAll } from "react-icons/lu";
import { LuDatabaseBackup } from "react-icons/lu";
import { RxUpdate } from "react-icons/rx";
const DataBackUpScreen = () => {
    
    // const [customers, setCustomers] = useState([]);
    // const [isEditing, setIsEditing] = useState(false);
    const [trash, setTrash] = useState([]);

    useEffect(() => {
        fetchTrash();
    }, []);

    const fetchTrash = async () => {
        try {
            const { data } = await axios.get("http://localhost:5000/invoices/trash");
            setTrash(data);
        } catch (error) {
            console.error("Error fetching trash:", error);
        }
    };

    const restoreInvoice = async (id) => {
        try {
          if (!window.confirm("Backup this invoice?")) return;
          window.location.reload();
            await axios.put(`http://localhost:5000/invoices/restore/${id}`);
            fetchTrash();
        } catch (error) {
            console.error("Error restoring invoice:", error);
        }
    };

    const permanentlyDelete = async (id) => {
        if (!window.confirm("Permanently delete this invoice?")) return;

        try {
            await axios.delete(`http://localhost:5000/invoices/trash/${id}`);
            fetchTrash();
        } catch (error) {
            console.error("Error deleting invoice:", error);
        }
    };
   




    const columns = [
        {
          title: "No",
          dataIndex: "invId",
          key: "No",
          // render: (value, item, index) => (index + 1)
    
    
        },
        {
          title: "Customer Name",
          dataIndex: "customerName",
          key: "customerName",
        },
    
        {
          title: "Qty",
          dataIndex: "qtyTotal",
          key: "qtyTotal",
        },
        {
          title: "Amount",
          dataIndex: "finalAmount",
          key: "finalAmount",
          render: (value, item, index) => (
            <span >{item.currency === "KHR" ? Number(item.finalAmount).toLocaleString() : Number(item.finalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {item.currency}</span>
        )
        },
        {
          title: "currency",
          dataIndex: "currency",
          key: "currency",
        },
        {
          title: "Proccess",
          dataIndex: "orderStatus",
          key: "disposit",
           render: (value, item, index) => (value == 1 ? <Tag style={{ display: "flex", justifyContent: "space-between", width: "60px" }} color='green'> <span style={{ marginTop: "2.5px", fontSize: "16px" }}><CiMoneyBill /></span> Paid</Tag> : "" || value == 2 ? <Tag style={{ display: "flex", justifyContent: "space-between", width: "80px" }}><span style={{ marginTop: "2px", fontSize: "14px" }}><GiReceiveMoney /></span>Disposit</Tag> : "" || value == 3 ? <Tag style={{ display: "flex", justifyContent: "space-between", width: "70px" }} color='red'><span style={{ marginTop: "2px", fontSize: "14px" }}><IoMdCloseCircleOutline /></span>Unpaid</Tag> : "")
        },
        // {
        //   title: "Status",
        //   dataIndex: "status",
        //   key: "disposit",
        //   render: (value, item, index) => (value == 1 ? <div style={{ display: "flex", marginLeft: "15px" }} color='blue'><SiTicktick color='green' /></div> : <div style={{ display: "flex", marginLeft: "15px" }} color='yellow'><IoRadioButtonOn color='red' /></div>)
        // },
        {
          title: "deleted_at",
          dataIndex: "deleted_at",
          key: "deleted_at",
          render: (value, item, index) => formatDateClient(value)
        },
        {
          title: "Action",
          dataIndex: "a",
          key: "disposit",
          render: (value, item, index) => (
            <Space>
                 <Popconfirm
                    title="Are you sure to delete this Customer?"
                    onConfirm={() => permanentlyDelete(item.invId)}
                    okText="Yes"
                    cancelText="No"
                    >
                    <Button  type='primary' danger  ><span ><AiOutlineDelete /> </span></Button>
                    
                     </Popconfirm>
                
                {/* <Button type='primary' danger onClick={() => handleDelete(item.id)}><AiOutlineDelete /></Button> */}
                <Button type='primary' onClick={() => restoreInvoice(item.invId)}><LuDatabaseBackup /></Button>
            </Space>
        )

        },
    
      ];




    return (
        <div>
            
            
            <div class="mt-10">
          <Table
            columns={columns}
            dataSource={trash}
            rowKey="invId"
            pagination={{ pageSize: 7 }}
            // bordered
          />
        </div>
          
        </div>
    );
};

export default DataBackUpScreen;
