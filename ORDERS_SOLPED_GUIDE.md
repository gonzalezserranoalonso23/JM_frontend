# 📋 Sistema de Solicitudes de Pedido (SOLPED) - Guía de Uso

## ¿Qué es un SOLPED?

Un **SOLPED** (Solicitud de Pedido) es un documento formal que utilizas para:

- ✅ Registrar qué productos deseas comprar a proveedores
- ✅ Especificar cantidades y precios
- ✅ Generar un documento que pueda ser impreso y enviado
- ✅ Mantener un historial de todas tus solicitudes

---

## 🚀 Cómo Usar el Sistema

### Crear una Nueva Solicitud de Pedido

1. **Ir a la sección Orders (Órdenes)**
   - Desde el menú, selecciona **Orders**

2. **Hacer clic en "+ Nueva Solicitud"**
   - Se abrirá un modal con el formulario

3. **Llenar los Datos Principales**
   - **Fecha**: Día de la solicitud (automático con la fecha actual)
   - **Proveedor**: Selecciona el proveedor de la lista

4. **Agregar Productos**
   - Selecciona el **Producto** de la lista
   - Ingresa la **Cantidad** deseada
   - El **Precio Unitario** se carga automáticamente
   - Haz clic en **Agregar**

5. **Revisar Productos Agregados**
   - Verás una lista con todos los productos
   - El **Total** se calcula automáticamente
   - Puedes eliminar (✕) productos si cambias de opinión

6. **Crear la Solicitud**
   - Haz clic en **"Crear Solicitud de Pedido"**
   - ✅ La solicitud se guardará

---

## 📄 Ver e Imprimir SOLPED

### Ver el Documento

1. **En la tabla de solicitudes**, busca la que deseas ver
2. **Haz clic en el icono 🖨️** (Imprimir)
3. Se abrirá una ventana con el **SOLPED formateado**

### Características del SOLPED

El documento muestra:

- 📌 **Número de Solicitud** único
- 📅 **Fecha** de creación
- 🏢 **Datos del Proveedor**
- 📊 **Tabla de Productos** con:
  - Nombre del producto
  - Cantidad solicitada
  - Precio unitario
  - Subtotal
- 💰 **Monto Total**
- 📋 **Estado** (Pendiente, Confirmado, etc.)

### Imprimir

1. **Desde la ventana del SOLPED**, haz clic en **"🖨️ Imprimir"**
2. Se abrirá el diálogo de impresión de tu navegador
3. Elige tu impresora y haz clic en **Imprimir**
4. También puedes guardar como PDF

---

## 📊 Tabla de Solicitudes

### Información Mostrada

| Columna          | Descripción                           |
| ---------------- | ------------------------------------- |
| **Nº Solicitud** | Número único del SOLPED               |
| **Proveedor**    | Nombre del proveedor                  |
| **Productos**    | Cantidad de productos en la solicitud |
| **Total**        | Monto total del pedido                |
| **Estado**       | Pendiente / Confirmado / Completado   |
| **Fecha**        | Fecha de creación                     |
| **Acciones**     | Ver (🖨️) o Eliminar (✕)               |

### Estados

- 🟡 **Pendiente**: Solicitud creada, esperando confirmación
- ✅ **Confirmado**: Proveedor ha confirmado
- ✅ **Completado**: Pedido recibido
- ❌ **Cancelado**: Solicitud cancelada

---

## 🎯 Casos de Uso

### Caso 1: Compra Regular de Productos

1. Crear solicitud para "Papelería ABC"
2. Agregar: 100 cuadernos, 50 lapiceros, 10 cajas de clips
3. Ver el SOLPED para revisar montos
4. Imprimir y enviar al proveedor

### Caso 2: Reabastecimiento de Stock

1. Desde **Home** (Dashboard), ver productos con stock bajo
2. Ir a **Orders**
3. Crear solicitud para reabastecer esos productos
4. Imprimir y gestionar con el proveedor

### Caso 3: Seguimiento de Pedidos

1. En la tabla, ver todas las solicitudes
2. Identificar por **Estado** cuáles están:
   - Pendientes (en espera de confirmación)
   - Confirmadas (en camino)
   - Completadas (ya recibidas)
3. Usar esta información para gestión del inventario

---

## ✨ Características Minimalistas

El sistema está diseñado para ser **simple y directo**:

✅ **Interfaz limpia** - Sin distracciones innecesarias
✅ **Tabla compacta** - Solo información esencial visible
✅ **Modal eficiente** - Formulario rápido y fácil de llenar
✅ **SOLPED profesional** - Documento listo para imprimir
✅ **Responsive** - Funciona en móvil, tablet y desktop

---

## 🔧 Detalles Técnicos

### Datos Almacenados

Cada solicitud guarda:

- Fecha de creación
- Proveedor referenciado
- Items (productos con cantidad y precio)
- Monto total
- Estado
- Fecha de creación (para auditoría)

### Validaciones

- ✅ Requiere al menos un producto
- ✅ Requiere proveedor seleccionado
- ✅ Calcula automáticamente totales
- ✅ Previene datos incompletos

### Generación de SOLPED

El documento se genera dinámicamente con:

- Números formateados
- Fechas legibles
- Tabla profesional
- Estilos para impresión optimizados

---

## 📞 Troubleshooting

### "No puedo ver el SOLPED"

- Asegúrate de que la solicitud fue creada correctamente
- Intenta recargar la página
- Verifica que el proveedor tenga datos

### "El SOLPED se ve mal al imprimir"

- Usa **Chrome** o **Edge** para mejor compatibilidad
- Ajusta márgenes a "Mínimo" en preferencias de impresión
- Intenta guardar como PDF primero

### "No aparecen los productos en el dropdown"

- Asegúrate de que hay productos registrados en la sección Products
- Verifica que los productos tengan proveedor asignado

---

## 🚀 Próximas Mejoras (Opcionales)

- Enviar SOLPED por email directamente
- Exportar a PDF automáticamente
- Historial de confirmaciones
- Recordatorios de órdenes pendientes
- QR en SOLPED para seguimiento

¡Sistema listo para usar! 📋✨
