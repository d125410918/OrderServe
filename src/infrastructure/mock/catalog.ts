import type { Branch, Category, Product } from "@/domain/catalog/types";

const sizeGroup = {
  id: "size",
  name: "份量",
  required: true,
  min: 1,
  max: 1,
  options: [
    { id: "regular", name: "標準份", priceDelta: 0 },
    { id: "large", name: "加大份", priceDelta: 40 },
  ],
};

const spicyGroup = {
  id: "spicy-level",
  name: "辣度",
  required: true,
  min: 1,
  max: 1,
  options: [
    { id: "none", name: "不辣", priceDelta: 0 },
    { id: "mild", name: "小辣", priceDelta: 0 },
    { id: "medium", name: "中辣", priceDelta: 0 },
  ],
};

const extraGroup = {
  id: "extras",
  name: "加購",
  required: false,
  min: 0,
  max: 3,
  options: [
    { id: "cheese", name: "加起司", priceDelta: 15 },
    { id: "rice", name: "加白飯", priceDelta: 20 },
    { id: "cola", name: "加飲料（可樂）", priceDelta: 30 },
  ],
};

export const categories: Category[] = [
  { id: "chicken", name: "招牌炸雞", description: "現點現炸，外酥內嫩" },
  { id: "combo", name: "超值套餐", description: "主餐、小點與飲料一次滿足" },
  { id: "main", name: "主食", description: "飽足飯食與人氣主餐" },
  { id: "snack", name: "小點", description: "多人分享剛剛好" },
  { id: "drink", name: "飲料", description: "清爽飲品與季節特調" },
];

export const products: Product[] = [
  {
    id: "original-chicken",
    categoryId: "chicken",
    name: "咚雞原味炸雞",
    shortDescription: "經典原味，外酥內嫩",
    description: "嚴選雞肉現點現炸，金黃酥脆外衣鎖住鮮嫩肉汁，是第一次來咚雞不能錯過的招牌口味。",
    price: 139,
    tag: "熱門",
    featured: true,
    image: "",
    illustration: "chicken",
    modifiers: [sizeGroup, spicyGroup, extraGroup],
    available: true,
  },
  {
    id: "korean-spicy",
    categoryId: "chicken",
    name: "韓式辣味炸雞",
    shortDescription: "香辣醬汁，鹹甜微辣",
    description: "韓式辣醬均勻包覆酥脆炸雞，甜、鹹、辣層次分明，適合喜歡刺激口味的你。",
    price: 149,
    tag: "熱門",
    spicy: true,
    image: "",
    illustration: "spicy",
    modifiers: [sizeGroup, spicyGroup, extraGroup],
    available: true,
  },
  {
    id: "golden-bites",
    categoryId: "snack",
    name: "黃金脆皮雞球",
    shortDescription: "一口大小，酥脆多汁",
    description: "方便分享的無骨雞球，外層酥脆、內裡多汁，搭配招牌沾醬更涮嘴。",
    price: 89,
    originalPrice: 109,
    tag: "新品",
    image: "",
    illustration: "nuggets",
    modifiers: [extraGroup],
    available: true,
  },
  {
    id: "double-feast",
    categoryId: "combo",
    name: "人氣雙享餐",
    shortDescription: "炸雞、小點、飲料一次到位",
    description: "兩種招牌炸雞、黃金脆薯與兩杯飲料，最適合兩到三人一起分享。",
    price: 329,
    originalPrice: 446,
    tag: "熱門",
    featured: true,
    image: "",
    illustration: "meal",
    modifiers: [spicyGroup, extraGroup],
    available: true,
  },
  {
    id: "pepper-chicken",
    categoryId: "chicken",
    name: "蒜香椒鹽炸雞",
    shortDescription: "蒜香濃郁，椒鹽提味",
    description: "以蒜酥、胡椒與特製椒鹽拌炒，香氣十足，適合搭配白飯或冰涼飲品。",
    price: 149,
    spicy: true,
    image: "",
    illustration: "spicy",
    modifiers: [sizeGroup, spicyGroup, extraGroup],
    available: true,
  },
  {
    id: "crispy-fries",
    categoryId: "snack",
    name: "咚雞黃金脆薯",
    shortDescription: "外脆內鬆，分享首選",
    description: "厚切馬鈴薯條，外層爽脆、內裡鬆軟，附招牌番茄醬。",
    price: 69,
    image: "",
    illustration: "fries",
    modifiers: [sizeGroup],
    available: true,
  },
  {
    id: "chicken-rice",
    categoryId: "main",
    name: "椒香雞肉飯",
    shortDescription: "香辣雞肉配上熱騰騰白飯",
    description: "酥嫩雞肉、時蔬與白飯組成完整一餐，午餐快速又有飽足感。",
    price: 169,
    tag: "新品",
    image: "",
    illustration: "rice",
    modifiers: [spicyGroup, extraGroup],
    available: true,
  },
  {
    id: "cola",
    categoryId: "drink",
    name: "冰涼可樂",
    shortDescription: "經典氣泡飲",
    description: "冰涼暢快，搭配炸雞最對味。",
    price: 35,
    image: "",
    illustration: "drink",
    modifiers: [sizeGroup],
    available: true,
  },
  {
    id: "lemon-tea",
    categoryId: "drink",
    name: "檸檬紅茶",
    shortDescription: "清新檸檬與紅茶香氣",
    description: "酸甜平衡、清爽解膩，適合搭配濃郁餐點。",
    price: 45,
    image: "",
    illustration: "drink",
    modifiers: [sizeGroup],
    available: true,
  },
  {
    id: "custard-pie",
    categoryId: "snack",
    name: "金黃卡士達派",
    shortDescription: "酥香外皮與滑順內餡",
    description: "餐後來一份甜點，為整餐畫下剛好的句點。",
    price: 49,
    tag: "限定",
    image: "",
    illustration: "dessert",
    modifiers: [],
    available: false,
  },
];

export const branches: Branch[] = [
  { id: "xinyi", brandId: "dongji", name: "台北信義店", address: "台北市信義區松壽路 12 號", phone: "02-2720-1688", eta: "25–35 分鐘", isOpen: true, deliveryFee: 49, packagingFee: 10, lifecycle: "ACTIVE", createdAt: 1 },
  { id: "banqiao", brandId: "dongji", name: "板橋新站店", address: "新北市板橋區新站路 28 號", phone: "02-2950-7700", eta: "30–40 分鐘", isOpen: true, deliveryFee: 39, packagingFee: 10, lifecycle: "ACTIVE", createdAt: 2 },
  { id: "taichung", brandId: "dongji", name: "台中公益店", address: "台中市西區公益路 168 號", phone: "04-2328-8899", eta: "20–30 分鐘", isOpen: true, deliveryFee: 45, packagingFee: 10, lifecycle: "ACTIVE", createdAt: 3 },
];

export function getProduct(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getBranch(id: string): Branch {
  return branches.find((branch) => branch.id === id) ?? branches[0];
}
