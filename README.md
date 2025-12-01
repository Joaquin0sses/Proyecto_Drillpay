# DrillPay

Sistema de gestión de facturación automatizado con predicción de riesgo y notificaciones por correo.

## Características

- **Gestión de Facturas**: Carga masiva desde Excel/CSV y creación manual.
- **Dashboard Avanzado**: Gráficos de estado de pago, Top 5 deudores, y filtros por fecha/cliente.
- **Notificaciones**: Envío de correos de recordatorio con plantillas personalizables.
- **Predicción de Riesgo**: Módulo de IA para evaluar el riesgo de impago (en desarrollo).
- **Multilenguaje**: Interfaz completamente en español.

## Requisitos Previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado y ejecutándose.

## Instalación y Ejecución

1.  **Clonar o descargar el proyecto**.
2.  **Iniciar los servicios**:
    Abre una terminal en la carpeta raíz del proyecto y ejecuta:
    ```bash
    docker-compose up -d --build
    ```
    Esto descargará las imágenes necesarias, construirá el backend y frontend, e iniciará la base de datos.

3.  **Acceder a la aplicación**:
    -   **Frontend**: [http://localhost:5173](http://localhost:5173)
    -   **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
    -   **PgAdmin** (Gestión DB): [http://localhost:5050](http://localhost:5050)

## Credenciales por Defecto

El sistema crea automáticamente usuarios de prueba al iniciar:

-   **Admin**:
    -   Usuario: `admin`
    -   Contraseña: `admin123`
-   **Usuario**:
    -   Usuario: `user`
    -   Contraseña: `user123`

## Generación de Datos de Prueba

Para probar el sistema con datos masivos, puedes generar un archivo Excel con facturas ficticias.

### Opción 1: Usando Docker (Recomendado)
Si no tienes Python instalado en tu máquina, usa el contenedor del backend:

```bash
docker-compose exec backend python /app/generate_data.py
```
Esto creará el archivo `facturas_v2.xlsx` dentro del contenedor. Para copiarlo a tu máquina:
```bash
docker cp $(docker-compose ps -q backend):/app/facturas_v2.xlsx .
```

### Opción 2: Ejecución Local
Si tienes Python instalado:
```bash
pip install pandas openpyxl
python generate_data.py
```

Luego, ve a la sección **Facturas** en la aplicación y sube el archivo `facturas_v2.xlsx`.

## Solución de Problemas

-   **Error al iniciar sesión**: Asegúrate de que el backend esté corriendo (`docker-compose ps`). Si cambiaste la estructura de la base de datos recientemente, reinicia borrando los volúmenes:
    ```bash
    docker-compose down -v
    docker-compose up -d
    ```
-   **Gráficos no cargan**: Asegúrate de haber instalado las dependencias del frontend si estás corriendo localmente (`npm install recharts`). En Docker esto es automático.
