import { useState } from 'react';
import type {Pitch} from '../../../types/pitchType.ts'
import { useNavigate, useOutletContext } from 'react-router';

export default function PitchAdd(){
    const [data, setData] = useState<PitchResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    
    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
    const navigate = useNavigate();

    // Opciones válidas para el tamaño
    const sizeOptions = [
        { value: 'pequeño', label: 'Pequeño' },
        { value: 'mediano', label: 'Mediano' },
        { value: 'grande', label: 'Grande' }
    ];

    // Opciones válidas para el tipo de suelo (basado en valores comunes)
    const groundTypeOptions = [
        { value: 'césped natural', label: 'Césped Natural' },
        { value: 'césped sintético', label: 'Césped Sintético' },
        { value: 'arena', label: 'Arena' },
        { value: 'cemento', label: 'Cemento' },
        { value: 'parquet', label: 'Parquet' },
        { value: 'tierra', label: 'Tierra' },
        { value: 'asfalto', label: 'Asfalto' },
        { value: 'caucho', label: 'Caucho' }
    ];

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                showNotification('Por favor, selecciona un archivo de imagen válido', 'error');
                return;
            }
            
            // Validar tamaño (ejemplo: máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showNotification('La imagen no debe superar los 5MB', 'error');
                return;
            }

            setImageFile(file);
            
            // Crear preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const add = async (pitchData: FormData) => {
        try {
            setLoading(true);
            const token = JSON.parse(localStorage.getItem('user') || '{}').token;

            const response = await fetch('http://localhost:3000/api/pitchs/add', {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`
                }, 
                body: pitchData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "HTTP Error! status: " + response.status);
            }

            const json: PitchResponse = await response.json();
            setData(json);
            showNotification('Cancha creada con éxito', 'success');
            navigate('/admin/pitchs/getAll');
        } catch (error) {
            showNotification('Error: ' + error, 'error');
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        // Validar que se haya seleccionado un tamaño válido
        const selectedSize = formData.get("size") as string;
        if (!sizeOptions.some(option => option.value === selectedSize)) {
            showNotification('Por favor, selecciona un tamaño válido', 'error');
            return;
        }

        // Validar que se haya seleccionado un tipo de suelo válido
        const selectedGroundType = formData.get("groundType") as string;
        if (!groundTypeOptions.some(option => option.value === selectedGroundType)) {
            showNotification('Por favor, selecciona un tipo de suelo válido', 'error');
            return;
        }

        // Crear FormData con los nombres de campo correctos
        const pitchData = new FormData();
        
        // Agregar todos los campos - el backend espera 'business' para la relación
        pitchData.append('business', formData.get("business") as string);
        pitchData.append('rating', formData.get("rating") as string);
        pitchData.append('price', formData.get("price") as string);
        pitchData.append('size', selectedSize);
        pitchData.append('groundType', selectedGroundType);
        pitchData.append('roof', formData.get("roof") ? 'true' : 'false');
        
        // Agregar la imagen si existe
        if (imageFile) {
            pitchData.append('image', imageFile);
        }

        add(pitchData);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        // Limpiar el input file
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    return (
        <div className='crud-form-container'>
            <h2 className='crud-form-title'>Crear cancha</h2>
            <form onSubmit={handleSubmit} className='crud-form' encType="multipart/form-data">
                <div className='crud-form-item'>
                    <label>ID de negocio asociado</label>
                    <input name="business" type="number" required />
                </div>
                <div className='crud-form-item'>
                    <label>Rating</label>
                    <input name="rating" type="number" min="1" max="5" required />
                </div>
                <div className='crud-form-item'>
                    <label>Precio</label>
                    <input name="price" type="number" step="0.01" required />
                </div>
                <div className='crud-form-item'>
                    <label>Tamaño</label>
                    <select name="size" required>
                        <option value="">Selecciona un tamaño</option>
                        {sizeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className='crud-form-item'>
                    <label>Tipo de suelo</label>
                    <select name="groundType" required>
                        <option value="">Selecciona un tipo de suelo</option>
                        {groundTypeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className='crud-form-item'>
                    <label className='checkbox-label'>
                        <input type="checkbox" name="roof" />
                        <span>Techo</span>
                    </label>
                </div>
                
                {/* Campo para subir imagen */}
                <div className='crud-form-item'>
                    <label>Imagen de la cancha</label>
                    <input 
                        type="file" 
                        name="image"
                        accept="image/*" 
                        onChange={handleImageChange}
                    />
                    <small>Formatos aceptados: JPG, PNG, WEBP. Máximo 5MB</small>
                    
                    {imagePreview && (
                        <div className='image-preview-container'>
                            <p>Vista previa:</p>
                            <div className='image-preview'>
                                <img src={imagePreview} alt="Vista previa de la cancha" />
                                <button 
                                    type="button" 
                                    onClick={removeImage}
                                    className='remove-image-btn'
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className='crud-form-actions'>
                    <button type="submit" className='primary' disabled={loading}>
                        {loading ? 'Creando...' : 'Crear'}
                    </button>
                </div>
            </form>
            
            <pre>
                {loading && <p>Cargando...</p>}
                {data && (
                    <table className='crudTable'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Business</th>
                                <th>Rating</th>
                                <th>Price</th>
                                <th>Size</th>
                                <th>Ground type</th>
                                <th>Roof</th>
                                <th>Imagen</th>
                                <th>Creado</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{data.data.id}</td>
                                <td>{data.data.business?.id || data.data.business}</td>
                                <td>{('⭐️').repeat(data.data.rating)}</td>
                                <td>${data.data.price}</td>
                                <td>{data.data.size}</td>
                                <td>{data.data.groundType}</td>
                                <td>{data.data.roof ? 'Techado' : 'Sin techo'}</td>
                                <td>
                                    {data.data.imageUrl ? (
                                        <img
                                            src={data.data.imageUrl}
                                            alt="Cancha"
                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                        />
                                    ) : 'Sin imagen'}
                                </td>
                                <td>{new Date(data.data.createdAt).toLocaleDateString()}</td>
                            </tr>
                        </tbody>
                    </table>
                )}
            </pre>
        </div>
    );
}

type PitchResponse = {
    data: Pitch;
}