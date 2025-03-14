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
import { RxUpdate } from "react-icons/rx";
const Customer = () => {
    
    const [customers, setCustomers] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({
      
        disposit: 0,
       
    });




    const columns = [
        {
          title: "No",
          dataIndex: "No",
          key: "No",
          render: (value, item, index) => (index + 1)
    
    
        },
      
   
        {
          title: "Kh Riel",
          dataIndex: "khriel",
          key: "discount",
        },
       
        {
          title: "Date",
          dataIndex: "CreateAt",
          key: "CreateAt",
          render: (value, item, index) => formatDateClient(value)
        },
        {
          title: "Action",
          dataIndex: "a",
          key: "disposit",
          render: (value, item, index) => (
            <Space>
                 {/* <Popconfirm
                    title="Are you sure to delete this Exchangerate?"
                    onConfirm={() => handleDelete(item.id)}
                    okText="Yes"
                    cancelText="No"
                    >
                    <Button  type='primary' danger  ><span ><AiOutlineDelete /> </span></Button>
                    
                     </Popconfirm>
                 */}
                {/* <Button type='primary' danger onClick={() => handleDelete(item.id)}><AiOutlineDelete /></Button> */}
                <Button type='primary' onClick={() => handleEdit(item)}><AiFillEdit /></Button>
            </Space>
        )

        },
    
      ];


    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        const res = await axios.get("http://localhost:5000/exchangerate-riel");
        setCustomers(res.data);
        console.log(res.data)
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEditing) {
            // Update existing customer
            await axios.put(`http://localhost:5000/exchangerate-riel/${form.id}`, form);  
            setIsEditing(false);
        } 
        fetchCustomers();
        setForm({  id: null, disposit: 0 });
    };

    // const handleDelete = async (id) => {
    //     await axios.delete(`http://localhost:5000/exchangerate-riel/${id}`);
    //     fetchCustomers();
    // };
    const handleEdit = (customer) => {
        setForm(customer);
        setIsEditing(true);
    };

    return (
        <div>
            
            <form onSubmit={handleSubmit} class="flex justify-between gap-10">
          
                <label >Exchange Rate</label><Input
                    type="number"
                    placeholder="Exchange Rate Kh Riel"
                    value={form.khriel}
                    onChange={(e) => setForm({ ...form, khriel: Number(e.target.value) })}
                />
               
                <button class="w-100 bg-cyan-500 rounded-sm p-2 text-white cursor-pointer" type="submit" >Update</button>
                {/* {isEditing !== false ? "Update" : "Add New"} */}
            </form>
            <div class="mt-10">
          <Table
            columns={columns}
            dataSource={customers}
            rowKey="invId"
            pagination={false}
            // bordered
          />
        </div>
        
        </div>
    );
};

export default Customer;
