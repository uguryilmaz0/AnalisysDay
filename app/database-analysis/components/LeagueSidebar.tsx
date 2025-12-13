"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Search, AlertCircle } from "lucide-react";
import { getLeagues } from "@/lib/matchService";

interface LeagueSidebarProps {
  leagues: string[];
  selectedLeagues: string[];
  onLeagueToggle: (league: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onApplySelection: () => void;
  matchCounts?: Record<string, number>;
}

const MAX_LEAGUE_SELECTION = 3;

export default function LeagueSidebar({
  leagues,
  selectedLeagues,
  onLeagueToggle,
  // onSelectAll, // Currently unused
  onClearAll,
  onApplySelection,
  matchCounts = {},
}: LeagueSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Maksimum seçim kontrolü
  const canSelectMore = selectedLeagues.length < MAX_LEAGUE_SELECTION;

  // Debounced search - API'den tüm liglerden ara (yeni RPC ile hızlı)
  useEffect(() => {
    const abortController = new AbortController();

    // Boş arama - favorileri göster
    if (!searchTerm.trim()) {
      Promise.resolve().then(() => {
        setSearchResults([]);
        setIsSearching(false);
      });
      return () => abortController.abort();
    }

    // Arama başladı
    Promise.resolve().then(() => setIsSearching(true));

    const timer = setTimeout(async () => {
      try {
        // Tüm liglerden ara (search_leagues RPC ile hızlı)
        const { leagues: results } = await getLeagues({
          search: searchTerm,
          favorites: false,
        });

        if (!abortController.signal.aborted) {
          setSearchResults(results.map((r) => r.league));
          setIsSearching(false);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Lig arama hatası:", error);
          setSearchResults([]);
          setIsSearching(false);
        }
      }
    }, 400); // 400ms debounce

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [searchTerm]);

  // Görüntülenecek ligler: Arama varsa arama sonuçları, yoksa favoriler
  const displayLeagues = searchTerm.trim() ? searchResults : leagues;

  // Lig seçimi handler - maksimum kontrolü ile
  const handleLeagueToggle = (league: string) => {
    const isSelected = selectedLeagues.includes(league);

    // Eğer seçili değilse ve maksimum sınıra ulaşıldıysa
    if (!isSelected && !canSelectMore) {
      alert(`En fazla ${MAX_LEAGUE_SELECTION} lig seçebilirsiniz!`);
      return;
    }

    onLeagueToggle(league);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col w-72 bg-gray-800 border-r border-gray-700 h-screen sticky top-0">
        <div className=" border-b border-gray-700 bg-linear-to-r from-gray-800 to-gray-900">
          <h2 className="text-lg font-bold text-blue-400 mt-3 ml-2 mb-3">
            🏆 Ligler
          </h2>

          {/* Arama */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Tüm liglerden ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Hızlı Aksiyonlar */}
          <div className="flex gap-2">
            <button
              onClick={onClearAll}
              disabled={selectedLeagues.length === 0}
              className="w-full px-3 py-1.5 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Seçimi Temizle
            </button>
          </div>

          {/* Limit Uyarısı */}
          {!canSelectMore && (
            <div className="mt-3 p-2 bg-amber-900/30 border border-amber-600/50 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300">
                Maksimum {MAX_LEAGUE_SELECTION} lig seçebilirsiniz
              </p>
            </div>
          )}
        </div>

        {/* Lig Listesi - Scrollable */}
        <div className="flex-1 overflow-y-auto p-3 bg-gray-800">
          {!searchTerm && (
            <p className="text-xs text-gray-400 mb-2 px-2">
              ⭐ Favori Ligler (En Popüler 20)
            </p>
          )}

          {searchTerm && (
            <p className="text-xs text-gray-400 mb-2 px-2">
              {isSearching
                ? "🔍 Tüm liglerden aranıyor..."
                : `📋 ${displayLeagues.length} lig bulundu`}
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
                const isDisabled = !isSelected && !canSelectMore;

                return (
                  <label
                    key={league}
                    className={`flex items-center justify-between p-2.5 rounded-lg transition-colors ${
                      isDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:bg-gray-700"
                    } ${
                      isSelected
                        ? "bg-blue-900/30 border border-blue-500"
                        : "border border-transparent"
                    }`}
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => handleLeagueToggle(league)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 shrink-0 bg-gray-700 border-gray-600 disabled:cursor-not-allowed"
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

          {/* Arama Yardımı */}
          {!searchTerm && leagues.length === 20 && (
            <div className="mt-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300 mb-1">💡 İpucu:</p>
              <p className="text-xs text-gray-300">
                Bu liste en popüler 20 ligi gösteriyor. Arama yaparak diğer
                ligleri bulabilirsiniz.
              </p>
            </div>
          )}
        </div>

        {/* Alt Kısım - Footer (Sticky) */}
        <div className="border-t border-gray-700 bg-gray-900">
          {/* Seçim Sayısı */}
          <div className="px-4 py-2 border-b border-gray-700">
            <p className="text-sm text-gray-300">
              <span className="font-bold text-blue-400">
                {selectedLeagues.length}
              </span>
              {" / "}
              <span className="text-gray-400">{MAX_LEAGUE_SELECTION}</span>
              {" lig seçildi"}
            </p>
          </div>

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
            className={`h-5 w-5 transition-transform text-white ${
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
                  placeholder="Tüm liglerden ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 placeholder-gray-400"
                />
              </div>

              {/* Hızlı Aksiyonlar */}
              <div className="flex gap-2 px-4 py-3">
                <button
                  onClick={onClearAll}
                  disabled={selectedLeagues.length === 0}
                  className="w-full px-3 py-1.5 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Seçimi Temizle
                </button>
              </div>

              {/* Limit Uyarısı (Mobile) */}
              {!canSelectMore && (
                <div className="mx-4 mb-3 p-2 bg-amber-900/30 border border-amber-600/50 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300">
                    Maksimum {MAX_LEAGUE_SELECTION} lig seçebilirsiniz
                  </p>
                </div>
              )}
            </div>

            {/* Lig Listesi - Scrollable */}
            <div className="space-y-1 px-4 max-h-60 overflow-y-auto">
              {displayLeagues.map((league) => {
                const isSelected = selectedLeagues.includes(league);
                const matchCount = matchCounts[league] || 0;
                const isDisabled = !isSelected && !canSelectMore;

                return (
                  <label
                    key={league}
                    className={`flex items-center justify-between p-2.5 rounded-lg transition-colors ${
                      isDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:bg-gray-700/50"
                    } ${
                      isSelected ? "bg-blue-900/30 border border-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-center flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => handleLeagueToggle(league)}
                        className="w-4 h-4 text-blue-600 rounded bg-gray-700 border-gray-600 disabled:cursor-not-allowed"
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
