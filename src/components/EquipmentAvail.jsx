import React, { useState, useEffect } from "react";
import { getEquipment, addEquipment, updateEquipment, deleteEquipment } from '../services/equipmentService';
import "./components.css";

export default function EquipmentAvailability({ canEdit = false }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    setLoading(true);
    const data = await getEquipment();
    setItems(data);
    setLoading(false);
  };

  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({ name: "", available: "", total: "" });
  const [adding, setAdding] = useState(false);

  const startEdit = (idx) => {
    setEditingIndex(idx);
    const it = items[idx];
    setForm({ name: it.name, available: String(it.available), total: String(it.total) });
    setAdding(false);
  };

  const saveEdit = async () => {
    try {
      const item = items[editingIndex];
      await updateEquipment(item.id, { 
        name: form.name, 
        available: Number(form.available), 
        total: Number(form.total) 
      });
      setEditingIndex(null);
      setForm({ name: "", available: "", total: "" });
      loadEquipment();
    } catch (error) {
      console.error('Error updating equipment:', error);
    }
  };

  const startAdd = () => {
    setAdding(true);
    setEditingIndex(null);
    setForm({ name: "", available: "", total: "" });
  };

  const saveAdd = async () => {
    try {
      await addEquipment({ 
        name: form.name, 
        available: Number(form.available), 
        total: Number(form.total) 
      });
      setAdding(false);
      setForm({ name: "", available: "", total: "" });
      loadEquipment();
    } catch (error) {
      console.error('Error adding equipment:', error);
    }
  };

  const cancel = () => {
    setAdding(false);
    setEditingIndex(null);
    setForm({ name: "", available: "", total: "" });
  };

  if (loading) return <section className="card"><p>Loading equipment...</p></section>;

  return (
    <section className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>📦 Equipment Availability</h2>
        {canEdit && !adding && editingIndex === null && (
          <button className="btn" onClick={startAdd}>+ Add Equipment</button>
        )}
      </div>

      <div className="equipment-grid">
        {adding && (
          <div className="equipment-item">
            <div className="equipment-header">
              <h3>Add Equipment</h3>
            </div>
            <div className="equipment-form">
              <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input placeholder="Available" type="number" value={form.available} onChange={(e) => setForm({ ...form, available: e.target.value })} />
              <input placeholder="Total" type="number" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} />
              <div className="equipment-actions">
                <button className="btn" onClick={saveAdd}>Save</button>
                <button className="btn" onClick={cancel}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {items.map((i, idx) => (
          editingIndex === idx ? (
            <div key={i.name + idx} className="equipment-item">
              <div className="equipment-header">
                <h3>Edit {i.name}</h3>
              </div>
              <div className="equipment-form">
                <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input placeholder="Available" type="number" value={form.available} onChange={(e) => setForm({ ...form, available: e.target.value })} />
                <input placeholder="Total" type="number" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} />
                <div className="equipment-actions">
                  <button className="btn" onClick={saveEdit}>Save</button>
                  <button className="btn" onClick={cancel}>Cancel</button>
                </div>
              </div>
            </div>
          ) : (
            <div key={i.name + idx} className="equipment-item">
              <div className="equipment-header">
                <h3>{i.name}</h3>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="status good">Good</span>
                  {canEdit && <button className="btn" onClick={() => startEdit(idx)}>Edit</button>}
                </div>
              </div>
              <p className="available-text">Available:</p>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(i.available / i.total) * 100}%` }}
                ></div>
              </div>
              <p className="progress-count">
                {i.available} / {i.total}
              </p>
            </div>
          )
        ))}
      </div>
    </section>
  );
}
