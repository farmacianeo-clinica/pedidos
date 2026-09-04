/**
 * Neoclínica · Pedido de Insumos
 * Backend simple sobre Google Sheets para descontar stock y llevar
 * el historial de movimientos (contabilidad) de cada pedido.
 *
 * Instalación: ver SETUP_STOCK.md
 */

// Tiene que ser EXACTAMENTE la misma palabra que CONFIG.secreto en index.html
const SECRETO = "CAMBIAR_ESTA_CLAVE";

const HOJA_STOCK = "Stock";
const HOJA_MOVIMIENTOS = "Movimientos";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.secreto !== SECRETO) {
      return responder({ ok: false, error: "Clave secreta inválida" });
    }

    const pedido = data.pedido;
    if (!pedido || !Array.isArray(pedido.items)) {
      return responder({ ok: false, error: "Pedido inválido" });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const stockSheet = ss.getSheetByName(HOJA_STOCK);
    const movSheet = ss.getSheetByName(HOJA_MOVIMIENTOS);

    if (!stockSheet || !movSheet) {
      return responder({ ok: false, error: "Faltan las hojas 'Stock' y/o 'Movimientos'" });
    }

    const stockData = stockSheet.getDataRange().getValues();
    const headers = stockData[0];
    const idCol = headers.indexOf("id");
    const stockCol = headers.indexOf("stock_actual");
    const timestamp = new Date();

    pedido.items.forEach(function (item) {
      let stockResultante = "";

      if (item.id && idCol !== -1 && stockCol !== -1) {
        for (let r = 1; r < stockData.length; r++) {
          if (String(stockData[r][idCol]) === String(item.id)) {
            const actual = Number(stockData[r][stockCol]) || 0;
            const nuevo = Math.max(0, actual - Number(item.cantidad || 0));
            stockSheet.getRange(r + 1, stockCol + 1).setValue(nuevo);
            stockData[r][stockCol] = nuevo; // por si el mismo pedido repite el ítem
            stockResultante = nuevo;
            break;
          }
        }
      }

      movSheet.appendRow([
        timestamp,
        pedido.id || "",
        pedido.tipo || "",
        pedido.sector || "",
        pedido.paciente || "",
        pedido.solicitante || "",
        pedido.prioridad || "",
        item.id || "(manual)",
        item.nombre || "",
        item.cantidad || 0,
        stockResultante,
        pedido.observaciones || "",
      ]);
    });

    return responder({ ok: true });
  } catch (err) {
    return responder({ ok: false, error: String(err) });
  }
}

// Permite probar rápido desde el navegador que la implementación está viva.
function doGet(e) {
  return responder({ ok: true, mensaje: "Servicio de stock de Neoclínica activo." });
}

function responder(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
