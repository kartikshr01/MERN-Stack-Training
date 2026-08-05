import "./Reviews.css";

import user1 from "../../assets/profile.avif";
import user2 from "../../assets/profile.avif";
import user3 from "../../assets/profile.avif";
import user4 from "../../assets/profile.avif";

function Reviews() {
  const reviews = [
    {
      image: user1,
      name: "Sarah Johnson",
      role: "Startup Founder",
      review:
        "Working with Eliott was an amazing experience. The website was delivered ahead of schedule and exceeded all our expectations.",
    },
    {
      image: user2,
      name: "David Miller",
      role: "Product Manager",
      review:
        "Professional, creative and highly skilled. The UI was beautiful, responsive and the code quality was excellent.",
    },
    {
      image: user3,
      name: "Emily Carter",
      role: "Marketing Director",
      review:
        "Our landing page conversion rate improved significantly after the redesign. Communication throughout the project was outstanding.",
    },
    {
      image: user4,
      name: "Michael Brown",
      role: "Agency Owner",
      review:
        "One of the best frontend developers I've collaborated with. Every detail was polished and the final product looked fantastic.",
    },
  ];

  return (
    <section className="reviews" id="reviews">
      <h2 className="reviews-heading">What Clients Say</h2>

      <div className="reviews-container">
        {reviews.map((item, index) => (
          <div className="review-card" key={index}>
            <div className="stars">
              ★★★★★
            </div>

            <p className="review-text">
              "{item.review}"
            </p>

            <div className="review-user">
              <img src={item.image} alt={item.name} />

              <div>
                <h3>{item.name}</h3>
                <span>{item.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Reviews;