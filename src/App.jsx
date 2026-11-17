import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Deploy from "./pages/Deploy.jsx";
import GmDeploy from "./pages/GmDeploy.jsx";
import Stake from "./pages/Stake.jsx";


export default function App(){
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/stake" element={<Stake />} />
          <Route path="/Deploy" element={<Deploy/>}/>
          <Route path="/GmDeploy" element={<GmDeploy/>}/>

        </Routes>
      </main>
      
      <Footer />
    </>
  );
}