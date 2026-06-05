import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import {
  Loader2,
  Users,
  CheckCircle2,
  BarChart3,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';

const Results = () => {
  const [voters, setVoters] = useState([]);
  const [tally, setTally] = useState({});
  const [loading, setLoading] = useState(true);

  const processTallies = (votersList) => {
    const voteCount = {};

    votersList.forEach((voter) => {
      if (!voter.hasVoted || !voter.votes) return;

      Object.keys(voter.votes).forEach((position) => {
        if (!voteCount[position]) {
          voteCount[position] = {};
        }

        const selectedCandidates = voter.votes[position];

        if (Array.isArray(selectedCandidates)) {
          selectedCandidates.forEach((candidate) => {
            voteCount[position][candidate] =
              (voteCount[position][candidate] || 0) + 1;
          });
        }
      });
    });

    setTally(voteCount);
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const snapshot = await getDocs(
          collection(db, 'voting')
        );

        const voterList = [];

        snapshot.forEach((doc) => {
          voterList.push({
            id: doc.id,
            ...doc.data()
          });
        });

        setVoters(voterList);
        processTallies(voterList);
      } catch (error) {
        console.error('Error loading results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const exportToExcel = () => {
    if (voters.length === 0) return;

    const formattedData = voters.map((voter) => ({
      Name: voter.fullName || '',
      Company: voter.company || '',
      Email: voter.email || '',
      Status: voter.hasVoted ? 'Submitted' : 'Pending',
      SubmissionTime: voter.votedAt || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Election Results'
    );

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
    <div className="max-w-6xl mx-auto p-6 space-y-8">

      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            Election Results
          </h1>

          <p className="text-slate-500 mt-1">
            P2SA AGM Voting Summary
          </p>
        </div>

        <button
          onClick={exportToExcel}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2"
        >
          <FileSpreadsheet size={18} />
          Export Excel
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">

        <div className="bg-white border rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Users className="text-blue-600" />

            <div>
              <p className="text-xs uppercase text-slate-400 font-bold">
                Total Members
              </p>

              <p className="text-2xl font-black">
                {totalMembers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-green-600" />

            <div>
              <p className="text-xs uppercase text-slate-400 font-bold">
                Votes Submitted
              </p>

              <p className="text-2xl font-black">
                {totalVotes}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-amber-600" />

            <div>
              <p className="text-xs uppercase text-slate-400 font-bold">
                Voter Turnout
              </p>

              <p className="text-2xl font-black">
                {turnout}%
              </p>
            </div>
          </div>
        </div>

      </div>

      <div className="bg-white border rounded-3xl p-6">
        <h2 className="font-black text-xl mb-6">
          Vote Count
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          {Object.keys(tally).map((position) => (
            <div
              key={position}
              className="border rounded-2xl p-4"
            >
              <h3 className="font-black text-blue-600 uppercase mb-4">
                {position}
              </h3>

              {Object.entries(tally[position]).length > 0 ? (
                Object.entries(tally[position]).map(
                  ([candidate, count]) => (
                    <div
                      key={candidate}
                      className="flex justify-between py-2 border-b last:border-0"
                    >
                      <span>{candidate}</span>

                      <span className="font-bold">
                        {count} votes
                      </span>
                    </div>
                  )
                )
              ) : (
                <p className="text-slate-400 text-sm">
                  No votes recorded.
                </p>
              )}
            </div>
          ))}

        </div>
      </div>

      <div className="bg-white border rounded-3xl overflow-hidden">

        <div className="p-6 border-b">
          <h2 className="font-black text-xl">
            Voter List
          </h2>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr className="bg-slate-50">
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Company</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Submission Time</th>
              </tr>
            </thead>

            <tbody>

              {voters.map((voter) => (
                <tr
                  key={voter.id}
                  className="border-t"
                >
                  <td className="p-4">
                    {voter.fullName || '-'}
                  </td>

                  <td className="p-4">
                    {voter.company || '-'}
                  </td>

                  <td className="p-4">
                    {voter.hasVoted
                      ? 'Submitted'
                      : 'Pending'}
                  </td>

                  <td className="p-4">
                    {voter.votedAt || '-'}
                  </td>
                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default Results;