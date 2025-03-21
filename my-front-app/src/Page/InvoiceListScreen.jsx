
import { useEffect, useRef, useState } from 'react'
import { Table, Button, Space, Modal, Form, Select, Input, message, Tag, DatePicker, Row, Col, InputNumber, Flex, Popconfirm } from 'antd'
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
import { FaTelegramPlane } from "react-icons/fa";
import { FcPrint } from "react-icons/fc";
import { RiEdit2Line } from "react-icons/ri";
const { Option } = Select;
const InvoiceListScreen = () => {
    const [list, setList] = useState([]);
    const [data, setData] = useState([]);
    const [riel, setRiel] = useState([]);
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
    const [selectedDay, setSelectedDay] = useState(null);
    const searchRef = useRef();
    const [invoice, setInvoice] = useState(null);
    const [searchId, setSearchId] = useState("");
    const [orderStatus, setOrderStatus] = useState("");
    const [message1, setMessage] = useState("");

    useEffect(() => {
       
        if (!selectedMonth) {
            setFilteredData([]);
            if (data.length === 0)
                fetchInvoices();
            khriel()

            
            return;
        }

        // Get selected month index (0-based)
        const selectedMonthIndex = monthNames.indexOf(selectedMonth);

        // Filter invoices that match the selected month
        const filtered = data.filter((invoice) => {
            if (!invoice.CreateAt) return false;

            // Extract month from invoice date
            const invoiceMonth = new Date(invoice.CreateAt).getMonth();
            return invoiceMonth === selectedMonthIndex;
        });

        setFilteredData(filtered);


    }, [selectedMonth, data])


    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];


    const khriel = async () => {
        const res = await axios.get("http://localhost:5000/exchangerate-riel");
        setRiel(res.data);
        console.log(res.data)
    };


    // const fetchInvoices = async () => {
    //     try {
    //         const response = await axios.get("http://localhost:5000/invoices/getlist");
    //         setData(response.data);
    //         console.log(response.data)
    //     } catch (error) {
    //         console.error("Error fetching invoices:", error);
    //         message.error("Failed to load invoices.");
    //     }
    // };

    const fetchInvoices = async () => {
        const searchId = searchRef.current.input.value; // Get input value

        try {
            const { data } = await axios.get("http://localhost:5000/invoices/getlist", {
                params: {
                    id: searchId || undefined, // Pass only if exists
                    orderStatus: orderStatus || undefined, // Pass only if exists
                },
            });

            setData(data); // Update invoices list
        } catch (error) {
            console.error("Error fetching invoice:", error);
        }
    };


    //   ================== for month data

    // const handleExport = () => {
    //     if (!filteredData || filteredData.length === 0) {
    //         alert(`No invoices found for ${selectedMonth}`);
    //         return;
    //     }
    //     if (!data || data.length === 0) {
    //         alert("No data to export");
    //         return;
    //     }

    //     let totalAmountKHR = 0;
    //     let totalAmountUSD = 0;

    //     filteredData.forEach(invoice => {
    //         const amount = parseFloat(invoice.finalAmount) || 0;
    //         if (invoice.currency === "KHR") {
    //             totalAmountKHR += amount;
    //         } else if (invoice.currency === "USD") {
    //             totalAmountUSD += amount;
    //         }
    //     });

    //     const formattedData = filteredData.map((invoice) => {
    //         let itemsArray = [];
    //         try {
    //             itemsArray = typeof invoice.items === "string" ? JSON.parse(invoice.items) : invoice.items || [];
    //         } catch (error) {
    //             console.error("Error parsing items:", error);
    //             itemsArray = [];
    //         }

    //         const discount = parseFloat(invoice.discount) || 0;
    //         const deposit = parseFloat(invoice.disposit) || 0;
    //         const finalAmount = parseFloat(invoice.finalAmount) || 0;

    //         const rowData = {
    //             "No": invoice.invId ? `000-${invoice.invId}` : "N/A",
    //             "Name": invoice.customerName || "N/A",
    //             "Qty": invoice.qtyTotal || 0,
    //             "Discount": invoice.currency === "USD"
    //                 ? `${discount.toFixed(2)} USD`
    //                 : `${discount.toLocaleString()} KHR`,
    //             "D-Percentage(%)": invoice.discountPercentage || 0,
    //             "Deposit": invoice.currency === "USD"
    //                 ? `${deposit.toFixed(2)} USD`
    //                 : `${deposit.toLocaleString()} KHR`,
    //             "Amount": invoice.currency === "USD"
    //                 ? `${finalAmount.toFixed(2)} USD`
    //                 : `${finalAmount.toLocaleString()} KHR`,
    //             "Order": invoice.orderStatus === 1
    //                 ? "Paid"
    //                 : invoice.orderStatus === 2
    //                     ? "Deposit"
    //                     : invoice.orderStatus === 3
    //                         ? "Unpaid"
    //                         : "Unknown",
    //             "Status": invoice.status === 1 ? "Active" : invoice.status === 2 ? "Inactive" : "Unknown",
    //             "Out Time": invoice.CreateAt ? formatDateClient(invoice.CreateAt) : "N/A",
    //             "For Month": selectedMonth
    //         };

    //         // Dynamically add item details in separate columns
    //         itemsArray.forEach((item, index) => {
    //             rowData[`${index + 1} Name`] = item.name || "N/A";
    //             rowData[`${index + 1} Qty`] = item.qty || 0;
    //             rowData[` ${index + 1} Price`] = invoice.currency === "USD"
    //                 ? `${parseFloat(item.price || 0).toFixed(2)} USD`
    //                 : `${parseFloat(item.price || 0).toLocaleString()} KHR`;
    //             rowData[`${index + 1} Amount`] = invoice.currency === "USD"
    //                 ? `${parseFloat(item.amount || 0).toFixed(2)} USD`
    //                 : `${parseFloat(item.amount || 0).toLocaleString()} KHR`;
    //         });

    //         return rowData;
    //     });

    //     // Add total rows
    //     formattedData.push({
    //         "No": "",
    //         "Name": "",
    //         "Qty": "",
    //         "Discount": "",
    //         "D-Percentage(%)": "",
    //         "Deposit": "",
    //         "Amount": `Total (USD): ${totalAmountUSD.toFixed(2)} USD`,
    //         "Order": "",
    //         "Status": "",
    //         "Out Time": "",
    //         "For Month": selectedMonth
    //     });

    //     formattedData.push({
    //         "No": "",
    //         "Name": "",
    //         "Qty": "",
    //         "Discount": "",
    //         "D-Percentage(%)": "",
    //         "Deposit": "",
    //         "Amount": `Total (KHR): ${totalAmountKHR.toLocaleString()} KHR`,
    //         "Order": "",
    //         "Status": "",
    //         "Out Time": "",
    //         "For Month": selectedMonth
    //     });

    //     // Create Excel file using SheetJS
    //     const worksheet = XLSX.utils.json_to_sheet(formattedData);
    //     const workbook = XLSX.utils.book_new();
    //     XLSX.utils.book_append_sheet(workbook, worksheet, `Invoices_${selectedMonth}`);

    //     // Download Excel file
    //     const fileName = `Invoices_${selectedMonth}.xlsx`;
    //     XLSX.writeFile(workbook, fileName);
    // };


    const handleExport = () => {
        // Use filteredData if a month is selected; otherwise, export all data
        let exportData = selectedMonth && filteredData.length > 0 ? filteredData : data;

        if (!exportData || exportData.length === 0) {
            alert("No data available for export.");
            return;
        }

        let totalAmountKHR = 0;
        let totalAmountUSD = 0;

        exportData.forEach(invoice => {
            const amount = parseFloat(invoice.finalAmount) || 0;
            if (invoice.currency === "KHR") {
                totalAmountKHR += amount;
            } else if (invoice.currency === "USD") {
                totalAmountUSD += amount;
            }
        });

        const formattedData = exportData.map((invoice) => {
            let itemsArray = [];
            try {
                itemsArray = typeof invoice.items === "string" ? JSON.parse(invoice.items) : invoice.items || [];
            } catch (error) {
                console.error("Error parsing items:", error);
                itemsArray = [];
            }

            const discount = parseFloat(invoice.discount) || 0;
            const deposit = parseFloat(invoice.disposit) || 0;
            const finalAmount = parseFloat(invoice.finalAmount) || 0;

            const rowData = {
                "No": invoice.invId ? `000-${invoice.invId}` : "N/A",
                "Name": invoice.customerName || "N/A",
                "Qty": invoice.qtyTotal || 0,
                "Discount": invoice.currency === "USD"
                    ? `${discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
                    : `${discount.toLocaleString()} KHR`,
                "D-Percentage(%)": invoice.discountPercentage || 0,
                "Deposit": invoice.currency === "USD"
                    ? `${deposit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
                    : `${deposit.toLocaleString()} KHR`,
                "Amount": invoice.currency === "USD"
                    ? `${finalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
                    : `${finalAmount.toLocaleString()} KHR`,
                "Order": invoice.orderStatus === 1
                    ? "Paid"
                    : invoice.orderStatus === 2
                        ? "Deposit"
                        : invoice.orderStatus === 3
                            ? "Unpaid"
                            : "Unknown",
                "Status": invoice.status === 1 ? "Active" : invoice.status === 2 ? "Inactive" : "Unknown",
                "Out Time": invoice.CreateAt ? formatDateClient(invoice.CreateAt) : "N/A",
                "For Month": selectedMonth || "All Data"
            };

            // Dynamically add item details in separate columns
            itemsArray.forEach((item, index) => {
                rowData[`${index + 1} Name`] = item.name || "N/A";
                rowData[`${index + 1} Qty`] = item.qty || 0;
                rowData[` ${index + 1} Price`] = invoice.currency === "USD"
                    ? `${parseFloat(item.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
                    : `${parseFloat(item.price || 0).toLocaleString()} KHR`;
                rowData[`${index + 1} Amount`] = invoice.currency === "USD"
                    ? `${parseFloat(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
                    : `${parseFloat(item.amount || 0).toLocaleString()} KHR`;
            });

            return rowData;
        });

        // Add total rows
        formattedData.push({
            "No": "",
            "Name": "",
            "Qty": "",
            "Discount": "",
            "D-Percentage(%)": "",
            "Deposit": "",
            "Amount": `Total (USD): ${totalAmountUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`,
            "Order": "",
            "Status": "",
            "Out Time": "",
            "For Month": selectedMonth || "All Data"
        });

        formattedData.push({
            "No": "",
            "Name": "",
            "Qty": "",
            "Discount": "",
            "D-Percentage(%)": "",
            "Deposit": "",
            "Amount": `Total (KHR): ${totalAmountKHR.toLocaleString()} KHR`,
            "Order": "",
            "Status": "",
            "Out Time": "",
            "For Month": selectedMonth || "All Data"
        });

        // Create Excel file using SheetJS
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `Invoices_${selectedMonth || "All_Data"}`);

        // Download Excel file
        const fileName = `Invoices_${selectedMonth || "All_Data"}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };




    // ======================== all data
    // const handleExportall = () => {
    //     if (!data || data.length === 0) {
    //         alert("No data to export");
    //         return;
    //     }

    //     // Calculate total amount for all invoices
    //     // const totalAmountForAll = data.reduce((sum, invoice) => sum + (invoice.finalAmount || 0), 0);
    //     const totalAmountForAll = data.reduce(
    //         (sum, invoice) => sum + (parseFloat(invoice.finalAmount) || 0),
    //         0
    //     );


    //     // Format data for export
    //     const formattedData = data.map((invoice) => {
    //         const itemsArray = typeof invoice.items === "string" ? JSON.parse(invoice.items) : invoice.items;

    //         return {
    //             "No": invoice.invId ? `000-${invoice.invId}` : "N/A",
    //             "Customer Name": invoice.customerName || "N/A",
    //             "Items": Array.isArray(itemsArray)
    //                 ? itemsArray.map(item => `name:${item.name}, qty:${item.qty}, price:${item.price}, amount:${item.amount}`).join(" | ")
    //                 : "N/A",
    //             "Total Qty": invoice.qtyTotal || 0,
    //             "Discount(%)": invoice.discount || 0,
    //             "Deposit($)": invoice.disposit || 0,
    //             "Final Amount": invoice.finalAmount || 0,
    //             "Process Order":
    //                 invoice.orderStatus === 1
    //                     ? "Paid"
    //                     : invoice.orderStatus === 2
    //                         ? "Deposit"
    //                         : invoice.orderStatus === 3
    //                             ? "Unpaid"
    //                             : "Unknown",
    //             "Status": invoice.status === 1 ? "Active" : invoice.status === 2 ? "Inactive" : "Unknown",
    //             "Out Time": invoice.CreateAt ? formatDateClient(invoice.CreateAt) : "N/A"
    //         };
    //     });

    //     // Add total amount row at the end
    //     formattedData.push({
    //         "No": "",
    //         "Customer Name": "",
    //         "Items": "",
    //         "Total Qty": "",
    //         "Discount(%)": "",
    //         "Deposit($)": "",
    //         "Final Amount": `Total: ${totalAmountForAll.toFixed(2)}`,
    //         "Process Order": "",
    //         "Status": "",
    //         "Out Time": ""
    //     });

    //     // Use SheetJS to export as Excel
    //     const worksheet = XLSX.utils.json_to_sheet(formattedData);
    //     const workbook = XLSX.utils.book_new();
    //     XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");

    //     // Download the Excel file
    //     XLSX.writeFile(workbook, "Invoices.xlsx");
    // };



    const handleExport1 = async () => {
        if (!startDate || !endDate) {
            message.error("Please select both start and end dates.");
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            alert("Start date cannot be after end date");
            return;
        }

        try {
            const response = await axios.get(
                `http://localhost:5000/export-data?startDate=${startDate}&endDate=${endDate}`
            );
            let data = response.data;

            if (data.length === 0) {
                alert("No data available for the selected date range");
                return;
            }

            // **Find the maximum number of items in any invoice**
            let maxItems = 0;
            data.forEach((invoice) => {
                if (invoice.items && typeof invoice.items === "string") {
                    try {
                        let parsedItems = JSON.parse(invoice.items);
                        if (Array.isArray(parsedItems)) {
                            maxItems = Math.max(maxItems, parsedItems.length);
                        }
                    } catch (error) {
                        console.error("Error parsing items JSON:", error);
                    }
                }
            });

            // **Format currency values correctly**
            const formatValue = (value, currency) => {
                const numValue = parseFloat(value) || 0;
                return currency === "USD"
                    ? `${numValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
                    : `${numValue.toLocaleString()} KHR`;
            };

            // **Transform data for Excel export**
            const transformedData = data.map((invoice) => {
                let rowData = {
                    "No": invoice.invId ? `000-${invoice.invId}` : "N/A",
                    "Name": invoice.customerName || "N/A",
                    "Qty": invoice.qtyTotal || 0,
                    "Discount": formatValue(invoice.discount, invoice.currency),
                    "Deposit": formatValue(invoice.disposit, invoice.currency),
                    "Amount": formatValue(invoice.finalAmount, invoice.currency),
                    "Order": invoice.orderStatus === 1 ? "Paid" : invoice.orderStatus === 2 ? "Deposit" : invoice.orderStatus === 3 ? "Unpaid" : "Unknown",
                    "Status": invoice.status === 1 ? "Active" : invoice.status === 2 ? "Inactive" : "Unknown",
                    "Out Time": invoice.CreateAt ? formatDateClient(invoice.CreateAt) : "N/A"
                };

                // **Dynamically add item columns**
                if (invoice.items && typeof invoice.items === "string") {
                    try {
                        let parsedItems = JSON.parse(invoice.items);
                        if (Array.isArray(parsedItems)) {
                            parsedItems.forEach((item, index) => {
                                rowData[` ${index + 1} Name`] = item.name;
                                rowData[` ${index + 1} Qty`] = item.qty;
                                rowData[` ${index + 1} Price`] = formatValue(item.price, invoice.currency);
                                rowData[` ${index + 1} Amount`] = formatValue(item.amount, invoice.currency);
                            });
                        }
                    } catch (error) {
                        console.error("Error parsing items JSON:", error);
                    }
                }

                return rowData;
            });

            // **Calculate totals for USD and KHR**
            let totalUSD = 0;
            let totalKHR = 0;
            data.forEach((invoice) => {
                const amount = parseFloat(invoice.finalAmount) || 0;
                if (invoice.currency === "USD") {
                    totalUSD += amount;
                } else {
                    totalKHR += amount;
                }
            });

            // **Push totals row**
            let totalRowUSD = {
                "No": "",
                "Name": "Total (USD)",
                "Qty": "",
                "Discount": "",
                "Deposit": "",
                "Amount": `${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`,
                "Order": "",
                "Status": "",
                "Out Time": ""
            };

            let totalRowKHR = {
                "No": "",
                "Name": "Total (KHR)",
                "Qty": "",
                "Discount": "",
                "Deposit": "",
                "Amount": `${totalKHR.toLocaleString()} KHR`,
                "Order": "",
                "Status": "",
                "Out Time": ""
            };

            // Add empty values for dynamically created item columns in total rows
            for (let i = 1; i <= maxItems; i++) {
                totalRowUSD[` ${i} Name`] = "";
                totalRowUSD[` ${i} Qty`] = "";
                totalRowUSD[` ${i} Price`] = "";
                totalRowUSD[` ${i} Amount`] = "";

                totalRowKHR[` ${i} Name`] = "";
                totalRowKHR[` ${i} Qty`] = "";
                totalRowKHR[` ${i} Price`] = "";
                totalRowKHR[` ${i} Amount`] = "";
            }

            transformedData.push(totalRowUSD, totalRowKHR);

            // **Convert JSON to Worksheet**
            const worksheet = XLSX.utils.json_to_sheet(transformedData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices Today");

            // **Create Excel file and trigger download**
            XLSX.writeFile(workbook, `ExportedData_${startDate}_to_${endDate}.xlsx`);
        } catch (error) {
            console.error("Error exporting data:", error);
        }
    };




    // const fetchInvoiceById = async (invoiceId) => {
    //     console.log(`📢 Fetching Invoice ID: ${invoiceId}`);

    //     try {
    //         const response = await axios.get(`http://localhost:5000/invoices/getlist/${invoiceId}`);
    //         console.log("📜 Selected Invoice:", response.data);

    //         if (response.data.success) {
    //             const invoice = response.data.invoice;
    //             setInvoice(invoice); // ✅ Store the invoice data
    //             openTelegram(invoice); // ✅ Forward to Telegram immediately
    //         } else {
    //             alert("No invoice found!");
    //         }
    //     } catch (error) {
    //         console.error("❌ Error fetching invoice:", error);
    //     }
    // };


    // const getProcessStatus = (status) => {
    //     switch (status) {
    //         case 1: return " 🟢 បង់រួចរាល់🔄 ";
    //         case 2: return " 🟡 កក់ប្រាក់🔄 ";
    //         case 3: return " 🔴 មិនទាន់រួចរាល់🔄 ";
    //         default: return " ⚪ Unknown ";
    //     }
    // };
    // // 🔹 Open invoice details in Telegram
    // const openTelegram = (invoice) => {

    //     const message = encodeURIComponent(`
    // 📜 ហាងបោះពុម្ភ ឌឹព្រីន 
    // ======================
    // 🆔 លេខវិក្ក័យបត្រ: 000${invoice.invId}
    // 📅 កាលបរិច្ឆេទ: ${new Date(invoice.CreateAt).toLocaleString()}
    // ---------------------------
    // 📦 មុខទំនិញ:
    // ${formatItems(invoice.items)}
    // ---------------------------
    // 📊 ចំនួនសរុប: ${invoice.qtyTotal}
    // 💵 បញ្ចុះតម្លៃ: ${invoice.discount} %
    // 💰 ប្រាក់កក់: ${invoice.discountPercentage} $
    // 💵 ទឹកប្រាក់ត្រូវបង់ចំនួន: ${invoice.finalAmount} $
    // 📌 អតិថិជនបាន: ${getProcessStatus(invoice.customerStatus)} 
    // ---------------------------

    // `);

    //     window.open(`https://t.me/share/url?url=${message}`, "_blank");
    // };



    // // Format Items as List
    // const formatItems = (items) => {
    //     try {
    //         const parsedItems = JSON.parse(items);
    //         return parsedItems // No   Name  Qty  Price Amount 
    //             .map((item, index) => ` ${index + 1}.   ${item.name}   -   ${item.qty}qty     x      ${item.price} $     =     ${item.amount.toLocaleString()} $`) // show under link  No   Name  Qty  Price Amount 
    //             .join("\n");
    //     } catch (error) {
    //         console.error("Error parsing items:", error);
    //         return items; // Fallback
    //     }
    // };






    const deleteInvoice = async (id) => {
        try {
            if (!window.confirm("Trash delete this invoice?")) return;
            window.location.reload();

            await axios.delete(`http://localhost:5000/invoices/${id}`);
            message.success("Invoice deleted successfully!");

            // ✅ Refresh the entire page after deletion
        } catch (error) {
            console.error("Error deleting invoice:", error);
            message.error("Failed to delete invoice.");
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



    const printInvoice = (item) => {
        // Parse items from JSON string
        const items = JSON.parse(item.items || "[]");

        // Calculate total amount before discount and disposit
        const totalBeforeDiscount = items.reduce((sum, item) => sum + parseFloat(item.amount), 0); 
        // const totalBeforeDiscount = items.reduce((sum, item) => sum + parseFloat(item.amount), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); // Ensures 2 decimal places;
        const kh = riel.map((item, index) => (item.khriel))
        // const currency = item.currency;
        const currency = item.currency === "KHR" ? "៛" : "$";
        const finalAmountDue = item.finalAmount - item.disposit;
        const roundToNearest500 = (amount) => {
            return Math.round(amount / 100) * 100;
        };

        // Construct the invoice content with proper HTML structure
        const printContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Invoice #0000${item.invId}</title>
              <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:ital,wght@0,100..700;1,100..700&family=Khmer&display=swap" rel="stylesheet">
             <style>
               
               
        .width-invoice {
            justify-content: space-between;
            display: flex;
            padding: 2px;
            width: 95%;
           margin: auto;
        }
             .khmer-regular {
                  font-family: "Kantumruy Pro", serif;
                font-weight: 500;
               
                 font-size: 14px;
            }
  

        .logo-invoice img {
            width: 85px;
            position: absolute;
        }

        .logo-invoice p {
            padding-top: 50px;
            margin-left: 5px;
            font-size: 7px;
            font-family: Arial, Helvetica, sans-serif;
            color: rgb(3, 173, 196);
        }

        .title-invoice h1 {
            font-size: 25px;
            font-family: Arial, Helvetica, sans-serif;
            margin-top: 20px;
        }

        .qrcode-invoice img {
            width: 60px;
            padding-top: 10px;
        }

        .info-invoice {
            justify-content: space-between;
            display: flex;
            padding: 2px;
            width: 90%;
            margin: auto;
        }

        .number-invoice h2 {
            font-size: 12px;
            font-family: Arial, Helvetica, sans-serif;
            position: absolute;
           
        }

        .number-invoice p {
            font-size: 15px;
            font-family: arial, sans-serif;
            color: red;
            margin-top: 2rem;
        }

        .date-invoice h2 {
            font-size: 12px;
            font-family: Arial, Helvetica, sans-serif;
            position: absolute;
            width: 120px;
           
            
        }

        .date-invoice p {
            font-size: 12px;
            font-family: Arial, Helvetica, sans-serif;
            font-weight: bold;
            margin-top: 2rem;
        }

        table {
            font-family: arial, sans-serif;
           
            width: 95%;
            margin: auto;
        }

        td,
        th {
            padding: 4px;
            text-align: center;
        }

        tr:nth-child(even) {
            background-color:rgb(241, 241, 241);
        }

        .head-table {
            background-color: #04AA6D;
            color: white;
            font-size: 15px;
        }

        .td-table {
            font-size: 14px;
           
        }

        .totalfind {
            justify-content: space-between;
            display: flex;
            width: 95%;
            margin: auto;
            font-family: arial, sans-serif;
            font-size: 14px;
            padding: 10px;
        }
        .right-find {
            width: 40%;
           

        } 

        .subprice {
            justify-content: space-between;
            display: flex;
            width: 95%;
            margin: auto;
            padding: 4px;
        }
        .title-name {
            width: 40%;
        }

        .space {
            width: 5%;
        }

        .title-price {
         text-align: right;
            width: 45%;
        }
        .balence {
            justify-content: space-between;
            display: flex;
            width: 95%;
            margin: auto;
            background-color: rgb(235, 219, 6);
            height:41px
        }
        .balance-right {
            width: 40%;
             padding-top: 3px;
             
        }

        .balance-total {
            justify-content: space-between;
            display: flex;
            width: 95%;
            margin: auto;
        }
        .balance-name {
            width: 55%;
            font-weight: bolder;
            font-size: 13px;
            font-family: arial, sans-serif;
        }
      

        .balance-price {
            width: 45%;
            font-weight: bolder;
             font-size: 15px;
              text-align: right;
        }

        .ex-change{
        
        margin-left: 30rem;
        }
        .left-txt{
        
        text-align: left;
        
        }
        .balance-left p{
        padding-left: 10px;
         font-size: 12px;
          font-family: arial, sans-serif;

        
        
        }

    </style>
            </head>
            <body>
              
              <div>
        <div class="width-invoice">
            <div class="logo-invoice">
                <img src=${logoImage} alt="">
                <p>011 633 515 / 086 593 939</p>
            </div>
            <div class="title-invoice">
                <h1>INVOICE</h1>
            </div>
            <div class="qrcode-invoice">
                <img src=${qrImage} alt=""/>
            </div>
        </div>
        <hr>
        <div class="info-invoice">
            <div class="number-invoice">
                <h2>INVOICE NUMBER</h2>
                <p>#INV-000${item.invId}</p>
            </div>
            <div class="date-invoice">
                <h2>INVOICE DATE</h2>
                <p>${moment().format(" MM/  DD/  YYYY")}</p>
            </div>
        </div>
        <table>
            <tr class="head-table">
                <th class="w-n">No</th>
                <th>Product Name</th>
                <th>Qty</th>
                <th>Price(Unit)</th>
                <th>Amount(${currency})</th>
            </tr>
            
             
                ${items.map((item, index) =>
            ` <tr class="td-table">
                 <td>${index + 1}</td>
                 <td class="left-txt khmer-regular">${item.name}</td>
                <td>${item.qty}</td>
                <td> ${currency === "៛" ? Number(item.price).toLocaleString() : Number(item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency} </td>
                <td> ${currency === "៛" ? Number(item.amount).toLocaleString() : Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency} </td>
            </tr> `
        )

                .join("")}
          </table>
          <hr>

           <div class="totalfind">
            <div class="left-find"></div>
            <div class="right-find">
                <div class="subprice">
                    <div class="title-name">SubTotal</div>
                    <div class="space">:</div>
                    <div class="title-price"> ${currency === "៛" ? Number(totalBeforeDiscount).toLocaleString() : Number(totalBeforeDiscount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}</div>
                </div>
                <div class="subprice">
                    <div class="title-name">Disposit</div>
                    <div class="space">:</div>
                    <div class="title-price">${currency === "៛" ? Number(item.disposit).toLocaleString() : Number(item.disposit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}</div>
                </div>
                <div class="subprice">
                    <div class="title-name">Discount</div>
                    <div class="space">:</div>
                    <div class="title-price">${item.discountPercentage} %</div>
                </div>
            </div>
        </div>
        
         <div class="balence">
            <div class="balance-left"><p>Exchange-Rate: 1$ = ${kh.toLocaleString()} ៛</p></div>
            <div class="balance-right">
                <div class="balance-total">
                    <div class="balance-name">Balance Due</div>
                    <div class="balance-price">${currency === "៛" ? Number(finalAmountDue).toLocaleString() : Number(finalAmountDue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}</div>
                </div>
                <div class="balance-total">
                    <div class="balance-name">${currency === "៛" ? "Dollar " : "Kh Riel "} </div>
                   
                    <div class="balance-price">${currency === "៛" ? Number(finalAmountDue / kh).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " $" : Number(finalAmountDue * kh).toLocaleString() + " ៛"} 
                    </div>
                   
                </div>
                 
               
            </div>
            
        </div>
       
        </div>

        </div>
            </body>
          </html>
        `;

        // Open a new print window
        const printWindow = window.open("", "_blank");

        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();

            // Ensure content is fully loaded before printing
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        } else {
            alert("Popup blocked! Please allow popups for this site.");
        }
    };


    const columns = [
        {
            title: "Invoice ID",
            dataIndex: "invId",
            key: "invId",
            sorter: (a, b) => a.invId - b.invId, // Numeric sorting
            defaultSortOrder: 'descend', // Default to descending orde
            render: (value, item, index) => {
                return (
                    <div>{value == null ? <div></div> : <div>INV 000{item.invId}</div>}</div>
                )
            }

        },
        {
            title: "Customer Name",
            dataIndex: "customerName",
            key: "customerName",
            // sorter: (a, b) => a.customerName.localeCompare(b.customerName), // Alphabetical sorting
            // defaultSortOrder: 'ascend', // A to Z by default
        },

        {
            title: "Total Quantity",
            dataIndex: "qtyTotal",
            key: "qtyTotal",
            render: (value, item, index) => value + " Qty"
        },
        {
            title: "Discount",
            dataIndex: "discount",
            key: "discount",
            render: (value, item, index) => (
                // <span >{item.discount} {item.currency}</span>
                <span >{item.currency === "KHR" ? Number(item.discount).toLocaleString() : Number(item.discount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {item.currency}</span>
            )
        },
        {
            title: "D-Percentage (%)",
            dataIndex: "discountPercentage",
            key: "discount",
            render: (value, item, index) => value + "%"
        },
        {
            title: "Disposit",
            dataIndex: "disposit",
            key: "disposit",
            render: (value, item, index) => (
                // <span >{item.discount} {item.currency}</span>
                <span >{item.currency === "KHR" ? Number(item.disposit).toLocaleString() : Number(item.disposit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {item.currency}</span>
            )
        },
        {
            title: "Final Amount",
            dataIndex: "finalAmount",
            key: "finalAmount",
            render: (value, item, index) => (
                <span >{item.currency === "KHR" ? Number(item.finalAmount).toLocaleString() : Number(item.finalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {item.currency}</span>
            )
        },
        {
            title: "Order Status",
            dataIndex: "orderStatus",
            key: "orderStatus",
            render: (value, item, index) => (value == 1 ? <Tag style={{ display: "flex", justifyContent: "space-between", width: "60px" }} color='green'> <span style={{ marginTop: "2.5px", fontSize: "16px" }}><CiMoneyBill /></span> Paid</Tag> : "" || value == 2 ? <Tag style={{ display: "flex", justifyContent: "space-between", width: "80px" }}><span style={{ marginTop: "2px", fontSize: "14px" }}><GiReceiveMoney /></span>Disposit</Tag> : "" || value == 3 ? <Tag style={{ display: "flex", justifyContent: "space-between", width: "70px" }} color='red'><span style={{ marginTop: "2px", fontSize: "14px" }}><IoMdCloseCircleOutline /></span>Unpaid</Tag> : "")
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
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
            // dataIndex: "status",
            key: "status",
            render: (value, item, index) => (
                <Space>
                    <Popconfirm
                        title="Are you sure to delete this invoice?"
                        onConfirm={() => deleteInvoice(item.invId)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type='primary' danger  ><span ><AiOutlineDelete /> </span></Button>

                    </Popconfirm>
                    <Button onClick={() => printInvoice(item)} color="cyan" variant="dashed"  ><span ><FcPrint /> </span></Button>
                    {/* <Button onClick={() => fetchInvoiceById(item.invId)} color="cyan" variant="dashed"  ><span ><RiEdit2Line /></span></Button> */}
                </Space>
            )
        },
    ];



    return (
        // <MainPage loading={loading} >
        <div className='Category-Page'>
            <div className='Category'>

                <div>
                    <Space>
                        <div class='font-bold'>Customer  {data.length}</div>
                        <Input.Search
                            ref={searchRef} // Attach useRef to the input field
                            placeholder="Search by Invoice ID"
                            // enterButton="Search"
                            allowClear
                            onSearch={fetchInvoices}
                        />

                        <Select
                            placeholder="Pay Proccess"
                            style={{ width: 150 }}
                            allowClear
                            value={orderStatus}
                            onChange={setOrderStatus}

                        >
                            <Option value="1">Paid</Option>
                            <Option value="2">Deposit</Option>
                            <Option value="3">Unpaid</Option>
                        </Select>

                        <Button onClick={fetchInvoices} type="primary">Search</Button>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            style={{ padding: "4px", marginRight: "30px", border: "1px solid black" }}
                        >
                            <option value="">Select Month</option>
                            {monthNames.map((month, index) => (
                                <option key={index} value={month}>{month}</option>
                            ))}
                        </select>

                        <label>Start Date:</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: "4px", }} />
                        <label>End Date:</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        <Button onClick={handleExport1}>Export for day <PiMicrosoftExcelLogoThin /></Button>



                        {/* <p>Export to </p><Button color="primary" variant="dashed" onClick={handleExport}>Excel<PiMicrosoftExcelLogoThin /></Button> */}

                    </Space>


                </div>

                {/* <Button onClick={() => { setOpen(true) }} type="primary"><span><FaUserPlus /></span></Button> */}

                {/* <Button color="primary" variant="dashed" onClick={handleExport} disabled={!selectedMonth}>Excel<PiMicrosoftExcelLogoThin /></Button>
                <Button color="primary" variant="dashed" onClick={handleExportall}>Excel<PiMicrosoftExcelLogoThin /></Button>  */}
                <div class="flex gap-10">

                    <div>{selectedMonth ? (
                        <Button color="primary" variant="dashed" onClick={handleExport} disabled={!selectedMonth}>
                            Export Month <PiMicrosoftExcelLogoThin />
                        </Button>
                    ) : (
                        <Button color="primary" variant="dashed" onClick={handleExport}>
                            Export all Data <PiMicrosoftExcelLogoThin />
                        </Button>
                    )}</div>


                </div>


                {/* === */}
            </div>

            <div>

                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="invId"
                    pagination={{ pageSize: 7 }}
                    // pagination={false}
                    bordered
                //shot id  des

                />
            </div>


            <div>
              

            </div>

        </div>
        // </MainPage>        

    )
}
export default InvoiceListScreen;