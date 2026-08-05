import "./Services.css";

function Services() {
  const services = [
    {
      title: "UI/UX Design",
      description:
        "From wireframes to polished Figma prototypes. Intuitive, visually compelling interfaces that convert visitors into users and put usability first.",
    },
    {
      title: "Frontend Dev",
      description:
        "Production-grade code with Tailwind CSS and Alpine.js. Pixel-perfect, fully responsive, SEO-friendly and blazing fast — no bloat, no heavy frameworks.",
    },
    {
      title: "Landing Pages",
      description:
        "High-converting pages for SaaS, apps and personal brands. Designed to communicate value instantly and drive action from the first scroll.",
    },
  ];

  return (
    <section className="services" id="services">
      <h2 className="services-title">Services</h2>

      <div className="services-container">
        {services.map((service, index) => (
          <div className="service-card" key={index}>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Services;