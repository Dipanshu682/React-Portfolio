import './Home.css';
import avatar from '../../assets/avatar.png';

const Home = () => {
  return (
    <div id="home" className="home">
      <div className="home-left">
        <img src={avatar} alt="home-Profile" />
      </div>
      <div className="home-right">
        <h1 className="home-name"># Hey, I am Dipanshu Sengar</h1>
        <p className="home-text">" A software developer. "</p>
      </div>
    </div>
  );
};

export default Home;
