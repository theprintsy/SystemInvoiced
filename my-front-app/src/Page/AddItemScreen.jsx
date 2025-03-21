import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Input, Select, Space, Table, message } from 'antd';
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

  const [currency, setCurrency] = useState("USD"); // and set declea $ and ៛
  const currencySymbol = currency === "KHR" ? "៛" : "$";

  const [loading, setLoading] = useState(false);
  const [message1, setMessage] = useState("");


  const [form, setForm] = useState({
    name: "",
    discount: 0,
    disposit: 0,
    orderStatus: 1,
    status: 1,
  });

  const [isNewCustomer, setIsNewCustomer] = useState(false);
  //   const khmerToArabic = (khmerNum) => {
  //     const khmerDigits = "០១២៣៤៥៦៧៨៩";
  //     const arabicDigits = "0123456789";
  //     return khmerNum.replace(/[០-៩]/g, (digit) => arabicDigits[khmerDigits.indexOf(digit)]);
  // };


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
      title: `Price (${currency})`,
      dataIndex: "price",
      key: "discount",
      render: (value, item, index) => (
        <div>{item.price.toLocaleString()}</div>
      )
    },
    {
      title: `Amount (${currency})`,
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
          <Button onClick={() => editItem(index)} color="cyan" variant="dashed"  ><span ><AiFillEdit /> </span></Button>


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

    if (customerId === "new") {
      // User wants to add a new customer
      setSelectedCustomer(null);
      setForm({ ...form, name: "", discount: 0, disposit: 0 }); // Reset form fields
      setIsNewCustomer(true);
    } else {
      // Existing customer selected
      const customer = customers.find(c => c.id === parseInt(customerId));
      setSelectedCustomer(customer);
      setForm({
        ...form,
        name: customer.name,
        discount: customer.discount,
        disposit: customer.disposit
      });
      setIsNewCustomer(false);
    }

    setItems([]); // Reset items when customer changes
  };



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
    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);

    if (!selectedCustomer && !isNewCustomer) return subtotal; // If no customer, return subtotal

    // Use selected customer's discount/disposit or the input fields for new customer
    const discount = (isNewCustomer ? form.discount : selectedCustomer?.discount || 0);
    // const disposit = isNewCustomer ? form.disposit : selectedCustomer?.disposit || 0;

    return subtotal - discount;
  };



  const calculatekh = () => {
    const kh = riel.length > 0 ? riel[0].khriel : 4000; // Default exchange rate
    const total = calculateTotal();

    console.log("Total before conversion:", total);
    console.log("Selected currency:", currency);
    console.log("Exchange rate:", kh);

    if (!total || isNaN(total)) {
      console.error("Error: calculateTotal() returned an invalid value.");
      return 0;
    }

    const convertedValue = currency === "KHR" ? total / kh : total * kh;
    console.log("Final Converted Value:", convertedValue);

    return currency === "USD"
      ? convertedValue.toLocaleString()
      : parseFloat(convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })); // Return as a number for USD
  };




  const submitInvoice = async () => {
    setLoading(true);
    setMessage("");

    try {
      let customerId = selectedCustomer?.id;

      // 1️⃣ If it's a new customer, save it first
      if (isNewCustomer) {
        const customerResponse = await axios.post("http://localhost:5000/customers", {
          name: form.name,
          discount: form.discount,
          disposit: form.disposit,
          orderStatus: form.orderStatus,
          status: form.status,
        });

        customerId = customerResponse.data.id; // Get new customer ID
      }

      // 2️⃣ Save invoice to database
      const response = await axios.post("http://localhost:5000/invoices", {
        customerId,
        items,
        discount: form.discount,
        disposit: form.disposit,
        currency,
      });

      message.success("Invoice saved successfully! Final Amount: $" + response.data.finalAmount);

      setItems([]);
      setSelectedCustomer(null);
      setIsNewCustomer(false);
      setForm({ name: "", discount: 0, disposit: 0, orderStatus: 1, status: 1 });

      // 3️⃣ Send invoice data to Telegram
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
        <div class="flex justify-between">
          <div>
            <label className='text'>Customer: </label>
            <select className="select-cs" onChange={handleCustomerChange} required>

              <option value="">Please Select Customer</option>
              <option class="option-add" value="new">Add New Customer</option>
              {[

                ...customers
                  .filter(customer => customer.id !== 1)
                  .sort((a, b) => b.id - a.id) // Sort by highest ID
                  .slice(0, 2), // Limit to 10 customers

                ...customers.filter(customer => customer.id === 12)
              ].map((customer, index) => (
                <option key={customer.id} value={customer.id}>
                  {index + 1}. {customer.name} (Discount: {customer.discount}, Disposit: {customer.disposit})
                </option>
              ))}
              {/* <option value="new">Add New Customer</option> */}
            </select>
            <label className='text ml-5'>Currency: </label>
            <select className="select-riel" onChange={(e) => setCurrency(e.target.value)} value={currency}>
              <option value="USD">USD</option>
              <option value="KHR">KHR</option>
            </select>

            {isNewCustomer && (
              <>
                <div className='flex mt-7 ml-25 w-300' >
                  <label className='text mt-2 mr-4'>Name: </label> <Input
                    type="text"
                    placeholder="Name"

                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                  <label className='text mt-2 mr-2'>Discount </label>  <Input
                    type="number"
                    placeholder="Discount"
                    value={form.discount}
                    onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
                  />
                  <label className='text mt-2 mr-2'>Disposit </label><Input
                    type="number"
                    placeholder="Disposit"
                    value={form.disposit}
                    onChange={(e) => setForm({ ...form, disposit: Number(e.target.value) })}
                  />
                  <select class="select-box ml-5"
                    value={form.orderStatus}
                    onChange={(e) => setForm({ ...form, orderStatus: Number(e.target.value) })}
                  >
                    <option value={1}>Paid</option>
                    <option value={2}>Deposit</option>
                    <option value={3}>Unpaid</option>
                  </select>
                  <select class="select-box ml-5"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
                  >
                    <option value={1}>Active</option>
                    <option value={2}>Inactive</option>
                  </select>
                </div>
              </>
            )}



          </div>
          {/* <div><Button onClick={submitInvoice}>Save Invoice</Button></div> */}
          <div>
            <Button type="primary" ghost onClick={submitInvoice} disabled={!selectedCustomer && !isNewCustomer || items.length === 0}  >
              {loading ? "Saving..." : "Save Invoice"}<MdOutlineSaveAs />
            </Button>

          </div>
        </div>
        <div class="m-auto w-300 flex gap-10 mt-10">
          <label >Product Name</label><Input type="text" className='khmer-regular' placeholder="Item Name" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
          <label >Quantity</label><Input type="number" placeholder="Qty" value={newItem.qty} onChange={e => setNewItem({ ...newItem, qty: Number(e.target.value) })} />
          <label >Price</label><Input type="number" placeholder="Price" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: Number(e.target.value) })} />
          <div class="p-1.5"><Button type='primary' onClick={addItem} disabled={!selectedCustomer && !isNewCustomer}>{editingIndex !== null ? "Update Item" : "Add Item"}</Button></div>
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

            <div className="price-balence"><u>

              {currency === "KHR" ? Number(calculateTotal()).toLocaleString() : Number(calculateTotal()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currencySymbol}
            </u></div>

            <div className="price-balence"><u>{calculatekh()} {currency === "USD" ? "៛" : "$"}</u></div>
          </div>
        </div>



      </div>
    </>

  );
};

export default AddItemScreen;
