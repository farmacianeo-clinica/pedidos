# Pedido de Insumos · Neoclínica

Formulario web para pedidos internos de **descartables** (por sector) y **medicamentos** (por paciente), inspirado en el sistema de CIMA. Es una sola página (`index.html`), sin backend: los pedidos se envían por WhatsApp o correo, y quedan también guardados localmente en el navegador (últimos 10 días) para llevar el control de pendientes/entregados.

## Datos de contacto (WhatsApp / correo)

Ya están cargados los datos reales dentro de `CONFIG`, cerca del inicio del `<script>`:

```js
const CONFIG = {
  institucion: "Neoclínica",
  whatsappNumero: "5493584394483",
  emailDestino: "farmacianeoclinica@gmail.com",
  historialDias: 10,
};
```

Si en algún momento cambian el número o el mail, se editan ahí directamente (el WhatsApp lleva código de país + código de área, sin '+', ni espacios ni guiones).

## Sectores

La lista de `SECTORES` ya incluye los que mencionaste (Quirófano, Esterilización, Endoscopía, Quirófano 5to piso, 5to piso, Clínica médica 1 y 2, Maternidad, 4to piso, UTI Neo, Pediatría, UTI adultos, Oncología, Guardia, Lavadero, Laboratorio). Si aparecen más, se agregan como un string más dentro del array `SECTORES`.

## Catálogos (ya cargados con datos reales)

Los catálogos **no están escritos en el código**: la app los carga en el momento desde dos archivos CSV en la carpeta `data/`:

- `data/descartables.csv` → **448 ítems reales** (387 descartables + 61 suturas), tomados de tu archivo `FARMACIA_2026_-_OK_viejop.xlsx`.
- `data/medicamentos.csv` → **263 medicamentos reales**, del mismo archivo.

Cada fila tiene:

```
id,nombre,presentacion,unidad,categoria[,tipo_origen]
```

- `id`: se armó a partir del **código interno** que ya usa Neoclínica (ej. `c278` = código 278). Así, si en algún momento quieren integrar esto con el sistema de farmacia real, el vínculo ya existe.
- `nombre`: la descripción del insumo/medicamento, limpia del prefijo "A-" que traía la planilla.
- `presentacion`: la presentación comercial (ej. "ADRENALINA BIOL 1o/oo a.x 10 x 1 ml"), se muestra en letra chica debajo del nombre cuando existe.
- `unidad`: se estimó automáticamente para medicamentos (amp/comp/frasco/pomo) y quedó en "un" para el resto — **conviene repasarla y corregirla** a mano donde haga falta, abriendo el CSV en Excel o Google Sheets.
- `categoria`: se agrupó por la primera letra del nombre (para poder navegar la lista larga), y "Suturas" quedó como categoría aparte dentro de Descartables.

### Cómo actualizar el listado más adelante

1. Abrí el CSV correspondiente con Excel o Google Sheets.
2. Agregá, editá o borrá filas (mantené las columnas y el nombre exacto de los encabezados).
3. Guardá/exportá de nuevo como **CSV UTF-8** (en Excel: "Guardar como" → CSV UTF-8; en Sheets: Archivo → Descargar → CSV).
4. Reemplazá el archivo en `data/` del repositorio y subí el cambio — no hace falta tocar `index.html` para nada de esto.

**Importante:** esta carga por `fetch()` solo funciona sirviendo la página por http (GitHub Pages, o un servidor local) — si abrís `index.html` haciendo doble clic desde la compu, el navegador bloquea la lectura de los CSV y el catálogo queda vacío con un aviso.

También se puede seguir agregando cualquier ítem que falte con el botón **"+ Agregar ítem manualmente"** dentro del formulario mismo, sin tocar ningún archivo.

## Logo

Ya está integrado: `logo.png` (el isotipo verde de Neoclínica) va en la raíz del repositorio, junto a `index.html`, y el header lo referencia directamente. El verde de marca (`#3AAD2A`) también se usó como color principal de toda la app. Si en algún momento cambian el logo, solo hay que reemplazar `logo.png` por el archivo nuevo (mismo nombre) — no hace falta tocar el código.

## Publicar en GitHub Pages

Desde la carpeta de este proyecto:

```bash
git init
git remote add origin https://github.com/farmacianeo-clinica/pedidos.git
git add .
git commit -m "Formulario de pedido de insumos"
git branch -M main
git push -u origin main
```

Después, en GitHub: **Settings → Pages → Deploy from a branch → main / (root)**. Va a quedar publicado en algo como:

```
https://farmacianeo-clinica.github.io/pedidos/
```

## Stock y contabilidad (opcional)

La app puede descontar stock automáticamente y llevar un historial de movimientos en una Google Sheet propia, sin que la persona que hace el pedido lo vea. Es un agregado opcional — ver **`SETUP_STOCK.md`** para el paso a paso (incluye el script `apps-script/Code.gs` y un `apps-script/stock-inicial.csv` para arrancar rápido).

## Notas

- Los pedidos "enviados" se guardan en el `localStorage` del navegador donde se cargan — es decir, el historial es **por dispositivo**, no compartido entre usuarios. Si varias personas cargan pedidos desde distintos celulares, cada uno ve solo los suyos en el botón 📬.
- No hay backend ni base de datos: la app arma el texto del pedido y abre WhatsApp o el cliente de correo con el resumen precargado para que quien pide simplemente confirme el envío.
- Si más adelante quieren centralizar los pedidos entre varios dispositivos, el siguiente paso natural sería sumar una hoja de cálculo (Google Sheets) o una base simple como backend.
