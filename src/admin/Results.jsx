import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import {
  Loader2,
  Users,
  CheckCircle2,
  BarChart3,
  FileSpreadsheet,
  TrendingUp,
  Award,
  Eye,
  EyeOff
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { CATEGORY_LIST } from '../lib/electionConfig';

const Results = () => {
  const navigate = useNavigate(); // 2. Initialize navigate
  const [voters, setVoters] = useState([]);
  const [tally, setTally] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedVoter, setExpandedVoter] = useState(null);

  const utamaIds = ['president', 'deputy', 'vice', 'secretary', 'assistant_secretary', 'treasurer', 'assistant_treasurer'];
  const excoIds = ['exco1', 'exco2', 'exco3'];

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
      return { 
        Nama: voter.fullName || '', 
        Syarikat: voter.company || '', 
        Emel: voter.email || '', 
        Status: voter.hasVoted ? 'Telah Mengundi' : 'Belum Mengundi', 
        Masa_Undian: formatTimestamp(voter.lastVotedAt || voter.votedAt), 
        ...voteDetails 
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Butiran Pengundi');
    XLSX.writeFile(workbook, `Keputusan_Pemilihan_KSNSSB_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32}/></div>;

  const totalMembers = voters.length;
  const totalVotes = voters.filter((v) => v.hasVoted).length;
  const turnout = totalMembers > 0 ? ((totalVotes / totalMembers) * 100).toFixed(1) : 0;

  const renderBreakdown = (ids) => ids.map((position) => {
    const positionVotes = tally[position] || {};
    const totalForPosition = getTotalVotesForPosition(position);
    const posCat = CATEGORY_LIST.find(c => c.id === position);
    return (
      <div key={position} className="border border-slate-300 rounded-2xl p-6 bg-slate-50">
        <h4 className="font-black text-blue-600 uppercase mb-5 text-lg">{posCat?.title}</h4>
        {Object.entries(positionVotes).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(positionVotes).sort((a, b) => b[1] - a[1]).map(([candidate, votes]) => (
              <div key={candidate} className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span>{candidate}</span>
                  <span>{votes} ({getVotePercentage(votes, position)}%)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${getVotePercentage(votes, position)}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-sm italic text-slate-500">Tiada undian direkodkan.</p>}
        <p className="mt-5 pt-5 border-t text-sm font-bold">Jumlah undi: {totalForPosition}</p>
      </div>
    );
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 text-slate-900">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900">Keputusan Pemilihan KSNSSB</h1>
          <p className="text-slate-600 mt-1 text-lg">Laporan Pengundian Komprehensif Kesatuan Sekerja Namicoh Suria Sdn Bhd</p>
        </div>
        
        {/* Butang Eksport & Navigasi Awam */}
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/public-results')} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
          >
            <Award size={18} /> Paparan Keputusan Awam
          </button>
          <button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all">
            <FileSpreadsheet size={18} /> Eksport Laporan Excel
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass-panel-soft p-6 rounded-2xl bg-white border"><p className="text-xs uppercase font-bold text-slate-500">Jumlah Ahli Berdaftar</p><p className="text-3xl font-black">{totalMembers}</p></div>
        <div className="glass-panel-soft p-6 rounded-2xl bg-white border"><p className="text-xs uppercase font-bold text-slate-500">Undian Diterima</p><p className="text-3xl font-black">{totalVotes}</p></div>
        <div className="glass-panel-soft p-6 rounded-2xl bg-white border"><p className="text-xs uppercase font-bold text-slate-500">Kadar Keluar Mengundi</p><p className="text-3xl font-black">{turnout}%</p></div>
      </div>

      <div className="glass-panel-soft border-slate-200 rounded-3xl p-8 bg-white space-y-8">
        <div className="flex items-center gap-3"><TrendingUp size={28} className="text-blue-600"/><h2 className="text-2xl font-black">Pecahan Undian</h2></div>
        <div>
            <h3 className="text-xl font-black mb-4 uppercase tracking-wider border-b pb-2">Jawatan Utama</h3>
            <div className="grid md:grid-cols-2 gap-6">{renderBreakdown(utamaIds)}</div>
        </div>
        <div>
            <h3 className="text-xl font-black mb-4 uppercase tracking-wider border-b pb-2">Jawatankuasa Kerja</h3>
            <div className="grid md:grid-cols-2 gap-6">{renderBreakdown(excoIds)}</div>
        </div>
      </div>

      <div className="glass-panel-soft overflow-hidden rounded-3xl bg-white border border-slate-200">
        <div className="p-8 border-b"><h2 className="text-2xl font-black">Rekod Pengundi</h2><p className="text-slate-600 mt-1">Klik untuk lihat pilihan setiap pengundi</p></div>
        <div className="divide-y">
          {voters.map((voter) => (
             <div key={voter.id}>
                <button onClick={() => setExpandedVoter(expandedVoter === voter.id ? null : voter.id)} className="w-full p-6 flex justify-between hover:bg-slate-50 transition">
                   <div>
                     <p className="font-bold text-lg">{voter.fullName}</p>
                     <span className={`px-2 py-1 rounded text-xs font-bold ${voter.hasVoted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {voter.hasVoted ? 'Telah Mengundi' : 'Belum Mengundi'}
                     </span>
                   </div>
                   {expandedVoter === voter.id ? <EyeOff size={20} className="text-slate-400"/> : <Eye size={20} className="text-slate-400"/>}
                </button>
                {expandedVoter === voter.id && voter.hasVoted && (
                    <div className="bg-blue-50 p-6 space-y-3">
                        <h4 className="font-bold text-slate-900 mb-2">Pilihan Pengundi:</h4>
                        {CATEGORY_LIST.map(cat => (
                            <div key={cat.id} className="bg-white p-3 rounded-lg border border-blue-100">
                                <p className="text-xs font-bold uppercase text-slate-500">{cat.title}</p>
                                <p className="font-semibold text-blue-800">{voter.voteDetails?.[cat.id]?.candidateNames?.join(', ') || '-'}</p>
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