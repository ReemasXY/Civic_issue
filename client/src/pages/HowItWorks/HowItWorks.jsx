import React from "react";
import Hero from "./Hero";


import StepsTimeline from "./StepsTimeLine";
import Feature from "./Feature";
import Banner from "./Banner";





export default function HowItWorks() {
  return (
    <main className="min-h-screen bg-white ">
      <Hero />
      <StepsTimeline />
      <Feature />
      <Banner />
    </main>
  );
}