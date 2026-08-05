import { useState } from "react";
import "./App.css";
import Layout from "./Components/Layout/Layout";
import Hero from "./Components/Hero/Hero";
import Services from "./Components/Services/Services";
import About from "./Components/About/About";
import Blog from "./Components/Blog/Blog";
import Reviews from "./Components/Reviews/Reviews";
import Contact from "./Components/Contact/Contact";


function App() {
  return (
  <>
    <Layout>
      <Hero />
      <Reviews />
      <Services />
      <Blog />
      <About />
      <Contact />
    </Layout>
  </>
)}

export default App;
