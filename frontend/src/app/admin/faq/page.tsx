"use client";
import { adminFaq, type FaqAdmin } from "@/lib/admin-api";
import {
  AlertTriangle,
  BarChart3,
  Bot,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Edit2,
  Eye,
  MessageSquare,
  Power,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const EMPTY = {
  question: "",
  reponse: "",
  rubrique: "",
  ordre: 0,
  active: true,
};

export default function AdminFaqPage() {
  const [items, setItems] = useState<FaqAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageErr, setPageErr] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<FaqAdmin | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [catFilter, setCatFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setPageErr("");
    try {
      const d = await adminFaq.list();
      setItems(Array.isArray(d) ? d : ((d as any).data ?? []));
    } catch (e: any) {
      const status = (e as any)?.status;
      if (status === 403 || e?.message?.includes("Permission")) {
        setPageErr("Vous n'avez pas la permission d'accéder aux FAQs. Contactez un Super Admin.");
      } else if (status === 401) {
        setPageErr("Session expirée. Veuillez vous reconnecter.");
      } else {
        setPageErr(e?.message ?? "Erreur lors du chargement des FAQs.");
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm(EMPTY);
    setEditing(null);
    setErr("");
    setModal("create");
  };
  const openEdit = (f: FaqAdmin) => {
    setForm({
      question: f.question,
      reponse: f.reponse,
      rubrique: f.rubrique ?? "",
      ordre: f.ordre,
      active: f.active,
    });
    setEditing(f);
    setErr("");
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.reponse.trim()) {
      setErr("Question et réponse requises.");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      const p = {
        question: form.question,
        reponse: form.reponse,
        rubrique: form.rubrique || null,
        ordre: form.ordre,
        active: form.active,
      };
      if (modal === "create") await adminFaq.create(p);
      else if (editing) await adminFaq.update(editing.id_faq, p);
      setModal(null);
      load();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (f: FaqAdmin) => {
    if (!confirm("Supprimer cette FAQ ?")) return;
    try {
      await adminFaq.remove(f.id_faq);
      load();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const toggleActive = async (f: FaqAdmin) => {
    try {
      await adminFaq.update(f.id_faq, { active: !f.active });
      load();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const testChatbot = async (question = chatQuestion) => {
    const cleanQuestion = question.trim();
    if (!cleanQuestion || chatLoading) return;
    setChatQuestion(cleanQuestion);
    setChatLoading(true);
    setChatAnswer("");
    try {
      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ message: cleanQuestion, history: [] }),
      });
      const data = await res.json();
      setChatAnswer(data.reply ?? "Aucune réponse générée.");
    } catch {
      setChatAnswer("Impossible de tester le chatbot pour le moment.");
    } finally {
      setChatLoading(false);
    }
  };

  const categories = [...new Set(items.map((i) => i.rubrique).filter(Boolean))];
  const activeCount = items.filter((i) => i.active).length;
  const inactiveCount = items.length - activeCount;
  const consultedCount = items.reduce((sum, item) => sum + (item.nb_consultations ?? 0), 0);
  const duplicates = new Set(
    items
      .map((item) => item.question.trim().toLowerCase())
      .filter((question, index, arr) => question && arr.indexOf(question) !== index),
  );
  const needsReview = items.filter(
    (item) =>
      !item.rubrique ||
      item.question.trim().length < 12 ||
      item.reponse.trim().length < 25 ||
      duplicates.has(item.question.trim().toLowerCase()),
  ).length;
  const filtered = items.filter(
    (i) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        i.question.toLowerCase().includes(q) ||
        i.reponse.toLowerCase().includes(q) ||
        (i.rubrique ?? "").toLowerCase().includes(q);
      const matchesCategory = !catFilter || i.rubrique === catFilter;
      const matchesActive =
        activeFilter === "all" ||
        (activeFilter === "active" && i.active) ||
        (activeFilter === "inactive" && !i.active);
      return matchesSearch && matchesCategory && matchesActive;
    },
  );

  const topFaqs = [...items]
    .sort((a, b) => (b.nb_consultations ?? 0) - (a.nb_consultations ?? 0))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQ</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {items.length} question{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="p-2 text-gray-500 hover:text-gray-800 rounded-xl hover:bg-gray-100"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={openCreate}
            disabled={!!pageErr}
            className="flex items-center gap-2 bg-ev-700 hover:bg-ev-800 text-white text-sm font-medium px-4 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={16} />
            Nouvelle FAQ
          </button>
        </div>
      </div>

      {pageErr && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-2">
          <span className="text-red-500">⚠</span>
          {pageErr}
        </div>
      )}

      {!pageErr && (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <Bot size={14} className="text-ev-600" />
                Base chatbot
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">{activeCount}</p>
              <p className="text-xs text-gray-400">FAQ actives utilisées par le bot</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <Power size={14} className="text-gray-500" />
                Inactives
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">{inactiveCount}</p>
              <p className="text-xs text-gray-400">Brouillons ou réponses masquées</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <Eye size={14} className="text-blue-600" />
                Consultations
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">{consultedCount}</p>
              <p className="text-xs text-gray-400">Total enregistré côté site</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <AlertTriangle size={14} className="text-amber-600" />
                À revoir
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">{needsReview}</p>
              <p className="text-xs text-gray-400">Rubrique, longueur ou doublon</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500"
              />
            </div>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as typeof activeFilter)}
              className="h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actives</option>
              <option value="inactive">Inactives</option>
            </select>
            {categories.length > 0 && (
              <select
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((c) => (
                  <option key={c} value={c!}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-7 h-7 border-4 border-ev-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                Aucune FAQ trouvée
              </div>
            ) : (
              filtered.map((f) => (
                <div key={f.id_faq} className={`${!f.active ? "opacity-50" : ""}`}>
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() =>
                      setExpanded(expanded === f.id_faq ? null : f.id_faq)
                    }
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {f.rubrique && (
                          <span className="text-xs bg-ev-50 text-ev-600 px-2 py-0.5 rounded-full">
                            {f.rubrique}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          Ordre {f.ordre}
                        </span>
                        {(f.nb_consultations ?? 0) > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                            <BarChart3 size={11} />
                            {f.nb_consultations}
                          </span>
                        )}
                        {duplicates.has(f.question.trim().toLowerCase()) && (
                          <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                            Doublon
                          </span>
                        )}
                        {!f.active && (
                          <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">
                            Inactif
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-gray-800 text-sm">
                        {f.question}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          testChatbot(f.question);
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Tester dans le chatbot"
                      >
                        <MessageSquare size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleActive(f);
                        }}
                        className={`p-1.5 rounded-lg ${
                          f.active
                            ? "text-gray-400 hover:text-red-600 hover:bg-red-50"
                            : "text-gray-400 hover:text-ev-600 hover:bg-ev-50"
                        }`}
                        title={f.active ? "Désactiver" : "Activer"}
                      >
                        {f.active ? <Power size={13} /> : <CheckCircle2 size={13} />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(f);
                        }}
                        className="p-1.5 text-gray-400 hover:text-ev-600 hover:bg-ev-50 rounded-lg"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(f);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={13} />
                      </button>
                      {expanded === f.id_faq ? (
                        <ChevronUp size={16} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                  {expanded === f.id_faq && (
                    <div className="px-4 pb-4 text-sm text-gray-600 bg-gray-50 whitespace-pre-wrap">
                      {f.reponse}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
            </div>

            <aside className="rounded-2xl border border-gray-200 bg-white p-4 xl:sticky xl:top-4 xl:self-start">
              <div className="flex items-center gap-2">
                <Bot size={16} className="text-ev-700" />
                <h2 className="text-sm font-bold text-gray-900">Test chatbot FAQ</h2>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Vérifiez si une question admin est bien reprise par le chatbot public.
              </p>
              <textarea
                value={chatQuestion}
                onChange={(e) => setChatQuestion(e.target.value)}
                rows={4}
                placeholder="Ex: Comment demander un devis ?"
                className="mt-4 w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ev-500"
              />
              <button
                onClick={() => testChatbot()}
                disabled={!chatQuestion.trim() || chatLoading}
                className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-ev-700 text-sm font-medium text-white hover:bg-ev-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {chatLoading ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <MessageSquare size={15} />
                )}
                Tester la réponse
              </button>
              {chatAnswer && (
                <div className="mt-4 rounded-xl border border-ev-100 bg-ev-50 p-3 text-sm leading-6 text-gray-700 whitespace-pre-wrap">
                  {chatAnswer}
                </div>
              )}
              {topFaqs.some((f) => (f.nb_consultations ?? 0) > 0) && (
                <div className="mt-5 border-t border-gray-100 pt-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Top FAQ</p>
                  <div className="mt-2 space-y-2">
                    {topFaqs.map((f) => (
                      <button
                        key={f.id_faq}
                        onClick={() => testChatbot(f.question)}
                        className="block w-full rounded-lg border border-gray-100 p-2 text-left text-xs text-gray-600 hover:border-ev-200 hover:bg-ev-50"
                      >
                        <span className="font-semibold text-gray-800">{f.question}</span>
                        <span className="mt-1 block text-gray-400">{f.nb_consultations ?? 0} consultation(s)</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="font-bold text-gray-900">
                {modal === "create" ? "Nouvelle question" : "Modifier la FAQ"}
              </h2>
              <button
                onClick={() => setModal(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4">
              {err && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                  {err}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Question *
                </label>
                <input
                  value={form.question}
                  onChange={(e) =>
                    setForm({ ...form, question: e.target.value })
                  }
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Réponse *
                </label>
                <textarea
                  value={form.reponse}
                  onChange={(e) =>
                    setForm({ ...form, reponse: e.target.value })
                  }
                  rows={5}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Rubrique
                  </label>
                  <input
                    value={form.rubrique}
                    onChange={(e) =>
                      setForm({ ...form, rubrique: e.target.value })
                    }
                    list="faq-cats"
                    placeholder="ex: Irrigation"
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500"
                  />
                  <datalist id="faq-cats">
                    {categories.map((c) => (
                      <option key={c} value={c!} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Ordre
                  </label>
                  <input
                    type="number"
                    value={form.ordre}
                    onChange={(e) =>
                      setForm({ ...form, ordre: Number(e.target.value) })
                    }
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm({ ...form, active: e.target.checked })
                  }
                  className="accent-ev-600"
                />
                FAQ active (visible sur le site)
              </label>
            </div>
            <div className="p-5 pt-0 flex gap-3">
              <button
                onClick={() => setModal(null)}
                className="flex-1 h-10 border text-sm text-gray-600 rounded-xl hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 h-10 bg-ev-700 text-white text-sm rounded-xl hover:bg-ev-800 disabled:opacity-60 flex items-center justify-center"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : modal === "create" ? (
                  "Créer"
                ) : (
                  "Enregistrer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
