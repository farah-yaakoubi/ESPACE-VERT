"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  adminAdmins, isSuperAdmin, tokenStore,
  type AdminUser, type Role,
} from "@/lib/admin-api";
import {
  Plus, Edit2, Trash2, RefreshCw, Shield, User,
  Eye, EyeOff, CheckCircle, XCircle, AlertTriangle,
  Lock, Unlock, Key, Users, Search, MessageSquare,
  X, Check,
} from "lucide-react";
import { toast } from "@/components/admin/Toast";

const A = { accent:"#2e7d4f", accentL:"#3a9e63", gold:"#f59e0b", danger:"#ef4444" };

function fmt(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day:"2-digit", month:"short", year:"numeric" });
}

const ALL_PERMISSIONS = [
  { key:"produits.read",    label:"Voir produits",       group:"Catalogue" },
  { key:"produits.write",   label:"Modifier produits",   group:"Catalogue" },
  { key:"produits.delete",  label:"Supprimer produits",  group:"Catalogue" },
  { key:"marques.write",    label:"Modifier marques",    group:"Catalogue" },
  { key:"categories.write", label:"Modifier catégories", group:"Catalogue" },
  { key:"devis.read",       label:"Voir devis",          group:"CRM" },
  { key:"devis.write",      label:"Gérer devis",         group:"CRM" },
  { key:"rdv.read",         label:"Voir RDV",            group:"CRM" },
  { key:"rdv.write",        label:"Gérer RDV",           group:"CRM" },
  { key:"contact.read",     label:"Voir messages",       group:"CRM" },
  { key:"actualites.write", label:"Gérer actualités",    group:"Contenu" },
  { key:"faq.write",        label:"Gérer FAQ",           group:"Contenu" },
  { key:"analytics.read",   label:"Voir analytiques",    group:"Système" },
  { key:"visiteurs.read",   label:"Voir visiteurs",      group:"Système" },
  { key:"admins.read",      label:"Voir admins",         group:"Système" },
  { key:"admins.write",     label:"Gérer admins",        group:"Système" },
  { key:"chat.hidden",      label:"Masquer chat interne", group:"Système" },
];

const PERM_GROUPS = [...new Set(ALL_PERMISSIONS.map(p => p.group))];

// Traduit une clé permission en label lisible
const permLabel = (key: string) => ALL_PERMISSIONS.find(p => p.key === key)?.label ?? key;
const hasHiddenChat = (admin: AdminUser) => Array.isArray(admin.permissions) && admin.permissions.includes("chat.hidden");

function ConfirmDialog({ message, sub, onConfirm, onCancel }: {
  message: string; sub?: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={22} className="text-red-500" />
        </div>
        <p className="text-gray-800 font-semibold text-center text-sm mb-1">{message}</p>
        {sub && <p className="text-gray-400 text-xs text-center mb-5">{sub}</p>}
        {!sub && <div className="mb-5" />}
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 h-10 border border-gray-200 text-sm text-gray-600 rounded-xl hover:bg-gray-50">Annuler</button>
          <button onClick={onConfirm} className="flex-1 h-10 bg-red-500 hover:bg-red-600 text-white text-sm rounded-xl">Supprimer</button>
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ idRole, nom }: { idRole: number; nom: string }) {
  if (idRole === 1) return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
      <Shield size={9} /> Super Admin
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200">
      <User size={9} /> {nom}
    </span>
  );
}

function PermissionsPanel({ permissions, onChange }: { permissions: string[]; onChange: (p: string[]) => void }) {
  const toggle = (key: string) =>
    onChange(permissions.includes(key) ? permissions.filter(p => p !== key) : [...permissions, key]);
  const toggleGroup = (group: string) => {
    const keys = ALL_PERMISSIONS.filter(p => p.group === group).map(p => p.key);
    const allOn = keys.every(k => permissions.includes(k));
    onChange(allOn ? permissions.filter(p => !keys.includes(p)) : [...new Set([...permissions, ...keys])]);
  };
  return (
    <div className="space-y-3">
      {PERM_GROUPS.map(group => {
        const perms = ALL_PERMISSIONS.filter(p => p.group === group);
        const allOn = perms.every(p => permissions.includes(p.key));
        const someOn = perms.some(p => permissions.includes(p.key));
        return (
          <div key={group} className="border border-gray-100 rounded-xl overflow-hidden">
            <button onClick={() => toggleGroup(group)}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${allOn ? "bg-green-600 border-green-600" : someOn ? "bg-green-200 border-green-400" : "border-gray-300 bg-white"}`}>
                  {allOn && <Check size={9} className="text-white"/>}
                  {someOn && !allOn && <span className="w-2 h-0.5 bg-green-600 rounded"/>}
                </div>
                <span className="text-xs font-bold text-gray-700">{group}</span>
              </div>
              <span className="text-[10px] text-gray-400">{perms.filter(p => permissions.includes(p.key)).length}/{perms.length}</span>
            </button>
            <div className="grid grid-cols-2 gap-1 p-2">
              {perms.map(p => (
                <button key={p.key} onClick={() => toggle(p.key)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all text-left ${permissions.includes(p.key) ? "bg-green-50 text-green-700 border border-green-200" : "bg-white text-gray-500 border border-gray-100 hover:border-gray-200"}`}>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${permissions.includes(p.key) ? "bg-green-600 border-green-600" : "border-gray-300"}`}>
                    {permissions.includes(p.key) && <Check size={7} className="text-white"/>}
                  </div>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const EMPTY_FORM = { nom:"", email:"", password:"", id_role:2, actif:true, permissions:[] as string[] };
type ModalType = "create"|"edit"|"permissions"|"delete"|null;

export default function AdminAdminsPage() {
  const router = useRouter();
  const [admins,      setAdmins]      = useState<AdminUser[]>([]);
  const [roles,       setRoles]       = useState<Role[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [filterRole,  setFilterRole]  = useState("");
  const [modal,       setModal]       = useState<ModalType>(null);
  const [editing,     setEditing]     = useState<AdminUser|null>(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [showPwd,     setShowPwd]     = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [formErr,     setFormErr]     = useState("");
  const [deleteTarget,setDeleteTarget]= useState<AdminUser|null>(null);
  const [permTarget,  setPermTarget]  = useState<AdminUser|null>(null);
  const [tempPerms,   setTempPerms]   = useState<string[]>([]);
  const currentAdmin = tokenStore.getAdmin();

  useEffect(() => { if (!isSuperAdmin(tokenStore.getAdmin())) router.replace("/admin/dashboard"); }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, r] = await Promise.all([adminAdmins.list(), adminAdmins.getRoles()]);
      setAdmins(Array.isArray(a) ? a : (a as any).data ?? []);
      setRoles(Array.isArray(r) ? r : (r as any).data ?? []);
    } catch (e) { toast.error("Erreur", (e as Error).message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const duplicates = useMemo(() => {
    const seen = new Map<string, number[]>();
    admins.forEach(a => { const k = a.email.toLowerCase(); seen.set(k, [...(seen.get(k)??[]), a.id_admin]); });
    const dup = new Set<number>();
    seen.forEach(ids => { if (ids.length > 1) ids.forEach(id => dup.add(id)); });
    return dup;
  }, [admins]);

  const filtered = useMemo(() => admins.filter(a => {
    const q = search.toLowerCase();
    return (!q || a.nom.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)) &&
           (!filterRole || String(a.id_role) === filterRole);
  }), [admins, search, filterRole]);

  const openCreate = () => { setForm(EMPTY_FORM); setEditing(null); setFormErr(""); setModal("create"); };
  const openEdit = (a: AdminUser) => {
    setForm({ nom:a.nom, email:a.email, password:"", id_role:a.id_role, actif:a.actif, permissions: Array.isArray((a as any).permissions)?(a as any).permissions:[] });
    setEditing(a); setFormErr(""); setModal("edit");
  };
  const openPermissions = (a: AdminUser) => {
    setPermTarget(a); setTempPerms(Array.isArray((a as any).permissions)?(a as any).permissions:[]); setModal("permissions");
  };

  const handleSave = async () => {
    setFormErr("");
    if (!form.nom.trim())   { setFormErr("Le nom est requis."); return; }
    if (!form.email.trim()) { setFormErr("L'email est requis."); return; }
    if (modal==="create" && form.password.length < 8) { setFormErr("Mot de passe : 8 caractères minimum."); return; }
    if (modal==="edit" && form.password && form.password.length < 8) { setFormErr("Mot de passe : 8 caractères minimum."); return; }
    if (admins.some(a => a.email.toLowerCase()===form.email.toLowerCase() && a.id_admin!==editing?.id_admin)) {
      setFormErr("Cet email est déjà utilisé."); return;
    }
    setSaving(true);
    try {
      if (modal==="create") {
        await adminAdmins.create({ nom:form.nom, email:form.email, password:form.password, id_role:form.id_role });
        toast.success("Compte créé !");
      } else if (editing) {
        const p: any = { nom:form.nom, email:form.email, id_role:form.id_role, actif:form.actif };
        if (form.password) p.password = form.password;
        await adminAdmins.update(editing.id_admin, p);
        toast.success("Compte mis à jour !");
      }
      setModal(null); load();
    } catch (e) { setFormErr((e as Error).message); }
    finally { setSaving(false); }
  };

  const handleSavePermissions = async () => {
    if (!permTarget) return;
    setSaving(true);
    try {
      await adminAdmins.update(permTarget.id_admin, { permissions: tempPerms } as any);
      toast.success("Permissions mises à jour !"); setModal(null); load();
    } catch (e) { toast.error("Erreur", (e as Error).message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await adminAdmins.remove(deleteTarget.id_admin); toast.success("Compte supprimé."); setDeleteTarget(null); setModal(null); load(); }
    catch (e) { toast.error("Erreur", (e as Error).message); }
  };

  const handleToggleActif = async (a: AdminUser) => {
    try { await adminAdmins.update(a.id_admin, { actif: !a.actif } as any); toast.success(a.actif?"Désactivé":"Activé"); load(); }
    catch (e) { toast.error("Erreur", (e as Error).message); }
  };

  const handleToggleChat = async (a: AdminUser) => {
    const permissions = Array.isArray(a.permissions) ? [...a.permissions] : [];
    const nextPermissions = permissions.includes("chat.hidden")
      ? permissions.filter(p => p !== "chat.hidden")
      : [...permissions, "chat.hidden"];
    try {
      await adminAdmins.update(a.id_admin, { permissions: nextPermissions } as any);
      toast.success("Messagerie mise à jour", permissions.includes("chat.hidden") ? "Chat réactivé pour cet admin." : "Chat masqué pour cet admin.");
      load();
    } catch (e) {
      toast.error("Erreur", (e as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color:"var(--admin-text,#111)", letterSpacing:"-0.04em" }}>Administrateurs</h1>
          <p className="text-sm mt-0.5" style={{ color:"var(--admin-text3,#8da898)" }}>
            {admins.length} compte{admins.length!==1?"s":""}
            {duplicates.size>0 && <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200"><AlertTriangle size={9}/> {duplicates.size} doublon{duplicates.size>1?"s":""} détecté{duplicates.size>1?"s":""}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors" style={{color:"var(--admin-text3)"}}><RefreshCw size={15}/></button>
          <button onClick={openCreate} className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-all" style={{background:`linear-gradient(135deg,${A.accent},${A.accentL})`}}>
            <Plus size={15}/> Nouveau compte
          </button>
        </div>
      </div>

      {/* Alerte doublons */}
      {duplicates.size>0 && (
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-amber-200 bg-amber-50">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5"/>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">Doublons détectés — même email sur plusieurs comptes</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {admins.filter(a=>duplicates.has(a.id_admin)).map(a => (
                <span key={a.id_admin} className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-white border border-amber-200 text-amber-700 px-2 py-1 rounded-lg">
                  {a.nom} · {a.email}
                  {a.id_admin!==currentAdmin?.id_admin && (
                    <button onClick={()=>{setDeleteTarget(a);setModal("delete");}} className="ml-0.5 text-red-400 hover:text-red-600"><X size={10}/></button>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-3 flex-wrap p-4 rounded-2xl border" style={{background:"var(--admin-card,#fff)",borderColor:"var(--admin-border,#e5ede8)"}}>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:"var(--admin-text3)"}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nom ou email…"
            className="w-full h-9 pl-9 pr-3 text-sm rounded-xl border outline-none"
            style={{background:"var(--admin-input,#fff)",borderColor:"var(--admin-input-border,#e5ede8)",color:"var(--admin-text)"}}/>
        </div>
        <select value={filterRole} onChange={e=>setFilterRole(e.target.value)} className="h-9 px-3 text-sm rounded-xl border outline-none"
          style={{background:"var(--admin-input,#fff)",borderColor:"var(--admin-input-border,#e5ede8)",color:"var(--admin-text)"}}>
          <option value="">Tous les rôles</option>
          {roles.map(r=><option key={r.id_role} value={r.id_role}>{r.nom}</option>)}
        </select>
        {(search||filterRole) && <button onClick={()=>{setSearch("");setFilterRole("");}} className="h-9 px-3 text-xs rounded-xl border flex items-center gap-1.5 hover:bg-red-50 hover:text-red-600" style={{color:"var(--admin-text3)",borderColor:"var(--admin-border)"}}><X size={12}/> Réinitialiser</button>}
      </div>

      {/* Table — colonne Permissions supprimée */}
      <div className="rounded-2xl border overflow-hidden" style={{background:"var(--admin-card,#fff)",borderColor:"var(--admin-border,#e5ede8)"}}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-4 border-t-transparent rounded-full animate-spin" style={{borderColor:"#e2e8f0",borderTopColor:A.accent}}/>
          </div>
        ) : filtered.length===0 ? (
          <div className="text-center py-16" style={{color:"var(--admin-text3)"}}><Users size={32} className="mx-auto mb-3 opacity-30"/><p className="text-sm">Aucun administrateur trouvé</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{background:"var(--admin-table-head,#f8fafc)",borderBottom:"1px solid var(--admin-border,#e5ede8)"}}>
                  {["Compte","Email","Rôle","Statut","Créé","Actions"].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{color:"var(--admin-text3)"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a,i)=>{
                  const isDup=duplicates.has(a.id_admin), isMe=a.id_admin===currentAdmin?.id_admin, isSuper=a.id_role===1;
                  return (
                    <tr key={a.id_admin} style={{background:isDup?"rgba(245,158,11,0.04)":(i%2===0?"var(--admin-table-row,#fff)":"var(--admin-table-hover,#f8faf9)"),borderBottom:"1px solid var(--admin-border,#f0f4f1)",opacity:a.actif?1:0.5}}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                            style={{background:isSuper?`linear-gradient(135deg,#d97706,#f59e0b)`:`linear-gradient(135deg,${A.accent},${A.accentL})`}}>
                            {a.nom[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold leading-tight" style={{color:"var(--admin-text)"}}>
                              {a.nom}
                              {isMe && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-500">vous</span>}
                            </p>
                            {isDup && <span className="flex items-center gap-1 text-[10px] text-amber-600 font-semibold"><AlertTriangle size={8}/>Doublon</span>}
                            {hasHiddenChat(a) && <span className="flex items-center gap-1 text-[10px] text-purple-600 font-semibold"><MessageSquare size={8}/>Chat masqué</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="text-xs font-mono" style={{color:"var(--admin-text2)"}}>{a.email}</span></td>
                      <td className="px-4 py-3"><RoleBadge idRole={a.id_role} nom={a.role.nom}/></td>
                      <td className="px-4 py-3">
                        <button onClick={()=>!isMe&&handleToggleActif(a)} disabled={isMe}
                          className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg border transition-all ${isMe?"cursor-default opacity-60":"cursor-pointer hover:opacity-80"}`}
                          style={a.actif?{background:"#f0fdf4",color:"#16a34a",borderColor:"#bbf7d0"}:{background:"#fef2f2",color:"#dc2626",borderColor:"#fecaca"}}>
                          {a.actif?<><CheckCircle size={11}/>Actif</>:<><XCircle size={11}/>Inactif</>}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{color:"var(--admin-text3)"}}>{fmt(a.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={()=>openEdit(a)} title="Modifier" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors" style={{color:"var(--admin-text3)"}}><Edit2 size={13}/></button>
                          {!isSuper && <button onClick={()=>openPermissions(a)} title="Permissions" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors" style={{color:"var(--admin-text3)"}}><Key size={13}/></button>}
                          {!isSuper && !isMe && <button onClick={()=>handleToggleChat(a)} title={hasHiddenChat(a)?"Réactiver le chat":"Masquer le chat"} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition-colors" style={{color:hasHiddenChat(a)?"#7c3aed":"var(--admin-text3)"}}><MessageSquare size={13}/></button>}
                          {!isMe && <button onClick={()=>handleToggleActif(a)} title={a.actif?"Désactiver":"Activer"} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-amber-50 hover:text-amber-600 transition-colors" style={{color:"var(--admin-text3)"}}>{a.actif?<Lock size={13}/>:<Unlock size={13}/>}</button>}
                          {!isMe && <button onClick={()=>{setDeleteTarget(a);setModal("delete");}} title="Supprimer" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors" style={{color:"var(--admin-text3)"}}><Trash2 size={13}/></button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rôles — affiche les permissions choisies en labels lisibles */}
      {roles.length>0 && (
        <div className="rounded-2xl border p-5" style={{background:"var(--admin-card,#fff)",borderColor:"var(--admin-border,#e5ede8)"}}>
          <h2 className="font-bold mb-4 flex items-center gap-2 text-sm" style={{color:"var(--admin-text)"}}><Shield size={15} style={{color:A.accent}}/>Rôles et permissions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roles.map(r => {
              const perms: string[] = Array.isArray(r.permissions) ? r.permissions as string[] : [];
              return (
                <div key={r.id_role} className="p-3 rounded-xl border" style={{background:"var(--admin-surface2)",borderColor:"var(--admin-border)"}}>
                  <div className="flex items-center gap-2 mb-2"><RoleBadge idRole={r.id_role} nom={r.nom}/></div>
                  {r.id_role === 1 ? (
                    <p className="text-xs font-semibold" style={{color:A.gold}}>Accès complet à toutes les fonctionnalités</p>
                  ) : perms.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {perms.map(p => (
                        <span key={p} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                          {permLabel(p)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs" style={{color:"var(--admin-text3)"}}>Aucune permission attribuée</p>
                  )}
                </div>
              );
            })}

            {/* Permissions par admin (non-superadmin) */}
            {admins.filter(a => a.id_role !== 1).map(a => {
              const perms: string[] = Array.isArray((a as any).permissions) ? (a as any).permissions : [];
              if (perms.length === 0) return null;
              return (
                <div key={`admin-${a.id_admin}`} className="p-3 rounded-xl border border-dashed" style={{background:"var(--admin-surface2)",borderColor:"var(--admin-border)"}}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                      style={{background:`linear-gradient(135deg,${A.accent},${A.accentL})`}}>
                      {a.nom[0]?.toUpperCase()}
                    </div>
                    <span className="text-xs font-bold" style={{color:"var(--admin-text)"}}>{a.nom}</span>
                    <span className="text-[10px] text-gray-400">permissions spécifiques</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {perms.map(p => (
                      <span key={p} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {permLabel(p)}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Créer/Éditer */}
      {(modal==="create"||modal==="edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-bold text-gray-900">{modal==="create"?"Nouveau compte admin":`Modifier — ${editing?.nom}`}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{modal==="create"?"Tous les champs * sont requis":"Laissez le mot de passe vide pour ne pas le changer"}</p>
              </div>
              <button onClick={()=>setModal(null)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400"><X size={15}/></button>
            </div>
            <div className="p-5 space-y-4">
              {formErr && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-start gap-2"><AlertTriangle size={13} className="shrink-0 mt-0.5"/>{formErr}</div>}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{color:A.accent}}>Nom complet *</label>
                <input value={form.nom} onChange={e=>setForm({...form,nom:e.target.value})} placeholder="Prénom Nom"
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-300"/>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{color:A.accent}}>Email *</label>
                <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="admin@espacevert.tn"
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-300"/>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{color:A.accent}}>Mot de passe {modal==="edit"?"(optionnel)":"*"}</label>
                <div className="relative">
                  <input type={showPwd?"text":"password"} value={form.password} onChange={e=>setForm({...form,password:e.target.value})}
                    placeholder={modal==="edit"?"Laisser vide = inchangé":"Min. 8 caractères"}
                    className="w-full h-10 px-3 pr-10 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-300"/>
                  <button type="button" onClick={()=>setShowPwd(s=>!s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd?<EyeOff size={15}/>:<Eye size={15}/>}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-1.5 flex items-center gap-1">
                    {[8,12,16].map(n=><div key={n} className="flex-1 h-1 rounded-full transition-colors" style={{background:form.password.length>=n?"#16a34a":"#e5e7eb"}}/>)}
                    <span className="text-[10px] ml-1 font-medium" style={{color:form.password.length>=12?"#16a34a":form.password.length>=8?"#f59e0b":"#dc2626"}}>
                      {form.password.length>=12?"Fort":form.password.length>=8?"Moyen":"Faible"}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{color:A.accent}}>Rôle *</label>
                <select value={form.id_role} onChange={e=>setForm({...form,id_role:Number(e.target.value)})}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl outline-none bg-white focus:ring-2 focus:ring-green-300">
                  {roles.map(r=><option key={r.id_role} value={r.id_role}>{r.nom}</option>)}
                </select>
                {form.id_role===1 && <p className="mt-1 text-[11px] text-amber-600 flex items-center gap-1"><Shield size={9}/>Accès complet au système</p>}
              </div>
              {modal==="edit" && (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                  <input type="checkbox" id="actif-chk" checked={form.actif} onChange={e=>setForm({...form,actif:e.target.checked})} className="w-4 h-4 cursor-pointer" style={{accentColor:A.accent}}/>
                  <label htmlFor="actif-chk" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2">
                    {form.actif?<><CheckCircle size={14} className="text-green-600"/>Compte actif</>:<><XCircle size={14} className="text-red-500"/>Compte inactif</>}
                  </label>
                </div>
              )}
            </div>
            <div className="p-5 pt-0 flex gap-3">
              <button onClick={()=>setModal(null)} className="flex-1 h-10 border border-gray-200 text-sm text-gray-600 rounded-xl hover:bg-gray-50">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 h-10 text-white text-sm font-semibold rounded-xl disabled:opacity-60 flex items-center justify-center gap-2 hover:opacity-90" style={{background:`linear-gradient(135deg,${A.accent},${A.accentL})`}}>
                {saving?<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>:<Check size={15}/>}
                {modal==="create"?"Créer le compte":"Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Permissions */}
      {modal==="permissions" && permTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="p-5 border-b flex items-center justify-between shrink-0">
              <div>
                <h2 className="font-bold text-gray-900 flex items-center gap-2"><Key size={15} style={{color:A.accent}}/>Permissions — {permTarget.nom}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{tempPerms.length} permission{tempPerms.length!==1?"s":""} sélectionnée{tempPerms.length!==1?"s":""}</p>
              </div>
              <button onClick={()=>setModal(null)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400"><X size={15}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex gap-2 mb-4">
                <button onClick={()=>setTempPerms(ALL_PERMISSIONS.map(p=>p.key))} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border hover:bg-green-50 hover:text-green-700 hover:border-green-300 text-gray-500 border-gray-200"><Check size={10}/>Tout sélectionner</button>
                <button onClick={()=>setTempPerms([])} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-500 border-gray-200"><X size={10}/>Tout désélectionner</button>
              </div>
              <PermissionsPanel permissions={tempPerms} onChange={setTempPerms}/>
            </div>
            <div className="p-5 border-t flex gap-3 shrink-0">
              <button onClick={()=>setModal(null)} className="flex-1 h-10 border border-gray-200 text-sm text-gray-600 rounded-xl hover:bg-gray-50">Annuler</button>
              <button onClick={handleSavePermissions} disabled={saving} className="flex-1 h-10 text-white text-sm font-semibold rounded-xl disabled:opacity-60 flex items-center justify-center gap-2" style={{background:`linear-gradient(135deg,${A.accent},${A.accentL})`}}>
                {saving?<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>:<Check size={15}/>} Confirmer les permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Supprimer */}
      {modal==="delete" && deleteTarget && (
        <ConfirmDialog message={`Supprimer ${deleteTarget.nom} ?`} sub={`${deleteTarget.email} — irréversible.`} onConfirm={handleDelete} onCancel={()=>{setModal(null);setDeleteTarget(null);}}/>
      )}
    </div>
  );
}
