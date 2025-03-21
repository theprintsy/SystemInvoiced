import { useState } from 'react'
import MainScreen from './MainScreen/LayoutScreen';
import Additem from './Page/AddItemScreen';
import InvoiceList from './Page/InvoiceListScreen';
import Customer from './Page/CustomerScreen';
// import './App.css'
import {Routes,Route,BrowserRouter} from 'react-router-dom'
import DasboardScreen from './Page/DashboardScreen';
import UserScreen from './Page/UserScreen';
import Exchangerate from './Page/ExchangerateScreen';
import TempleteScreen from './Page/TempleteScreen';
import DataBackUpScreen from './Page/DataBackUpScreen';

function App() {

  return (
    <BrowserRouter>
    
    <Routes> 
      <Route element={<MainScreen/>}>
        <Route path='/' element={<DasboardScreen/>}/>
        <Route path='invoice-list' element={<InvoiceList/>}/>
        <Route path='customer' element={<Customer/>}/>
        <Route path='add-item' element={<Additem/>}/>
        <Route path='user-control' element={<UserScreen/>}/>
        <Route path='exchangerate' element={<Exchangerate/>}/>
        <Route path='templete-cos' element={<TempleteScreen/>}/>
        <Route path='data-backup' element={<DataBackUpScreen/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
