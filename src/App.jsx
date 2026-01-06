import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "./Firebase.js";

import PLEntryForm from "./components/PLEntryForm";
import Dashboard from "./components/Dashboard";
import DataTable from "./components/DataTable";
import CalendarView from "./components/CalendarView";
import CapitalManagement from "./components/CapitalManagement";
import "./App.css";

function App() {
  const [tradeData, setTradeData] = useState([]);
  const [capitalData, setCapitalData] = useState({
    initialCapital: 0,
    transactions: []
  });
  const [activeTab, setActiveTab] = useState("entry");

  // 🔹 LOAD DATA FROM FIREBASE
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load trades
        const tradeSnap = await getDocs(collection(db, "trades"));
        const trades = tradeSnap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));
        setTradeData(
          trades.sort((a, b) => new Date(b.date) - new Date(a.date))
        );

        // Load capital
        const capitalRef = doc(db, "capital", "summary");
        const capitalSnap = await getDoc(capitalRef);
        if (capitalSnap.exists()) {
          setCapitalData(capitalSnap.data());
        }
      } catch (err) {
        console.error("Firebase load error:", err);
      }
    };

    loadData();
  }, []);


  const addPLEntry = async (entry) => {
    const newTrade = {
      date: entry.date,
      pnl: parseFloat(entry.pnl),
      notes: entry.notes || "",
      createdAt: serverTimestamp()
    };

    const ref = await addDoc(collection(db, "trades"), newTrade);

    setTradeData(prev => [
      { id: ref.id, ...newTrade },
      ...prev
    ]);
  };


  const deleteEntry = async (id) => {
    await deleteDoc(doc(db, "trades", id));
    setTradeData(prev => prev.filter(t => t.id !== id));
  };


  const updateCapital = async (updates) => {
    const updated = { ...capitalData, ...updates };
    setCapitalData(updated);
    await setDoc(doc(db, "capital", "summary"), updated);
  };


  const addCapitalTransaction = async (transaction) => {
    const newTransaction = {
      id: Date.now(),
      date: transaction.date,
      type: transaction.type,
      amount: parseFloat(transaction.amount),
      notes: transaction.notes || ""
    };

    const updatedTransactions = [
      newTransaction,
      ...capitalData.transactions
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    updateCapital({ transactions: updatedTransactions });
  };


  const deleteCapitalTransaction = async (id) => {
    const updatedTransactions = capitalData.transactions.filter(
      t => t.id !== id
    );
    updateCapital({ transactions: updatedTransactions });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Trade Tracker</h1>
        <p>Track your daily P&L with advanced analytics</p>
      </header>

      <nav className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === "entry" ? "active" : ""}`}
          onClick={() => setActiveTab("entry")}
        >
          Add Entry
        </button>
        <button
          className={`nav-tab ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={`nav-tab ${activeTab === "calendar" ? "active" : ""}`}
          onClick={() => setActiveTab("calendar")}
        >
          Calendar
        </button>
        <button
          className={`nav-tab ${activeTab === "capital" ? "active" : ""}`}
          onClick={() => setActiveTab("capital")}
        >
          Capital
        </button>
        <button
          className={`nav-tab ${activeTab === "table" ? "active" : ""}`}
          onClick={() => setActiveTab("table")}
        >
          Data Table
        </button>
      </nav>

      <main className="app-main">
        {activeTab === "entry" && <PLEntryForm onAdd={addPLEntry} />}
        {activeTab === "dashboard" && (
          <Dashboard data={tradeData} capitalData={capitalData} />
        )}
        {activeTab === "calendar" && <CalendarView data={tradeData} />}
        {activeTab === "capital" && (
          <CapitalManagement
            capitalData={capitalData}
            onUpdateCapital={updateCapital}
            onAddTransaction={addCapitalTransaction}
            onDeleteTransaction={deleteCapitalTransaction}
          />
        )}
        {activeTab === "table" && (
          <DataTable data={tradeData} onDelete={deleteEntry} />
        )}
      </main>
    </div>
  );
}

export default App;