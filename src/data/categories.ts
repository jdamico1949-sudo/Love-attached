// Section 4 of the build brief: reordered from Answer Key's original list,
// with two new groups (Recipes & family traditions, Quilts & linens) added
// near the top since they came up directly in the focus group.
export interface CategoryGroup {
  name: string;
  items: string[];
}

export const TREASURE_CATEGORIES: CategoryGroup[] = [
  { name: "Jewelry", items: ["Ring", "Engagement / wedding ring", "Necklace", "Bracelet", "Earrings", "Brooch / pin", "Cufflinks / tie clip", "Loose gemstones"] },
  { name: "Watches", items: ["Wristwatch", "Pocket watch"] },
  { name: "Family photos & keepsake papers", items: ["Photo album", "Framed photograph", "Home movies / video tapes", "Letters / correspondence", "Greeting cards", "Diary / journal", "Scrapbook", "Family Bible with records"] },
  { name: "Recipes & family traditions", items: ["Recipe box", "Handwritten recipe", "Cookbook", "Holiday decoration", "Family tradition item"] },
  { name: "Quilts & linens", items: ["Quilt", "Afghan / blanket", "Tablecloth", "Embroidered linen"] },
  { name: "China, silver & kitchenware", items: ["China set", "Silverware / flatware", "Crystal / glassware", "Serving pieces"] },
  { name: "Coins & collectibles", items: ["Coin collection", "Stamp collection", "Trading cards", "Comic books", "Vintage toys", "Model trains / cars / planes", "Dolls / figurines", "Autographed memorabilia", "Wine collection"] },
  { name: "Sports memorabilia", items: ["Sports memorabilia", "Golf clubs", "Fishing / hunting gear", "Bicycle"] },
  { name: "Records & music", items: ["Vinyl records", "Sheet music"] },
  { name: "Art & décor", items: ["Painting", "Print / lithograph", "Sculpture", "Pottery / ceramics", "Tapestry / wall hanging", "Mantel or wall clock", "Mirror"] },
  { name: "Furniture", items: ["Heirloom furniture piece", "Grandfather / longcase clock", "Trunk / chest", "Rug / carpet"] },
  { name: "Military & service", items: ["Medals / ribbons", "Uniform", "Folded / display flag", "Dog tags"] },
  { name: "Religious & cultural", items: ["Bible / prayer book", "Religious icon / statue", "Rosary", "Ceremonial item (e.g. menorah)", "Cultural heirloom"] },
  { name: "Musical instruments", items: ["Piano", "Guitar", "Violin", "Other instrument"] },
  { name: "Books & writings", items: ["Rare / first-edition book", "Signed book"] },
  { name: "Clothing & accessories", items: ["Wedding dress", "Handbag", "Military uniform"] },
  { name: "Tools & hobby equipment", items: ["Hand / woodworking tools", "Sewing machine", "Vintage camera equipment"] },
  { name: "Firearms & outdoor", items: ["Firearm", "Hunting / fishing gear"] },
  { name: "Other", items: ["Other"] },
];

export const TREASURE_CATEGORY_NAMES = TREASURE_CATEGORIES.map((c) => c.name);
