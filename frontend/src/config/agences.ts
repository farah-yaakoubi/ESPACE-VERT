// src/config/agences.ts
export interface Agence {
  ville: string; adresse: string; tel: string; tel2?: string;
  email?: string; horaires: string; maps?: string; principal: boolean;
  lat?: number; lng?: number;
}
export const AGENCES: Agence[] = [
  { ville:"Tunis — Siège", adresse:"69, rue Abderrazak Chraibi, 1001 Tunis",
    tel:"(+216) 71 333 858", tel2:"(+216) 71 348 404", email:"secretariat.groupeev@planet.tn",
    horaires:"Lun–Ven 08h–17h  ·  Sam 08h–12h",
    maps:"https://www.google.com/maps/search/?api=1&query=36.8065,10.1815",
    lat:36.8065, lng:10.1815, principal:true },
  { ville:"Soliman", adresse:"Route R43, Soliman", tel:"(+216) 72 333 143",
    horaires:"Lun–Ven 08h–17h  ·  Sam 08h–12h",
    maps:"https://www.google.com/maps/search/?api=1&query=36.7011,10.4886",
    lat:36.7011, lng:10.4886, principal:false },
  { ville:"Borj Amri", adresse:"Sidi Ali El Hattab, Borj Amri", tel:"(+216) 71 234 567",
    horaires:"Lun–Ven 08h–17h  ·  Sam 08h–12h",
    maps:"https://www.google.com/maps/search/?api=1&query=36.9117,9.9728",
    lat:36.9117, lng:9.9728, principal:false },
  { ville:"Sfax", adresse:"Route de Gabes, Sfax 3049", tel:"(+216) 74 000 000",
    horaires:"Lun–Ven 08h–17h  ·  Sam 08h–12h",
    maps:"https://www.google.com/maps/search/?api=1&query=34.7252,10.7605",
    lat:34.7252, lng:10.7605, principal:false },
];