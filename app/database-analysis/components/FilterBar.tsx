"use client";

import { useState, useEffect, useRef } from "react";
import { MatchFilters } from "@/types/database";
import { Search, X, Calendar as CalendarIcon, Clock } from "lucide-react";
import { useDebounce } from "@/shared/hooks";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface FilterBarProps {
  filters: MatchFilters;
  onFilterChange: (filters: Partial<MatchFilters>) => void;
  onResetFilters: () => void;
  allTeams?: string[];
  selectedLeagues?: string[];
  leagues?: string[];
  onLeagueToggle?: (league: string) => void;
  onLeagueSelectAll?: () => void;
  onLeagueClearAll?: () => void;
  onApplyLeagueSelection?: () => void;
}

export default function FilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  allTeams = [],
  selectedLeagues = [],
  leagues = [],
  onLeagueToggle,
  onLeagueSelectAll,
  onLeagueClearAll,
  onApplyLeagueSelection,
}: FilterBarProps) {
  // Local state - bu değişiklikler henüz uygulanmadı
  const [localFilters, setLocalFilters] = useState<MatchFilters>(filters);

  // Takım arama input'ları
  const [homeTeamSearchInput, setHomeTeamSearchInput] = useState("");
  const [awayTeamSearchInput, setAwayTeamSearchInput] = useState("");

  // Debounced search values
  const debouncedHomeSearch = useDebounce(homeTeamSearchInput, 300);
  const debouncedAwaySearch = useDebounce(awayTeamSearchInput, 300);

  // Dropdown görünürlüğü
  const [showHomeTeamSuggestions, setShowHomeTeamSuggestions] = useState(false);
  const [showAwayTeamSuggestions, setShowAwayTeamSuggestions] = useState(false);

  // Seçilmiş takımlar
  const [selectedHomeTeam, setSelectedHomeTeam] = useState("");
  const [selectedAwayTeam, setSelectedAwayTeam] = useState("");

  // Tarih state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Saat state (HH:mm format)
  const [timeValue, setTimeValue] = useState("");

  // Refs
  const homeTeamSearchRef = useRef<HTMLDivElement>(null);
  const awayTeamSearchRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdowns
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

  // Ev sahibi takım önerileri
  const homeTeamSuggestions = debouncedHomeSearch
    ? allTeams
        .filter((team) =>
          team.toLowerCase().includes(debouncedHomeSearch.toLowerCase())
        )
        .slice(0, 10)
    : [];

  // Deplasman takım önerileri
  const awayTeamSuggestions = debouncedAwaySearch
    ? allTeams
        .filter((team) =>
          team.toLowerCase().includes(debouncedAwaySearch.toLowerCase())
        )
        .slice(0, 10)
    : [];

  // Ev sahibi takım seçimi
  const handleHomeTeamSelect = (team: string) => {
    setSelectedHomeTeam(team);
    setHomeTeamSearchInput(team);
    setShowHomeTeamSuggestions(false);
    setLocalFilters({ ...localFilters, homeTeam: team });
  };

  // Deplasman takım seçimi
  const handleAwayTeamSelect = (team: string) => {
    setSelectedAwayTeam(team);
    setAwayTeamSearchInput(team);
    setShowAwayTeamSuggestions(false);
    setLocalFilters({ ...localFilters, awayTeam: team });
  };

  // Ev sahibi takım temizle
  const handleClearHomeTeam = () => {
    setSelectedHomeTeam("");
    setHomeTeamSearchInput("");
    const newFilters = { ...localFilters };
    delete newFilters.homeTeam;
    setLocalFilters(newFilters);
  };

  // Deplasman takım temizle
  const handleClearAwayTeam = () => {
    setSelectedAwayTeam("");
    setAwayTeamSearchInput("");
    const newFilters = { ...localFilters };
    delete newFilters.awayTeam;
    setLocalFilters(newFilters);
  };

  // Tarih seçimi
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      setLocalFilters({ ...localFilters, dateFrom: formattedDate });
    } else {
      const newFilters = { ...localFilters };
      delete newFilters.dateFrom;
      setLocalFilters(newFilters);
    }
  };

  // Saat değişimi
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTimeValue(value);
    if (value) {
      setLocalFilters({ ...localFilters, timeFrom: value });
    } else {
      const newFilters = { ...localFilters };
      delete newFilters.timeFrom;
      setLocalFilters(newFilters);
    }
  };

  // Sıfırla - hem local hem de parent state
  const handleReset = () => {
    // Local state'leri temizle
    setSelectedHomeTeam("");
    setSelectedAwayTeam("");
    setHomeTeamSearchInput("");
    setAwayTeamSearchInput("");
    setSelectedDate(undefined);
    setTimeValue("");
    setShowHomeTeamSuggestions(false);
    setShowAwayTeamSuggestions(false);
    setLocalFilters({});

    // Parent'a bildir
    onResetFilters();
  };

  // Uygula - local filtreleri parent'a gönder
  const handleApply = () => {
    onFilterChange(localFilters);
  };

  // Aktif filtre sayısı
  const activeFilterCount = Object.keys(localFilters).length;

  return (
    <div className="bg-linear-to-r from-gray-800 to-gray-900 border-b border-gray-700 p-2 shadow-lg">
      <div className="max-w-7xl mx-auto">
        {/* Mobil Lig Seçimi - Sadece sidebar gizliyken görünür */}
        <div className="xl:hidden pt-2 mb-5">
          <details className="group">
            <summary className="cursor-pointer text-sm font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-2">
              <span>🏆 Lig Seçimi</span>
              {selectedLeagues && selectedLeagues.length > 0 && (
                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                  {selectedLeagues.length}
                </span>
              )}
              <span className="ml-auto text-gray-400 group-open:rotate-90 transition-transform">
                ▶
              </span>
            </summary>
            <div className="mt-3 space-y-2">
              {/* Arama */}
              <input
                type="text"
                placeholder="Lig ara..."
                className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm"
                onChange={(e) => {
                  // Arama fonksiyonalitesi ileride eklenebilir
                }}
              />

              {/* Butonlar */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={onLeagueSelectAll}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                >
                  Tümünü Seç
                </button>
                <button
                  onClick={onLeagueClearAll}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors"
                >
                  Tümünü Temizle
                </button>
                <button
                  onClick={onApplyLeagueSelection}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors ml-auto"
                >
                  Uygula
                </button>
              </div>

              {/* Ligler */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {leagues?.map((league) => (
                  <label
                    key={league}
                    className="flex items-center gap-2 p-2 bg-gray-700 hover:bg-gray-600 rounded cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedLeagues?.includes(league)}
                      onChange={() => onLeagueToggle?.(league)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-white">{league}</span>
                  </label>
                ))}
              </div>
            </div>
          </details>
        </div>
        <hr className="xl:hidden w-full mx-auto border-gray-400 my-6" />
        <div className="flex text-gray-900"></div>
        <details className="group">
          <summary className="cursor-pointer text-sm font-semibold text-blue-400 hover:text-blue-300 pt-2 mb-2 flex items-center gap-2">
            <span>⚙️ İleri Seviye Filtreler (Opsiyonel)</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
            <span className="text-xs text-gray-500 group-open:hidden">
              Genişletmek için tıklayın
            </span>
          </summary>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {/* 1. Tarih - Shadcn Calendar */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                📅 Tarih
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 hover:text-white"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "d MMMM yyyy", { locale: tr })
                    ) : (
                      <span className="text-gray-400">Tarih seç...</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    locale={tr}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* 2. Saat */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 items-center gap-1">
                <Clock className="h-3 w-3" />
                Saat
              </label>
              <input
                type="time"
                value={timeValue}
                onChange={handleTimeChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 3. Ev Sahibi Takım - Debounced Search */}
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
                      placeholder="Ev sahibi takım ara..."
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
                  {showHomeTeamSuggestions &&
                    debouncedHomeSearch &&
                    homeTeamSuggestions.length === 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-xl p-3 text-xs text-gray-400">
                        Sonuç bulunamadı
                      </div>
                    )}
                </>
              )}
            </div>

            {/* 4. Deplasman Takım - Debounced Search */}
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
                      placeholder="Deplasman takım ara..."
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
                  {showAwayTeamSuggestions &&
                    debouncedAwaySearch &&
                    awayTeamSuggestions.length === 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-xl p-3 text-xs text-gray-400">
                        Sonuç bulunamadı
                      </div>
                    )}
                </>
              )}
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Sıfırla
            </button>
            <button
              onClick={handleApply}
              className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Uygula
            </button>
          </div>
        </details>
      </div>
    </div>
  );
}
