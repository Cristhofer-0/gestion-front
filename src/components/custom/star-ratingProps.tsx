interface StarRatingProps {
  rating: number // número del 1 al 5
}

export const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
  return (
    <div className="flex space-x-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index}>
          {index < rating ? "★" : "☆"}
        </span>
      ))}
    </div>
  )
}
