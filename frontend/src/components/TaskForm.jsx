import { useEffect, useState } from "react";
import { X } from "lucide-react";
const blank = { title:"", description:"", category:"General", priority:"Medium", status:"Pending", dueDate:"" };
export default function TaskForm({ initial, onSave, onClose }) {
  const [form,setForm] = useState(blank);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  useEffect(()=>{ if(initial) setForm({...initial, dueDate: initial.dueDate ? new Date(initial.dueDate).toISOString().slice(0,10) : ""}); else setForm(blank); },[initial]);
  const change = e => setForm({...form,[e.target.name]:e.target.value});
  const submit = async e => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await onSave({...form,dueDate:form.dueDate || null});
      onClose();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save this task.");
    } finally {
      setBusy(false);
    }
  };
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><form className="modal-card" onSubmit={submit}>
    <div className="modal-head"><div><span className="eyebrow">TASK DETAILS</span><h2>{initial?"Edit task":"Create a task"}</h2></div><button type="button" className="icon-button" onClick={onClose}><X/></button></div>
    <label>Task title<input name="title" value={form.title} onChange={change} placeholder="e.g. Prepare project presentation" required maxLength="120"/></label>
    <label>Description<textarea name="description" value={form.description} onChange={change} placeholder="Add a few details..." rows="3" maxLength="2000"/></label>
    <div className="form-grid"><label>Category<input name="category" value={form.category} onChange={change} placeholder="Work, Study, Personal" maxLength="50"/></label><label>Due date<input type="date" name="dueDate" value={form.dueDate} onChange={change}/></label>
    <label>Priority<select name="priority" value={form.priority} onChange={change}><option>Low</option><option>Medium</option><option>High</option></select></label>
    <label>Status<select name="status" value={form.status} onChange={change}><option>Pending</option><option>In Progress</option><option>Completed</option></select></label></div>
    {error&&<div className="error-message" role="alert">{error}</div>}
    <div className="modal-actions"><button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={busy}>{busy?"Saving...":initial?"Save changes":"Create task"}</button></div>
  </form></div>;
}