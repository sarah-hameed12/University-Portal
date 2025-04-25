import React, { useState } from "react";
import styles from "../Styles/SubjectEditor.module.css";

const SubjectEditor = ({ subject, onBack, onUpdate }) => {
  const [content, setContent] = useState(subject.content);

  const handleSave = () => {
    onUpdate({ ...subject, content });
    onBack();
  };

  return (
    <div className={styles.editorContainer}>
      <button className={styles.backButton} onClick={onBack}>
        ← Back
      </button>
      <h2 className={styles.subjectTitle}>{subject.name}</h2>
      <textarea
        className={styles.textArea}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button className={styles.saveButton} onClick={handleSave}>
        Save Notes
      </button>
    </div>
  );
};

export default SubjectEditor;
