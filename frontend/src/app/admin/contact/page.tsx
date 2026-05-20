"use client";
import { useEffect, useState, useCallback } from "react";
import { adminContact, type ContactItem } from "@/lib/admin-api";
import { Search, Eye, Trash2, RefreshCw, MessageSquare } from "lucide-react";

function fmt(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminContactPage() {
  const [items,    setItems]    = useState<ContactItem[]>([]);
  const [meta,     setMeta]     = useState({ total: 0, page: 1, pages: 1 });
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [luFilter, setLuFilter] = useState("");
  const [selected, setSelected] = useState<ContactItem | null>(null);
  const [reponse,  setReponse]  = useState("");
  const [saving,   setSaving]   = useState(false);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const p: Record<string,string> = { page: String(page), limit: "15" };
      if (search)   p.search = search;
      if (luFilter) p.lu     = luFilter;
      const res = await adminContact.list(p);
      setItems(res.data);
      setMeta(res.meta as any);
    } catch(e){ console.error(e); }
    finally { setLoading(false); }
  }, [search, luFilter]);

  useEffect(() => { load(1); }, [load]);

  const openDetail = async (item: ContactItem) => {
    const full = await adminContact.getById(item.id_contact);
    setSelected(full);
    setReponse(full.reponse ?? "");
  };

  const sendReply = async () => {
    if (!selected || !reponse.trim()) return;
    setSaving(true);
    try {
      await adminContact.reply(selected.id_contact, reponse);
      setSelected(null);
      load(meta.page);
    } catch(e){ alert("Erreur: " + (e as Error).message); }
    finally { setSaving(false); }
  };

  const remove = async (id: number) => {
    if (!confirm("Supprimer ce message ?")) return;
    await adminContact.remove(id);
    load(meta.page);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages de contact</h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta.total} messages au total</p>
        </div>
        <button onClick={() => load(1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-xl hover:bg-gray-100">
          <RefreshCw size={15} />Actualiser
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Nom, email, sujet…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500" />
        </div>
        <select value={luFilter} onChange={(e) => setLuFilter(e.target.value)}
          className="h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white">
          <option value="">Tous les messages</option>
          <option value="false">Non lus</option>
          <option value="true">Lus</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-4 border-ev-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">Aucun message trouvé</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((m) => (
              <div key={m.id_contact} className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors ${!m.lu ? "bg-orange-50/30" : ""}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${!m.lu ? "bg-orange-100" : "bg-gray-100"}`}>
                  <MessageSquare size={16} className={!m.lu ? "text-orange-500" : "text-gray-400"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-sm text-gray-800">{m.nom}</p>
                    {!m.lu && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">Non lu</span>}
                    {m.replied_at && <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">Répondu</span>}
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{m.email} — {fmt(m.created_at)}</p>
                  {m.sujet && <p className="text-sm font-medium text-gray-700 mb-0.5">{m.sujet}</p>}
                  <p className="text-sm text-gray-500 line-clamp-2">{m.message}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openDetail(m)} className="p-1.5 text-gray-400 hover:text-ev-600 hover:bg-ev-50 rounded-lg transition-colors"><Eye size={15} /></button>
                  <button onClick={() => remove(m.id_contact)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
        {meta.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">Page {meta.page} / {meta.pages}</p>
            <div className="flex gap-2">
              <button disabled={meta.page <= 1} onClick={() => load(meta.page - 1)} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Précédent</button>
              <button disabled={meta.page >= meta.pages} onClick={() => load(meta.page + 1)} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Suivant</button>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{selected.nom}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 text-xl font-light">✕</button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div><p className="text-gray-400 text-xs mb-0.5">Email</p><a href={"mailto:" + selected.email} className="font-medium text-ev-600 hover:underline">{selected.email}</a></div>
                <div><p className="text-gray-400 text-xs mb-0.5">Date</p><p className="font-medium">{fmt(selected.created_at)}</p></div>
                {selected.sujet && <div className="col-span-2"><p className="text-gray-400 text-xs mb-0.5">Sujet</p><p className="font-medium">{selected.sujet}</p></div>}
              </div>
              <div><p className="text-gray-400 text-xs mb-1">Message</p>
                <p className="text-sm bg-gray-50 rounded-xl p-4 text-gray-700 whitespace-pre-wrap">{selected.message}</p></div>
              {selected.reponse && (
                <div><p className="text-gray-400 text-xs mb-1">Réponse envoyée</p>
                  <p className="text-sm bg-green-50 rounded-xl p-4 text-green-800 whitespace-pre-wrap">{selected.reponse}</p></div>
              )}
              {!selected.replied_at && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1 font-medium">Votre réponse</label>
                  <textarea value={reponse} onChange={(e) => setReponse(e.target.value)} rows={5}
                    placeholder="Rédigez votre réponse ici…"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500 resize-none" />
                </div>
              )}
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 h-10 border border-gray-200 text-sm text-gray-600 rounded-xl hover:bg-gray-50">Fermer</button>
              {!selected.replied_at && (
                <button onClick={sendReply} disabled={saving || !reponse.trim()}
                  className="flex-1 h-10 bg-ev-700 text-white text-sm rounded-xl hover:bg-ev-800 disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                  Envoyer la réponse
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
