"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RotateCcw } from "lucide-react";

interface OptionsData {
  skills: string[];
  years: string[];
  institutions: string[];
  genders: string[];
}

export function GigFiltersSidebar({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Selected filter state
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    (searchParams.get("skills")?.split(",") as string[]) || []
  );
  const [selectedYears, setSelectedYears] = useState<string[]>(
    (searchParams.get("years")?.split(",") as string[]) || []
  );
  const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>(
    (searchParams.get("institutions")?.split(",") as string[]) || []
  );
  const [selectedGenders, setSelectedGenders] = useState<string[]>(
    (searchParams.get("genders")?.split(",") as string[]) || []
  );

  // Options fetched from API
  const [options, setOptions] = useState<OptionsData>({
    skills: [],
    years: [],
    institutions: [],
    genders: [],
  });

  useEffect(() => {
    async function fetchOptions() {
      try {
        const res = await fetch("/api/data");
        const data: OptionsData = await res.json();
        setOptions(data);
      } catch (err) {
        console.error("Error fetching filter options:", err);
      }
    }
    fetchOptions();
  }, []);

  // Generic toggle function
  const toggleItem = (arr: string[], setArr: (val: string[]) => void, item: string) => {
    setArr(arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]);
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (selectedSkills.length) params.set("skills", selectedSkills.join(","));
    if (selectedYears.length) params.set("years", selectedYears.join(","));
    if (selectedInstitutions.length) params.set("institutions", selectedInstitutions.join(","));
    if (selectedGenders.length) params.set("genders", selectedGenders.join(","));
    router.push(`/dashboard/gigs?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedSkills([]);
    setSelectedYears([]);
    setSelectedInstitutions([]);
    setSelectedGenders([]);
    router.push(`/dashboard/gigs`);
  };

  return (
    <div className={`rounded-xl border border-gray-200 shadow-sm ${className}`}>
      <div className="p-6 pb-4 flex items-center justify-between">
        <h4 className="text-lg font-semibold ">Filters</h4>
        {(selectedSkills.length || selectedYears.length || selectedInstitutions.length || selectedGenders.length) > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700 p-1 h-auto flex items-center"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <Separator />

      <div className="p-6 space-y-6">
        {/* Skills */}
        <div>
          <Label className="text-sm font-medium  mb-3 block">Skills</Label>
          <div className="flex flex-wrap gap-2">
            {options.skills.map((skill) => (
              <Badge
                key={skill}
                variant={selectedSkills.includes(skill) ? "secondary" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleItem(selectedSkills, setSelectedSkills, skill)}
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Years */}
        <div>
          <Label className="text-sm font-medium  mb-3 block">Year</Label>
          <div className="flex flex-wrap gap-2">
            {options.years.map((year) => (
              <Badge
                key={year}
                variant={selectedYears.includes(year) ? "secondary" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleItem(selectedYears, setSelectedYears, year)}
              >
                {year}
              </Badge>
            ))}
          </div>
        </div>

        {/* Institutions */}
        <div>
          <Label className="text-sm font-medium  mb-3 block">Institutions</Label>
          <div className="flex flex-wrap gap-2">
            {options.institutions.map((inst) => (
              <Badge
                key={inst}
                variant={selectedInstitutions.includes(inst) ? "secondary" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleItem(selectedInstitutions, setSelectedInstitutions, inst)}
              >
                {inst}
              </Badge>
            ))}
          </div>
        </div>

        {/* Genders */}
        <div>
          <Label className="text-sm font-medium  mb-3 block">Gender</Label>
          <div className="flex flex-wrap gap-2">
            {options.genders.map((gender) => (
              <Badge
                key={gender}
                variant={selectedGenders.includes(gender) ? "secondary" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleItem(selectedGenders, setSelectedGenders, gender)}
              >
                {gender}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          onClick={applyFilters}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
