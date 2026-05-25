import { useState } from 'react';
import { reviewAPI } from '../api/services';
import toast from 'react-hot-toast';

export default function ReviewForm({ pitchId, pitchName, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Vui lòng nhập nhận xét');
      return;
    }

    setSubmitting(true);
    try {
      await reviewAPI.create(pitchId, { rating, comment: comment.trim() });
      toast.success('✅ Cảm ơn bạn đã đánh giá sân!');
      setComment('');
      setRating(5);
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg?.includes('hoàn thành')) {
        toast.error('Bạn chỉ có thể đánh giá sau khi hoàn thành đặt sân');
      } else if (msg?.includes('đã đánh giá')) {
        toast.error('Bạn đã đánh giá sân này rồi');
      } else {
        toast.error(msg || 'Lỗi gửi đánh giá');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h4 style={{ marginBottom: 16, fontWeight: 700 }}>Đánh giá sân "{pitchName}"</h4>
        <form onSubmit={handleSubmit}>
          {/* Rating */}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Điểm đánh giá</label>
            <div className="stars-selector" style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{
                    fontSize: '2rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: star <= rating ? 'var(--accent)' : '#cbd5e1',
                    transition: 'color 0.2s',
                  }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Nhận xét của bạn</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Chia sẻ cảm nhận về sân bóng (tối đa 1000 ký tự)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              required
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              {comment.length}/1000
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ width: '100%' }}
          >
            {submitting ? '⏳ Đang gửi...' : '✏️ Gửi đánh giá'}
          </button>
        </form>
      </div>
    </div>
  );
}
