import React, { useState, useEffect, useRef } from "react";
import styles from "../Styles/MemoPages.module.css";
import { motion } from "framer-motion";
import { FiPlus, FiShare2 } from "react-icons/fi";
import SubjectEditor from "./SubjectEditor";

const MemosPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [showAddSubjectCard, setShowAddSubjectCard] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [currentShareSubject, setCurrentShareSubject] = useState(null);
  const [shareEmail, setShareEmail] = useState("");

  const addCardRef = useRef();
  const shareCardRef = useRef();

  const handleAddSubject = () => {
    const trimmedName = newSubjectName.trim();

    if (trimmedName) {
      const isDuplicate = subjects.some(
        (s) => s.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (isDuplicate) {
        setShowAddSubjectCard(false);
        setNewSubjectName("");
        return;
      }

      const newSubject = {
        name: trimmedName,
        id: Date.now(),
        content: "",
        sharedWith: [],
      };

      setSubjects([...subjects, newSubject]);
      setShowAddSubjectCard(false);
      setNewSubjectName("");
    }
  };

  const handleShareSubmit = () => {
    if (shareEmail && currentShareSubject) {
      const updated = subjects.map((s) =>
        s.id === currentShareSubject.id
          ? { ...s, sharedWith: [...s.sharedWith, shareEmail] }
          : s
      );
      setSubjects(updated);

      setShowShareCard(false);
      setShareEmail("");
      setCurrentShareSubject(null);
    }
  };

  const handleShareClick = (subject, e) => {
    e.stopPropagation();
    setCurrentShareSubject(subject);
    setShowShareCard(true);
  };

  const goBack = () => {
    setSelectedSubject(null);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (addCardRef.current && !addCardRef.current.contains(e.target)) {
        setShowAddSubjectCard(false);
      }
      if (shareCardRef.current && !shareCardRef.current.contains(e.target)) {
        setShowShareCard(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (selectedSubject) {
    return (
      <SubjectEditor
        subject={selectedSubject}
        onBack={goBack}
        onUpdate={(updated) => {
          setSubjects((prev) =>
            prev.map((s) => (s.id === updated.id ? updated : s))
          );
        }}
      />
    );
  }

  return (
    <motion.div className={styles.container}>
      <h1 className={styles.header}>Course Memos</h1>
      <div className={styles.actions}>
        <button
          className={styles.addButton}
          onClick={() => setShowAddSubjectCard(true)}
        >
          <FiPlus /> Add Subject
        </button>
      </div>

      {showAddSubjectCard && (
        <div
          className={styles.addSubjectCard}
          ref={addCardRef}
          data-title="Add Subject"
        >
          <div className={styles.cardContent}>
            <input
              type="text"
              placeholder="Enter subject name"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              className={styles.inputField}
            />
            <button className={styles.doneButton} onClick={handleAddSubject}>
              Done
            </button>
          </div>
        </div>
      )}

      {showShareCard && (
        <div
          className={styles.addSubjectCard}
          ref={shareCardRef}
          data-title="Add User"
        >
          <div className={styles.cardContent}>
            <input
              type="email"
              placeholder="Enter email to share"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              className={styles.inputField}
            />
            <button className={styles.doneButton} onClick={handleShareSubmit}>
              Share
            </button>
          </div>
        </div>
      )}

      <div className={styles.grid}>
        {subjects.map((subject) => (
          <motion.div
            key={subject.id}
            className={styles.card}
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => setSelectedSubject(subject)}
          >
            <h2 className={styles.cardTitle}>{subject.name}</h2>
            <p className={styles.cardText}>
              Shared with: {subject.sharedWith.join(", ") || "Only you"}
            </p>
            <button
              className={styles.shareButton}
              onClick={(e) => handleShareClick(subject, e)}
            >
              <FiShare2 /> Share
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default MemosPage;
