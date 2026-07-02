// Sample orders and addresses for the account area. Shared by order-list,
// order-detail and address-book so they render standalone; swap for your own
// data by passing props into each block.
import { sampleProducts, type CartItem } from "./store.svelte.ts";

export interface Address {
	label: string;
	name: string;
	line1: string;
	city: string;
	zip: string;
	country: string;
	default?: boolean;
}

export type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

export interface Order {
	id: string;
	date: string;
	status: OrderStatus;
	items: CartItem[];
	total: number;
	eta?: string;
	tracking?: { label: string; done: boolean }[];
}

const line = (i: number, qty = 1): CartItem => ({
	name: sampleProducts[i].name,
	category: sampleProducts[i].category,
	price: sampleProducts[i].price,
	image: sampleProducts[i].image,
	qty,
});

const total = (items: CartItem[], shipping = 0) =>
	items.reduce((sum, x) => sum + x.price * x.qty, 0) + shipping;

export const sampleOrders: Order[] = [
	{
		id: "#MC-2107",
		date: "Jun 28, 2026",
		status: "shipped",
		items: [line(0), line(3, 2)],
		total: total([line(0), line(3, 2)]),
		eta: "Arrives Jul 4",
		tracking: [
			{ label: "Ordered", done: true },
			{ label: "Packed", done: true },
			{ label: "Shipped", done: true },
			{ label: "Delivered", done: false },
		],
	},
	{
		id: "#MC-2089",
		date: "Jun 12, 2026",
		status: "delivered",
		items: [line(5), line(2)],
		total: total([line(5), line(2)], 6),
		tracking: [
			{ label: "Ordered", done: true },
			{ label: "Packed", done: true },
			{ label: "Shipped", done: true },
			{ label: "Delivered", done: true },
		],
	},
	{
		id: "#MC-2064",
		date: "May 30, 2026",
		status: "processing",
		items: [line(6)],
		total: total([line(6)], 6),
		eta: "Ships in 1–2 days",
		tracking: [
			{ label: "Ordered", done: true },
			{ label: "Packed", done: false },
			{ label: "Shipped", done: false },
			{ label: "Delivered", done: false },
		],
	},
	{
		id: "#MC-2031",
		date: "May 9, 2026",
		status: "cancelled",
		items: [line(1)],
		total: total([line(1)]),
	},
];

export const sampleAddresses: Address[] = [
	{
		label: "Home",
		name: "Jeki Maulana",
		line1: "12 Riverside Lane",
		city: "Portland, OR",
		zip: "97201",
		country: "United States",
		default: true,
	},
	{
		label: "Studio",
		name: "Jeki Maulana",
		line1: "48 Maker's Row, Unit 3",
		city: "Portland, OR",
		zip: "97209",
		country: "United States",
	},
];
