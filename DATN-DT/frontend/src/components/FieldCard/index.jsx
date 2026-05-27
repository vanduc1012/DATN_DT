import CardImage from './CardImage';
import CardBody from './CardBody';

function FieldCard({
    id,
    name,
    image,
    address,
    fieldType,
    price,
    rating,
    reviewCount,
    badge,
    badgeColor,
    isFavorite,
    onFavoriteClick,
    onBookClick,
}) {
    return (
        <div
            className="group bg-white rounded-xl border border-gray-200 overflow-hidden
                      shadow-[0_2px_8px_rgba(0,0,0,0.04)] 
                      hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] 
                      hover:-translate-y-1
                      transition-all duration-300 ease-out"
        >
            <CardImage
                image={image}
                badge={badge}
                badgeColor={badgeColor}
                isFavorite={isFavorite}
                onFavoriteClick={onFavoriteClick}
            />
            <CardBody
                id={id}
                name={name}
                address={address}
                fieldType={fieldType}
                price={price}
                rating={rating}
                reviewCount={reviewCount}
                onBookClick={onBookClick}
            />
        </div>
    );
}

// Export subcomponents for flexibility
FieldCard.Image = CardImage;
FieldCard.Body = CardBody;

export default FieldCard;
