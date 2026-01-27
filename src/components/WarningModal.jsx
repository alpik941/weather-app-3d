import { useEffect } from 'react';
import { AlertTriangle, X, ChevronRight } from 'lucide-react';

/**
 * WarningModal - модальное окно для отображения предупреждений
 * С поддержкой трёх уровней серьезности: red, orange, yellow
 * 
 * @param {Object} props
 * @param {Object} props.warning - объект предупреждения { level, event, description, start, end, ... }
 * @param {function} props.onClose - callback при закрытии модали
 * @param {number} [props.queueLength=1] - количество предупреждений в очереди
 * @param {number} [props.autoCloseDelay] - автоматическое закрытие через N мс (опционально)
 */
const WarningModal = ({ warning, onClose, queueLength = 1, autoCloseDelay = null }) => {
  // Стили в зависимости от уровня серьезности
  const getSeverityStyles = (level) => {
    const styles = {
      red: {
        container: 'bg-red-50/95 border-l-4 border-red-500 shadow-lg shadow-red-500/20',
        icon: 'text-red-500',
        title: 'text-red-900',
        description: 'text-red-800',
        button: 'bg-red-500 hover:bg-red-600 text-white',
        closeButton: 'text-red-600 hover:bg-red-100',
        badge: 'bg-red-100 text-red-800',
      },
      orange: {
        container: 'bg-orange-50/95 border-l-4 border-orange-500 shadow-lg shadow-orange-500/20',
        icon: 'text-orange-500',
        title: 'text-orange-900',
        description: 'text-orange-800',
        button: 'bg-orange-500 hover:bg-orange-600 text-white',
        closeButton: 'text-orange-600 hover:bg-orange-100',
        badge: 'bg-orange-100 text-orange-800',
      },
      yellow: {
        container: 'bg-yellow-50/95 border-l-4 border-yellow-500 shadow-lg shadow-yellow-500/20',
        icon: 'text-yellow-600',
        title: 'text-yellow-900',
        description: 'text-yellow-800',
        button: 'bg-yellow-500 hover:bg-yellow-600 text-white',
        closeButton: 'text-yellow-600 hover:bg-yellow-100',
        badge: 'bg-yellow-100 text-yellow-800',
      },
    };
    return styles[level] || styles.yellow;
  };

  const styles = getSeverityStyles(warning.level);

  // Форматирование времени окончания предупреждения
  const getEndTimeDisplay = (endTimestamp) => {
    if (!endTimestamp) return 'No end time';

    const now = Math.floor(Date.now() / 1000);
    const diffSeconds = endTimestamp - now;
    const diffHours = Math.floor(diffSeconds / 3600);
    const diffDays = Math.floor(diffSeconds / 86400);

    if (diffHours < 0) return 'Expired';
    if (diffHours < 1) return `Until in ${Math.floor(diffSeconds / 60)} min`;
    if (diffHours < 12) return `Until tonight`;
    if (diffHours < 24) return `Until tomorrow`;
    if (diffDays <= 7) return `Until in ${diffDays} days`;

    // Форматирование даты
    const date = new Date(endTimestamp * 1000);
    return `Until ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  // Автоматическое закрытие (опционально)
  useEffect(() => {
    if (!autoCloseDelay) return;

    const timer = setTimeout(() => {
      onClose();
    }, autoCloseDelay);

    return () => clearTimeout(timer);
  }, [autoCloseDelay, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`relative w-full max-w-md mx-4 rounded-lg p-5 ${styles.container}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Кнопка закрытия в правом верхнем углу */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className={`absolute top-3 right-3 p-1.5 rounded-full transition-colors ${styles.closeButton}`}
          aria-label="Close warning"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Левая полоса цвета и иконка */}
        <div className="flex items-start gap-4">
          <AlertTriangle className={`w-6 h-6 flex-shrink-0 mt-1 ${styles.icon}`} />

          <div className="flex-1 min-w-0 pr-8">
            {/* Заголовок события */}
            <h3 className={`font-bold text-lg ${styles.title}`}>{warning.event}</h3>

            {/* Описание */}
            <p className={`text-sm mt-2 line-clamp-2 ${styles.description}`}>{warning.description}</p>

            {/* Время окончания */}
            {warning.end && (
              <p className={`text-xs mt-3 font-medium ${styles.description}`}>
                🕐 {getEndTimeDisplay(warning.end)}
              </p>
            )}

            {/* Источник и теги */}
            {(warning.sender_name || warning.tags) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {warning.sender_name && (
                  <span className={`text-xs px-2 py-1 rounded ${styles.badge}`}>{warning.sender_name}</span>
                )}
                {warning.tags && warning.tags.length > 0 && (
                  warning.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className={`text-xs px-2 py-1 rounded ${styles.badge}`}>
                      {tag}
                    </span>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Кнопка навигации в очереди (если есть ещё предупреждения) */}
        {queueLength > 1 && (
          <div className="mt-4 pt-4 border-t border-black/10 flex items-center justify-between">
            <span className={`text-xs font-medium ${styles.description}`}>
              {queueLength} alerts
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className={`flex items-center gap-1 px-3 py-2 rounded text-sm font-medium transition-colors ${styles.button}`}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarningModal;
