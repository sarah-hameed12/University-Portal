import './ComponentStyles.css';

const mockEmails = [
    { to: "dr.waqar@lums.edu.pk", subject: "Assignment Extension", status: "Pending" },
    { to: "prof.maryam@lums.edu.pk", subject: "Query about Grades", status: "Replied" },
    { to: "dr.adam@lums.edu.pk", subject: "Class Reschedule", status: "Pending" },
];

export default function TrackEmail() {
    const handleEmailClick = (email) => {
        console.log('Email clicked:', email);
        // alert(`Email clicked for subject: ${email.subject} to: ${email.to}`);
    };

    return (
        <div className="card" id="track-emails-card">
            <h2>Track Emails</h2>
            <ul className="email-list">
                {mockEmails.map((email, i) => (
                    <li
                        key={i}
                        className="list-item clickable email-list-item"
                        onClick={() => handleEmailClick(email)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="email-details">
                            <strong>{email.subject}</strong><br />
                            <span className="small-text">To: {email.to}</span>
                        </div>
                        <span className="email-status">{email.status}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}