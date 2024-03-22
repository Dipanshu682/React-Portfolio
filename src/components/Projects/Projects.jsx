import "./Projects.css";

const Projects = () => {
  const projects = [
    {
      name: "Eshop",
      description:
        " • Developed a full-stack e-commerce web application using with Django. • Implemented User Authentication for user verification using Django’s builtin modules. • Performed CRUD operations to manage products. • Implemented search functionality to search products. ",
    },
    {
      name: "Tech_Community",
      description:
        " • Developed a simple blog web application using Django. • Implemented user authentication and user authorization. • Performed CRUD operations to manage blog posts. ",
    },
    {
      name: "Emotion_Recognition",
      description:
        " • Developed a web application which recognizes human emotions and display the relevant tag on the screen. • Used deep learning model called CNN for training images. • flask is used for back-end which integrates the deep learning model. • To use live camera and display relevant tag on the display OpenCv library is used. ",
    },
    { name: "Project 4", description: "This is project 4." },
    { name: "Project 5", description: "This is project 5." },
    { name: "Project 6", description: "This is project 6." },
  ];
  return (
    <>
      <div id="projects" className="projects">
        <h1 className="projects-title"># Projects</h1>
        <div className="projects-grid">
          {projects.map((project, index) => (
            <div key={index} className="projects-card">
              <h3 className="projects-name">{project.name} :</h3>
              <p className="projects-description">"{project.description}"</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Projects;
