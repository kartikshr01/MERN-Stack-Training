import "./Blog.css";

import blog1 from "../../assets/blog1.jfif";
import blog2 from "../../assets/blog2.jfif";
import blog3 from "../../assets/blog3.jfif";

function Blog() {
  const blogs = [
    {
      image: blog1,
      title: "Building Responsive Websites in 2026",
      description:
        "Learn the principles behind responsive web design and discover techniques to create seamless experiences across all devices.",
    },
    {
      image: blog2,
      title: "Why UI/UX Matters More Than Ever",
      description:
        "Great interfaces aren't just beautiful—they're intuitive. Explore the design decisions that keep users engaged.",
    },
    {
      image: blog3,
      title: "Frontend Performance Tips",
      description:
        "Improve loading speed, accessibility, and SEO with practical frontend optimization techniques every developer should know.",
    },
  ];

  return (
    <section className="blog" id="blog">
      <h2 className="blog-heading">Latest Blog</h2>

      <div className="blog-container">
        {blogs.map((blog, index) => (
          <div className="blog-card" key={index}>
            <img src={blog.image} alt={blog.title} />

            <div className="blog-content">
              <h3>{blog.title}</h3>

              <p>{blog.description}</p>

              <button>Read More</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Blog;