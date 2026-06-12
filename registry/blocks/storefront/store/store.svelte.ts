// Storefront shared store — cart, favourites, and a drawer flag, ported from
// Mercato's `useStore` to Svelte 5 runes. Create one instance and pass it to the
// header, product grid, and cart drawer so they stay in sync. State persists to
// localStorage so it survives reloads (guarded for SSR).

export interface Product {
	name: string;
	category: string;
	price: number;
	/** Original price when on sale; renders a struck-through "was" price. */
	compareAt?: number | null;
	rating?: number;
	reviews?: number;
	/** "new" | "sale" | "low" — drives the corner badge. */
	badge?: "new" | "sale" | "low" | null;
	image?: string;
	/** Hex colours for the little swatch dots under the card. */
	swatches?: string[] | null;
}

export interface CartItem {
	name: string;
	category: string;
	price: number;
	image?: string;
	qty: number;
}

/** Format a number as a plain dollar price — whole numbers drop the cents. */
export const money = (n: number) => "$" + Number(n).toFixed(Number.isInteger(n) ? 0 : 2);

function read<T>(key: string, fallback: T): T {
	if (typeof localStorage === "undefined") return fallback;
	try {
		const raw = localStorage.getItem(key);
		return raw ? (JSON.parse(raw) as T) : fallback;
	} catch {
		return fallback;
	}
}

function write(key: string, value: unknown): void {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// storage full or unavailable — state simply won't persist
	}
}

export type Cart = ReturnType<typeof createCart>;

export function createCart(initial: CartItem[] = []) {
	let items = $state<CartItem[]>(read("storefront.cart", initial));
	let favs = $state<Record<string, boolean>>(read("storefront.favs", {}));
	let open = $state(false);

	return {
		get items() {
			return items;
		},
		get favs() {
			return favs;
		},
		get open() {
			return open;
		},
		set open(value: boolean) {
			open = value;
		},
		get count() {
			return items.reduce((sum, x) => sum + x.qty, 0);
		},
		get subtotal() {
			return items.reduce((sum, x) => sum + x.qty * x.price, 0);
		},
		get favCount() {
			return Object.keys(favs).length;
		},
		add(product: Product, qty = 1) {
			const i = items.findIndex((x) => x.name === product.name);
			if (i >= 0) {
				items[i].qty += qty;
			} else {
				items.push({
					name: product.name,
					category: product.category,
					price: product.price,
					image: product.image,
					qty,
				});
			}
			write("storefront.cart", items);
			open = true;
		},
		setQty(name: string, qty: number) {
			if (qty <= 0) {
				items = items.filter((x) => x.name !== name);
			} else {
				const i = items.findIndex((x) => x.name === name);
				if (i >= 0) items[i].qty = qty;
			}
			write("storefront.cart", items);
		},
		toggleFav(product: Product) {
			if (favs[product.name]) delete favs[product.name];
			else favs[product.name] = true;
			write("storefront.favs", favs);
		},
		isFaved(name: string) {
			return !!favs[name];
		},
	};
}

// Sample catalogue used as default content so storefront blocks render
// standalone. Swap for your own products by passing data into each block.
export const sampleProducts: Product[] = [
	{
		name: "Stoneware Dinner Set",
		category: "Kitchen",
		price: 78,
		badge: "new",
		rating: 4.8,
		reviews: 214,
		image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&q=80",
		swatches: ["#C9B6A3", "#7C8A77", "#2A2419"],
	},
	{
		name: "Linen Table Throw",
		category: "Living",
		price: 44,
		compareAt: 58,
		badge: "sale",
		rating: 4.6,
		reviews: 88,
		image: "https://images.unsplash.com/photo-1600369671236-e74521d4b6ad?w=600&q=80",
	},
	{
		name: "Cold-Press Olive Oil",
		category: "Pantry",
		price: 19,
		rating: 4.9,
		reviews: 312,
		image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80",
	},
	{
		name: "Hand-Thrown Mug",
		category: "Kitchen",
		price: 24,
		rating: 4.7,
		reviews: 156,
		image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80",
		swatches: ["#E8D5C7", "#DCE6D5", "#E0E2E8"],
	},
	{
		name: "Wool Storage Basket",
		category: "Home",
		price: 52,
		rating: 4.5,
		reviews: 64,
		image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&q=80",
	},
	{
		name: "Beeswax Candle, Fig",
		category: "Living",
		price: 28,
		badge: "low",
		rating: 4.8,
		reviews: 203,
		image: "https://images.unsplash.com/photo-1602874801006-e26c4c5b5b6a?w=600&q=80",
	},
	{
		name: "Brass Serving Spoons",
		category: "Kitchen",
		price: 36,
		rating: 4.6,
		reviews: 41,
		image: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=600&q=80",
	},
	{
		name: "Organic Sourdough Mix",
		category: "Pantry",
		price: 12,
		rating: 4.7,
		reviews: 122,
		image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80",
	},
];
