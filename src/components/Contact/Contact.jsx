import { useRef } from "react";
import emailjs from '@emailjs/browser';
import "./Contact.css";

const Contact = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs.sendForm('service_jacmmvt', 'template_ppk81jh', form.current, {publicKey:'A7sCGQUGuFq2yhagC'})
    .then(
      () => {
        alert('SUCCESS!');
      },
      (error) => {
        alert('FAILED', error.text);
      },
    );
  };

  return (
    <div id="contact" className="contact">
      <h1 className="contact-title"># Contact</h1>
      <form ref={form} onSubmit={sendEmail}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            className="text"
            type="text"
            id="name"
            name="name"
            value={form.name}
            // onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            className="text"
            type="email"
            id="email"
            name="email"
            value={form.email}
            // onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="message">Message:</label>
          <textarea
            className="text"
            id="message"
            name="message"
            value={form.message}
            // onChange={handleChange}
            required
          />
        </div>
        <input className="button" type="submit" value="Send"/>
      </form>
    </div>
  );
};

export default Contact;
