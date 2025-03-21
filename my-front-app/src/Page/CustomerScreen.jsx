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
        name: "",
        discount: 0,
        disposit: 0,
        orderStatus: 1,
        status: 1,
    });




    const columns = [
        {
          title: "No",
          dataIndex: "No",
          key: "No",
          render: (value, item, index) => (index + 1)
    
    
        },
        {
          title: "Customer Name",
          dataIndex: "name",
          key: "customerName",
        },
    
        {
          title: "Discount",
          dataIndex: "discount",
          key: "qtyTotal",
        },
        {
          title: "Disposit",
          dataIndex: "disposit",
          key: "discount",
        },
        {
          title: "Proccess",
          dataIndex: "orderStatus",
          key: "disposit",
           render: (value, item, index) => (value == 1 ? <Tag style={{ display: "flex", justifyContent: "space-between", width: "60px" }} color='green'> <span style={{ marginTop: "2.5px", fontSize: "16px" }}><CiMoneyBill /></span> Paid</Tag> : "" || value == 2 ? <Tag style={{ display: "flex", justifyContent: "space-between", width: "80px" }}><span style={{ marginTop: "2px", fontSize: "14px" }}><GiReceiveMoney /></span>Disposit</Tag> : "" || value == 3 ? <Tag style={{ display: "flex", justifyContent: "space-between", width: "70px" }} color='red'><span style={{ marginTop: "2px", fontSize: "14px" }}><IoMdCloseCircleOutline /></span>Unpaid</Tag> : "")
        },
        {
          title: "Status",
          dataIndex: "status",
          key: "disposit",
          render: (value, item, index) => (value == 1 ? <div style={{ display: "flex", marginLeft: "15px" }} color='blue'><SiTicktick color='green' /></div> : <div style={{ display: "flex", marginLeft: "15px" }} color='yellow'><IoRadioButtonOn color='red' /></div>)
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
                 <Popconfirm
                    title="Are you sure to delete this Customer?"
                    onConfirm={() => handleDelete(item.id)}
                    okText="Yes"
                    cancelText="No"
                    >
                    <Button  type='primary' danger  ><span ><AiOutlineDelete /> </span></Button>
                    
                     </Popconfirm>
                
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
        const res = await axios.get("http://localhost:5000/customers");
        setCustomers(res.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEditing) {
            // Update existing customer
            await axios.put(`http://localhost:5000/customers/${form.id}`, form);  
            setIsEditing(false);
        } else {
            await axios.post("http://localhost:5000/customers", form);
           
        }
        fetchCustomers();
        setForm({  id: null, name: "", discount: 0, disposit: 0, orderStatus: 1, status: 1 });
    };

    const handleDelete = async (id) => {
        await axios.delete(`http://localhost:5000/customers/${id}`);
        fetchCustomers();
    };
    const handleEdit = (customer) => {
        setForm(customer);
        setIsEditing(true);
    };

    return (
        <div>
            
            <form onSubmit={handleSubmit} class="flex justify-between gap-10">
            <label >Customer Name</label> <Input
                    type="text"
                    placeholder="Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                />
              <label >Discount</label>  <Input
                    type="number"
                    placeholder="Discount"
                    value={form.discount}
                    onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
                />
                <label >Disposit</label><Input
                    type="number"
                    placeholder="Disposit"
                    value={form.disposit}
                    onChange={(e) => setForm({ ...form, disposit: Number(e.target.value) })}
                />
               <select class="select-box"
                    value={form.orderStatus}
                    onChange={(e) => setForm({ ...form, orderStatus: Number(e.target.value) })}
                >
                    <option value={1}>Paid</option>
                    <option value={2}>Deposit</option>
                    <option value={3}>Unpaid</option>
                </select>
                <select class="select-box"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
                >
                    <option value={1}>Active</option>
                    <option value={2}>Inactive</option>
                </select>
                <button class="w-100 bg-cyan-500 rounded-sm p-2 text-white cursor-pointer" type="submit">{isEditing !== false ? "Update" : "Add New"}</button>
            </form>
            <div class="mt-10">
          <Table
            columns={columns}
            dataSource={customers}
            rowKey="invId"
            pagination={{ pageSize: 7 }}
            // bordered
          />
        </div>
            {/* <ul>
                {customers.map((customer) => (
                    <li key={customer.id}>
                        {customer.name} - Discount: {customer.discount}% - Disposit: ${customer.disposit} -
                        Order Status: {customer.orderStatus === 0 ? "Paid" : customer.orderStatus === 1 ? "Deposit" : "Cancel"} -
                        Status: {customer.status === 0 ? "Active" : "Inactive"}
                        <button onClick={() => handleDelete(customer.id)}>Delete</button>
                    </li>
                ))}
            </ul> */}
        </div>
    );
};

export default Customer;
