import './ComponentStyles.css';

const mockNotifications = [
    { from: "Dr. Fareed", message: "Class postponed to Friday", id: 1 },
    { from: "Prof. Suleman", message: "Assignment deadline updated", id: 2 },
];

export default function Notifications() {
    const handleNotificationClick = (notification) => {
        console.log('Notification clicked:', notification);
        // alert(`Notification clicked from: ${notification.from} - ${notification.message}`);
    };

    return (
        <div className="card">
            <h2>Notifications</h2>
            <ul className="notification-list">
                {mockNotifications.map((note, i) => (
                    <li
                        key={note.id || i} 
                        className="notification clickable"
                        onClick={() => handleNotificationClick(note)}
                        style={{ cursor: 'pointer' }}
                    >
                        <strong>{note.from}:</strong> {note.message}
                    </li>
                ))}
            </ul>
        </div>
    );
}