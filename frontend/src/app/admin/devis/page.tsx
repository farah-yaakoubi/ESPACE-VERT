"use client";
import { useEffect, useState, useCallback } from "react";
import { adminDevis, type DevisItem } from "@/lib/admin-api";
import { Search, Eye, Trash2, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

const STATUTS = ["", "nouveau", "en_cours", "traite", "rejete"];
const COLORS: Record<string, string> = {
  nouveau:  "bg-blue-100 text-blue-700",
  en_cours: "bg-yellow-100 text-yellow-700",
  traite:   "bg-green-100 text-green-700",
  rejete:   "bg-red-100 text-red-700",
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminDevisPage() {
  const [items,    setItems]    = useState<DevisItem[]>([]);
  const [meta,     setMeta]     = useState({ total: 0, page: 1, pages: 1 });
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [statut,   setStatut]   = useState("");
  const [selected, setSelected] = useState<DevisItem | null>(null);
  const [saving,   setSaving]   = useState(false);
  const [reponse,  setReponse]  = useState("");
  const [note,     setNote]     = useState("");
  const [newStatut,setNewStatut]= useState("");

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const p: Record<string,string> = { page: String(page), limit: "15" };
      if (search) p.search  = search;
      if (statut) p.statut  = statut;
      const res = await adminDevis.list(p);
      setItems(res.data);
      setMeta(res.meta as any);
    } catch(e){ console.error(e); }
    finally { setLoading(false); }
  }, [search, statut]);

  useEffect(() => { load(1); }, [load]);

  const openDetail = async (item: DevisItem) => {
    const full = await adminDevis.getById(item.id_devis);
    setSelected(full);
    setReponse(full.reponse_admin ?? "");
    setNote(full.note_interne ?? "");
    setNewStatut(full.statut);
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await adminDevis.update(selected.id_devis, { statut: newStatut, reponse_admin: reponse, note_interne: note });
      setSelected(null);
      load(meta.page);
    } catch(e){ alert("Erreur: " + (e as Error).message); }
    finally { setSaving(false); }
  };

  const remove = async (id: number) => {
    if (!confirm("Supprimer ce devis ?")) return;
    await adminDevis.remove(id);
    load(meta.page);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demandes de devis</h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta.total} demandes au total</p>
        </div>
        <button onClick={() => load(1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-xl hover:bg-gray-100">
          <RefreshCw size={15} />Actualiser
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Nom, email…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500" />
        </div>
        <select value={statut} onChange={(e) => setStatut(e.target.value)}
          className="h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500 bg-white">
          {STATUTS.map((s) => <option key={s} value={s}>{s || "Tous les statuts"}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-4 border-ev-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">Aucun devis trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Client","Email","Produit","Statut","Date","Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((d) => (
                  <tr key={d.id_devis} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{d.nom}</td>
                    <td className="px-4 py-3 text-gray-500">{d.email}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate">{d.produit?.nom ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${COLORS[d.statut] ?? "bg-gray-100 text-gray-600"}`}>{d.statut}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{fmt(d.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openDetail(d)} className="p-1.5 text-gray-400 hover:text-ev-600 hover:bg-ev-50 rounded-lg transition-colors"><Eye size={15} /></button>
                        <button onClick={() => remove(d.id_devis)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">Page {meta.page} / {meta.pages}</p>
            <div className="flex gap-2">
              <button disabled={meta.page <= 1} onClick={() => load(meta.page - 1)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Précédent</button>
              <button disabled={meta.page >= meta.pages} onClick={() => load(meta.page + 1)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Suivant</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Devis #{selected.id_devis}</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 text-xl font-light">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Infos client */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-400 text-xs mb-0.5">Nom</p><p className="font-medium">{selected.nom}</p></div>
                <div><p className="text-gray-400 text-xs mb-0.5">Email</p><p className="font-medium">{selected.email}</p></div>
                {selected.telephone && <div><p className="text-gray-400 text-xs mb-0.5">Téléphone</p><p className="font-medium">{selected.telephone}</p></div>}
                {selected.produit && <div><p className="text-gray-400 text-xs mb-0.5">Produit</p><p className="font-medium">{selected.produit.nom}</p></div>}
              </div>
              {selected.message && (
                <div>
                  <p className="text-gray-400 text-xs mb-1">Message client</p>
                  <p className="text-sm bg-gray-50 rounded-xl p-3 text-gray-700">{selected.message}</p>
                </div>
              )}
              {/* Statut */}
              <div>
                <label className="block text-xs text-gray-500 mb-1 font-medium">Statut</label>
                <select value={newStatut} onChange={(e) => setNewStatut(e.target.value)}
                  className="w-full h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500 bg-white">
                  {["nouveau","en_cours","traite","rejete"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {/* Réponse admin */}
              <div>
                <label className="block text-xs text-gray-500 mb-1 font-medium">Réponse envoyée au client</label>
                <textarea value={reponse} onChange={(e) => setReponse(e.target.value)} rows={4}
                  placeholder="Votre réponse au client…"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500 resize-none" />
              </div>
              {/* Note interne */}
              <div>
                <label className="block text-xs text-gray-500 mb-1 font-medium">Note interne (non visible client)</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
                  placeholder="Note privée…"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500 resize-none bg-yellow-50" />
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 h-10 border border-gray-200 text-sm text-gray-600 rounded-xl hover:bg-gray-50">Annuler</button>
              <button onClick={save} disabled={saving}
                className="flex-1 h-10 bg-ev-700 text-white text-sm rounded-xl hover:bg-ev-800 disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
