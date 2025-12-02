"use client";

import { useState, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";

interface LeagueSidebarProps {
  leagues: string[];
  selectedLeagues: string[];
  onLeagueToggle: (league: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onApplySelection: () => void;
  matchCounts?: Record<string, number>;
}

export default function LeagueSidebar({
  leagues,
  selectedLeagues,
  onLeagueToggle,
  onSelectAll,
  onClearAll,
  onApplySelection,
  matchCounts = {},
}: LeagueSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllLeagues, setShowAllLeagues] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // En popüler ligleri bul (maç sayısına göre)
  const topLeagues = useMemo(() => {
    const sorted = [...leagues].sort((a, b) => {
      const countA = matchCounts[a] || 0;
      const countB = matchCounts[b] || 0;
      return countB - countA;
    });
    return sorted.slice(0, 10);
  }, [leagues, matchCounts]);

  // Arama sonuçları
  const filteredLeagues = useMemo(() => {
    if (!searchTerm) return showAllLeagues ? leagues : topLeagues;
    return leagues.filter((league) =>
      league.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [leagues, topLeagues, searchTerm, showAllLeagues]);

  const displayLeagues = searchTerm
    ? filteredLeagues
    : showAllLeagues
    ? leagues
    : topLeagues;

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col w-72 bg-gray-800 border-r border-gray-700 h-screen sticky top-0">
        <div className="p-4 border-b border-gray-700 bg-linear-to-r from-gray-800 to-gray-900">
          <h2 className="text-lg font-bold text-blue-400 mb-3">🏆 Ligler</h2>

          {/* Arama */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Lig ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Hızlı Aksiyonlar */}
          <div className="flex gap-2">
            <button
              onClick={onSelectAll}
              className="flex-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Tümünü Seç
            </button>
            <button
              onClick={onClearAll}
              className="flex-1 px-3 py-1.5 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Temizle
            </button>
          </div>
        </div>

        {/* Lig Listesi - Scrollable */}
        <div className="flex-1 overflow-y-auto p-3 bg-gray-800">
          {!searchTerm && (
            <p className="text-xs text-gray-400 mb-2 px-2">
              {showAllLeagues ? "Tüm Ligler" : "⭐ En Popüler Ligler"}
            </p>
          )}

          {displayLeagues.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Lig bulunamadı
            </p>
          ) : (
            <div className="space-y-1">
              {displayLeagues.map((league) => {
                const isSelected = selectedLeagues.includes(league);
                const count = matchCounts[league] || 0;
                return (
                  <label
                    key={league}
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors ${
                      isSelected
                        ? "bg-blue-900/30 border border-blue-500"
                        : "border border-transparent"
                    }`}
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onLeagueToggle(league)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 shrink-0 bg-gray-700 border-gray-600"
                      />
                      <span
                        className={`ml-2 text-sm truncate ${
                          isSelected
                            ? "font-semibold text-blue-400"
                            : "text-gray-300"
                        }`}
                        title={league}
                      >
                        {league}
                      </span>
                    </div>
                    {count > 0 && (
                      <span className="ml-2 text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded-full shrink-0">
                        {count}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          )}

          {/* Daha Fazla Göster */}
          {!searchTerm && leagues.length > 10 && (
            <button
              onClick={() => setShowAllLeagues(!showAllLeagues)}
              className="w-full mt-3 px-4 py-2 text-sm text-blue-400 hover:bg-gray-700 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              {showAllLeagues
                ? "Daha Az Göster"
                : `Tüm Ligleri Göster (+${leagues.length - 10})`}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  showAllLeagues ? "rotate-180" : ""
                }`}
              />
            </button>
          )}
        </div>

        {/* Alt Kısım - Footer (Sticky) */}
        <div className="border-t border-gray-700 bg-gray-900">
          {/* Seçim Sayısı */}
          {selectedLeagues.length > 0 && (
            <div className="px-4 py-2 border-b border-gray-700">
              <p className="text-sm text-gray-300">
                <span className="font-bold text-blue-400">
                  {selectedLeagues.length}
                </span>{" "}
                lig seçildi
              </p>
            </div>
          )}

          {/* Uygula Butonu */}
          {selectedLeagues.length > 0 && (
            <div className="p-4">
              <button
                onClick={onApplySelection}
                className="w-full px-4 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <span>🔍</span>
                <span>Maçları Listele ({selectedLeagues.length} Lig)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="w-full px-4 py-3 bg-gray-800 border-b border-gray-700 flex items-center justify-between"
        >
          <span className="font-semibold text-blue-400">
            🏆 Ligler{" "}
            {selectedLeagues.length > 0 && `(${selectedLeagues.length})`}
          </span>
          <ChevronDown
            className={`h-5 w-5 transition-transform ${
              isMobileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isMobileOpen && (
          <div className="bg-gray-800 border-b border-gray-700">
            <div className="p-4">
              {/* Arama */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Lig ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 placeholder-gray-400"
                />
              </div>

              {/* Hızlı Aksiyonlar */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={onSelectAll}
                  className="flex-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg"
                >
                  Tümünü Seç
                </button>
                <button
                  onClick={onClearAll}
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-600 text-white rounded-lg"
                >
                  Temizle
                </button>
              </div>
            </div>

            {/* Lig Listesi - Scrollable */}
            <div className="space-y-1 px-4 max-h-60 overflow-y-auto">
              {displayLeagues.map((league) => {
                const isSelected = selectedLeagues.includes(league);
                const matchCount = matchCounts[league] || 0;
                return (
                  <label
                    key={league}
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors ${
                      isSelected ? "bg-blue-900/30 border border-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-center flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onLeagueToggle(league)}
                        className="w-4 h-4 text-blue-600 rounded bg-gray-700 border-gray-600"
                      />
                      <span
                        className={`ml-2 text-sm ${
                          isSelected
                            ? "font-semibold text-blue-400"
                            : "text-gray-300"
                        }`}
                      >
                        {league}
                      </span>
                    </div>
                    {matchCount > 0 && (
                      <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded-full">
                        {matchCount.toLocaleString()}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            {/* Mobile Uygula Butonu */}
            {selectedLeagues.length > 0 && (
              <div className="px-4 py-4 border-t border-gray-700 bg-gray-900">
                <button
                  onClick={() => {
                    onApplySelection();
                    setIsMobileOpen(false); // Mobile menüyü kapat
                  }}
                  className="w-full px-4 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold text-sm shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>🔍</span>
                  <span>Maçları Listele ({selectedLeagues.length} Lig)</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
