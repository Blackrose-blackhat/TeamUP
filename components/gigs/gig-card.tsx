"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

interface GigCardProps {
  gig: any;
  onApply?: (gigId: string) => void;
}

export function GigCard({ gig, onApply }: GigCardProps) {
  return (
    <div className="p-4 border rounded-lg shadow hover:shadow-lg transition flex flex-col justify-between">
      {/* Title */}
      <h3 className="text-xl font-semibold mb-2">{gig.title}</h3>

      {/* Description */}
      <p className="text-gray-700 mb-3 line-clamp-3">{gig.description}</p>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-3">
        {gig.skillsRequired?.map((skill: any) => (
          <Badge key={skill.name} variant="secondary">
            {skill.name}
          </Badge>
        ))}
      </div>

      {/* Project Type & Status */}
      <div className="flex justify-between items-center mb-3 text-sm text-gray-500">
        <span>Type: {gig.projectType || "N/A"}</span>
        <span>Status: {gig.status || "Open"}</span>
      </div>

      {/* Creator */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-medium">{gig.createdBy?.name || "Unknown"}</p>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            {gig.createdBy?.github && (
              <a
                href={`https://github.com/${gig.createdBy.github}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:underline"
              >
                <Github size={14} /> GitHub
              </a>
            )}
            {gig.createdBy?.email && <span>{gig.createdBy.email}</span>}
          </div>
        </div>

        {/* Apply button */}
        {onApply && (
          <Button size="sm" onClick={() => onApply(gig._id)}>
            Apply
          </Button>
        )}
      </div>

      {/* Tags */}
      {gig.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {gig.tags.map((tag: string) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
