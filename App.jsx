import React, { useState, useEffect } from 'react';
import { Trash2, Plus, ArrowRight, X, Share2, Download, Upload } from 'lucide-react';

// --- Utility Functions ---
const getRandomColor = () => `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`;
const formatMoney = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

// --- Main Component ---
export default function App() {
  const [view, setView] = useState('home'); 
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showImport, setShowImport] = useState(false); // New: Import Modal

  // Load Data
  useEffect(() => {
    const saved = localStorage.getItem('splitBillGroups');
    if (saved) setGroups(JSON.parse(saved));
  }, []);

  // Save Data
  useEffect(() => {
    localStorage.setItem('splitBillGroups', JSON.stringify(groups));
  }, [groups]);

  // --- Actions ---
  const handleCreateGroup = (newGroup) => {
    if (groups.some(g => g.name.toLowerCase() === newGroup.name.toLowerCase())) {
      alert('Group exists!'); return;
    }
    setGroups([...groups, { ...newGroup, id: Date.now(), expenses: [], color: getRandomColor() }]);
    setView('home');
  };

  const handleAddExpense = (groupId, expense) => {
    const updated = groups.map(g => g.id === groupId ? { ...g, expenses: [...g.expenses, { ...expense, id: Date.now() }] } : g);
    setGroups(updated);
    setActiveGroup(updated.find(g => g.id === groupId));
    setShowAddExpense(false);
  };

  const handleDeleteExpense = (expenseId) => {
    const updated = groups.map(g => g.id === activeGroup.id ? { ...g, expenses: g.expenses.filter(e => e.id !== expenseId) } : g);
    setGroups(updated);
    setActiveGroup(updated.find(g => g.id === activeGroup.id));
  };

  // --- New: Export / Import Logic ---
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(groups));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "bill_splitter_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (event) => {
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = e => {
      try {
        const parsed = JSON.parse(e.target.result);
        setGroups(parsed);
        setShowImport(false);
        alert("Data imported successfully!");
      } catch (err) {
        alert("Invalid file format.");
      }
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 shadow-md sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-xl font-bold" onClick={() => setView('home')}>BillSplitter</h1>
        <span className="text-[10px] font-medium opacity-80 tracking-wide uppercase">by Srijen Gupta</span>
        {view === 'home' && (
           <div className="flex gap-2">
             <button onClick={() => setShowImport(true)} className="p-2 bg-indigo-500 rounded hover:bg-indigo-400" title="Import"><Upload size={18}/></button>
             <button onClick={handleExport} className="p-2 bg-indigo-500 rounded hover:bg-indigo-400" title="Export"><Download size={18}/></button>
           </div>
        )}
        {view !== 'home' && <button onClick={() => setView('home')} className="text-sm bg-indigo-700 px-3 py-1 rounded">Home</button>}
      </header>

      <main className="max-w-md mx-auto p-4">
        {view === 'home' && <HomeScreen groups={groups} onCreate={() => setView('create')} onSelect={g => { setActiveGroup(g); setView('details'); }} />}
        {view === 'create' && <CreateGroupScreen onSave={handleCreateGroup} onCancel={() => setView('home')} />}
        {view === 'details' && activeGroup && <GroupDetailsScreen group={activeGroup} onAdd={() => setShowAddExpense(true)} onDelete={handleDeleteExpense} onSettle={() => setView('settle')} />}
        {view === 'settle' && activeGroup && <SettlementScreen group={activeGroup} onBack={() => setView('details')} />}
      </main>

      {showAddExpense && activeGroup && <AddExpenseModal group={activeGroup} onClose={() => setShowAddExpense(false)} onSave={e => handleAddExpense(activeGroup.id, e)} />}
      
      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm">
             <h3 className="text-lg font-bold mb-4">Import Data</h3>
             <p className="text-sm text-gray-500 mb-4">Select a previously exported JSON file. This will overwrite current data.</p>
             <input type="file" onChange={handleImport} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
             <button onClick={() => setShowImport(false)} className="mt-4 w-full border p-2 rounded text-gray-600">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub Components ---

function HomeScreen({ groups, onCreate, onSelect }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow min-h-[200px]">
        <h2 className="text-lg font-semibold mb-4">My Groups</h2>
        {groups.length === 0 ? <p className="text-gray-400 text-center py-8">No groups yet.</p> : (
          <div className="space-y-3">
            {groups.map(g => (
              <div key={g.id} onClick={() => onSelect(g)} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3" style={{ backgroundColor: g.color }}>{g.name[0]}</div>
                <div><h3 className="font-medium">{g.name}</h3><p className="text-xs text-gray-500">{g.members.length} members</p></div>
                <ArrowRight className="ml-auto w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        )}
      </div>
      <button onClick={onCreate} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold shadow hover:bg-indigo-700 flex justify-center items-center gap-2"><Plus size={20}/> Create Group</button>
    </div>
  );
}

function CreateGroupScreen({ onSave, onCancel }) {
  const [name, setName] = useState('');
  const [members, setMembers] = useState([{ name: 'You' }, { name: '' }]);
  const handleSubmit = (e) => {
    e.preventDefault();
    const valid = members.filter(m => m.name.trim());
    if (!name || valid.length < 2) return alert("Name + 2 members required");
    onSave({ name, members: valid });
  };
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">New Group</h2>
      <input className="w-full border p-2 rounded mb-4" placeholder="Group Name" value={name} onChange={e => setName(e.target.value)} />
      <div className="space-y-2 mb-4">
        <label className="text-sm font-semibold">Members</label>
        {members.map((m, i) => (
          <input key={i} className="w-full border p-2 rounded text-sm" placeholder={`Member ${i+1}`} value={m.name} onChange={e => {
            const newM = [...members]; newM[i].name = e.target.value; setMembers(newM);
          }} />
        ))}
        <button onClick={() => setMembers([...members, { name: '' }])} className="text-sm text-indigo-600 flex items-center gap-1"><Plus size={14}/> Add another</button>
      </div>
      <div className="flex gap-2"><button onClick={onCancel} className="flex-1 bg-gray-200 py-2 rounded">Cancel</button><button onClick={handleSubmit} className="flex-1 bg-indigo-600 text-white py-2 rounded">Create</button></div>
    </div>
  );
}

function GroupDetailsScreen({ group, onAdd, onDelete, onSettle }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
        <h2 className="text-2xl font-bold">{group.name}</h2>
        <button onClick={onSettle} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Settle Up</button>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between bg-gray-50 rounded-t-lg">
          <h3 className="font-semibold">Expenses</h3>
          <button onClick={onAdd} className="text-indigo-600 text-sm font-medium flex items-center"><Plus size={16}/> Add</button>
        </div>
        <ul>
          {group.expenses.map(e => (
            <li key={e.id} className="p-4 border-b last:border-0 flex justify-between items-start">
              <div>
                <div className="text-xs text-gray-500">{e.date} • {e.description}</div>
                <div className="font-bold">{formatMoney(e.amount)}</div>
                <div className="text-xs text-gray-600">Paid by <b>{e.payer}</b></div>
              </div>
              <button onClick={() => confirm('Delete?') && onDelete(e.id)} className="text-red-400 p-1"><Trash2 size={16}/></button>
            </li>
          ))}
          {group.expenses.length === 0 && <li className="p-8 text-center text-gray-400">No expenses yet</li>}
        </ul>
      </div>
    </div>
  );
}

function AddExpenseModal({ group, onClose, onSave }) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [payer, setPayer] = useState(group.members[0].name);
  const [splitType, setSplitType] = useState('equal');
  const [selected, setSelected] = useState(group.members.map(m => m.name));
  
  const handleSave = () => {
    if (!desc || !amount) return;
    const total = parseFloat(amount);
    let split = {};
    if (splitType === 'equal') group.members.forEach(m => split[m.name] = total / group.members.length);
    else if (splitType === 'selected') group.members.forEach(m => split[m.name] = selected.includes(m.name) ? total / selected.length : 0);
    
    onSave({ description: desc, amount: total, date: new Date().toISOString().split('T')[0], payer, split, currency: 'INR' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-4 space-y-4">
        <div className="flex justify-between"><h3 className="font-bold">Add Expense</h3><button onClick={onClose}><X size={20}/></button></div>
        <input className="w-full border p-2 rounded" placeholder="Description" onChange={e => setDesc(e.target.value)} />
        <div className="flex gap-2"><span className="p-2 bg-gray-100 rounded">INR</span><input type="number" className="w-full border p-2 rounded" placeholder="0.00" onChange={e => setAmount(e.target.value)} /></div>
        <div className="flex items-center gap-2 text-sm"><span>Paid by:</span><select className="border p-1 rounded flex-1" onChange={e => setPayer(e.target.value)}>{group.members.map(m => <option key={m.name}>{m.name}</option>)}</select></div>
        <div className="border-t pt-2">
          <div className="flex gap-2 mb-2">
            <button onClick={() => setSplitType('equal')} className={`px-3 py-1 text-xs rounded-full border ${splitType === 'equal' ? 'bg-indigo-600 text-white' : ''}`}>Equal All</button>
            <button onClick={() => setSplitType('selected')} className={`px-3 py-1 text-xs rounded-full border ${splitType === 'selected' ? 'bg-indigo-600 text-white' : ''}`}>Select Users</button>
          </div>
          {splitType === 'selected' && <div className="grid grid-cols-2 gap-2">{group.members.map(m => <label key={m.name} className="flex gap-2 text-sm"><input type="checkbox" checked={selected.includes(m.name)} onChange={e => e.target.checked ? setSelected([...selected, m.name]) : setSelected(selected.filter(x => x !== m.name))} />{m.name}</label>)}</div>}
        </div>
        <button onClick={handleSave} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold">Save</button>
      </div>
    </div>
  );
}

function SettlementScreen({ group, onBack }) {
  const balances = {};
  group.members.forEach(m => balances[m.name] = 0);
  group.expenses.forEach(e => {
    balances[e.payer] += e.amount;
    Object.entries(e.split).forEach(([name, val]) => balances[name] -= val);
  });

  const settlements = [];
  let debtors = Object.entries(balances).filter(([,v]) => v < -0.01).sort((a,b) => a[1] - b[1]).map(([n,v]) => ({name: n, amount: v}));
  let creditors = Object.entries(balances).filter(([,v]) => v > 0.01).sort((a,b) => b[1] - a[1]).map(([n,v]) => ({name: n, amount: v}));

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    let amount = Math.min(Math.abs(debtors[i].amount), creditors[j].amount);
    if (amount > 0.01) {
      settlements.push({ from: debtors[i].name, to: creditors[j].name, amount });
      debtors[i].amount += amount;
      creditors[j].amount -= amount;
    }
    if (Math.abs(debtors[i].amount) < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2"><button onClick={onBack} className="p-2 bg-gray-200 rounded-full"><ArrowRight size={16} className="rotate-180"/></button><h2 className="text-xl font-bold">Settlement</h2></div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold border-b pb-2 mb-2">Net Balances</h3>
        {Object.entries(balances).map(([n, v]) => (
          <div key={n} className="flex justify-between"><span>{n}</span><span className={v >= 0 ? 'text-green-600' : 'text-red-500'}>{v > 0 ? '+' : ''}{formatMoney(v)}</span></div>
        ))}
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold border-b pb-2 mb-2">Who Pays Who</h3>
        {settlements.length ? settlements.map((s, i) => (
          <div key={i} className="flex gap-2 text-sm py-1"><b className="text-red-500">{s.from}</b> pays <b className="text-green-600">{s.to}</b> <span className="ml-auto font-bold">{formatMoney(s.amount)}</span></div>
        )) : <div className="text-green-600 text-center">All settled!</div>}
      </div>
    </div>
  );
}
