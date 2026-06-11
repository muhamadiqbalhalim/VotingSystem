import { useEffect, useState } from 'react';
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
  const [voters, setVoters] = useState([]);
  const [tally, setTally] = useState({});
  const [candidatesById, setCandidatesById] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedVoter, setExpandedVoter] = useState(null);

  const formatTimestamp = (value) => {
    if (!value) return '';

    if (typeof value.toDate === 'function') {
      return value.toDate().toLocaleString('en-MY', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    }

    return value;
  };

  const processTallies = (votersList, candidatesMap) => {
    // Filter out admin users from vote tallies
    const actualVoters = votersList.filter(voter => voter.role !== 'admin');
    
    const voteCount = CATEGORY_LIST.reduce((acc, category) => {
      acc[category.id] = {};
      return acc;
    }, {});

    actualVoters.forEach((voter) => {
      if (!voter.votes) return;

      Object.keys(voter.votes).forEach((position) => {
        if (!voteCount[position]) {
          voteCount[position] = {};
        }

        const selectedCandidates = voter.votes[position];

        if (Array.isArray(selectedCandidates)) {
          selectedCandidates.forEach((candidateValue) => {
            const candidateName = candidatesMap[candidateValue]?.name || candidateValue;

            voteCount[position][candidateName] =
              (voteCount[position][candidateName] || 0) + 1;
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
          getDocs(collection(db, 'voting')),
          getDocs(collection(db, 'candidates'))
        ]);

        const voterList = [];
        const candidatesMap = {};

        candidatesSnapshot.forEach((doc) => {
          candidatesMap[doc.id] = {
            id: doc.id,
            ...doc.data()
          };
        });

        votersSnapshot.forEach((doc) => {
          voterList.push({
            id: doc.id,
            ...doc.data()
          });
        });

        // Filter out admin users from the voter list
        const actualVoters = voterList.filter(voter => voter.role !== 'admin');

        setCandidatesById(candidatesMap);
        setVoters(actualVoters);
        processTallies(actualVoters, candidatesMap);
      } catch (error) {
        console.error('Error loading results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const getLeadingCandidate = (position) => {
    const votes = tally[position] || {};
    if (Object.keys(votes).length === 0) return null;
    
    const leading = Object.entries(votes).reduce((prev, current) =>
      current[1] > prev[1] ? current : prev
    );
    
    return { name: leading[0], votes: leading[1] };
  };

  const getTotalVotesForPosition = (position) => {
    const votes = tally[position] || {};
    return Object.values(votes).reduce((sum, count) => sum + count, 0);
  };

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
        Name: voter.fullName || '',
        Company: voter.company || '',
        Email: voter.email || '',
        Status: voter.hasVoted ? 'Submitted' : 'Pending',
        SubmissionTime: formatTimestamp(voter.lastVotedAt || voter.votedAt),
        ...voteDetails
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Voter Details');

    // Add tally sheet
    const tallyData = [];
    Object.keys(tally).forEach(position => {
      const positionVotes = tally[position];
      Object.entries(positionVotes).forEach(([candidate, votes]) => {
        tallyData.push({
          Position: position.toUpperCase(),
          Candidate: candidate,
          Votes: votes,
          Percentage: `${getVotePercentage(votes, position)}%`
        });
      });
    });

    const tallySheet = XLSX.utils.json_to_sheet(tallyData);
    XLSX.utils.book_append_sheet(workbook, tallySheet, 'Vote Tally');

    XLSX.writeFile(
      workbook,
      `P2SA_Election_Results_${new Date()
        .toISOString()
        .split('T')[0]}.xlsx`
    );
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2
          className="animate-spin text-blue-600"
          size={32}
        />
      </div>
    );
  }

  const totalMembers = voters.length;
  const totalVotes = voters.filter(
    (v) => v.hasVoted
  ).length;

  const turnout =
    totalMembers > 0
      ? ((totalVotes / totalMembers) * 100).toFixed(1)
      : 0;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 text-slate-900">

      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900">
            Election Results
          </h1>
          <p className="text-slate-600 mt-1 text-lg">
            P2SA AGM 2026 Comprehensive Voting Report
          </p>
        </div>

        <button
          onClick={exportToExcel}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
        >
          <FileSpreadsheet size={18} />
          Export Excel Report
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass-panel-soft border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-slate-900">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-xs uppercase text-slate-600 font-bold">Total Members</p>
              <p className="text-3xl font-black text-slate-900">{totalMembers}</p>
            </div>
          </div>
        </div>

        <div className="glass-panel-soft border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-slate-900">
            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-xs uppercase text-slate-600 font-bold">Votes Submitted</p>
              <p className="text-3xl font-black text-slate-900">{totalVotes}</p>
            </div>
          </div>
        </div>

        <div className="glass-panel-soft border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-slate-900">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
              <BarChart3 className="text-amber-600" size={24} />
            </div>
            <div>
              <p className="text-xs uppercase text-slate-600 font-bold">Turnout Rate</p>
              <p className="text-3xl font-black text-slate-900">{turnout}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leading Candidates Summary */}
      <div className="glass-panel-soft border-slate-200 rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Award className="text-yellow-600" size={28} />
          <h2 className="text-2xl font-black text-slate-900">Leading Candidates</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORY_LIST.map((category) => {
            const leader = getLeadingCandidate(category.id);
            return (
              <div key={category.id} className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-5 border border-amber-200">
                <p className="text-sm font-bold text-slate-600 uppercase mb-3">{category.title}</p>
                {leader ? (
                  <>
                    <p className="text-xl font-black text-slate-900">{leader.name}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-amber-600">{leader.votes}</span>
                      <span className="text-sm text-slate-600">votes ({getVotePercentage(leader.votes, category.id)}%)</span>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-500 italic">No votes recorded</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Vote Breakdown */}
      <div className="glass-panel-soft border-slate-200 rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="text-blue-600" size={28} />
          <h2 className="text-2xl font-black text-slate-900">Complete Vote Breakdown</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {Object.keys(tally).map((position) => {
            const positionVotes = tally[position];
            const totalForPosition = getTotalVotesForPosition(position);
            const positionCategory = CATEGORY_LIST.find(c => c.id === position);

            return (
              <div key={position} className="border border-slate-300 rounded-2xl p-6 bg-white">
                <h3 className="font-black text-blue-600 uppercase mb-5 text-lg">
                  {positionCategory?.title}
                </h3>

                {Object.entries(positionVotes).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(positionVotes)
                      .sort((a, b) => b[1] - a[1])
                      .map(([candidate, votes]) => (
                        <div key={candidate} className="space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="font-semibold text-slate-900">{candidate}</span>
                            <div className="text-right">
                              <span className="font-bold text-blue-600">{votes}</span>
                              <span className="text-slate-600 ml-2">({getVotePercentage(votes, position)}%)</span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                              style={{ width: `${(votes / totalForPosition) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-slate-600 text-sm italic">No votes recorded.</p>
                )}
                <div className="mt-5 pt-5 border-t border-slate-200">
                  <p className="text-sm text-slate-600">Total votes: <span className="font-bold">{totalForPosition}</span></p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Voter Details with Choices */}
      <div className="glass-panel-soft border-slate-200 overflow-hidden rounded-3xl">
        <div className="p-8 border-b border-slate-200">
          <h2 className="text-2xl font-black text-slate-900">
            Detailed Voter Information
          </h2>
          <p className="text-slate-600 mt-1">Click to expand voter choices</p>
        </div>

        <div className="divide-y divide-slate-200">
          {voters.map((voter) => (
            <div key={voter.id} className="bg-white hover:bg-slate-50 transition-colors">
              <button
                onClick={() => setExpandedVoter(expandedVoter === voter.id ? null : voter.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 text-left">
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-lg">{voter.fullName || '-'}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-slate-600">{voter.company || '-'}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        voter.hasVoted
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {voter.hasVoted ? 'Submitted' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-slate-600">
                      {formatTimestamp(voter.lastVotedAt) || '-'}
                    </p>
                  </div>
                </div>
                <div className="ml-4">
                  {expandedVoter === voter.id ? (
                    <EyeOff className="text-slate-400" size={20} />
                  ) : (
                    <Eye className="text-slate-400" size={20} />
                  )}
                </div>
              </button>

              {expandedVoter === voter.id && voter.hasVoted && (
                <div className="bg-blue-50 px-6 py-4 border-t border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-4">Voter Choices:</h4>
                  <div className="space-y-3">
                    {CATEGORY_LIST.map((category) => {
                      const voterChoice = voter.voteDetails?.[category.id];
                      return (
                        <div key={category.id} className="bg-white rounded-lg p-3">
                          <p className="text-xs font-bold text-slate-600 uppercase mb-2">{category.title}</p>
                          {voterChoice?.candidateNames?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {voterChoice.candidateNames.map((name, idx) => (
                                <span
                                  key={idx}
                                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold"
                                >
                                  {name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-600 text-sm italic">No vote for this position</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
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
