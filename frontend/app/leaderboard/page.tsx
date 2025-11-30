'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp, Users, Handshake } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/footer';

interface LeaderboardUser {
  _id: string;
  name: string;
  points: number;
  connectionsCount: number;
  exchangesCount: number;
  rank: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/users/leaderboard');
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/50';
      case 2:
        return 'from-gray-400/20 to-slate-400/20 border-gray-400/50';
      case 3:
        return 'from-amber-600/20 to-orange-600/20 border-amber-600/50';
      default:
        return 'from-primary/5 to-primary/10 border-border';
    }
  };

  const getEmojiAvatar = (name: string) => {
    const emojis = ['👨‍🌾', '👩‍🍳', '👨‍🏫', '👩‍💻', '👨‍🔧', '👩‍⚕️', '👨‍🎨', '👩‍🔬', '👨‍💼', '👩‍🏭', '👨‍🚒', '👩‍✈️', '👨‍🎤', '👩‍🎓', '👨‍⚖️', '👩‍🌾'];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return emojis[hash % emojis.length];
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 mb-4">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Community Leaderboard
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Celebrating our most active community members who make SkillBridge thrive through connections and exchanges.
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  Total Points Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">
                  {leaderboard.reduce((sum, user) => sum + user.points, 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-secondary" />
                  Total Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-secondary">
                  {leaderboard.reduce((sum, user) => sum + user.connectionsCount, 0)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Handshake className="h-4 w-4 text-accent" />
                  Total Exchanges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-accent">
                  {leaderboard.reduce((sum, user) => sum + user.exchangesCount, 0)}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Podium - Top 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* 2nd Place */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="md:order-1 order-2"
              >
                <Card className="bg-gradient-to-br from-gray-400/20 to-slate-400/20 border-gray-400/50 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-400/10 to-transparent" />
                  <CardContent className="pt-8 pb-6 relative z-10">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 mb-4 shadow-lg">
                        <Medal className="h-10 w-10 text-white" />
                      </div>
                      <div className="text-5xl mb-3">👩‍🍳</div>
                      <h3 className="text-2xl font-bold mb-2">Sarah Chen</h3>
                      <div className="text-4xl font-bold text-gray-600 mb-3">450</div>
                      <Badge variant="secondary" className="mb-4">
                        <Award className="h-3 w-3 mr-1" />
                        2nd Place
                      </Badge>
                      <div className="flex justify-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          12 connections
                        </span>
                        <span className="flex items-center gap-1">
                          <Handshake className="h-3.5 w-3.5" />
                          8 exchanges
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 1st Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="md:order-2 order-1"
              >
                <Card className="bg-gradient-to-br from-yellow-500/30 to-amber-500/30 border-yellow-500/60 hover:shadow-2xl transition-all duration-300 relative overflow-hidden md:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-300/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
                  <CardContent className="pt-10 pb-8 relative z-10">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 mb-4 shadow-2xl animate-pulse">
                        <Trophy className="h-12 w-12 text-white" />
                      </div>
                      <div className="text-6xl mb-3">👨‍💻</div>
                      <h3 className="text-3xl font-bold mb-2">David Kim</h3>
                      <div className="text-5xl font-bold text-yellow-600 mb-3">520</div>
                      <Badge className="mb-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0">
                        <Trophy className="h-3 w-3 mr-1" />
                        Champion 🏆
                      </Badge>
                      <div className="flex justify-center gap-4 text-sm text-muted-foreground pt-3 border-t">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          15 connections
                        </span>
                        <span className="flex items-center gap-1">
                          <Handshake className="h-3.5 w-3.5" />
                          10 exchanges
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 3rd Place */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="md:order-3 order-3"
              >
                <Card className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 border-amber-600/50 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
                  <CardContent className="pt-8 pb-6 relative z-10">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-700 mb-4 shadow-lg">
                        <Medal className="h-10 w-10 text-white" />
                      </div>
                      <div className="text-5xl mb-3">👨‍🏫</div>
                      <h3 className="text-2xl font-bold mb-2">Tom Anderson</h3>
                      <div className="text-4xl font-bold text-amber-700 mb-3">410</div>
                      <Badge variant="secondary" className="mb-4">
                        <Award className="h-3 w-3 mr-1" />
                        3rd Place
                      </Badge>
                      <div className="flex justify-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          11 connections
                        </span>
                        <span className="flex items-center gap-1">
                          <Handshake className="h-3.5 w-3.5" />
                          7 exchanges
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>

          {/* Rest of Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-3"
          >
            {/* 4th Place - Marcus Johnson */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.45 }}
            >
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-border hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0 w-12 flex items-center justify-center">
                      <span className="text-xl font-bold text-muted-foreground">#4</span>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl">
                        👨‍🔧
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold truncate">Marcus Johnson</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          10 connections
                        </span>
                        <span className="flex items-center gap-1">
                          <Handshake className="h-3.5 w-3.5" />
                          6 exchanges
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-2xl font-bold text-primary">380</div>
                      <Badge variant="secondary" className="mt-1">
                        <Award className="h-3 w-3 mr-1" />
                        points
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 5th Place - Aisha Patel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-border hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0 w-12 flex items-center justify-center">
                      <span className="text-xl font-bold text-muted-foreground">#5</span>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl">
                        👩‍⚕️
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold truncate">Aisha Patel</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          8 connections
                        </span>
                        <span className="flex items-center gap-1">
                          <Handshake className="h-3.5 w-3.5" />
                          4 exchanges
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-2xl font-bold text-primary">290</div>
                      <Badge variant="secondary" className="mt-1">
                        <Award className="h-3 w-3 mr-1" />
                        points
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 6th Place - Maria Santos */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.55 }}
            >
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-border hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0 w-12 flex items-center justify-center">
                      <span className="text-xl font-bold text-muted-foreground">#6</span>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl">
                        👩‍🎨
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold truncate">Maria Santos</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          4 connections
                        </span>
                        <span className="flex items-center gap-1">
                          <Handshake className="h-3.5 w-3.5" />
                          2 exchanges
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-2xl font-bold text-primary">120</div>
                      <Badge variant="secondary" className="mt-1">
                        <Award className="h-3 w-3 mr-1" />
                        points
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 7th Place - Elena Rodriguez */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-border hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0 w-12 flex items-center justify-center">
                      <span className="text-xl font-bold text-muted-foreground">#7</span>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl">
                        👶
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold truncate">Elena Rodriguez</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          3 connections
                        </span>
                        <span className="flex items-center gap-1">
                          <Handshake className="h-3.5 w-3.5" />
                          1 exchange
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-2xl font-bold text-primary">85</div>
                      <Badge variant="secondary" className="mt-1">
                        <Award className="h-3 w-3 mr-1" />
                        points
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 8th Place - James Wilson */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.65 }}
            >
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-border hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0 w-12 flex items-center justify-center">
                      <span className="text-xl font-bold text-muted-foreground">#8</span>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl">
                        👨‍🎓
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold truncate">James Wilson</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          2 connections
                        </span>
                        <span className="flex items-center gap-1">
                          <Handshake className="h-3.5 w-3.5" />
                          1 exchange
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-2xl font-bold text-primary">65</div>
                      <Badge variant="secondary" className="mt-1">
                        <Award className="h-3 w-3 mr-1" />
                        points
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* How Points Work */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12"
          >
            <Card className="bg-gradient-to-br from-muted/50 to-muted/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  How to Earn Points
                </CardTitle>
                <CardDescription>
                  Build a stronger community and climb the leaderboard!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Make Connections</p>
                      <p className="text-sm text-muted-foreground">
                        Earn <span className="font-bold text-primary">10 points</span> for each new neighbor connection
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Handshake className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Complete Exchanges</p>
                      <p className="text-sm text-muted-foreground">
                        Earn <span className="font-bold text-secondary">20 points</span> for each skill or item exchange
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Award className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Stay Active</p>
                      <p className="text-sm text-muted-foreground">
                        Earn <span className="font-bold text-accent">5 points</span> for meaningful messages
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
