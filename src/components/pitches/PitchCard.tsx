import React from 'react';
import type { ReservePitch } from '../../types/reservePitchTypes';
import '../../static/css/components/PitchCard.css';

interface PitchCardProps {
  pitch: ReservePitch;
  onReserve: (pitchId: number) => void;
}

const PitchCard: React.FC<PitchCardProps> = ({ pitch, onReserve }) => {
  // Render star rating
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    if (hasHalfStar) {
      stars.push('⯨');
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push('☆');
    }

    return stars.join('');
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleReserveClick = () => {
    onReserve(pitch.id);
  };

  // Safe access to business name
  const businessName = pitch.business?.name || (pitch as any).businessName || 'Cancha';

  return (
    <div className="pitch-card">
      <div className="pitch-card-image-container">
        <img
          src={pitch.imageUrl || 'https://via.placeholder.com/400x250/4a90e2/ffffff?text=Cancha'}
          alt={`Cancha ${businessName}`}
          className="pitch-card-image"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/400x250/4a90e2/ffffff?text=Cancha';
          }}
        />
        <div className="pitch-card-badge">
          <span className="pitch-card-rating">
            ⭐ {pitch.rating.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="pitch-card-content">
        <div className="pitch-card-header">
          <h3 className="pitch-card-business-name">{businessName}</h3>
          <p className="pitch-card-stars">{renderStars(pitch.rating)}</p>
        </div>

        <div className="pitch-card-details">
          <div className="pitch-detail-row">
            <span className="pitch-detail-icon">📏</span>
            <span className="pitch-detail-text">Tamaño: {pitch.size}</span>
          </div>
          <div className="pitch-detail-row">
            <span className="pitch-detail-icon">🌿</span>
            <span className="pitch-detail-text">
              {pitch.groundType.charAt(0).toUpperCase() + pitch.groundType.slice(1)}
            </span>
          </div>
          <div className="pitch-detail-row">
            <span className="pitch-detail-icon">🏠</span>
            <span className="pitch-detail-text">
              {pitch.roof ? 'Con techo' : 'Sin techo'}
            </span>
          </div>
        </div>

        <div className="pitch-card-footer">
          <div className="pitch-card-price">
            <span className="pitch-price-label">Precio/hora:</span>
            <span className="pitch-price-value">{formatPrice(pitch.price)}</span>
          </div>
          <button onClick={handleReserveClick} className="pitch-reserve-btn">
            Reservar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PitchCard;
