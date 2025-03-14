import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Input, Select, Space, Table,message} from 'antd';
import './add.css'
import { AiOutlineDelete } from 'react-icons/ai';
import { MdOutlineViewInAr } from 'react-icons/md';
import { AiFillEdit } from "react-icons/ai";
import { MdOutlineSaveAs } from "react-icons/md";
// import * as React from 'react';
// import { BarChart } from '@mui/x-charts/BarChart';
const AddItemScreen = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [items, setItems] = useState([]);
  const [data, setData] = useState([]);
  const [riel, setRiel] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', qty: "", price: "" });
  const [editingIndex, setEditingIndex] = useState(null);



  const [loading, setLoading] = useState(false);
  const [message1, setMessage] = useState("");

  
  



  const columns = [
    {
      title: "No",
      dataIndex: "No",
      key: "No",
      render: (value, item, index) => (index + 1)


    },
    {
      title: "Product Name",
      dataIndex: "name",
      key: "customerName",
      render: (value, item, index) => (
        <div className='khmer-regular'>
          {item.name}
        </div>
      )
    },

    {
      title: "Quantity",
      dataIndex: "qty",
      key: "qtyTotal",
    },
    {
      title: "Price ($)",
      dataIndex: "price",
      key: "discount",
    },
    {
      title: "Amount ($)",
      dataIndex: "amount",
      key: "disposit",
      render: (value, item, index) => (
        <div>{item.amount.toLocaleString()}</div>
      )
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "act",
      render: (value, item, index) => (
        <Space>
           <Button onClick={() => deleteItem(index)} type='primary' danger  ><span ><AiOutlineDelete /> </span></Button>
          <Button onClick={() => editItem(index)}color="cyan" variant="dashed"  ><span ><AiFillEdit /> </span></Button>
          
           
        </Space>
    )
    },

  ];





  const khriel = async () => {
    const res = await axios.get("http://localhost:5000/exchangerate-riel");
    setRiel(res.data);
    console.log(res.data)
};



  useEffect(() => {
    khriel();
    axios.get('http://localhost:5000/customers')
      .then(response => setCustomers(response.data))
      .catch(error => console.error('Error fetching customers:', error));
    axios
      .get("http://localhost:5000/invoices/getlist")
      .then((response) => {
        console.log(response.data); // Log data correctly
        setData(response.data);
      })
      .catch((error) => console.error("Error fetching invoices:", error));
  }, []);

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    const customer = customers.find(c => c.id === parseInt(customerId));
    setSelectedCustomer(customer);
    setItems([]);
  };

  // const addItem = () => {
  //   if (newItem.name && newItem.qty > 0 && newItem.price > 0) {
  //     const updatedItem = { ...newItem, amount: newItem.qty * newItem.price };
  //     if (editingIndex !== null) {
  //       const updatedItems = [...items];
  //       updatedItems[editingIndex] = updatedItem;
  //       setItems(updatedItems);
  //       setEditingIndex(null);
  //     } else {
  //       setItems([...items, updatedItem]);
  //     }
  //     setItems([...items, { ...newItem, amount: newItem.qty * newItem.price }]);
  //     setNewItem({ name: '', qty: "", price: "" });
  //   }
  // };

  const addItem = () => {
    if (newItem.name && newItem.qty > 0 && newItem.price > 0) {
      const updatedItem = { ...newItem, amount: newItem.qty * newItem.price };
  
      if (editingIndex !== null) {
        // Update existing item
        const updatedItems = [...items];
        updatedItems[editingIndex] = updatedItem;
        setItems(updatedItems);
        setEditingIndex(null);
      } else {
        // Add new item
        setItems([...items, updatedItem]);
      }
  
      // Reset newItem input fields
      setNewItem({ name: "", qty: "", price: "" });
    }
  };
  


  const deleteItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };
  const editItem = (index) => {
    setNewItem(items[index]);
    setEditingIndex(index);
  };

  const calculateTotal = () => {
    
    const subtotal = items.reduce((acc, item) => acc + item.amount, 0);
    const discount = selectedCustomer ? (subtotal * selectedCustomer.discount) / 100 : 0;
    const disposit = selectedCustomer ? selectedCustomer.disposit : 0;
    return subtotal - discount - disposit;
    
  };
  const calculatekh = () => {
    const kh = riel.length > 0 ? riel[0].khriel : 4000; // Use 1 if no exchange rate is found
    return  roundToNearest100(calculateTotal() * kh);
    
  };
  const roundToNearest100 = (amount) => {
    return Math.round(amount / 100) * 100;
};






  // const submitInvoice = () => {
  //   if (!selectedCustomer || items.length === 0) {
  //     alert('Please select a customer and add items.');
  //     return;
  //   }

  //   axios.post('http://localhost:5000/invoices', {
  //     customerId: selectedCustomer.id,
  //     items,
  //     discount: selectedCustomer.discount,
  //     disposit: selectedCustomer.disposit
  //   }).then(response => {
  //     alert('Invoice Save successfully! Final Amount: $' + response.data.finalAmount);
  //     // message.success("Invoice submitted successfully! Final Amount:"+ response.data.finalAmount);
  //     setItems([]);
  //     setSelectedCustomer(null);
  //   }).catch(error => console.error('Error submitting invoice:', error));
  // };
  const submitInvoice = async () => {
    // if (!selectedCustomer || items.length === 0) {
    //   alert('Please select a customer and add items.');
    //   return;
    // }
    setLoading(true);
    setMessage("");


    try {  
      
        // 1️⃣ Save invoice to database
        const response = await axios.post("http://localhost:5000/invoices", {
            customerId: selectedCustomer.id,
            items,
            discount: selectedCustomer.discount,
            disposit: selectedCustomer.disposit
        });

        // alert('Invoice saved successfully! Final Amount: $' + response.data.finalAmount);
        message.success('Invoice saved successfully! Final Amount: $' + response.data.finalAmount);
     
        setItems([]);
        setSelectedCustomer(null);

        // 2️⃣ Send the invoice data to Telegram
        const telegramResponse = await axios.get("http://localhost:5000/send-to-telegram");
        setMessage(telegramResponse.data.message);

    } catch (error) {
        console.error("🔥 Error Details:", error.response ? error.response.data : error.message);
        setMessage("❌ Failed to save or send data."); 
    }

    setLoading(false);
};








  return (
    <>
      <div>
        <div  class="flex justify-between">
          <div>
          <label className='text'>Customer: </label>
          {/* <select className='select-cs' onChange={handleCustomerChange} required >
            <option value="" >Please Select Customer</option>
            {customers.slice().sort((a, b) => b.id - a.id).slice(0, 5).map(customer => (
              <option key={customer.id} value={customer.id} >
                {customer.id}. {customer.name} (Discount: {customer.discount}%, Disposit: ${customer.disposit})
              </option>
            ))}
          </select> */}
         <select className="select-cs" onChange={handleCustomerChange} required>
  <option value="">Please Select Customer</option>
  {[
    // Sort by ID descending and take the last 10 customers (excluding ID 1)
    ...customers
      .filter(customer => customer.id !== 1) // Exclude ID 1 initially
      .sort((a, b) => b.id - a.id) // Sort by highest ID
      .slice(0, 2), // Limit to 10 customers
    // Add ID 1 at the bottom if it exists
    ...customers.filter(customer => customer.id === 12)
  ].map((customer,index) => (
    <option key={customer.id} value={customer.id}>
      {index+1}. {customer.name} (Discount: {customer.discount}%, Disposit: ${customer.disposit})
    </option>
  ))}
</select>


          </div>
          {/* <div><Button onClick={submitInvoice}>Save Invoice</Button></div> */}
          <div>
        <Button type="primary" ghost onClick={submitInvoice} disabled={!selectedCustomer || items.length === 0}  >
            {loading ? "Saving..." : "Save Invoice"}<MdOutlineSaveAs />
        </Button>
        {/* {message && <p>{message}</p>} */}
    </div>
        </div>
        <div class="m-auto w-300 flex gap-10 mt-10">
        <label >Product Name</label><Input type="text" className='khmer-regular' placeholder="Item Name" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
        <label >Quantity</label><Input type="number" placeholder="Qty" value={newItem.qty} onChange={e => setNewItem({ ...newItem, qty: Number(e.target.value) })} />
        <label >Price</label><Input type="number" placeholder="Price" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: Number(e.target.value) })} />
          <div class="p-1.5"><Button type='primary' onClick={addItem} disabled={!selectedCustomer}>{editingIndex !== null ? "Update Item" : "Add Item"}</Button></div>
        </div>


        <div class="mt-10">
          <Table
            columns={columns}
            dataSource={items}
            rowKey="invId"
            pagination={false}
            bordered
          />
        </div>

        <div className='width-balance'>
          <div className="left-balence"></div>
          <div className="right-balence">
            <div className="title-balence"><p>Final Amount </p></div>
            <div className="price-balence"><u>{calculateTotal().toLocaleString()}$</u></div>
            <div className="title-balence"><p>KH RIEL </p></div>
            <div className="price-balence"><u>{calculatekh().toLocaleString()}៛</u></div>
          </div>
        </div>
        {/* <BarChart
      series={[
        { data: [35, 44, 24, 34] },
        { data: [51, 6, 49, 30] },
        { data: [15, 25, 30, 50] },
        { data: [60, 50, 15, 25] },
      ]}
      height={290}
      xAxis={[{ data: ['Q1', 'Q2', 'Q3', 'Q4'], scaleType: 'band' }]}
      margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
    /> */}






      </div>
    </>

  );
};

export default AddItemScreen;
