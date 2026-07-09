import type { FieldConfig } from "./types";

export const FIELD_CONFIGS: FieldConfig[] = [
  {
    key: "faceShape",
    labelZh: "臉型",
    labelDe: "Gesichtsform",
    options: [
      { zh: "鵝蛋臉", de: "Ovales Gesicht", value: "oval face" },
      { zh: "圓臉", de: "Rundes Gesicht", value: "round face" },
      { zh: "瓜子臉", de: "Herzförmiges Gesicht", value: "heart-shaped face" },
      { zh: "小巧臉", de: "Zierliches Gesicht", value: "petite face" },
      { zh: "長臉", de: "Längliches Gesicht", value: "long face" },
      { zh: "柔和臉型", de: "Weiche Gesichtsform", value: "soft facial shape" },
    ],
  },
  {
    key: "aura",
    labelZh: "臉部氣質",
    labelDe: "Gesichtsausdruck und Ausstrahlung",
    options: [
      { zh: "溫柔", de: "Sanft", value: "gentle" },
      { zh: "甜美", de: "Süß", value: "sweet" },
      { zh: "清秀", de: "Zart und elegant", value: "delicate and elegant" },
      { zh: "可愛", de: "Niedlich", value: "cute" },
      { zh: "有氣質", de: "Anmutig", value: "graceful" },
      { zh: "成熟優雅", de: "Reif und elegant", value: "mature and elegant" },
    ],
  },
  {
    key: "hairLength",
    labelZh: "髮長",
    labelDe: "Haarlänge",
    options: [
      { zh: "長髮", de: "Lange Haare", value: "long hair" },
      { zh: "中長髮", de: "Mittellange Haare", value: "medium-length hair" },
      { zh: "短髮", de: "Kurze Haare", value: "short hair" },
      { zh: "及肩髮", de: "Schulterlange Haare", value: "shoulder-length hair" },
    ],
  },
  {
    key: "hairColor",
    labelZh: "髮色",
    labelDe: "Haarfarbe",
    options: [
      { zh: "黑色", de: "Schwarz", value: "black hair" },
      { zh: "深棕色", de: "Dunkelbraun", value: "dark brown hair" },
      { zh: "棕色", de: "Braun", value: "brown hair" },
      { zh: "淺棕色", de: "Hellbraun", value: "light brown hair" },
    ],
  },
  {
    key: "hairStyle",
    labelZh: "髮型",
    labelDe: "Frisur",
    options: [
      { zh: "直髮", de: "Glatt", value: "straight hair" },
      { zh: "微捲", de: "Leicht gewellt", value: "slightly wavy hair" },
      { zh: "大波浪", de: "Große Wellen", value: "big wavy hair" },
      { zh: "低馬尾", de: "Tiefer Pferdeschwanz", value: "low ponytail" },
      { zh: "盤髮", de: "Hochsteckfrisur", value: "elegant updo" },
    ],
  },
  {
    key: "bangs",
    labelZh: "瀏海",
    labelDe: "Pony",
    options: [
      { zh: "無瀏海", de: "Kein Pony", value: "no bangs" },
      { zh: "空氣瀏海", de: "Luftiger Pony", value: "airy bangs" },
      { zh: "旁分", de: "Seitenscheitel", value: "side part" },
      { zh: "中分", de: "Mittelscheitel", value: "middle part" },
      { zh: "微微遮額", de: "Leicht die Stirn bedeckend", value: "lightly covering forehead" },
    ],
  },
  {
    key: "eyes",
    labelZh: "眼睛",
    labelDe: "Augen",
    options: [
      { zh: "大眼睛", de: "Große Augen", value: "large eyes" },
      { zh: "圓眼", de: "Runde Augen", value: "round eyes" },
      { zh: "細長眼", de: "Schmale Augen", value: "narrow almond-shaped eyes" },
      { zh: "溫柔眼神", de: "Sanfter Blick", value: "gentle eyes" },
      { zh: "明亮眼神", de: "Strahlender Blick", value: "bright eyes" },
      { zh: "笑眼", de: "Lächelnde Augen", value: "smiling eyes" },
    ],
  },
  {
    key: "eyelids",
    labelZh: "眼皮",
    labelDe: "Augenlider",
    options: [
      { zh: "雙眼皮", de: "Doppellider", value: "double eyelids" },
      { zh: "內雙", de: "Verdeckte Doppellider", value: "subtle double eyelids" },
      { zh: "單眼皮", de: "Monolider", value: "monolids" },
      { zh: "不確定", de: "Nicht sicher", value: "natural eyelids" },
    ],
  },
  {
    key: "nose",
    labelZh: "鼻子",
    labelDe: "Nase",
    options: [
      { zh: "小巧鼻", de: "Kleine feine Nase", value: "small delicate nose" },
      { zh: "自然鼻型", de: "Natürliche Nase", value: "natural nose" },
      { zh: "挺鼻", de: "Gerade Nase", value: "straight nose" },
      { zh: "圓鼻", de: "Runde Nase", value: "rounded nose" },
      { zh: "精緻鼻型", de: "Feine Nase", value: "refined nose" },
    ],
  },
  {
    key: "mouth",
    labelZh: "嘴巴",
    labelDe: "Mund",
    options: [
      { zh: "小嘴", de: "Kleiner Mund", value: "small mouth" },
      { zh: "自然唇形", de: "Natürliche Lippen", value: "natural lips" },
      { zh: "厚唇", de: "Volle Lippen", value: "full lips" },
      { zh: "薄唇", de: "Schmale Lippen", value: "thin lips" },
      { zh: "微笑唇", de: "Lächelnde Lippen", value: "softly smiling lips" },
    ],
  },
  {
    key: "expression",
    labelZh: "表情",
    labelDe: "Ausdruck",
    options: [
      { zh: "微笑", de: "Leichtes Lächeln", value: "soft smile" },
      { zh: "燦笑", de: "Großes Lächeln", value: "bright smile" },
      { zh: "害羞笑", de: "Schüchternes Lächeln", value: "shy smile" },
      { zh: "自然表情", de: "Natürlicher Ausdruck", value: "natural expression" },
      { zh: "溫柔微笑", de: "Sanftes Lächeln", value: "gentle warm smile" },
    ],
  },
  {
    key: "clothing",
    labelZh: "穿著",
    labelDe: "Kleidung",
    options: [
      { zh: "白紗", de: "Weißes Brautkleid", value: "white wedding dress" },
      { zh: "中式禮服", de: "Chinesisches Festkleid", value: "Chinese wedding dress" },
      { zh: "紅色禮服", de: "Rotes Kleid", value: "red formal dress" },
      { zh: "洋裝", de: "Kleid", value: "elegant dress" },
      { zh: "便服", de: "Alltagskleidung", value: "casual outfit" },
    ],
  },
  {
    key: "imageStyle",
    labelZh: "圖片風格",
    labelDe: "Bildstil",
    options: [
      { zh: "寫實人像", de: "Realistisches Porträt", value: "realistic portrait photography" },
      { zh: "婚紗寫真", de: "Braut-Shooting", value: "wedding portrait photography" },
      { zh: "韓系寫真", de: "Koreanisches Porträt", value: "soft Korean portrait style" },
      { zh: "證件照風格", de: "Passfoto-Stil", value: "clean ID photo style" },
      { zh: "自然生活照", de: "Natürliches Alltagsfoto", value: "natural lifestyle portrait" },
    ],
  },
  {
    key: "background",
    labelZh: "背景",
    labelDe: "Hintergrund",
    options: [
      { zh: "白色背景", de: "Weißer Hintergrund", value: "clean white background" },
      { zh: "柔和室內背景", de: "Weicher Innenraumhintergrund", value: "soft indoor background" },
      { zh: "婚禮背景", de: "Hochzeitshintergrund", value: "subtle wedding background" },
      { zh: "簡單背景", de: "Einfacher Hintergrund", value: "simple clean background" },
      { zh: "棚拍背景", de: "Studiohintergrund", value: "studio background" },
    ],
  },
];

export const EXTRA_FIELD = {
  labelZh: "補充描述",
  labelDe: "Zusätzliche Beschreibung",
  placeholderZh: "例如：她笑起來眼睛會彎彎的，臉頰有一點肉肉的，看起來很溫柔。",
  placeholderDe:
    "Zum Beispiel: Wenn sie lächelt, werden ihre Augen halbmondförmig, ihre Wangen wirken weich, und sie sieht sehr sanft aus.",
  maxLength: 240,
};

export function getDefaultFormValues() {
  const defaults: Record<string, string> = {};
  for (const field of FIELD_CONFIGS) {
    defaults[field.key] = field.options[0].value;
  }
  defaults.extra = "";
  return defaults as import("./types").BrideFormValues;
}
