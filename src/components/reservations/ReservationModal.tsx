import React, { useState } from 'react';
import type { ReservePitch, ReservationFormData } from '../../types/reservePitchTypes';
import '../../static/css/components/ReservationModal.css';

interface ReservationModalProps {
  pitch: ReservePitch | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: ReservationFormData) => void;
}

const ReservationModal: React.FC<ReservationModalProps> = ({
  pitch,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  if (!isOpen || !pitch) return null;

  // Get today's date in YYYY-MM-DD format for min date validation
  const today = new Date().toISOString().split('T')[0];

  // Generate time slots (e.g., 08:00 to 23:00)
  const timeSlots = [];
  for (let hour = 8; hour <= 23; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime) {
      alert('Por favor selecciona fecha y hora');
      return;
    }

    const reservationData: ReservationFormData = {
      pitchId: pitch.id,
      date: selectedDate,
      time: selectedTime,
    };

    onConfirm(reservationData);
    
    // Reset form
    setSelectedDate('');
    setSelectedTime('');
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="reservation-modal-overlay" onClick={handleOverlayClick}>
      <div className="reservation-modal">
        <div className="reservation-modal-header">
          <h2 className="reservation-modal-title">Reservar Cancha</h2>
          <button onClick={onClose} className="reservation-modal-close">
            ✕
          </button>
        </div>

        <div className="reservation-modal-body">
          {/* Pitch Info Summary */}
          <div className="reservation-pitch-summary">
            <img
              src={pitch.imageUrl || 'https://via.placeholder.com/200x120/4a90e2/ffffff?text=Cancha'}
              alt={pitch.business.name}
              className="reservation-pitch-image"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/200x120/4a90e2/ffffff?text=Cancha';
              }}
            />
            <div className="reservation-pitch-info">
              <h3 className="reservation-pitch-name">{pitch.business.name}</h3>
              <p className="reservation-pitch-details">
                📏 {pitch.size} • 🌿 {pitch.groundType} • {pitch.roof ? '🏠 Con techo' : '☀️ Sin techo'}
              </p>
              <p className="reservation-pitch-price">
                <strong>{formatPrice(pitch.price)}</strong> / hora
              </p>
            </div>
          </div>

          {/* Reservation Form */}
          <form onSubmit={handleSubmit} className="reservation-form">
            <div className="reservation-form-group">
              <label htmlFor="date" className="reservation-form-label">
                📅 Fecha:
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={today}
                required
                className="reservation-form-input"
              />
            </div>

            <div className="reservation-form-group">
              <label htmlFor="time" className="reservation-form-label">
                🕐 Hora:
              </label>
              <select
                id="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                required
                className="reservation-form-select"
              >
                <option value="">Selecciona una hora</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <div className="reservation-modal-actions">
              <button type="button" onClick={onClose} className="reservation-btn-cancel">
                Cancelar
              </button>
              <button type="submit" className="reservation-btn-confirm">
                Confirmar Reserva
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;
