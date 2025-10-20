// CourtCard.tsx
import React from 'react';

// Interfaces TypeScript - EXPORTADAS
export interface Business {
  id: number;
  owner: number;
  locality: number;
  businessName: string;
  address: string;
  averageRating: number;
  reservationDepositPercentage: number;
  active: boolean;
  activatedAt: string;
}

export interface Court {
  id: number;
  rating: number;
  size: string;
  groundType: string;
  roof: boolean;
  price: number;
  business: Business;
  imageUrl: string;
  driveFileId: string;
  createdAt: string;
  updatedAt: string;
  reservations: [];
}

interface CourtCardProps {
  court: Court;
  onReserve?: (courtId: number) => void;
}

const CourtCard: React.FC<CourtCardProps> = ({ court, onReserve }) => {
  // Función para renderizar estrellas de rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push('☆');
    }
    
    return stars.join('');
  };

  // Función para formatear el precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleReserveClick = () => {
    if (onReserve) {
      onReserve(court.id);
    } else {
      // Redirigir a la página de reserva con el ID de la cancha
      window.location.href = `http://localhost:5173/makeReservation/${court.id}`;
    }
  };

  return (
    <div className="court-card-item">
      <img 
        src={court.imageUrl} 
        alt={`Cancha ${court.business.businessName}`}
        className="court-card-image"
        onError={(e) => {
          e.currentTarget.src = 'https://via.placeholder.com/350x200/4a90e2/ffffff?text=Cancha+Deportiva';
        }}
      />
      
      <div className="court-card-content">
        <div className="court-card-header">
          <div>
            <h2 className="court-card-name">Cancha #{court.id}</h2>
            <p className="court-card-business">{court.business.businessName}</p>
          </div>
          <div className="court-card-rating">
            <span className="court-rating-value">{court.rating.toFixed(1)}</span>
            <span className="court-rating-stars">{renderStars(court.rating)}</span>
          </div>
        </div>
        
        <div className="court-card-details">
          <div className="court-detail-item">
            <span className="court-detail-icon">📏</span>
            <span>Tamaño: {court.size}</span>
          </div>
          <div className="court-detail-item">
            <span className="court-detail-icon">🌿</span>
            <span>{court.groundType}</span>
          </div>
          <div className="court-detail-item">
            <span className="court-detail-icon">🏠</span>
            <span>{court.roof ? 'Con techo' : 'Sin techo'}</span>
          </div>
          <div className="court-detail-item">
            <span className="court-detail-icon">📍</span>
            <span>{court.business.address}</span>
          </div>
        </div>
        
        <div className="court-card-price-section">
          <div>
            <span className="court-price-label">Precio por hora:</span>
            <div className="court-price-value">
              {formatPrice(court.price)}
            </div>
          </div>
          <button 
            className="court-reserve-btn"
            onClick={handleReserveClick}
          >
            Reservar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourtCard;