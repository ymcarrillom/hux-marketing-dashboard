'use client';

import { useEffect, useState, useRef } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell,
  Tooltip as RTooltip, BarChart, Bar, XAxis, YAxis,
  LineChart, Line, CartesianGrid,
} from 'recharts';

type Lead = Record<string, string>;

const C1    = '#ffffff';
const C2    = '#EE7B30';
const C3    = '#71B48D';
const NAVY  = '#011627';
const MUTED = '#7a9ab0';

const RUTA_COLORS: Record<string, string> = {
  HUX: C2, JOTA: C3, RECURSOS: MUTED, sin_definir: '#ffffff30',
};

const RUTAS  = ['Todos', 'HUX', 'JOTA', 'RECURSOS', 'sin_definir'];
const ETAPAS = ['Todos', 'cualificando', 'ruta_info', 'cta', 'abandonado'];

/* ── TEMPERATURA ── */
function getTemp(ultimoContacto: string) {
  if (!ultimoContacto) return { icon: '❄️', label: 'Inactivo', color: MUTED };
  const h = (Date.now() - new Date(ultimoContacto).getTime()) / 3_600_000;
  if (h < 24) return { icon: '🔥', label: 'Caliente', color: C2 };
  if (h < 72) return { icon: '🟡', label: 'Tibio',    color: '#f0c040' };
  return            { icon: '❄️', label: 'Frío',     color: MUTED };
}

/* ── COUNT UP ── */
function useCountUp(target: number, duration = 800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let s = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      s += step;
      if (s >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(s));
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return val;
}

/* ── METRIC CARD ── */
function MetricCard({ label, value, total, color, icon, delay = 0 }: {
  label: string; value: number; total: number; color: string; icon: string; delay?: number;
}) {
  const count = useCountUp(value);
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="metric-card animate-fade-up rounded-2xl p-5 flex flex-col gap-3 glass glow-border relative overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top right, ${color}12 0%, transparent 65%)` }} />
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: C1 }}>{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <span className="text-4xl font-bold tabular-nums leading-none" style={{ color }}>{count}</span>
      <div>
        <div className="h-1 rounded-full w-full" style={{ background: `${color}18` }}>
          <div className="h-1 rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}80` }} />
        </div>
        <span className="text-xs mt-1 block" style={{ color: `${color}90` }}>{pct}% del total</span>
      </div>
    </div>
  );
}

/* ── BADGE ── */
function Badge({ value }: { value: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    HUX:          { bg: '#EE7B3025', color: C2 },
    JOTA:         { bg: '#71B48D25', color: C3 },
    RECURSOS:     { bg: '#ffffff15', color: MUTED },
    sin_definir:  { bg: '#ffffff10', color: MUTED },
    cualificando: { bg: '#ffffff10', color: MUTED },
    ruta_info:    { bg: '#71B48D20', color: C3 },
    cta:          { bg: '#EE7B3020', color: C2 },
    abandonado:   { bg: '#e53e3e20', color: '#e53e3e' },
    Cerrado:      { bg: '#e53e3e20', color: '#e53e3e' },
    Activo:       { bg: '#71B48D20', color: C3 },
  };
  const s = map[value] || { bg: '#ffffff10', color: C1 };
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}>
      {value}
    </span>
  );
}

/* ── ACTIVE DOT ── */
function ActiveDot({ active }: { active: boolean }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${active ? 'animate-pulse-dot' : ''}`}
      style={{ background: active ? C3 : MUTED }} />
  );
}

/* ── SKELETON ROW ── */
function SkeletonRow() {
  return (
    <tr style={{ borderBottom: '1px solid #ffffff08' }}>
      {[160, 110, 70, 90, 100, 60, 40, 80].map((w, i) => (
        <td key={i} className="px-4 py-4">
          <div className="skeleton h-4 rounded" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

/* ── SORT ICON ── */
function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) return <span style={{ color: '#ffffff20' }}>↕</span>;
  return <span style={{ color: C2 }}>{dir === 'asc' ? '↑' : '↓'}</span>;
}

/* ── TOAST ── */
function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="animate-fade-up flex items-center gap-3 px-4 py-3 rounded-xl glass text-sm font-medium"
      style={{ color: C1, minWidth: 240, border: `1px solid ${C2}40`, boxShadow: `0 4px 24px rgba(0,0,0,0.5)` }}>
      <span className="animate-pulse-dot inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: C2 }} />
      {msg}
      <button onClick={onClose} className="ml-auto opacity-50 hover:opacity-100 text-xs">✕</button>
    </div>
  );
}

/* ── CHART TOOLTIP ── */
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs" style={{ border: `1px solid ${C2}30`, color: C1 }}>
      {label && <p style={{ color: MUTED }}>{label}</p>}
      <p style={{ color: C2 }}>{payload[0].value} leads</p>
    </div>
  );
}

/* ── KANBAN CARD ── */
function KanbanCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const temp = getTemp(lead.ultimo_contacto);
  return (
    <div className="glass glow-border rounded-xl p-3 cursor-pointer transition-all hover:opacity-90 active:scale-95 flex flex-col gap-2"
      onClick={onClick}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-sm truncate" style={{ color: C1 }}>
          {lead.nombre || 'Sin nombre'}
        </span>
        <span title={temp.label} className="text-base flex-shrink-0">{temp.icon}</span>
      </div>
      <span className="text-xs font-mono" style={{ color: MUTED }}>{lead.telefono}</span>
      <Badge value={lead.ruta || 'sin_definir'} />
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs" style={{ color: MUTED }}>
          {lead.ultimo_contacto
            ? new Date(lead.ultimo_contacto).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
            : '—'}
        </span>
        <a href={`https://wa.me/${lead.telefono}`} target="_blank" rel="noreferrer"
          onClick={e => e.stopPropagation()}
          className="text-xs px-2 py-0.5 rounded-lg font-semibold hover:opacity-80"
          style={{ background: '#25D36620', color: '#25D366', border: '1px solid #25D36640' }}>
          WA
        </a>
      </div>
    </div>
  );
}

/* ── MAIN ── */
export default function Dashboard() {
  const [leads, setLeads]               = useState<Lead[]>([]);
  const [loading, setLoading]           = useState(true);
  const [vista, setVista]               = useState<'tabla' | 'kanban'>('tabla');
  const [filtroRuta, setFiltroRuta]     = useState('Todos');
  const [filtroEtapa, setFiltroEtapa]   = useState('Todos');
  const [filtroCerrado, setFiltroCerrado] = useState('Todos');
  const [busqueda, setBusqueda]         = useState('');
  const [selected, setSelected]         = useState<Lead | null>(null);
  const [cerrando, setCerrando]         = useState<string | null>(null);
  const [sortCol, setSortCol]           = useState('ultimo_contacto');
  const [sortDir, setSortDir]           = useState<'asc' | 'desc'>('desc');
  const [toasts, setToasts]             = useState<{ id: number; msg: string }[]>([]);
  const [notas, setNotas]               = useState<Record<string, string>>({});
  const [copied, setCopied]             = useState<string | null>(null);
  const [modalTab, setModalTab]         = useState<'chat' | 'timeline'>('chat');

  const chatRef      = useRef<HTMLDivElement>(null);
  const knownPhones  = useRef(new Set<string>());
  const toastId      = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem('hux_notas');
    if (saved) try { setNotas(JSON.parse(saved)); } catch {}
  }, []);

  /* Pedir permiso para notificaciones del navegador */
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const addToast = (msg: string) => {
    const id = ++toastId.current;
    setToasts(t => [...t, { id, msg }]);
  };

  const removeToast = (id: number) => {
    setToasts(t => t.filter(x => x.id !== id));
  };

  const fetchLeads = (silent = false) => {
    if (!silent) setLoading(true);
    fetch('/api/leads')
      .then(r => r.json())
      .then((data: Lead[]) => {
        if (!Array.isArray(data)) return;
        if (silent) {
          const nuevos = data.filter(l => !knownPhones.current.has(l.telefono));
          nuevos.forEach(lead => {
            const nombre = lead.nombre && lead.nombre !== 'sin_nombre' ? lead.nombre : lead.telefono;
            addToast(`Nuevo lead: ${nombre} ✨`);
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('HUX Dashboard', { body: `Nuevo lead: ${nombre}`, tag: lead.telefono });
            }
          });
        }
        data.forEach(l => knownPhones.current.add(l.telefono));
        setLeads(data);
        if (!silent) setLoading(false);
      })
      .catch(() => { if (!silent) setLoading(false); });
  };

  const fetchLeadsRef = useRef(fetchLeads);
  fetchLeadsRef.current = fetchLeads;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchLeadsRef.current(); }, []);

  useEffect(() => {
    const t = setInterval(() => fetchLeadsRef.current(true), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (selected && chatRef.current)
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [selected]);

  /* Sync modal con datos frescos */
  useEffect(() => {
    setSelected(prev => {
      if (!prev) return prev;
      const updated = leads.find(l => l.telefono === prev.telefono);
      return updated ?? prev;
    });
  }, [leads]);

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const copyPhone = (tel: string) => {
    navigator.clipboard.writeText(tel).then(() => {
      setCopied(tel);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const saveNota = (tel: string, nota: string) => {
    const updated = { ...notas, [tel]: nota };
    setNotas(updated);
    localStorage.setItem('hux_notas', JSON.stringify(updated));
  };

  const handleCerrar = async (telefono: string) => {
    setCerrando(telefono);
    await fetch('/api/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telefono, seg_cerrado: 'TRUE' }),
    });
    fetchLeads();
    setCerrando(null);
    if (selected?.telefono === telefono) setSelected(null);
  };

  const historial = (lead: Lead): { role: string; content: string }[] => {
    try { return JSON.parse(lead.historial_json || '[]'); } catch { return []; }
  };

  const filtrados = leads
    .filter(l => {
      if (filtroRuta !== 'Todos' && l.ruta !== filtroRuta) return false;
      if (filtroEtapa !== 'Todos' && l.etapa !== filtroEtapa) return false;
      if (filtroCerrado === 'Activos'  && l.seg_cerrado === 'TRUE') return false;
      if (filtroCerrado === 'Cerrados' && l.seg_cerrado !== 'TRUE') return false;
      if (busqueda && !l.nombre?.toLowerCase().includes(busqueda.toLowerCase()) && !l.telefono?.includes(busqueda)) return false;
      return true;
    })
    .sort((a, b) => {
      const av = a[sortCol] || '', bv = b[sortCol] || '';
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const exportExcel = async () => {
    const XLSX = await import('xlsx');
    const fmt = (iso: string) => {
      if (!iso) return '—';
      return new Date(iso).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
    };

    const rows = filtrados.map(l => ({
      'Nombre':             l.nombre || 'Sin nombre',
      'Teléfono':           l.telefono,
      'Ruta':               l.ruta || 'sin_definir',
      'Etapa':              l.etapa || '—',
      'Estado':             l.seg_cerrado === 'TRUE' ? 'Cerrado' : 'Activo',
      'Temperatura':        getTemp(l.ultimo_contacto).label,
      'Último contacto':    fmt(l.ultimo_contacto),
      'Fecha registro':     fmt(l.fecha_registro),
      'Paso seguimiento':   l.seg_paso || '0',
      'Nudge enviado':      l.seg_nudge === 'TRUE' ? 'Sí' : 'No',
      'Último mensaje':     l.ultimo_msg || '—',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);

    ws['!cols'] = [
      { wch: 22 }, // Nombre
      { wch: 16 }, // Teléfono
      { wch: 12 }, // Ruta
      { wch: 14 }, // Etapa
      { wch: 10 }, // Estado
      { wch: 13 }, // Temperatura
      { wch: 20 }, // Último contacto
      { wch: 18 }, // Fecha registro
      { wch: 18 }, // Paso seguimiento
      { wch: 14 }, // Nudge
      { wch: 45 }, // Último mensaje
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads HUX');
    XLSX.writeFile(wb, `hux-leads-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  /* ── LOGOUT ── */
  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    window.location.href = '/login';
  };

  /* ── MÉTRICAS ── */
  const metrics = {
    total:    leads.length,
    hux:      leads.filter(l => l.ruta === 'HUX').length,
    jota:     leads.filter(l => l.ruta === 'JOTA').length,
    cta:      leads.filter(l => l.etapa === 'cta').length,
    cerrados: leads.filter(l => l.seg_cerrado === 'TRUE').length,
  };

  /* ── MÉTRICAS DE CONVERSIÓN ── */
  const convMetrics = {
    pctCta:     metrics.total > 0 ? Math.round((metrics.cta     / metrics.total) * 100) : 0,
    pctCerrado: metrics.total > 0 ? Math.round((metrics.cerrados / metrics.total) * 100) : 0,
    pctCierreDesdeCta: metrics.cta > 0 ? Math.round((metrics.cerrados / metrics.cta) * 100) : 0,
    frios:      leads.filter(l => getTemp(l.ultimo_contacto).icon === '❄️' && l.seg_cerrado !== 'TRUE').length,
    avgDias: (() => {
      const closed = leads.filter(l => l.seg_cerrado === 'TRUE' && l.fecha_registro && l.ultimo_contacto);
      if (!closed.length) return 0;
      const sum = closed.reduce((acc, l) => {
        const diff = (new Date(l.ultimo_contacto).getTime() - new Date(l.fecha_registro).getTime()) / 86_400_000;
        return acc + diff;
      }, 0);
      return Math.round(sum / closed.length);
    })(),
  };

  /* ── DATOS DE GRÁFICAS ── */
  const rutaData = ['HUX', 'JOTA', 'RECURSOS', 'sin_definir']
    .map(r => ({ name: r, value: leads.filter(l => l.ruta === r).length }))
    .filter(d => d.value > 0);

  const etapaData = [
    { name: 'Cualificando', leads: leads.filter(l => l.etapa === 'cualificando').length },
    { name: 'Info',         leads: leads.filter(l => l.etapa === 'ruta_info').length },
    { name: 'CTA',          leads: leads.filter(l => l.etapa === 'cta').length },
    { name: 'Abandonado',   leads: leads.filter(l => l.etapa === 'abandonado').length },
  ];

  const dailyData = (() => {
    const days: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days[d.toISOString().split('T')[0]] = 0;
    }
    leads.forEach(l => {
      if (l.fecha_registro) {
        const k = l.fecha_registro.split('T')[0];
        if (k in days) days[k]++;
      }
    });
    return Object.entries(days).map(([date, count]) => ({ date: date.slice(5), leads: count }));
  })();

  /* ── KANBAN ── */
  const kanbanCols = [
    { key: 'cualificando', label: 'Cualificando', color: MUTED },
    { key: 'ruta_info',    label: 'En Info',      color: C3 },
    { key: 'cta',          label: 'CTA',          color: C2 },
    { key: 'abandonado',   label: 'Abandonado',   color: '#e53e3e' },
    { key: 'cerrado',      label: 'Cerrado',      color: '#e53e3e' },
  ];

  const inputStyle: React.CSSProperties = {
    background: '#021d33', color: '#ffffff',
    border: `1px solid ${C2}25`, padding: '8px 12px',
    borderRadius: '10px', fontSize: '13px',
    outline: 'none', transition: 'border-color 0.2s',
  };

  const tableCols = [
    { key: 'nombre',          label: 'Nombre' },
    { key: 'telefono',        label: 'Teléfono' },
    { key: 'ruta',            label: 'Ruta' },
    { key: 'etapa',           label: 'Etapa' },
    { key: 'ultimo_contacto', label: 'Último contacto' },
    { key: 'seg_cerrado',     label: 'Estado' },
  ];

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--bg-base)' }}>

      {/* ── HEADER ── */}
      <div className="animate-fade-up flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden animate-pulse-glow flex-shrink-0">
            <img src="/hux.png" alt="HUX" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-none tracking-tight">
              <span style={{ color: C2 }}>HUX</span>
              <span style={{ color: '#f0f0f0' }}> Dashboard</span>
            </h1>
            <p className="text-xs mt-0.5" style={{ color: MUTED }}>CRM · leads WhatsApp</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Toggle vista */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: `1px solid ${C2}25` }}>
            {(['tabla', 'kanban'] as const).map(v => (
              <button key={v} onClick={() => setVista(v)}
                className="px-3 py-2 text-xs font-semibold transition-all"
                style={{ background: vista === v ? C2 : 'transparent', color: vista === v ? '#000' : MUTED }}>
                {v === 'tabla' ? '☰ Tabla' : '⊞ Kanban'}
              </button>
            ))}
          </div>
          <button onClick={exportExcel}
            className="px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{ background: '#021d33', color: C3, border: `1px solid ${C3}30` }}>
            ↓ Excel
          </button>
          <button onClick={() => fetchLeads()}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{ background: C2, color: '#000' }}>
            {loading ? <span className="animate-spin inline-block">↻</span> : '↻ Actualizar'}
          </button>
          <button onClick={handleLogout}
            className="px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
            style={{ background: 'transparent', color: MUTED, border: `1px solid #ffffff15` }}
            title="Cerrar sesión">
            ⏻
          </button>
        </div>
      </div>

      {/* ── MÉTRICAS ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <MetricCard label="Total leads" value={metrics.total}    total={metrics.total} color="#ffffff"  icon="👥" delay={0} />
        <MetricCard label="Ruta HUX"    value={metrics.hux}      total={metrics.total} color="#EE7B30"  icon="🚀" delay={60} />
        <MetricCard label="Ruta JOTA"   value={metrics.jota}     total={metrics.total} color="#71B48D"  icon="🎓" delay={120} />
        <MetricCard label="En CTA"      value={metrics.cta}      total={metrics.total} color="#EE7B30"  icon="⚡" delay={180} />
        <MetricCard label="Cerrados"    value={metrics.cerrados} total={metrics.total} color={MUTED}    icon="✅" delay={240} />
      </div>

      {/* ── CONVERSIÓN ── */}
      <div className="animate-fade-up grid grid-cols-2 md:grid-cols-4 gap-3 mb-8" style={{ animationDelay: '60ms' }}>
        {[
          { label: '% Leads → CTA',       value: `${convMetrics.pctCta}%`,       sub: `${metrics.cta} de ${metrics.total}`,     color: C2 },
          { label: '% CTA → Cerrado',      value: `${convMetrics.pctCierreDesdeCta}%`, sub: `${metrics.cerrados} de ${metrics.cta}`, color: C3 },
          { label: 'Tiempo prom. cierre',  value: `${convMetrics.avgDias}d`,      sub: 'desde registro',                          color: MUTED },
          { label: 'Leads fríos',          value: convMetrics.frios,              sub: 'sin contacto +72h',                       color: '#7a9ab0' },
        ].map((m, i) => (
          <div key={i} className="glass glow-border rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>{m.label}</p>
              <p className="text-2xl font-bold leading-tight mt-0.5" style={{ color: m.color }}>{m.value}</p>
              <p className="text-xs mt-0.5" style={{ color: `${m.color}70` }}>{m.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── GRÁFICAS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

        {/* Donut — rutas */}
        <div className="glass glow-border rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: MUTED }}>
            Distribución rutas
          </p>
          {leads.length === 0
            ? <div className="skeleton h-32 rounded-xl" />
            : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={130}>
                  <PieChart>
                    <Pie data={rutaData} cx="50%" cy="50%" innerRadius={34} outerRadius={54}
                      dataKey="value" stroke="none">
                      {rutaData.map(entry => (
                        <Cell key={entry.name} fill={RUTA_COLORS[entry.name] ?? MUTED} />
                      ))}
                    </Pie>
                    <RTooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  {rutaData.map(d => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: RUTA_COLORS[d.name] ?? MUTED }} />
                      <span className="truncate" style={{ color: MUTED }}>{d.name}</span>
                      <span className="font-bold ml-auto" style={{ color: C1 }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        </div>

        {/* Barras — embudo etapas */}
        <div className="glass glow-border rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: MUTED }}>
            Embudo de etapas
          </p>
          {leads.length === 0
            ? <div className="skeleton h-32 rounded-xl" />
            : (
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={etapaData} barSize={16}>
                  <CartesianGrid vertical={false} stroke="#ffffff08" />
                  <XAxis dataKey="name" tick={{ fill: MUTED, fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} width={20} allowDecimals={false} />
                  <RTooltip content={<ChartTooltip />} cursor={{ fill: `${C2}08` }} />
                  <Bar dataKey="leads" fill={C2} radius={[4, 4, 0, 0]}
                    style={{ filter: 'drop-shadow(0 0 4px #EE7B3055)' }} />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* Línea — tendencia 14 días */}
        <div className="glass glow-border rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: MUTED }}>
            Leads últimos 14 días
          </p>
          {leads.length === 0
            ? <div className="skeleton h-32 rounded-xl" />
            : (
              <ResponsiveContainer width="100%" height={130}>
                <LineChart data={dailyData}>
                  <CartesianGrid stroke="#ffffff08" />
                  <XAxis dataKey="date" tick={{ fill: MUTED, fontSize: 9 }} axisLine={false} tickLine={false} interval={3} />
                  <YAxis tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} width={20} allowDecimals={false} />
                  <RTooltip content={<ChartTooltip />} cursor={{ stroke: `${C2}40` }} />
                  <Line type="monotone" dataKey="leads" stroke={C2} strokeWidth={2} dot={false}
                    style={{ filter: 'drop-shadow(0 0 4px #EE7B3060)' }} />
                </LineChart>
              </ResponsiveContainer>
            )
          }
        </div>
      </div>

      {/* ── FILTROS ── */}
      <div className="animate-fade-up flex flex-wrap gap-3 mb-5 items-center" style={{ animationDelay: '200ms' }}>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: MUTED }}>🔍</span>
          <input placeholder="Nombre o teléfono..." value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '28px', width: '200px' }} />
        </div>
        {[
          { label: 'Ruta',   value: filtroRuta,    set: setFiltroRuta,    options: RUTAS },
          { label: 'Etapa',  value: filtroEtapa,   set: setFiltroEtapa,   options: ETAPAS },
          { label: 'Estado', value: filtroCerrado, set: setFiltroCerrado, options: ['Todos', 'Activos', 'Cerrados'] },
        ].map(f => (
          <select key={f.label} value={f.value} onChange={e => f.set(e.target.value)} style={inputStyle}>
            {f.options.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
        <span className="ml-auto text-sm font-semibold" style={{ color: C2 }}>{filtrados.length} leads</span>
      </div>

      {/* ── TABLA ── */}
      {vista === 'tabla' && (
        <div className="animate-fade-up rounded-2xl overflow-hidden glass glow-border" style={{ animationDelay: '250ms' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: `${C2}08`, borderBottom: `1px solid ${C2}18` }}>
                {tableCols.map(c => (
                  <th key={c.key}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none hover:opacity-80"
                    style={{ color: C2 }}
                    onClick={() => handleSort(c.key)}>
                    {c.label} <SortIcon active={sortCol === c.key} dir={sortDir} />
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: C2 }}>
                  Temp
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                : filtrados.length === 0
                  ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-sm" style={{ color: MUTED }}>
                        Sin leads con esos filtros.
                      </td>
                    </tr>
                  )
                  : filtrados.map((lead, i) => {
                    const temp = getTemp(lead.ultimo_contacto);
                    return (
                      <tr key={lead.telefono + i}
                        className="table-row cursor-pointer transition-all"
                        style={{ borderBottom: `1px solid ${C1}08` }}
                        onClick={() => setSelected(lead)}>
                        <td className="px-4 py-3 font-medium">
                          <div className="flex items-center gap-2">
                            <ActiveDot active={lead.seg_activo === 'TRUE' && lead.seg_cerrado !== 'TRUE'} />
                            <span>{lead.nombre || <span style={{ color: MUTED }}>Sin nombre</span>}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs" style={{ color: MUTED }}>{lead.telefono}</span>
                            <button onClick={() => copyPhone(lead.telefono)}
                              className="text-xs opacity-50 hover:opacity-100 transition-opacity"
                              title="Copiar teléfono" style={{ color: C2 }}>
                              {copied === lead.telefono ? '✓' : '⎘'}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3"><Badge value={lead.ruta || 'sin_definir'} /></td>
                        <td className="px-4 py-3"><Badge value={lead.etapa || '—'} /></td>
                        <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>
                          {lead.ultimo_contacto
                            ? new Date(lead.ultimo_contacto).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
                            : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge value={lead.seg_cerrado === 'TRUE' ? 'Cerrado' : 'Activo'} />
                        </td>
                        <td className="px-4 py-3 text-base" title={temp.label}>{temp.icon}</td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5">
                            <a href={`https://wa.me/${lead.telefono}`} target="_blank" rel="noreferrer"
                              className="px-2 py-1 rounded-lg text-xs font-semibold hover:opacity-80"
                              style={{ background: '#25D36618', color: '#25D366', border: '1px solid #25D36630' }}>
                              WA
                            </a>
                            {lead.seg_cerrado !== 'TRUE' && (
                              <button onClick={() => handleCerrar(lead.telefono)}
                                disabled={cerrando === lead.telefono}
                                className="px-2 py-1 rounded-lg text-xs font-semibold disabled:opacity-40 hover:opacity-80 active:scale-95"
                                style={{ background: '#e53e3e18', color: '#e53e3e', border: '1px solid #e53e3e30' }}>
                                {cerrando === lead.telefono ? '...' : 'Cerrar'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
      )}

      {/* ── KANBAN ── */}
      {vista === 'kanban' && (
        <div className="animate-fade-up flex gap-4 overflow-x-auto pb-4" style={{ animationDelay: '250ms' }}>
          {kanbanCols.map(col => {
            const colLeads = filtrados.filter(l =>
              col.key === 'cerrado'
                ? l.seg_cerrado === 'TRUE'
                : l.etapa === col.key && l.seg_cerrado !== 'TRUE'
            );
            return (
              <div key={col.key} className="flex-shrink-0 w-60 flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: col.color }}>
                    {col.label}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: `${col.color}18`, color: col.color }}>
                    {colLeads.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2" style={{ minHeight: 120 }}>
                  {colLeads.length === 0
                    ? (
                      <div className="rounded-xl text-center py-8 text-xs"
                        style={{ color: MUTED, border: `1px dashed ${MUTED}30` }}>
                        Sin leads
                      </div>
                    )
                    : colLeads.map((lead, i) => (
                      <KanbanCard key={lead.telefono + i} lead={lead} onClick={() => setSelected(lead)} />
                    ))
                  }
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelected(null)}>
          <div className="animate-scale-in rounded-2xl w-full max-w-lg max-h-[88vh] flex flex-col overflow-hidden glass glow-border"
            onClick={e => e.stopPropagation()}>

            {/* Header modal */}
            <div className="p-5 flex items-start justify-between gap-4" style={{ borderBottom: `1px solid ${C2}18` }}>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-lg truncate" style={{ color: C2 }}>
                    {selected.nombre || 'Sin nombre'}
                  </h2>
                  <span title={getTemp(selected.ultimo_contacto).label} className="text-base flex-shrink-0">
                    {getTemp(selected.ultimo_contacto).icon}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs font-mono" style={{ color: MUTED }}>{selected.telefono}</span>
                  <button onClick={() => copyPhone(selected.telefono)}
                    className="text-xs opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
                    style={{ color: C2 }} title="Copiar">
                    {copied === selected.telefono ? '✓' : '⎘'}
                  </button>
                  <a href={`https://wa.me/${selected.telefono}`} target="_blank" rel="noreferrer"
                    className="text-xs px-2 py-0.5 rounded-lg font-semibold hover:opacity-80 flex-shrink-0"
                    style={{ background: '#25D36618', color: '#25D366', border: '1px solid #25D36630' }}>
                    WA ↗
                  </a>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-end flex-shrink-0">
                <Badge value={selected.ruta || 'sin_definir'} />
                <Badge value={selected.etapa || '—'} />
                <Badge value={selected.seg_cerrado === 'TRUE' ? 'Cerrado' : 'Activo'} />
              </div>
            </div>

            {/* Info row */}
            <div className="px-5 py-2.5 flex flex-wrap gap-4 text-xs"
              style={{ borderBottom: `1px solid ${C2}10`, background: `${C2}05` }}>
              <span style={{ color: MUTED }}>
                Paso: <span style={{ color: C2 }}>{selected.seg_paso || '0'}</span>
              </span>
              <span style={{ color: MUTED }}>
                Reg: <span style={{ color: C1 }}>
                  {selected.fecha_registro
                    ? new Date(selected.fecha_registro).toLocaleDateString('es-CO')
                    : '—'}
                </span>
              </span>
              <span style={{ color: MUTED }}>
                Último msg: <span style={{ color: C1 }}>{selected.ultimo_msg?.slice(0, 35) || '—'}</span>
              </span>
            </div>

            {/* Tabs */}
            <div className="flex px-5 pt-3 gap-1" style={{ borderBottom: `1px solid ${C2}10` }}>
              {(['chat', 'timeline'] as const).map(tab => (
                <button key={tab} onClick={() => setModalTab(tab)}
                  className="px-3 py-1.5 rounded-t-lg text-xs font-semibold transition-all"
                  style={{
                    background: modalTab === tab ? `${C2}15` : 'transparent',
                    color: modalTab === tab ? C2 : MUTED,
                    borderBottom: modalTab === tab ? `2px solid ${C2}` : '2px solid transparent',
                  }}>
                  {tab === 'chat' ? '💬 Conversación' : '📋 Timeline'}
                </button>
              ))}
            </div>

            {/* Chat */}
            {modalTab === 'chat' && (
              <div ref={chatRef} className="p-5 overflow-y-auto flex-1 flex flex-col gap-3" style={{ minHeight: 0 }}>
                {historial(selected).length === 0
                  ? <p className="text-sm" style={{ color: MUTED }}>Sin historial de conversación.</p>
                  : historial(selected).map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-0.5`}>
                      <span className="text-xs px-1" style={{ color: MUTED }}>
                        {msg.role === 'user' ? 'Lead' : 'Hux'}
                      </span>
                      <div className="px-4 py-2.5 rounded-2xl text-sm max-w-xs leading-relaxed whitespace-pre-wrap"
                        style={msg.role === 'user'
                          ? { background: `${C2}18`, color: C1, border: `1px solid ${C2}40` }
                          : { background: '#01111e', color: '#e0e0e0', border: '1px solid #ffffff15' }
                        }>
                        {msg.content}
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            {/* Timeline */}
            {modalTab === 'timeline' && (
              <div className="p-5 overflow-y-auto flex-1" style={{ minHeight: 0 }}>
                {(() => {
                  const fmt = (iso: string) => new Date(iso).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
                  const paso = parseInt(selected.seg_paso || '0');
                  const events: { icon: string; label: string; date?: string; color: string }[] = [];

                  if (selected.fecha_registro) events.push({ icon: '📥', label: 'Registro', date: selected.fecha_registro, color: C3 });
                  if (selected.etapa && selected.etapa !== 'cualificando') {
                    const labels: Record<string, string> = { ruta_info: 'Pasó a ruta info', cta: 'Llegó a CTA', abandonado: 'Marcado abandonado' };
                    events.push({ icon: selected.etapa === 'cta' ? '⚡' : '🎯', label: labels[selected.etapa] || selected.etapa, color: selected.etapa === 'cta' ? C2 : MUTED });
                  }
                  if (selected.seg_nudge === 'TRUE') events.push({ icon: '📨', label: 'Nudge enviado (4h sin respuesta)', color: MUTED });
                  if (paso >= 1) events.push({ icon: '📨', label: 'Seguimiento S1 enviado', color: MUTED });
                  if (paso >= 2) events.push({ icon: '📨', label: 'Seguimiento S2 enviado', color: MUTED });
                  if (paso >= 3) events.push({ icon: '📨', label: 'Seguimiento S3 enviado', color: MUTED });
                  if (selected.ultimo_contacto) events.push({ icon: '💬', label: 'Último contacto', date: selected.ultimo_contacto, color: C2 });
                  if (selected.seg_cerrado === 'TRUE') events.push({ icon: '✅', label: 'Lead cerrado', color: C3 });

                  return (
                    <div className="flex flex-col gap-0">
                      {events.map((ev, i) => (
                        <div key={i} className="flex gap-3 relative">
                          <div className="flex flex-col items-center">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 z-10"
                              style={{ background: `${ev.color}20`, border: `1px solid ${ev.color}40` }}>
                              {ev.icon}
                            </div>
                            {i < events.length - 1 && (
                              <div className="w-px flex-1 my-0.5" style={{ background: `${ev.color}25`, minHeight: 20 }} />
                            )}
                          </div>
                          <div className="pb-4 pt-0.5 min-w-0">
                            <p className="text-sm font-medium" style={{ color: C1 }}>{ev.label}</p>
                            {ev.date && (
                              <p className="text-xs mt-0.5" style={{ color: MUTED }}>{fmt(ev.date)}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Nota interna */}
            <div className="px-5 py-3" style={{ borderTop: `1px solid ${C2}10` }}>
              <p className="text-xs mb-1.5 font-semibold uppercase tracking-wider" style={{ color: MUTED }}>
                Nota interna
              </p>
              <textarea
                value={notas[selected.telefono] || ''}
                onChange={e => saveNota(selected.telefono, e.target.value)}
                placeholder="Agrega una nota sobre este lead..."
                rows={2}
                style={{ ...inputStyle, width: '100%', resize: 'none', fontFamily: 'inherit', fontSize: '12px' }}
              />
            </div>

            {/* Footer */}
            <div className="p-4 flex gap-2 justify-end" style={{ borderTop: `1px solid ${C2}18` }}>
              {selected.seg_cerrado !== 'TRUE' && (
                <button onClick={() => handleCerrar(selected.telefono)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80 active:scale-95"
                  style={{ background: '#e53e3e18', color: '#e53e3e', border: '1px solid #e53e3e30' }}>
                  Cerrar lead
                </button>
              )}
              <button onClick={() => setSelected(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80 active:scale-95"
                style={{ background: '#021d33', color: MUTED, border: '1px solid #ffffff20' }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOASTS ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <Toast msg={t.msg} onClose={() => removeToast(t.id)} />
          </div>
        ))}
      </div>

    </div>
  );
}
