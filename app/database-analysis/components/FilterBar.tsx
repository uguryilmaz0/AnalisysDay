"use client";

import { useState, useEffect, useRef } from "react";
import { MatchFilters } from "@/types/database";
import { Search, X } from "lucide-react";
import { getTeamsByLeagues } from "@/lib/matchService";

interface FilterBarProps {
  filters: MatchFilters;
  onFilterChange: (filters: Partial<MatchFilters>) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  allTeams?: string[];
  selectedLeagues?: string[]; // Seçili liglere göre takım filtreleme için
}

export default function FilterBar({
  filters,
  onFilterChange,
  onApplyFilters,
  onResetFilters,
  allTeams = [],
  selectedLeagues = [],
}: FilterBarProps) {
  const [teamSearchInput, setTeamSearchInput] = useState("");
  const [showTeamSuggestions, setShowTeamSuggestions] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [filteredTeamsByLeague, setFilteredTeamsByLeague] = useState<string[]>(
    []
  );
  const teamSearchRef = useRef<HTMLDivElement>(null);

  // Seçili liglere göre takımları filtrele
  useEffect(() => {
    const loadFilteredTeams = async () => {
      if (selectedLeagues.length === 0) {
        setFilteredTeamsByLeague(allTeams);
        return;
      }

      try {
        const teams = await getTeamsByLeagues(selectedLeagues);
        setFilteredTeamsByLeague(teams);
        console.log(
          `✅ ${selectedLeagues.length} lig için ${teams.length} takım yüklendi`
        );
      } catch (error) {
        console.error("Takımlar yüklenirken hata:", error);
        setFilteredTeamsByLeague(allTeams);
      }
    };

    loadFilteredTeams();
  }, [selectedLeagues, allTeams]);

  // Takım önerileri (seçili liglere göre filtrelenir)
  const teamSuggestions = teamSearchInput
    ? filteredTeamsByLeague
        .filter((team) =>
          team.toLowerCase().includes(teamSearchInput.toLowerCase())
        )
        .slice(0, 10)
    : [];

  // Dışarı tıklanınca dropdown'u kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        teamSearchRef.current &&
        !teamSearchRef.current.contains(event.target as Node)
      ) {
        setShowTeamSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTeamSelect = (team: string) => {
    setSelectedTeam(team);
    setTeamSearchInput("");
    setShowTeamSuggestions(false);
    onFilterChange({ teamSearch: team });
  };

  const handleClearTeam = () => {
    setSelectedTeam("");
    setTeamSearchInput("");
    onFilterChange({ teamSearch: undefined });
  };

  return (
    <div className="bg-linear-to-r from-gray-800 to-gray-900 border-b border-gray-700 p-4 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <h3 className="text-sm font-semibold text-blue-400 mb-3">
          🔍 Filtreler
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Takım Arama - Autocomplete */}
          <div className="relative" ref={teamSearchRef}>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Takım Ara{" "}
              {selectedLeagues.length > 0 && (
                <span className="text-blue-400 text-[10px]">
                  ({selectedLeagues.length} lig seçili)
                </span>
              )}
            </label>
            {selectedTeam ? (
              <div className="w-full px-3 py-2 border-2 border-blue-500 rounded-lg text-sm bg-blue-900/30 flex items-center justify-between">
                <span className="font-medium text-blue-400">
                  {selectedTeam}
                </span>
                <button
                  onClick={handleClearTeam}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Takım adı yazın..."
                    value={teamSearchInput}
                    onChange={(e) => {
                      setTeamSearchInput(e.target.value);
                      setShowTeamSuggestions(true);
                    }}
                    onFocus={() => setShowTeamSuggestions(true)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {showTeamSuggestions && teamSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {teamSuggestions.map((team) => (
                      <button
                        key={team}
                        onClick={() => handleTeamSelect(team)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-600 transition-colors"
                      >
                        {team}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Over/Under */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              ⚽ Gol Üst/Alt
            </label>
            <select
              value={
                filters.overUnder
                  ? `${filters.overUnder.type}-${filters.overUnder.value}`
                  : ""
              }
              onChange={(e) => {
                if (!e.target.value) {
                  onFilterChange({ overUnder: undefined });
                  return;
                }
                const [type, value] = e.target.value.split("-");
                onFilterChange({
                  overUnder: {
                    type: type as "over" | "under",
                    value: parseFloat(value) as 1.5 | 2.5 | 3.5,
                  },
                });
              }}
              className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seçiniz...</option>
              <optgroup label="🔼 Üst">
                <option value="over-1.5">Üst 1.5</option>
                <option value="over-2.5">Üst 2.5</option>
                <option value="over-3.5">Üst 3.5</option>
              </optgroup>
              <optgroup label="🔽 Alt">
                <option value="under-1.5">Alt 1.5</option>
                <option value="under-2.5">Alt 2.5</option>
                <option value="under-3.5">Alt 3.5</option>
              </optgroup>
            </select>
          </div>

          {/* BTTS */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              🎯 Karşılıklı Gol
            </label>
            <select
              value={filters.btts || ""}
              onChange={(e) =>
                onFilterChange({
                  btts: e.target.value
                    ? (e.target.value as "yes" | "no")
                    : undefined,
                })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seçiniz...</option>
              <option value="yes">✅ Var</option>
              <option value="no">❌ Yok</option>
            </select>
          </div>

          {/* Maç Sonucu */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              🏁 Maç Sonucu (MS)
            </label>
            <select
              value={filters.result || ""}
              onChange={(e) =>
                onFilterChange({
                  result: e.target.value
                    ? (e.target.value as "1" | "X" | "2")
                    : undefined,
                })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seçiniz...</option>
              <option value="1">🏠 Ev Sahibi (1)</option>
              <option value="X">🤝 Beraberlik (X)</option>
              <option value="2">✈️ Deplasman (2)</option>
            </select>
          </div>

          {/* İlk Yarı Sonucu */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              ⏱️ İlk Yarı Sonucu
            </label>
            <select
              value={filters.htResult || ""}
              onChange={(e) =>
                onFilterChange({
                  htResult: e.target.value
                    ? (e.target.value as "1" | "X" | "2")
                    : undefined,
                })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seçiniz...</option>
              <option value="1">🏠 Ev Sahibi (1)</option>
              <option value="X">🤝 Beraberlik (X)</option>
              <option value="2">✈️ Deplasman (2)</option>
            </select>
          </div>

          {/* İkinci Yarı Sonucu */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              ⏳ İkinci Yarı Sonucu
            </label>
            <select
              value={filters.shResult || ""}
              onChange={(e) =>
                onFilterChange({
                  shResult: e.target.value
                    ? (e.target.value as "1" | "X" | "2")
                    : undefined,
                })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seçiniz...</option>
              <option value="1">🏠 Ev Sahibi (1)</option>
              <option value="X">🤝 Beraberlik (X)</option>
              <option value="2">✈️ Deplasman (2)</option>
            </select>
          </div>

          {/* Maç Sonucu Çifte Şans */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              🎲 MS Çifte Şans
            </label>
            <select
              value={filters.ftDoubleChance || ""}
              onChange={(e) =>
                onFilterChange({
                  ftDoubleChance: e.target.value
                    ? (e.target.value as "1X" | "12" | "X2")
                    : undefined,
                })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seçiniz...</option>
              <option value="1X">🏠🤝 1 veya X</option>
              <option value="12">🏠✈️ 1 veya 2</option>
              <option value="X2">🤝✈️ X veya 2</option>
            </select>
          </div>

          {/* İlk Yarı Çifte Şans */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              🎲 İY Çifte Şans
            </label>
            <select
              value={filters.htDoubleChance || ""}
              onChange={(e) =>
                onFilterChange({
                  htDoubleChance: e.target.value
                    ? (e.target.value as "1X" | "12" | "X2")
                    : undefined,
                })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seçiniz...</option>
              <option value="1X">🏠🤝 1 veya X</option>
              <option value="12">🏠✈️ 1 veya 2</option>
              <option value="X2">🤝✈️ X veya 2</option>
            </select>
          </div>

          {/* İlk Yarı / Maç Sonu */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              ⏱️ İY/MS
            </label>
            <select
              value={filters.htFt || ""}
              onChange={(e) =>
                onFilterChange({ htFt: e.target.value || undefined })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seçiniz...</option>
              <option value="1/1">1/1</option>
              <option value="1/X">1/X</option>
              <option value="1/2">1/2</option>
              <option value="X/1">X/1</option>
              <option value="X/X">X/X</option>
              <option value="X/2">X/2</option>
              <option value="2/1">2/1</option>
              <option value="2/X">2/X</option>
              <option value="2/2">2/2</option>
            </select>
          </div>

          {/* Asya Handikap */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              📊 Asya Handikap
            </label>
            <select
              value={
                filters.asianHandicap
                  ? `${filters.asianHandicap.team}-${filters.asianHandicap.value}`
                  : ""
              }
              onChange={(e) => {
                if (!e.target.value) {
                  onFilterChange({ asianHandicap: undefined });
                  return;
                }
                const [team, value] = e.target.value.split("-");
                onFilterChange({
                  asianHandicap: {
                    team: team as "home" | "away",
                    value: parseFloat(value) as -0.5 | 0 | 0.5,
                  },
                });
              }}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seçiniz...</option>
              <optgroup label="🏠 Ev Sahibi">
                <option value="home--0.5">Ev -0.5</option>
                <option value="home-0">Ev 0</option>
                <option value="home-0.5">Ev +0.5</option>
              </optgroup>
              <optgroup label="✈️ Deplasman">
                <option value="away--0.5">Deplasman -0.5</option>
                <option value="away-0">Deplasman 0</option>
                <option value="away-0.5">Deplasman +0.5</option>
              </optgroup>
            </select>
          </div>

          {/* Avrupa Handikap */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              📈 Avrupa Handikap
            </label>
            <select
              value={
                filters.europeanHandicap
                  ? `${filters.europeanHandicap.result}-${filters.europeanHandicap.value}`
                  : ""
              }
              onChange={(e) => {
                if (!e.target.value) {
                  onFilterChange({ europeanHandicap: undefined });
                  return;
                }
                const [result, value] = e.target.value.split("-");
                onFilterChange({
                  europeanHandicap: {
                    result: result as "1" | "X" | "2",
                    value: parseInt(value) as -1,
                  },
                });
              }}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seçiniz...</option>
              <option value="1--1">🏠 Ev (-1)</option>
              <option value="X--1">🤝 Beraberlik (-1)</option>
              <option value="2--1">✈️ Deplasman (-1)</option>
            </select>
          </div>

          {/* Maç Skorları */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              ⚽ Maç Skorları
            </label>
            <select
              value={
                filters.correctScore
                  ? `${filters.correctScore.period}-${filters.correctScore.score}`
                  : ""
              }
              onChange={(e) => {
                if (!e.target.value) {
                  onFilterChange({ correctScore: undefined });
                  return;
                }
                const [period, score] = e.target.value.split("-");
                onFilterChange({
                  correctScore: {
                    period: period as "ht" | "ft",
                    score: score,
                  },
                });
              }}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seçiniz...</option>
              <optgroup label="⏱️ İlk Yarı">
                <option value="ht-1-0">İY 1-0</option>
                <option value="ht-2-0">İY 2-0</option>
                <option value="ht-2-1">İY 2-1</option>
                <option value="ht-0-0">İY 0-0</option>
                <option value="ht-1-1">İY 1-1</option>
                <option value="ht-0-1">İY 0-1</option>
                <option value="ht-0-2">İY 0-2</option>
                <option value="ht-1-2">İY 1-2</option>
              </optgroup>
              <optgroup label="🏁 Maç Sonu">
                <option value="ft-1-0">MS 1-0</option>
                <option value="ft-2-0">MS 2-0</option>
                <option value="ft-2-1">MS 2-1</option>
                <option value="ft-3-0">MS 3-0</option>
                <option value="ft-3-1">MS 3-1</option>
                <option value="ft-0-0">MS 0-0</option>
                <option value="ft-1-1">MS 1-1</option>
                <option value="ft-2-2">MS 2-2</option>
                <option value="ft-0-1">MS 0-1</option>
                <option value="ft-0-2">MS 0-2</option>
                <option value="ft-1-2">MS 1-2</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={onApplyFilters}
            className="flex-1 sm:flex-none px-8 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            🔍 Filtreleri Uygula
          </button>
          <button
            onClick={onResetFilters}
            className="flex-1 sm:flex-none px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200"
          >
            🔄 Sıfırla
          </button>
        </div>
      </div>
    </div>
  );
}
