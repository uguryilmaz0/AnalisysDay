"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { MatchData, MatchFilters, MatchStatistics } from "@/types/database";
import {
  getLeagues,
  getMatches,
  getMatchStatistics,
  getAllTeams,
  getLeagueMatchCounts,
} from "@/lib/matchService";
import LeagueSidebar from "./components/LeagueSidebar";
import FilterBar from "./components/FilterBar";
import MatchTable from "./components/MatchTable";
import StatisticsCard from "./components/StatisticsCard";

export default function DatabaseAnalysisPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

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
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<string>("");
  const [allTeams, setAllTeams] = useState<string[]>([]);
  const [leagueMatchCounts, setLeagueMatchCounts] = useState<
    Record<string, number>
  >({});

  // loadLeagues ve loadTeams fonksiyonları
  const loadLeagues = async () => {
    try {
      // Cache'den gelecek - çok hızlı
      const { leagues: leagueData } = await getLeagues();
      setLeagues(leagueData);
    } catch (error) {
      console.error("Ligler yüklenirken hata:", error);
    }
  };

  const loadTeams = async () => {
    try {
      // Cache'den gelecek - çok hızlı
      const [teams, leagueCounts] = await Promise.all([
        getAllTeams(),
        getLeagueMatchCounts(),
      ]);

      setAllTeams(teams);
      setLeagueMatchCounts(leagueCounts);
    } catch (error) {
      console.error("Takımlar yüklenirken hata:", error);
    }
  };

  // Auth kontrolü - giriş yapmamışsa login'e yönlendir
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/database-analysis");
    }
  }, [user, authLoading, router]);

  // Sayfa yüklendiğinde ligleri ve takımları yükle (cache'den gelecek - hızlı)
  useEffect(() => {
    if (authLoading || !user) return;

    const initializeData = async () => {
      setLoadingProgress("🚀 Veriler hazırlanıyor... (2x hızlı yükleme)");
      try {
        // Paralel yükleme - ligler ve takımlar aynı anda
        await Promise.all([loadLeagues(), loadTeams()]);
      } catch (error) {
        console.error("Sayfa yükleme hatası:", error);
      } finally {
        setLoadingProgress("");
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

  // Filtre değişikliği
  const handleFilterChange = (newFilters: Partial<MatchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
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
      console.log("🔍 Seçili Ligler:", selectedLeagues);

      const [matchesData, stats] = await Promise.all([
        getMatches(finalFilters, 1, 100),
        getMatchStatistics(finalFilters),
      ]);

      console.log("✅ Maçlar yüklendi:", matchesData.count);

      setMatches(matchesData.data);
      setTotalPages(matchesData.totalPages);
      setTotalMatches(matchesData.count);
      setHasMore(matchesData.page < matchesData.totalPages);
      setStatistics(stats);
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

  // Filtreleri uygula (opsiyonel ince ayar filtreler)
  const handleApplyFilters = async () => {
    setIsLoading(true);
    setPage(1);
    setMatches([]);
    setLoadingProgress("Filtreler uygulanıyor...");

    const finalFilters: MatchFilters = {
      ...filters,
      league: selectedLeagues.length > 0 ? selectedLeagues : undefined,
    };

    setAppliedFilters(finalFilters);

    try {
      const [matchesData, stats] = await Promise.all([
        getMatches(finalFilters, 1, 100),
        getMatchStatistics(finalFilters),
      ]);

      setMatches(matchesData.data);
      setTotalPages(matchesData.totalPages);
      setTotalMatches(matchesData.count);
      setHasMore(matchesData.page < matchesData.totalPages);
      setStatistics(stats);
    } catch (error) {
      console.error("Veriler yüklenirken hata:", error);
    } finally {
      setIsLoading(false);
      setLoadingProgress("");
    }
  };

  // Filtreleri sıfırla
  const handleResetFilters = () => {
    setFilters({});
    setSelectedLeagues([]);
    setAppliedFilters({});
    setMatches([]);
    setStatistics(null);
    setPage(1);
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
      const matchesData = await getMatches(appliedFilters, nextPage, 100);
      setMatches((prev) => [...prev, ...matchesData.data]); // Mevcut veriye ekle
      setPage(nextPage);
      setHasMore(matchesData.page < matchesData.totalPages);
    } catch (error) {
      console.error("Daha fazla veri yüklenirken hata:", error);
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
          onApplyFilters={handleApplyFilters}
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

          {/* Bilgi Mesajı */}
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
                  🚀 Hızlı Başlangıç
                </h4>
                <ol className="text-left text-gray-300 space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">1️⃣</span>
                    <div>
                      <span className="font-semibold text-blue-400">
                        Sol panelden lig seçin
                      </span>
                      <p className="text-sm text-gray-400">
                        İstediğiniz kadar lig seçebilirsiniz
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">2️⃣</span>
                    <div>
                      <span className="font-semibold text-blue-400">
                        &quot;Maçları Listele&quot; butonuna tıklayın
                      </span>
                      <p className="text-sm text-gray-400">
                        Seçili liglerin tüm maçları listelenecek
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">3️⃣</span>
                    <div>
                      <span className="font-semibold text-blue-400">
                        İsteğe bağlı: İleri seviye filtreler
                      </span>
                      <p className="text-sm text-gray-400">
                        Tarih, saat, takım bazlı detaylı filtreleme
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* Maç Tablosu */}
          {(matches.length > 0 || isLoading) && (
            <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
              <MatchTable matches={matches} isLoading={isLoading} />

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
                {hasMore && matches.length > 0 && (
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoadingMore ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
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
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                        Daha Fazla Yükle ({totalMatches - matches.length} maç
                        kaldı)
                      </>
                    )}
                  </button>
                )}

                {/* Klasik Sayfalama (Opsiyonel) */}
                {totalPages > 1 && (
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
          )}
        </div>
      </div>
    </div>
  );
}
