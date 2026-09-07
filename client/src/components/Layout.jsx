import React from 'react'
import { Outlet } from 'react-router'
import Navbar from './Navbar'
import Footer from './Footer'
import Toast from '../utils/Toast'

const Layout = () => {
  return (
  <>
  <Toast />
  <Navbar/>
  <Outlet/>
  <Footer/>
  </>
  )
}

export default Layout