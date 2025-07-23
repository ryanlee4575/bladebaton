import React, { useState, useEffect } from "react";
import { Fencer, Match, TeamStats, University, Coach } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, TrendingUp, Users, Calendar } from "lucide-react";

import QuickStats from "../components/dashboard/QuickStats";
import RecentMatches from "../components/dashboard/RecentMatches"; 
import TopFencers from "../components/dashboard/TopFencers";

export default function Dashboard() {
  const navigate = useNavigate();
  const [fencers, setFencers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [teamStats, setTeamStats] = useState(null);
  const [university, setUniversity] = useState(null);
  const [coach, setCoach] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSetupAndLoadData();
  }, []);

  const checkSetupAndLoadData = async () => {
    setIsLoading(true);
    try {
      // Check if setup is complete
      const [universityData, coachData] = await Promise.all([
        University.list('', 1),
        Coach.list('', 1)
      ]);

      if (universityData.length === 0 || coachData.length === 0) {
        // Setup not complete, redirect to setup
        navigate(createPageUrl("Setup"));
        return;
      }

      // Load all dashboard data
      const [fencersData, matchesData, statsData] = await Promise.all([
        Fencer.list('-created_date'),
        Match.list('-date'),
        TeamStats.list('-season_year', 1)
      ]);
      
      setFencers(fencersData);
      setMatches(matchesData);
      setTeamStats(statsData[0] || null);
      setUniversity(universityData[0]);
      setCoach(coachData[0]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
    setIsLoading(false);
  };

  const upcomingMatches = matches.filter(m => m.status === 'scheduled').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your program...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              {university?.nickname || "Team"} Dashboard
            </h1>
            <p className="text-slate-600 text-lg">
              Welcome back, Coach {coach?.name}. Let's build a championship team.
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Link to={createPageUrl("Recruiting")} className="flex-1 md:flex-none">
              <Button variant="outline" className="w-full border-amber-200 text-amber-700 hover:bg-amber-50">
                <Users className="w-4 h-4 mr-2" />
                View Recruits
              </Button>
            </Link>
            <Link to={createPageUrl("Matches")} className="flex-1 md:flex-none">
              <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Match
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <QuickStats 
          teamStats={teamStats}
          fencers={fencers}
          upcomingMatches={upcomingMatches}
        />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-8">
            <RecentMatches matches={matches} />
            
            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <Link to={createPageUrl("Team")}>
                <div className="p-6 bg-white rounded-2xl shadow-lg border-0 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors duration-300">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Manage Team</h3>
                      <p className="text-slate-600">View roster and fencer stats</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link to={createPageUrl("Facilities")}>
                <div className="p-6 bg-white rounded-2xl shadow-lg border-0 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors duration-300">
                      <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Upgrade Facilities</h3>
                      <p className="text-slate-600">Improve training and recovery</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="space-y-8">
            <TopFencers fencers={fencers} />
            
            {/* Team Morale */}
            <div className="p-6 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl shadow-lg text-white">
              <h3 className="font-bold text-xl mb-2">Team Morale</h3>
              <div className="text-3xl font-bold mb-2">85%</div>
              <p className="text-amber-100">The team is motivated and ready to compete!</p>
              <div className="mt-4 bg-white/20 rounded-full h-2">
                <div className="bg-white rounded-full h-2" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
