import './ComponentStyles.css';

export default function SendEmail() {
  return (
    <div className="card">
      <h2>Send Email</h2>
      <form className="form">
        <input type="email" placeholder="To (faculty email)" />
        <input type="text" placeholder="Subject" />
        <textarea placeholder="Message..." />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
