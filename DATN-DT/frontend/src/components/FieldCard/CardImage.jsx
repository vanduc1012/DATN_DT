import { useState } from 'react';
import { Heart } from 'lucide-react';

function CardImage({ image, badge, badgeColor = 'red', isFavorite = false, onFavoriteClick }) {
    const [liked, setLiked] = useState(isFavorite);

    const handleFavorite = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setLiked(!liked);
        onFavoriteClick?.(!liked);
    };

    // Badge color variants
    const badgeColors = {
        red: 'bg-red-500',
        green: 'bg-[#16A34A]',
        orange: 'bg-orange-500',
        blue: 'bg-blue-500',
    };

    return (
        <div className="relative overflow-hidden rounded-t-xl">
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={image[0]}
                    alt="Sân bóng"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Badge */}
            {badge && (
                <div
                    className={`absolute top-3 left-3 px-2.5 py-1 ${badgeColors[badgeColor]} text-white text-xs font-semibold rounded-md shadow-sm`}
                >
                    {badge}
                </div>
            )}

            {/* Favorite Button */}
            <button
                onClick={handleFavorite}
                className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center
                          transition-all duration-200 
                          ${
                              liked
                                  ? 'bg-red-500 text-white'
                                  : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:text-red-500'
                          }`}
            >
                <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            </button>
        </div>
    );
}

export default CardImage;
