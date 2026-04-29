// src/config/agences.ts
export interface Agence {
  ville: string; adresse: string; tel: string; tel2?: string;
  email?: string; horaires: string; maps?: string; principal: boolean;
}
export const AGENCES: Agence[] = [
  { ville:"Tunis — Siège", adresse:"69, rue Abderrazak Chraibi, 1001 Tunis",
    tel:"(+216) 71 333 858", tel2:"(+216) 71 348 404", email:"secretariat.groupeev@planet.tn",
    horaires:"Lun–Ven 08h–17h  ·  Sam 08h–12h",
    maps:"https://maps.google.com/?q=69+rue+Abderrazak+Chraibi+Tunis", principal:true },
  { ville:"Soliman", adresse:"Route R43, Soliman", tel:"(+216) 72 333 143",
    horaires:"Lun–Ven 08h–17h  ·  Sam 08h–12h", principal:false },
  { ville:"Borj Amri", adresse:"Sidi Ali El Hattab, Borj Amri", tel:"(+216) 71 234 567",
    horaires:"Lun–Ven 08h–17h  ·  Sam 08h–12h", principal:false },
  { ville:"Sfax", adresse:"Route de Gabes, Sfax 3049", tel:"(+216) 74 000 000",
    horaires:"Lun–Ven 08h–17h  ·  Sam 08h–12h", principal:false },
];
