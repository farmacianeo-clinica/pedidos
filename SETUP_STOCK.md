# Stock y contabilidad (opcional) — Google Sheets + Apps Script

Esto agrega un descuento automático de stock y un historial de movimientos, sin que la persona que hace el pedido pueda verlo: vive en una Google Sheet propia, y el acceso se controla compartiendo esa Sheet solo con quien corresponda (vos, farmacia, depósito).

Si no configurás esto, la app funciona exactamente igual que antes (formulario + WhatsApp/correo). Es un agregado 100% opcional.

## 1. Crear la Google Sheet

1. Andá a [sheets.google.com](https://sheets.google.com) y creá una planilla nueva. Nombrala, por ejemplo, **"Neoclínica · Stock y Pedidos"**.
2. Renombrá la primera hoja (pestaña de abajo) a `Stock`.
3. Creá una segunda hoja (botón `+` abajo) y llamala `Movimientos`.

### Hoja `Stock`

Necesita estas columnas exactas en la fila 1:

```
id | nombre | unidad | categoria | tipo | stock_actual
```

Para no cargar todo a mano: abrí el archivo `apps-script/stock-inicial.csv` (incluido en esta carpeta) con Excel/Sheets y copiá todas las filas, o importalo directamente desde Google Sheets con **Archivo → Importar → Subir**. Ese CSV ya trae los **711 ítems reales** (descartables, suturas y medicamentos) sacados de tu archivo `FARMACIA_2026_-_OK_viejop.xlsx`, con el `stock_actual` que figuraba ahí — como aclaraste que esas cantidades están desactualizadas, revisalas y corregilas por las cantidades reales de hoy antes de darle uso al sistema.

**Importante:** el `id` de cada fila tiene que ser idéntico al `id` que ese mismo ítem tiene en `data/descartables.csv` / `data/medicamentos.csv` (el archivo `stock-inicial.csv` ya usa esos mismos ids, generados a partir del código interno de Neoclínica — ej. `c278`). Si agregás un ítem nuevo en esos catálogos, agregá también su fila acá con el mismo `id` — si no, ese ítem no descuenta stock (igual queda registrado en `Movimientos`, solo que sin vincular al stock).

Los ítems que alguien agregue a mano con "+ Agregar ítem manualmente" nunca van a descontar stock (no tienen `id` de catálogo), pero sí quedan anotados en `Movimientos` para que los veas.

### Hoja `Movimientos`

Cargá esta fila de encabezados:

```
fecha_hora | pedido_id | tipo | sector | paciente | solicitante | prioridad | item_id | item_nombre | cantidad | stock_resultante | observaciones
```

El script va a ir agregando una fila por cada ítem pedido, automáticamente. Ahí queda la "contabilidad": quién pidió, qué, cuándo, y en cuánto quedó el stock después de ese pedido.

## 2. Cargar el script

1. En la Sheet, andá a **Extensiones → Apps Script**.
2. Borrá el contenido de `Código.gs` y pegá el contenido completo del archivo `Code.gs` (incluido en esta carpeta).
3. Cambiá esta línea, poniendo una clave propia (lo que quieras, sin espacios):

   ```js
   const SECRETO = "CAMBIAR_ESTA_CLAVE";
   ```

4. Guardá (ícono de disquete o `Ctrl+S`).

## 3. Publicar como aplicación web

1. Arriba a la derecha, **Implementar → Nueva implementación**.
2. Tipo: **Aplicación web**.
3. "Ejecutar como": **Yo** (tu cuenta).
4. "Quién tiene acceso": **Cualquier usuario**.
5. Autorizá los permisos que pida Google (es tu propia Sheet, es seguro).
6. Copiá la **URL de la aplicación web** que te da al finalizar — termina en `/exec`.

## 4. Conectarlo con el formulario

En `index.html`, dentro de `CONFIG`, completá:

```js
appsScriptUrl: "PEGAR_ACÁ_LA_URL_QUE_TERMINA_EN_/exec",
secreto: "LA_MISMA_CLAVE_QUE_PUSISTE_EN_EL_SCRIPT",
```

Subí el cambio al repositorio y listo: a partir de ahí, cada pedido enviado (por WhatsApp o correo) también manda silenciosamente el detalle a la Sheet y descuenta el stock. La persona que carga el pedido no ve ni nota nada distinto.

## 5. Compartir el stock con farmacia/depósito

Desde la Google Sheet, botón **Compartir** (arriba a la derecha) → agregá los emails de las personas que necesitan verla, con permiso de **Editor** (así pueden ajustar el stock cuando repongan) o **Lector** si solo necesitan consultarlo. Quien hace los pedidos no necesita —ni debería tener— acceso a esta Sheet.

## Notas y límites

- Si en algún momento cambiás la clave `SECRETO` en el script, actualizá también `CONFIG.secreto` en `index.html` (tienen que coincidir siempre).
- El envío del registro de stock es "silencioso": si por algún motivo falla (sin internet, Sheet mal configurada, etc.) el pedido igual se manda por WhatsApp/correo con normalidad — no se pierde el pedido, en el peor caso no se descuenta el stock de esa vez y podés ajustarlo a mano en la Sheet.
- Cada reposición de stock (cuando llega mercadería) se carga a mano en la columna `stock_actual` de la hoja `Stock` — el sistema solo resta cuando se pide, no suma automáticamente.
- Si con el tiempo quieren algo más avanzado (alertas de stock mínimo, reportes, gráficos), la Google Sheet ya te sirve de base: se puede armar todo eso directamente ahí con fórmulas o Apps Script adicional.
