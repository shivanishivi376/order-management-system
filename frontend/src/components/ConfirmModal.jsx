import React from 'react';
import styles from './ConfirmModal.module.css';

// A reusable confirmation modal.
// Props:
//   isOpen   — boolean, controls visibility
//   title    — heading text
//   message  — body text
//   onConfirm — called when the user clicks the confirm button
//   onCancel  — called when the user clicks Cancel or the backdrop

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    // Clicking the dark backdrop also cancels
    <div className={styles.backdrop} onClick={onCancel}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        tabIndex="-1"
      >
        {/* Icon */}
        <div className={styles.iconWrapper}>
          <span className={styles.icon}>🗑️</span>
        </div>

        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={onCancel}>
            Cancel
          </button>
          <button className={styles.btnDelete} onClick={onConfirm}>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
