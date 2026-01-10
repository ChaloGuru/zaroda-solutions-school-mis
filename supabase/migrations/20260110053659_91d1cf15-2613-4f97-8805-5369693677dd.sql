-- Create sports events table
CREATE TABLE public.sports_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('athletics', 'ball_games', 'music', 'other')),
  event_type TEXT NOT NULL, -- e.g., '100m', 'football', 'choir', etc.
  event_date DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create athletes/participants table
CREATE TABLE public.sports_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id),
  student_name TEXT NOT NULL,
  admission_number TEXT,
  grade TEXT,
  stream TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  date_of_birth DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create performance records table
CREATE TABLE public.sports_performances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.sports_events(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.sports_participants(id) ON DELETE CASCADE,
  performance_value TEXT NOT NULL, -- time, score, position, etc.
  performance_numeric DECIMAL, -- for sorting (time in seconds, points, etc.)
  position INTEGER, -- final position/rank
  is_best BOOLEAN DEFAULT false,
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teams table for ball games
CREATE TABLE public.sports_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id),
  name TEXT NOT NULL,
  sport TEXT NOT NULL, -- football, basketball, volleyball, etc.
  category TEXT, -- e.g., U14, U16, Senior
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team members table
CREATE TABLE public.sports_team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.sports_teams(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.sports_participants(id) ON DELETE CASCADE,
  jersey_number INTEGER,
  position TEXT, -- goalkeeper, striker, etc.
  is_captain BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create matches table for ball games
CREATE TABLE public.sports_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.sports_events(id) ON DELETE CASCADE,
  home_team_id UUID REFERENCES public.sports_teams(id),
  away_team_id UUID REFERENCES public.sports_teams(id),
  home_team_name TEXT,
  away_team_name TEXT,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  match_date TIMESTAMP WITH TIME ZONE,
  venue TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.sports_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sports_events
CREATE POLICY "Users can view events for their school" ON public.sports_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.school_id = sports_events.school_id)
  );

CREATE POLICY "School admins can manage events" ON public.sports_events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.school_id = sports_events.school_id)
    AND has_role(auth.uid(), 'school_admin')
  );

-- RLS Policies for sports_participants
CREATE POLICY "Users can view participants for their school" ON public.sports_participants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.school_id = sports_participants.school_id)
  );

CREATE POLICY "School admins can manage participants" ON public.sports_participants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.school_id = sports_participants.school_id)
    AND has_role(auth.uid(), 'school_admin')
  );

-- RLS Policies for sports_performances
CREATE POLICY "Users can view performances for their school" ON public.sports_performances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      JOIN sports_events e ON e.school_id = p.school_id
      WHERE p.user_id = auth.uid() AND e.id = sports_performances.event_id
    )
  );

CREATE POLICY "School admins can manage performances" ON public.sports_performances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      JOIN sports_events e ON e.school_id = p.school_id
      WHERE p.user_id = auth.uid() AND e.id = sports_performances.event_id
    )
    AND has_role(auth.uid(), 'school_admin')
  );

-- RLS Policies for sports_teams
CREATE POLICY "Users can view teams for their school" ON public.sports_teams
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.school_id = sports_teams.school_id)
  );

CREATE POLICY "School admins can manage teams" ON public.sports_teams
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.school_id = sports_teams.school_id)
    AND has_role(auth.uid(), 'school_admin')
  );

-- RLS Policies for sports_team_members
CREATE POLICY "Users can view team members for their school" ON public.sports_team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      JOIN sports_teams t ON t.school_id = p.school_id
      WHERE p.user_id = auth.uid() AND t.id = sports_team_members.team_id
    )
  );

CREATE POLICY "School admins can manage team members" ON public.sports_team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      JOIN sports_teams t ON t.school_id = p.school_id
      WHERE p.user_id = auth.uid() AND t.id = sports_team_members.team_id
    )
    AND has_role(auth.uid(), 'school_admin')
  );

-- RLS Policies for sports_matches
CREATE POLICY "Users can view matches for their school" ON public.sports_matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      JOIN sports_events e ON e.school_id = p.school_id
      WHERE p.user_id = auth.uid() AND e.id = sports_matches.event_id
    )
  );

CREATE POLICY "School admins can manage matches" ON public.sports_matches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      JOIN sports_events e ON e.school_id = p.school_id
      WHERE p.user_id = auth.uid() AND e.id = sports_matches.event_id
    )
    AND has_role(auth.uid(), 'school_admin')
  );

-- Create updated_at triggers
CREATE TRIGGER update_sports_events_updated_at
  BEFORE UPDATE ON public.sports_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sports_participants_updated_at
  BEFORE UPDATE ON public.sports_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sports_performances_updated_at
  BEFORE UPDATE ON public.sports_performances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sports_teams_updated_at
  BEFORE UPDATE ON public.sports_teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sports_matches_updated_at
  BEFORE UPDATE ON public.sports_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();