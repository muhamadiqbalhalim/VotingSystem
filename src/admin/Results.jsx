import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import {
  Loader2,
  FileSpreadsheet,
  TrendingUp,
  Award,
  Eye,
  EyeOff
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { CATEGORY_LIST } from '../lib/electionConfig';
import { initializeWithDetection } from '../languageTranslator.js';

const Results = () => {
  const navigate = useNavigate();
  const [voters, setVoters] = useState([]);
  const [tally, setTally] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedVoter, setExpandedVoter] = useState(null);

  const utamaIds = ['president', 'deputy', 'vice', 'secretary', 'assistant_secretary', 'treasurer', 'assistant_treasurer'];
  const excoIds = ['exco1', 'exco2', 'exco3'];

  useEffect(() => {
    initializeWithDetection();
  }, []);

  const formatTimestamp = (value) => {
    if (!value) return '';
    if (typeof value.toDate === 'function') {
      return value.toDate().toLocaleString('ms-MY', { dateStyle: 'medium', timeStyle: 'short' });
    }
    return value;
  };

  const processTallies = (votersList, candidatesMap) => {
    const actualVoters = votersList.filter(voter => voter.role !== 'admin');
    const voteCount = CATEGORY_LIST.reduce((acc, category) => { 
      acc[category.id] = {}; 
      return acc; 
    }, {});

    actualVoters.forEach((voter) => {
      if (!voter.votes) return;
      Object.keys(voter.votes).forEach((position) => {
        if (!voteCount[position]) voteCount[position] = {};
        const selectedCandidates = voter.votes[position];
        if (Array.isArray(selectedCandidates)) {
          selectedCandidates.forEach((candidateValue) => {
            const candidateName = candidatesMap[candidateValue]?.name || candidateValue;
            voteCount[position][candidateName] = (voteCount[position][candidateName] || 0) + 1;
          });
        }
      });
    });
    setTally(voteCount);
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const [votersSnapshot, candidatesSnapshot] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'candidates'))
        ]);
        const voterList = [];
        const candidatesMap = {};
        candidatesSnapshot.forEach((doc) => { candidatesMap[doc.id] = { id: doc.id, ...doc.data() }; });
        votersSnapshot.forEach((doc) => { voterList.push({ id: doc.id, ...doc.data() }); });
        const actualVoters = voterList.filter(voter => voter.role !== 'admin');
        setVoters(actualVoters);
        processTallies(actualVoters, candidatesMap);
      } catch (error) { console.error('Ralat memuatkan keputusan:', error); } finally { setLoading(false); }
    };
    fetchResults();
  }, []);

  const getTotalVotesForPosition = (position) => Object.values(tally[position] || {}).reduce((sum, count) => sum + count, 0);
  const getVotePercentage = (voteCount, position) => {
    const total = getTotalVotesForPosition(position);
    return total > 0 ? ((voteCount / total) * 100).toFixed(1) : 0;
  };

  const exportToExcel = () => {
    if (voters.length === 0) return;
    const formattedData = voters.map((voter) => {
      const voteDetails = {};
      CATEGORY_LIST.forEach(category => {
        const votes = voter.voteDetails?.[category.id]?.candidateNames || [];
        voteDetails[category.title] = votes.join(', ') || '-';
      });
      return { Nama: voter.fullName || '', Syarikat: voter.company || '', Emel: voter.email || '', Status: voter.hasVoted ? 'Telah Mengundi' : 'Belum Mengundi', Masa_Undian: formatTimestamp(voter.lastVotedAt || voter.votedAt), ...voteDetails };
    });
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Butiran Pengundi');
    XLSX.writeFile(workbook, `Keputusan_Pemilihan_KSNSSB_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32}/></div>;

  const totalMembers = voters.length;
  const totalVotes = voters.filter((v) => v.hasVoted).length;
  const turnout = totalMembers > 0 ? ((totalVotes / totalMembers) * 100).toFixed(1) : 0;

  const renderBreakdown = (ids) => ids.map((position) => {
    const positionVotes = tally[position] || {};
    const totalForPosition = getTotalVotesForPosition(position);
    const posCat = CATEGORY_LIST.find(c => c.id === position);
    return (
      <div key={position} className="border border-slate-200 rounded-2xl p-5 bg-white">
        <h4 className="font-black text-blue-600 uppercase mb-4 text-xs tracking-wider">{posCat?.title}</h4>
        {Object.entries(positionVotes).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(positionVotes).sort((a, b) => b[1] - a[1]).map(([candidate, votes]) => (
              <div key={candidate} className="space-y-1">
                <div className="flex justify-between text-sm font-bold">
                  <span>{candidate}</span>
                  <span>{votes} ({getVotePercentage(votes, position)}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${getVotePercentage(votes, position)}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-xs italic text-slate-400" data-translate="noVotesRecorded">Tiada undian direkodkan.</p>}
        <p className="mt-4 pt-4 border-t text-[10px] font-bold text-slate-500 uppercase" data-translate="totalVotes">Jumlah undi: {totalForPosition}</p>
      </div>
    );
  });

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-6 text-slate-900">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black" data-translate="resultsTitle">Keputusan Pemilihan</h1>
          <p className="text-sm text-slate-500" data-translate="resultsSubtitle">Laporan Komprehensif Kesatuan</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={() => navigate('/public-results')} className="bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2"><Award size={14} /> <span data-translate="publicResults">Keputusan Awam</span></button>
          <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2"><FileSpreadsheet size={14} /> <span data-translate="exportExcel">Excel</span></button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] uppercase font-bold text-slate-400" data-translate="totalRegistered">Ahli Berdaftar</p><p className="text-2xl font-black">{totalMembers}</p></div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] uppercase font-bold text-slate-400" data-translate="totalVotesReceived">Undian Diterima</p><p className="text-2xl font-black">{totalVotes}</p></div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] uppercase font-bold text-slate-400" data-translate="turnoutRate">Kadar Keluar Mengundi</p><p className="text-2xl font-black">{turnout}%</p></div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg space-y-6">
        <div className="flex items-center gap-2"><TrendingUp size={20} className="text-blue-600"/><h2 className="font-black" data-translate="voteBreakdown">Pecahan Undian</h2></div>
        <div>
            <h3 className="text-[10px] font-black mb-4 uppercase tracking-wider text-slate-400" data-translate="mainPositions">Jawatan Utama</h3>
            <div className="grid md:grid-cols-2 gap-4">{renderBreakdown(utamaIds)}</div>
        </div>
        <div>
            <h3 className="text-[10px] font-black mb-4 uppercase tracking-wider text-slate-400" data-translate="committeeMembers">Jawatankuasa Kerja</h3>
            <div className="grid md:grid-cols-2 gap-4">{renderBreakdown(excoIds)}</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
        <div className="p-6 border-b"><h2 className="font-black" data-translate="voterRecords">Rekod Pengundi</h2></div>
        <div className="divide-y">
          {voters.map((voter) => (
             <div key={voter.id}>
                <button onClick={() => setExpandedVoter(expandedVoter === voter.id ? null : voter.id)} className="w-full p-4 flex justify-between items-center hover:bg-slate-50 transition">
                   <div className="text-left">
                     <p className="font-bold text-sm">{voter.fullName}</p>
                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${voter.hasVoted ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                        {voter.hasVoted ? <span data-translate="voted">Telah Mengundi</span> : <span data-translate="notVoted">Belum Mengundi</span>}
                     </span>
                   </div>
                   {expandedVoter === voter.id ? <EyeOff size={16} className="text-slate-400"/> : <Eye size={16} className="text-slate-400"/>}
                </button>
                {expandedVoter === voter.id && voter.hasVoted && (
                    <div className="bg-slate-50 p-4 space-y-2">
                        <h4 className="font-bold text-xs text-slate-500 mb-2" data-translate="voterChoices">Pilihan Pengundi:</h4>
                        {CATEGORY_LIST.map(cat => (
                            <div key={cat.id} className="bg-white p-3 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-bold uppercase text-slate-400">{cat.title}</p>
                                <p className="font-semibold text-sm text-blue-800">{voter.voteDetails?.[cat.id]?.candidateNames?.join(', ') || '-'}</p>
                            </div>
                        ))}
                    </div>
                )}
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Results;