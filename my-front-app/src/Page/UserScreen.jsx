
import { useEffect, useRef, useState } from 'react'
import { Table, Button, Space, Modal, Form, Select, Input, message, Tag, DatePicker, Row, Col, InputNumber, Flex, Popconfirm, Dropdown, Menu } from 'antd'
// import { request } from '../Config/request';
import './PageScreen.css'
// import { formartDateServer, formatDateClient } from '../Config/support';
import dayjs from 'dayjs';
import moment from 'moment'
import { formatDateClient } from '../Config/Support';
import { FaUserPlus } from "react-icons/fa";
import { SiTicktick } from "react-icons/si";
import { IoRadioButtonOn } from "react-icons/io5";
import { CiMoneyBill } from "react-icons/ci";
import { GiReceiveMoney } from "react-icons/gi";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { AiOutlineDelete } from "react-icons/ai";
import { CiEdit } from "react-icons/ci";
import { LuSaveAll } from "react-icons/lu";
import { RxUpdate } from "react-icons/rx";
import { IoPrintOutline } from "react-icons/io5";
import { MdOutlineViewInAr } from "react-icons/md";
import axios from "axios";
import qrImage from "../assets/qr.jpg";
import logoImage from "../assets/the.png";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PiMicrosoftExcelLogoThin } from "react-icons/pi";
import { MoreOutlined } from '@ant-design/icons';
const UserScreen = () => {
    const [list, setList] = useState([]);
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [formCat] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [test, setTest] = useState([])
    const [orders, setOrders] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(""); // Default selected month
    const [filteredData, setFilteredData] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        
            fetchInvoices();
           


    }, [])
 

    const filterRef = useRef({
        txt_search: null,
        status: null
    })
    const fetchInvoices = async () => {
        try {
            const response = await axios.get("http://localhost:5000/user");
            setData(response.data);
        } catch (error) {
            console.error("Error fetching invoices:", error);
            message.error("Failed to load invoices.");
        }
    };


   

















































    const getlist = async () => {
        setLoading(true)
        var param = {
            txt_search: filterRef.current.txt_search,
            status: filterRef.current.status,

        }
        const res = await request("item/getlist", "get", param)

        setLoading(false)
        // console.log(res);
        if (res) {

            setList(res.list)
            // setRole(res.role)
        }

    }
    const onCloseModal = () => {
        formCat.resetFields();
        formCat.setFieldsValue({
            Status: "1"
        })
        setOpen(false);
    }


    const handleclickEdit = (item) => {
        // console.log(item);

        formCat.setFieldsValue({
            ...item,
            OrderStatus: item.OrderStatus + "",
            Status: item.Status + "",

        })
        setOpen(true)

    }


    const handleclickDelete = async (item) => {
        Modal.confirm({
            title: "Delete",
            content: "Are you sure you want to delete ?",
            okText: "Yes",
            cancelText: "No",
            okType: "danger",
            centered: true,
            onOk: async () => {
                var data = {
                    Id: item.Id
                }
                const res = await request("customer/remove", "delete", data);
                if (res) {
                    getlist();

                }
            }
        })


    }

    const OnTextSearch = (value) => {
        filterRef.current.txt_search = value
        getlist();
    }
    const OnChangeStatus = (value) => {
        filterRef.current.status = value
        getlist();
        console.log(value)
    }

    const onFinish = async (item) => {
        var Id = formCat.getFieldValue("Id")

        var data = {
            Id: Id,
            ...item,

        }
        var method = (Id == null ? "post" : "put")
        var Url = (Id == null ? "customer/create" : "customer/update")
        const res = await request(Url, method, data);
        if (res) {
            message.success(res.message)
            getlist();
            onCloseModal()
        }

    }
    const handleDelete = async (id) => {
        await axios.delete(`http://localhost:5000/customers/${id}`);
        getlist();
    };


    const columns = [
        {
            title: "No",
            dataIndex: "invId",
            key: "invId",
            //   sorter: (a, b) => a.invId - b.invId,
            //   defaultSortOrder: "descend",
            render: (value, item, index) => index+1

        },
        {
            title: "Customer Name",
            dataIndex: "Name",
            key: "customerName",
        },

        {
            title: "Gender",
            dataIndex: "Gender",
            key: "qtyTotal",
        },
        {
            title: "Email",
            dataIndex: "Email",
            key: "discount",
        },
        {
            title: "Tel",
            dataIndex: "Tel",
            key: "disposit",
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (value, item, index) => (value == 1 ? <div style={{ display: "flex", marginLeft: "15px" }} color='blue'><SiTicktick color='green' /></div> : <div style={{ display: "flex", marginLeft: "15px" }} color='yellow'><IoRadioButtonOn color='red' /></div>)
        },
        {
            title: "Image",
            dataIndex: "Image",
            key: "finalAmount",
           
        },
       
      
        {
            title: "Date",
            dataIndex: "CreateAt",
            key: "CreateAt",
            render: (value, item, index) => formatDateClient(value)
        },
        {
            title: "Action",
            // dataIndex: "status",
            key: "status",
            render: (value, item) => {
                const menu = (
                    <Menu>
                        <Menu.Item key="edit" onClick={() => handleclickEdit(item)}>
                            ✏️ Edit
                        </Menu.Item>
                        <Menu.Item key="delete" onClick={() => handleclickDelete(item)} danger>
                            🗑️ Delete
                        </Menu.Item>
                        <Menu.Item key="preview" onClick={() => handleclickPreview(item)}>
                            👁️ Preview
                        </Menu.Item>
                    </Menu>
                );

                return (
                    <Dropdown overlay={menu} trigger={["click"]}>
                        <Button className="bg-gray-200 hover:bg-gray-300 rounded-md">
                            <MoreOutlined />
                        </Button>
                    </Dropdown>
                );
            },
        },
    ];

    //   <Button onClick={() => handleclickDelete(item)} type='primary' danger  ><span ><AiOutlineDelete /> </span></Button>
    //   <Button onClick={() => printInvoice(item)} color="cyan" variant="dashed"  ><span ><MdOutlineViewInAr /> </span></Button>






    return (
        // <MainPage loading={loading} >
        <div className='Category-Page'>
            <div className='Category'>

                <div>
                    <Space>
                        <div class='font-bold'>Customer  {data.length}</div>
                        <Input.Search placeholder='Search by name ' onSearch={OnTextSearch} />
                        {/* <Select placeholder='Pay Processing' allowClear onChange={OnChangeStatus} style={{ width: 150 }}>
                            <Select.Option value={"1"}>
                                <div style={{ display: "flex", }}><SiTicktick style={{ marginTop: "8px", fontSize: "13px" }} color='green' /><p style={{ marginLeft: "10px", fontWeight: "bold", color: "green" }}> Paid</p></div>
                            </Select.Option>
                            <Select.Option value={"2"}>
                             
                                <div style={{ display: "flex", }}><GiReceiveMoney style={{ marginTop: "8px", fontSize: "13px" }} color='gray' /><p style={{ marginLeft: "10px", fontWeight: "bold", color: "gray" }}> Disposit</p></div>
                            </Select.Option>
                            <Select.Option value={"3"}>
                               
                                <div style={{ display: "flex", }}><IoMdCloseCircleOutline style={{ marginTop: "8px", fontSize: "13px" }} color='red' /><p style={{ marginLeft: "10px", fontWeight: "bold", color: "red" }}> Cancel</p></div>
                            </Select.Option>
                        </Select > */}
                        {/* <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            style={{ padding: "4px", marginRight: "30px", border: "1px solid black"  }}
                        >
                            <option value="">Select Month</option>
                            {monthNames.map((month, index) => (
                                <option key={index} value={month}>{month}</option>
                            ))}
                        </select>

                        <label>Start Date:</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}  style={{ padding: "4px",  }}/>
                        <label>End Date:</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        <Button  onClick={handleExport1}>Report Day</Button> */}



                        {/* <p>Export to </p><Button color="primary" variant="dashed" onClick={handleExport}>Excel<PiMicrosoftExcelLogoThin /></Button> */}

                    </Space>


                </div>

                <Button onClick={() => { setOpen(true) }} type="primary"><span><FaUserPlus /></span></Button>

                {/* <Button color="primary" variant="dashed" onClick={handleExport} disabled={!selectedMonth}>Excel<PiMicrosoftExcelLogoThin /></Button>
                <Button color="primary" variant="dashed" onClick={handleExportall}>Excel<PiMicrosoftExcelLogoThin /></Button>  */}
                {/* <div class="flex gap-10">
                 
                  <div>{selectedMonth ? (
                    <Button color="primary" variant="dashed" onClick={handleExport} disabled={!selectedMonth}>
                        Report Month <PiMicrosoftExcelLogoThin />
                    </Button>
                ) : (
                    <Button color="primary" variant="dashed" onClick={handleExportall}>
                        Report all Data <PiMicrosoftExcelLogoThin />
                    </Button>
                )}</div>

                </div> */}
                







                {/* === */}
            </div>


            <div>

                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="invId"
                    pagination={false}
                // bordered

                />
            </div>


            <div>
                <Modal
                    title={formCat.getFieldValue("Id") == null ? "New customer" : "Update customer"}
                    open={open}
                    onCancel={onCloseModal}
                    okText="Save"
                    footer={null}


                >
                    <Form
                        onFinish={onFinish}
                        layout="vertical"
                        form={formCat}


                    >
                        <Row gutter={5}>
                            <Col span={12}>
                                <Form.Item
                                    label="Customer Name"
                                    name={"Name"}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input Customer Name!',
                                        },
                                    ]}
                                >

                                    <Input placeholder='Customer Name' />

                                </Form.Item>

                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    label="Discount"
                                    name={"Discount"}

                                >

                                    <InputNumber placeholder='Input Discount' style={{ width: "100%" }} />

                                </Form.Item>

                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Disposit"
                                    name={"Disposit"}

                                >
                                    <InputNumber placeholder='Input Disposit' style={{ width: "100%" }} />
                                </Form.Item>
                            </Col>


                            <Col span={12}>
                                <Form.Item
                                    label="Processing"
                                    name={"OrderStatus"}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please choose Processing!',
                                        },
                                    ]}

                                >
                                    <Select placeholder="Please Select Processing" >
                                        <Select.Option value="1">
                                            <div style={{ display: "flex", }}><CiMoneyBill style={{ marginTop: "8px" }} color='green' /> <p style={{ marginLeft: "15px", fontWeight: "bold" }}>Paid</p></div>
                                            {/* <p style={{fontWeight:"bold"}}>Paid</p> */}
                                        </Select.Option>
                                        <Select.Option value="2">
                                            {/* <p style={{fontWeight:"bold"}}>Disposit</p> */}
                                            <div style={{ display: "flex", }}><GiReceiveMoney style={{ marginTop: "8px" }} color='gray' /> <p style={{ marginLeft: "15px", fontWeight: "bold" }}>Disposit</p></div>
                                        </Select.Option>
                                        <Select.Option value="3">
                                            {/* <p style={{fontWeight:"bold"}}>Cancel</p> */}
                                            <div style={{ display: "flex", }}><IoMdCloseCircleOutline style={{ marginTop: "8px" }} color='red' /> <p style={{ marginLeft: "15px", fontWeight: "bold" }}>Cancel</p></div>
                                        </Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={5}>


                            <Col span={12}>
                                <Form.Item
                                    label="Status"
                                    name={"Status"}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please choose Status!',
                                        },
                                    ]}

                                >
                                    <Select defaultValue={"1"}>
                                        <Select.Option value="1">
                                            <div style={{ display: "flex", }}><SiTicktick style={{ marginTop: "8px" }} color='green' /> <p style={{ marginLeft: "15px", fontWeight: "bold" }}>Active</p></div>
                                        </Select.Option>
                                        <Select.Option value="0">
                                            <div style={{ display: "flex", }}><IoRadioButtonOn style={{ marginTop: "8px" }} color='red' /> <p style={{ marginLeft: "15px", fontWeight: "bold" }}>Inactive</p></div>
                                        </Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>

                        </Row>


                        <Row gutter={5}>
                            {/* <Col span={12}>
                                <Form.Item
                                label="Address"
                                name={"Address"}
                            >
                                <Input.TextArea placeholder='Address' style={{width:"100%"}}/>
                                
                            </Form.Item>

                            </Col> */}

                            {/* <Col span={12}>
                                <Form.Item
                                label="Status"
                                name={"Status"}
                                rules={[
                                    {
                                    required: true,
                                    message: 'Please choose Status!',
                                    },
                                ]}
                                
                            >
                                <Select defaultValue={"1"}>
                                    <Select.Option value="1">
                                        Actived
                                    </Select.Option>
                                    <Select.Option value="0">
                                        InActived
                                    </Select.Option>
                                </Select>
                            </Form.Item>
                            </Col> */}
                        </Row>




                        <Form.Item style={{ textAlign: "right" }}>
                            <Space >
                                {/* <Button onClick={onCloseModal} danger><span style={{width:"30px"}}><IoMdCloseCircleOutline style={{marginLeft:"5px",fontSize:"20px"}}/></span></Button> */}
                                <Button type='primary' htmlType='submit'>{formCat.getFieldValue("Id") == null ? <span style={{ width: "80px" }}><LuSaveAll style={{ marginLeft: "30px", fontSize: "22px" }} /></span> : <span style={{ width: "80px" }}><RxUpdate style={{ marginLeft: "30px", fontSize: "22px" }} /></span>}</Button>
                            </Space>
                        </Form.Item>
                    </Form>

                </Modal>

            </div>

        </div>
        // </MainPage>        

    )
}
export default UserScreen;