import React from 'react'
import Navbar from '../../components/Navbar'
import Hero from './Hero'
import Banner from './Banner'
import RecentComplaints from './RecentComplaints'
import Footer from '../../components/Footer'
import TestimonialCarousel from './TestimonialCarousel'
const Home = () => {
  return (
  <>
  
    <Hero/>
    <Banner></Banner>
    <RecentComplaints/>
    <TestimonialCarousel/>
   
  </>
  )
}

export default Home