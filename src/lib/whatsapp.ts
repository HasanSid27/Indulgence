/** WhatsApp links and messages. The number comes from the spreadsheet's Settings tab. */

/** Build a wa.me link with a prefilled message. */
export function whatsappUrl(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export const generalOrderMessage = "Hi, I’d like to place an order.";
export const generalOrderUrl = (number: string) => whatsappUrl(number, generalOrderMessage);

export function productOrderUrl(number: string, productName: string, variantLabel?: string) {
  const what = variantLabel ? `${productName} (${variantLabel})` : productName;
  return whatsappUrl(number, `Hi, I’d like to order ${what}.`);
}

export interface OrderLine {
  name: string;
  variantLabel?: string;
  qty: number;
  /** Amount for this line in rupees (menu price × quantity). Always computed from the menu, never from storage. */
  amount: number;
}

/** "Rs. 1,098" — Indian digit grouping, plain "Rs." so it displays correctly in every WhatsApp client. */
export const rupees = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;

/** The message text for an order list: one line per item with its amount, then the total. */
export function cartOrderMessage(lines: OrderLine[]) {
  if (lines.length === 0) return generalOrderMessage;
  const list = lines
    .map((l, i) => `${i + 1}. ${l.name}${l.variantLabel ? ` (${l.variantLabel})` : ""}${l.qty > 1 ? ` x${l.qty}` : ""} - ${rupees(l.amount)}`)
    .join("\n");
  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  return `Hi, I’d like to order:\n${list}\n\nTotal - ${rupees(total)}`;
}

/** One WhatsApp link listing everything in the customer's order list. */
export const cartOrderUrl = (number: string, lines: OrderLine[]) => whatsappUrl(number, cartOrderMessage(lines));
