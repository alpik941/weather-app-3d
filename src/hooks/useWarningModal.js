import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook для управления модальными окнами с очередью предупреждений
 * @returns {Object} { isOpen, currentWarning, warningQueue, openWarning, closeWarning, clearQueue }
 */
export const useWarningModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentWarning, setCurrentWarning] = useState(null);
  const [warningQueue, setWarningQueue] = useState([]);

  /**
   * Открыть предупреждение с поддержкой очереди
   * @param {Object} warning - объект предупреждения { level, title, description, event, ... }
   */
  const openWarning = useCallback((warning) => {
    if (!warning) return;

    setWarningQueue((prev) => {
      // Избегаем дублей в очереди
      const isDuplicate = prev.some(
        (w) => w.event === warning.event && w.description === warning.description
      );
      if (isDuplicate) return prev;
      return [...prev, warning];
    });

    // Если модаль закрыта - открываем с первым предупреждением
    if (!isOpen) {
      setCurrentWarning(warning);
      setIsOpen(true);
    }
  }, [isOpen]);

  /**
   * Закрыть текущее предупреждение и показать следующее из очереди
   */
  const closeWarning = useCallback(() => {
    setWarningQueue((prev) => {
      const remaining = prev.slice(1);

      if (remaining.length > 0) {
        // Показать следующее в очереди
        setCurrentWarning(remaining[0]);
      } else {
        // Очередь пуста - закрыть модаль
        setIsOpen(false);
        setCurrentWarning(null);
      }

      return remaining;
    });
  }, []);

  /**
   * Очистить всю очередь и закрыть модаль
   */
  const clearQueue = useCallback(() => {
    setWarningQueue([]);
    setIsOpen(false);
    setCurrentWarning(null);
  }, []);

  /**
   * Добавить несколько предупреждений сразу
   * @param {Array} warnings - массив объектов предупреждений
   */
  const addWarnings = useCallback(
    (warnings) => {
      if (!Array.isArray(warnings)) return;

      warnings.forEach((warning) => {
        openWarning(warning);
      });
    },
    [openWarning]
  );

  /**
   * Получить количество предупреждений в очереди (включая текущее)
   */
  const getQueueLength = useCallback(() => {
    return (isOpen && currentWarning ? 1 : 0) + warningQueue.length;
  }, [isOpen, currentWarning, warningQueue]);

  return {
    isOpen,
    currentWarning,
    warningQueue,
    openWarning,
    closeWarning,
    clearQueue,
    addWarnings,
    getQueueLength,
  };
};
