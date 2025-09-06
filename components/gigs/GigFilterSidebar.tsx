"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface OptionsData {
  skillsRequired: string[];
  rolesRequired: string[];
  tags: string[];
  projectTypes: string[];
  statuses: string[];
}

export function GigFiltersSidebar({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Selected filter state
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    searchParams.get("skillsRequired")?.split(",") || []
  );
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    searchParams.get("rolesRequired")?.split(",") || []
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get("tags")?.split(",") || []
  );
  const [selectedProjectTypes, setSelectedProjectTypes] = useState<string[]>(
    searchParams.get("projectTypes")?.split(",") || []
  );
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    searchParams.get("status")?.split(",") || []
  );

  // Dropdown states
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [projectTypesOpen, setProjectTypesOpen] = useState(false);
  const [statusesOpen, setStatusesOpen] = useState(false);

  // Options (skills from API, rest static)
  const [options, setOptions] = useState<OptionsData>({
    skillsRequired: [],
    rolesRequired: ["Frontend", "Backend", "Designer", "Researcher"],
    tags: ["AI", "Blockchain", "Web", "Mobile", "Data Science"],
    projectTypes: ["Hackathon", "Side Project", "Research"],
    statuses: ["Open", "In Progress", "Completed", "Archived"],
  });

  // Fetch skills from API
useEffect(() => {
  async function fetchSkills() {
    try {
      const res = await fetch("/api/data"); // ✅ correct endpoint
      const data: string[] = await res.json();
      setOptions((prev) => ({ ...prev, skillsRequired: data }));
    } catch (err) {
      console.error("Error fetching skills:", err);
    }
  }
  fetchSkills();
}, []);


  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams();
    if (selectedSkills.length) params.set("skillsRequired", selectedSkills.join(","));
    if (selectedRoles.length) params.set("rolesRequired", selectedRoles.join(","));
    if (selectedTags.length) params.set("tags", selectedTags.join(","));
    if (selectedProjectTypes.length) params.set("projectTypes", selectedProjectTypes.join(","));
    if (selectedStatuses.length) params.set("status", selectedStatuses.join(","));
    router.push(`/dashboard/gigs?${params.toString()}`);
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedSkills([]);
    setSelectedRoles([]);
    setSelectedTags([]);
    setSelectedProjectTypes([]);
    setSelectedStatuses([]);
    router.push(`/dashboard/gigs`);
  };

  const hasActiveFilters =
    selectedSkills.length > 0 ||
    selectedRoles.length > 0 ||
    selectedTags.length > 0 ||
    selectedProjectTypes.length > 0 ||
    selectedStatuses.length > 0;

  return (
    <div className={`rounded-xl border border-gray-200 shadow-sm ${className}`}>
      <div className="p-6 pb-4 flex items-center justify-between">
        <h4 className="text-lg font-semibold">Filters</h4>
        {hasActiveFilters && (
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
        {/* Skills Filter */}
        <FilterSelect
          label="Skills"
          items={options.skillsRequired}
          selected={selectedSkills}
          setSelected={setSelectedSkills}
          open={skillsOpen}
          setOpen={setSkillsOpen}
        />

        {/* Roles Filter */}
        <FilterSelect
          label="Roles"
          items={options.rolesRequired}
          selected={selectedRoles}
          setSelected={setSelectedRoles}
          open={rolesOpen}
          setOpen={setRolesOpen}
        />

        {/* Tags Filter */}
        <FilterSelect
          label="Tags"
          items={options.tags}
          selected={selectedTags}
          setSelected={setSelectedTags}
          open={tagsOpen}
          setOpen={setTagsOpen}
        />

        {/* Project Types Filter */}
        <FilterSelect
          label="Project Types"
          items={options.projectTypes}
          selected={selectedProjectTypes}
          setSelected={setSelectedProjectTypes}
          open={projectTypesOpen}
          setOpen={setProjectTypesOpen}
        />

        {/* Status Filter */}
        <FilterSelect
          label="Status"
          items={options.statuses}
          selected={selectedStatuses}
          setSelected={setSelectedStatuses}
          open={statusesOpen}
          setOpen={setStatusesOpen}
        />

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

/* 🔹 Reusable filter component */
function FilterSelect({
  label,
  items,
  selected,
  setSelected,
  open,
  setOpen,
}: {
  label: string;
  items: string[];
  selected: string[];
  setSelected: (val: string[]) => void;
  open: boolean;
  setOpen: (val: boolean) => void;
}) {
  const toggleItem = (item: string) => {
    setSelected(
      selected.includes(item)
        ? selected.filter((i) => i !== item)
        : [...selected, item]
    );
  };

  return (
    <div>
      <Label className="text-sm font-medium mb-3 block">
        {label} {selected.length > 0 && `(${selected.length})`}
      </Label>
      <Select open={open} onOpenChange={setOpen}>
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={
              selected.length > 0
                ? `${selected.length} selected`
                : `Select ${label.toLowerCase()}...`
            }
          />
        </SelectTrigger>
        <SelectContent>
          <div className="p-2 space-y-2 max-h-60 overflow-y-auto">
            {items.map((item) => (
              <div key={item} className="flex items-center space-x-2">
                <Checkbox
                  id={`${label}-${item}`}
                  checked={selected.includes(item)}
                  onCheckedChange={() => toggleItem(item)}
                />
                <Label
                  htmlFor={`${label}-${item}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {item}
                </Label>
              </div>
            ))}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}
