# Desarrollo de Software - frontend

Repositorio donde se encuentra todo el contenido de front-end del TP para desarrollo de software

## Requisitos Previos
- Node.js (v14 o superior)
- MySQL (v5.7 o superior)

## Instalación
1. **Clonar el repositorio**
```bash
git clone https://github.com/ConstanFinelli/back-dsw.git
cd back-dsw
```

2. **Instalar dependencias**
```bash
npm install
```
3. **Compilar TypeScript**
```bash
npm run build
```

4. **Iniciar el servidor**
```bash
npm run start:dev
```

El servidor se iniciará en `http://localhost:5173`, ingresar desde un navegador web para visualizar la página.

Para las funcionalidades de negocio de la página deberá clonar el repositorio [back-dsw](https://github.com/ConstanFinelli/back-dsw) y seguir las instrucciones de instalación y uso.

## Funciones principales de la página
- Registro y logueo de usuarios.
- Registro de nuevos negocios a partir de solicitudes.
- Registro de nuevas canchas.
- Reserva de canchas.
- Administrar negocio propio.
- Visualizar reservas realizadas.
- Dashboard para usuarios administradores para crear, editar o eliminar: `Canchas`, `Negocios`,`Usuarios`, `Cupones` y `Localidades`. Ademas, el administrador puede ver solicitudes de creación de negocios y habilitarlos y asignar cupones a usuarios.

## Tecnologías Utilizadas
- **TypeScript**: Lenguaje de programación
- **JWT**: Autenticación
- **React**: Librería de JS
- **Vite**: Herramienta de desarrollo y servidor web

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

ISC

## 👥 Autores

- lucianoacosta23
- [Otros colaboradores]

## 🆘 Soporte

Si tienes problemas o preguntas:
1. Abre un issue en GitHub
2. Contacta al equipo de desarrollo
