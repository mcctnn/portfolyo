/**
 * Yönetim panelinde form alanları. Her alanın tipi:
 *  text | url | textarea | tags (virgülle) | lines (her satıra bir tane) | bool
 */

export function toForm(fields, row = {}) {
  const out = {};
  for (const f of fields) {
    const v = row[f.key];
    if (f.type === "tags") out[f.key] = (v || []).join(", ");
    else if (f.type === "lines") out[f.key] = (v || []).join("\n");
    else if (f.type === "bool") out[f.key] = v ?? true;
    else out[f.key] = v ?? "";
  }
  return out;
}

export function fromForm(fields, form) {
  const out = {};
  for (const f of fields) {
    const v = form[f.key];
    if (f.type === "tags") out[f.key] = v.split(",").map((s) => s.trim()).filter(Boolean);
    else if (f.type === "lines") out[f.key] = v.split("\n").map((s) => s.trim()).filter(Boolean);
    else if (f.type === "bool") out[f.key] = !!v;
    else out[f.key] = v.trim();
  }
  return out;
}

export function FieldInput({ field, value, onChange }) {
  const id = `f-${field.key}`;
  const common = { id, value: value ?? "", onChange: (e) => onChange(e.target.value), placeholder: field.placeholder };

  return (
    <div className={`field${field.narrow ? " narrow" : ""}${field.type === "bool" ? " check" : ""}`}>
      {field.type === "bool" ? (
        <label className="switch">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
          <span>{field.label}</span>
        </label>
      ) : (
        <>
          <label htmlFor={id}>{field.label}</label>
          {field.type === "textarea" || field.type === "lines"
            ? <textarea {...common} rows={field.rows || (field.type === "lines" ? 5 : 3)} required={field.required} />
            : <input {...common} type="text" required={field.required} inputMode={field.type === "url" ? "url" : undefined} />}
          {field.help && <small>{field.help}</small>}
        </>
      )}
    </div>
  );
}
