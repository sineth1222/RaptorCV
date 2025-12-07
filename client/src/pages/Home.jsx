import React from 'react'
import Banner from '../components/home/Banner'
import Hero from '../components/home/Hero'
import Features from '../components/home/Features'
import Template from '../components/home/Template'
import CallToAction from '../components/home/CallToAction'
import Footer from '../components/home/Footer'
import Navbar from '../components/home/Navbar'
import ContactUs from '../components/home/ContactUs'
import AIFeatures from '../components/home/AIFeatures'
import HeroImageFlip from '../components/home/HeroImageFlip'

const Home = () => {
  return (
    <div>
      {/*<Banner />*/}
      <Navbar />
      <Hero />
      <HeroImageFlip />
      <AIFeatures />
      <Features />
      <Template />
      <ContactUs />
      {/*<CallToAction />*/}
      <Footer />
    </div>
  )
}

export default Home
