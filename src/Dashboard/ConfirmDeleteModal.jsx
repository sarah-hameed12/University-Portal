import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle, FiX, FiLoader } from "react-icons/fi";

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1050,
  },
  content: {
    backgroundColor: "#1f2937",
    padding: "30px 35px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
    width: "90%",
    maxWidth: "420px",
    position: "relative",
    border: "1px solid #4b5563",
    textAlign: "center",
    color: "#e5e7eb",
  },
  iconWrapper: {
    margin: "0 auto 15px auto",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: "1.8rem",
    color: "#f87171",
  },
  title: {
    fontSize: "1.3rem",
    fontWeight: "600",
    marginBottom: "10px",
    color: "#f0f0f5",
  },
  message: {
    fontSize: "0.95rem",
    color: "#a0a3bd",
    marginBottom: "25px",
    lineHeight: "1.6",
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    marginTop: "10px",
  },
  button: {
    padding: "10px 25px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "0.95rem",
    fontWeight: "500",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    minWidth: "100px",
  },
  confirmButton: {
    backgroundColor: "#dc2626",
    color: "white",
    boxShadow: "0 4px 10px rgba(220, 38, 38, 0.3)",
  },
  confirmButtonHover: {
    backgroundColor: "#b91c1c",
    boxShadow: "0 6px 15px rgba(220, 38, 38, 0.4)",
    transform: "translateY(-1px)",
  },
  confirmButtonDisabled: {
    backgroundColor: "#4b5563",
    color: "#a0a3bd",
    cursor: "not-allowed",
    boxShadow: "none",
  },
  cancelButton: {
    backgroundColor: "#374151",
    color: "#e5e7eb",
    border: "1px solid #4b5563",
  },
  cancelButtonHover: {
    backgroundColor: "#4b5563",
    borderColor: "#6b7280",
  },
  buttonSpinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255, 255, 255, 0.4)",
    borderTopColor: "#ffffff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  "@keyframes spin": {
    to: { transform: "rotate(360deg)" },
  },
};

const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const modalVariants = {
  hidden: { opacity: 0, scale: 0.85, y: -20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },
  exit: { opacity: 0, scale: 0.85, y: 20, transition: { duration: 0.2 } },
};

const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  itemName = "item",
}) => {
  const [isConfirmHovered, setIsConfirmHovered] = useState(false);
  const [isCancelHovered, setIsCancelHovered] = useState(false);

  // Combine styles dynamically
  const confirmButtonStyle = {
    ...modalStyles.button,
    ...(isDeleting
      ? modalStyles.confirmButtonDisabled
      : {
          ...modalStyles.confirmButton,
          ...(isConfirmHovered && modalStyles.confirmButtonHover),
        }),
  };
  const cancelButtonStyle = {
    ...modalStyles.button,
    ...modalStyles.cancelButton,
    ...(isCancelHovered && modalStyles.cancelButtonHover),
  };

  if (!isOpen) return null;

  return (
    <motion.div
      style={modalStyles.overlay}
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
    >
      <motion.div
        style={modalStyles.content}
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={modalStyles.iconWrapper}>
          <FiAlertTriangle style={modalStyles.icon} />
        </div>
        <h3 style={modalStyles.title}>Confirm Deletion</h3>
        <p style={modalStyles.message}>
          Are you sure you want to delete this {itemName}? This action cannot be
          undone.
        </p>
        <div style={modalStyles.actions}>
          <motion.button
            style={cancelButtonStyle}
            onClick={onClose}
            disabled={isDeleting}
            onMouseEnter={() => setIsCancelHovered(true)}
            onMouseLeave={() => setIsCancelHovered(false)}
            whileHover={!isDeleting ? { scale: 1.05 } : {}}
            whileTap={!isDeleting ? { scale: 0.98 } : {}}
          >
            Cancel
          </motion.button>
          <motion.button
            style={confirmButtonStyle}
            onClick={onConfirm}
            disabled={isDeleting}
            onMouseEnter={() => setIsConfirmHovered(true)}
            onMouseLeave={() => setIsConfirmHovered(false)}
            whileHover={!isDeleting ? { scale: 1.05 } : {}}
            whileTap={!isDeleting ? { scale: 0.98 } : {}}
          >
            {isDeleting ? (
              <div style={modalStyles.buttonSpinner}></div>
            ) : (
              "Delete"
            )}
          </motion.button>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmDeleteModal;
