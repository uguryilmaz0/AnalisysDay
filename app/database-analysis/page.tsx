"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { MatchFilters, MatchData as OldMatchData } from "@/types/database";
import {
  getLeagues,
  getMatches,
  getMatchStats,
  StatsServiceResponse,
  MatchServiceFilters,
} from "@/lib/matchService";
import { MatchData } from "@/lib/database/types/match.types_v2";
import LeagueSidebar from "./components/LeagueSidebar";
import FilterBar from "./components/FilterBar";
import MatchTableNew from "./components/MatchTableNew";
import StatisticsCard from "./components/StatisticsCard";

export default function DatabaseAnalysisPage() {
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuth();

  // ALL HOOKS MUST BE DEFINED BEFORE ANY CONDITIONAL RETURNS
  const [leagues, setLeagues] = useState<string[]>([]);
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [filters, setFilters] = useState<MatchFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<MatchFilters>({});
  const [matches, setMatches] = useState<OldMatchData[]>([]);
  const [statistics, setStatistics] = useState<StatsServiceResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState<string>("");
  const pageSize = 100;
  const [allTeams, setAllTeams] = useState<string[]>([]);

  const oddsFilterDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to convert new MatchData to old MatchData format
  const convertMatchData = useCallback((newMatch: MatchData): OldMatchData => {
    return {
      id: Math.floor(Math.random() * 1000000), // Generate a random ID
      home_team: newMatch.home_team,
      away_team: newMatch.away_team,
      league: newMatch.league,
      match_date: `${newMatch.year}-${newMatch.month.padStart(
        2,
        "0"
      )}-${newMatch.day.padStart(2, "0")}`,
      bookmaker: newMatch.bookmaker || "",
      ht_score: newMatch.ht_score || "",
      ft_score: newMatch.ft_score || "",
      ht_ft: newMatch.ht_ft || "",
      ht_over_05: newMatch.ht_over_05 || 0,
      ft_over_15: newMatch.ft_over_15 || 0,
      ft_over_25: newMatch.ft_over_25 || 0,
      ft_over_35: newMatch.ft_over_35 || 0,
      btts: newMatch.btts || 0,
      day: parseInt(newMatch.day || "0"),
      month: parseInt(newMatch.month || "0"),
      year: parseInt(newMatch.year || "0"),
      time: newMatch.time || "",

      // Map all odds fields
      ft_home_odds_open: newMatch.ft_home_odds_open,
      ft_home_odds_close: newMatch.ft_home_odds_close,
      ft_draw_odds_open: newMatch.ft_draw_odds_open,
      ft_draw_odds_close: newMatch.ft_draw_odds_close,
      ft_away_odds_open: newMatch.ft_away_odds_open,
      ft_away_odds_close: newMatch.ft_away_odds_close,

      ht_home_odds_open: newMatch.ht_home_odds_open,
      ht_home_odds_close: newMatch.ht_home_odds_close,
      ht_draw_odds_open: newMatch.ht_draw_odds_open,
      ht_draw_odds_close: newMatch.ht_draw_odds_close,
      ht_away_odds_open: newMatch.ht_away_odds_open,
      ht_away_odds_close: newMatch.ht_away_odds_close,

      sh_home_odds_open: newMatch.sh_home_odds_open,
      sh_home_odds_close: newMatch.sh_home_odds_close,
      sh_draw_odds_open: newMatch.sh_draw_odds_open,
      sh_draw_odds_close: newMatch.sh_draw_odds_close,
      sh_away_odds_open: newMatch.sh_away_odds_open,
      sh_away_odds_close: newMatch.sh_away_odds_close,

      home_away_home_odds_open: newMatch.home_away_home_odds_open,
      home_away_home_odds_close: newMatch.home_away_home_odds_close,
      home_away_away_odds_open: newMatch.home_away_away_odds_open,
      home_away_away_odds_close: newMatch.home_away_away_odds_close,

      // BTTS Odds
      ft_btts_yes_odds_open: newMatch.ft_btts_yes_odds_open || null,
      ft_btts_yes_odds_close: newMatch.ft_btts_yes_odds_close || null,
      ft_btts_no_odds_open: newMatch.ft_btts_no_odds_open || null,
      ft_btts_no_odds_close: newMatch.ft_btts_no_odds_close || null,
      ht_btts_yes_odds_open: newMatch.ht_btts_yes_odds_open || null,
      ht_btts_yes_odds_close: newMatch.ht_btts_yes_odds_close || null,
      ht_btts_no_odds_open: newMatch.ht_btts_no_odds_open || null,
      ht_btts_no_odds_close: newMatch.ht_btts_no_odds_close || null,
      sh_btts_yes_odds_open: newMatch.sh_btts_yes_odds_open || null,
      sh_btts_yes_odds_close: newMatch.sh_btts_yes_odds_close || null,
      sh_btts_no_odds_open: newMatch.sh_btts_no_odds_open || null,
      sh_btts_no_odds_close: newMatch.sh_btts_no_odds_close || null,

      // Double Chance
      ft_dc_1x_odds_open: newMatch.ft_dc_1x_odds_open || null,
      ft_dc_1x_odds_close: newMatch.ft_dc_1x_odds_close || null,
      ft_dc_12_odds_open: newMatch.ft_dc_12_odds_open || null,
      ft_dc_12_odds_close: newMatch.ft_dc_12_odds_close || null,
      ft_dc_x2_odds_open: newMatch.ft_dc_x2_odds_open || null,
      ft_dc_x2_odds_close: newMatch.ft_dc_x2_odds_close || null,
      ht_dc_1x_odds_open: newMatch.ht_dc_1x_odds_open || null,
      ht_dc_1x_odds_close: newMatch.ht_dc_1x_odds_close || null,
      ht_dc_12_odds_open: newMatch.ht_dc_12_odds_open || null,
      ht_dc_12_odds_close: newMatch.ht_dc_12_odds_close || null,
      ht_dc_x2_odds_open: newMatch.ht_dc_x2_odds_open || null,
      ht_dc_x2_odds_close: newMatch.ht_dc_x2_odds_close || null,

      // Over/Under - Full Time
      ft_over_05_odds_open: newMatch.ft_over_05_odds_open || null,
      ft_over_05_odds_close: newMatch.ft_over_05_odds_close || null,
      ft_under_05_odds_open: newMatch.ft_under_05_odds_open || null,
      ft_under_05_odds_close: newMatch.ft_under_05_odds_close || null,
      ft_over_15_odds_open: newMatch.ft_over_15_odds_open || null,
      ft_over_15_odds_close: newMatch.ft_over_15_odds_close || null,
      ft_under_15_odds_open: newMatch.ft_under_15_odds_open || null,
      ft_under_15_odds_close: newMatch.ft_under_15_odds_close || null,
      ft_over_25_odds_open: newMatch.ft_over_25_odds_open || null,
      ft_over_25_odds_close: newMatch.ft_over_25_odds_close || null,
      ft_under_25_odds_open: newMatch.ft_under_25_odds_open || null,
      ft_under_25_odds_close: newMatch.ft_under_25_odds_close || null,
      ft_over_35_odds_open: newMatch.ft_over_35_odds_open || null,
      ft_over_35_odds_close: newMatch.ft_over_35_odds_close || null,
      ft_under_35_odds_open: newMatch.ft_under_35_odds_open || null,
      ft_under_35_odds_close: newMatch.ft_under_35_odds_close || null,
      ft_over_45_odds_open: newMatch.ft_over_45_odds_open || null,
      ft_over_45_odds_close: newMatch.ft_over_45_odds_close || null,
      ft_under_45_odds_open: newMatch.ft_under_45_odds_open || null,
      ft_under_45_odds_close: newMatch.ft_under_45_odds_close || null,
      ft_over_55_odds_open: newMatch.ft_over_55_odds_open || null,
      ft_over_55_odds_close: newMatch.ft_over_55_odds_close || null,
      ft_under_55_odds_open: newMatch.ft_under_55_odds_open || null,
      ft_under_55_odds_close: newMatch.ft_under_55_odds_close || null,

      // Over/Under - Half Time
      ht_over_05_odds_open: newMatch.ht_over_05_odds_open || null,
      ht_over_05_odds_close: newMatch.ht_over_05_odds_close || null,
      ht_under_05_odds_open: newMatch.ht_under_05_odds_open || null,
      ht_under_05_odds_close: newMatch.ht_under_05_odds_close || null,
      ht_over_15_odds_open: newMatch.ht_over_15_odds_open || null,
      ht_over_15_odds_close: newMatch.ht_over_15_odds_close || null,
      ht_under_15_odds_open: newMatch.ht_under_15_odds_open || null,
      ht_under_15_odds_close: newMatch.ht_under_15_odds_close || null,
      ht_over_25_odds_open: newMatch.ht_over_25_odds_open || null,
      ht_over_25_odds_close: newMatch.ht_over_25_odds_close || null,
      ht_under_25_odds_open: newMatch.ht_under_25_odds_open || null,
      ht_under_25_odds_close: newMatch.ht_under_25_odds_close || null,

      // Over/Under - Second Half
      sh_over_05_odds_open: newMatch.sh_over_05_odds_open || null,
      sh_over_05_odds_close: newMatch.sh_over_05_odds_close || null,
      sh_under_05_odds_open: newMatch.sh_under_05_odds_open || null,
      sh_under_05_odds_close: newMatch.sh_under_05_odds_close || null,
      sh_over_15_odds_open: newMatch.sh_over_15_odds_open || null,
      sh_over_15_odds_close: newMatch.sh_over_15_odds_close || null,
      sh_under_15_odds_open: newMatch.sh_under_15_odds_open || null,
      sh_under_15_odds_close: newMatch.sh_under_15_odds_close || null,
      sh_over_25_odds_open: newMatch.sh_over_25_odds_open || null,
      sh_over_25_odds_close: newMatch.sh_over_25_odds_close || null,
      sh_under_25_odds_open: newMatch.sh_under_25_odds_open || null,
      sh_under_25_odds_close: newMatch.sh_under_25_odds_close || null,

      // Asian Handicap
      ah_minus_05_home_odds_open: newMatch.ah_minus_05_home_odds_open || null,
      ah_minus_05_home_odds_close: newMatch.ah_minus_05_home_odds_close || null,
      ah_minus_05_away_odds_open: newMatch.ah_minus_05_away_odds_open || null,
      ah_minus_05_away_odds_close: newMatch.ah_minus_05_away_odds_close || null,
      ah_0_home_odds_open: newMatch.ah_0_home_odds_open || null,
      ah_0_home_odds_close: newMatch.ah_0_home_odds_close || null,
      ah_0_away_odds_open: newMatch.ah_0_away_odds_open || null,
      ah_0_away_odds_close: newMatch.ah_0_away_odds_close || null,
      ah_plus_05_home_odds_open: newMatch.ah_plus_05_home_odds_open || null,
      ah_plus_05_home_odds_close: newMatch.ah_plus_05_home_odds_close || null,
      ah_plus_05_away_odds_open: newMatch.ah_plus_05_away_odds_open || null,
      ah_plus_05_away_odds_close: newMatch.ah_plus_05_away_odds_close || null,

      // European Handicap
      eh_minus_1_home_odds_open: newMatch.eh_minus_1_home_odds_open || null,
      eh_minus_1_home_odds_close: newMatch.eh_minus_1_home_odds_close || null,
      eh_minus_1_draw_odds_open: newMatch.eh_minus_1_draw_odds_open || null,
      eh_minus_1_draw_odds_close: newMatch.eh_minus_1_draw_odds_close || null,
      eh_minus_1_away_odds_open: newMatch.eh_minus_1_away_odds_open || null,
      eh_minus_1_away_odds_close: newMatch.eh_minus_1_away_odds_close || null,

      // HT/FT Odds
      ht_ft_11_odds_open: newMatch.ht_ft_11_odds_open || null,
      ht_ft_11_odds_close: newMatch.ht_ft_11_odds_close || null,
      ht_ft_1x_odds_open: newMatch.ht_ft_1x_odds_open || null,
      ht_ft_1x_odds_close: newMatch.ht_ft_1x_odds_close || null,
      ht_ft_12_odds_open: newMatch.ht_ft_12_odds_open || null,
      ht_ft_12_odds_close: newMatch.ht_ft_12_odds_close || null,
      ht_ft_x1_odds_open: newMatch.ht_ft_x1_odds_open || null,
      ht_ft_x1_odds_close: newMatch.ht_ft_x1_odds_close || null,
      ht_ft_xx_odds_open: newMatch.ht_ft_xx_odds_open || null,
      ht_ft_xx_odds_close: newMatch.ht_ft_xx_odds_close || null,
      ht_ft_x2_odds_open: newMatch.ht_ft_x2_odds_open || null,
      ht_ft_x2_odds_close: newMatch.ht_ft_x2_odds_close || null,
      ht_ft_21_odds_open: newMatch.ht_ft_21_odds_open || null,
      ht_ft_21_odds_close: newMatch.ht_ft_21_odds_close || null,
      ht_ft_2x_odds_open: newMatch.ht_ft_2x_odds_open || null,
      ht_ft_2x_odds_close: newMatch.ht_ft_2x_odds_close || null,
      ht_ft_22_odds_open: newMatch.ht_ft_22_odds_open || null,
      ht_ft_22_odds_close: newMatch.ht_ft_22_odds_close || null,

      // HT Correct Score
      ht_cs_10_odds_open: newMatch.ht_cs_10_odds_open || null,
      ht_cs_10_odds_close: newMatch.ht_cs_10_odds_close || null,
      ht_cs_20_odds_open: newMatch.ht_cs_20_odds_open || null,
      ht_cs_20_odds_close: newMatch.ht_cs_20_odds_close || null,
      ht_cs_21_odds_open: newMatch.ht_cs_21_odds_open || null,
      ht_cs_21_odds_close: newMatch.ht_cs_21_odds_close || null,
      ht_cs_00_odds_open: newMatch.ht_cs_00_odds_open || null,
      ht_cs_00_odds_close: newMatch.ht_cs_00_odds_close || null,
      ht_cs_11_odds_open: newMatch.ht_cs_11_odds_open || null,
      ht_cs_11_odds_close: newMatch.ht_cs_11_odds_close || null,
      ht_cs_01_odds_open: newMatch.ht_cs_01_odds_open || null,
      ht_cs_01_odds_close: newMatch.ht_cs_01_odds_close || null,
      ht_cs_02_odds_open: newMatch.ht_cs_02_odds_open || null,
      ht_cs_02_odds_close: newMatch.ht_cs_02_odds_close || null,
      ht_cs_12_odds_open: newMatch.ht_cs_12_odds_open || null,
      ht_cs_12_odds_close: newMatch.ht_cs_12_odds_close || null,

      // FT Correct Scores (using placeholders since not all exist in new data)
      ft_cs_10_odds_open: newMatch.ft_cs_10_odds_open || null,
      ft_cs_10_odds_close: newMatch.ft_cs_10_odds_close || null,
      ft_cs_20_odds_open: newMatch.ft_cs_20_odds_open || null,
      ft_cs_20_odds_close: newMatch.ft_cs_20_odds_close || null,
      ft_cs_21_odds_open: newMatch.ft_cs_21_odds_open || null,
      ft_cs_21_odds_close: newMatch.ft_cs_21_odds_close || null,
      ft_cs_30_odds_open: newMatch.ft_cs_30_odds_open || null,
      ft_cs_30_odds_close: newMatch.ft_cs_30_odds_close || null,
      ft_cs_31_odds_open: newMatch.ft_cs_31_odds_open || null,
      ft_cs_31_odds_close: newMatch.ft_cs_31_odds_close || null,
      ft_cs_00_odds_open: newMatch.ft_cs_00_odds_open || null,
      ft_cs_00_odds_close: newMatch.ft_cs_00_odds_close || null,
      ft_cs_11_odds_open: newMatch.ft_cs_11_odds_open || null,
      ft_cs_11_odds_close: newMatch.ft_cs_11_odds_close || null,
      ft_cs_22_odds_open: newMatch.ft_cs_22_odds_open || null,
      ft_cs_22_odds_close: newMatch.ft_cs_22_odds_close || null,
      ft_cs_01_odds_open: newMatch.ft_cs_01_odds_open || null,
      ft_cs_01_odds_close: newMatch.ft_cs_01_odds_close || null,
      ft_cs_02_odds_open: newMatch.ft_cs_02_odds_open || null,
      ft_cs_02_odds_close: newMatch.ft_cs_02_odds_close || null,
      ft_cs_12_odds_open: newMatch.ft_cs_12_odds_open || null,
      ft_cs_12_odds_close: newMatch.ft_cs_12_odds_close || null,

      // Metadata
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }, []);

  // Helper function to convert MatchFilters to MatchServiceFilters
  const convertFiltersToServiceFilters = useCallback(
    (
      filters: MatchFilters,
      page?: number,
      limit?: number
    ): MatchServiceFilters => {
      // Odds filtrelerini işle - sadece geçerli değerleri al
      const validOddsFilters = Object.keys(filters)
        .filter((key) => key.includes("_odds"))
        .reduce((obj, key) => {
          const value = filters[key as keyof MatchFilters];

          // Değer yoksa veya boşsa atla
          if (!value || typeof value !== "string") return obj;

          const trimmedValue = value.trim();

          // Boş string ise atla
          if (!trimmedValue) return obj;

          // Numeric değeri kontrol et
          const numericValue = parseFloat(trimmedValue.replace(/[><]/g, ""));

          // 1'den küçük veya geçersiz sayı ise atla
          if (isNaN(numericValue) || numericValue < 1) return obj;

          // Geçerli değeri ekle
          return { ...obj, [key]: trimmedValue };
        }, {});

      return {
        leagues: filters.league,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        timeFrom: filters.timeFrom,
        timeTo: filters.timeTo,
        homeTeam: filters.homeTeam,
        awayTeam: filters.awayTeam,
        teamSearch: filters.teamSearch,
        page: page,
        limit: limit,
        ...validOddsFilters,
      };
    },
    []
  );

  // Load matches with proper typing - ÖNCE TANIMLA
  const loadMatches = useCallback(
    async (filtersToApply: MatchFilters, pageNum: number = 1) => {
      console.log("🔄 Matches loading with filters:", filtersToApply);
      setIsLoading(true);
      setLoadingProgress("📊 Maçlar yükleniyor...");

      try {
        const serviceFilters = convertFiltersToServiceFilters(
          filtersToApply,
          pageNum,
          pageSize
        );

        const [matchesData, stats] = await Promise.all([
          getMatches(serviceFilters),
          getMatchStats(serviceFilters), // TÜM FİLTRELERİ GÖNDER (odds dahil)
        ]);

        if (matchesData.success) {
          const convertedMatches = matchesData.data.map(convertMatchData);
          console.log(
            "✅ Setting matches state:",
            convertedMatches.length,
            "maç"
          );
          console.log(
            "📋 First 3 matches:",
            convertedMatches.slice(0, 3).map((m) => ({
              date: m.match_date,
              league: m.league,
              home: m.home_team,
            }))
          );

          // Force yeni array reference ile state update
          setMatches([...convertedMatches]);
          setTotalPages(Math.ceil(matchesData.total / pageSize));
          setTotalMatches(matchesData.total);
          setPage(pageNum);
          console.log(
            "✅ State updated - total:",
            matchesData.total,
            "page:",
            pageNum
          );
        }

        // Stats API success field'ı olmadan direkt obje döndürüyor
        if (stats && stats.totalMatches !== undefined) {
          console.log(
            "📊 Setting statistics:",
            stats.totalMatches,
            "total matches"
          );
          setStatistics(stats);
        } else {
          console.warn("⚠️ Stats data missing or invalid:", stats);
        }
      } catch (error) {
        console.error("❌ Maç yükleme hatası:", error);
      } finally {
        setIsLoading(false);
        setLoadingProgress("");
      }
    },
    [convertFiltersToServiceFilters, pageSize, convertMatchData]
  );

  const handleResetFilters = useCallback(() => {
    setFilters({});
    setAppliedFilters({});
    setSelectedLeagues([]);
    loadMatches({}, 1);
  }, [loadMatches]);

  // Tablo filtrelerini temizleme fonksiyonu
  const clearTableFilters = useCallback(() => {
    console.log("🧹 Tablo filtreleri temizleniyor...");

    // appliedFilters'dan TÜM odds filtrelerini kaldır
    const nonOddsFilters = Object.keys(appliedFilters)
      .filter((key) => !key.includes("_odds"))
      .reduce(
        (obj, key) => ({
          ...obj,
          [key]: appliedFilters[key as keyof MatchFilters],
        }),
        {}
      );

    setAppliedFilters(nonOddsFilters);
    loadMatches(nonOddsFilters, 1);
  }, [appliedFilters, loadMatches]);

  // Tablo içi odds filtreleme handler'ı
  const handleOddsFilterChange = useCallback(
    (oddsFilters: Record<string, string>) => {
      if (oddsFilterDebounceTimerRef.current) {
        clearTimeout(oddsFilterDebounceTimerRef.current);
      }

      oddsFilterDebounceTimerRef.current = setTimeout(() => {
        console.log("🎯 Odds filtreleri uygulanıyor:", oddsFilters);

        // Odds filtrelerini MatchFilters formatına dönüştür
        const oddsMatchFilters: Partial<MatchFilters> = {};

        // MS 1X2
        if (oddsFilters.msHome && oddsFilters.msHome.trim()) {
          const value = oddsFilters.msHome.trim();
          if (/^[><]?\d+\.?\d*(-\d+\.?\d*)?$/.test(value)) {
            const numValue = parseFloat(value.replace(/[><]/g, ""));
            if (!isNaN(numValue) && numValue >= 1) {
              oddsMatchFilters.ft_home_odds = value;
            }
          }
        }
        if (oddsFilters.msDraw && oddsFilters.msDraw.trim()) {
          const value = oddsFilters.msDraw.trim();
          if (/^[><]?\d+\.?\d*(-\d+\.?\d*)?$/.test(value)) {
            const numValue = parseFloat(value.replace(/[><]/g, ""));
            if (!isNaN(numValue) && numValue >= 1) {
              oddsMatchFilters.ft_draw_odds = value;
            }
          }
        }
        if (oddsFilters.msAway && oddsFilters.msAway.trim()) {
          const value = oddsFilters.msAway.trim();
          if (/^[><]?\d+\.?\d*(-\d+\.?\d*)?$/.test(value)) {
            const numValue = parseFloat(value.replace(/[><]/g, ""));
            if (!isNaN(numValue) && numValue >= 1) {
              oddsMatchFilters.ft_away_odds = value;
            }
          }
        }

        // İY 1X2
        if (oddsFilters.htHome && oddsFilters.htHome.trim()) {
          const value = oddsFilters.htHome.trim();
          if (/^[><]?\d+\.?\d*(-\d+\.?\d*)?$/.test(value)) {
            const numValue = parseFloat(value.replace(/[><]/g, ""));
            if (!isNaN(numValue) && numValue >= 1) {
              oddsMatchFilters.ht_home_odds = value;
            }
          }
        }
        if (oddsFilters.htDraw && oddsFilters.htDraw.trim()) {
          const value = oddsFilters.htDraw.trim();
          if (/^[><]?\d+\.?\d*(-\d+\.?\d*)?$/.test(value)) {
            const numValue = parseFloat(value.replace(/[><]/g, ""));
            if (!isNaN(numValue) && numValue >= 1) {
              oddsMatchFilters.ht_draw_odds = value;
            }
          }
        }
        if (oddsFilters.htAway && oddsFilters.htAway.trim()) {
          const value = oddsFilters.htAway.trim();
          if (/^[><]?\d+\.?\d*(-\d+\.?\d*)?$/.test(value)) {
            const numValue = parseFloat(value.replace(/[><]/g, ""));
            if (!isNaN(numValue) && numValue >= 1) {
              oddsMatchFilters.ht_away_odds = value;
            }
          }
        }

        // MS Çifte Şans
        if (oddsFilters.dc1X && oddsFilters.dc1X.trim()) {
          const value = oddsFilters.dc1X.trim();
          if (/^[><]?\d+\.?\d*(-\d+\.?\d*)?$/.test(value)) {
            const numValue = parseFloat(value.replace(/[><]/g, ""));
            if (!isNaN(numValue) && numValue >= 1) {
              oddsMatchFilters.ft_dc_1x_odds = value;
            }
          }
        }
        if (oddsFilters.dc12 && oddsFilters.dc12.trim()) {
          const value = oddsFilters.dc12.trim();
          if (/^[><]?\d+\.?\d*(-\d+\.?\d*)?$/.test(value)) {
            const numValue = parseFloat(value.replace(/[><]/g, ""));
            if (!isNaN(numValue) && numValue >= 1) {
              oddsMatchFilters.ft_dc_12_odds = value;
            }
          }
        }
        if (oddsFilters.dcX2 && oddsFilters.dcX2.trim()) {
          const value = oddsFilters.dcX2.trim();
          if (/^[><]?\d+\.?\d*(-\d+\.?\d*)?$/.test(value)) {
            const numValue = parseFloat(value.replace(/[><]/g, ""));
            if (!isNaN(numValue) && numValue >= 1) {
              oddsMatchFilters.ft_dc_x2_odds = value;
            }
          }
        }

        // İY Çifte Şans
        if (oddsFilters.htdc1X && oddsFilters.htdc1X.trim()) {
          const value = oddsFilters.htdc1X.trim();
          if (/^[><]?\d+\.?\d*(-\d+\.?\d*)?$/.test(value)) {
            const numValue = parseFloat(value.replace(/[><]/g, ""));
            if (!isNaN(numValue) && numValue >= 1) {
              oddsMatchFilters.ht_dc_1x_odds = value;
            }
          }
        }
        if (oddsFilters.htdc12 && oddsFilters.htdc12.trim()) {
          const value = oddsFilters.htdc12.trim();
          if (/^[><]?\d+\.?\d*(-\d+\.?\d*)?$/.test(value)) {
            const numValue = parseFloat(value.replace(/[><]/g, ""));
            if (!isNaN(numValue) && numValue >= 1) {
              oddsMatchFilters.ht_dc_12_odds = value;
            }
          }
        }
        if (oddsFilters.htdcX2 && oddsFilters.htdcX2.trim()) {
          const value = oddsFilters.htdcX2.trim();
          if (/^[><]?\d+\.?\d*(-\d+\.?\d*)?$/.test(value)) {
            const numValue = parseFloat(value.replace(/[><]/g, ""));
            if (!isNaN(numValue) && numValue >= 1) {
              oddsMatchFilters.ht_dc_x2_odds = value;
            }
          }
        }

        // Asya Handikap
        if (oddsFilters.ahMinus && oddsFilters.ahMinus.trim()) {
          const value = oddsFilters.ahMinus.trim();
          if (/^[><]?\d+\.?\d*(-\d+\.?\d*)?$/.test(value)) {
            const numValue = parseFloat(value.replace(/[><]/g, ""));
            if (!isNaN(numValue) && numValue >= 1) {
              oddsMatchFilters.ah_minus_05_odds = value;
            }
          }
        }
        if (oddsFilters.ahZero && oddsFilters.ahZero.trim()) {
          const value = oddsFilters.ahZero.trim();
          if (/^[><]?\d+\.?\d*(-\d+\.?\d*)?$/.test(value)) {
            const numValue = parseFloat(value.replace(/[><]/g, ""));
            if (!isNaN(numValue) && numValue >= 1) {
              oddsMatchFilters.ah_0_odds = value;
            }
          }
        }
        if (oddsFilters.ahPlus && oddsFilters.ahPlus.trim()) {
          const value = oddsFilters.ahPlus.trim();
          if (/^[><]?\d+\.?\d*(-\d+\.?\d*)?$/.test(value)) {
            const numValue = parseFloat(value.replace(/[><]/g, ""));
            if (!isNaN(numValue) && numValue >= 1) {
              oddsMatchFilters.ah_plus_05_odds = value;
            }
          }
        }

        // Avrupa Handikap
        if (oddsFilters.ehMinus1 && oddsFilters.ehMinus1.trim()) {
          const value = oddsFilters.ehMinus1.trim();
          if (/^[><]?\d+\.?\d*(-\d+\.?\d*)?$/.test(value)) {
            const numValue = parseFloat(value.replace(/[><]/g, ""));
            if (!isNaN(numValue) && numValue >= 1) {
              oddsMatchFilters.eh_minus_1_odds = value;
            }
          }
        }

        // İY/MS Kombinasyonları
        if (oddsFilters.htMs1 && oddsFilters.htMs1.trim()) {
          const value = oddsFilters.htMs1.trim();
          if (/^[><]?\d+\.?\d*(-\d+\.?\d*)?$/.test(value)) {
            const numValue = parseFloat(value.replace(/[><]/g, ""));
            if (!isNaN(numValue) && numValue >= 1) {
              oddsMatchFilters.ht_ft_11_odds = value;
            }
          }
        }
        if (oddsFilters.htMs1X && oddsFilters.htMs1X.trim()) {
          const value = oddsFilters.htMs1X.trim();
          if (/^[><]?\d+\.?\d*(-\d+\.?\d*)?$/.test(value)) {
            const numValue = parseFloat(value.replace(/[><]/g, ""));
            if (!isNaN(numValue) && numValue >= 1) {
              oddsMatchFilters.ht_ft_1x_odds = value;
            }
          }
        }
        if (oddsFilters.htMs12 && oddsFilters.htMs12.trim()) {
          const value = oddsFilters.htMs12.trim();
          if (/^[><]?\d+\.?\d*(-\d+\.?\d*)?$/.test(value)) {
            const numValue = parseFloat(value.replace(/[><]/g, ""));
            if (!isNaN(numValue) && numValue >= 1) {
              oddsMatchFilters.ht_ft_12_odds = value;
            }
          }
        }
        if (oddsFilters.htMsX1 && oddsFilters.htMsX1.trim()) {
          const value = oddsFilters.htMsX1.trim();
          if (/^[><]?\d+\.?\d*(-\d+\.?\d*)?$/.test(value)) {
            const numValue = parseFloat(value.replace(/[><]/g, ""));
            if (!isNaN(numValue) && numValue >= 1) {
              oddsMatchFilters.ht_ft_x1_odds = value;
            }
          }
        }
        if (oddsFilters.htMsXX && oddsFilters.htMsXX.trim()) {
          const value = oddsFilters.htMsXX.trim();
          if (/^[><]?\d+\.?\d*(-\d+\.?\d*)?$/.test(value)) {
            const numValue = parseFloat(value.replace(/[><]/g, ""));
            if (!isNaN(numValue) && numValue >= 1) {
              oddsMatchFilters.ht_ft_xx_odds = value;
            }
          }
        }
        if (oddsFilters.htMsX2 && oddsFilters.htMsX2.trim()) {
          const value = oddsFilters.htMsX2.trim();
          if (/^[><]?\d+\.?\d*(-\d+\.?\d*)?$/.test(value)) {
            const numValue = parseFloat(value.replace(/[><]/g, ""));
            if (!isNaN(numValue) && numValue >= 1) {
              oddsMatchFilters.ht_ft_x2_odds = value;
            }
          }
        }
        if (oddsFilters.htMs21 && oddsFilters.htMs21.trim()) {
          const value = oddsFilters.htMs21.trim();
          if (/^[><]?\d+\.?\d*(-\d+\.?\d*)?$/.test(value)) {
            const numValue = parseFloat(value.replace(/[><]/g, ""));
            if (!isNaN(numValue) && numValue >= 1) {
              oddsMatchFilters.ht_ft_21_odds = value;
            }
          }
        }
        if (oddsFilters.htMs2X && oddsFilters.htMs2X.trim()) {
          const value = oddsFilters.htMs2X.trim();
          if (/^[><]?\d+\.?\d*(-\d+\.?\d*)?$/.test(value)) {
            const numValue = parseFloat(value.replace(/[><]/g, ""));
            if (!isNaN(numValue) && numValue >= 1) {
              oddsMatchFilters.ht_ft_2x_odds = value;
            }
          }
        }
        if (oddsFilters.htMs22 && oddsFilters.htMs22.trim()) {
          const value = oddsFilters.htMs22.trim();
          if (/^[><]?\d+\.?\d*(-\d+\.?\d*)?$/.test(value)) {
            const numValue = parseFloat(value.replace(/[><]/g, ""));
            if (!isNaN(numValue) && numValue >= 1) {
              oddsMatchFilters.ht_ft_22_odds = value;
            }
          }
        }

        console.log("✅ Geçerli odds filtreleri:", oddsMatchFilters);

        // ÖNEMLİ: appliedFilters'dan TÜM eski odds filtrelerini temizle
        const nonOddsFilters = Object.keys(appliedFilters)
          .filter((key) => !key.includes("_odds"))
          .reduce(
            (obj, key) => ({
              ...obj,
              [key]: appliedFilters[key as keyof MatchFilters],
            }),
            {}
          );

        // Yeni filtreler: odds olmayan filtreler + sadece geçerli odds filtreleri
        const finalFilters = {
          ...nonOddsFilters,
          ...oddsMatchFilters,
        };

        console.log("🔄 Final filtreler (eski odds temizlendi):", finalFilters);

        setAppliedFilters(finalFilters);
        loadMatches(finalFilters, 1);
      }, 800); // 800ms debounce
    },
    [appliedFilters, loadMatches]
  );

  const handleFilterChange = useCallback(
    (newFilters: MatchFilters) => {
      // Debounce'u kaldır - Uygula butonuyla zaten kontrollü
      const finalFilters = {
        ...newFilters,
        league: selectedLeagues.length > 0 ? selectedLeagues : undefined,
      };

      // Local filters state'ini güncelle
      setFilters(newFilters);

      // Applied filters'ı güncelle ve API'yi çağır
      setAppliedFilters(finalFilters);
      loadMatches(finalFilters, 1);
    },
    [selectedLeagues, loadMatches]
  );

  // Load leagues (sadece yetkili kullanıcılar için)
  const loadLeagues = useCallback(async () => {
    // Yetki kontrolü
    const isAdmin = userData?.role === "admin" || userData?.superAdmin;
    const hasActiveSubscription = userData?.subscriptionEndDate
      ? userData.subscriptionEndDate.toDate() > new Date()
      : false;

    if (!isAdmin && !hasActiveSubscription) {
      console.log("⛔ Free kullanıcı - lig yükleme atlandı");
      return;
    }

    try {
      const { leagues: leagueData } = await getLeagues({ favorites: true });
      setLeagues(leagueData.map((l) => l.league));
    } catch (error) {
      console.error("❌ Ligler yüklenirken hata:", error);
    }
  }, [userData]);

  // Load teams from matches (sadece yetkili kullanıcılar için)
  const loadTeams = useCallback(async () => {
    // Yetki kontrolü
    const isAdmin = userData?.role === "admin" || userData?.superAdmin;
    const hasActiveSubscription = userData?.subscriptionEndDate
      ? userData.subscriptionEndDate.toDate() > new Date()
      : false;

    if (!isAdmin && !hasActiveSubscription) {
      console.log("⛔ Free kullanıcı - takım yükleme atlandı");
      return;
    }

    console.log(
      `🔍 ${
        selectedLeagues.length > 0
          ? selectedLeagues.length + " lig için"
          : "Tüm liglerden"
      } takımlar yükleniyor...`
    );

    try {
      const response = await getMatches({
        leagues: selectedLeagues.length > 0 ? selectedLeagues : undefined,
        limit: 1000, // Daha fazla maç çek ki tüm takımlar gelsin
      });

      if (response.success) {
        const teamsSet = new Set<string>();
        response.data?.forEach((match) => {
          if (match.home_team) teamsSet.add(match.home_team);
          if (match.away_team) teamsSet.add(match.away_team);
        });

        const teamsList = Array.from(teamsSet).sort();
        setAllTeams(teamsList);
        console.log(
          `✅ ${teamsList.length} takım yüklendi:`,
          teamsList.slice(0, 5)
        );
      }
    } catch (error) {
      console.error("❌ Takımlar yüklenirken hata:", error);
    }
  }, [selectedLeagues, userData]);

  // Auth control effect - with initialization flag to prevent re-runs
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
        return;
      }

      // Admin kontrolü veya aktif abonelik kontrolü
      const isAdmin = userData?.role === "admin" || userData?.superAdmin;
      const hasActiveSubscription = userData?.subscriptionEndDate
        ? userData.subscriptionEndDate.toDate() > new Date()
        : false;

      if (!userData?.role) {
        router.push("/");
        return;
      }

      // Admin değilse ve aktif aboneliği yoksa erişim engelle
      if (!isAdmin && !hasActiveSubscription) {
        router.push("/");
        return;
      }

      // ✅ Sadece yetkili kullanıcılar için veri yükle (tek sefer)
      if ((isAdmin || hasActiveSubscription) && !hasInitializedRef.current) {
        console.log("🚀 Initializing data (first time only)...");
        initializeData();
        hasInitializedRef.current = true;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userData, authLoading, router]);

  // Initialize data - function definition moved here
  const initializeData = async () => {
    console.log(
      "🚨 initializeData called - hasInitializedRef:",
      hasInitializedRef.current
    );
    if (authLoading || !user) return;
    if (hasInitializedRef.current) {
      console.log("⛔ initializeData blocked - already initialized");
      return;
    }

    setLoadingProgress("🚀 Veriler yüklenyor...");
    setIsLoading(true);

    try {
      await loadLeagues();

      setLoadingProgress("📊 İlk maçlar yüklenliyor...");
      const serviceFilters = convertFiltersToServiceFilters({}, 1, pageSize);

      const [matchesData, stats] = await Promise.all([
        getMatches(serviceFilters),
        getMatchStats({}),
      ]);

      if (matchesData.success) {
        console.log(
          "🚀 initializeData setting matches:",
          matchesData.data.length
        );
        setMatches([...matchesData.data.map(convertMatchData)]);
        setTotalPages(Math.ceil(matchesData.total / pageSize));
        setTotalMatches(matchesData.total);
      }

      // Stats API success field'ı olmadan direkt obje döndürüyor
      if (stats && stats.totalMatches !== undefined) {
        setStatistics(stats);
      }

      setLoadingProgress("✅ Yükleme tamamlandı!");
    } catch (error) {
      console.error("❌ Başlangıç verisi yüklenemedi:", error);
    } finally {
      setIsLoading(false);
      setLoadingProgress("");
    }
  };

  // Load teams when leagues change
  useEffect(() => {
    if (selectedLeagues.length > 0) {
      loadTeams();
    } else {
      setAllTeams([]);
    }
  }, [selectedLeagues, loadTeams]);

  // Debug: Watch matches state changes
  useEffect(() => {
    console.log("🔄 Matches state updated:", matches.length, "maç");
  }, [matches]);

  // Loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Yetki kontrolü yapılıyor...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (
    !user ||
    !userData?.role ||
    (userData.role !== "admin" && !userData.superAdmin)
  ) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-gray-900 rounded-lg border border-gray-800">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Erişim Reddedildi
          </h1>
          <p className="text-gray-400 mb-6">
            Bu sayfaya erişim için Admin veya Süper Admin yetkisi gereklidir.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  // Handle pagination
  const handlePageChange = async (newPage: number) => {
    try {
      const serviceFilters = convertFiltersToServiceFilters(
        appliedFilters,
        newPage,
        pageSize
      );
      const matchesData = await getMatches(serviceFilters);

      if (matchesData.success) {
        setMatches(matchesData.data.map(convertMatchData));
        setPage(newPage);
      }
    } catch (error) {
      console.error("❌ Sayfa değiştirme hatası:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-2 sm:px-4 lg:px-4 xl:px-0 max-w-[1920px]">
        {/* Loading Progress */}
        {isLoading && loadingProgress && (
          <div className="mb-4 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span className="text-blue-400 font-medium">
                {loadingProgress}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-15 gap-2 lg:gap-4">
          {/* League Sidebar - Only visible on large desktop (1280px+) */}
          <div className="hidden xl:block xl:col-span-3">
            <LeagueSidebar
              leagues={leagues}
              selectedLeagues={selectedLeagues}
              onLeagueToggle={(league) => {
                const newSelection = selectedLeagues.includes(league)
                  ? selectedLeagues.filter((l) => l !== league)
                  : [...selectedLeagues, league];
                setSelectedLeagues(newSelection);
              }}
              onSelectAll={() => setSelectedLeagues([...leagues])}
              onClearAll={() => setSelectedLeagues([])}
              onApplySelection={() => {
                // Seçili liglerle maçları yükle
                const newFilters = {
                  ...appliedFilters,
                  league: selectedLeagues,
                };
                setAppliedFilters(newFilters);
                loadMatches(newFilters, 1);
              }}
            />
          </div>

          {/* Main Content - Full width below 1280px, 12 cols above */}
          <div className="xl:col-span-12">
            {/* Filter Bar */}
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              allTeams={allTeams}
              selectedLeagues={selectedLeagues}
              leagues={leagues}
              onLeagueToggle={(league) => {
                const newSelection = selectedLeagues.includes(league)
                  ? selectedLeagues.filter((l) => l !== league)
                  : [...selectedLeagues, league];
                setSelectedLeagues(newSelection);
              }}
              onLeagueSelectAll={() => setSelectedLeagues([...leagues])}
              onLeagueClearAll={() => setSelectedLeagues([])}
              onApplyLeagueSelection={() => {
                // Seçili liglerle maçları yükle
                const newFilters = {
                  ...appliedFilters,
                  league: selectedLeagues,
                };
                setAppliedFilters(newFilters);
                loadMatches(newFilters, 1);
              }}
            />

            {/* Statistics Cards */}
            {statistics && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mt-4 mb-4">
                <StatisticsCard
                  title="Toplam Maç"
                  value={statistics.totalMatches || 0}
                  subtitle="database"
                  color="blue"
                />
                <StatisticsCard
                  title="Over 1.5"
                  value={`%${statistics.ftOver15?.percentage || "0"}`}
                  subtitle={`${statistics.ftOver15?.count || 0} maç`}
                  color="green"
                />
                <StatisticsCard
                  title="Over 2.5"
                  value={`%${statistics.ftOver25?.percentage || "0"}`}
                  subtitle={`${statistics.ftOver25?.count || 0} maç`}
                  color="orange"
                />
                <StatisticsCard
                  title="BTTS"
                  value={`%${statistics.btts?.percentage || "0"}`}
                  subtitle={`${statistics.btts?.count || 0} maç`}
                  color="purple"
                />
              </div>
            )}

            {/* Loading state for statistics */}
            {!statistics && !isLoading && (
              <div className="pt-6 mb-6">
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-center">
                  <p className="text-blue-300 text-sm">
                    📊 İstatistikler yükleniyor...
                  </p>
                </div>
              </div>
            )}

            {/* Match Table */}
            <MatchTableNew
              matches={matches}
              onOddsFilterChange={handleOddsFilterChange}
              clearFilters={clearTableFilters}
            />

            {/* Pagination Controls - Mobile Optimized */}
            {totalMatches > 0 && (
              <div className="mt-3 mb-3 flex flex-col sm:flex-row items-center justify-between bg-gray-800/80 backdrop-blur-sm rounded-lg p-2 sm:p-3 lg:p-4 border border-gray-700/50 gap-2 sm:gap-0">
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-gray-400">Toplam</span>
                    <span className="ml-1 sm:ml-2 font-bold text-base sm:text-lg text-blue-400">
                      {totalMatches.toLocaleString()}
                    </span>
                    <span className="ml-1 text-gray-400">maç</span>
                  </div>
                  {page && totalPages && (
                    <>
                      <div className="w-px h-4 sm:h-6 bg-gray-700"></div>
                      <div className="text-gray-400">
                        <span className="hidden sm:inline">Sayfa </span>
                        <span className="font-semibold text-white">{page}</span>
                        <span className="mx-0.5 sm:mx-1">/</span>
                        <span className="text-gray-500">{totalPages}</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex gap-1.5 sm:gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className="group px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-gray-700/50 hover:bg-gray-600 text-white rounded-md sm:rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 border border-gray-600/50 hover:border-blue-500/50 text-xs sm:text-sm"
                  >
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-0.5 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      <span className="hidden sm:inline">Önceki</span>
                    </span>
                  </button>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="group px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-md sm:rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 border border-blue-500/50 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/25 text-xs sm:text-sm"
                  >
                    <span className="flex items-center gap-1">
                      <span className="hidden sm:inline">Sonraki</span>
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
