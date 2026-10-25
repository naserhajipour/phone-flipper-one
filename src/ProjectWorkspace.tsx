import { useEffect, useState } from "react";

type Project = { id: string; name: string; notes: string; updatedAt: string; code: string };
const KEY = "pfo-projects-v1";

export default function ProjectWorkspace() {
  const [projects, setProjects] = useState<Project[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]") as Project[]; } catch { return []; }
  });
  const [name, setName] = useState("پروژه جدید");
  const [notes, setNotes] = useState("");
  const [board, setBoard] = useState("Arduino Mega 2560");
  const [task, setTask] = useState("blink");
  const [message, setMessage] = useState("");

  const code = task === "blink"
    ? `// Board: ${board}\nconst int LED_PIN = LED_BUILTIN;\nvoid setup() { pinMode(LED_PIN, OUTPUT); Serial.begin(115200); }\nvoid loop() { digitalWrite(LED_PIN, HIGH); delay(500); digitalWrite(LED_PIN, LOW); delay(500); }`
    : task === "analog"
    ? `// Board: ${board}\nvoid setup() { Serial.begin(115200); }\nvoid loop() { Serial.println(analogRead(A0)); delay(100); }`
    : `// Board: ${board}\nvoid setup() { Serial.begin(115200); Serial.println("PFO_READY"); }\nvoid loop() { if (Serial.available()) Serial.write(Serial.read()); }`;

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(projects)); }, [projects]);

  function save() {
    const p: Project = { id: String(Date.now()), name: name.trim() || "پروژه بدون نام", notes, updatedAt: new Date().toISOString(), code };
    setProjects(old => [p, ...old.filter(x => x.name !== p.name)]);
    setMessage("پروژه در حافظه همین دستگاه ذخیره شد.");
  }
  function exportProject() {
    const blob = new Blob([JSON.stringify({ schemaVersion: 1, name, notes, board, task, code }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "phone-flipper-project.json"; a.click();
    URL.revokeObjectURL(url);
  }
  const panel: React.CSSProperties = { background: "var(--panel, #151720)", border: "1px solid var(--border, #343746)", borderRadius: 14, padding: 16, marginBottom: 14, color: "var(--text, #eee)" };
  const input: React.CSSProperties = { display: "block", width: "100%", boxSizing: "border-box", padding: 10, margin: "6px 0 12px", borderRadius: 8, border: "1px solid #444", background: "#0e1017", color: "#fff" };
  const button: React.CSSProperties = { padding: "9px 12px", margin: "3px", borderRadius: 8, border: "1px solid #4a5060", background: "#202b3a", color: "#fff" };

  return <div dir="rtl" style={{ color: "var(--text, #eee)" }}>
    <section style={panel}>
      <h2>کارگاه پروژه‌ها</h2>
      <p>پروژه را ثبت کن، کد نمونه بساز و خروجی JSON بگیر. این نسخه اولیه است؛ اجرای کد روی برد و صحت مدار باید جداگانه آزمایش شود.</p>
      <label>نام پروژه<input style={input} value={name} onChange={e => setName(e.target.value)} /></label>
      <label>توضیحات پروژه<textarea style={input} value={notes} onChange={e => setNotes(e.target.value)} rows={3} /></label>
      <label>برد هدف<select style={input} value={board} onChange={e => setBoard(e.target.value)}><option>Arduino Mega 2560</option><option>ESP32 DevKit</option><option>Arduino Uno</option></select></label>
      <label>الگوی کد<select style={input} value={task} onChange={e => setTask(e.target.value)}><option value="blink">چشمک‌زن LED</option><option value="analog">خواندن ورودی آنالوگ A0</option><option value="serial">پل سریال ساده</option></select></label>
      <button style={button} onClick={save}>ذخیره پروژه</button><button style={button} onClick={exportProject}>خروجی JSON</button>
      {message && <p role="status">{message}</p>}
    </section>
    <section style={panel}>
      <h3>کد تولیدشده</h3>
      <textarea readOnly value={code} rows={10} style={{ ...input, direction: "ltr", textAlign: "left", fontFamily: "monospace" }} />
      <button style={button} onClick={() => { void navigator.clipboard?.writeText(code).then(() => setMessage("کد کپی شد.")).catch(() => setMessage("کپی خودکار در این محیط در دسترس نیست.")); }}>کپی کد</button>
    </section>
    <section style={panel}>
      <h3>پروژه‌های ذخیره‌شده</h3>
      {!projects.length && <p>هنوز پروژه‌ای ذخیره نشده است.</p>}
      {projects.map(p => <div key={p.id} style={{ borderTop: "1px solid #343746", padding: "10px 0" }}>
        <b>{p.name}</b><p>{p.notes}</p><button style={button} onClick={() => { setName(p.name); setNotes(p.notes); setMessage("اطلاعات پروژه بارگذاری شد."); }}>بازکردن</button><button style={button} onClick={() => setProjects(old => old.filter(x => x.id !== p.id))}>حذف</button>
      </div>)}
    </section>
    <section style={panel}>
      <h3>ماژول‌ها و نیازمندی‌ها</h3>
      <ul>
        <li>IR Remote — از قابلیت فعلی سالم محافظت شود.</li>
        <li>Bluetooth / BLE — اتصال به دستگاه سازگار و مجوزهای اندروید.</li>
        <li>NFC — نیازمند سخت‌افزار NFC و عملیات پشتیبانی‌شده.</li>
        <li>رادار مغناطیسی — اندازه‌گیری میدان مغناطیسی؛ فلزیاب طلا نیست.</li>
        <li>USB OTG — کابل OTG و برد یا مبدل سازگار.</li>
        <li>RF Sub-GHz — به فرستنده/گیرنده خارجی نیاز دارد.</li>
        <li>شماتیک پیشرفته و دستیار AI — نیازمند توسعه بیشتر و اتصال واقعی به موتور رسم/مدل.</li>
      </ul>
    </section>
  </div>;
}
