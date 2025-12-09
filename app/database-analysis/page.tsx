"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { MatchData, MatchFilters, MatchStatistics } from "@/types/database";
import { getLeagues, getMatches, getMatchStatistics } from "@/lib/matchService";
import { supabase } from "@/lib/supabase";
import LeagueSidebar from "./components/LeagueSidebar";
import FilterBar from "./components/FilterBar";
import MatchTableNew from "./components/MatchTableNew";
import StatisticsCard from "./components/StatisticsCard";

export default function DatabaseAnalysisPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Not: LocalStorage boyut limiti nedeniyle kaldırıldı (239 kolon * 1000 maç = ~5MB)
  // Her maç ortalama 5KB yer kaplıyor, 1000 maç = 5MB (browser limit aşıyor)

  // State - Hook'lar her zaman aynı sırada olmalı (conditional return'den önce)
  const [leagues, setLeagues] = useState<string[]>([]);
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [filters, setFilters] = useState<MatchFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<MatchFilters>({});
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [statistics, setStatistics] = useState<MatchStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<string>("");
  const pageSize = 100; // Hızlı yükleme için 100 maç
  const [allTeams, setAllTeams] = useState<string[]>([]);
  const [leagueMatchCounts] = useState<Record<string, number>>({});

  // Debounced odds filter handler (hooks before early return)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const filterDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Odds filtre mapping (UI key → API key)
  const mapOddsFiltersToAPI = useCallback(
    (oddsFilters: Record<string, string>): Partial<MatchFilters> => {
      return {
        ft_home_odds: oddsFilters.msHome || undefined,
        ft_draw_odds: oddsFilters.msDraw || undefined,
        ft_away_odds: oddsFilters.msAway || undefined,
        ht_home_odds: oddsFilters.htHome || undefined,
        ht_draw_odds: oddsFilters.htDraw || undefined,
        ht_away_odds: oddsFilters.htAway || undefined,
        ft_dc_1x_odds: oddsFilters.dc1X || undefined,
        ft_dc_12_odds: oddsFilters.dc12 || undefined,
        ft_dc_x2_odds: oddsFilters.dcX2 || undefined,
        ht_dc_1x_odds: oddsFilters.htdc1X || undefined,
        ht_dc_12_odds: oddsFilters.htdc12 || undefined,
        ht_dc_x2_odds: oddsFilters.htdcX2 || undefined,
        ah_minus_05_odds: oddsFilters.ahMinus || undefined,
        ah_0_odds: oddsFilters.ahZero || undefined,
        ah_plus_05_odds: oddsFilters.ahPlus || undefined,
        eh_minus_1_odds: oddsFilters.ehMinus1 || undefined,
        ht_ft_11_odds: oddsFilters.htMs1 || undefined,
        ht_ft_1x_odds: oddsFilters.htMs1X || undefined,
        ht_ft_12_odds: oddsFilters.htMs12 || undefined,
        ht_ft_x1_odds: oddsFilters.htMsX1 || undefined,
        ht_ft_xx_odds: oddsFilters.htMsXX || undefined,
        ht_ft_x2_odds: oddsFilters.htMsX2 || undefined,
        ht_ft_21_odds: oddsFilters.htMs21 || undefined,
        ht_ft_2x_odds: oddsFilters.htMs2X || undefined,
        ht_ft_22_odds: oddsFilters.htMs22 || undefined,
      };
    },
    []
  );

  const handleOddsFilterChange = useCallback(
    (oddsFilters: Record<string, string>) => {
      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer (1500ms debounce)
      debounceTimerRef.current = setTimeout(async () => {
        console.log("🔍 Odds filtreleri değişti:", oddsFilters);

        setIsLoading(true);
        setPage(1);
        setLoadingProgress("Filtreler uygulanıyor...");

        const mappedOddsFilters = mapOddsFiltersToAPI(oddsFilters);
        // IMPORTANT: Sadece yeni odds filtreleri + opsiyonel filtreler (tarih, saat, takım) kullan
        // Eski filters state'ini kullanma - odds filtreler tamamen yenisiyle değişmeli
        const finalFilters: MatchFilters = {
          // Opsiyonel filtreler (tarih, saat, takım) - odds olmayan kısım
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          timeFrom: filters.timeFrom,
          timeTo: filters.timeTo,
          homeTeam: filters.homeTeam,
          awayTeam: filters.awayTeam,
          teamSearch: filters.teamSearch,
          // Yeni odds filtreleri
          ...mappedOddsFilters,
          // League
          league: selectedLeagues.length > 0 ? selectedLeagues : undefined,
        };

        setAppliedFilters(finalFilters);

        try {
          const [matchesData, stats] = await Promise.all([
            getMatches(finalFilters, 1, pageSize),
            getMatchStatistics(finalFilters),
          ]);

          setMatches(matchesData.data);
          setTotalPages(matchesData.totalPages);
          setTotalMatches(stats?.totalMatches || matchesData.data.length);
          setHasMore(matchesData.hasMore || false);
          setStatistics(stats);
          console.log("✅ Odds filtresi uygulandı:", {
            dataLength: matchesData.data.length,
            totalMatches: stats?.totalMatches,
          });
        } catch (error) {
          console.error("❌ Odds filtresi hatası:", error);
        } finally {
          setIsLoading(false);
          setLoadingProgress("");
        }
      }, 1500);
    },
    [filters, selectedLeagues, pageSize, mapOddsFiltersToAPI]
  );

  // Filtre değişikliği - otomatik trigger (800ms debounce)
  const handleFilterChange = useCallback(
    (newFilters: Partial<MatchFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));

      // Clear previous timer
      if (filterDebounceTimerRef.current) {
        clearTimeout(filterDebounceTimerRef.current);
      }

      // Set new timer (800ms debounce)
      filterDebounceTimerRef.current = setTimeout(async () => {
        console.log("🔍 Opsiyonel filtreler değişti:", newFilters);

        setIsLoading(true);
        setPage(1);
        setLoadingProgress("Filtreler uygulanıyor...");

        // appliedFilters'ı closure içinde yakalamak yerine callback ile güncel değeri al
        setAppliedFilters((currentAppliedFilters) => {
          // Opsiyonel filtreler güncellenince, odds filtrelerini koru
          const finalFilters: MatchFilters = {
            // Eski odds filtreleri (appliedFilters'dan al)
            ft_home_odds: currentAppliedFilters.ft_home_odds,
            ft_draw_odds: currentAppliedFilters.ft_draw_odds,
            ft_away_odds: currentAppliedFilters.ft_away_odds,
            ht_home_odds: currentAppliedFilters.ht_home_odds,
            ht_draw_odds: currentAppliedFilters.ht_draw_odds,
            ht_away_odds: currentAppliedFilters.ht_away_odds,
            ft_dc_1x_odds: currentAppliedFilters.ft_dc_1x_odds,
            ft_dc_12_odds: currentAppliedFilters.ft_dc_12_odds,
            ft_dc_x2_odds: currentAppliedFilters.ft_dc_x2_odds,
            ht_dc_1x_odds: currentAppliedFilters.ht_dc_1x_odds,
            ht_dc_12_odds: currentAppliedFilters.ht_dc_12_odds,
            ht_dc_x2_odds: currentAppliedFilters.ht_dc_x2_odds,
            ah_minus_05_odds: currentAppliedFilters.ah_minus_05_odds,
            ah_0_odds: currentAppliedFilters.ah_0_odds,
            ah_plus_05_odds: currentAppliedFilters.ah_plus_05_odds,
            eh_minus_1_odds: currentAppliedFilters.eh_minus_1_odds,
            ht_ft_11_odds: currentAppliedFilters.ht_ft_11_odds,
            ht_ft_1x_odds: currentAppliedFilters.ht_ft_1x_odds,
            ht_ft_12_odds: currentAppliedFilters.ht_ft_12_odds,
            ht_ft_x1_odds: currentAppliedFilters.ht_ft_x1_odds,
            ht_ft_xx_odds: currentAppliedFilters.ht_ft_xx_odds,
            ht_ft_x2_odds: currentAppliedFilters.ht_ft_x2_odds,
            ht_ft_21_odds: currentAppliedFilters.ht_ft_21_odds,
            ht_ft_2x_odds: currentAppliedFilters.ht_ft_2x_odds,
            ht_ft_22_odds: currentAppliedFilters.ht_ft_22_odds,
            // Yeni opsiyonel filtreler
            ...newFilters,
            // League
            league: selectedLeagues.length > 0 ? selectedLeagues : undefined,
          };

          // API çağrısını async olarak yap
          (async () => {
            try {
              const [matchesData, stats] = await Promise.all([
                getMatches(finalFilters, 1, pageSize),
                getMatchStatistics(finalFilters),
              ]);

              setMatches(matchesData.data);
              setTotalPages(matchesData.totalPages);
              setTotalMatches(stats?.totalMatches || matchesData.data.length);
              setHasMore(matchesData.hasMore || false);
              setStatistics(stats);
              console.log("✅ Opsiyonel filtre uygulandı:", {
                dataLength: matchesData.data.length,
                totalMatches: stats?.totalMatches,
              });
            } catch (error) {
              console.error("❌ Opsiyonel filtre hatası:", error);
            } finally {
              setIsLoading(false);
              setLoadingProgress("");
            }
          })();

          return finalFilters;
        });
      }, 800);
    },
    [selectedLeagues, pageSize]
  );

  // Sadece ligleri yükle
  const loadLeagues = async () => {
    try {
      // Sadece favori 20 ligi yükle (anında - DB sorgusu yok)
      const { leagues: leagueData } = await getLeagues({ favoritesOnly: true });
      console.log(`✅ ${leagueData.length} favori lig yüklendi`);
      setLeagues(leagueData);
      // Loading mesajını temizle
      setLoadingProgress("");
    } catch (error) {
      console.error("❌ Favori ligler yüklenirken hata:", error);
      setLoadingProgress("❌ Lig listesi yüklenemedi");
      setTimeout(() => setLoadingProgress(""), 3000);
    }
  };

  // Takımları yükle (seçili liglerden)
  const loadTeams = useCallback(async () => {
    if (selectedLeagues.length === 0) {
      setAllTeams([]);
      return;
    }

    console.log(`🔍 ${selectedLeagues.length} lig için takımlar yükleniyor...`);

    try {
      const { data, error } = await supabase
        .from("matches")
        .select("home_team, away_team")
        .in("league", selectedLeagues)
        .limit(500); // İlk 500 maçtan takımları al

      if (error) throw error;

      const teamsSet = new Set<string>();
      data?.forEach((match) => {
        if (match.home_team) teamsSet.add(match.home_team);
        if (match.away_team) teamsSet.add(match.away_team);
      });

      const teamsList = Array.from(teamsSet).sort();
      setAllTeams(teamsList);
      console.log(
        `✅ ${teamsList.length} takım yüklendi:`,
        teamsList.slice(0, 5)
      );
    } catch (error) {
      console.error("❌ Takımlar yüklenirken hata:", error);
    }
  }, [selectedLeagues]);

  // Auth kontrolü - giriş yapmamışsa login'e yönlendir
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/database-analysis");
    }
  }, [user, authLoading, router]);

  // Lig seçildiğinde takımları yükle
  useEffect(() => {
    if (selectedLeagues.length > 0) {
      loadTeams();
    } else {
      setAllTeams([]);
    }
  }, [selectedLeagues, loadTeams]);

  // Sayfa yüklendiginde otomatik ilk 1000 maçı yükle
  useEffect(() => {
    if (authLoading || !user) return;

    const initializeData = async () => {
      setLoadingProgress("🚀 Veriler yüklenyor...");
      setIsLoading(true);

      try {
        // 1. Ligleri yükle (favori 20 lig)
        await loadLeagues();

        // 2. Otomatik ilk 100 maçı yükle (filtre yok)
        setLoadingProgress("📊 İlk maçlar yüklenyor...");
        const [matchesData, stats] = await Promise.all([
          getMatches({}, 1, pageSize),
          getMatchStatistics({}),
        ]);

        setMatches(matchesData.data);
        setTotalPages(matchesData.totalPages);
        setTotalMatches(stats?.totalMatches || matchesData.data.length);
        setHasMore(matchesData.hasMore || false);
        setStatistics(stats);
        setAppliedFilters({});

        console.log(
          "✅ Sayfa hazır - ",
          matchesData.data.length,
          "maç yüklendi"
        );
        setLoadingProgress("");
      } catch (error) {
        console.error("❌ Sayfa yükleme hatası:", error);
        setLoadingProgress("❌ Veriler yüklenemedi");
        setTimeout(() => setLoadingProgress(""), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [user, authLoading]);

  // Auth yüklenirken veya kullanıcı yoksa loading göster
  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Lig seçimi
  const handleLeagueToggle = (league: string) => {
    setSelectedLeagues((prev) =>
      prev.includes(league)
        ? prev.filter((l) => l !== league)
        : [...prev, league]
    );
  };

  const handleSelectAllLeagues = () => {
    setSelectedLeagues([...leagues]);
  };

  const handleClearAllLeagues = () => {
    setSelectedLeagues([]);
  };

  // Lig seçimini uygula (sadece lig filtresi ile)
  const handleApplyLeagueSelection = async () => {
    if (selectedLeagues.length === 0) {
      alert("⚠️ Lütfen en az bir lig seçin!");
      return;
    }

    setIsLoading(true);
    setPage(1);
    setMatches([]);
    setLoadingProgress(
      `${selectedLeagues.length} lig için maçlar yükleniyor...`
    );

    const finalFilters: MatchFilters = {
      league: selectedLeagues,
    };

    setAppliedFilters(finalFilters);

    try {
      const [matchesData, stats] = await Promise.all([
        getMatches(finalFilters, 1, pageSize),
        getMatchStatistics(finalFilters),
      ]);

      setMatches(matchesData.data);
      setTotalPages(matchesData.totalPages);
      setTotalMatches(stats?.totalMatches || matchesData.data.length);
      setHasMore(matchesData.hasMore || false);
      setStatistics(stats);
      console.log("✅ İlk yükleme:", {
        dataLength: matchesData.data.length,
        totalMatches: stats?.totalMatches,
        hasMore: matchesData.hasMore,
      });
    } catch (error) {
      console.error("❌ Veriler yüklenirken hata:", error);
      alert(
        `❌ Maçlar yüklenirken hata oluştu: ${
          error instanceof Error ? error.message : "Bilinmeyen hata"
        }`
      );
    } finally {
      setIsLoading(false);
      setLoadingProgress("");
    }
  };

  // Filtreleri sıfırla
  const handleResetFilters = async () => {
    console.log("🔄 Filtreler sıfırlanıyor...");

    // Filtreleri temizle
    setFilters({});
    setAppliedFilters({});
    setPage(1);

    // Eğer lig seçiliyse, sadece lig filtresiyle API çağrısı yap
    if (selectedLeagues.length > 0) {
      setIsLoading(true);
      setLoadingProgress("Filtreler sıfırlanıyor...");

      const finalFilters: MatchFilters = {
        league: selectedLeagues,
      };

      setAppliedFilters(finalFilters);

      try {
        const [matchesData, stats] = await Promise.all([
          getMatches(finalFilters, 1, pageSize),
          getMatchStatistics(finalFilters),
        ]);

        setMatches(matchesData.data);
        setTotalPages(matchesData.totalPages);
        setTotalMatches(stats?.totalMatches || matchesData.data.length);
        setHasMore(matchesData.hasMore || false);
        setStatistics(stats);
        console.log("✅ Filtreler sıfırlandı, sadece lig filtresi aktif:", {
          dataLength: matchesData.data.length,
          totalMatches: stats?.totalMatches,
        });
      } catch (error) {
        console.error("❌ Filtre sıfırlama hatası:", error);
      } finally {
        setIsLoading(false);
        setLoadingProgress("");
      }
    } else {
      // Hiç lig seçili değilse tabloyu temizle
      setMatches([]);
      setStatistics(null);
    }
  };

  // Sayfa değiştirme
  const handlePageChange = async (newPage: number) => {
    setIsLoading(true);
    setPage(newPage);

    try {
      const matchesData = await getMatches(appliedFilters, newPage, 100);
      setMatches(matchesData.data);
      setHasMore(matchesData.page < matchesData.totalPages);

      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Sayfa yüklenirken hata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Daha fazla yükle
  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      const matchesData = await getMatches(appliedFilters, nextPage, pageSize);
      const newTotalDisplayed = matches.length + matchesData.data.length;
      setMatches((prev) => [...prev, ...matchesData.data]);
      // totalMatches filtre sonucu toplam maç sayısı - değişmemeli
      setPage(nextPage);
      setHasMore(matchesData.hasMore || false);
      console.log("✅ Daha fazla yüklendi:", {
        newDataLength: matchesData.data.length,
        totalDisplayed: newTotalDisplayed,
        totalMatches: totalMatches,
        hasMore: matchesData.hasMore,
      });
    } catch (error) {
      console.error("❌ Daha fazla maç yüklenirken hata:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-900">
      {/* Loading Progress Indicator */}
      {loadingProgress && (
        <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm font-medium">{loadingProgress}</span>
        </div>
      )}

      {/* Sol Panel - Lig Seçimi */}
      <LeagueSidebar
        leagues={leagues}
        selectedLeagues={selectedLeagues}
        onLeagueToggle={handleLeagueToggle}
        onSelectAll={handleSelectAllLeagues}
        onClearAll={handleClearAllLeagues}
        onApplySelection={handleApplyLeagueSelection}
        matchCounts={leagueMatchCounts}
      />

      {/* Ana İçerik */}
      <div className="flex-1 overflow-y-auto">
        {/* Filtre Çubuğu */}
        <FilterBar
          key={filters.teamSearch || "no-team"} // Reset olunca component yeniden mount olur
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          allTeams={allTeams}
          selectedLeagues={selectedLeagues}
        />

        {/* İçerik Alanı */}
        <div className="p-6 bg-gray-900">
          {/* İstatistikler */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatisticsCard
                title="Toplam Maç"
                value={statistics.totalMatches}
                color="blue"
              />
              <StatisticsCard
                title="Üst 1.5 Gol"
                value={`%${statistics.over15.percentage}`}
                subtitle={`${statistics.over15.count} maç`}
                color="green"
              />
              <StatisticsCard
                title="Üst 2.5 Gol"
                value={`%${statistics.over25.percentage}`}
                subtitle={`${statistics.over25.count} maç`}
                color="purple"
              />
              <StatisticsCard
                title="Karşılıklı Gol"
                value={`%${statistics.btts.percentage}`}
                subtitle={`${statistics.btts.count} maç`}
                color="orange"
              />
            </div>
          )}

          {/* Bilgi Mesajı - Sadece hata durumunda */}
          {matches.length === 0 && !isLoading && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-blue-400 mb-2">
                📊 Veritabanı Analizi
              </h3>
              <p className="text-gray-300 mb-6">
                730,000+ maç verisi üzerinden detaylı analiz yapın
              </p>

              <div className="bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto border border-blue-500/30">
                <h4 className="text-lg font-semibold text-blue-400 mb-4">
                  🚀 Kullanım
                </h4>
                <ol className="text-left text-gray-300 space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">1️⃣</span>
                    <div>
                      <span className="font-semibold text-blue-400">
                        Sol panelden lig seçin
                      </span>
                      <p className="text-sm text-gray-400">
                        Opsiyonel - İstediğiniz kadar lig seçebilirsiniz
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">2️⃣</span>
                    <div>
                      <span className="font-semibold text-blue-400">
                        &quot;Filtrele&quot; butonu ile filtre uygula
                      </span>
                      <p className="text-sm text-gray-400">
                        Seçili liglerin maçları listelenecek
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">3️⃣</span>
                    <div>
                      <span className="font-semibold text-blue-400">
                        Tablodaki kolon filtrelerini kullan
                      </span>
                      <p className="text-sm text-gray-400">
                        Odds bazlı hızlı filtreleme (&gt;2.5, &lt;1.8)
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* Maç Tablosu */}
          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
            <MatchTableNew
              matches={matches}
              onOddsFilterChange={handleOddsFilterChange}
            />

            {/* Load More Butonu + Sayfalama */}
            <div className="px-6 py-4 border-t border-gray-700 bg-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-300">
                  <span className="font-medium text-blue-400">
                    {matches.length}
                  </span>{" "}
                  / {totalMatches} maç gösteriliyor
                </div>
                <div className="text-xs text-gray-400">
                  Sayfa {page} / {totalPages}
                </div>
              </div>

              {/* Load More Butonu */}
              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isLoadingMore ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Yükleniyor...
                    </span>
                  ) : (
                    "Daha Fazla Yükle"
                  )}
                </button>
              )}

              {/* Klasik Sayfalama - Kaldırıldı */}
              {false && totalPages > 1 && (
                <div className="flex gap-2 mt-4 justify-center">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Önceki
                  </button>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sonraki →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
