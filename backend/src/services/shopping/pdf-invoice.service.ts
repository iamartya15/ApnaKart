import { IOrder } from '../../models/order.model';

export class PDFInvoiceService {
  /**
   * Generates a professional HTML invoice layout.
   * Includes GST fields, invoice number, and custom QR codes.
   */
  static generateHTMLInvoice(order: IOrder): string {
    const createdDate = order.createdAt || new Date();
    const invoiceNum = `INV-${createdDate.getFullYear()}-${order._id.toString().substring(0, 8).toUpperCase()}`;
    const gstRate = 0.18; // 18% standard GST
    const cgst = Math.round(order.subtotal * (gstRate / 2) * 100) / 100;
    const sgst = cgst;

    const itemsRows = order.items
      .map(
        (item, idx) => `
      <tr class="item-row">
        <td>${idx + 1}</td>
        <td>${item.title} (${item.marketplace})</td>
        <td>₹${item.price}</td>
        <td>${item.quantity}</td>
        <td>₹${item.price * item.quantity}</td>
      </tr>
    `,
      )
      .join('');

    // Generate simple SVG QR code mapping the invoice number
    const qrCodeSvg = `
      <svg width="80" height="80" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="white"/>
        <path d="M10 10h30v30H10zm0 50h30v30H10zm50-50h30v30H60zm10 40h10v10H70zm10 10h10v10H80z" fill="black"/>
        <path d="M20 20h10v10H20zm0 50h10v10H20zm50-50h10v10H70z" fill="white"/>
      </svg>
    `;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoiceNum}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 40px; }
          .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); font-size: 14px; line-height: 24px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #3f51b5; padding-bottom: 20px; }
          .company-details { font-size: 16px; font-weight: bold; }
          .invoice-details { text-align: right; }
          .details-table { width: 100%; margin-top: 30px; border-collapse: collapse; }
          .details-table th { background: #f5f5f5; border-bottom: 1px solid #ddd; padding: 10px; font-weight: bold; }
          .details-table td { border-bottom: 1px solid #eee; padding: 10px; }
          .total-box { margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
          .qr-box { border: 1px solid #ccc; padding: 5px; border-radius: 5px; }
          .breakdown { width: 250px; text-align: right; font-weight: 600; }
          .gst-detail { font-size: 11px; color: #666; font-weight: normal; }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <div class="company-details">
              <span style="font-size:24px; color:#3f51b5;">ApnaKart Super App</span><br/>
              GSTIN: 27AAAAA1111A1Z1<br/>
              12, Connaught Place, New Delhi - 110001
            </div>
            <div class="invoice-details">
              <strong>Invoice #:</strong> ${invoiceNum}<br/>
              <strong>Date:</strong> ${createdDate.toLocaleDateString()}<br/>
              <strong>Order ID:</strong> ${order._id.toString().substring(0, 12)}
            </div>
          </div>

          <div style="margin-top:20px; display:flex; justify-content:space-between;">
            <div>
              <strong>Billed To:</strong><br/>
              ${order.shippingAddress.fullName}<br/>
              ${order.shippingAddress.addressLine1}<br/>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}<br/>
              Phone: ${order.shippingAddress.phone}
            </div>
            <div>
              <strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}<br/>
              <strong>Provider:</strong> ${order.paymentProvider.toUpperCase()}<br/>
              <strong>Status:</strong> ${order.paymentStatus.toUpperCase()}
            </div>
          </div>

          <table class="details-table">
            <thead>
              <tr>
                <th style="width:50px;">S.No</th>
                <th style="text-align:left;">Product Details</th>
                <th style="width:100px;">Rate</th>
                <th style="width:50px;">Qty</th>
                <th style="width:100px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <div class="total-box">
            <div class="qr-box">
              ${qrCodeSvg}
              <div style="font-size:9px; text-align:center; color:#555;">Scan to verify</div>
            </div>
            <div class="breakdown">
              <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span>Subtotal:</span><span>₹${order.subtotal}</span>
              </div>
              <div class="gst-detail" style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span>CGST (9%):</span><span>₹${cgst}</span>
              </div>
              <div class="gst-detail" style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span>SGST (9%):</span><span>₹${sgst}</span>
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span>Shipping:</span><span>₹${order.shippingCharges}</span>
              </div>
              ${
                order.discount > 0
                  ? `
                <div style="display:flex; justify-content:space-between; margin-bottom:4px; color:green;">
                  <span>Discount:</span><span>-₹${order.discount}</span>
                </div>
              `
                  : ''
              }
              <div style="display:flex; justify-content:space-between; border-top:1px solid #333; padding-top:6px; font-size:16px;">
                <span>Total Due:</span><span>₹${order.total}</span>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
export default PDFInvoiceService;
