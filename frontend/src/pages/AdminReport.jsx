import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from "firebase/firestore";
import { Loader2, Users, FileText, BarChart3, FileSpreadsheet } from 'lucide-react';

// Library untuk Eksport (Hanya XLSX dikekalkan)
import * as XLSX from 'xlsx';

const AdminReport = () => {
  const [voters, setVoters] = useState([]);
  const [tally, setTally] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "voting"));
        let votersData = [];
        
        const voteCount = {
          president: {}, deputy: {}, vice: {}, secretary: {}, treasurer: {}, exco: {}
        };

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          votersData.push(data);

          if (data.hasVoted && data.votes) {
            for (const category in data.votes) {
              const selectedCandidates = data.votes[category];
              if (Array.isArray(selectedCandidates)) {
                selectedCandidates.forEach(candidateName => {
                  if (voteCount[category]) {
                    voteCount[category][candidateName] = (voteCount[category][candidateName] || 0) + 1;
                  }
                });
              }
            }
          }
        });

        // Susunan: Terkini di atas
        votersData.sort((a, b) => {
          if (!a.votedAt && !b.votedAt) return 0;
          if (!a.votedAt) return 1;
          if (!b.votedAt) return -1;
          return new Date(b.votedAt) - new Date(a.votedAt);
        });

        const sortedTally = {};
        for (const cat in voteCount) {
          sortedTally[cat] = Object.entries(voteCount[cat])
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
        }

        setVoters(votersData);
        setTally(sortedTally);
      } catch (error) {
        console.error("Ralat mengambil data laporan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  // --- FUNGSI DOWNLOAD EXCEL (STABIL) ---
  const downloadExcel = () => {
    const reportData = voters.map(v => ({
      'Nama Penuh': v.fullName,
      'Syarikat': v.company,
      'Emel': v.email,
      'Status': v.hasVoted ? 'SELESAI' : 'BELUM',
      'Waktu Undi (MYT)': v.votedAt || '-',
      'Detail Pilihan': v.votes ? JSON.stringify(v.votes) : '-'
    }));

    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Log Audit Pengundi");
    XLSX.writeFile(wb, `Laporan_P2SA_${new Date().toLocaleDateString()}.xlsx`);
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center"><Loader2 className="animate-spin text-blue-600 mb-4" size={40} /><p className="text-slate-500 font-medium">Menjana Laporan...</p></div>;

  const totalVoted = voters.filter(v => v.hasVoted).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans pb-20">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <FileText className="text-blue-600" /> Laporan & Audit
            </h1>
            <p className="text-slate-500 text-sm mt-1">Data sulit untuk pentadbir P2SA sahaja.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={downloadExcel}
              className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-all active:scale-95 border border-emerald-100"
            >
              <FileSpreadsheet size={18} /> Simpan Data Excel
            </button>
            
            <div className="bg-blue-50 px-4 py-2 rounded-xl text-center border border-blue-100">
              <div className="text-xl font-black text-blue-600 leading-none">{totalVoted} / {voters.length}</div>
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">Voted</div>
            </div>
          </div>
        </header>

        {/* Keputusan Rasmi */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 className="text-blue-500" /> Keputusan Rasmi Terkini
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.keys(tally).map(category => (
              <div key={category} className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h3 className="font-bold text-slate-700 capitalize border-b pb-2 mb-3">{category}</h3>
                {tally[category].length > 0 ? (
                  <ul className="space-y-2">
                    {tally[category].map((cand, idx) => (
                      <li key={idx} className="flex justify-between items-center text-sm">
                        <span className={idx === 0 ? "font-bold text-blue-600" : "text-slate-600"}>{idx + 1}. {cand.name}</span>
                        <span className={`px-2 py-1 rounded-md font-bold text-xs ${idx === 0 ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"}`}>{cand.count} undi</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-xs text-slate-400 italic text-center py-4">Belum ada undian.</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Log Audit Table */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><Users className="text-blue-500" /> Log Audit Pengundi</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold border-b">Nama / Syarikat</th>
                  <th className="p-4 font-bold border-b">Status</th>
                  <th className="p-4 font-bold border-b">Waktu Undi (MYT)</th>
                  <th className="p-4 font-bold border-b">Rekod Undian</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {voters.map((v, index) => (
                  <tr key={index} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-800 leading-tight">{v.fullName}</p>
                      <p className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">{v.company}</p>
                    </td>
                    <td className="p-4"><span className={`px-3 py-1 rounded-full text-[10px] font-black ${v.hasVoted ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{v.hasVoted ? 'SELESAI' : 'BELUM'}</span></td>
                    <td className="p-4 text-slate-600 font-medium whitespace-nowrap">{v.votedAt || '-'}</td>
                    <td className="p-4 text-[10px] text-slate-500">
                      {v.hasVoted && v.votes ? "Rekod Disimpan" : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminReport;