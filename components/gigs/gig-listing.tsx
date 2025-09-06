// components/gigs/gig-listing.tsx
"use client";

import { useState } from "react";
import { GigCard } from "@/components/gigs/gig-card";
import { GigFiltersSidebar } from "@/components/gigs/GigFilterSidebar";
import { Button } from "@/components/ui/button";
import { Filter, Grid, List as ListIcon } from "lucide-react";
import Link from "next/link";

interface Gig {
  _id: string;
  title: string;
  description: string;
  skillsRequired: any[];
  years: string[];
  institutions: string[];
  genders: string[];
  budget: number;
  deadline?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
    github?: string;
    skills: any[];
  } | null;
  applicants: Array<{
    _id: string;
    name: string;
    email: string;
    github?: string;
    skills: any[];
  }>;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
}

interface GigListClientProps {
  gigs: Gig[];
  pagination: Pagination;
  searchParams: { [key: string]: string | string[] | undefined };
  error?: string;
}

export function GigListClient({ gigs, pagination, searchParams, error }: GigListClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Build current URL params for pagination
  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== 'page' && value) {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, value);
        }
      }
    });
    
    params.set('page', String(page));
    return `?${params.toString()}`;
  };

  const getActiveFilterCount = () => {
    let count = 0;
    const skills = (searchParams.skills as string)?.split(",") || [];
    const years = (searchParams.years as string)?.split(",") || [];
    const institutions = (searchParams.institutions as string)?.split(",") || [];
    const genders = (searchParams.genders as string)?.split(",") || [];
    
    count += skills.length + years.length + institutions.length + genders.length;
    return count;
  };

  const activeFilters = getActiveFilterCount();

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <Button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Main content */}
      <main className="flex-1 order-2 md:order-1">
        {/* Header with controls */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Browse Gigs</h1>
            <p className="text-gray-400 mt-1">
              {gigs.length > 0 ? `Found ${pagination.total} gigs` : 'Find the perfect project to join'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View mode toggle */}
            <div className="hidden sm:flex items-center bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile filter toggle */}
            <div className="md:hidden">
              <Button 
                variant="outline"
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-2 border-gray-600 text-white hover:bg-gray-800 hover:text-white"
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFilters > 0 && (
                  <span className="bg-white text-black text-xs rounded-full px-2 py-1 font-medium">
                    {activeFilters}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Active filters display */}
        {activeFilters > 0 && (
          <div className="mb-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">
                {activeFilters} filter{activeFilters > 1 ? 's' : ''} applied
              </span>
              <Link 
                href="/dashboard/gigs"
                className="text-sm text-white hover:text-gray-300 underline"
              >
                Clear all
              </Link>
            </div>
          </div>
        )}

        {/* Gig listings */}
        {gigs.length > 0 ? (
          <>
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }>
              {gigs.map((gig) => (
                <GigCard key={gig._id} gig={gig} viewMode={viewMode} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                {pagination.currentPage > 1 && (
                  <Link 
                    href={buildUrl(pagination.currentPage - 1)}
                    className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-800 text-sm font-medium text-white"
                  >
                    Previous
                  </Link>
                )}
                
                <div className="flex items-center gap-1">
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }

                    return (
                      <Link
                        key={pageNum}
                        href={buildUrl(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          pagination.currentPage === pageNum
                            ? 'bg-white text-black'
                            : 'border border-gray-600 text-white hover:bg-gray-800'
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}
                </div>

                {pagination.currentPage < pagination.totalPages && (
                  <Link 
                    href={buildUrl(pagination.currentPage + 1)}
                    className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-800 text-sm font-medium text-white"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-600 mb-4">
              <Filter className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No gigs found</h3>
           
            <Link 
              href="/dashboard/gigs/create"
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-black bg-white hover:bg-gray-200"
            >
              Create one!
            </Link>
          </div>
        )}
      </main>

      {/* Filters Sidebar - Desktop */}
     

      
    </div>
  );
}