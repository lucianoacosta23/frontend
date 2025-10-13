import { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../../../static/css/users/userCreate.css';
import Toast from '../../../components/Toast'; // Ajusta la ruta según tu estructura

const LocalityCreate = () => {
  const navigate = useNavigate();
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para el Toast
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  // Estados para el formulario - con valores iniciales vacíos
  const [formData, setFormData] = useState({
    name: '',
    postal_code: '',
    province: ''
  });

  // Función para mostrar toast
  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setToast({
      isVisible: true,
      message,
      type
    });
  };

  // Función para ocultar toast
  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);

      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      // Validaciones básicas
      if (!formData.name.trim()) {
        throw new Error('El nombre de la localidad es obligatorio');
      }
      
      if (!formData.postal_code.trim()) {
        throw new Error('El código postal es obligatorio');
      }

      const postalCode = parseInt(formData.postal_code);
      if (isNaN(postalCode) || postalCode <= 0) {
        throw new Error('El código postal debe ser un número válido');
      }
      
      if (!formData.province.trim()) {
        throw new Error('La provincia es obligatoria');
      }

      // Preparar datos para enviar
      const createData = {
        name: formData.name.trim(),
        postal_code: postalCode,
        province: formData.province.trim()
      };

      const response = await fetch('http://localhost:3000/api/localities/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(createData)
      });

      if (!response.ok) {
        const responseText = await response.text();
        let errorMessage = `Error: ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // Mostrar toast de éxito
      showToast('Localidad creada con éxito', 'success');
      
      // Navegar después de un breve delay para que se vea el toast
      setTimeout(() => {
        navigate('/admin/localities/getAll');
      }, 1500);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear localidad';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/localities/getAll');
  };

  return (
    <div className="update-container">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
        duration={4000}
      />

      <h2 className="update-title">Crear Nueva Localidad</h2>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="update-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Nombre de la Localidad</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Ingrese el nombre de la localidad"
            />
          </div>

          <div className="form-group">
            <label htmlFor="postal_code">Código Postal</label>
            <input
              type="number"
              id="postal_code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Ej: 1642"
              min="1"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="province">Provincia</label>
            <input
              type="text"
              id="province"
              name="province"
              value={formData.province}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Ingrese la provincia"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="cancel-button"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="save-button"
            disabled={saving || !formData.name.trim() || !formData.postal_code.trim() || !formData.province.trim()}
          >
            {saving ? 'Creando...' : 'Crear Localidad'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LocalityCreate;