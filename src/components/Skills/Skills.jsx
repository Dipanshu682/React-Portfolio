import "./Skills.css";

import { FaPython } from "react-icons/fa6";
import { SiDjango } from "react-icons/si";
import { SiFlask } from "react-icons/si";
import { DiJavascript } from "react-icons/di";
import { FaNodeJs } from "react-icons/fa";
import { RiReactjsFill } from "react-icons/ri";
import { FaHtml5 } from "react-icons/fa6";
import { FaCss3Alt } from "react-icons/fa";
import { SiMysql } from "react-icons/si";
import { TbBrandVscode } from "react-icons/tb";
import { FaGithub } from "react-icons/fa";
import { SiPostman } from "react-icons/si";

const Skills = () => {
    const size = 50;
  const skills = [
    { name: "Python", icon: <FaPython size={size} color="#ffe974" /> },
    { name: "Django", icon: <SiDjango size={size} color="#0c4b33" /> },
    { name: "Flask", icon: <SiFlask size={size} color="#fff" /> },
    { name: "JavaScript", icon: <DiJavascript size={size} color="#ebd83e" /> },
    { name: "Node.js", icon: <FaNodeJs size={size} color="#84ba64" /> },
    { name: "Reactjs", icon: <RiReactjsFill size={size} color="#149eca" /> },
    { name: "HTML", icon: <FaHtml5 size={size} color="#e04b25" /> },
    { name: "CSS", icon: <FaCss3Alt size={size} color="#006dbb" /> },
    { name: "MySql", icon: <SiMysql size={size} color="#3663ad" /> },
    { name: "VScode", icon: <TbBrandVscode size={size} color="#23a8f2" /> },
    { name: "Github", icon: <FaGithub size={size} color="#fff" /> },
    { name: "Postman", icon: <SiPostman size={size} color="#ff6c37" /> },
  ];
  return (
    <>
      <div id="skills" className="skills">
        <h1 className="skills-title"># Skills</h1>
        <div className="skills-grid">
          {skills.map((skill, index) => (
            <div key={index} className="skills-card">
              {skill.icon}
              <p className="skills-name">{skill.name}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Skills;
