# Estado de implementación — Reztro Café

| Campo | Valor |
| --- | --- |
| **Fecha** | 2026-10-08 |
| **Alcance** | Pasos 2–6 del plan (tras SRS baseline) |
| **Referencias** | [`system-brief.md`](./system-brief.md) · [`SRS.md`](./SRS.md) · [`../README.md`](../README.md) |

Documento de seguimiento: refleja únicamente lo **presente en el código**, sin inventar BD, auth u otros módulos Figma.

---

## Resumen por paso

| Paso | Objetivo | Estado | Evidencia principal |
| --- | --- | --- | --- |
| **2** | Scaffold NestJS + módulo `pedidos` + DTOs + servicio en memoria | Hecho | `backend/src/pedidos/*`, `Map` + seed |
| **3** | ValidationPipe, CORS, Swagger | Hecho | `backend/src/main.ts` → `/docs` |
| **4** | Scaffold React + listado/formulario | Hecho | `frontend/src/App.tsx`, componentes |
| **5** | Integrar cliente HTTP, estados UI, CORS | Hecho | `pedidosApi.ts` (`fetch`) + `FRONTEND_ORIGIN` |
| **6** | README y documentación de demo | Hecho | `README.md` + esta carpeta `Documentacion/` |

---

## Paso 2 — Backend: módulo `pedidos`

| Elemento | Detalle |
| --- | --- |
| Framework | NestJS 11 (`backend/package.json`) |
| Módulo | `PedidosModule` → controller + service |
| Persistencia | `Map<string, Pedido>` en memoria |
| Seed | 3 pedidos al `OnModuleInit`: `ORD-1001`, `ORD-1002`, `ORD-1003` |
| DTOs | `CreatePedidoDto`, `UpdatePedidoDto` (PartialType), `ReplacePedidoDto`, `PedidoItemDto` |
| Enums | `TipoPedido`, `EstadoPedido` |
| `id` | UUID vía `crypto.randomUUID()` |

**Archivos clave**

- `backend/src/app.module.ts`
- `backend/src/pedidos/pedidos.module.ts`
- `backend/src/pedidos/pedidos.controller.ts`
- `backend/src/pedidos/pedidos.service.ts`
- `backend/src/pedidos/dto/*.ts`
- `backend/src/pedidos/entities/pedido.entity.ts`
- `backend/src/pedidos/enums/pedido.enums.ts`

**Rutas expuestas**

| Método | Ruta | Código éxito |
| --- | --- | --- |
| GET | `/pedidos` | 200 |
| GET | `/pedidos/:id` | 200 |
| POST | `/pedidos` | 201 |
| PATCH | `/pedidos/:id` | 200 |
| PUT | `/pedidos/:id` | 200 |
| DELETE | `/pedidos/:id` | 204 |

---

## Paso 3 — Validación, CORS, OpenAPI

| Elemento | Valor real |
| --- | --- |
| ValidationPipe | Global: `whitelist`, `forbidNonWhitelisted`, `transform` |
| CORS | `origin` = `FRONTEND_ORIGIN` (default `http://localhost:5173`) |
| Métodos CORS | GET, POST, PATCH, PUT, DELETE, OPTIONS |
| Swagger | `SwaggerModule.setup('docs', …)` → **`http://localhost:3000/docs`** |
| Puerto | `PORT` default **3000** |
| Env example | `backend/.env.example` |

**Archivo clave:** `backend/src/main.ts`

Excepciones: `NotFoundException`, `ConflictException`, `BadRequestException` (sin `@Res()` manual). Formato de error: JSON por defecto de NestJS (`statusCode`, `message`, `error`).

**Política `total`:** servidor recalcula; si el cliente envía `total` inconsistente (tol. 0.01) → 400.

---

## Paso 4 — Frontend: panel Pedidos

| Elemento | Detalle |
| --- | --- |
| Stack | React 19 + Vite 8 + TypeScript |
| Puerto Vite | **5173** (default) |
| UI | Sidebar “Reztro Café”, listado tabular, drawer con formulario crear/editar |
| Estilo | Inspirado en Orders (no pixel-perfect del kit Figma completo) |

**Archivos clave**

- `frontend/src/main.tsx`
- `frontend/src/App.tsx` / `App.css`
- `frontend/src/components/PedidosTable.tsx`
- `frontend/src/components/PedidoForm.tsx`
- `frontend/src/components/StatusBanner.tsx`
- `frontend/src/types/pedido.ts`

---

## Paso 5 — Integración HTTP y estados UI

| Elemento | Detalle |
| --- | --- |
| Cliente | `fetch` nativo (`frontend/src/api/pedidosApi.ts`) |
| Base URL | `VITE_API_URL` → default `http://localhost:3000` |
| Operaciones UI | GET lista, POST crear, PATCH actualizar, DELETE eliminar |
| PUT en UI | No usado (disponible en API/Swagger) |
| Estados | `loading` / `success` / `error` vía `StatusBanner` |
| Actualización UI | Solo tras respuesta confirmada de la API |
| Confirmación delete | `window.confirm` |
| Errores | Muestra `message` (string o arreglo unido) del body NestJS |

**Env example:** `frontend/.env.example`

---

## Paso 6 — Documentación y demo

| Entregable | Ubicación |
| --- | --- |
| Ejecución, rutas, códigos | `README.md` (raíz) |
| Brief actualizado | `Documentacion/system-brief.md` v1.1 |
| SRS + nota de implementación | `Documentacion/SRS.md` v1.1 |
| Este resumen | `Documentacion/estado-implementacion.md` |

---

## Lo que no está implementado (intencional)

- Base de datos / ORM / migraciones
- Autenticación o autorización
- APIs o pantallas de mensajes, calendario, inventario, reseñas, etc.
- Pagos, notificaciones, despliegue en producción
- Prefijo global `/api`
- Cliente axios

---

## Checklist rápido de demo

1. `backend`: `npm run start:dev` → API `:3000`, Swagger `/docs`.
2. `frontend`: `npm run dev` → UI `:5173`.
3. CRUD en UI; `PUT` opcional en Swagger.
4. Validar 400 / 404 / 409 / 201 / 204 según SRS §10.
