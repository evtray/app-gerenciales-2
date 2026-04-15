import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { orders } from '../../checkout/route';

const LOGO_BASE64 = (() => {
  try {
    const buf = readFileSync(join(process.cwd(), 'public', 'logoquetzalmart.jpeg'));
    return `data:image/jpeg;base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
})();

const fmtQ = (n: number) => `${n.toFixed(2).replace('.', ',')} Q`;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  const order = orders.get(orderId);
  if (!order) {
    return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
  }

  const doc = new jsPDF();
  const items = order.items as Array<{ name: string; quantity: number; price: number; internal_ref: string }>;
  const customer = order.customer as { name: string; email: string; phone: string; address: string; nit: string };

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginL = 15;
  const marginR = 15;

  // Logo (top-left)
  if (LOGO_BASE64) {
    doc.addImage(LOGO_BASE64, 'JPEG', marginL, 12, 30, 30);
  }

  // Company info (top-right)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(33, 33, 33);
  doc.text('QuetzalMart', pageW - marginR, 18, { align: 'right' });
  doc.text('Guatemala', pageW - marginR, 24, { align: 'right' });

  // Customer name (right-aligned, above title)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(customer.name || '', pageW - marginR, 62, { align: 'right' });

  // Title
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(22);
  doc.setTextColor(170, 170, 170);
  doc.text(`FACTURA ${order.transaction_id}`, marginL, 80);

  // Fecha / Referencia
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(33, 33, 33);
  doc.text('Fecha', marginL, 92);
  doc.text('Referencia', marginL + 70, 92);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(order.date as string).toLocaleDateString('es-GT'), marginL, 98);
  doc.text(String(order.transaction_id), marginL + 70, 98);

  // Products table
  autoTable(doc, {
    startY: 108,
    head: [['DESCRIPCIÓN', 'CANTIDAD', 'PRECIO UNITARIO', 'IMPUESTOS', 'IMPORTE']],
    body: items.map((item) => [
      `[${item.internal_ref || ''}] ${item.name}`,
      item.quantity.toFixed(2).replace('.', ','),
      item.price.toFixed(2).replace('.', ','),
      'IVA por Cobrar',
      fmtQ(item.price * item.quantity),
    ]),
    theme: 'plain',
    styles: {
      fontSize: 9,
      textColor: [33, 33, 33],
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [80, 80, 80],
      fontStyle: 'bold',
      fontSize: 9,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 65 },
      1: { halign: 'right', cellWidth: 25 },
      2: { halign: 'right', cellWidth: 35 },
      3: { halign: 'center', cellWidth: 30 },
      4: { halign: 'right', cellWidth: 25 },
    },
    margin: { left: marginL, right: marginR },
  });

  // Totals block (right-aligned, Odoo-style)
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;
  const totalsX = pageW - marginR - 80;
  const labelX = totalsX + 2;
  const valueX = pageW - marginR - 2;
  let y = finalY;
  const rowH = 8;

  const drawRow = (label: string, value: string, opts: { bold?: boolean; highlight?: boolean; italic?: boolean } = {}) => {
    if (opts.highlight) {
      doc.setFillColor(196, 178, 134);
      doc.rect(totalsX, y - 5.5, 80, rowH, 'F');
      doc.setTextColor(255, 255, 255);
    } else {
      doc.setTextColor(33, 33, 33);
    }
    doc.setFont('helvetica', opts.italic ? 'italic' : opts.bold ? 'bold' : 'normal');
    doc.setFontSize(10);
    doc.text(label, labelX, y);
    doc.text(value, valueX, y, { align: 'right' });
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.1);
    doc.line(totalsX, y + 2.5, totalsX + 80, y + 2.5);
    y += rowH;
  };

  drawRow('Subtotal', fmtQ(order.subtotal as number));
  drawRow('IVA 12%', fmtQ(order.tax as number));
  if ((order.shipping as number) > 0) {
    drawRow('Envío', fmtQ(order.shipping as number));
  }
  drawRow('Total', fmtQ(order.total as number), { bold: true, highlight: true });
  drawRow(
    `Pagado el ${new Date(order.date as string).toLocaleDateString('es-GT')}`,
    fmtQ(order.total as number),
    { italic: true }
  );
  drawRow('Cantidad por pagar', fmtQ(0), { bold: true });

  // Footer
  const footerY = pageH - 15;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(marginL, footerY - 5, pageW - marginR, footerY - 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`${customer.nit || 'CF'}  ${customer.email || ''}`, marginL, footerY);
  doc.text('Página 1 / 1', pageW - marginR, footerY, { align: 'right' });

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=Factura_${orderId}.pdf`,
    },
  });
}
