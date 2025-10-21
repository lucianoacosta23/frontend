import React from 'react';
import CourtCard, { type Court } from '../../components/CourtCard'; // Usar type-only import

interface CourtListProps {
  courts: Court[];
}

const CourtList: React.FC<CourtListProps> = ({ courts }) => {
  return (
    <div className="courts-grid">
      {courts.map((court) => (
        // solo pasar la court; CourtCard hará la navegación SPA
        <CourtCard key={court.id} court={court} />
      ))}
    </div>
  );
};

export default CourtList;