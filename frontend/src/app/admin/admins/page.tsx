"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  adminAdmins, isSuperAdmin, tokenStore,
  type AdminUser, type Role
} from "@/lib/admin-api";
import {
  Plus, Edit2, Trash2, RefreshCw, Shield, User,
  Eye, EyeOff, CheckCircle, XCircle
} from "lucide-react";

function fmt(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day:"2-digit", month:"2-digit", year:"numeric" });
}

const EMPTY_FORM = { nom:"", email:"", password:"", id_role:2, actif:true };

export default function AdminAdminsPage() {
  const router = useRouter();
  const [admins,   setAdmins]   = useState<AdminUser[]>([]);
  const [roles,    setRoles]    = useState<Role[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [modal,    setModal]    = useState<"create"|"edit"|null>(null);
  const [editing,  setEditing]  = useState<AdminUser | null>(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [showPwd,  setShowPwd]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [formErr,  setFormErr]  = useState("");

  // Garde : superAdmin seulement
  useEffect(() => {
    const a = tokenStore.getAdmin();
    if (!isSuperAdmin(a)) { router.replace("/admin/dashboard"); }
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [adminsData, rolesData] = await Promise.all([
        adminAdmins.list(),
        adminAdmins.getRoles(),
      ]);
      setAdmins(Array.isArray(adminsData) ? adminsData : (adminsData as any).data ?? []);
      setRoles(Array.isArray(rolesData)   ? rolesData  : (rolesData as any).data  ?? []);
    } catch(e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setFormErr("");
    setModal("create");
  };

  const openEdit = (a: AdminUser) => {
    setForm({ nom: a.nom, email: a.email, password: "", id_role: a.id_role, actif: a.actif });
    setEditing(a);
    setFormErr("");
    setModal("edit");
  };

  const handleSave = async () => {
    setFormErr("");
    if (!form.nom.trim())   { setFormErr("Le nom est requis."); return; }
    if (!form.email.trim()) { setFormErr("L'email est requis."); return; }
    if (modal === "create" && form.password.length < 8) {
      setFormErr("Mot de passe : 8 caractères minimum."); return;
    }
    if (modal === "edit" && form.password && form.password.length < 8) {
      setFormErr("Mot de passe : 8 caractères minimum."); return;
    }

    setSaving(true);
    try {
      if (modal === "create") {
        await adminAdmins.create({
          nom: form.nom, email: form.email,
          password: form.password, id_role: form.id_role,
        });
      } else if (modal === "edit" && editing) {
        const payload: any = { nom: form.nom, email: form.email, id_role: form.id_role, actif: form.actif };
        if (form.password) payload.password = form.password;
        await adminAdmins.update(editing.id_admin, payload);
      }
      setModal(null);
      load();
    } catch(e) {
      setFormErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (a: AdminUser) => {
    if (!confirm(`Supprimer ${a.nom} ? Cette action est irréversible.`)) return;
    try {
      await adminAdmins.remove(a.id_admin);
      load();
    } catch(e) {
      alert((e as Error).message);
    }
  };

  const currentAdmin = tokenStore.getAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administrateurs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {admins.length} compte{admins.length !== 1 ? "s" : ""} — accès Super Admin requis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-xl hover:bg-gray-100">
            <RefreshCw size={15} />
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-ev-700 hover:bg-ev-800 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            <Plus size={16} />
            Nouveau compte
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-2xl">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-4 border-ev-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : admins.length === 0 ? (
          <div className="text-center py-16 text-gray-400">Aucun administrateur</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Nom","Email","Rôle","Statut","Créé le","Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admins.map(a => (
                  <tr key={a.id_admin} className={`hover:bg-gray-50 ${!a.actif ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-ev-100 flex items-center justify-center shrink-0">
                          {a.id_role === 1
                            ? <Shield size={14} className="text-yellow-600" />
                            : <User size={14} className="text-ev-600" />
                          }
                        </div>
                        <span className="font-medium text-gray-800">
                          {a.nom}
                          {a.id_admin === currentAdmin?.id_admin && (
                            <span className="ml-2 text-xs text-gray-400">(vous)</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{a.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${a.id_role === 1 ? "bg-yellow-100 text-yellow-700" : "bg-ev-50 text-ev-700"}`}>
                        {a.role.nom}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {a.actif
                        ? <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle size={13} />Actif</span>
                        : <span className="flex items-center gap-1 text-xs text-red-500"><XCircle size={13} />Inactif</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{fmt(a.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(a)}
                          className="p-1.5 text-gray-400 hover:text-ev-600 hover:bg-ev-50 rounded-lg transition-colors">
                          <Edit2 size={14} />
                        </button>
                        {a.id_admin !== currentAdmin?.id_admin && (
                          <button onClick={() => handleDelete(a)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tableau des rôles */}
      {roles.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Shield size={16} className="text-ev-600" />
            Rôles disponibles
          </h2>
          <div className="space-y-2">
            {roles.map(r => (
              <div key={r.id_role} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                  ${r.id_role === 1 ? "bg-yellow-100 text-yellow-700" : "bg-ev-50 text-ev-700"}`}>
                  {r.nom}
                </span>
                <span className="text-xs text-gray-400">
                  {Array.isArray(r.permissions) && r.permissions.length > 0
                    ? r.permissions.join(", ")
                    : "Permissions standard"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal créer / éditer */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {modal === "create" ? "Créer un compte admin" : `Modifier — ${editing?.nom}`}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
            </div>

            <div className="p-6 space-y-4">
              {formErr && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{formErr}</div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nom complet *</label>
                <input value={form.nom} onChange={e => setForm({...form, nom: e.target.value})}
                  placeholder="Prénom Nom"
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="admin@espacevert.tn"
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Mot de passe {modal === "edit" ? "(laisser vide = inchangé)" : "*"}
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    placeholder="8 caractères minimum"
                    className="w-full h-10 px-3 pr-10 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rôle *</label>
                <select value={form.id_role} onChange={e => setForm({...form, id_role: Number(e.target.value)})}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white">
                  {roles.map(r => (
                    <option key={r.id_role} value={r.id_role}>{r.nom}</option>
                  ))}
                </select>
              </div>

              {modal === "edit" && (
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="actif-check" checked={form.actif}
                    onChange={e => setForm({...form, actif: e.target.checked})}
                    className="w-4 h-4 accent-ev-600" />
                  <label htmlFor="actif-check" className="text-sm text-gray-700">Compte actif</label>
                </div>
              )}
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <button onClick={() => setModal(null)}
                className="flex-1 h-10 border border-gray-200 text-sm text-gray-600 rounded-xl hover:bg-gray-50">
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 h-10 bg-ev-700 text-white text-sm rounded-xl hover:bg-ev-800 disabled:opacity-60 flex items-center justify-center gap-2">
                {saving
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : null
                }
                {modal === "create" ? "Créer" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
