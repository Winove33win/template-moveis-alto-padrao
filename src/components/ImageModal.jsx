import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const modalVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export default function ImageModal({
  isOpen,
  media = [],
  initialIndex = 0,
  onClose,
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const closeButtonRef = useRef(null);

  const hasMultipleMedia = media.length > 1;
  const safeIndex = Math.min(Math.max(initialIndex, 0), Math.max(media.length - 1, 0));

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(safeIndex);
    }
  }, [isOpen, safeIndex]);

  const handleNext = useCallback(() => {
    if (!hasMultipleMedia) {
      return;
    }
    setCurrentIndex((prev) => (prev + 1) % media.length);
  }, [hasMultipleMedia, media.length]);

  const handlePrevious = useCallback(() => {
    if (!hasMultipleMedia) {
      return;
    }
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  }, [hasMultipleMedia, media.length]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
      if (event.key === "ArrowRight" && hasMultipleMedia) {
        event.preventDefault();
        handleNext();
      }
      if (event.key === "ArrowLeft" && hasMultipleMedia) {
        event.preventDefault();
        handlePrevious();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hasMultipleMedia, handleNext, handlePrevious, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      const frame = window.requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });
      return () => window.cancelAnimationFrame(frame);
    }

    const timeout = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    return () => clearTimeout(timeout);
  }, [isOpen, currentIndex]);

  const currentMedia = media[currentIndex] ?? media[0];

  if (!media.length || !currentMedia) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-backdrop"
          onClick={onClose}
        >
          <motion.div
            className="modal-card image-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Visualização ampliada da imagem do produto"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="modal-header image-modal__header">
              <span className="modal-kicker">
                {currentIndex + 1} de {media.length}
              </span>
              <button
                type="button"
                aria-label="Fechar visualização"
                onClick={onClose}
                className="modal-close"
                ref={closeButtonRef}
              >
                <X size={20} />
              </button>
            </header>
            <div className="image-modal__content">
              {hasMultipleMedia && (
                <button
                  type="button"
                  className="image-modal__nav image-modal__nav--prev"
                  onClick={handlePrevious}
                  aria-label="Ver imagem anterior"
                >
                  <ChevronLeft size={24} />
                </button>
              )}
              <figure>
                <img src={currentMedia.src} alt={currentMedia.alt ?? ""} />
                {currentMedia.caption ? <figcaption>{currentMedia.caption}</figcaption> : null}
              </figure>
              {hasMultipleMedia && (
                <button
                  type="button"
                  className="image-modal__nav image-modal__nav--next"
                  onClick={handleNext}
                  aria-label="Ver próxima imagem"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
