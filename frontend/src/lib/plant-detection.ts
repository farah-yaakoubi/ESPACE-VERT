export function detectPlant(name: string): string {
  const n = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  // English keywords
  if (n.includes("tomato")) return "tomate";
  if (n.includes("betterav") || n.includes("beetroot") || n.includes("beet")) return "betterave";
  if (n.includes("blett") || n.includes("chard")) return "blette";
  if (n.includes("pepper") || n.includes("bell pepper")) return "poivron";
  if (n.includes("chili") || n.includes("chilli") || n.includes("chile")) return "piment";
  if (n.includes("cucumber")) return "concombre";
  if (n.includes("zucchini") || n.includes("courgette")) return "courgette";
  if (n.includes("lettuce")) return "laitue";
  if (n.includes("carrot")) return "carotte";
  if (n.includes("onion")) return "oignon";
  if (n.includes("bean") || n.includes("haricot")) return "haricot";
  if (n.includes("pea") || n.includes("peas")) return "pois";
  if (n.includes("watermelon")) return "pasteque";
  if (n.includes("sunflower")) return "tournesol";
  if (n.includes("basil")) return "basilic";
  if (n.includes("parsley")) return "persil";
  if (n.includes("coriander")) return "coriandre";
  if (n.includes("celery") || n.includes("celeri") || n.includes("celeriac")) return "celeri";
  if (n.includes("radish")) return "radis";
  if (n.includes("turnip")) return "navet";
  if (n.includes("garlic")) return "ail";
  if (n.includes("spinach")) return "epinard";
  if (n.includes("broccoli")) return "brocoli";
  if (n.includes("cabbage")) return "chou";
  if (n.includes("leek")) return "poireau";
  if (n.includes("gazon") || n.includes("pelouse") || n.includes("ray grass") || n.includes("ray-grass")) return "gazon";
  if (n.includes("fleur") || n.includes("floral") || n.includes("florale") || n.includes("ornement")) return "fleurs";
  if (n.includes("tournesol")) return "tournesol";
  if (n.includes("basilic")) return "basilic";
  if (n.includes("persil")) return "persil";
  if (n.includes("coriandre")) return "coriandre";
  if (n.includes("celeri")) return "celeri";
  if (n.includes("tomat")) return "tomate";
  if (n.includes("poivron")) return "poivron";
  if (n.includes("piment")) return "piment";
  if (n.includes("concombr")) return "concombre";
  if (n.includes("courgett")) return "courgette";
  if (n.includes("past") || n.includes("watermel")) return "pasteque";
  if (n.includes("melon")) return "melon";
  if (n.includes("laitu") || n.includes("salade")) return "laitue";
  if (n.includes("carot")) return "carotte";
  if (n.includes("oignon")) return "oignon";
  if (n.includes("haricot")) return "haricot";
  if (n.includes("pois")) return "pois";
  if (n.includes("courge")) return "courge";
  if (n.includes("radis")) return "radis";
  if (n.includes("navet")) return "navet";
  if (n.includes("ail")) return "ail";
  if (n.includes("epinard")) return "epinard";
  if (n.includes("brocoli")) return "brocoli";
  if (n.includes("chou")) return "chou";
  if (n.includes("poireau")) return "poireau";
  return "";
}
