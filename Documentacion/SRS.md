# Especificación de Requisitos de Software (SRS)  
## Reztro Café — Gestión de Pedidos

| Campo | Valor |
| --- | --- |
| **Documento** | SRS |
| **Versión** | 1.1 |
| **Fecha** | 2026-10-08 |
| **Estado** | Baseline + nota de implementación (MVP) |
| **Curso** | Desarrollo Web — Tarea Semana 10 |
| **Brief relacionado** | [`system-brief.md`](./system-brief.md) |
| **Estado de código** | [`estado-implementacion.md`](./estado-implementacion.md) |
| **UI de referencia** | [Figma Reztro — Preview](https://www.figma.com/design/FHDt5s2m8aVKsSXZBBWk9x/Reztro---Restaurant-Food-Order-Admin-Dashboard--Preview-?node-id=425-18391) |

### Nota de implementación (v1.1)

El MVP académico quedó implementado en `backend/` + `frontend/`. Resumen frente a prioridades Must/Should:

| ID | Prioridad | Estado real |
| --- | --- | --- |
| RF-B01–B07, B09–B14 | Must | Implementados |
| RF-B08 (`PUT` reemplazo completo) | Should | **Implementado** en API y Swagger; el frontend usa `PATCH` para editar |
| RF-B15 (seed ≥2) | Should | Implementado (3 pedidos: `ORD-1001`…`ORD-1003`) |
| RF-F01–F06 | Must | Implementados (`fetch`; sin axios) |
| RF-F07 | Should | Implementado a nivel de inspiración Reztro (no pixel-perfect) |
| RF-D01–D02 | Must | Cubiertos por el README raíz |

**Fuera de alcance (sin implementar):** BD, auth, pagos, módulos Figma ajenos a Pedidos.

---

## 1. Introducción

### 1.1 Propósito del documento

Definir de forma verificable los requisitos funcionales, no funcionales y de interfaz del sistema **Reztro Café (gestión de pedidos)**, de modo que backend (NestJS) y frontend (React) implementen el mismo contrato HTTP.

### 1.2 Alcance del producto

Sistema académico de **panel administrativo de pedidos** para cafetería/restaurante:

- API REST validada sin base de datos (persistencia en memoria).
- Cliente React que consume el contrato y refleja estados de operación.
- Documentación OpenAPI para la demostración.

**Fuera de alcance:** autenticación, BD, pagos, notificaciones y módulos Figma no ligados al CRUD de pedidos (mensajes, calendario, inventario, etc.) como servicios independientes.

### 1.3 Definiciones y acrónimos

| Término | Definición |
| --- | --- |
| **Pedido** | Recurso principal: solicitud de alimentos/bebidas con cliente, ítems, estado y total. |
| **DTO** | Data Transfer Object — forma del body de entrada validada. |
| **Whitelist** | Solo se aceptan propiedades declaradas en el DTO. |
| **OpenAPI / Swagger** | Documentación interactiva del contrato HTTP. |
| **En memoria** | Almacenamiento volátil en el proceso del servidor (Array/Map). |

### 1.4 Referencias

- Enunciado del curso: API NestJS + React, ValidationPipe, códigos HTTP, OpenAPI, README.
- Diseño UI: Reztro Restaurant Food Order Admin Dashboard (pantallas Dashboard, Orders, Order Details, Menu).
- NestJS Exception Filters / HttpException estándar.
- class-validator / class-transformer.

---

## 2. Descripción general

### 2.1 Perspectiva del producto

Aplicación cliente-servidor en dos procesos:

1. **API NestJS** — módulo de característica `pedidos`.
2. **SPA React** — UI inspirada en las vistas *Orders* / *Order Details* de Reztro.

Comunicación: HTTPS/HTTP local, JSON, CORS restringido al origen exacto del frontend.

### 2.2 Funciones del producto (visión)

1. Listar pedidos.
2. Consultar un pedido por `id`.
3. Crear pedido.
4. Actualizar parcialmente pedido (`PATCH`).
5. Eliminar pedido.
6. (Opcional) Reemplazar completamente un pedido (`PUT`).
7. Mostrar en UI carga, éxito y error según la respuesta del servidor.

### 2.3 Características de los usuarios

| Usuario | Conocimiento | Expectativa |
| --- | --- | --- |
| Operador de caja / admin | Uso básico de paneles web | CRUD intuitivo, mensajes claros ante error |
| Evaluador técnico | HTTP, NestJS, React | Semántica correcta, validación y OpenAPI |

### 2.4 Restricciones

- Stack obligatorio: **NestJS** (API) y **React** (UI).
- Sin base de datos.
- `ValidationPipe` global: `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`.
- No usar `@Res()` para armar cada respuesta; excepciones y decoradores estándar.
- No provocar errores `500` de forma deliberada.
- CORS: permitir únicamente el origen exacto del frontend (p. ej. `http://localhost:5173`).

### 2.5 Supuestos y dependencias

- Node.js LTS instalado en el entorno de demo.
- Frontend y backend en `localhost` con puertos documentados en el README.
- Reinicio del backend implica pérdida/reseeding de datos en memoria.
- Un solo recurso de evaluación: **Pedido**.

---

## 3. Requisitos funcionales

### 3.1 Backend — Módulo `pedidos`

| ID | Requisito | Prioridad |
| --- | --- | --- |
| **RF-B01** | Debe existir un módulo NestJS `pedidos` con controlador, servicio y DTOs. | Must |
| **RF-B02** | El servicio debe conservar la colección de pedidos en memoria (p. ej. `Map` o arreglo). | Must |
| **RF-B03** | `GET /pedidos` debe devolver la colección completa con código **200**. | Must |
| **RF-B04** | `GET /pedidos/:id` debe devolver el pedido si existe (**200**) o **404** si no. | Must |
| **RF-B05** | `POST /pedidos` debe crear un pedido válido y responder **201** con el recurso creado (incl. `id` y timestamps). | Must |
| **RF-B06** | `PATCH /pedidos/:id` debe aplicar cambios parciales válidos y responder **200** con el recurso actualizado. | Must |
| **RF-B07** | `DELETE /pedidos/:id` debe eliminar el recurso y responder **204** sin cuerpo; **404** si no existe. | Must |
| **RF-B08** | *(Opcional / Should)* `PUT /pedidos/:id` debe reemplazar el recurso completo (salvo `id`/auditoría) y documentarse como reemplazo total (**200**). **Implementado** en el backend. | Should |
| **RF-B09** | Si `codigo` ya existe en otro pedido, `POST`/`PATCH`/`PUT` deben responder **409**. | Must |
| **RF-B10** | Datos inválidos o propiedades no permitidas deben producir **400** con cuerpo de error consistente. | Must |
| **RF-B11** | Debe activarse `ValidationPipe` global con `whitelist`, `forbidNonWhitelisted` y `transform`. | Must |
| **RF-B12** | Debe configurarse CORS para el origen exacto del frontend. | Must |
| **RF-B13** | Debe exponerse documentación OpenAPI (Swagger UI) accesible en la demo. | Must |
| **RF-B14** | El controlador debe lanzar/usar excepciones HTTP estándar (`NotFoundException`, `ConflictException`, `BadRequestException` vía pipe, etc.), sin construir manualmente cada respuesta con `@Res()`. | Must |
| **RF-B15** | Al iniciar, el servicio puede sembrar (≥2) pedidos de ejemplo para facilitar la demostración. | Should |

### 3.2 Frontend — Panel de pedidos

| ID | Requisito | Prioridad |
| --- | --- | --- |
| **RF-F01** | Debe mostrar la colección de pedidos obtenida de `GET /pedidos`. | Must |
| **RF-F02** | Debe permitir crear un pedido mediante formulario que envíe `POST /pedidos`. | Must |
| **RF-F03** | Debe permitir actualizar un pedido existente (`PATCH` o formulario de edición). | Must |
| **RF-F04** | Debe permitir eliminar un pedido (`DELETE`), confirmando la acción en UI. | Must |
| **RF-F05** | Debe representar estados de **carga**, **éxito** y **error** del servidor (mensajes legibles). | Must |
| **RF-F06** | La UI debe actualizarse con la **respuesta confirmada** por la API (no solo con estado local optimista no verificado). | Must |
| **RF-F07** | La presentación debe inspirarse en el diseño Reztro (Orders): listado tabular/tarjetas, estados visibles, formulario claro; no se exige fidelidad pixel-perfect de todo el preview. | Should |

### 3.3 Documentación de repositorio

| ID | Requisito | Prioridad |
| --- | --- | --- |
| **RF-D01** | El README raíz debe incluir instrucciones de ejecución (API y frontend). | Must |
| **RF-D02** | El README debe listar rutas disponibles y códigos de estado utilizados. | Must |

---

## 4. Modelo de datos

### 4.1 Entidad `Pedido`

| Campo | Tipo | Requerido | Restricciones |
| --- | --- | --- | --- |
| `id` | `string` (UUID o numérico string) | Sí (servidor) | Generado; no aceptado en create desde cliente (o ignorado). |
| `codigo` | `string` | Sí | Único; patrón sugerido `^[A-Z]{3}-\d{3,}$` o longitud 3–20. |
| `cliente` | `string` | Sí | Trim; longitud 2–80. |
| `mesa` | `number` \| `null` | No | Entero ≥ 1 si `tipo === 'local'`; puede ser null en otros tipos. |
| `tipo` | enum | Sí | `local` \| `para_llevar` \| `delivery` |
| `estado` | enum | Sí | `pendiente` \| `en_preparacion` \| `listo` \| `entregado` \| `cancelado` |
| `items` | `PedidoItem[]` | Sí | Mínimo 1 elemento. |
| `notas` | `string` | No | Máx. 250 caracteres. |
| `total` | `number` | Sí | ≥ 0; hasta 2 decimales; debe coincidir con la suma de ítems (cantidad × precioUnitario) con tolerancia 0.01 **o** ser recalculado por el servidor (definir una política y documentarla). |
| `creadoEn` | ISO-8601 `string` | Sí (servidor) | Solo lectura. |
| `actualizadoEn` | ISO-8601 `string` | Sí (servidor) | Solo lectura. |

### 4.2 Objeto `PedidoItem`

| Campo | Tipo | Requerido | Restricciones |
| --- | --- | --- | --- |
| `nombre` | `string` | Sí | Longitud 1–80. |
| `cantidad` | `number` | Sí | Entero ≥ 1. |
| `precioUnitario` | `number` | Sí | ≥ 0; máx. 2 decimales. |

### 4.3 DTOs

| DTO | Uso |
| --- | --- |
| `CreatePedidoDto` | Body de `POST` — todos los campos de entrada requeridos/opcionales excepto `id` y timestamps. |
| `UpdatePedidoDto` | Body de `PATCH` — todos los campos opcionales (`PartialType`); al menos un campo debe enviarse (validación custom o rechazo de body vacío → 400). |
| `ReplacePedidoDto` | Body de `PUT` (si se implementa) — mismos campos requeridos que create (reemplazo completo). |

Propiedades no declaradas en el DTO → **400** (`forbidNonWhitelisted`).

### 4.4 Política de `total` (decisión de diseño) — confirmada

**Política implementada:** el servidor **recalcula** `total` a partir de `items` (cantidad × precioUnitario, redondeo a 2 decimales) en `POST`, `PUT` y cuando aplica en `PATCH` (si llegan `items` y/o `total`).

- El campo `total` en el body de escritura es **opcional**.
- Si el cliente lo envía y `|totalCliente − suma| > 0.01` → **400** con mensaje explicativo.
- Si no se envía, se usa el valor calculado.
- Documentado también en la descripción de Swagger (`/docs`).

Regla adicional implementada (alineada a §4.1): si `tipo === 'local'`, `mesa` es obligatoria (entero ≥ 1); si falta → **400**.

---

## 5. API HTTP — Especificación de endpoints

Base URL (desarrollo): `http://localhost:3000`  
Prefijo global: **ninguno**. Rutas: `/pedidos`.  
Swagger UI: `http://localhost:3000/docs`.

### 5.1 `GET /pedidos`

- **Descripción:** Lista todos los pedidos en memoria.
- **Éxito:** `200 OK` — `Pedido[]`
- **Errores:** ninguno de negocio previstos.

### 5.2 `GET /pedidos/:id`

- **Éxito:** `200 OK` — `Pedido`
- **Errores:** `404 Not Found` si el `id` no existe.

### 5.3 `POST /pedidos`

- **Body:** `CreatePedidoDto`
- **Éxito:** `201 Created` — `Pedido` creado
- **Errores:**
  - `400` validación / propiedades desconocidas / total inconsistente
  - `409` `codigo` duplicado

### 5.4 `PATCH /pedidos/:id`

- **Body:** `UpdatePedidoDto` (parcial)
- **Éxito:** `200 OK` — `Pedido` actualizado
- **Errores:** `400`, `404`, `409` (si el nuevo `codigo` choca con otro)

### 5.5 `DELETE /pedidos/:id`

- **Éxito:** `204 No Content` — sin cuerpo
- **Errores:** `404`

### 5.6 `PUT /pedidos/:id` (Should — implementado)

- **Semántica:** reemplazo completo de campos de negocio; conserva `id` y `creadoEn`; actualiza `actualizadoEn`.
- **Éxito:** `200 OK`
- **Errores:** `400`, `404`, `409`
- **Consumo UI:** el panel React edita con `PATCH`; `PUT` se demuestra vía Swagger/Postman.

### 5.7 Matriz de códigos de estado

| Código | Cuándo se usa |
| --- | --- |
| **200** | Lectura exitosa; actualización/reemplazo exitoso. |
| **201** | Creación exitosa. |
| **204** | Eliminación exitosa sin cuerpo. |
| **400** | Validación fallida, tipos incorrectos, restricciones, propiedades desconocidas, body vacío en PATCH, total inconsistente. |
| **404** | `id` de pedido inexistente. |
| **409** | Conflicto de unicidad de `codigo`. |
| **500** | No se fabricará deliberadamente. |

### 5.8 Formato de error (consistencia) — confirmado

Respuestas de error JSON consistentes vía excepciones HTTP estándar de NestJS (sin filtro custom). Forma por defecto, por ejemplo:

```json
{
  "statusCode": 400,
  "message": ["cliente must be longer than or equal to 2 characters"],
  "error": "Bad Request"
}
```

```json
{
  "statusCode": 404,
  "message": "Pedido con id \"…\" no encontrado",
  "error": "Not Found"
}
```

```json
{
  "statusCode": 409,
  "message": "Ya existe un pedido con el código \"ORD-1001\"",
  "error": "Conflict"
}
```

El frontend debe mostrar `message` (string o arreglo unido) al usuario.

---

## 6. Requisitos de validación

| ID | Regla |
| --- | --- |
| **RV-01** | Campos requeridos ausentes → 400. |
| **RV-02** | Tipos incorrectos tras `transform` → 400. |
| **RV-03** | Enums fuera de valor permitido → 400. |
| **RV-04** | Longitudes y mínimos/máximos numéricos → 400. |
| **RV-05** | `items` vacío → 400. |
| **RV-06** | Propiedad no declarada en DTO → 400. |
| **RV-07** | `codigo` duplicado → 409 (no 400). |
| **RV-08** | Recurso ausente → 404 (no 400). |

---

## 7. Requisitos no funcionales

| ID | Categoría | Requisito |
| --- | --- | --- |
| **RNF-01** | Arquitectura | Separación clara módulo Nest (controller / service / dto) y capas UI React. |
| **RNF-02** | Usabilidad | Mensajes de error comprensibles en español en la UI. |
| **RNF-03** | Interoperabilidad | JSON UTF-8; OpenAPI 3.x vía Swagger. |
| **RNF-04** | Seguridad básica | CORS de origen exacto; no se exigen auth ni HTTPS en local. |
| **RNF-05** | Mantenibilidad | Nombres en español o inglés consistentes; documentar convención elegida (recomendado: rutas y campos de API en español alineados al dominio del curso, o inglés técnico — **decisión:** API en español `pedidos` para coherencia con la tarea). |
| **RNF-06** | Rendimiento | Suficiente para decenas de pedidos en memoria en demo local. |
| **RNF-07** | Fiabilidad demo | Seed inicial reproducible al arrancar el servidor. |

---

## 8. Requisitos de interfaz

### 8.1 Interfaces de usuario

Pantallas mínimas:

1. **Listado de pedidos** — columnas/campos visibles: código, cliente, tipo, estado, total, acciones (editar/eliminar). Referencia Figma: *Orders*.
2. **Formulario crear/editar** — campos del DTO; feedback de validación local opcional + errores del servidor.
3. **Indicadores** — spinner/skeleton en carga; toast o banner de éxito; alert de error.

### 8.2 Interfaces de software

- Cliente HTTP desde React hacia NestJS.
- Swagger UI en el navegador para pruebas manuales.

### 8.3 Interfaces de comunicación

| Parámetro | Valor de diseño |
| --- | --- |
| Protocolo | HTTP/1.1 |
| Formato | `application/json` |
| CORS `origin` | Exact match: `http://localhost:5173` (`FRONTEND_ORIGIN`) |
| Métodos | GET, POST, PATCH, PUT, DELETE, OPTIONS |

---

## 9. Datos de prueba sugeridos (seed)

| codigo | cliente | tipo | estado | items (resumen) |
| --- | --- | --- | --- | --- |
| `ORD-1001` | Ana López | local | en_preparacion | Café americano ×2, Croissant ×1 |
| `ORD-1002` | Carlos Ruiz | para_llevar | pendiente | Capuchino ×1, Brownie ×1 |
| `ORD-1003` | María Pérez | delivery | listo | Jugo natural ×2, Sandwich club ×1 |

---

## 10. Criterios de aceptación (verificación)

| # | Criterio | Método |
| --- | --- | --- |
| 1 | CRUD completo operable desde UI y desde Swagger | Demo manual |
| 2 | `POST` con body sin `cliente` → 400 | Swagger/UI |
| 3 | `POST` con propiedad `foo` → 400 | Swagger |
| 4 | `POST` con `codigo` repetido → 409 | Swagger/UI |
| 5 | `GET`/`PATCH`/`DELETE` con id inexistente → 404 | Swagger |
| 6 | `DELETE` exitoso → 204 y desaparece del listado tras refresh/respuesta | UI |
| 7 | `POST` exitoso → 201 y aparece en listado con datos del servidor | UI |
| 8 | CORS: origen no autorizado rechazado por el navegador | DevTools |
| 9 | OpenAPI accesible en URL documentada | Navegador |
| 10 | README con ejecución, rutas y códigos | Revisión documental |

---

## 11. Trazabilidad enunciado → requisitos

| Exigencia del curso | Cobertura SRS |
| --- | --- |
| Módulo con controlador, servicio y DTO | RF-B01 |
| Datos en memoria | RF-B02, RNF-07 |
| GET colección y detalle, POST, PATCH, DELETE | RF-B03–B07 |
| PUT opcional documentado | RF-B08, §5.6 |
| ValidationPipe global whitelist/forbid/transform | RF-B11, §6 |
| Excepciones estándar, sin `@Res()` manual | RF-B14 |
| CORS origen exacto | RF-B12, RNF-04 |
| OpenAPI en demo | RF-B13 |
| Códigos 200, 201, 204, 400, 404, 409 | §5.7 |
| Validación y errores consistentes | RF-B10, §5.8, §6 |
| No fabricar 500 | §5.7, brief |
| React: listar, crear, actualizar, eliminar | RF-F01–F04 |
| Estados carga/éxito/error; UI con respuesta API | RF-F05–F06 |
| README ejecución, rutas, códigos | RF-D01–D02 |

---

## 12. Estructura del repositorio y ejecución

Estructura real:

```
tarea_s10/
├── Documentacion/
│   ├── system-brief.md
│   ├── SRS.md
│   └── estado-implementacion.md
├── backend/                 # NestJS — puerto 3000
│   ├── .env.example         # PORT, FRONTEND_ORIGIN
│   └── src/
│       ├── main.ts          # ValidationPipe, CORS, Swagger /docs
│       └── pedidos/         # controller, service, dto, entities, enums
├── frontend/                # React + Vite — puerto 5173
│   ├── .env.example         # VITE_API_URL
│   └── src/
│       ├── api/pedidosApi.ts
│       ├── components/      # PedidosTable, PedidoForm, StatusBanner
│       ├── types/pedido.ts
│       └── App.tsx
└── README.md
```

**Cómo ejecutar:** ver el [README raíz](../README.md) (instalación, variables, URLs y matriz de códigos). No se duplica aquí el procedimiento completo.

Resumen de arranque:

| Proceso | Comando | URL |
| --- | --- | --- |
| API | `cd backend && npm install && npm run start:dev` | `http://localhost:3000` · Swagger `/docs` |
| UI | `cd frontend && npm install && npm run dev` | `http://localhost:5173` |

---

## 13. Desviaciones respecto al baseline v1.0

| Tema | Baseline | Implementación |
| --- | --- | --- |
| Stack frontend | React (Vite/CRA) | **Vite + React + TypeScript** (sin CRA) |
| Cliente HTTP UI | fetch/axios | Solo **`fetch`** |
| `PUT` (RF-B08) | Should / opcional | **Implementado** en API; UI usa `PATCH` |
| Prefijo `/api` | Opcional | **Sin prefijo** |
| Swagger path | p. ej. `/api` o `/docs` | **`/docs`** |
| `id` | UUID o numérico string | **UUID** (`crypto.randomUUID`) |
| Mesa + tipo local | Restricción documentada | Validada en servicio → **400** si falta |
| Módulos Figma extra | Fuera de alcance | Sin APIs ni pantallas de inventario/mensajes/etc. |

---

## 14. Glosario de implementación (histórico)

Orden seguido tras el SRS baseline:

1. Scaffold carpetas `backend/` + `frontend/`.
2. NestJS: módulo `pedidos`, DTOs con `class-validator`, servicio en memoria (`Map`), seed.
3. `main.ts`: ValidationPipe, CORS, Swagger en `/docs`.
4. React: `pedidosApi`, página Pedidos, formularios, banners de estado.
5. README + documentación de estado.

Estado actual: ver [`estado-implementacion.md`](./estado-implementacion.md).

---

*Fin del SRS v1.1*
|
