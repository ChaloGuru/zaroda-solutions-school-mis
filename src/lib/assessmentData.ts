export type ScoringType = 'ee_me_ae_be' | 'cat_endterm';

export interface SubStrand {
  name: string;
  details?: string[];
}

export interface Strand {
  number: number;
  theme: string;
  subStrands: SubStrand[];
}

export interface SubjectAssessment {
  subject: string;
  scoringType: ScoringType;
  strands: Strand[];
}

export interface TermAssessment {
  term: number;
  subjects: SubjectAssessment[];
}

export interface GradeAssessment {
  grade: string;
  terms: TermAssessment[];
}

const playgroupAssessment: GradeAssessment = {
  grade: 'Playgroup',
  terms: [
    {
      term: 1,
      subjects: [
        {
          subject: 'Mathematics Activities',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'Mathematics Activities',
              subStrands: [
                { name: 'Recognize number 1-5' },
                { name: 'Colouring in the margin' },
                { name: 'Rote count 1-10' },
                { name: 'Pattern' },
                { name: 'Sorting and grouping' },
              ],
            },
          ],
        },
        {
          subject: 'Language Activities',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'Language Activities',
              subStrands: [
                { name: 'Recognize sounds' },
                { name: 'Eye-hand co-ordination skills' },
                { name: 'Colouring sound' },
                { name: 'Auditory memory' },
                { name: 'Self-expression' },
                { name: 'Carving for books' },
                { name: 'Writing posture' },
              ],
            },
          ],
        },
        {
          subject: 'Creative Activities',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'Creative Activities',
              subStrands: [
                { name: 'Hold writing instruments' },
                { name: 'Drawing' },
                { name: 'Scribbling and doodling' },
                { name: 'Colouring in the margin' },
                { name: 'Modelling painting' },
                { name: 'Printing' },
              ],
            },
          ],
        },
        {
          subject: 'CRE',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'CRE',
              subStrands: [
                { name: "Knowing God's name" },
                { name: "God's creating" },
                { name: 'Myself' },
                { name: 'My family' },
                { name: 'Prayer' },
                { name: 'Bible' },
                { name: 'Sing songs' },
                { name: 'Bible stories' },
              ],
            },
          ],
        },
        {
          subject: 'Music Activities',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'Music Activities',
              subStrands: [
                { name: 'Musical rhythms' },
                { name: 'Singing games' },
              ],
            },
          ],
        },
        {
          subject: 'Environmental Activities',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'Environmental Activities',
              subStrands: [
                { name: 'Dressing' },
                { name: 'Turn pages in a book' },
                { name: 'Hold writing instruments' },
                { name: 'Toilet training' },
                { name: 'Washing hands' },
                { name: 'Cleaning the nose' },
                { name: 'Feeding self' },
                { name: 'Gross motor skills' },
                { name: 'Walk in the line' },
                { name: 'Walk backwards' },
                { name: 'Throwing objects' },
                { name: 'Catch a large ball' },
                { name: 'Jump with two feet' },
                { name: 'Kick the ball' },
                { name: 'Sliding' },
                { name: 'Climbing' },
              ],
            },
          ],
        },
        {
          subject: 'Emotional Development',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'Emotional Development',
              subStrands: [
                { name: 'Temper turns' },
                { name: 'Show empathy' },
                { name: 'Turn taking' },
                { name: "Understanding both own and other's emotions" },
              ],
            },
          ],
        },
        {
          subject: 'Social Development',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'Social Development',
              subStrands: [
                { name: 'Interaction with other children' },
                { name: 'Developing friendship' },
                { name: 'Tattles when wronged' },
                { name: 'Sharing' },
                { name: 'Co-operative play' },
              ],
            },
          ],
        },
        {
          subject: 'Outdoor Activities',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'Outdoor Activities',
              subStrands: [
                { name: 'Pool safety and hygiene' },
                { name: 'Water orientation' },
                { name: 'Use of safety materials' },
              ],
            },
          ],
        },
      ],
    },
    {
      term: 2,
      subjects: [
        { subject: 'Mathematics Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Language Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Creative Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'CRE', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Music Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Environmental Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Emotional Development', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Social Development', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Outdoor Activities', scoringType: 'ee_me_ae_be', strands: [] },
      ],
    },
    {
      term: 3,
      subjects: [
        { subject: 'Mathematics Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Language Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Creative Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'CRE', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Music Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Environmental Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Emotional Development', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Social Development', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Outdoor Activities', scoringType: 'ee_me_ae_be', strands: [] },
      ],
    },
  ],
};

const pp1Assessment: GradeAssessment = {
  grade: 'PP1',
  terms: [
    {
      term: 1,
      subjects: [
        {
          subject: 'Mathematics Activities',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'MYSELF',
              subStrands: [
                { name: 'Pre-Number Activities', details: ['Sorting and grouping', 'Matching and pairing', 'Ordering', 'Patterns'] },
              ],
            },
            {
              number: 2,
              theme: 'MY FAMILY',
              subStrands: [
                { name: 'Numbers', details: ['Rote counting', 'Number recognition', 'Capacity'] },
              ],
            },
          ],
        },
        {
          subject: 'English Language Activities',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'GREETINGS AND FAREWELL',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Greeting and farewell' },
                { name: 'Reading - Readiness' },
                { name: 'Writing' },
                { name: 'Print awareness' },
              ],
            },
            {
              number: 2,
              theme: 'MYSELF',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Self-awareness' },
                { name: 'Listening for enjoyment' },
                { name: 'Reading – book handling' },
                { name: 'Reading posture' },
                { name: 'Writing - posture' },
                { name: 'Prewriting skills' },
              ],
            },
            {
              number: 3,
              theme: 'MY FAMILY',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Active Listening' },
                { name: 'Self-expression' },
                { name: 'Polite Language' },
                { name: 'Reading' },
                { name: 'Phonic awareness' },
                { name: 'Writing – eye hand coordination' },
              ],
            },
          ],
        },
        {
          subject: 'Environmental Activities',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'MYSELF',
              subStrands: [
                { name: 'Self-awareness' },
                { name: 'External body parts' },
                { name: 'Hand washing' },
                { name: 'Brushing teeth' },
              ],
            },
            {
              number: 2,
              theme: 'MY FAMILY',
              subStrands: [
                { name: 'Family members' },
              ],
            },
          ],
        },
        {
          subject: 'Christian Religious Education Activities',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'CREATION',
              subStrands: [
                { name: 'Our God' },
                { name: 'God Our Creator' },
                { name: 'God our Loving father' },
              ],
            },
            {
              number: 2,
              theme: 'THE HOLY BIBLE',
              subStrands: [
                { name: 'Bible as a Holy Book' },
              ],
            },
          ],
        },
        {
          subject: 'Creative Arts Activities',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'MYSELF',
              subStrands: [
                { name: 'Scribbling' },
                { name: 'Action songs' },
                { name: 'Play activities' },
                { name: 'Printing', details: ['Hand printing', 'Foot printing'] },
                { name: 'Singing game' },
              ],
            },
            {
              number: 2,
              theme: 'MY FAMILY',
              subStrands: [
                { name: 'Colouring' },
                { name: 'Recite simple rhymes' },
                { name: 'Movement' },
                { name: 'Joining Dots' },
                { name: 'Singing game' },
              ],
            },
          ],
        },
      ],
    },
    {
      term: 2,
      subjects: [
        { subject: 'Mathematics Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'English Language Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Environmental Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Christian Religious Education Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Creative Arts Activities', scoringType: 'ee_me_ae_be', strands: [] },
      ],
    },
    {
      term: 3,
      subjects: [
        { subject: 'Mathematics Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'English Language Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Environmental Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Christian Religious Education Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Creative Arts Activities', scoringType: 'ee_me_ae_be', strands: [] },
      ],
    },
  ],
};

const pp2Assessment: GradeAssessment = {
  grade: 'PP2',
  terms: [
    {
      term: 1,
      subjects: [
        {
          subject: 'Mathematics Activities',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'OUR NEIGHBOURHOOD',
              subStrands: [
                { name: 'Pre-Number Activities', details: ['Sorting and grouping', 'Matching and pairing', 'Ordering', 'Patterns'] },
              ],
            },
            {
              number: 2,
              theme: 'OUR SCHOOL',
              subStrands: [
                { name: 'Numbers', details: ['Rote counting', 'Number recognition', 'Capacity'] },
              ],
            },
          ],
        },
        {
          subject: 'English Language Activities',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'GREETINGS AND FAREWELL',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Greeting and farewell' },
                { name: 'Reading - Readiness' },
                { name: 'Writing' },
              ],
            },
            {
              number: 2,
              theme: 'OUR NEIGHBOURHOOD',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Listening for comprehension' },
                { name: 'News telling' },
                { name: 'Reading – book handling' },
                { name: 'Reading readiness' },
                { name: 'Letter recognition' },
                { name: 'Writing – letter writing and practice' },
              ],
            },
            {
              number: 3,
              theme: 'OUR SCHOOL',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Active Listening' },
                { name: 'Self-expression' },
                { name: 'Reading - Print awareness and reading syllables' },
                { name: 'Writing – drawing pictures and writing syllables' },
              ],
            },
          ],
        },
        {
          subject: 'Environmental Activities',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'MYSELF',
              subStrands: [
                { name: 'External body parts and their uses' },
                { name: 'Cleaning the nose' },
                { name: 'Dressing' },
              ],
            },
            {
              number: 2,
              theme: 'OUR FAMILY',
              subStrands: [
                { name: 'Food eaten' },
              ],
            },
          ],
        },
        {
          subject: 'Christian Religious Education Activities',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'CREATION',
              subStrands: [
                { name: 'Our God' },
                { name: 'God Our Creator' },
                { name: 'God our Loving father' },
              ],
            },
            {
              number: 2,
              theme: 'THE HOLY BIBLE',
              subStrands: [
                { name: 'Bible as a Holy Book' },
              ],
            },
          ],
        },
        {
          subject: 'Creative Arts Activities',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'CREATIVE ARTS',
              subStrands: [
                { name: 'Scribbling' },
                { name: 'Colouring' },
                { name: 'Printing' },
                { name: 'Singing game' },
                { name: 'Movement' },
                { name: 'Joining Dots' },
              ],
            },
          ],
        },
      ],
    },
    {
      term: 2,
      subjects: [
        { subject: 'Mathematics Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'English Language Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Environmental Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Christian Religious Education Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Creative Arts Activities', scoringType: 'ee_me_ae_be', strands: [] },
      ],
    },
    {
      term: 3,
      subjects: [
        { subject: 'Mathematics Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'English Language Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Environmental Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Christian Religious Education Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Creative Arts Activities', scoringType: 'ee_me_ae_be', strands: [] },
      ],
    },
  ],
};

const grade1Assessment: GradeAssessment = {
  grade: 'Grade 1',
  terms: [
    {
      term: 1,
      subjects: [
        {
          subject: 'Mathematics Activities',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'NUMBERS',
              subStrands: [
                { name: 'Pre-number activities', details: ['Sorting and grouping, matching'] },
                { name: 'Whole Numbers' },
                { name: 'Addition' },
                { name: 'Subtraction' },
              ],
            },
            {
              number: 2,
              theme: 'MEASUREMENT',
              subStrands: [
                { name: 'Length' },
                { name: 'Mass' },
                { name: 'Capacity' },
                { name: 'Time', details: ['Days of the week', 'Relation of days of the week & activities', 'Months of the year'] },
                { name: 'Money', details: ['Kenyan currency coins and notes', 'Counting coins', 'Using money to buy'] },
              ],
            },
            {
              number: 3,
              theme: 'GEOMETRY',
              subStrands: [
                { name: 'Lines' },
                { name: 'Shapes' },
              ],
            },
          ],
        },
        {
          subject: 'English Language Activities',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'WELCOME AND GREETINGS',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Language use' },
                { name: 'Writing' },
              ],
            },
            {
              number: 2,
              theme: 'SCHOOL',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Language use' },
                { name: 'Writing' },
              ],
            },
            {
              number: 3,
              theme: 'FAMILY',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Language use' },
                { name: 'Writing' },
              ],
            },
            {
              number: 4,
              theme: 'HOME',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Language use' },
                { name: 'Writing' },
              ],
            },
            {
              number: 5,
              theme: 'TIME',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Language use' },
                { name: 'Writing' },
              ],
            },
          ],
        },
        {
          subject: 'Kiswahili',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'DARASANI',
              subStrands: [
                { name: 'Kusikiliza na kuzungumza' },
                { name: 'Kusoma' },
                { name: 'Sarufi' },
                { name: 'Kuandika' },
              ],
            },
            {
              number: 2,
              theme: 'FAMILIA',
              subStrands: [
                { name: 'Kusikiliza na kuzungumza' },
                { name: 'Kusoma' },
                { name: 'Sarufi' },
                { name: 'Kuandika' },
              ],
            },
            {
              number: 3,
              theme: 'TARAKIMU',
              subStrands: [
                { name: 'Kusikiliza na kuzungumza' },
                { name: 'Kusoma' },
                { name: 'Sarufi' },
                { name: 'Kuandika' },
              ],
            },
            {
              number: 4,
              theme: 'SIKU ZA WIKI',
              subStrands: [
                { name: 'Kusikiliza na kuzungumza' },
                { name: 'Kusoma' },
                { name: 'Sarufi' },
                { name: 'Kuandika' },
              ],
            },
          ],
        },
        {
          subject: 'Indigenous Language Activities',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'THE HOME',
              subStrands: [
                { name: 'Listening and speaking (Instruction)' },
                { name: 'Reading (Picture reading)' },
                { name: 'Writing (Letters of alphabet)' },
              ],
            },
            {
              number: 2,
              theme: 'THE SCHOOL',
              subStrands: [
                { name: 'Listening and speaking (Word formation)' },
                { name: 'Reading (reading words)' },
                { name: 'Writing – handwriting' },
              ],
            },
          ],
        },
        {
          subject: 'Environmental Activities',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'SOCIAL ENVIRONMENT',
              subStrands: [
                { name: 'Cleaning my body', details: ['Materials for cleaning body parts', 'Cleaning different body parts'] },
                { name: 'Our home', details: ['Materials for cleaning the home', 'Common accidents at home', 'Cleaning the home'] },
                { name: 'Family needs', details: ['Basic needs', 'Physical needs', 'Categories of foods from plants & animals', 'Selecting suitable foods'] },
              ],
            },
          ],
        },
        {
          subject: 'Christian Religious Education Activities',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'CREATION',
              subStrands: [
                { name: 'Self-awareness', details: ['Identifying their uniqueness', 'Stating their gender'] },
                { name: 'My family', details: ['Naming members of the family', 'Praying with family', 'Items shared at home'] },
                { name: 'Creation of plants and animals', details: ['Naming plants and animals', 'Keeping the home environment clean'] },
              ],
            },
            {
              number: 2,
              theme: 'THE HOLY BIBLE',
              subStrands: [
                { name: 'The word of God', details: ['Ways of handling the bible', 'The two divisions of the bible', 'First two books of the New Testament'] },
              ],
            },
          ],
        },
        {
          subject: 'Creative Arts Activities',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'CREATION AND EXECUTING',
              subStrands: [
                { name: 'Jumping', details: ['Jump for height and distance'] },
                { name: 'Imitating sounds' },
                { name: 'Rhythm', details: ['Beat', 'Body percussion', 'Body percussion accompaniment'] },
                { name: 'Drawing', details: ['Lines, straight, wavy, zigzag and curved lines', 'Direction: vertical, diagonal and horizontal'] },
                { name: 'Stretching', details: ['Body parts involved in stretching', 'Performing stretching'] },
                { name: 'Making toys for playing games' },
                { name: 'Painting and coloring', details: ['Material (paper, fabric, paints, crayon)', 'Tool (sponge, palate, and brushes)'] },
                { name: 'Melody', details: ['Melodic sounds', 'Echoing melodic pattern'] },
              ],
            },
          ],
        },
      ],
    },
    {
      term: 2,
      subjects: [
        { subject: 'Mathematics Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'English Language Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Kiswahili', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Indigenous Language Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Environmental Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Christian Religious Education Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Creative Arts Activities', scoringType: 'cat_endterm', strands: [] },
      ],
    },
    {
      term: 3,
      subjects: [
        { subject: 'Mathematics Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'English Language Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Kiswahili', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Indigenous Language Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Environmental Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Christian Religious Education Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Creative Arts Activities', scoringType: 'cat_endterm', strands: [] },
      ],
    },
  ],
};

const grade2Assessment: GradeAssessment = {
  grade: 'Grade 2',
  terms: [
    {
      term: 1,
      subjects: [
        {
          subject: 'Mathematics Activities',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'NUMBERS',
              subStrands: [
                { name: 'Number concept' },
                { name: 'Whole Numbers' },
                { name: 'Addition' },
                { name: 'Subtraction' },
                { name: 'Multiplication' },
                { name: 'Division' },
                { name: 'Fractions' },
              ],
            },
            {
              number: 2,
              theme: 'MEASUREMENT',
              subStrands: [
                { name: 'Length' },
                { name: 'Mass' },
                { name: 'Capacity' },
                { name: 'Time' },
                { name: 'Money' },
              ],
            },
            {
              number: 3,
              theme: 'GEOMETRY',
              subStrands: [
                { name: 'Lines' },
                { name: 'Shapes' },
              ],
            },
          ],
        },
        {
          subject: 'English Language Activities',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'SCHOOL',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Language use' },
                { name: 'Writing' },
              ],
            },
            {
              number: 2,
              theme: 'ACTIVITIES IN THE HOME',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Language use' },
                { name: 'Writing' },
              ],
            },
            {
              number: 3,
              theme: 'TRANSPORT',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Language use' },
                { name: 'Writing' },
              ],
            },
            {
              number: 4,
              theme: 'TIMES AND MONTHS OF THE YEAR',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Language use' },
                { name: 'Writing' },
              ],
            },
            {
              number: 5,
              theme: 'SHOPPING',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Language use' },
                { name: 'Writing' },
              ],
            },
          ],
        },
        {
          subject: 'Kiswahili',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'SHULENI',
              subStrands: [
                { name: 'Kusikiliza na kuzungumza' },
                { name: 'Kusoma' },
                { name: 'Sarufi' },
                { name: 'Kuandika' },
              ],
            },
            {
              number: 2,
              theme: 'HAKI ZANGU',
              subStrands: [
                { name: 'Kusikiliza na kuzungumza' },
                { name: 'Kusoma' },
                { name: 'Sarufi' },
                { name: 'Kuandika' },
              ],
            },
            {
              number: 3,
              theme: 'LISHE BORA',
              subStrands: [
                { name: 'Kusikiliza na kuzungumza' },
                { name: 'Kusoma' },
                { name: 'Sarufi' },
                { name: 'Kuandika' },
              ],
            },
            {
              number: 4,
              theme: 'USAFIRI',
              subStrands: [
                { name: 'Kusikiliza na kuzungumza' },
                { name: 'Kusoma' },
                { name: 'Sarufi' },
                { name: 'Kuandika' },
              ],
            },
          ],
        },
        {
          subject: 'Indigenous Language Activities',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'THINGS FOUND IN SCHOOL',
              subStrands: [
                { name: 'Listening and speaking (Instruction)' },
                { name: 'Reading (Picture reading)' },
                { name: 'Writing (names of items)' },
              ],
            },
            {
              number: 2,
              theme: 'ACTIVITIES AT SCHOOL',
              subStrands: [
                { name: 'Listening and speaking (riddles)' },
                { name: 'Reading' },
                { name: 'Writing' },
              ],
            },
          ],
        },
        {
          subject: 'Environmental Activities',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'SOCIAL ENVIRONMENT',
              subStrands: [
                { name: 'Cleaning my body' },
                { name: 'Our home' },
                { name: 'Family needs' },
              ],
            },
          ],
        },
        {
          subject: 'Christian Religious Education Activities',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'CREATION',
              subStrands: [
                { name: 'Self-awareness' },
                { name: 'My family' },
                { name: 'Creation of plants and animals' },
              ],
            },
            {
              number: 2,
              theme: 'THE HOLY BIBLE',
              subStrands: [
                { name: 'The word of God' },
              ],
            },
          ],
        },
        {
          subject: 'Creative Arts Activities',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'CREATION AND EXECUTING',
              subStrands: [
                { name: 'Jumping' },
                { name: 'Rhythm' },
                { name: 'Drawing' },
                { name: 'Painting and coloring' },
                { name: 'Melody' },
              ],
            },
          ],
        },
      ],
    },
    {
      term: 2,
      subjects: [
        { subject: 'Mathematics Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'English Language Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Kiswahili', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Indigenous Language Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Environmental Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Christian Religious Education Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Creative Arts Activities', scoringType: 'cat_endterm', strands: [] },
      ],
    },
    {
      term: 3,
      subjects: [
        { subject: 'Mathematics Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'English Language Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Kiswahili', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Indigenous Language Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Environmental Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Christian Religious Education Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Creative Arts Activities', scoringType: 'cat_endterm', strands: [] },
      ],
    },
  ],
};

const grade3Assessment: GradeAssessment = {
  grade: 'Grade 3',
  terms: [
    {
      term: 1,
      subjects: [
        {
          subject: 'Mathematics Activities',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'NUMBERS',
              subStrands: [
                { name: 'Number concept' },
                { name: 'Whole Numbers' },
                { name: 'Addition' },
                { name: 'Subtraction' },
                { name: 'Multiplication' },
                { name: 'Division' },
                { name: 'Fractions' },
              ],
            },
            {
              number: 2,
              theme: 'MEASUREMENT',
              subStrands: [
                { name: 'Length' },
                { name: 'Mass' },
                { name: 'Capacity' },
                { name: 'Time' },
                { name: 'Money' },
              ],
            },
            {
              number: 3,
              theme: 'GEOMETRY',
              subStrands: [
                { name: 'Lines' },
                { name: 'Shapes' },
              ],
            },
          ],
        },
        {
          subject: 'English Language Activities',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'ACTIVITIES AT HOME & SCHOOL',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Language use' },
                { name: 'Writing' },
              ],
            },
            {
              number: 2,
              theme: 'SHARING DUTIES & RESPONSIBILITIES',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Language use' },
                { name: 'Writing' },
              ],
            },
            {
              number: 3,
              theme: 'ETIQUETTE',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Language use' },
                { name: 'Writing' },
              ],
            },
            {
              number: 4,
              theme: 'CHILD RIGHTS',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Language use' },
                { name: 'Writing' },
              ],
            },
            {
              number: 5,
              theme: 'OCCUPATION',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Language use' },
                { name: 'Writing' },
              ],
            },
          ],
        },
        {
          subject: 'Kiswahili',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'UZALENDO',
              subStrands: [
                { name: 'Kusikiliza na kuzungumza' },
                { name: 'Kusoma' },
                { name: 'Sarufi' },
                { name: 'Kuandika' },
              ],
            },
            {
              number: 2,
              theme: 'SHAMBANI',
              subStrands: [
                { name: 'Kusikiliza na kuzungumza' },
                { name: 'Kusoma' },
                { name: 'Sarufi' },
                { name: 'Kuandika' },
              ],
            },
            {
              number: 3,
              theme: 'MIEZI YA MWAKA',
              subStrands: [
                { name: 'Kusikiliza na kuzungumza' },
                { name: 'Kusoma' },
                { name: 'Sarufi' },
                { name: 'Kuandika' },
              ],
            },
            {
              number: 4,
              theme: 'KAZI MBALIMBALI',
              subStrands: [
                { name: 'Kusikiliza na kuzungumza' },
                { name: 'Kusoma' },
                { name: 'Sarufi' },
                { name: 'Kuandika' },
              ],
            },
          ],
        },
        {
          subject: 'Indigenous Language Activities',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'INTRODUCING SELF & OTHERS',
              subStrands: [
                { name: 'Listening and speaking (Imitating expression)' },
                { name: 'Reading (Independent reading)' },
                { name: 'Writing (sentence formation)' },
              ],
            },
            {
              number: 2,
              theme: 'THE COMMUNITY',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Writing' },
              ],
            },
          ],
        },
        {
          subject: 'Environmental Activities',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'SOCIAL ENVIRONMENT',
              subStrands: [
                { name: 'Cleaning my body' },
                { name: 'Our home' },
                { name: 'Family needs' },
              ],
            },
          ],
        },
        {
          subject: 'Christian Religious Education Activities',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'CREATION',
              subStrands: [
                { name: 'Self-awareness' },
                { name: 'My family' },
              ],
            },
            {
              number: 2,
              theme: 'THE HOLY BIBLE',
              subStrands: [
                { name: 'The word of God' },
              ],
            },
          ],
        },
        {
          subject: 'Creative Arts Activities',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'CREATION AND EXECUTING',
              subStrands: [
                { name: 'Jumping' },
                { name: 'Rhythm' },
                { name: 'Drawing' },
                { name: 'Painting and coloring' },
                { name: 'Melody' },
              ],
            },
          ],
        },
      ],
    },
    {
      term: 2,
      subjects: [
        { subject: 'Mathematics Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'English Language Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Kiswahili', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Indigenous Language Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Environmental Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Christian Religious Education Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Creative Arts Activities', scoringType: 'cat_endterm', strands: [] },
      ],
    },
    {
      term: 3,
      subjects: [
        { subject: 'Mathematics Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'English Language Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Kiswahili', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Indigenous Language Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Environmental Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Christian Religious Education Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Creative Arts Activities', scoringType: 'cat_endterm', strands: [] },
      ],
    },
  ],
};

function createGrade4Subjects(scoringType: ScoringType): SubjectAssessment[] {
  return [
    { subject: 'Mathematics Activities', scoringType, strands: [] },
    { subject: 'English Language Activities', scoringType, strands: [] },
    { subject: 'Kiswahili', scoringType, strands: [] },
    { subject: 'Indigenous Language Activities', scoringType, strands: [] },
    { subject: 'Social Studies Activities', scoringType, strands: [] },
    { subject: 'Science & Technology Activities', scoringType, strands: [] },
    { subject: 'Agriculture & Nutrition Activities', scoringType, strands: [] },
    { subject: 'Creative Arts Activities', scoringType, strands: [] },
    { subject: 'Christian Religious Education Activities', scoringType, strands: [] },
  ];
}

const grade4Assessment: GradeAssessment = {
  grade: 'Grade 4',
  terms: [
    {
      term: 1,
      subjects: [
        {
          subject: 'Mathematics Activities',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'NUMBERS',
              subStrands: [
                { name: 'Whole Numbers', details: ['Place value', 'Reading and writing numbers', 'Ordering numbers', 'Rounding numbers', 'Factors of numbers', 'Using even and odd numbers', 'Rep. Hindu Arabic numbers using roman numbers', 'Making patterns'] },
                { name: 'Addition' },
                { name: 'Subtraction' },
                { name: 'Multiplication' },
                { name: 'Division' },
                { name: 'Fractions' },
              ],
            },
          ],
        },
        {
          subject: 'English Language Activities',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'THE FAMILY',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Grammar in use' },
                { name: 'Writing' },
              ],
            },
            {
              number: 2,
              theme: 'FAMILY CELEBRATIONS',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Grammar in use' },
                { name: 'Writing' },
              ],
            },
            {
              number: 3,
              theme: 'ETIQUETTE',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Grammar in use' },
                { name: 'Writing' },
              ],
            },
            {
              number: 4,
              theme: 'ACCIDENTS: FIRST AID',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Grammar in use' },
                { name: 'Writing' },
              ],
            },
            {
              number: 5,
              theme: 'NUTRITION- BALANCED DIET',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Grammar in use' },
                { name: 'Writing' },
              ],
            },
          ],
        },
        {
          subject: 'Kiswahili',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'NYUMBANI',
              subStrands: [
                { name: 'Kusikiliza na kuzungumza' },
                { name: 'Kusoma' },
                { name: 'Kuandika' },
                { name: 'Sarufi' },
              ],
            },
            {
              number: 2,
              theme: 'NIDHAMU MEZANI',
              subStrands: [
                { name: 'Kusikiliza na kuzungumza' },
                { name: 'Kusoma' },
                { name: 'Kuandika' },
                { name: 'Sarufi' },
              ],
            },
            {
              number: 3,
              theme: 'MAVAZI',
              subStrands: [
                { name: 'Kusikiliza na kuzungumza' },
                { name: 'Kusoma' },
                { name: 'Kuandika' },
                { name: 'Sarufi' },
              ],
            },
            {
              number: 4,
              theme: 'DIRA',
              subStrands: [
                { name: 'Kusikiliza na kuzungumza' },
                { name: 'Kusoma' },
                { name: 'Kuandika' },
                { name: 'Sarufi' },
              ],
            },
          ],
        },
        {
          subject: 'Indigenous Language Activities',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'CULTURAL FOODS',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Writing (Letters of alphabet)' },
              ],
            },
            {
              number: 2,
              theme: 'WEATHER',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Writing' },
              ],
            },
            {
              number: 3,
              theme: 'PERSONAL SAFETY',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Writing' },
              ],
            },
          ],
        },
        {
          subject: 'Social Studies Activities',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'NATURAL & BUILT ENVIRONMENTS',
              subStrands: [
                { name: 'Compass direction' },
                { name: 'Location & size of the county' },
                { name: 'Physical features in the county' },
                { name: 'Seasons in the county' },
                { name: 'Historic built environments in the county' },
              ],
            },
            {
              number: 2,
              theme: 'PEOPLE AND POPULATION',
              subStrands: [
                { name: 'Interdependence of people' },
                { name: 'Population distribution' },
              ],
            },
          ],
        },
        {
          subject: 'Science & Technology Activities',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'LIVING THINGS & THEIR ENVIRONMENT',
              subStrands: [
                { name: 'Plants', details: ['Characteristics of plants as living things', 'Functions of external parts of plants'] },
                { name: 'Animals', details: ['Characteristics of animals as living things', 'Vertebrates and invertebrates'] },
                { name: 'Human digestive system', details: ['Parts of the human digestive system', 'Healthy digestive system', 'Symptoms of unhealthy digestive system'] },
              ],
            },
          ],
        },
        {
          subject: 'Agriculture & Nutrition Activities',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'CONSERVATION OF RESOURCES',
              subStrands: [
                { name: 'Soil conservation', details: ['Materials for making compost manure', 'Preparing compost manure'] },
                { name: 'Water conservation', details: ['Drip irrigation'] },
                { name: 'Fuel conservation', details: ['Types of fuels used at home', 'Using and conserving fuels in cooking'] },
                { name: 'Conserving wild animals', details: ['Small wild animals that destroy crops', 'Constructing a scarecrow'] },
              ],
            },
            {
              number: 2,
              theme: 'FOOD PRODUCTION PROCESSES',
              subStrands: [
                { name: 'Direct sowing of tiny seeds', details: ['Crops grown through direct sowing', 'Sowing tiny seeds'] },
              ],
            },
          ],
        },
        {
          subject: 'Creative Arts Activities',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'CREATION & EXECUTING',
              subStrands: [
                { name: 'Percussion Musical instruments', details: ['Identifying: name, community, method of playing', 'Parts of percussion', 'Classifying melodic, non melodic'] },
                { name: 'Improvised rhythmic pattern' },
                { name: 'Making sticks (cutting, trimming, burning, cooling)' },
                { name: 'Tonal value – smudge technique' },
                { name: 'Netball', details: ['Passes', 'Catching (double handed)'] },
                { name: 'Macramé technique (overhand knot)' },
                { name: 'Painting and Montage', details: ['Colour classification', 'Colour value', 'Montage – subject matter, overlapping neatness'] },
                { name: 'Rhythm', details: ['Note values: crotchet, pair of quavers and their rests', 'French rhythm names'] },
              ],
            },
          ],
        },
        {
          subject: 'Christian Religious Education Activities',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'CREATION',
              subStrands: [
                { name: 'Creation stories' },
                { name: 'Responsibility over creation' },
              ],
            },
            {
              number: 2,
              theme: 'THE HOLY BIBLE',
              subStrands: [
                { name: 'Books of the Bible' },
              ],
            },
          ],
        },
      ],
    },
    { term: 2, subjects: createGrade4Subjects('cat_endterm') },
    { term: 3, subjects: createGrade4Subjects('cat_endterm') },
  ],
};

function createGrade5Subjects(scoringType: ScoringType): SubjectAssessment[] {
  return [
    { subject: 'Mathematics Activities', scoringType, strands: [] },
    { subject: 'English Language Activities', scoringType, strands: [] },
    { subject: 'Kiswahili', scoringType, strands: [] },
    { subject: 'Indigenous Language Activities', scoringType, strands: [] },
    { subject: 'Social Studies Activities', scoringType, strands: [] },
    { subject: 'Science & Technology Activities', scoringType, strands: [] },
    { subject: 'Agriculture & Nutrition Activities', scoringType, strands: [] },
    { subject: 'Creative Arts Activities', scoringType, strands: [] },
    { subject: 'Christian Religious Education Activities', scoringType, strands: [] },
  ];
}

const grade5Assessment: GradeAssessment = {
  grade: 'Grade 5',
  terms: [
    {
      term: 1,
      subjects: [
        {
          subject: 'Mathematics Activities',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'NUMBERS',
              subStrands: [
                { name: 'Whole Numbers', details: ['Use of total & place value', 'Number symbols', 'Reading and writing numbers', 'Ordering numbers', 'Rounding off numbers', 'Divisibility test', 'HCF, GCD & LCM'] },
                { name: 'Addition' },
                { name: 'Subtraction' },
                { name: 'Multiplication' },
                { name: 'Division' },
                { name: 'Fractions' },
                { name: 'Decimals' },
                { name: 'Simple equations' },
              ],
            },
          ],
        },
        {
          subject: 'English Language Activities',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'CHILD RIGHTS & RESPONSIBILITY',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Grammar in use' },
                { name: 'Writing' },
              ],
            },
            {
              number: 2,
              theme: 'NATIONAL CELEBRATIONS',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Grammar in use' },
                { name: 'Writing' },
              ],
            },
            {
              number: 3,
              theme: 'ETIQUETTE- TABLE MANNERS',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Grammar in use' },
                { name: 'Writing' },
              ],
            },
            {
              number: 4,
              theme: 'ROAD ACCIDENTS- PREVENTION',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Grammar in use' },
                { name: 'Writing' },
              ],
            },
            {
              number: 5,
              theme: 'TRADITIONAL FOODS',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Reading' },
                { name: 'Grammar in use' },
                { name: 'Writing' },
              ],
            },
          ],
        },
        {
          subject: 'Kiswahili',
          scoringType: 'ee_me_ae_be',
          strands: [
            { number: 1, theme: 'MAPISHI', subStrands: [{ name: 'Kusikiliza na kuzungumza' }, { name: 'Kusoma' }, { name: 'Kuandika' }, { name: 'Sarufi' }] },
            { number: 2, theme: 'HUDUMA YA KWANZA', subStrands: [{ name: 'Kusikiliza na kuzungumza' }, { name: 'Kusoma' }, { name: 'Kuandika' }, { name: 'Sarufi' }] },
            { number: 3, theme: 'MAPAMBO', subStrands: [{ name: 'Kusikiliza na kuzungumza' }, { name: 'Kusoma' }, { name: 'Kuandika' }, { name: 'Sarufi' }] },
            { number: 4, theme: 'SAA NA MAJIRA', subStrands: [{ name: 'Kusikiliza na kuzungumza' }, { name: 'Kusoma' }, { name: 'Kuandika' }, { name: 'Sarufi' }] },
          ],
        },
        {
          subject: 'Indigenous Language Activities',
          scoringType: 'ee_me_ae_be',
          strands: [
            { number: 1, theme: 'MY CULTURE- ATTIRE', subStrands: [{ name: 'Listening and speaking' }, { name: 'Reading' }, { name: 'Writing (Letters of alphabet)' }] },
            { number: 2, theme: 'ENVIRONMENTAL AWARENESS', subStrands: [{ name: 'Listening and speaking' }, { name: 'Reading' }, { name: 'Writing' }] },
          ],
        },
        { subject: 'Social Studies Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Science & Technology Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Agriculture & Nutrition Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Creative Arts Activities', scoringType: 'ee_me_ae_be', strands: [] },
        { subject: 'Christian Religious Education Activities', scoringType: 'ee_me_ae_be', strands: [] },
      ],
    },
    { term: 2, subjects: createGrade5Subjects('ee_me_ae_be') },
    { term: 3, subjects: createGrade5Subjects('ee_me_ae_be') },
  ],
};

function createGrade6Subjects(scoringType: ScoringType): SubjectAssessment[] {
  return [
    { subject: 'Mathematics Activities', scoringType, strands: [] },
    { subject: 'English Language Activities', scoringType, strands: [] },
    { subject: 'Kiswahili', scoringType, strands: [] },
    { subject: 'Indigenous Language Activities', scoringType, strands: [] },
    { subject: 'Social Studies Activities', scoringType, strands: [] },
    { subject: 'Science & Technology Activities', scoringType, strands: [] },
    { subject: 'Agriculture & Nutrition Activities', scoringType, strands: [] },
    { subject: 'Creative Arts Activities', scoringType, strands: [] },
    { subject: 'Christian Religious Education Activities', scoringType, strands: [] },
  ];
}

const grade6Assessment: GradeAssessment = {
  grade: 'Grade 6',
  terms: [
    {
      term: 1,
      subjects: [
        {
          subject: 'Mathematics Activities',
          scoringType: 'cat_endterm',
          strands: [
            {
              number: 1,
              theme: 'NUMBERS',
              subStrands: [
                { name: 'Whole Numbers', details: ['Place value & Total value', 'Number symbols', 'Reading and writing numbers', 'Ordering numbers', 'Rounding off numbers', 'Applying squares of whole numbers', 'Applying square roots of perfect squares'] },
                { name: 'Multiplication' },
                { name: 'Division' },
                { name: 'Fraction' },
                { name: 'Decimal' },
              ],
            },
          ],
        },
        {
          subject: 'English Language Activities',
          scoringType: 'cat_endterm',
          strands: [
            { number: 1, theme: 'CHILD LABOUR', subStrands: [{ name: 'Listening and speaking' }, { name: 'Reading' }, { name: 'Grammar in use' }, { name: 'Writing' }] },
            { number: 2, theme: 'CULTURAL & RELIGIOUS CELEBRATIONS', subStrands: [{ name: 'Listening and speaking' }, { name: 'Reading' }, { name: 'Grammar in use' }, { name: 'Writing' }] },
            { number: 3, theme: 'ETIQUETTE - TELEPHONE', subStrands: [{ name: 'Listening and speaking' }, { name: 'Reading' }, { name: 'Grammar in use' }, { name: 'Writing' }] },
            { number: 4, theme: 'EMERGENCY RESCUE SERVICES', subStrands: [{ name: 'Listening and speaking' }, { name: 'Reading' }, { name: 'Grammar in use' }, { name: 'Writing' }] },
            { number: 5, theme: 'OUR TOURIST ATTRACTIONS', subStrands: [{ name: 'Listening and speaking' }, { name: 'Reading' }, { name: 'Grammar in use' }, { name: 'Writing' }] },
          ],
        },
        {
          subject: 'Kiswahili',
          scoringType: 'cat_endterm',
          strands: [
            { number: 1, theme: 'VIUNGO VYA MWILI VYA NDANI', subStrands: [{ name: 'Kusikiliza na kuzungumza' }, { name: 'Kusoma' }, { name: 'Kuandika' }, { name: 'Sarufi' }] },
            { number: 2, theme: 'MICHEZO', subStrands: [{ name: 'Kusikiliza na kuzungumza' }, { name: 'Kusoma' }, { name: 'Kuandika' }, { name: 'Sarufi' }] },
            { number: 3, theme: 'MAHUSIANO', subStrands: [{ name: 'Kusikiliza na kuzungumza' }, { name: 'Kusoma' }, { name: 'Kuandika' }, { name: 'Sarufi' }] },
            { number: 4, theme: 'MISIMU', subStrands: [{ name: 'Kusikiliza na kuzungumza' }, { name: 'Kusoma' }, { name: 'Kuandika' }, { name: 'Sarufi' }] },
          ],
        },
        {
          subject: 'Indigenous Language Activities',
          scoringType: 'cat_endterm',
          strands: [
            { number: 1, theme: 'CEREMONIES & FESTIVALS', subStrands: [{ name: 'Listening and speaking' }, { name: 'Reading' }, { name: 'Writing' }] },
            { number: 2, theme: 'ENVIRONMENTAL CONSERVATION', subStrands: [{ name: 'Listening and speaking' }, { name: 'Reading' }, { name: 'Writing' }] },
          ],
        },
        { subject: 'Social Studies Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Science & Technology Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Agriculture & Nutrition Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Creative Arts Activities', scoringType: 'cat_endterm', strands: [] },
        { subject: 'Christian Religious Education Activities', scoringType: 'cat_endterm', strands: [] },
      ],
    },
    { term: 2, subjects: createGrade6Subjects('cat_endterm') },
    { term: 3, subjects: createGrade6Subjects('cat_endterm') },
  ],
};

function createJSSSubjects(scoringType: ScoringType): SubjectAssessment[] {
  return [
    { subject: 'Mathematics', scoringType, strands: [] },
    { subject: 'English Language', scoringType, strands: [] },
    { subject: 'Kiswahili', scoringType, strands: [] },
    { subject: 'Social Studies', scoringType, strands: [] },
    { subject: 'Integrated Science', scoringType, strands: [] },
    { subject: 'Agriculture & Nutrition', scoringType, strands: [] },
    { subject: 'Creative Arts', scoringType, strands: [] },
    { subject: 'Pre-Technical Studies', scoringType, strands: [] },
    { subject: 'Christian Religious Education', scoringType, strands: [] },
  ];
}

const grade7Assessment: GradeAssessment = {
  grade: 'Grade 7',
  terms: [
    {
      term: 1,
      subjects: [
        {
          subject: 'Mathematics',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'NUMBERS',
              subStrands: [
                { name: 'Whole Numbers', details: ['Place value and total value', 'Reading and writing numbers', 'Rounding off numbers', 'Classifying numbers', 'Number sequence'] },
                { name: 'Factors' },
                { name: 'Fractions' },
                { name: 'Decimals' },
                { name: 'Squares and square root' },
              ],
            },
            {
              number: 2,
              theme: 'ALGEBRA',
              subStrands: [
                { name: 'Algebraic expressions' },
              ],
            },
          ],
        },
        {
          subject: 'English Language',
          scoringType: 'ee_me_ae_be',
          strands: [
            { number: 1, theme: 'PERSONAL RESPONSIBILITY', subStrands: [{ name: 'Listening and speaking' }, { name: 'Reading (extensive & intensive)' }, { name: 'Grammar in use' }, { name: 'Writing' }] },
            { number: 2, theme: 'SCIENCE & HEALTH EDUCATION', subStrands: [{ name: 'Listening and speaking' }, { name: 'Reading (extensive & intensive)' }, { name: 'Grammar in use' }, { name: 'Writing' }] },
            { number: 3, theme: 'HYGIENE', subStrands: [{ name: 'Listening and speaking' }, { name: 'Reading (extensive & intensive)' }, { name: 'Grammar in use' }, { name: 'Writing' }] },
            { number: 4, theme: 'LEADERSHIP', subStrands: [{ name: 'Listening and speaking' }, { name: 'Reading (extensive & intensive)' }, { name: 'Grammar in use' }, { name: 'Writing' }] },
            { number: 5, theme: 'FAMILY', subStrands: [{ name: 'Listening and speaking' }, { name: 'Reading (extensive & intensive)' }, { name: 'Grammar in use' }, { name: 'Writing' }] },
          ],
        },
        {
          subject: 'Kiswahili',
          scoringType: 'ee_me_ae_be',
          strands: [
            { number: 1, theme: 'USAFI WA KIBINAFSI', subStrands: [{ name: 'Kusikiliza na kuzungumza' }, { name: 'Kusoma' }, { name: 'Kuandika' }, { name: 'Sarufi' }] },
            { number: 2, theme: 'LISHE BORA', subStrands: [{ name: 'Kusikiliza na kuzungumza' }, { name: 'Kusoma' }, { name: 'Kuandika' }, { name: 'Sarufi' }] },
            { number: 3, theme: 'UHURU WA WANYAMA', subStrands: [{ name: 'Kusikiliza na kuzungumza' }, { name: 'Kusoma' }, { name: 'Kuandika' }, { name: 'Sarufi' }] },
            { number: 4, theme: 'AINA ZA MALIASILI', subStrands: [{ name: 'Kusikiliza na kuzungumza' }, { name: 'Kusoma' }, { name: 'Kuandika' }, { name: 'Sarufi' }] },
            { number: 5, theme: 'UNYANYASAJI WA KIJINSIA', subStrands: [{ name: 'Kusikiliza na kuzungumza' }, { name: 'Kusoma' }, { name: 'Kuandika' }, { name: 'Sarufi' }] },
          ],
        },
        {
          subject: 'Social Studies',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'SOCIAL STUDIES PERSONAL DEVELOPMENT',
              subStrands: [
                { name: 'Self-exploration' },
                { name: 'Entrepreneurial opportunities in SST' },
              ],
            },
            {
              number: 2,
              theme: 'PEOPLE AND POPULATION',
              subStrands: [
                { name: 'Human origin' },
                { name: 'Early civilization' },
                { name: 'Slavery and servitude' },
                { name: 'Socio-economic org. of selected African communities' },
                { name: 'Origin of money' },
                { name: 'Human diversity & interpersonal relationships' },
                { name: 'Peaceful conflict resolution' },
              ],
            },
          ],
        },
        {
          subject: 'Integrated Science',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'SCIENTIFIC INVESTIGATION',
              subStrands: [
                { name: 'Introduction to integrated science', details: ['Components of integrated science', 'Importance of science in daily life'] },
                { name: 'Laboratory safety', details: ['Common hazards & their symbols in the laboratory', 'Common accidents in the laboratory', 'Safety measures in the laboratory'] },
                { name: 'Laboratory apparatus & instruments', details: ['Basic skills in science', 'Laboratory instrument & apparatus', 'S.I Units'] },
              ],
            },
          ],
        },
        {
          subject: 'Agriculture & Nutrition',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'CONSERVATION OF RESOURCES',
              subStrands: [
                { name: 'Controlling soil pollution', details: ['Causes of soil pollution in gardening', 'Controlling soil pollution'] },
                { name: 'Constructing water retention structures', details: ['Surface run off in gardening', 'Constructing water retention structures'] },
                { name: 'Conserving nutrients', details: ['Ways of conserving vitamins & mineral salts in vegetables', 'Conserve nutrients in vegetables'] },
                { name: 'Growing trees', details: ['Importance of trees in conserving the environment', 'Planting trees'] },
              ],
            },
            {
              number: 2,
              theme: 'FOOD PRODUCTION PROCESSES',
              subStrands: [
                { name: 'Preparing planting site & establishing crop', details: ['Preparing a suitable tilth'] },
              ],
            },
          ],
        },
        {
          subject: 'Creative Arts',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'FOUNDATIONS OF CA&S',
              subStrands: [
                { name: 'Introduction to CA&S', details: ['Categories of CA&S', 'Relationship among categories of CA&S', 'Creating a chart on categories of CA&S'] },
                { name: 'Components of CA&S', details: ['Elements & principles of art', 'Elements of a story', 'Coordination, strength & physical fitness', 'Rhythm & pitch in music'] },
              ],
            },
            {
              number: 2,
              theme: 'CREATING & PERFORMING CA&S',
              subStrands: [
                { name: 'Drawing and painting', details: ['Drawing lines, tone and balance', 'Painting cool/warm colours'] },
                { name: 'Values and rests' },
                { name: 'Variation of note' },
                { name: 'Body movements' },
                { name: 'French rhythm names' },
                { name: 'Athletics', details: ['Javelin appearance', 'Carving a javelin', 'Javelin throw'] },
                { name: 'Melody', details: ['Qualities of a good melody', 'Melodies in G major', 'Melody in C major'] },
                { name: 'Handball', details: ['Passes', 'Dribbling', 'Jump shot'] },
              ],
            },
          ],
        },
        {
          subject: 'Pre-Technical Studies',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'FOUNDATION OF PRETECH STUD.',
              subStrands: [
                { name: 'Introduction to Pretech studies', details: ['Components of Pretechnical studies', 'Role of Pretechnical studies'] },
                { name: 'Safety in the work environment', details: ['Potential safety threat in a work environment', 'Safety rules & regulations in the work environment'] },
                { name: 'Computer concepts', details: ['Characteristics of a computer', 'Classifying computers', 'Use of a computer to perform a task', 'ICT tools used in communication'] },
                { name: 'Introduction to drawing', details: ['Importance of drawing as a means of communication', 'Difference between artistic & technical drawings', 'Printing numbers and letters', 'Drawing types of lines', 'Symbols and abbreviations used in drawing'] },
              ],
            },
          ],
        },
        {
          subject: 'Christian Religious Education',
          scoringType: 'ee_me_ae_be',
          strands: [
            { number: 1, theme: 'C.R.E', subStrands: [{ name: 'Importance of studying CRE' }] },
            {
              number: 2,
              theme: 'CREATION',
              subStrands: [
                { name: 'Accounts of creation' },
                { name: 'Stewardship over creation' },
                { name: 'Responsibility over plants' },
                { name: 'Uses of natural resources' },
              ],
            },
            {
              number: 3,
              theme: 'THE BIBLE',
              subStrands: [
                { name: 'Functions of the bible' },
                { name: 'Divisions of the bible' },
                { name: 'Bible translations' },
              ],
            },
          ],
        },
      ],
    },
    { term: 2, subjects: createJSSSubjects('ee_me_ae_be') },
    { term: 3, subjects: createJSSSubjects('ee_me_ae_be') },
  ],
};

const grade8Assessment: GradeAssessment = {
  grade: 'Grade 8',
  terms: [
    {
      term: 1,
      subjects: [
        {
          subject: 'Mathematics',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'NUMBERS',
              subStrands: [
                { name: 'Integers', details: ['Integers in different situations', 'Representing integers in a number line', 'Operations involving addition & subtraction of integers'] },
                { name: 'Fractions' },
                { name: 'Decimals' },
                { name: 'Squares and square roots' },
                { name: 'Rate, ratio, proportions & percentages' },
              ],
            },
            {
              number: 2,
              theme: 'ALGEBRA',
              subStrands: [
                { name: 'Algebraic expressions' },
                { name: 'Linear equations' },
              ],
            },
          ],
        },
        {
          subject: 'English Language',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'HUMAN RIGHTS',
              subStrands: [
                { name: 'Listening and speaking' },
                { name: 'Polite language / Telephone etiquette' },
                { name: 'Reading' },
                { name: 'Extensive reading: independent reading' },
                { name: 'Grammar in use', details: ['Word clauses', 'Compound nouns'] },
                { name: 'Reading: Intensive reading; short stories' },
                { name: 'Writing', details: ['Writing legibly and neatly'] },
              ],
            },
            { number: 2, theme: 'SCIENTIFIC INNOVATIONS', subStrands: [{ name: 'Listening and speaking' }, { name: 'Oral presentation: songs' }, { name: 'Reading (extensive & intensive) poem' }, { name: 'Grammar in use' }, { name: 'Writing' }] },
            { number: 3, theme: 'POLLUTION', subStrands: [{ name: 'Listening and speaking' }, { name: 'Reading (extensive & intensive)' }, { name: 'Grammar in use' }, { name: 'Writing' }] },
            { number: 4, theme: 'CONSUMER ROLES & RESPONSIBILITIES', subStrands: [{ name: 'Listening and speaking' }, { name: 'Reading (extensive & intensive)' }, { name: 'Grammar in use' }, { name: 'Writing' }] },
            { number: 5, theme: 'RELATIONSHIPS: PEERS', subStrands: [{ name: 'Listening and speaking' }, { name: 'Reading (extensive & intensive)' }, { name: 'Grammar in use' }, { name: 'Writing' }] },
          ],
        },
        {
          subject: 'Kiswahili',
          scoringType: 'ee_me_ae_be',
          strands: [
            { number: 1, theme: 'USAFI WA SEHEMU ZA UMMA', subStrands: [{ name: 'Kusikiliza na kuzungumza' }, { name: 'Kusoma' }, { name: 'Kuandika' }, { name: 'Sarufi' }] },
            { number: 2, theme: 'MATUMIZI YAFAAYO YA DAWA', subStrands: [{ name: 'Kusikiliza na kuzungumza' }, { name: 'Kusoma' }, { name: 'Kuandika' }, { name: 'Sarufi' }] },
            { number: 3, theme: 'DHIKI ZINAZOKUMBA WANYAMA', subStrands: [{ name: 'Kusikiliza na kuzungumza' }, { name: 'Kusoma' }, { name: 'Kuandika' }, { name: 'Sarufi' }] },
            { number: 4, theme: 'MATUMIZI BORA YA MALIASILI', subStrands: [{ name: 'Kusikiliza na kuzungumza' }, { name: 'Kusoma' }, { name: 'Kuandika' }, { name: 'Sarufi' }] },
            { number: 5, theme: 'MAJUKUMU YA KIJINSIA', subStrands: [{ name: 'Kusikiliza na kuzungumza' }, { name: 'Kusoma' }, { name: 'Kuandika' }, { name: 'Sarufi' }] },
          ],
        },
        {
          subject: 'Social Studies',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'SOCIAL STUDIES AND PERSONAL MANAGEMENT',
              subStrands: [
                { name: 'Self-improvement' },
                { name: 'Self-esteem assessment' },
              ],
            },
            {
              number: 2,
              theme: 'COMMUNITY SERVICE LEARNING',
              subStrands: [
                { name: 'Community service learning' },
              ],
            },
            {
              number: 3,
              theme: 'PEOPLE AND RELATIONSHIP',
              subStrands: [
                { name: 'Scientific theories about human origin' },
                { name: 'Early civilization' },
                { name: 'Trans Saharan slave trade' },
              ],
            },
          ],
        },
        {
          subject: 'Integrated Science',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'MIXTURES, ELEMENTS & COMPOUNDS',
              subStrands: [
                { name: 'Elements & compounds', details: ['Atoms, elements, molecules & compounds', 'Symbols of common elements', 'Word equations for reactions of elements to form compounds', 'Uses of some common elements in the society'] },
                { name: 'Physical and chemical changes', details: ['Kinetic theory of matter', 'Heating curve', 'Effects of impurities on Boiling point and melting point', 'Physical and chemical changes', 'Applications of physical & chemical changes in daily life'] },
              ],
            },
          ],
        },
        {
          subject: 'Agriculture & Nutrition',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'CONSERVATION OF RESOURCES',
              subStrands: [
                { name: 'Soil conservation', details: ['Methods of soil conservation', 'Carrying out soil conservation activities'] },
                { name: 'Water harvesting and storage', details: ['Ways of storing harvested water', 'Participating in harvesting water'] },
              ],
            },
            {
              number: 2,
              theme: 'FOOD PRODUCTION PROCESSES',
              subStrands: [
                { name: 'Kitchen & Backyard gardening', details: ['Role of kitchen & backyard gardening', 'Establishing kitchen & backyard garden'] },
                { name: 'Poultry rearing in a fold', details: ['Describing fold in poultry rearing', 'Constructing a fold', 'Rearing poultry in a fold'] },
              ],
            },
          ],
        },
        {
          subject: 'Creative Arts',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'FOUNDATIONS OF CA&S',
              subStrands: [
                { name: 'Introduction to CA&S', details: ['Roles of CA&S', 'Creating a storyboard', 'Painting background'] },
                { name: 'Components of CA&S', details: ['Elements of a verse: character, theme, setting', 'Pitch: bass staff, ledger lines, G major, piano keyboard accidentals, middle C', 'Rhythm: semibreve, minim, crotchet, a pair of quaver', 'Elements of music and dance'] },
              ],
            },
            {
              number: 2,
              theme: 'CREATING & PERFORMING CA&S',
              subStrands: [
                { name: 'Drawing and Painting', details: ['Drawing forms/shapes', 'Dominance (size variation)', 'Painting'] },
                { name: 'Rhythm', details: ['Composing four bar rhythm', 'Note values and their corresponding rests', 'French rhythm names'] },
                { name: 'Middle distance Races and Montage', details: ['Middle distance races', 'Montage (subjects, posture, center of interest, finishing)'] },
                { name: 'Melody', details: ['Question and answer phrases in a melody', '4-bar melodies in G Major and time', 'Extending a melody using exact repetition, and varied repetition'] },
              ],
            },
          ],
        },
        {
          subject: 'Pre-Technical Studies',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'FOUNDATION OF PRETECH STUD.',
              subStrands: [
                { name: 'Fire safety' },
              ],
            },
          ],
        },
        {
          subject: 'Christian Religious Education',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'CREATION',
              subStrands: [
                { name: 'Creation stories' },
                { name: 'Stewardship over creation' },
              ],
            },
            {
              number: 2,
              theme: 'THE BIBLE',
              subStrands: [
                { name: 'Selected teachings' },
              ],
            },
          ],
        },
      ],
    },
    { term: 2, subjects: createJSSSubjects('ee_me_ae_be') },
    { term: 3, subjects: createJSSSubjects('ee_me_ae_be') },
  ],
};

const grade9Assessment: GradeAssessment = {
  grade: 'Grade 9',
  terms: [
    {
      term: 1,
      subjects: [
        {
          subject: 'English Language',
          scoringType: 'ee_me_ae_be',
          strands: [
            { number: 1, theme: 'CITIZENSHIP', subStrands: [{ name: 'Listening and speaking' }, { name: 'Reading' }, { name: 'Grammar in use' }, { name: 'Writing' }] },
            { number: 2, theme: 'SCIENCE: FICTION', subStrands: [{ name: 'Listening and speaking' }, { name: 'Reading' }, { name: 'Grammar in use' }, { name: 'Writing' }] },
            { number: 3, theme: 'ENVIRONMENTAL CONSERVATION', subStrands: [{ name: 'Listening and speaking' }, { name: 'Reading' }, { name: 'Grammar in use' }, { name: 'Writing' }] },
            { number: 4, theme: 'CONSUMER PROTECTION', subStrands: [{ name: 'Listening and speaking' }, { name: 'Reading' }, { name: 'Grammar in use' }, { name: 'Writing' }] },
            { number: 5, theme: 'RELATIONSHIPS: COMMUNITY', subStrands: [{ name: 'Listening and speaking' }, { name: 'Reading (extensive & intensive)' }, { name: 'Grammar in use' }, { name: 'Writing' }] },
          ],
        },
        {
          subject: 'Mathematics',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'NUMBERS',
              subStrands: [
                { name: 'Integers' },
                { name: 'Cubes and cube roots' },
                { name: 'Indices and logarithms' },
                { name: 'Compound proportions & rates of work' },
              ],
            },
            {
              number: 2,
              theme: 'ALGEBRA',
              subStrands: [
                { name: 'Matrices' },
                { name: 'Equations of straight lines' },
              ],
            },
          ],
        },
        {
          subject: 'Kiswahili',
          scoringType: 'ee_me_ae_be',
          strands: [
            { number: 1, theme: 'USAFI WA MAZINGIRA', subStrands: [{ name: 'Kusikiliza na kuzungumza' }, { name: 'Kusoma' }, { name: 'Kuandika' }, { name: 'Sarufi' }] },
            { number: 2, theme: 'MAZOEZI YA VIOUNGO VYA MWILI', subStrands: [{ name: 'Kusikiliza na kuzungumza' }, { name: 'Kusoma' }, { name: 'Kuandika' }, { name: 'Sarufi' }] },
            { number: 3, theme: 'UTUNZAJI WA WANYAMA', subStrands: [{ name: 'Kusikiliza na kuzungumza' }, { name: 'Kusoma' }, { name: 'Kuandika' }, { name: 'Sarufi' }] },
            { number: 4, theme: 'UTUNZAJI WA MALIASILI', subStrands: [{ name: 'Kusikiliza na kuzungumza' }, { name: 'Kusoma' }, { name: 'Kuandika' }, { name: 'Sarufi' }] },
            { number: 5, theme: 'MITAZAMO HASI WA KIJINSIA', subStrands: [{ name: 'Kusikiliza na kuzungumza' }, { name: 'Kusoma' }, { name: 'Kuandika' }, { name: 'Sarufi' }] },
          ],
        },
        {
          subject: 'Social Studies',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'SST & PERSONAL DEVELOPMENT',
              subStrands: [
                { name: 'Career choices' },
                { name: 'Entrepreneurial opportunities in SST' },
              ],
            },
            {
              number: 2,
              theme: 'COMMUNITY SERVICE LEARNING',
              subStrands: [
                { name: 'Identify a problem' },
                { name: 'Designing a solution' },
                { name: 'Plan to solve' },
                { name: 'Implement the plan' },
                { name: 'Write a report' },
              ],
            },
            {
              number: 3,
              theme: 'PEOPLE, POPULATION & RELATIONSHIPS',
              subStrands: [
                { name: 'Socio-economic practices of early humans' },
                { name: 'Indigenous knowledge systems in African societies' },
                { name: 'Poverty reduction' },
                { name: 'Population structure' },
                { name: 'Process & non-violent conflict resolution' },
              ],
            },
          ],
        },
        {
          subject: 'Integrated Science',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'MIXTURES, ELEMENTS & COMPOUNDS',
              subStrands: [
                { name: 'Structure of the Atom', details: ['Atomic number and mass number of elements', 'Electron arrangement of elements', 'Energy level diagrams'] },
                { name: 'Metals & non-metals', details: ['Metals and Alloys', 'Physical properties of alloys', 'Composition of alloys', 'Uses of metals and alloys in daily life'] },
                { name: 'Water hardness', details: ['Physical properties of water', 'Hard and soft water', 'Methods of softening temporary hard water'] },
              ],
            },
            {
              number: 2,
              theme: 'LIVING THINGS & THEIR ENVIRONMENT',
              subStrands: [
                { name: 'Nutrition in plants', details: ['Parts of a leaf', 'Adaptation of the leaf to photosynthesis', 'Structure of chloroplasts', 'Process of photosynthesis', 'Conditions necessary for photosynthesis'] },
              ],
            },
          ],
        },
        {
          subject: 'Agriculture & Nutrition',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'CONSERVATION OF RESOURCES',
              subStrands: [
                { name: 'Conserving Animal feed: Hay', details: ['Methods of conserving forage in coping with drought', 'Conserve forage'] },
                { name: 'Conserving leftover foods', details: ['Importance of conserving left over foods at home', 'Prepare leftover foods to avoid wastage'] },
                { name: 'Integrated farming', details: ['Components of integrated farming', 'Making a model of integrated farming'] },
              ],
            },
            {
              number: 2,
              theme: 'FOOD PRODUCTION PROCESSES',
              subStrands: [
                { name: 'Organic Gardening', details: ['Explaining organic gardening practices', 'Grown a crop using organic gardening practices'] },
              ],
            },
          ],
        },
        {
          subject: 'Creative Arts',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'FOUNDATIONS OF CA&S',
              subStrands: [
                { name: 'Careers in CA&S' },
                { name: 'Components of CA&S' },
              ],
            },
            {
              number: 2,
              theme: 'CREATING & PERFORMING CA&S',
              subStrands: [
                { name: 'Composing rhythm' },
                { name: 'Athletics' },
              ],
            },
          ],
        },
        {
          subject: 'Pre-Technical Studies',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'FOUNDATION OF PRETECH STUD.',
              subStrands: [
                { name: 'Safety on raised platforms', details: ['Types of raised platforms', 'Risks associated with raised platforms'] },
                { name: 'Self-exploration & career Development', details: ['Ways of nurturing talents & abilities', 'Relating careers and abilities'] },
                { name: 'Computer software', details: ['Categories of computer software', 'Functions of computer software', 'Using computer software'] },
              ],
            },
            {
              number: 2,
              theme: 'COMMUNICATION',
              subStrands: [
                { name: 'Oblique projection' },
                { name: 'Visual programming', details: ['Application characteristics of Visual programming', 'Creating application in Visual Programming'] },
              ],
            },
          ],
        },
        {
          subject: 'Christian Religious Education',
          scoringType: 'ee_me_ae_be',
          strands: [
            {
              number: 1,
              theme: 'CREATION',
              subStrands: [
                { name: 'Work: God worked' },
                { name: 'Scriptures on works' },
                { name: 'Virtues related to Christian work' },
                { name: 'Choosing a career' },
              ],
            },
            {
              number: 2,
              theme: 'THE BIBLE: SELECTED TEACHINGS',
              subStrands: [
                { name: 'Christian values: sexual purity' },
                { name: 'Woman judge: Deborah' },
                { name: 'Kings David & Solomon' },
              ],
            },
            {
              number: 3,
              theme: 'THE LIFE & MINISTRY OF JESUS CHRIST',
              subStrands: [
                { name: "Raising the widow's son" },
                { name: 'Healing the 10 lepers' },
              ],
            },
          ],
        },
      ],
    },
    { term: 2, subjects: createJSSSubjects('ee_me_ae_be') },
    { term: 3, subjects: createJSSSubjects('ee_me_ae_be') },
  ],
};

export const assessmentFramework: GradeAssessment[] = [
  playgroupAssessment,
  pp1Assessment,
  pp2Assessment,
  grade1Assessment,
  grade2Assessment,
  grade3Assessment,
  grade4Assessment,
  grade5Assessment,
  grade6Assessment,
  grade7Assessment,
  grade8Assessment,
  grade9Assessment,
];

export function getSubjectsForGrade(grade: string): string[] {
  const gradeAssessment = assessmentFramework.find(
    (g) => g.grade.toLowerCase() === grade.toLowerCase()
  );
  if (!gradeAssessment || gradeAssessment.terms.length === 0) {
    return [];
  }
  return gradeAssessment.terms[0].subjects.map((s) => s.subject);
}

export function getAssessmentForGradeSubjectTerm(
  grade: string,
  subject: string,
  term: number
): SubjectAssessment | undefined {
  const gradeAssessment = assessmentFramework.find(
    (g) => g.grade.toLowerCase() === grade.toLowerCase()
  );
  if (!gradeAssessment) return undefined;

  const termAssessment = gradeAssessment.terms.find((t) => t.term === term);
  if (!termAssessment) return undefined;

  return termAssessment.subjects.find(
    (s) => s.subject.toLowerCase() === subject.toLowerCase()
  );
}
