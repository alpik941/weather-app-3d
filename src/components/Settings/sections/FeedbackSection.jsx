import React from 'react';
import { MessageSquare, Star, Send, Mail, X } from 'lucide-react';

export default function FeedbackSection({
  t,
  supportEmail,
  showFeedback,
  setShowFeedback,
  feedback,
  setFeedback,
  rating,
  setRating,
  onContactDevelopers,
  onRateApp,
  onSubmitFeedback
}) {
  return (
    <>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('support')}</h3>
        <div className="space-y-3">
          <button
            onClick={() => window.open(`mailto:${supportEmail}`,'_blank')}
            className="w-full flex items-center p-3 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <Mail className="w-5 h-5 mr-3" />
            <span>{t('supportEmail')}</span>
          </button>
          <button
            onClick={() => setShowFeedback(true)}
            className="w-full flex items-center p-3 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <MessageSquare className="w-5 h-5 mr-3" />
            {t('feedback')}
          </button>
          <button
            onClick={onContactDevelopers}
            className="w-full flex items-center p-3 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <Send className="w-5 h-5 mr-3" />
            {t('contactDevelopers')}
          </button>
          <button
            onClick={onRateApp}
            className="w-full flex items-center p-3 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <Star className="w-5 h-5 mr-3" />
            {t('rateApp')}
          </button>
        </div>
      </div>

      {showFeedback && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 z-10">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{t('feedback')}</h3>
              <button
                onClick={() => setShowFeedback(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('rateExperience')}
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('yourFeedback')}
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={t('feedbackPlaceholder')}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white resize-none"
                  rows={4}
                />
              </div>

              <button
                onClick={onSubmitFeedback}
                disabled={!feedback.trim() || rating === 0}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
              >
                {t('submitFeedback')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
