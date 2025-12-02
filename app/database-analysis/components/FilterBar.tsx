"use client";

import { useState, useEffect, useRef } from "react";
import { MatchFilters } from "@/types/database";
import { Search, X } from "lucide-react";

interface FilterBarProps {
  filters: MatchFilters;
  onFilterChange: (filters: Partial<MatchFilters>) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  allTeams?: string[];
  selectedLeagues?: string[];
}

export default function FilterBar({
  filters,
  onFilterChange,
  onApplyFilters,
  onResetFilters,
  allTeams = [],
  selectedLeagues = [],
}: FilterBarProps) {
  const [homeTeamSearchInput, setHomeTeamSearchInput] = useState("");
  const [awayTeamSearchInput, setAwayTeamSearchInput] = useState("");
  const [showHomeTeamSuggestions, setShowHomeTeamSuggestions] = useState(false);
  const [showAwayTeamSuggestions, setShowAwayTeamSuggestions] = useState(false);
  const [selectedHomeTeam, setSelectedHomeTeam] = useState("");
  const [selectedAwayTeam, setSelectedAwayTeam] = useState("");
  const [filteredTeamsByLeague, setFilteredTeamsByLeague] = useState<string[]>(
    []
  );
  const homeTeamSearchRef = useRef<HTMLDivElement>(null);
  const awayTeamSearchRef = useRef<HTMLDivElement>(null);

  // Tüm takımları kullan (lig bazlı filtreleme kaldırıldı - performans optimizasyonu)
  useEffect(() => {
    setFilteredTeamsByLeague(allTeams);
  }, [allTeams]);

  // Ev sahibi takım önerileri
  const homeTeamSuggestions = homeTeamSearchInput
    ? filteredTeamsByLeague
        .filter((team) =>
          team.toLowerCase().includes(homeTeamSearchInput.toLowerCase())
        )
        .slice(0, 10)
    : [];

  // Deplasman takım önerileri
  const awayTeamSuggestions = awayTeamSearchInput
    ? filteredTeamsByLeague
        .filter((team) =>
          team.toLowerCase().includes(awayTeamSearchInput.toLowerCase())
        )
        .slice(0, 10)
    : [];

  // Dışarı tıklanınca dropdown'ları kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        homeTeamSearchRef.current &&
        !homeTeamSearchRef.current.contains(event.target as Node)
      ) {
        setShowHomeTeamSuggestions(false);
      }
      if (
        awayTeamSearchRef.current &&
        !awayTeamSearchRef.current.contains(event.target as Node)
      ) {
        setShowAwayTeamSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleHomeTeamSelect = (team: string) => {
    setSelectedHomeTeam(team);
    setHomeTeamSearchInput("");
    setShowHomeTeamSuggestions(false);
    onFilterChange({ homeTeam: team });
  };

  const handleAwayTeamSelect = (team: string) => {
    setSelectedAwayTeam(team);
    setAwayTeamSearchInput("");
    setShowAwayTeamSuggestions(false);
    onFilterChange({ awayTeam: team });
  };

  const handleClearHomeTeam = () => {
    setSelectedHomeTeam("");
    setHomeTeamSearchInput("");
    onFilterChange({ homeTeam: undefined });
  };

  const handleClearAwayTeam = () => {
    setSelectedAwayTeam("");
    setAwayTeamSearchInput("");
    onFilterChange({ awayTeam: undefined });
  };

  return (
    <div className="bg-linear-to-r from-gray-800 to-gray-900 border-b border-gray-700 p-4 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <details className="group">
          <summary className="cursor-pointer text-sm font-semibold text-blue-400 hover:text-blue-300 mb-3 flex items-center gap-2">
            <span>⚙️ İleri Seviye Filtreler (Opsiyonel)</span>
            <span className="text-xs text-gray-500 group-open:hidden">
              Genişletmek için tıklayın
            </span>
          </summary>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {/* 1. Tarih */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                📅 Tarih
              </label>
              <input
                type="date"
                value={filters.dateFrom || ""}
                onChange={(e) =>
                  onFilterChange({ dateFrom: e.target.value || undefined })
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 2. Saat */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                🕐 Saat
              </label>
              <input
                type="time"
                value={filters.timeFrom || ""}
                onChange={(e) =>
                  onFilterChange({ timeFrom: e.target.value || undefined })
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 3. Ev Sahibi Takım */}
            <div className="relative" ref={homeTeamSearchRef}>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                🏠 Ev Sahibi
              </label>
              {selectedHomeTeam ? (
                <div className="w-full px-3 py-2 border-2 border-blue-500 rounded-lg text-sm bg-blue-900/30 flex items-center justify-between">
                  <span className="font-medium text-blue-400">
                    {selectedHomeTeam}
                  </span>
                  <button
                    onClick={handleClearHomeTeam}
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
                      placeholder="Ev sahibi takım..."
                      value={homeTeamSearchInput}
                      onChange={(e) => {
                        setHomeTeamSearchInput(e.target.value);
                        setShowHomeTeamSuggestions(true);
                      }}
                      onFocus={() => setShowHomeTeamSuggestions(true)}
                      className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {showHomeTeamSuggestions &&
                    homeTeamSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {homeTeamSuggestions.map((team) => (
                          <button
                            key={team}
                            onClick={() => handleHomeTeamSelect(team)}
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

            {/* 4. Deplasman Takım */}
            <div className="relative" ref={awayTeamSearchRef}>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                ✈️ Deplasman
              </label>
              {selectedAwayTeam ? (
                <div className="w-full px-3 py-2 border-2 border-purple-500 rounded-lg text-sm bg-purple-900/30 flex items-center justify-between">
                  <span className="font-medium text-purple-400">
                    {selectedAwayTeam}
                  </span>
                  <button
                    onClick={handleClearAwayTeam}
                    className="text-purple-400 hover:text-purple-300"
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
                      placeholder="Deplasman takım..."
                      value={awayTeamSearchInput}
                      onChange={(e) => {
                        setAwayTeamSearchInput(e.target.value);
                        setShowAwayTeamSuggestions(true);
                      }}
                      onFocus={() => setShowAwayTeamSuggestions(true)}
                      className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {showAwayTeamSuggestions &&
                    awayTeamSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {awayTeamSuggestions.map((team) => (
                          <button
                            key={team}
                            onClick={() => handleAwayTeamSelect(team)}
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
        </details>
      </div>
    </div>
  );
}
