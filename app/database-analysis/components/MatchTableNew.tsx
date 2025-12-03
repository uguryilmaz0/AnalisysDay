"use client";

import { MatchData } from "@/types/database";
import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MatchTableProps {
  matches: MatchData[];
  isLoading: boolean;
}

// Helper function to get color class based on odds value
function getOddsColor(odds: number | null | undefined): string {
  if (!odds) return "bg-gray-700 text-white";
  if (odds <= 1.5) return "bg-green-900 text-white";
  if (odds <= 2.0) return "bg-emerald-800 text-white";
  if (odds <= 3.0) return "bg-blue-800 text-white";
  if (odds <= 5.0) return "bg-yellow-800 text-white";
  return "bg-red-800 text-white";
}

// Filter helper function
function matchesFilter(
  odds: number | null | undefined,
  filter: string
): boolean {
  if (!filter || !odds) return true;

  const trimmed = filter.trim();
  if (trimmed.startsWith(">")) {
    const val = parseFloat(trimmed.substring(1));
    return !isNaN(val) && odds > val;
  }
  if (trimmed.startsWith("<")) {
    const val = parseFloat(trimmed.substring(1));
    return !isNaN(val) && odds < val;
  }
  const val = parseFloat(trimmed);
  return !isNaN(val) && Math.abs(odds - val) < 0.01;
}

export default function MatchTableNew({ matches, isLoading }: MatchTableProps) {
  // Filter states - ALL columns
  const [filters, setFilters] = useState({
    msHome: "",
    msDraw: "",
    msAway: "",
    htHome: "",
    htDraw: "",
    htAway: "",
    dc1X: "",
    dc12: "",
    dcX2: "",
    htdc1X: "",
    htdc12: "",
    htdcX2: "",
    ahMinus: "",
    ahZero: "",
    ahPlus: "",
    ehMinus1: "",
    htMs1: "",
    htMs1X: "",
    htMs12: "",
    htMsX1: "",
    htMsXX: "",
    htMsX2: "",
    htMs21: "",
    htMs2X: "",
    htMs22: "",
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Filtered matches
  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      return (
        matchesFilter(match.ft_home_odds_close, filters.msHome) &&
        matchesFilter(match.ft_draw_odds_close, filters.msDraw) &&
        matchesFilter(match.ft_away_odds_close, filters.msAway) &&
        matchesFilter(match.ht_home_odds_close, filters.htHome) &&
        matchesFilter(match.ht_draw_odds_close, filters.htDraw) &&
        matchesFilter(match.ht_away_odds_close, filters.htAway) &&
        matchesFilter(match.ft_dc_1x_odds_close, filters.dc1X) &&
        matchesFilter(match.ft_dc_12_odds_close, filters.dc12) &&
        matchesFilter(match.ft_dc_x2_odds_close, filters.dcX2) &&
        matchesFilter(match.ht_dc_1x_odds_close, filters.htdc1X) &&
        matchesFilter(match.ht_dc_12_odds_close, filters.htdc12) &&
        matchesFilter(match.ht_dc_x2_odds_close, filters.htdcX2) &&
        matchesFilter(match.ah_minus_05_home_odds_close, filters.ahMinus) &&
        matchesFilter(match.ah_0_home_odds_close, filters.ahZero) &&
        matchesFilter(match.ah_plus_05_home_odds_close, filters.ahPlus) &&
        matchesFilter(match.eh_minus_1_home_odds_close, filters.ehMinus1) &&
        matchesFilter(match.ht_ft_11_odds_close, filters.htMs1) &&
        matchesFilter(match.ht_ft_1x_odds_close, filters.htMs1X) &&
        matchesFilter(match.ht_ft_12_odds_close, filters.htMs12) &&
        matchesFilter(match.ht_ft_x1_odds_close, filters.htMsX1) &&
        matchesFilter(match.ht_ft_xx_odds_close, filters.htMsXX) &&
        matchesFilter(match.ht_ft_x2_odds_close, filters.htMsX2) &&
        matchesFilter(match.ht_ft_21_odds_close, filters.htMs21) &&
        matchesFilter(match.ht_ft_2x_odds_close, filters.htMs2X) &&
        matchesFilter(match.ht_ft_22_odds_close, filters.htMs22)
      );
    });
  }, [matches, filters]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">Maç bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Help */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-300">
        <span className="font-semibold text-blue-400">Filtre Kullanımı:</span>{" "}
        <code className="bg-gray-700 px-2 py-0.5 rounded text-xs">&gt;2.5</code>{" "}
        (büyük),{" "}
        <code className="bg-gray-700 px-2 py-0.5 rounded text-xs">&lt;1.8</code>{" "}
        (küçük),{" "}
        <code className="bg-gray-700 px-2 py-0.5 rounded text-xs">1.75</code>{" "}
        (eşit)
        <span className="text-xs ml-2 text-gray-400">
          ({filteredMatches.length} / {matches.length} maç)
        </span>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border border-gray-700 bg-gray-900">
        <div className="relative overflow-auto max-h-[calc(100vh-250px)]">
          <Table>
            <TableHeader className="sticky top-0 z-20 bg-gray-900">
              <TableRow className="hover:bg-gray-900 border-gray-700">
                {/* Sticky Left Columns */}
                <TableHead className="sticky left-0 z-30 bg-gray-900 text-white border-r-2 border-gray-700 p-2 w-[100px] min-w-[100px] max-w-[100px]">
                  Tarih
                </TableHead>
                <TableHead className="sticky left-[100px] z-30 bg-gray-900 text-white border-r border-gray-700 p-2 w-[150px] min-w-[150px] max-w-[150px]">
                  Lig
                </TableHead>
                <TableHead className="sticky left-[250px] z-30 bg-gray-900 text-white border-r border-gray-700 p-2 w-[150px] min-w-[150px] max-w-[150px]">
                  Ev Sahibi
                </TableHead>
                <TableHead className="sticky left-[400px] z-30 bg-gray-900 text-white text-center border-r border-gray-700 p-1 w-32 min-w-32 max-w-32">
                  <div className="text-xs">İY / MS</div>
                </TableHead>
                <TableHead className="sticky left-[532px] z-30 bg-gray-900 text-white border-r-2 border-gray-700 shadow-[2px_0_5px_rgba(0,0,0,0.5)] p-2 w-[150px] min-w-[150px] max-w-[150px]">
                  Deplasman
                </TableHead>

                {/* MS (Maç Sonucu) */}
                <TableHead className="text-center text-yellow-400 min-w-[100px]">
                  MS 1
                </TableHead>
                <TableHead className="text-center text-yellow-400 min-w-[100px]">
                  MS X
                </TableHead>
                <TableHead className="text-center text-yellow-400 min-w-[100px] border-r-2 border-gray-700">
                  MS 2
                </TableHead>

                {/* İY (İlk Yarı) */}
                <TableHead className="text-center text-blue-400 min-w-[100px]">
                  İY 1
                </TableHead>
                <TableHead className="text-center text-blue-400 min-w-[100px]">
                  İY X
                </TableHead>
                <TableHead className="text-center text-blue-400 min-w-[100px] border-r-2 border-gray-700">
                  İY 2
                </TableHead>

                {/* ÇŞ (Çifte Şans) */}
                <TableHead className="text-center text-green-400 min-w-[100px]">
                  ÇŞ 1X
                </TableHead>
                <TableHead className="text-center text-green-400 min-w-[100px]">
                  ÇŞ 12
                </TableHead>
                <TableHead className="text-center text-green-400 min-w-[100px] border-r-2 border-gray-700">
                  ÇŞ X2
                </TableHead>

                {/* İYÇŞ (İlk Yarı Çifte Şans) */}
                <TableHead className="text-center text-cyan-400 min-w-[100px] bg-gray-800/50">
                  İYÇŞ 1X
                </TableHead>
                <TableHead className="text-center text-cyan-400 min-w-[100px] bg-gray-800/50">
                  İYÇŞ 12
                </TableHead>
                <TableHead className="text-center text-cyan-400 min-w-[100px] bg-gray-800/50 border-r-2 border-gray-700">
                  İYÇŞ X2
                </TableHead>

                {/* AH (Asian Handicap) */}
                <TableHead className="text-center text-purple-400 min-w-[100px]">
                  AH -0.5
                </TableHead>
                <TableHead className="text-center text-purple-400 min-w-[100px]">
                  AH 0
                </TableHead>
                <TableHead className="text-center text-purple-400 min-w-[100px] border-r-2 border-gray-700">
                  AH +0.5
                </TableHead>

                {/* EH (European Handicap) */}
                <TableHead className="text-center text-orange-400 min-w-[100px] border-r-2 border-gray-700">
                  EH -1
                </TableHead>

                {/* İY/MS Combinations */}
                <TableHead className="text-center text-pink-400 min-w-[100px] bg-gray-800/50">
                  1/1
                </TableHead>
                <TableHead className="text-center text-pink-400 min-w-[100px] bg-gray-800/50">
                  1/X
                </TableHead>
                <TableHead className="text-center text-pink-400 min-w-[100px] bg-gray-800/50">
                  1/2
                </TableHead>
                <TableHead className="text-center text-pink-400 min-w-[100px] bg-gray-800/50">
                  X/1
                </TableHead>
                <TableHead className="text-center text-pink-400 min-w-[100px] bg-gray-800/50">
                  X/X
                </TableHead>
                <TableHead className="text-center text-pink-400 min-w-[100px] bg-gray-800/50">
                  X/2
                </TableHead>
                <TableHead className="text-center text-pink-400 min-w-[100px] bg-gray-800/50">
                  2/1
                </TableHead>
                <TableHead className="text-center text-pink-400 min-w-[100px] bg-gray-800/50">
                  2/X
                </TableHead>
                <TableHead className="text-center text-pink-400 min-w-[100px] bg-gray-800/50">
                  2/2
                </TableHead>
              </TableRow>

              {/* Filter Row */}
              <TableRow className="hover:bg-gray-900 border-gray-700 bg-gray-800/80">
                {/* Sticky columns - empty */}
                <TableHead className="sticky left-0 z-30 bg-gray-800 border-r-2 border-gray-700 h-12"></TableHead>
                <TableHead className="sticky left-[100px] z-30 bg-gray-800 border-r border-gray-700 h-12"></TableHead>
                <TableHead className="sticky left-[250px] z-30 bg-gray-800 border-r border-gray-700 h-12"></TableHead>
                <TableHead className="sticky left-[400px] z-30 bg-gray-800 border-r border-gray-700 h-12"></TableHead>
                <TableHead className="sticky left-[480px] z-30 bg-gray-800 border-r-2 border-gray-700 shadow-[2px_0_5px_rgba(0,0,0,0.5)] h-12"></TableHead>

                {/* Filter Inputs - MS */}
                <TableHead className="p-2">
                  <Input
                    placeholder=">"
                    value={filters.msHome}
                    onChange={(e) =>
                      handleFilterChange("msHome", e.target.value)
                    }
                    className="h-8 bg-gray-700 border-gray-600 text-white text-xs focus:ring-yellow-500"
                  />
                </TableHead>
                <TableHead className="p-2">
                  <Input
                    placeholder=">"
                    value={filters.msDraw}
                    onChange={(e) =>
                      handleFilterChange("msDraw", e.target.value)
                    }
                    className="h-8 bg-gray-700 border-gray-600 text-white text-xs focus:ring-yellow-500"
                  />
                </TableHead>
                <TableHead className="p-2 border-r-2 border-gray-700">
                  <Input
                    placeholder=">"
                    value={filters.msAway}
                    onChange={(e) =>
                      handleFilterChange("msAway", e.target.value)
                    }
                    className="h-8 bg-gray-700 border-gray-600 text-white text-xs focus:ring-yellow-500"
                  />
                </TableHead>

                {/* Filter Inputs - İY */}
                <TableHead className="p-2">
                  <Input
                    placeholder=">"
                    value={filters.htHome}
                    onChange={(e) =>
                      handleFilterChange("htHome", e.target.value)
                    }
                    className="h-8 bg-gray-700 border-gray-600 text-white text-xs focus:ring-blue-500"
                  />
                </TableHead>
                <TableHead className="p-2">
                  <Input
                    placeholder=">"
                    value={filters.htDraw}
                    onChange={(e) =>
                      handleFilterChange("htDraw", e.target.value)
                    }
                    className="h-8 bg-gray-700 border-gray-600 text-white text-xs focus:ring-blue-500"
                  />
                </TableHead>
                <TableHead className="p-2 border-r-2 border-gray-700">
                  <Input
                    placeholder=">"
                    value={filters.htAway}
                    onChange={(e) =>
                      handleFilterChange("htAway", e.target.value)
                    }
                    className="h-8 bg-gray-700 border-gray-600 text-white text-xs focus:ring-blue-500"
                  />
                </TableHead>

                {/* Filter Inputs - ÇŞ */}
                <TableHead className="p-2">
                  <Input
                    placeholder=">"
                    value={filters.dc1X}
                    onChange={(e) => handleFilterChange("dc1X", e.target.value)}
                    className="h-8 bg-gray-700 border-gray-600 text-white text-xs focus:ring-green-500"
                  />
                </TableHead>
                <TableHead className="p-2">
                  <Input
                    placeholder=">"
                    value={filters.dc12}
                    onChange={(e) => handleFilterChange("dc12", e.target.value)}
                    className="h-8 bg-gray-700 border-gray-600 text-white text-xs focus:ring-green-500"
                  />
                </TableHead>
                <TableHead className="p-2 border-r-2 border-gray-700">
                  <Input
                    placeholder=">"
                    value={filters.dcX2}
                    onChange={(e) => handleFilterChange("dcX2", e.target.value)}
                    className="h-8 bg-gray-700 border-gray-600 text-white text-xs focus:ring-green-500"
                  />
                </TableHead>

                {/* Filter Inputs - İYÇŞ */}
                <TableHead className="p-2">
                  <Input
                    placeholder=">"
                    value={filters.htdc1X}
                    onChange={(e) =>
                      handleFilterChange("htdc1X", e.target.value)
                    }
                    className="h-8 bg-gray-700 border-gray-600 text-white text-xs focus:ring-cyan-500"
                  />
                </TableHead>
                <TableHead className="p-2">
                  <Input
                    placeholder=">"
                    value={filters.htdc12}
                    onChange={(e) =>
                      handleFilterChange("htdc12", e.target.value)
                    }
                    className="h-8 bg-gray-700 border-gray-600 text-white text-xs focus:ring-cyan-500"
                  />
                </TableHead>
                <TableHead className="p-2 border-r-2 border-gray-700">
                  <Input
                    placeholder=">"
                    value={filters.htdcX2}
                    onChange={(e) =>
                      handleFilterChange("htdcX2", e.target.value)
                    }
                    className="h-8 bg-gray-700 border-gray-600 text-white text-xs focus:ring-cyan-500"
                  />
                </TableHead>

                {/* Filter Inputs - AH */}
                <TableHead className="p-2">
                  <Input
                    placeholder=">"
                    value={filters.ahMinus}
                    onChange={(e) =>
                      handleFilterChange("ahMinus", e.target.value)
                    }
                    className="h-8 bg-gray-700 border-gray-600 text-white text-xs focus:ring-purple-500"
                  />
                </TableHead>
                <TableHead className="p-2">
                  <Input
                    placeholder=">"
                    value={filters.ahZero}
                    onChange={(e) =>
                      handleFilterChange("ahZero", e.target.value)
                    }
                    className="h-8 bg-gray-700 border-gray-600 text-white text-xs focus:ring-purple-500"
                  />
                </TableHead>
                <TableHead className="p-2 border-r-2 border-gray-700">
                  <Input
                    placeholder=">"
                    value={filters.ahPlus}
                    onChange={(e) =>
                      handleFilterChange("ahPlus", e.target.value)
                    }
                    className="h-8 bg-gray-700 border-gray-600 text-white text-xs focus:ring-purple-500"
                  />
                </TableHead>

                {/* Filter Input - EH */}
                <TableHead className="p-2 border-r-2 border-gray-700">
                  <Input
                    placeholder=">"
                    value={filters.ehMinus1}
                    onChange={(e) =>
                      handleFilterChange("ehMinus1", e.target.value)
                    }
                    className="h-8 bg-gray-700 border-gray-600 text-white text-xs focus:ring-orange-500"
                  />
                </TableHead>

                {/* Filter Inputs - İY/MS */}
                <TableHead className="p-2">
                  <Input
                    placeholder=">"
                    value={filters.htMs1}
                    onChange={(e) =>
                      handleFilterChange("htMs1", e.target.value)
                    }
                    className="h-8 bg-gray-700 border-gray-600 text-white text-xs focus:ring-pink-500"
                  />
                </TableHead>
                <TableHead className="p-2">
                  <Input
                    placeholder=">"
                    value={filters.htMs1X}
                    onChange={(e) =>
                      handleFilterChange("htMs1X", e.target.value)
                    }
                    className="h-8 bg-gray-700 border-gray-600 text-white text-xs focus:ring-pink-500"
                  />
                </TableHead>
                <TableHead className="p-2">
                  <Input
                    placeholder=">"
                    value={filters.htMs12}
                    onChange={(e) =>
                      handleFilterChange("htMs12", e.target.value)
                    }
                    className="h-8 bg-gray-700 border-gray-600 text-white text-xs focus:ring-pink-500"
                  />
                </TableHead>
                <TableHead className="p-2">
                  <Input
                    placeholder=">"
                    value={filters.htMsX1}
                    onChange={(e) =>
                      handleFilterChange("htMsX1", e.target.value)
                    }
                    className="h-8 bg-gray-700 border-gray-600 text-white text-xs focus:ring-pink-500"
                  />
                </TableHead>
                <TableHead className="p-2">
                  <Input
                    placeholder=">"
                    value={filters.htMsXX}
                    onChange={(e) =>
                      handleFilterChange("htMsXX", e.target.value)
                    }
                    className="h-8 bg-gray-700 border-gray-600 text-white text-xs focus:ring-pink-500"
                  />
                </TableHead>
                <TableHead className="p-2">
                  <Input
                    placeholder=">"
                    value={filters.htMsX2}
                    onChange={(e) =>
                      handleFilterChange("htMsX2", e.target.value)
                    }
                    className="h-8 bg-gray-700 border-gray-600 text-white text-xs focus:ring-pink-500"
                  />
                </TableHead>
                <TableHead className="p-2">
                  <Input
                    placeholder=">"
                    value={filters.htMs21}
                    onChange={(e) =>
                      handleFilterChange("htMs21", e.target.value)
                    }
                    className="h-8 bg-gray-700 border-gray-600 text-white text-xs focus:ring-pink-500"
                  />
                </TableHead>
                <TableHead className="p-2">
                  <Input
                    placeholder=">"
                    value={filters.htMs2X}
                    onChange={(e) =>
                      handleFilterChange("htMs2X", e.target.value)
                    }
                    className="h-8 bg-gray-700 border-gray-600 text-white text-xs focus:ring-pink-500"
                  />
                </TableHead>
                <TableHead className="p-2">
                  <Input
                    placeholder=">"
                    value={filters.htMs22}
                    onChange={(e) =>
                      handleFilterChange("htMs22", e.target.value)
                    }
                    className="h-8 bg-gray-700 border-gray-600 text-white text-xs focus:ring-pink-500"
                  />
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredMatches.map((match, index) => (
                <TableRow
                  key={index}
                  className="hover:bg-gray-800/50 border-gray-700"
                >
                  {/* Sticky Left Columns */}
                  <TableCell className="sticky left-0 z-10 bg-gray-900 text-white border-r-2 border-gray-700 text-xs p-2 w-[100px] min-w-[100px] max-w-[100px]">
                    {new Date(match.match_date).toLocaleDateString("tr-TR")}
                  </TableCell>
                  <TableCell className="sticky left-[100px] z-10 bg-gray-900 text-white border-r border-gray-700 text-xs p-2 w-[150px] min-w-[150px] max-w-[150px]">
                    {match.league}
                  </TableCell>
                  <TableCell className="sticky left-[250px] z-10 bg-gray-900 text-white border-r border-gray-700 text-xs p-2 w-[150px] min-w-[150px] max-w-[150px]">
                    {match.home_team}
                  </TableCell>
                  <TableCell className="sticky left-[400px] z-10 bg-gray-900 text-white text-center border-r border-gray-700 text-xs p-1 w-32 min-w-32 max-w-32">
                    <div className="flex flex-col gap-0.5">
                      <div className="text-gray-400 text-[10px]">
                        {match.ht_score || "-"}
                      </div>
                      <div className="font-semibold">
                        {match.ft_score || "-"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="sticky left-[532px] z-10 bg-gray-900 text-white border-r-2 border-gray-700 shadow-[2px_0_5px_rgba(0,0,0,0.5)] text-xs p-2 w-[150px] min-w-[150px] max-w-[150px]">
                    {match.away_team}
                  </TableCell>

                  {/* MS Odds */}
                  <TableCell
                    className={cn(
                      "text-center text-xs font-semibold px-3 py-3",
                      getOddsColor(match.ft_home_odds_close)
                    )}
                  >
                    {match.ft_home_odds_close?.toFixed(2) || "-"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-center text-xs font-semibold px-3 py-3",
                      getOddsColor(match.ft_draw_odds_close)
                    )}
                  >
                    {match.ft_draw_odds_close?.toFixed(2) || "-"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-center text-xs font-semibold px-3 py-3 border-r-2 border-gray-700",
                      getOddsColor(match.ft_away_odds_close)
                    )}
                  >
                    {match.ft_away_odds_close?.toFixed(2) || "-"}
                  </TableCell>

                  {/* İY Odds */}
                  <TableCell
                    className={cn(
                      "text-center text-xs font-semibold px-3 py-3",
                      getOddsColor(match.ht_home_odds_close)
                    )}
                  >
                    {match.ht_home_odds_close?.toFixed(2) || "-"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-center text-xs font-semibold px-3 py-3",
                      getOddsColor(match.ht_draw_odds_close)
                    )}
                  >
                    {match.ht_draw_odds_close?.toFixed(2) || "-"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-center text-xs font-semibold px-3 py-3 border-r-2 border-gray-700",
                      getOddsColor(match.ht_away_odds_close)
                    )}
                  >
                    {match.ht_away_odds_close?.toFixed(2) || "-"}
                  </TableCell>

                  {/* ÇŞ Odds */}
                  <TableCell
                    className={cn(
                      "text-center text-xs font-semibold px-3 py-3",
                      getOddsColor(match.ft_dc_1x_odds_close)
                    )}
                  >
                    {match.ft_dc_1x_odds_close?.toFixed(2) || "-"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-center text-xs font-semibold px-3 py-3",
                      getOddsColor(match.ft_dc_12_odds_close)
                    )}
                  >
                    {match.ft_dc_12_odds_close?.toFixed(2) || "-"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-center text-xs font-semibold px-3 py-3 border-r-2 border-gray-700",
                      getOddsColor(match.ft_dc_x2_odds_close)
                    )}
                  >
                    {match.ft_dc_x2_odds_close?.toFixed(2) || "-"}
                  </TableCell>

                  {/* İYÇŞ Odds */}
                  <TableCell
                    className={cn(
                      "text-center text-xs font-semibold px-3 py-3",
                      getOddsColor(match.ht_dc_1x_odds_close)
                    )}
                  >
                    {match.ht_dc_1x_odds_close?.toFixed(2) || "-"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-center text-xs font-semibold px-3 py-3",
                      getOddsColor(match.ht_dc_12_odds_close)
                    )}
                  >
                    {match.ht_dc_12_odds_close?.toFixed(2) || "-"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-center text-xs font-semibold px-3 py-3 border-r-2 border-gray-700",
                      getOddsColor(match.ht_dc_x2_odds_close)
                    )}
                  >
                    {match.ht_dc_x2_odds_close?.toFixed(2) || "-"}
                  </TableCell>

                  {/* AH Odds */}
                  <TableCell
                    className={cn(
                      "text-center text-xs font-semibold px-3 py-3",
                      getOddsColor(match.ah_minus_05_home_odds_close)
                    )}
                  >
                    {match.ah_minus_05_home_odds_close?.toFixed(2) || "-"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-center text-xs font-semibold px-3 py-3",
                      getOddsColor(match.ah_0_home_odds_close)
                    )}
                  >
                    {match.ah_0_home_odds_close?.toFixed(2) || "-"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-center text-xs font-semibold px-3 py-3 border-r-2 border-gray-700",
                      getOddsColor(match.ah_plus_05_home_odds_close)
                    )}
                  >
                    {match.ah_plus_05_home_odds_close?.toFixed(2) || "-"}
                  </TableCell>

                  {/* EH Odds */}
                  <TableCell
                    className={cn(
                      "text-center text-xs font-semibold px-3 py-3 border-r-2 border-gray-700",
                      getOddsColor(match.eh_minus_1_home_odds_close)
                    )}
                  >
                    {match.eh_minus_1_home_odds_close?.toFixed(2) || "-"}
                  </TableCell>

                  {/* İY/MS Combinations */}
                  <TableCell
                    className={cn(
                      "text-center text-xs font-semibold px-3 py-3",
                      getOddsColor(match.ht_ft_11_odds_close)
                    )}
                  >
                    {match.ht_ft_11_odds_close?.toFixed(2) || "-"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-center text-xs font-semibold px-3 py-3",
                      getOddsColor(match.ht_ft_1x_odds_close)
                    )}
                  >
                    {match.ht_ft_1x_odds_close?.toFixed(2) || "-"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-center text-xs font-semibold px-3 py-3",
                      getOddsColor(match.ht_ft_12_odds_close)
                    )}
                  >
                    {match.ht_ft_12_odds_close?.toFixed(2) || "-"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-center text-xs font-semibold px-3 py-3",
                      getOddsColor(match.ht_ft_x1_odds_close)
                    )}
                  >
                    {match.ht_ft_x1_odds_close?.toFixed(2) || "-"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-center text-xs font-semibold px-3 py-3",
                      getOddsColor(match.ht_ft_xx_odds_close)
                    )}
                  >
                    {match.ht_ft_xx_odds_close?.toFixed(2) || "-"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-center text-xs font-semibold px-3 py-3",
                      getOddsColor(match.ht_ft_x2_odds_close)
                    )}
                  >
                    {match.ht_ft_x2_odds_close?.toFixed(2) || "-"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-center text-xs font-semibold px-3 py-3",
                      getOddsColor(match.ht_ft_21_odds_close)
                    )}
                  >
                    {match.ht_ft_21_odds_close?.toFixed(2) || "-"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-center text-xs font-semibold px-3 py-3",
                      getOddsColor(match.ht_ft_2x_odds_close)
                    )}
                  >
                    {match.ht_ft_2x_odds_close?.toFixed(2) || "-"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-center text-xs font-semibold px-3 py-3",
                      getOddsColor(match.ht_ft_22_odds_close)
                    )}
                  >
                    {match.ht_ft_22_odds_close?.toFixed(2) || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
