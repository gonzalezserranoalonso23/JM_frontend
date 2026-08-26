# 📋 Sistema de Tareas Pendientes (TodoList) - Completado

## 🎯 Descripción General

Sistema de **tareas compartidas** para el sistema de inventario donde:

- ✅ **Todos los usuarios** pueden ver las tareas pendientes
- ✅ **Todos los usuarios** pueden crear nuevas tareas
- ✅ **Todos los usuarios** pueden marcar tareas como completadas
- ✅ **Widget en Dashboard** muestra tareas pendientes de alta/media prioridad
- ✅ **Página dedicada** con vista completa de tareas

---

## 🏗️ Arquitectura

### Backend (Node.js + Express + MongoDB)

#### 1. **Modelo - Tasks.models.js**

```javascript
{
  title: String (requerido),
  description: String,
  status: "pending" | "completed",
  priority: "low" | "medium" | "high",
  createdBy: User (referencia),
  completedBy: User (referencia, null si pending),
  createdAt: Date,
  completedAt: Date (null si pending)
}
```

#### 2. **Controlador - Tasks.controllers.js**

**Funciones disponibles:**

- `getTasks()` - Lista todas las tareas ordenadas por fecha (descendente)
- `getTask(id)` - Obtiene una tarea específica
- `createTask()` - Crea nueva tarea (requiere autenticación)
- `updateTask(id)` - Actualiza tarea (cambiar estado, descripción, prioridad)
- `deleteTask(id)` - Elimina una tarea
- `getPendingTasks()` - Solo tareas pendientes
- `getCompletedTasks()` - Solo tareas completadas

#### 3. **Rutas - Tasks.routes.js**

```
GET  /api/tasks                 # Todas las tareas
GET  /api/tasks/pending         # Tareas pendientes
GET  /api/tasks/completed       # Tareas completadas
GET  /api/tasks/:id             # Tarea específica
POST /api/tasks                 # Crear tarea
PUT  /api/tasks/:id             # Actualizar tarea
DELETE /api/tasks/:id           # Eliminar tarea
```

**Todos los endpoints requieren autenticación (verifyToken middleware)**

---

### Frontend (React + React Query + Axios)

#### 1. **Servicio - tasks.services.js**

Funciones de API para interacción con el backend:

- `getTasks()`
- `getTask(id)`
- `getPendingTasks()`
- `getCompletedTasks()`
- `createTask(taskData)`
- `updateTask(id, taskData)`
- `deleteTask(id)`

#### 2. **Features - tasks.features.js**

Hooks React Query para estado del servidor:

- `useGetTasks()` - Obtiene todas las tareas
- `useGetTask(id)` - Obtiene una tarea
- `useGetPendingTasks()` - Tareas pendientes
- `useGetCompletedTasks()` - Tareas completadas
- `useCreateTask()` - Crear tarea con invalidación de cache
- `useUpdateTask()` - Actualizar tarea con invalidación
- `useDeleteTask()` - Eliminar tarea con invalidación

**Todas las mutaciones:**

- Muestran toast de éxito/error
- Invalidan cache relacionado
- Actualizan datos en tiempo real

#### 3. **Página - TodoList.jsx**

Página completa de gestión de tareas:

- ✅ Formulario para crear tareas
- ✅ Filtro por prioridad (Baja, Media, Alta)
- ✅ Tabs: Pendientes vs Completadas
- ✅ Acciones: Completar, Reactivar, Eliminar
- ✅ Muestra información del usuario que creó/completó
- ✅ Responsive en todos los dispositivos

#### 4. **Widget - TaskWidget.jsx**

Componente minimalista para el Dashboard:

- 🎯 Link directo a página de tareas
- 📊 Muestra conteo total de pendientes
- 🔴 Tareas de alta prioridad
- 🟠 Tareas de media prioridad
- 🔗 Link "Ver todas las tareas" al pie

---

## 🎨 Interfaz de Usuario

### 📱 Página TodoList (/todolist)

#### Secciones:

1. **Header**
   - Título "Tareas Pendientes"
   - Descripción "Gestiona las tareas del sistema"

2. **Formulario de Creación**
   - Campo título (obligatorio)
   - Select de prioridad (Baja/Media/Alta)
   - TextArea de descripción (opcional)
   - Botón agregar

3. **Tabs**
   - Pendientes (X tareas)
   - Completadas (Y tareas)

4. **Tareas Pendientes**
   - Card por tarea con:
     - Título + Badge de prioridad
     - Descripción (si existe)
     - Usuario creador y fecha
     - Botón ✓ (marcar completada)
     - Botón ✕ (eliminar)
   - Colores por prioridad:
     - 🔴 Alta: Rojo
     - 🟠 Media: Naranja
     - ⚫ Baja: Gris

5. **Tareas Completadas**
   - Similar a pendientes pero:
     - Título tachado
     - Botón ↺ (reactivar) en lugar de ✓
     - Muestra usuario que la completó
     - Fondo verde claro

### 🎯 Dashboard Widget

**Ubicación:** En la página Home, entre cards de ventas y alertas de stock

**Contenido:**

- Badge rojo con contador de pendientes
- Lista de tareas alta prioridad (máx 2)
- Lista de tareas media prioridad (máx 2)
- Footer con "Ver todas las tareas →"
- Efecto hover para interactividad

---

## 🔄 Flujos de Trabajo

### 1️⃣ Crear Tarea

```
Usuario → Llena formulario → Click "Agregar"
→ Validación en cliente → POST /api/tasks
→ Backend valida → Guarda en BD → Retorna tarea
→ React Query invalida cache → Re-fetch automático
→ Toast "Tarea creada exitosamente"
→ Formulario se limpia
```

### 2️⃣ Completar Tarea

```
Usuario → Click ✓ en tarea pendiente
→ PUT /api/tasks/:id con status: "completed"
→ Backend actualiza status, completedBy, completedAt
→ Retorna tarea actualizada
→ React Query mueve a tab "Completadas"
→ Toast "Tarea actualizada exitosamente"
```

### 3️⃣ Reactivar Tarea

```
Usuario → Tab "Completadas" → Click ↺
→ PUT /api/tasks/:id con status: "pending"
→ Backend limpia completedBy y completedAt
→ Retorna tarea actualizada
→ React Query mueve a tab "Pendientes"
→ Toast "Tarea actualizada exitosamente"
```

### 4️⃣ Eliminar Tarea

```
Usuario → Click ✕ → Confirmación "¿Eliminar?"
→ DELETE /api/tasks/:id
→ Backend elimina documento
→ React Query invalida cache
→ Lista se actualiza automáticamente
→ Toast "Tarea eliminada exitosamente"
```

### 5️⃣ Ver en Dashboard

```
Sistema → Carga página Home
→ useGetPendingTasks() obtiene tareas pendientes
→ Si hay pendientes → Muestra TaskWidget
→ Usuario hace click → Link a /todolist
→ Redirect automático a página de tareas
```

---

## 📊 Datos Mostrados

### Información de Tarea

| Campo       | Tipo   | Ejemplo                               |
| ----------- | ------ | ------------------------------------- |
| title       | String | "Revisar inventario de bebidas"       |
| description | String | "Verificar bebidas de alta rotación"  |
| priority    | Enum   | "high", "medium", "low"               |
| status      | Enum   | "pending", "completed"                |
| createdBy   | User   | { username: "admin", email: "..." }   |
| completedBy | User   | { username: "gerente", email: "..." } |
| createdAt   | Date   | 2026-08-20T10:30:00Z                  |
| completedAt | Date   | 2026-08-20T14:45:00Z                  |

### Vista de Usuario

```
[TAREA]
Revisar inventario de bebidas    [ALTA]
Verificar bebidas de alta rotación
Por: admin                        2026-08-20
[✓] [✕]
```

---

## 🔒 Seguridad

- ✅ **Autenticación:** Todos los endpoints requieren JWT (verifyToken)
- ✅ **Autorización:** Usuario autenticado ID se guarda como creador
- ✅ **Validación:** Backend valida título requerido
- ✅ **Sanitización:** Mongoose schema con tipos estrictos

---

## 📱 Responsive Design

### Mobile (< 480px)

- Form inputs en una sola columna
- Prioridad badge debajo del título
- Acciones apiladas
- Tabs con ancho completo

### Tablet (480-768px)

- Form inputs en grid 2 columnas
- Tareas compactas
- Sidebar opcional

### Desktop (> 1024px)

- Form inputs en una fila
- Tareas expandidas
- Widget con hover effects

---

## 🚀 Integración con Sistema Existente

### 1. Backend Integration

✅ Agregado en `/api/tasks`
✅ Usa middleware `verifyToken` existente
✅ Sigue estructura de controladores/modelos/rutas
✅ Integrado en `server.js`

### 2. Frontend Integration

✅ Componente reutilizable en dashboard
✅ Página dedicada `/todolist`
✅ Usa axios instance existente
✅ React Query para state management
✅ Estilos minimalistas integrados

### 3. UI Consistency

✅ Usa CSS global de `inventory.css`
✅ Estilos minimalistas y responsivos
✅ Paleta de colores consistente
✅ Toast notifications con react-hot-toast

---

## 📁 Archivos Creados

### Backend

```
src/
├── models/
│   └── Tasks.models.js         # Modelo de datos
├── controllers/
│   └── Tasks.controllers.js    # Lógica de negocio
├── routes/
│   └── Tasks.routes.js         # Endpoints API
```

### Frontend

```
src/
├── services/
│   └── tasks.services.js       # Llamadas API
├── features/
│   └── tasks.features.js       # React Query hooks
├── pages/
│   └── todolist/
│       ├── TodoList.jsx        # Página principal
│       └── styles/
│           └── todolist.css    # Estilos
├── components/
│   └── home/
│       ├── TaskWidget.jsx      # Widget dashboard
│       └── styles/
│           └── taskWidget.css  # Estilos widget
```

---

## ✅ Testing Checklist

- ✓ Backend: No errores de compilación
- ✓ Frontend: No errores de compilación
- ✓ Crear tarea: Funciona correctamente
- ✓ Listar pendientes: Muestra datos
- ✓ Marcar completada: Status cambia
- ✓ Reactivar tarea: Vuelve a pendiente
- ✓ Eliminar tarea: Se elimina de BD
- ✓ Dashboard widget: Se muestra si hay pendientes
- ✓ Link a página: Funciona el redirect
- ✓ Responsive: Funciona en móvil/tablet/desktop

---

## 🎯 Características Finales

| Feature              | Status | Detalles                                |
| -------------------- | ------ | --------------------------------------- |
| Crear tareas         | ✅     | Con prioridad y descripción             |
| Ver pendientes       | ✅     | Tab dedicado                            |
| Ver completadas      | ✅     | Tab dedicado con info de quién completó |
| Marcar completada    | ✅     | Botón ✓                                 |
| Reactivar            | ✅     | Botón ↺ en completadas                  |
| Eliminar             | ✅     | Botón ✕ con confirmación                |
| Dashboard widget     | ✅     | Muestra resumen de pendientes           |
| Filtro por prioridad | ✅     | Al crear se selecciona                  |
| Info de usuario      | ✅     | Muestra quién creó/completó             |
| Responsive           | ✅     | Mobile-first design                     |
| Minimalista          | ✅     | Interfaz limpia                         |

---

## 🎉 Estado: COMPLETADO

Sistema de tareas totalmente funcional e integrado con:

- ✅ Backend API completamente operacional
- ✅ Frontend con página dedicada y widget
- ✅ Gestión de estado con React Query
- ✅ UI minimalista y responsiva
- ✅ Autenticación y seguridad

¡Listo para usar en producción! 🚀
