import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { orders } from '../../checkout/route';

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

  // Header - Green bar
  doc.setFillColor(27, 94, 32);
  doc.rect(0, 0, 210, 35, 'F');

  // Logo circle
  doc.setFillColor(255, 214, 0);
  doc.circle(25, 17, 10, 'F');
  doc.setTextColor(27, 94, 32);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Q', 22, 21);

  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('QuetzalMart', 40, 15);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Tu supermercado en línea', 40, 22);
  doc.text('Guatemala | México | El Salvador', 40, 28);

  // Invoice title
  doc.setTextColor(27, 94, 32);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURA', 15, 50);

  // Invoice details
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text(`No. Factura: ${order.transaction_id}`, 130, 45);
  doc.text(`Fecha: ${new Date(order.date as string).toLocaleDateString('es-GT')}`, 130, 52);
  doc.text(`Método de pago: ${order.payment_method}`, 130, 59);

  // Customer info
  doc.setDrawColor(27, 94, 32);
  doc.setLineWidth(0.5);
  doc.line(15, 55, 110, 55);

  doc.setTextColor(33, 33, 33);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Datos del Cliente', 15, 63);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Nombre: ${customer.name}`, 15, 70);
  doc.text(`NIT: ${customer.nit || 'CF'}`, 15, 77);
  doc.text(`Email: ${customer.email}`, 15, 84);
  doc.text(`Teléfono: ${customer.phone}`, 15, 91);
  doc.text(`Dirección: ${customer.address}`, 15, 98);

  // Products table
  autoTable(doc, {
    startY: 108,
    head: [['#', 'Código', 'Producto', 'Cant.', 'Precio Unit.', 'Subtotal']],
    body: items.map((item, i) => [
      (i + 1).toString(),
      item.internal_ref || '',
      item.name,
      item.quantity.toString(),
      `Q ${item.price.toFixed(2)}`,
      `Q ${(item.price * item.quantity).toFixed(2)}`,
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: [27, 94, 32],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [33, 33, 33],
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { cellWidth: 25 },
      3: { halign: 'center', cellWidth: 15 },
      4: { halign: 'right', cellWidth: 28 },
      5: { halign: 'right', cellWidth: 28 },
    },
  });

  // Totals
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', 140, finalY);
  doc.text(`Q ${(order.subtotal as number).toFixed(2)}`, 185, finalY, { align: 'right' });

  doc.text('IVA (12%):', 140, finalY + 7);
  doc.text(`Q ${(order.tax as number).toFixed(2)}`, 185, finalY + 7, { align: 'right' });

  doc.text('Envío:', 140, finalY + 14);
  doc.text(`Q ${(order.shipping as number).toFixed(2)}`, 185, finalY + 14, { align: 'right' });

  doc.setDrawColor(27, 94, 32);
  doc.setLineWidth(0.5);
  doc.line(140, finalY + 18, 195, finalY + 18);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 94, 32);
  doc.text('TOTAL:', 140, finalY + 26);
  doc.text(`Q ${(order.total as number).toFixed(2)}`, 185, finalY + 26, { align: 'right' });

  // Footer
  doc.setFillColor(27, 94, 32);
  doc.rect(0, 275, 210, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('QuetzalMart S.A. — NIT: 12345678-9 — info@quetzalmart.gt — +502 2345-6789', 105, 283, { align: 'center' });
  doc.text('Gracias por tu compra. Este documento es una factura electrónica válida.', 105, 289, { align: 'center' });

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=Factura_${orderId}.pdf`,
    },
  });
}
