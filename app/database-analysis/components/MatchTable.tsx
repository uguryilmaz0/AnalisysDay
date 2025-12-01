"use client";

import { MatchData } from "@/types/database";

interface MatchTableProps {
  matches: MatchData[];
  isLoading: boolean;
}

export default function MatchTable({ matches, isLoading }: MatchTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-800">
        <p className="text-gray-400 text-lg">
          Seçilen filtrelere uygun maç bulunamadı.
        </p>
        <p className="text-gray-400 text-sm mt-2">
          Lütfen filtreleri değiştirip tekrar deneyin.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-900 sticky top-0">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Tarih
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Lig
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Ev Sahibi
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
              Skor
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Deplasman
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
              İY/MS
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
              Ü 1.5
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
              Ü 2.5
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
              BTTS
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
              1X2 Oranları
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {matches.map((match) => (
            <tr key={match.id} className="hover:bg-gray-700 transition-colors">
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-200">
                {new Date(match.match_date).toLocaleDateString("tr-TR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
                <br />
                <span className="text-xs text-gray-400">{match.time}</span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-200">
                <div className="max-w-[150px] truncate" title={match.league}>
                  {match.league}
                </div>
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-200">
                {match.home_team}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-center">
                <div className="text-sm font-bold text-blue-400">
                  {match.ft_score}
                </div>
                <div className="text-xs text-gray-400">
                  İY: {match.ht_score}
                </div>
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-200">
                {match.away_team}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                <span className="px-2 py-1 bg-gray-700 text-gray-200 rounded">
                  {match.ht_ft}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-center">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    match.ft_over_15 === 1
                      ? "bg-green-900/50 text-green-300 border border-green-700"
                      : "bg-red-900/50 text-red-300 border border-red-700"
                  }`}
                >
                  {match.ft_over_15 === 1 ? "Üst" : "Alt"}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-center">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    match.ft_over_25 === 1
                      ? "bg-green-900/50 text-green-300 border border-green-700"
                      : "bg-red-900/50 text-red-300 border border-red-700"
                  }`}
                >
                  {match.ft_over_25 === 1 ? "Üst" : "Alt"}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-center">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    match.btts === 1
                      ? "bg-blue-900/50 text-blue-300 border border-blue-700"
                      : "bg-gray-700 text-gray-300 border border-gray-600"
                  }`}
                >
                  {match.btts === 1 ? "Var" : "Yok"}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-center text-xs">
                <div className="flex gap-1.5 justify-center items-center">
                  {/* 1 (Ev Sahibi) */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-gray-400 mb-0.5">1</span>
                    <span className="px-3 py-1.5 bg-gray-700/80 text-white rounded font-semibold border border-gray-600 hover:bg-blue-600 hover:border-blue-500 transition-all cursor-pointer min-w-[50px] text-center">
                      {match.ft_home_odds_close?.toFixed(2) || "-"}
                    </span>
                  </div>

                  {/* X (Beraberlik) */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-gray-400 mb-0.5">X</span>
                    <span className="px-3 py-1.5 bg-yellow-900/50 text-yellow-200 rounded font-semibold border border-yellow-700/50 hover:bg-yellow-800 hover:border-yellow-600 transition-all cursor-pointer min-w-[50px] text-center">
                      {match.ft_draw_odds_close?.toFixed(2) || "-"}
                    </span>
                  </div>

                  {/* 2 (Deplasman) */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-gray-400 mb-0.5">2</span>
                    <span className="px-3 py-1.5 bg-gray-700/80 text-white rounded font-semibold border border-gray-600 hover:bg-blue-600 hover:border-blue-500 transition-all cursor-pointer min-w-[50px] text-center">
                      {match.ft_away_odds_close?.toFixed(2) || "-"}
                    </span>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
