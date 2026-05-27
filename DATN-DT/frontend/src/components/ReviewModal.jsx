import { useState } from 'react';
import { Modal, Rate, message } from 'antd';
import { Star, Send, X } from 'lucide-react';
import { createReview } from '../config/ReviewRequest';

function ReviewModal({ open, onClose, bookingId, fieldId, fieldName, onSuccess }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (rating < 1) {
            message.warning('Vui lòng chọn số sao');
            return;
        }

        setLoading(true);
        try {
            await createReview({
                fieldId,
                bookingId,
                rating,
                comment,
            });
            message.success('Đánh giá thành công! Cảm ơn bạn.');
            onSuccess?.();
            onClose();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const ratingLabels = {
        1: 'Rất tệ',
        2: 'Tệ',
        3: 'Bình thường',
        4: 'Tốt',
        5: 'Tuyệt vời',
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={500}
            centered
            title={null}
            closeIcon={<X className="w-5 h-5" />}
        >
            <div className="py-4">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-[#16A34A]" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Đánh giá sân</h2>
                    <p className="text-gray-500 mt-1">{fieldName}</p>
                </div>

                {/* Rating Stars */}
                <div className="text-center mb-6">
                    <Rate value={rating} onChange={setRating} style={{ fontSize: 36 }} className="mb-2" />
                    <p className="text-lg font-medium text-[#16A34A]">{ratingLabels[rating]}</p>
                </div>

                {/* Comment */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nhận xét của bạn (không bắt buộc)
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Chia sẻ trải nghiệm của bạn về sân bóng này..."
                        rows={4}
                        maxLength={1000}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none
                                 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]"
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">{comment.length}/1000</p>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-3.5 bg-[#16A34A] text-white font-semibold text-base rounded-xl
                             hover:bg-[#15803d] disabled:bg-gray-300 disabled:cursor-not-allowed
                             transition-all flex items-center justify-center gap-2
                             shadow-[0_4px_14px_rgba(22,163,74,0.3)]"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            Gửi đánh giá
                        </>
                    )}
                </button>
            </div>
        </Modal>
    );
}

export default ReviewModal;
