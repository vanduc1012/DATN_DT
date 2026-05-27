import { MapPin, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

function CardBody({ id, name, address, fieldType, price, rating, reviewCount, onBookClick }) {
    // Field type labels
    const fieldTypeLabels = {
        5: '5 người',
        7: '7 người',
        11: '11 người',
    };

    return (
        <div className="p-4 space-y-3">
            {/* Field Name */}
            <h3 className="text-lg font-semibold text-gray-800 line-clamp-1 group-hover:text-[#16A34A] transition-colors">
                {name}
            </h3>

            {/* Address */}
            <div className="flex items-start gap-1.5 text-gray-500">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm line-clamp-1">{address}</span>
            </div>

            {/* Field Type */}
            <div className="flex items-center gap-1.5 text-gray-500">
                <Users className="w-4 h-4" />
                <span className="text-sm">Sân {fieldTypeLabels[fieldType] || fieldType}</span>
            </div>

            {/* Price & Rating Row */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                {/* Rating */}
                <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-700">{rating || 5}</span>
                    <span className="text-sm text-gray-400">({reviewCount || 0})</span>
                </div>
            </div>

            {/* Book Button */}
            <Link
                to={`/san/${id}`}
                onClick={onBookClick}
                className="block w-full py-2.5 bg-[#16A34A] hover:bg-[#15803d] text-white text-sm font-semibold 
                         text-center rounded-lg transition-all duration-200 
                         shadow-[0_2px_8px_rgba(22,163,74,0.25)] hover:shadow-[0_4px_12px_rgba(22,163,74,0.35)]
                         active:scale-[0.98]"
            >
                Đặt ngay
            </Link>
        </div>
    );
}

export default CardBody;
