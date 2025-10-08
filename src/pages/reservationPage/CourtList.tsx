import React from 'react';
import CourtCard, { type Court } from '../../components/CourtCard'; // Usar type-only import

interface CourtListProps {
  courts: Court[];
  onReserveCourt?: (courtId: number) => void;
}

const CourtList: React.FC<CourtListProps> = ({ courts, onReserveCourt }) => {
  if (courts.length === 0) {
    return (
      <div className="no-courts-message">
        <div className="no-courts-icon">🏟️</div>
        <h3>No se encontraron canchas</h3>
        <p>Intenta ajustar los filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="court-list">
      {courts.map(court => (
        <CourtCard 
          key={court.id} 
          court={court} 
          onReserve={onReserveCourt}
        />
      ))}
    </div>
  );
};

export default CourtList;