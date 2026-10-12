const Icon = ({ type }) => {
  const common = { width:16,height:16,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2 };
  const paths = {
    general:<><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
    warehouse:<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    inventory:<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>,
    users:<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    notifications:<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    integrations:<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
    backup:<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    security:<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    audit:<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
  };
  return <svg {...common}>{paths[type]}</svg>;
};

export const NAV_ITEMS=[
  ["general","General","Company, system and localization"],
  ["warehouse","Warehouse","Manage warehouses and locations"],
  // ["users","Users & Roles","Default roles and permissions"],
  ["notifications","Notifications","Email and system alerts"],
  ["integrations","Integrations","Third-party services and API"],
  // ["backup","Backup & Restore","Data backup and restore"],
  ["security","Security","Password, sessions and policies"],
  ["audit","Audit","Audit log and retention settings"],
].map(([key,label,sub])=>({key,label,sub,icon:<Icon type={key}/>}));

export default function SettingsSidebar({activeSection,onChange,navOpen}) {
  return <div className={`st-nav${navOpen?" open":""}`} style={{background:"#fff",border:"1px solid #e4e7ef",borderRadius:12,overflow:"hidden",marginBottom:16}}>
    {NAV_ITEMS.map((item)=>{const active=activeSection===item.key;return <button key={item.key} type="button" onClick={()=>onChange(item.key)} style={{width:"100%",display:"flex",alignItems:"flex-start",gap:12,padding:"14px 16px",background:active?"#eef2ff":"#fff",border:"none",borderLeft:active?"3px solid #4f6ef7":"3px solid transparent",cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"background .15s"}}>
      <div style={{color:active?"#4f6ef7":"#6b7591",marginTop:1,flexShrink:0}}>{item.icon}</div>
      <div><div style={{fontSize:13,fontWeight:active?700:500,color:active?"#4f6ef7":"#1e2740",marginBottom:2}}>{item.label}</div><div style={{fontSize:11,color:"#9aa1b4",lineHeight:1.3}}>{item.sub}</div></div>
    </button>})}
  </div>;
}
