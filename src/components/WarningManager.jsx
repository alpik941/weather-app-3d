import { useEffect, useRef } from 'react';
import { useWarningModal } from '../hooks/useWarningModal';
import { validateWarning, sortWarningsBySeverity, filterWarningsBySeverity } from '../services/weatherService';
import WarningModal from './WarningModal';

/**
 * WarningManager - компонента управления предупреждениями с очередью
 * Автоматически показывает предупреждения, отсортированные по серьезности
 * 
 * @param {Object} props
 * @param {Array} props.warnings - массив предупреждений
 * @param {string} props.location - название локации
 * @param {Array} [props.severityFilter] - фильтр по уровням ('yellow', 'orange', 'red')
 * @param {boolean} [props.autoShow=true] - автоматически показывать при появлении
 * @param {function} [props.onWarningChange] - callback при смене текущего предупреждения
 */
const WarningManager = ({
  warnings = [],
  location = '',
  severityFilter = ['red', 'orange', 'yellow'],
  autoShow = true,
  onWarningChange = null,
}) => {
  const {
    isOpen,
    currentWarning,
    warningQueue,
    openWarning,
    closeWarning,
    clearQueue,
    addWarnings,
    getQueueLength,
  } = useWarningModal();

  const previousWarningsRef = useRef([]);
  const initializationRef = useRef(false);

  /**
   * Effect: Загрузить и показать новые предупреждения
   */
  useEffect(() => {
    if (!autoShow || !Array.isArray(warnings)) return;

    // Валидация и фильтрация предупреждений
    const validWarnings = warnings
      .filter((warning) => {
        const validation = validateWarning(warning);
        if (!validation.isValid) {
          console.warn('[WarningManager] Invalid warning:', validation.errors, warning);
          return false;
        }
        return true;
      })
      .filter((warning) => severityFilter.includes(warning.level));

    // Сортировка по серьезности (красные первыми)
    const sortedWarnings = sortWarningsBySeverity(validWarnings);

    // Определяем новые предупреждения
    const newWarnings = sortedWarnings.filter(
      (warning) =>
        !previousWarningsRef.current.some(
          (prev) => prev.event === warning.event && prev.description === warning.description
        )
    );

    // При первой загрузке показываем все, потом - только новые
    if (!initializationRef.current) {
      if (sortedWarnings.length > 0) {
        addWarnings(sortedWarnings);
        initializationRef.current = true;
      }
    } else if (newWarnings.length > 0) {
      addWarnings(newWarnings);
    }

    previousWarningsRef.current = sortedWarnings;
  }, [warnings, severityFilter, autoShow, addWarnings]);

  /**
   * Effect: Уведомить о смене текущего предупреждения
   */
  useEffect(() => {
    if (onWarningChange) {
      onWarningChange({
        warning: currentWarning,
        isOpen,
        queueLength: getQueueLength(),
      });
    }
  }, [currentWarning, isOpen, getQueueLength, onWarningChange]);

  /**
   * Effect: Очистить очередь при смене локации
   */
  useEffect(() => {
    return () => {
      // Очистим очередь при размонтировании или смене локации
      if (previousWarningsRef.current.length > 0) {
        clearQueue();
        previousWarningsRef.current = [];
        initializationRef.current = false;
      }
    };
  }, [location, clearQueue]);

  // Не рендерим ничего, модаль будет управляться через контекст илиProps
  // Основная логика находится в useWarningModal hook
  return (
    <>
      {isOpen && currentWarning && (
        <WarningModal warning={currentWarning} onClose={closeWarning} queueLength={getQueueLength()} />
      )}
    </>
  );
};

export default WarningManager;
