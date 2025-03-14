import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Table, Button, Space, Modal, Form, Select, Input, message, Tag, DatePicker, Row, Col, InputNumber, Image } from 'antd'
import './MainScreen.css'
// import Logo from '../asset/ISM COL (1).png'
// import Logo from '../asset/logo.png'
import Profile from '../assets/admin.png'
import Logo from '../assets/the.png'
// import { Config, getUserLogin, isLogin, logOut } from '../Config/support';
import { LuLayoutDashboard } from "react-icons/lu";
import { LuUsers } from "react-icons/lu";
import { CiSquarePlus } from "react-icons/ci";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { RiCustomerService2Fill } from "react-icons/ri";
import { PiListPlusLight } from "react-icons/pi";
import { RiUser6Line } from "react-icons/ri";
import { LiaUsersCogSolid } from "react-icons/lia";
import { MdBusiness, MdLogout } from "react-icons/md";
import { TbHomeSignal } from "react-icons/tb";
import { GoProjectTemplate } from "react-icons/go";
import { MdDashboard } from "react-icons/md";
import { FaSignOutAlt } from "react-icons/fa";
import { MdCurrencyExchange } from "react-icons/md";
import { MdOutlineSettingsSuggest } from "react-icons/md";
import {
  BranchesOutlined,
  DeploymentUnitOutlined,
  DesktopOutlined,
  DiffOutlined,
  FallOutlined,
  FileOutlined,
  GoldOutlined,
  LogoutOutlined,
  PieChartOutlined,
  PrinterOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
const { Header, Content, Footer, Sider } = Layout;
function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}
const items = [
  getItem('Dashboard', '', <MdDashboard />),
  getItem('Customer', 'customer', <RiCustomerService2Fill />),
  getItem('Add Item', 'add-item', <PiListPlusLight />),
//   getItem('Add Item', 'addlist-item', <PiListPlusLight />),
  getItem('Invoice List', 'invoice-list', <LiaFileInvoiceSolid />),
  // getItem('User', 'sub1', <RiUser6Line />, [
  //   getItem('Role', 'user-control', <LiaUsersCogSolid />),
  //   // getItem('Tester', '4'),
  //   // getItem('Alex', '5'),
  // ]),
 
  getItem('Template', 'templete-cos', <GoProjectTemplate />),
  getItem('Setting ', 'sub2', <MdOutlineSettingsSuggest />,
    [getItem('Exchange Rate', 'exchangerate', <MdCurrencyExchange />),
      // getItem('User', 'user-control', <LiaUsersCogSolid />),
 
    ]),
];
const LayoutScreen = () => {
//   const user = getUserLogin();
  const navigate = useNavigate()
  useEffect(() => {
    // if (!isLogin()) {
    //   navigate("login");
    // }
  }, [])
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const onClickmenu = (event) => {
    if (event.key == "logout") {

      Modal.confirm({
        title: "Logout",
        content: " {user?.Name} Are you sure you want to Logout ? ",
        okText: <LogoutOutlined style={{ color: "red" }} />,
        cancelText: "No",
        okType: "danger",
        centered: true,
        onOk: async () => {
        //   logOut();  
        }
      })
      return;
    }
    navigate(event.key)
  }
//   if (!user) {
//     return null;
//   }
  const onClickmenu1 = () => {
    if ("logout") {
      Modal.confirm({
        title: "Log out",
        content: (
          <div>
            <h1 class="font-mono tracking-tight text-blue-600 dark:text-sky-400 text-lg">!Errrrr</h1>
            <p class="text-center p-2">Are you sure you want to log out?</p>
          </div>
        ),
        okText: <MdLogout style={{ color: "red" }} />,
        cancelText: "No",
        okType: "danger",
        centered: true,
        onOk: async () => {
        //   logOut();
        }
      })
      return;
    }
    // navigate(.key)
  }
//   if (!user) {
//     return null;
//   }
  return (
    <Layout
      style={{
        minHeight: '100vh',
      

      }}
    >
      <Sider style={{ backgroundColor: 'black' }} collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="demo-logo-vertical" />
        <div className='inv-sty' ><Link to='/'>Invoice IMS</Link></div>
        <Menu style={{ backgroundColor: 'black', color: 'white', fontFamily: 'Verdana, sans-serif' }} theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} onClick={onClickmenu}  >
        </Menu>
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        >
          <div className='logo-width'>
            <div className='logo'>
              {/* <img src={Logo} alt="" /> */}
              <img src={Logo} alt="" />
            </div>
            <div className='user'>
              <div className='profile-name'>
                {/* <img src={Config.Image_Part + user?.Image} alt="" /> */}
                <img src={Profile} alt="" />
              </div>
              <div className='title-user'>
                {/* <h2 class="ont-mono ">{user?.Name}</h2> */}
                <h2 class="ont-mono ">Admin</h2>
              </div>
              <Button onClick={onClickmenu1} className='out-btn'> <MdLogout style={{ color: "red" }} /></Button>
            </div>
          </div>
        </Header>
        <Content
          style={{
            marginTop: '5px',
          }}
        >
          <div
            style={{
              padding: 30,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer
          style={{
            textAlign: 'center',
            backgroundColor: 'black',
            color: "#c2c2c2"
          }}
        >
          Invoice management System ©{new Date().getFullYear()} Created by <span style={{ color: 'rgb(0, 123, 223)' }}><a href='https://t.me/Ren_Thai_Rath'>Ren Thai Rath</a></span>
        </Footer>
      </Layout>
    </Layout>
  );
};
export default LayoutScreen;