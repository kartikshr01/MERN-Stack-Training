import "./About.css";
import profileImage from "../../assets/DP.png"; 

function About() {
  const skills = [
    "HTML / CSS",
    "Tailwind CSS",
    "JavaScript",
    "React JS",
    "Express JS",
    "MongoDB",
    "Node",
    "MySQL",
  ];

  return (
    <section className="about" id="about">
      <div className="about-image">
        <img src={profileImage} alt="About Me" />
      </div>

      <div className="about-content">
        <h2>A bit about who I am</h2>

        <p>
          I'm Kartik Sharma, a freelance designer and frontend developer based in
          India with 1 year of experience shipping digital products for
          startups, agencies, and scale-ups across India. I thrive at the
          intersection of great design and clean code.
        </p>

        <p>
          I believe great interfaces are invisible — they get out of the user's
          way. My work is fast, accessible and built to last. When I'm not
          coding, you'll find me hiking or hunting for a good espresso.
        </p>

        <div className="skills">
          {skills.map((skill, index) => (
            <span key={index} className="skill">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default About;