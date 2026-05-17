"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Lock, Camera, Save, Eye, EyeOff, Trash2,
  CheckCircle, AlertCircle, Loader2, Shield,
  Crown, Clock, Hash, KeyRound, User, Upload,
} from "lucide-react";
import { adminAuth, adminCompte, adminUpload, tokenStore, type Admin } from "@/lib/admin-api";
import { useTheme } from "@/hooks/useTheme";

const G = { accent:"#2e7d4f", accentLt:"#3a9e63", accentXl:"#4fbb7a", gold:"#f59e0b" };

/* ── Toast ── */
function Toast({ type, msg, onClose }: { type:"ok"|"err"; msg:string; onClose:()=>void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position:"fixed", bottom:24, right:24, zIndex:9999,
      display:"flex", alignItems:"center", gap:10,
      padding:"12px 18px", borderRadius:12,
      background:type==="ok"?"#052e16":"#450a0a",
      border:`1px solid ${type==="ok"?"#166534":"#7f1d1d"}`,
      boxShadow:"0 8px 32px rgba(0,0,0,0.4)",
      color:type==="ok"?"#4ade80":"#f87171",
      fontSize:13, fontWeight:600,
    }}>
      {type==="ok" ? <CheckCircle size={15}/> : <AlertCircle size={15}/>}
      {msg}
    </div>
  );
}

/* ── Indicateur force MDP ── */
function PwdStrength({ pwd }: { pwd:string }) {
  if (!pwd) return null;
  const s = (pwd.length>=8?1:0)+(/[A-Z]/.test(pwd)?1:0)+(/[0-9]/.test(pwd)?1:0)+(/[^A-Za-z0-9]/.test(pwd)?1:0);
  const colors = ["#ef4444","#f97316","#eab308","#22c55e"];
  const labels = ["Très faible","Faible","Moyen","Fort"];
  return (
    <div>
      <div style={{display:"flex",gap:4,marginBottom:4}}>
        {[1,2,3,4].map(i=>(
          <div key={i} style={{flex:1,height:3,borderRadius:99,background:i<=s?colors[s-1]:"rgba(128,128,128,0.15)",transition:"background 0.2s"}}/>
        ))}
      </div>
      <p style={{fontSize:11,color:colors[s-1],fontWeight:600}}>{labels[s-1]}</p>
    </div>
  );
}

/* ── Modale de confirmation suppression avatar ── */
function ConfirmModal({ onConfirm, onCancel, isDark }: { onConfirm:()=>void; onCancel:()=>void; isDark:boolean }) {
  const bg  = isDark?"#1e2d22":"#fff";
  const bdr = isDark?"rgba(255,255,255,0.08)":"#e5ede8";
  const t1  = isDark?"#e8f0ea":"#111816";
  const t2  = isDark?"rgba(232,240,234,0.5)":"#5a7a63";
  return (
    <div style={{position:"fixed",inset:0,zIndex:9998,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.55)",backdropFilter:"blur(4px)"}}
      onClick={onCancel}>
      <div style={{background:bg,border:`1px solid ${bdr}`,borderRadius:16,padding:28,maxWidth:360,width:"90%",boxShadow:"0 16px 48px rgba(0,0,0,0.35)"}}
        onClick={e=>e.stopPropagation()}>
        <div style={{width:48,height:48,borderRadius:12,background:"rgba(239,68,68,0.12)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16}}>
          <Trash2 size={22} color="#ef4444"/>
        </div>
        <p style={{fontWeight:800,fontSize:16,color:t1,marginBottom:8}}>Supprimer la photo</p>
        <p style={{fontSize:13,color:t2,lineHeight:1.5,marginBottom:22}}>Cette action est irréversible. Votre initiale sera affichée à la place.</p>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onCancel}
            style={{flex:1,padding:"10px 0",borderRadius:10,border:`1px solid ${bdr}`,background:"transparent",color:t2,fontSize:13,fontWeight:600,cursor:"pointer"}}>
            Annuler
          </button>
          <button onClick={onConfirm}
            style={{flex:1,padding:"10px 0",borderRadius:10,border:"none",background:"#ef4444",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:"0 3px 10px rgba(239,68,68,0.3)"}}>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ComptePage() {
  const { isDark } = useTheme();
  const [admin, setAdmin]   = useState<Admin|null>(()=>tokenStore.getAdmin());
  const [nom,   setNom]     = useState(admin?.nom??"");
  const [email, setEmail]   = useState(admin?.email??"");
  const [saving,    setSaving]    = useState(false);
  const [curPwd,    setCurPwd]    = useState("");
  const [newPwd,    setNewPwd]    = useState("");
  const [confPwd,   setConfPwd]   = useState("");
  const [showPwd,   setShowPwd]   = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [avatarLoading,  setAvatarLoading]  = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const [showDeleteModal,setShowDeleteModal]= useState(false);
  const [toast, setToast] = useState<{type:"ok"|"err";msg:string}|null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const notify  = useCallback((type:"ok"|"err", msg:string) => setToast({type,msg}), []);

  useEffect(() => {
    adminAuth.me().then(a => {
      setAdmin(a); tokenStore.setAdmin(a);
      setNom(a.nom??""); setEmail(a.email??"");
    }).catch(()=>{});
  }, []);

  const isSuperAdmin = admin?.id_role === 1;

  // ── Couleurs thème ──
  const bg   = isDark?"#0d1810":"#f0f4f1";
  const card = isDark?"#162117":"#ffffff";
  const bdr  = isDark?"rgba(255,255,255,0.07)":"#e5ede8";
  const t1   = isDark?"#e8f0ea":"#111816";
  const t2   = isDark?"rgba(232,240,234,0.5)":"#5a7a63";
  const t3   = isDark?"rgba(232,240,234,0.25)":"#9ab5a0";
  const inBg = isDark?"rgba(255,255,255,0.04)":"#f8faf9";
  const inBdr= isDark?"rgba(255,255,255,0.09)":"#dde8e1";
  const hdr  = isDark?"#111e14":"#f8faf9";
  const spin = "spin 1s linear infinite";

  // ── Upload avatar (modifier) ──
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5*1024*1024) { notify("err","Image trop lourde (max 5 Mo)"); return; }
    setAvatarLoading(true);
    try {
      const res = await adminUpload.image(file);
      const url = (res as any)?.url ?? res;
      const u   = await adminCompte.updateMe({ avatar: url as string });
      setAdmin(u); tokenStore.setAdmin(u);
      notify("ok","Photo de profil modifiée");
    } catch(e:any) { notify("err", e.message??"Erreur upload"); }
    finally { setAvatarLoading(false); e.target.value=""; }
  };

  // ── Supprimer avatar ──
  const handleDeleteAvatar = async () => {
    setShowDeleteModal(false);
    setDeletingAvatar(true);
    try {
      const u = await adminCompte.updateMe({ avatar: null });
      setAdmin(u); tokenStore.setAdmin(u);
      notify("ok","Photo de profil supprimée");
    } catch(e:any) { notify("err", e.message??"Erreur suppression"); }
    finally { setDeletingAvatar(false); }
  };

  // ── Sauvegarde profil ──
  const handleSaveProfil = async () => {
    if (!nom.trim())   return notify("err","Le nom est requis");
    if (!email.trim()) return notify("err","L'email est requis");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return notify("err","Email invalide");
    setSaving(true);
    try {
      const u = await adminCompte.updateMe({ nom:nom.trim(), email:email.trim().toLowerCase() });
      setAdmin(u); tokenStore.setAdmin(u);
      notify("ok","Profil mis à jour");
    } catch(e:any) { notify("err", e.message??"Erreur lors de la mise à jour"); }
    finally { setSaving(false); }
  };

  // ── Changement MDP ──
  const handleSavePwd = async () => {
    if (!curPwd)            return notify("err","Mot de passe actuel requis");
    if (!newPwd)            return notify("err","Nouveau mot de passe requis");
    if (newPwd.length < 8)  return notify("err","Minimum 8 caractères");
    if (newPwd !== confPwd) return notify("err","Les mots de passe ne correspondent pas");
    if (newPwd === curPwd)  return notify("err","Le nouveau mot de passe doit être différent");
    setPwdSaving(true);
    try {
      await adminAuth.changePassword(curPwd, newPwd);
      notify("ok","Mot de passe modifié avec succès");
      setCurPwd(""); setNewPwd(""); setConfPwd("");
    } catch(e:any) { notify("err", e.message??"Mot de passe actuel incorrect"); }
    finally { setPwdSaving(false); }
  };

  const btnPrimary: React.CSSProperties = {
    display:"flex",alignItems:"center",gap:8,
    padding:"10px 22px",borderRadius:10,border:"none",
    fontSize:13,fontWeight:700,cursor:"pointer",
    background:`linear-gradient(135deg,${G.accent},${G.accentLt})`,
    color:"#fff",boxShadow:"0 3px 12px rgba(46,125,79,0.3)",
    transition:"opacity 0.15s",
  };

  const Field = ({ label, val, onChange, type="text", placeholder, suffix }: {
    label:string; val:string; onChange?:(v:string)=>void;
    type?:string; placeholder?:string; suffix?:React.ReactNode;
  }) => (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      <label style={{fontSize:11,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:t3}}>
        {label}
      </label>
      <div style={{position:"relative",display:"flex",alignItems:"center"}}>
        <input type={type} value={val}
          onChange={onChange?e=>onChange(e.target.value):undefined}
          readOnly={!onChange} placeholder={placeholder}
          style={{width:"100%",padding:"10px 40px 10px 14px",background:inBg,border:`1px solid ${inBdr}`,borderRadius:10,color:t1,fontSize:13,fontWeight:500,outline:"none",boxSizing:"border-box",transition:"border-color 0.15s"}}
          onFocus={e=>{e.target.style.borderColor=G.accent}}
          onBlur={e=>{e.target.style.borderColor=inBdr}}
        />
        {suffix && <div style={{position:"absolute",right:12,display:"flex",alignItems:"center"}}>{suffix}</div>}
      </div>
    </div>
  );

  const SectionCard = ({ title, icon:Icon, children }: { title:string; icon:any; children:React.ReactNode }) => (
    <div style={{background:card,border:`1px solid ${bdr}`,borderRadius:16,overflow:"hidden",boxShadow:isDark?"0 2px 24px rgba(0,0,0,0.3)":"0 2px 16px rgba(0,0,0,0.06)"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 20px",borderBottom:`1px solid ${bdr}`,background:hdr}}>
        <div style={{width:32,height:32,borderRadius:8,flexShrink:0,background:`linear-gradient(135deg,${G.accent},${G.accentXl})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(46,125,79,0.3)"}}>
          <Icon size={14} color="#fff"/>
        </div>
        <p style={{fontWeight:700,fontSize:14,color:t1}}>{title}</p>
      </div>
      <div style={{padding:24}}>{children}</div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:bg,padding:"0 0 48px"}}>
      <style>{`
        @keyframes spin { to { transform:rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0;transform:translateY(6px) } to { opacity:1;transform:translateY(0) } }
        input::placeholder { color:${t3}; }
      `}</style>

      <div style={{maxWidth:660,margin:"0 auto",padding:"0 16px"}}>
        <div style={{marginBottom:28,paddingTop:4}}>
          <h1 style={{fontSize:22,fontWeight:800,color:t1,letterSpacing:"-0.02em",marginBottom:4}}>Mon compte</h1>
          <p style={{fontSize:13,color:t2}}>Gérez votre profil et votre sécurité</p>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:20}}>

          {/* ══ Profil ══ */}
          <SectionCard title="Informations personnelles" icon={User}>

            {/* ── Avatar ── */}
            <div style={{display:"flex",alignItems:"flex-start",gap:20,paddingBottom:24,marginBottom:24,borderBottom:`1px solid ${bdr}`}}>

              {/* Photo */}
              <div style={{position:"relative",flexShrink:0}}>
                {admin?.avatar ? (
                  <img src={admin.avatar} alt={admin.nom}
                    style={{width:80,height:80,borderRadius:"50%",objectFit:"cover",
                      border:`3px solid ${G.accent}`,
                      boxShadow:"0 4px 16px rgba(46,125,79,0.3)"}}/>
                ) : (
                  <div style={{width:80,height:80,borderRadius:"50%",
                    background:`linear-gradient(135deg,${G.accent},${G.accentXl})`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:30,fontWeight:800,color:"#fff",
                    border:`3px solid ${G.accentLt}`,
                    boxShadow:"0 4px 16px rgba(46,125,79,0.4)"}}>
                    {admin?.nom?.[0]?.toUpperCase()??"A"}
                  </div>
                )}

                {/* Indicateur chargement */}
                {(avatarLoading || deletingAvatar) && (
                  <div style={{position:"absolute",inset:0,borderRadius:"50%",background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Loader2 size={22} color="#fff" style={{animation:spin}}/>
                  </div>
                )}
              </div>

              {/* Infos + boutons avatar */}
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontWeight:800,fontSize:17,color:t1,marginBottom:2}}>{admin?.nom??"—"}</p>
                <p style={{fontSize:12,color:t2,marginBottom:12}}>{admin?.email??"—"}</p>

                {/* Badges */}
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
                  <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:99,fontSize:10,fontWeight:700,background:isSuperAdmin?"rgba(245,158,11,0.15)":"rgba(46,125,79,0.12)",color:isSuperAdmin?G.gold:G.accentXl,border:`1px solid ${isSuperAdmin?"rgba(245,158,11,0.25)":"rgba(46,125,79,0.2)"}`}}>
                    {isSuperAdmin && <Crown size={8}/>}
                    {isSuperAdmin?"Super Administrateur":((admin as any)?.role?.nom??"Administrateur")}
                  </span>
                  <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:99,fontSize:10,fontWeight:600,background:isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)",color:t3}}>
                    <Hash size={8}/> ID {admin?.id_admin??"—"}
                  </span>
                  {(admin as any)?.created_at && (
                    <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:99,fontSize:10,fontWeight:600,background:isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)",color:t3}}>
                      <Clock size={8}/>
                      Depuis {new Date((admin as any).created_at).toLocaleDateString("fr-FR",{month:"long",year:"numeric"})}
                    </span>
                  )}
                </div>

                {/* Boutons modifier / supprimer avatar */}
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <button
                    onClick={()=>fileRef.current?.click()}
                    disabled={avatarLoading||deletingAvatar}
                    style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:8,border:`1px solid ${isDark?"rgba(46,125,79,0.35)":"#c2d9c8"}`,background:isDark?"rgba(46,125,79,0.1)":"#f0faf4",color:G.accent,fontSize:12,fontWeight:700,cursor:"pointer",transition:"all 0.15s"}}>
                    <Upload size={12}/>
                    {admin?.avatar ? "Modifier la photo" : "Ajouter une photo"}
                  </button>

                  {admin?.avatar && (
                    <button
                      onClick={()=>setShowDeleteModal(true)}
                      disabled={avatarLoading||deletingAvatar}
                      style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:8,border:"1px solid rgba(239,68,68,0.25)",background:isDark?"rgba(239,68,68,0.08)":"#fff5f5",color:"#ef4444",fontSize:12,fontWeight:700,cursor:"pointer",transition:"all 0.15s"}}>
                      <Trash2 size={12}/>
                      Supprimer la photo
                    </button>
                  )}
                </div>

                <p style={{fontSize:11,color:t3,marginTop:8}}>JPG, PNG ou WebP · Max 5 Mo</p>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{display:"none"}} onChange={handleAvatarChange}/>
              </div>
            </div>

            {/* Champs nom / email */}
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <Field label="Nom complet"   val={nom}   onChange={setNom}   placeholder="Votre nom"/>
              <Field label="Adresse email" val={email} onChange={setEmail} type="email" placeholder="votre@email.com"/>
            </div>

            <div style={{marginTop:20,display:"flex",justifyContent:"flex-end"}}>
              <button onClick={handleSaveProfil} disabled={saving}
                style={{...btnPrimary,opacity:saving?0.6:1,cursor:saving?"wait":"pointer"}}>
                {saving ? <Loader2 size={14} style={{animation:spin}}/> : <Save size={14}/>}
                {saving?"Enregistrement…":"Enregistrer"}
              </button>
            </div>
          </SectionCard>

          {/* ══ Sécurité ══ */}
          <SectionCard title="Sécurité & mot de passe" icon={KeyRound}>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <Field label="Mot de passe actuel" val={curPwd} onChange={setCurPwd}
                type={showPwd?"text":"password"} placeholder="••••••••"
                suffix={
                  <button type="button" onClick={()=>setShowPwd(v=>!v)}
                    style={{background:"none",border:"none",cursor:"pointer",color:t3,display:"flex",alignItems:"center",padding:0}}>
                    {showPwd?<EyeOff size={14}/>:<Eye size={14}/>}
                  </button>
                }
              />
              <div style={{height:1,background:bdr}}/>
              <Field label="Nouveau mot de passe" val={newPwd} onChange={setNewPwd}
                type={showPwd?"text":"password"} placeholder="Minimum 8 caractères"/>
              <PwdStrength pwd={newPwd}/>
              <Field label="Confirmer le nouveau mot de passe" val={confPwd} onChange={setConfPwd}
                type={showPwd?"text":"password"} placeholder="Répétez le nouveau mot de passe"
                suffix={confPwd&&newPwd
                  ? (confPwd===newPwd?<CheckCircle size={14} color="#22c55e"/>:<AlertCircle size={14} color="#ef4444"/>)
                  : undefined
                }
              />
            </div>
            <div style={{marginTop:20,display:"flex",justifyContent:"flex-end"}}>
              <button onClick={handleSavePwd} disabled={pwdSaving}
                style={{...btnPrimary,opacity:pwdSaving?0.6:1,cursor:pwdSaving?"wait":"pointer"}}>
                {pwdSaving?<Loader2 size={14} style={{animation:spin}}/>:<Shield size={14}/>}
                {pwdSaving?"Modification…":"Modifier le mot de passe"}
              </button>
            </div>
          </SectionCard>

        </div>
      </div>

      {/* Modale confirmation suppression */}
      {showDeleteModal && (
        <ConfirmModal
          isDark={isDark}
          onConfirm={handleDeleteAvatar}
          onCancel={()=>setShowDeleteModal(false)}
        />
      )}

      {toast && <Toast type={toast.type} msg={toast.msg} onClose={()=>setToast(null)}/>}
    </div>
  );
}