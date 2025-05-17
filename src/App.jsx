import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate} from "react-router-dom";
import RegexToFA from "./components/pages/RegexToFA";
import FAToRegex from "./components/pages/FAToRegex";
import NFAToDFA from "./components/pages/NFAToDFA";
import reggielogo from "./assets/reggielogo.svg";

export default function App() {
  return (
    <Router basename="/reggie">
      <div className="min-h-screen bg-black text-green-400 font-mono">
        <header className="flex items-center justify-between p-4 border-b border-green-700 bg-black">
          <div className="flex items-center gap-2">
            <img src={reggielogo} className="w-15 h-10" alt="logo" />
          </div>
          <nav className="flex gap-4 text-yellow-400">
            <Link to="/regex-to-fa" className="hover:underline font-bold">Regex → FA</Link> 
            <Link to="/fa-to-regex" className="hover:underline font-bold">FA → Regex</Link>
            <Link to="/nfa-dfa" className="hover:underline font-bold">NFA ↔ DFA</Link>
          </nav>
        </header>
        <main className="p-4">
          <Routes>
            <Route path="/regex-to-fa" element={<RegexToFA />} />
            <Route path="/fa-to-regex" element={<FAToRegex />} />
            <Route path="/nfa-dfa" element={<NFAToDFA />} />
            <Route path="*" element={<Navigate to="/regex-to-fa" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}