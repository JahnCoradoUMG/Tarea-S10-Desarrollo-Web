# Reztro Café — Gestión de Pedidos

Sistema académico (UMG — Desarrollo Web, Semana 10) con:

- **Backend:** NestJS — módulo `pedidos`, persistencia en memoria, ValidationPipe, CORS y Swagger.
- **Frontend:** React (Vite + TypeScript) — panel de pedidos inspirado en Reztro Orders.

Documentación:

- [`Documentacion/system-brief.md`](./Documentacion/system-brief.md) — propósito y arquitectura
- [`Documentacion/SRS.md`](./Documentacion/SRS.md) — requisitos y contrato HTTP
- [`Documentacion/estado-implementacion.md`](./Documentacion/estado-implementacion.md) — estado real pasos 2–6

---

## Requisitos

- Node.js LTS (recomendado 20+)
- npm 10+

---

## Ejecución

### 1. Backend (puerto `3000`)

```bash
cd backend
npm install
npm run start:dev
```

Variables de entorno (archivo `backend/.env` o exportadas en la shell):

| Variable | Valor por defecto | Descripción |
| --- | --- | --- |
| `PORT` | `3000` | Puerto HTTP de la API |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Origen exacto permitido por CORS |

Al arrancar verás:

- API: `http://localhost:3000`
- Swagger UI: **`http://localhost:3000/docs`**
- CORS origen permitido: el valor de `FRONTEND_ORIGIN`

### 2. Frontend (puerto `5173`)

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abrir: **`http://localhost:5173`**

Variable de entorno (`frontend/.env`):

| Variable | Valor por defecto |
| --- | --- |
| `VITE_API_URL` | `http://localhost:3000` |

> Importante: `FRONTEND_ORIGIN` del backend debe coincidir exactamente con la URL del frontend (`http://localhost:5173`).

### Builds de producción (verificación)

```bash
cd backend
npm run build

cd ../frontend
npm run build
```

---

## Endpoints de la API

Base URL: `http://localhost:3000`  
Prefijo: ninguno. Rutas en español.

| Método | Ruta | Éxito | Errores |
| --- | --- | --- | --- |
| `GET` | `/pedidos` | `200` colección | — |
| `GET` | `/pedidos/:id` | `200` detalle | `404` |
| `POST` | `/pedidos` | `201` creado | `400`, `409` |
| `PATCH` | `/pedidos/:id` | `200` actualizado | `400`, `404`, `409` |
| `PUT` | `/pedidos/:id` | `200` reemplazo completo | `400`, `404`, `409` |
| `DELETE` | `/pedidos/:id` | `204` sin cuerpo | `404` |

### Códigos de estado utilizados

| Código | Uso |
| --- | --- |
| **200** | Lectura / actualización / reemplazo exitoso |
| **201** | Creación exitosa |
| **204** | Eliminación exitosa (sin cuerpo) |
| **400** | Validación, propiedades desconocidas, body vacío en PATCH, total inconsistente, mesa inválida |
| **404** | Pedido inexistente |
| **409** | `codigo` duplicado |
| **500** | No se fabrica deliberadamente |

### Política de `total`

El servidor **recalcula** el total a partir de `items` (cantidad × precioUnitario).  
Si el cliente envía `total` y difiere de la suma (tolerancia `0.01`), responde **400**.

### Seed inicial

Al iniciar el backend se cargan 3 pedidos de demo: `ORD-1001`, `ORD-1002`, `ORD-1003`.  
Reiniciar el servidor vacía la memoria y vuelve a sembrar.

### OpenAPI / Swagger

- URL: **http://localhost:3000/docs**

---

## Estructura del repositorio

```
tarea_s10/
├── Documentacion/
│   ├── system-brief.md
│   ├── SRS.md
│   └── estado-implementacion.md
├── backend/                 # NestJS — src/main.ts, src/pedidos/
│   └── .env.example         # PORT, FRONTEND_ORIGIN
├── frontend/                # React + Vite — src/api, src/components/
│   └── .env.example         # VITE_API_URL
└── README.md
```

### Stack implementado

| Capa | Tecnología | Cliente HTTP / notas |
| --- | --- | --- |
| Backend | NestJS 11 + class-validator + Swagger | Persistencia en memoria (`Map`); sin BD ni auth |
| Frontend | React 19 + Vite 8 + TypeScript | `fetch` nativo; edición con `PATCH` (el `PUT` de la API se prueba en Swagger) |

---

## Notas de demostración

1. Arrancar backend y frontend (CORS: origen exacto `http://localhost:5173`).
2. Probar CRUD en la UI (`GET`/`POST`/`PATCH`/`DELETE`) y en Swagger (incluye `PUT`).
3. Validar: body sin `cliente` → `400`; propiedad `foo` → `400`; `codigo` repetido → `409`; id inexistente → `404`; `DELETE` → `204`; `POST` OK → `201`.
4. Reiniciar el backend vuelve a sembrar `ORD-1001`…`ORD-1003` (memoria volátil).
