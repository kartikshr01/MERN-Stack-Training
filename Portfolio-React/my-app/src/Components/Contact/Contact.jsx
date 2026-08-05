import "./Contact.css";

function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="contact-left">
        <h2>Let's Work Together</h2>

        <p>
          Have a project in mind or just want to say hello? I'd love to hear
          from you. Fill out the form and I'll get back to you as soon as
          possible.
        </p>

        <div className="contact-info">
          <div className="info-item">
            <h4>Email</h4>
            <span>kartiksharma2462092@gmail.com</span>
          </div>

          <div className="info-item">
            <h4>Phone</h4>
            <span>+91 6350479701</span>
          </div>

          <div className="info-item">
            <h4>Location</h4>
            <span>Udaipur, India</span>
          </div>
        </div>
      </div>

      <div className="contact-right">
        <form>
          <input type="text" placeholder="Your Name" />

          <input type="email" placeholder="Your Email" />

          <input type="text" placeholder="Subject" />

          <textarea
            rows="6"
            placeholder="Write your message..."
          ></textarea>

          <button type="submit">Send Message</button>
        </form>
      </div>
    </section>
  );
}

export default Contact;