import logo from "../assets/logo.jpeg";

interface Item {
  name: string;
  quantity: number;
  price: number;
}

interface ReturnReceiptData {
  invoiceNumber: string;
  newInvoiceNumber?: string;

  returnedItems: Item[];
  replacementItems: Item[];

  returnedTotal: number;
  replacementTotal: number;
  balance: number;

  reason?: string;
  customerName?: string;
  customerPhone?: string;
}

export const printReturnReceipt = (data: ReturnReceiptData) => {
  const win = window.open("", "_blank", "width=400,height=650");
  if (!win) return;

  const html = `
  <html>
  <head>
    <title>Return Receipt</title>

    <style>
      body {
        font-family: monospace;
        padding: 10px;
        font-size: 12px;
      }

      .center { text-align: center; }
      .row { display: flex; justify-content: space-between; }
      .bold { font-weight: bold; }

      hr {
        border: none;
        border-top: 1px dashed #000;
        margin: 8px 0;
      }

      .logo {
        width: 80px;
        height: auto;
      }

      .green { color: green; }
      .red { color: red; }

      .footer {
        margin-top: 15px;
        text-align: center;
        font-size: 11px;
      }
    </style>
  </head>

  <body>

    <!-- HEADER -->
    <div class="center">
      <img src="${logo}" class="logo" />
      <h3>MYL POS SYSTEM</h3>
      <div>RETURN / EXCHANGE RECEIPT</div>
    </div>

    <hr />

    <!-- INVOICE INFO -->
    <div>
      <div class="row">
        <span>Invoice</span>
        <span>${data.invoiceNumber}</span>
      </div>

      ${data.newInvoiceNumber
      ? `<div class="row"><span>New Invoice</span><span>${data.newInvoiceNumber}</span></div>`
      : ""
    }

      ${data.customerName
      ? `<div class="row"><span>Customer</span><span>${data.customerName}</span></div>`
      : ""
    }

      ${data.customerPhone
      ? `<div class="row"><span>Phone</span><span>${data.customerPhone}</span></div>`
      : ""
    }

      ${data.reason
      ? `<div class="row"><span>Reason</span><span>${data.reason}</span></div>`
      : ""
    }
    </div>

    <hr />

    <!-- RETURN ITEMS -->
    <div class="bold">RETURNED ITEMS (-)</div>
    ${data.returnedItems
      .map(
        (i) => `
      <div class="row red">
        <span>${i.name} (${i.quantity} x ${i.price})</span>
        <span>- ${i.quantity * i.price}</span>
      </div>
    `
      )
      .join("")}

    <hr />

    <!-- REPLACEMENT ITEMS -->
    <div class="bold">REPLACEMENT ITEMS (+)</div>
    ${data.replacementItems
      .map(
        (i) => `
      <div class="row green">
        <span>${i.name} (${i.quantity} x ${i.price})</span>
        <span>+ ${i.quantity * i.price}</span>
      </div>
    `
      )
      .join("")}

    <hr />

    <!-- SUMMARY -->
    <div class="row">
      <span>Return Total</span>
      <span class="red">- ${data.returnedTotal}</span>
    </div>

    <div class="row">
      <span>Replacement Total</span>
      <span class="green">+ ${data.replacementTotal}</span>
    </div>

    <div class="row bold">
      <span>Balance</span>
      <span>${data.balance}</span>
    </div>

    <hr />

   <!-- FOOTER -->
<div class="footer">No Return • No Cash Refund</div>
<div class="footer">Thank You! Come Again</div>
<div class="footer">System Designed by MYLTech Developers</div>

  </body>
  </html>
  `;

  win.document.write(html);
  win.document.close();
  win.print();
};