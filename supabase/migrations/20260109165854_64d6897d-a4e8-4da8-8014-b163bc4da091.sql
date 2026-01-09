-- Create enum for election position types
CREATE TYPE public.election_scope AS ENUM ('stream', 'category', 'whole_school');

-- Create election positions table
CREATE TABLE public.election_positions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    scope election_scope NOT NULL DEFAULT 'whole_school',
    category TEXT, -- For category-specific positions (ECDE, Primary, Junior)
    is_default BOOLEAN DEFAULT false,
    max_candidates INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create candidates table
CREATE TABLE public.election_candidates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    position_id UUID REFERENCES public.election_positions(id) ON DELETE CASCADE NOT NULL,
    student_name TEXT NOT NULL,
    student_id TEXT,
    grade TEXT,
    stream TEXT,
    manifesto TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create elections table (election events/sessions)
CREATE TABLE public.elections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create votes table
CREATE TABLE public.election_votes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    election_id UUID REFERENCES public.elections(id) ON DELETE CASCADE NOT NULL,
    position_id UUID REFERENCES public.election_positions(id) ON DELETE CASCADE NOT NULL,
    candidate_id UUID REFERENCES public.election_candidates(id) ON DELETE CASCADE NOT NULL,
    voter_identifier TEXT NOT NULL, -- Anonymized voter ID or hash
    voted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(election_id, position_id, voter_identifier)
);

-- Enable RLS on all tables
ALTER TABLE public.election_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for election_positions
CREATE POLICY "School admins can manage positions" ON public.election_positions
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.user_id = auth.uid() AND p.school_id = election_positions.school_id
    ) AND has_role(auth.uid(), 'school_admin')
);

CREATE POLICY "Users can view positions for their school" ON public.election_positions
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.user_id = auth.uid() AND p.school_id = election_positions.school_id
    )
);

-- RLS Policies for election_candidates
CREATE POLICY "School admins can manage candidates" ON public.election_candidates
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles p
        JOIN election_positions ep ON ep.school_id = p.school_id
        WHERE p.user_id = auth.uid() AND ep.id = election_candidates.position_id
    ) AND has_role(auth.uid(), 'school_admin')
);

CREATE POLICY "Users can view candidates for their school" ON public.election_candidates
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles p
        JOIN election_positions ep ON ep.school_id = p.school_id
        WHERE p.user_id = auth.uid() AND ep.id = election_candidates.position_id
    )
);

-- RLS Policies for elections
CREATE POLICY "School admins can manage elections" ON public.elections
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.user_id = auth.uid() AND p.school_id = elections.school_id
    ) AND has_role(auth.uid(), 'school_admin')
);

CREATE POLICY "Users can view elections for their school" ON public.elections
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.user_id = auth.uid() AND p.school_id = elections.school_id
    )
);

-- RLS Policies for votes
CREATE POLICY "Users can cast votes" ON public.election_votes
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles p
        JOIN elections e ON e.school_id = p.school_id
        WHERE p.user_id = auth.uid() AND e.id = election_votes.election_id AND e.is_active = true
    )
);

CREATE POLICY "School admins can view vote counts" ON public.election_votes
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles p
        JOIN elections e ON e.school_id = p.school_id
        WHERE p.user_id = auth.uid() AND e.id = election_votes.election_id
    ) AND has_role(auth.uid(), 'school_admin')
);

-- Create triggers for updated_at
CREATE TRIGGER update_election_positions_updated_at
BEFORE UPDATE ON public.election_positions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_election_candidates_updated_at
BEFORE UPDATE ON public.election_candidates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_elections_updated_at
BEFORE UPDATE ON public.elections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();