
import React, { useState } from 'react';
import { Order } from '../types';
import { CloseIcon, StarIcon } from './Icons';

interface RatingModalProps {
  order: Order;
  onClose: () => void;
  onSubmit: (rating: number, feedback: string) => void;
}

const RatingModal: React.FC<RatingModalProps> = ({ order, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    onSubmit(rating, feedback);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold">Rate Order #{order.id.slice(-4)}</h3>
          <button onClick={onClose}><CloseIcon className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <StarIcon className={`w-8 h-8 transition-colors ${(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
              </button>
            ))}
          </div>
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Leave feedback (optional)..."
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            rows={3}
          />
        </div>
        <div className="p-4 border-t dark:border-gray-700 text-right">
          <button
            onClick={handleSubmit}
            disabled={rating === 0}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg disabled:bg-gray-400"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
