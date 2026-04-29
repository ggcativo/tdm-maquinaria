# IDC Maquinaria Bolivia — Catálogo Web

Sitio de catálogo de maquinaria para carpintería industrial.
**Backend:** FastAPI (Python) · **Frontend:** HTML/CSS/JS puro con Jinja2

---

## Estructura del proyecto

```
idc_maquinaria/
├── main.py              ← App FastAPI + rutas
├── data.py              ← Datos de las 16 máquinas
├── requirements.txt
├── templates/
│   └── index.html       ← Template Jinja2 (página principal)
└── static/
    ├── css/style.css
    └── js/app.js        ← Lógica del catálogo (consume /api/machines)
```

---

## Instalación y ejecución local

```bash
# 1. Clonar / descomprimir el proyecto
cd idc_maquinaria

# 2. Crear entorno virtual (recomendado)
python -m venv venv
source venv/bin/activate      # Linux/Mac
venv\Scripts\activate         # Windows

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Ejecutar
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Abrir en el navegador: **http://localhost:8000**

Documentación automática de la API: **http://localhost:8000/docs**

---

## API Endpoints

| Método | Ruta                        | Descripción                              |
|--------|-----------------------------|------------------------------------------|
| GET    | `/`                         | Página principal del catálogo            |
| GET    | `/api/machines`             | Lista de máquinas (con filtros opcionales)|
| GET    | `/api/machines/{id}`        | Detalle de una máquina                   |
| GET    | `/api/categories`           | Lista de categorías                      |
| GET    | `/api/whatsapp/{id}`        | Genera link de WhatsApp para la máquina  |

### Parámetros de `/api/machines`
- `?category=sierra` — filtra por categoría (sierra, prensa, acabado, medicion, cnc)
- `?q=cepillo` — búsqueda por nombre

---

## Personalización

### Cambiar número de WhatsApp
En `main.py` y `static/js/app.js` buscar `59170000000` y reemplazar.

### Agregar precios / estado / origen
En `data.py`, cada máquina tiene los campos `precio_usd`, `estado` y `origen`.
Rellene los valores y el frontend los mostrará automáticamente.

### Agregar fotos reales
En `data.py`, agregue el campo `"image_url": "https://..."` a cada máquina
y en `templates/index.html` use `<img src="{{ m.image_url }}">` dentro del card.

---

## Deploy (producción)

### Render / Railway / Fly.io
```bash
# Procfile (para Render)
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Docker
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```
