"use client"
import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Rocket, Target, CheckCircle, Clock, User, TrendingUp, Lightbulb, Star } from "lucide-react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import Link from "next/link"
import { useSession } from "next-auth/react"

export default function DashboardPage() {
  const [stats, setStats] = useState({ postedGigs: 0, applications: 0, completed: 0 })
  const [applications, setApplications] = useState<any[]>([])
  const [recommended, setRecommended] = useState<any[]>([])
  const [skillMatch, setSkillMatch] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const fetchDashboard = async () => {
      const [statsRes, appsRes, recRes, skillRes] = await Promise.all([
        fetch("/api/dashboard/stats").then((r) => r.json()),
        fetch("/api/dashboard/my-applicants").then((r) => r.json()),
        fetch("/api/dashboard/recommended-gigs").then((r) => r.json()),
        fetch("/api/dashboard/skill-match").then((r) => r.json()),
      ])
      if (statsRes.success) setStats(statsRes)
      if (appsRes.success) setApplications(appsRes.gigs)
      if (recRes.success) setRecommended(recRes.gigs)
      if (skillRes.success) setSkillMatch(skillRes.percentage)
    }

    fetchDashboard()
  }, [])
  const getUserGigStatus = (gig: any, userId: string) => {
  if (gig.team?.includes(userId)) return "Accepted";
  if (gig.applicants?.some((a: any) => a.user === userId)) return "In Progress";
  return "Not Applied";
};


  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Accepted":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    }
  }

  const statsChartData = [
    { name: "Posted", value: stats.postedGigs, color: "#3b82f6" },
    { name: "Applications", value: stats.applications, color: "#8b5cf6" },
    { name: "Completed", value: stats.completed, color: "#10b981" },
  ]

  const applicationStatusData = applications.reduce(
    (acc, app) => {
      const status = app.status || "Pending"
      acc[status] = (acc[status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const statusChartData = Object.entries(applicationStatusData).map(([status, count]) => ({
    name: status,
    value: count,
    color: status === "Accepted" ? "#10b981" : status === "Rejected" ? "#ef4444" : "#f59e0b",
  }))

  const skillProgressData = [
    { name: "Current", value: skillMatch },
    { name: "Target", value: 100 - skillMatch },
  ]
  const {data} = useSession();
  const user = data?.user?.name;
  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className=" text-white p-6 rounded-lg border border-slate-600">
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{getGreeting()}!{user} </h1>
            <p className="text-slate-300 text-lg mt-1">
              Your gigs dashboard is ready. Keep building your network and skills!
            </p>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: "Gigs Posted",
            value: stats.postedGigs,
            icon: Rocket,
            description: "Active listings",
            color: "text-blue-400",
          },
          {
            label: "Applications",
            value: stats.applications,
            icon: Target,
            description: "Total received",
            color: "text-purple-400",
          },
          {
            label: "Completed",
            value: stats.completed,
            icon: CheckCircle,
            description: "Successfully finished",
            color: "text-green-400",
          },
          {
            label: "Skill Match",
            value: `${skillMatch}%`,
            icon: Lightbulb,
            description: "Profile compatibility",
            color: "text-orange-400",
          },
        ].map((stat, idx) => {
          const IconComponent = stat.icon
          return (
            <Card key={idx} className="hover:shadow-lg transition-all duration-200 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                    <p className="text-3xl font-bold tracking-tight text-white">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-700 ">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Stats Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-700 ">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5" />
              Application Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Separator className="border-slate-700" />

      <Card className="border-slate-700 ">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="h-5 w-5" />
            Recommended Gigs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recommended.length === 0 ? (
              <p className="text-slate-400">No recommended gigs yet. Update your skills to get better matches!</p>
            ) : (
              recommended.map((gig) => (

                <Card
                  key={gig._id}
                  className="min-w-[220px] border-slate-600 transition-colors hover:shadow-lg"
                >
                  <CardContent className="p-4">
                    <p className="font-semibold text-white mb-1">{gig.title}</p>
                    <p className="text-xs text-slate-400 mb-3">
                      {gig.description?.slice(0, 50) || "No description"}...
                    </p>
                    <Link href={`/dashboard/gigs/${gig._id}`} passHref>
                      <Button size="sm" className="w-full">
                        View
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-700 ">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-slate-400" />
            <CardTitle className="text-xl text-white">Recent Applications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-300 text-lg font-medium">No applications yet</p>
              <p className="text-sm text-slate-500 mt-1">
                Your applications will appear here once you start applying to gigs
              </p>
            </div>
          ) : (
            applications.map((app) => (
              <div
                key={app._id}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-600 bg-slate-700/30 hover:bg-slate-700/50 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-500/20">
                    <Target className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{app.title}</p>
                    <p className="text-sm text-slate-400">Applied recently</p>
                  </div>
                </div>
                <Badge className={`${getStatusColor(app.status || "Pending")} border`}>{app.status || "Pending"}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
