import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Home/Home";
import About from "./components/About/About";
import Projects from "./components/Projects/Projects";
import Skills from "./components/Skills/Skills";
import Contact from "./components/Contact/Contact";

const Numbers = () => {
  const lineNumbers = Array.from({ length: 150 }, (_, i) => i + 1);
  return (
    <>
      <div className="numbers">
        {lineNumbers.map((number) => (
          <div key={number} className="line-number">
            {number}
          </div>
        ))}
      </div>
    </>
  );
};

const App = () => {
  return (
    <>
      <div className="app">
        <Numbers />
        <div className="right-side">
          <Navbar />
          <Home />
          <About />
          <Projects />
          <Skills />
          <Contact />
        </div>
      </div>
    </>
  );
};

export default App;
