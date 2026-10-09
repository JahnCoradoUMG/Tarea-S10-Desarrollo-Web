# System Brief — Reztro Café (Gestión de Pedidos)

| Campo | Valor |
| --- | --- |
| **Proyecto** | Tarea Semana 10 — Desarrollo Web (UMG) |
| **Nombre del sistema** | Reztro Café — API y panel de gestión de pedidos |
| **Versión del brief** | 1.1 |
| **Fecha** | 2026-10-08 |
| **Estado** | Implementación MVP completada (pasos 2–6) |
| **Dominio** | Cafetería / restaurante (administración de pedidos) |
| **Referencia de UI** | [Reztro — Restaurant Food Order Admin Dashboard (Figma)](https://www.figma.com/design/FHDt5s2m8aVKsSXZBBWk9x/Reztro---Restaurant-Food-Order-Admin-Dashboard--Preview-?node-id=425-18391) |

---

## 1. Propósito

Demostrar, con un caso de uso realista de **gestión de pedidos de cafetería/restaurante**, la capacidad de:

1. Diseñar e implementar una **API HTTP validada** con NestJS (contrato semántico, validación, errores).
2. Consumir ese contrato desde una **interfaz React** con estados de carga, éxito y error.
3. Documentar el sistema (brief, SRS, OpenAPI y README de ejecución).

No se requiere persistencia en base de datos: el estado vive **en memoria** durante la ejecución del servidor.

---

## 2. Problema que resuelve

En un local de comida, el personal administrativo necesita:

- Ver la lista de pedidos activos e históricos.
- Registrar un pedido nuevo (cliente, ítems, mesa/tipo, total, notas).
- Actualizar el estado o datos del pedido (p. ej. de *pendiente* a *en preparación*).
- Eliminar pedidos cancelados o erróneos.
- Recibir respuestas HTTP claras cuando los datos son inválidos, el recurso no existe o hay conflictos de negocio.

El sistema concentra ese flujo en un **módulo de característica `Pedidos`**, alineado visualmente con las pantallas *Orders* / *Order Details* del diseño Reztro.

---

## 3. Alcance

### 3.1 Incluido (MVP académico)

| Capa | Alcance |
| --- | --- |
| **Backend** | NestJS: módulo `pedidos` (controlador, servicio, DTOs), almacenamiento en memoria, `ValidationPipe` global, CORS hacia el origen exacto del frontend, OpenAPI (Swagger). |
| **Recurso principal** | `Pedido` — CRUD HTTP completo: `GET` colección, `GET` detalle, `POST`, `PATCH`, `PUT` (reemplazo completo), `DELETE`. |
| **Frontend** | React (Vite + TypeScript): listado de pedidos, formulario de creación/edición, eliminación con confirmación; feedback de loading / success / error; UI actualizada solo con la respuesta confirmada por la API (`fetch`). |
| **Documentación** | `system-brief.md`, `SRS.md`, `estado-implementacion.md`, README de ejecución, rutas y códigos de estado; Swagger en vivo. |

### 3.2 Excluido (fuera de alcance)

- Base de datos, ORM, migraciones o autenticación/autorización.
- Módulos del diseño Figma no esenciales al CRUD de pedidos (mensajes, calendario, inventario, órdenes de compra, reseñas) como APIs independientes.
- Pagos reales, notificaciones push, multi-tenant o despliegue en producción.
- Fabricación deliberada de errores `500`.

> **Nota de diseño:** pantallas como Dashboard, Menú e Inventario del preview Figma sirven de **referencia visual y de dominio**; el contrato HTTP evaluable se centra en **Pedidos**.

---

## 4. Usuarios y actores

| Actor | Rol | Interacción |
| --- | --- | --- |
| **Administrador / cajero** | Usuario principal del panel | Lista, crea, edita y elimina pedidos vía React. |
| **API NestJS** | Sistema proveedor del contrato | Valida, persiste en memoria y responde con semántica HTTP. |
| **Demostrador / docente** | Evaluador | Verifica CORS, validación, códigos de estado y OpenAPI. |

No hay roles diferenciados en esta versión: se asume un único perfil operativo sin login.

---

## 5. Recurso de dominio: Pedido

Entidad central del módulo de característica.

| Atributo | Descripción breve |
| --- | --- |
| `id` | Identificador único UUID (generado por el servidor). |
| `codigo` | Código legible del pedido (único; patrón `AAA-###`, p. ej. `ORD-1001`). |
| `cliente` | Nombre del cliente. |
| `mesa` | Número de mesa (obligatoria si `tipo === 'local'`; opcional/null en otros tipos). |
| `tipo` | `local` \| `para_llevar` \| `delivery`. |
| `estado` | `pendiente` \| `en_preparacion` \| `listo` \| `entregado` \| `cancelado`. |
| `items` | Lista de ítems (`nombre`, `cantidad`, `precioUnitario`). |
| `notas` | Observaciones opcionales. |
| `total` | Monto total **recalculado por el servidor** a partir de ítems. |
| `creadoEn` / `actualizadoEn` | Marcas de tiempo ISO-8601 gestionadas por el servidor. |

Reglas de negocio mínimas (detalle en SRS):

- No se permiten propiedades desconocidas en el body (`forbidNonWhitelisted`).
- `codigo` único → conflicto `409` si se intenta duplicar.
- Pedido inexistente → `404`.
- Body inválido → `400` con formato de error consistente (NestJS por defecto).
- Si el cliente envía `total` y no coincide con la suma (tolerancia `0.01`) → `400`.

---

## 6. Arquitectura lógica (alto nivel)

```
┌─────────────────────┐         HTTP/JSON + CORS          ┌──────────────────────────┐
│  React (Vite)       │  ◄──────────────────────────────► │  NestJS API              │
│  http://localhost:  │     origen exacto del frontend    │  http://localhost:3000   │
│  5173               │     FRONTEND_ORIGIN               │  Módulo pedidos          │
│  Panel Pedidos      │                                   │  - Controller            │
│  - Listado          │                                   │  - Service (Map)         │
│  - Formulario CRUD  │                                   │  - DTOs + class-validator│
│  - Estados UI       │                                   │  - ValidationPipe global │
└─────────────────────┘                                   │  - Swagger /docs         │
                                                          └──────────────────────────┘
                                                                     │
                                                                     ▼
                                                          Almacenamiento en memoria
                                                          (sin BD)
```

### 6.1 Estructura de carpetas

```
tarea_s10/
├── Documentacion/          # brief, SRS, estado de implementación
├── backend/                # NestJS (src/main.ts, src/pedidos/…)
├── frontend/               # React + Vite (src/api, src/components, …)
└── README.md               # ejecución y contrato HTTP
```

### 6.2 URLs de desarrollo (valores reales)

| Recurso | URL / valor |
| --- | --- |
| API | `http://localhost:3000` |
| Swagger UI | `http://localhost:3000/docs` |
| Frontend | `http://localhost:5173` |
| CORS `origin` | `http://localhost:5173` (`FRONTEND_ORIGIN`) |
| Prefijo global API | ninguno (rutas en raíz: `/pedidos`) |

Variables:

| Capa | Variable | Default |
| --- | --- | --- |
| Backend | `PORT` | `3000` |
| Backend | `FRONTEND_ORIGIN` | `http://localhost:5173` |
| Frontend | `VITE_API_URL` | `http://localhost:3000` |

Principios:

- El controlador **no** construye respuestas manualmente con `@Res()`; usa excepciones estándar de NestJS y decoradores HTTP.
- El frontend **no** asume éxito local: solo refleja el estado tras la respuesta de la API.
- Un solo contrato documentado en OpenAPI guía ambas capas.

---

## 7. Contratos HTTP (resumen)

| Método | Ruta | Éxito | Errores relevantes |
| --- | --- | --- | --- |
| `GET` | `/pedidos` | `200` colección | — |
| `GET` | `/pedidos/:id` | `200` detalle | `404` |
| `POST` | `/pedidos` | `201` creado | `400`, `409` |
| `PATCH` | `/pedidos/:id` | `200` actualizado | `400`, `404`, `409` |
| `PUT` | `/pedidos/:id` | `200` reemplazo completo | `400`, `404`, `409` |
| `DELETE` | `/pedidos/:id` | `204` sin cuerpo | `404` |

OpenAPI disponible en **`http://localhost:3000/docs`**.

> El panel React usa `GET` / `POST` / `PATCH` / `DELETE`. El `PUT` está implementado y documentado en Swagger para demostración de reemplazo completo.

---

## 8. Criterios de éxito de la demostración

1. Arranque de API + frontend con instrucciones del README.
2. CRUD completo sobre pedidos visible en la UI y verificable en Swagger/Postman.
3. Validación: campos requeridos, tipos, restricciones y propiedades extra → `400`.
4. Recurso inexistente → `404`; código duplicado → `409`; creación → `201`; borrado → `204`.
5. CORS limitado al origen exacto del frontend.
6. Errores consistentes; sin `500` provocados a propósito.

---

## 9. Riesgos y supuestos

| Tipo | Descripción | Mitigación |
| --- | --- | --- |
| **Supuesto** | Un solo proceso Node; reiniciar el servidor vacía los pedidos. | Sembrar datos iniciales en memoria para la demo (3 pedidos). |
| **Supuesto** | El diseño Figma es guía visual; no se replica pixel-perfect todo el kit. | Priorizar flujo Pedidos (lista + formulario). |
| **Riesgo** | Desalineación frontend–DTO. | Consultar OpenAPI (`/docs`) como fuente de verdad. |
| **Riesgo** | Origen CORS incorrecto en demo. | Documentar `localhost:5173` y `FRONTEND_ORIGIN` en README. |

---

## 10. Entregables del repositorio

- `Documentacion/system-brief.md` (este documento)
- `Documentacion/SRS.md`
- `Documentacion/estado-implementacion.md`
- Backend NestJS (`backend/`) — `pedidos` + validación + CORS + OpenAPI
- Frontend React (`frontend/`) — consumidor del contrato
- `README.md` raíz: ejecución, rutas y códigos de estado

---

## 11. Estado de implementación

| Paso | Descripción | Estado |
| --- | --- | --- |
| 1 | Congelar modelo y endpoints en el SRS | Hecho |
| 2 | Scaffold NestJS + módulo `pedidos` + DTOs + servicio en memoria | **Implementado** |
| 3 | Activar `ValidationPipe`, CORS, Swagger (`/docs`) | **Implementado** |
| 4 | Scaffold React (Vite) + vistas listado/formulario | **Implementado** |
| 5 | Integrar `fetch`, estados UI y CORS | **Implementado** |
| 6 | Completar README y ensayo de demostración | **Implementado** |

Detalle por paso y archivos clave: [`estado-implementacion.md`](./estado-implementacion.md).  
Instrucciones de ejecución: [`../README.md`](../README.md).

---

*Brief v1.1 — alineado a la implementación real (2026-10-08).*
