'use client';

import React, { useState, useMemo } from 'react';

export interface Player {
  name: string;
  number: number;
  pos: string;
  rating: number;
  goals?: number;
  assists?: number;
  tackles?: number;
  key_passes?: number;
  shots?: number;
  yellow_cards?: number;
  x?: number;
  y?: number;
  team?: string;
  is_home?: boolean;
}

export interface TeamLineup {
  team: string;
  formation: string;
  is_home: boolean;
  starting_xi: Player[];
  bench: Player[];
}

export interface LineupData {
  home: TeamLineup;
  away: TeamLineup;
  leaders?: {
    top_scorers: Player[];
    top_playmakers: Player[];
    top_defenders: Player[];
    highest_rated: Player[];
  };
}

interface TacticalPitchProps {
  lineupData?: LineupData;
  homeName: string;
  awayName: string;
  homeFormation?: string;
  awayFormation?: string;
  homeManager?: string;
  awayManager?: string;
  isLiveOrFinished?: boolean;
  onRefresh?: () => void;
}

const REAL_SQUADS: Record<string, { formation: string; xi: Player[]; bench: Player[] }> = {
  "arsenal": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Kepa Arrizabalaga",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Ben White",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Gabriel Magalhães",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "William Saliba",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jurrien Timber",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Bruno Guimarães",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Eberechi Eze",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Martin Ødegaard",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Kai Havertz",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Gabriel Jesus",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Reiss Nelson",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "David Raya",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Piero Hincapié",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Riccardo Calafiori",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Mikel Merino",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Declan Rice",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Viktor Gyökeres",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Martinelli",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "aston villa": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Emiliano Martínez",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Lucas Digne",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Victor Nilsson-Lindelöf",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ezri Konsa",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Tyrone Mings",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ross Barkley",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Boubacar Kamara",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "John McGinn",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Leon Bailey",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ollie Watkins",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Tammy Abraham",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Marco Bizot",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Matty Cash",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Pau Torres",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Morgan Rogers",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Amadou Onana",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Emiliano Buendía",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Evann Guessand",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "chelsea": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Robert Sánchez",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Axel Disasi",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Trevoh Chalobah",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Tosin Adarabioyo",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Wesley Fofana",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jordan Henderson",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Morgan Rogers",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Enzo Fernández",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Pedro Neto",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Danny Welbeck",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Mykhailo Mudryk",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Gabriel Slonina",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Reece James",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Maxence Lacroix",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Moisés Caicedo",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Cole Palmer",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "João Pedro",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Emanuel Emegha",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "everton": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Jordan Pickford",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "James Tarkowski",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Michael Keane",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Vitalii Mykolenko",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jarrad Branthwaite",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Christian Nørgaard",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "James Garner",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Hayden Hackney",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Dwight McNeil",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Iliman Ndiaye",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Brennan Johnson",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Thomas King",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Jake O'Brien",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Nathan Patterson",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Kiernan Dewsbury Hall",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Carlos Alcaraz",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Beto",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Thierno Barry",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "fulham": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Bernd Leno",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Timothy Castagne",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Joachim Andersen",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Antonee Robinson",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ryan Sessegnon",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Tom Cairney",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Harrison Reed",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Sander Berge",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Alex Iwobi",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Rodrigo Muniz",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Kevin Santos",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Benjamin Lecomte",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Issa Diop",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Kenny Tete",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Saša Lukić",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Emile Smith Rowe",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Oscar Bobb",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Jonah Kusi-Asare",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "liverpool": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Alisson Becker",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Kostas Tsimikas",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Joe Gomez",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Virgil van Dijk",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ronald Araújo",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Wataru Endō",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Curtis Jones",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Dominik Szoboszlai",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Federico Chiesa",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Alexander Isak",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Cody Gakpo",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Freddie Woodman",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Calvin Ramsay",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Jeremie Frimpong",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Florian Wirtz",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Alexis Mac Allister",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Hugo Ekitike",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Víctor Muñoz",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "manchester city": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Géronimo Rulli",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Rayan Aït Nouri",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Rúben Dias",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Matheus Nunes",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marc Guéhi",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Mateo Kovačić",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Rodri",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Kalvin Phillips",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Jack Grealish",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Antoine Semenyo",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Erling Haaland",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Gianluigi Donnarumma",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Joško Gvardiol",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Issa Kaboré",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Tijjani Reijnders",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Phil Foden",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Omar Marmoush",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Jeremy Doku",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "man city": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Géronimo Rulli",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Rayan Aït Nouri",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Rúben Dias",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Matheus Nunes",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marc Guéhi",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Mateo Kovačić",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Rodri",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Kalvin Phillips",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Jack Grealish",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Antoine Semenyo",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Erling Haaland",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Gianluigi Donnarumma",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Joško Gvardiol",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Issa Kaboré",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Tijjani Reijnders",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Phil Foden",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Omar Marmoush",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Jeremy Doku",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "manchester united": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Karl Darlow",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Harry Maguire",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Matthijs de Ligt",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Noussair Mazraoui",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Luke Shaw",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Bruno Fernandes",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Youri Tielemans",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Mason Mount",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Marcus Rashford",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Bryan Mbeumo",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Matheus Cunha",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Tom Heaton",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Diogo Dalot",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Lisandro Martínez",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Manuel Ugarte",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Andrey Santos",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Joshua Zirkzee",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Benjamin Šeško",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "man united": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Karl Darlow",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Harry Maguire",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Matthijs de Ligt",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Noussair Mazraoui",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Luke Shaw",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Bruno Fernandes",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Youri Tielemans",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Mason Mount",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Marcus Rashford",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Bryan Mbeumo",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Matheus Cunha",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Tom Heaton",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Diogo Dalot",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Lisandro Martínez",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Manuel Ugarte",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Andrey Santos",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Joshua Zirkzee",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Benjamin Šeško",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "newcastle united": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Nick Pope",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Fabian Schär",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Dan Burn",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Sven Botman",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Amar Dedić",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Bruno Guimarães",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Joe Willock",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Joelinton",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Yoane Wissa",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Jacob Murphy",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Harvey Barnes",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Mark Gillespie",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Malick Thiaw",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Valentino Livramento",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Jacob Ramsey",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Joe White",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Nick Woltemade",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Anthony Elanga",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "newcastle": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Nick Pope",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Fabian Schär",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Dan Burn",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Sven Botman",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Amar Dedić",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Bruno Guimarães",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Joe Willock",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Joelinton",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Yoane Wissa",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Jacob Murphy",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Harvey Barnes",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Mark Gillespie",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Malick Thiaw",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Valentino Livramento",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Jacob Ramsey",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Joe White",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Nick Woltemade",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Anthony Elanga",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "sunderland a": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Simon Moore",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Thomas Meunier",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Luke O'Nien",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Arthur Masuaku",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Nordi Mukiele",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Granit Xhaka",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Alan Browne",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Enzo Le Fée",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Wilson Isidor",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Brian Brobbey",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Simon Adingra",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Anthony Patterson",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Reinildo",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Omar Alderete",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Abdoullah Ba",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Habib Diarra",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Romaine Mundle",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Nilson Angulo",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "sunderland": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Simon Moore",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Thomas Meunier",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Luke O'Nien",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Arthur Masuaku",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Nordi Mukiele",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Granit Xhaka",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Alan Browne",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Enzo Le Fée",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Wilson Isidor",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Brian Brobbey",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Simon Adingra",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Anthony Patterson",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Reinildo",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Omar Alderete",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Abdoullah Ba",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Habib Diarra",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Romaine Mundle",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Nilson Angulo",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "tottenham hotspur": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Guglielmo Vicario",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Kevin Danso",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Andrew Robertson",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ben Davies",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Christian Romero",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Dejan Kulusevski",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Rodrigo Bentancur",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Sandro Tonali",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Dominic Solanke",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Richarlison",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Manor Solomon",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Martin Dúbravka",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Marcos Senesi",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Djed Spence",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "James Maddison",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Conor Gallagher",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Mohammed Kudus",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Dane Scarlett",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "tottenham": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Guglielmo Vicario",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Kevin Danso",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Andrew Robertson",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ben Davies",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Christian Romero",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Dejan Kulusevski",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Rodrigo Bentancur",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Sandro Tonali",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Dominic Solanke",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Richarlison",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Manor Solomon",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Martin Dúbravka",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Marcos Senesi",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Djed Spence",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "James Maddison",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Conor Gallagher",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Mohammed Kudus",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Dane Scarlett",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "hull city a": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Jack Butland",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Matt Targett",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Paddy McNair",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "John Egan",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lewie Coyle",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Regan Slater",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Matty Crooks",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Kieran Dowell",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Oliver McBurnie",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Joe Gelhardt",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Liam Millar",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Dillon Phillips",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Semi Ajayi",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Ryan John Giles",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Abdülkadir Ömür",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Hidemasa Morita",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Enis Destan",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "David Akintola",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "hull city": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Jack Butland",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Matt Targett",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Paddy McNair",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "John Egan",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lewie Coyle",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Regan Slater",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Matty Crooks",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Kieran Dowell",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Oliver McBurnie",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Joe Gelhardt",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Liam Millar",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Dillon Phillips",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Semi Ajayi",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Ryan John Giles",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Abdülkadir Ömür",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Hidemasa Morita",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Enis Destan",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "David Akintola",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "leeds united": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Lucas Perri",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Nico Elvedi",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jayden Bogle",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "James Justin",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Joe Rodon",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Sean Longstaff",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ethan Ampadu",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ao Tanaka",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Jack Harrison",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Dominic Calvert-Lewin",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Lukas Nmecha",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Alex Cairns",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Maximilian Wöber",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Sam Byram",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Anton Stach",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Ilia Gruev",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Daniel James",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Harry Wilson",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "ipswich town": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "David Button",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Darnell Furlong",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ben Johnson",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Issa Diop",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Dara O'Shea",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Wes Burns",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Samuel Szmodics",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Jack Taylor",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Jack Clarke",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Chiedozie Ogbene",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Chuba Akpom",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Christian Walton",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Cédric Kipré",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Leif Davis",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Azor Matusiwa",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Saša Lukić",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "George Hirst",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Daizen Maeda",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "nottingham forest": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "John",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Nikola Milenković",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ola Aina",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Omar Richards",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Morato",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Morgan Gibbs-White",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ryan Yates",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ibrahim Sangaré",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Callum Hudson-Odoi",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Chris Wood",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Taiwo Awoniyi",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Matz Sels",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Neco Williams",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Luca Netz",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Xaver Schlager",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Nicolás Domínguez",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Dan Ndoye",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Arnaud Kalimuendo",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "nottingham": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "John",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Nikola Milenković",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ola Aina",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Omar Richards",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Morato",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Morgan Gibbs-White",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ryan Yates",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ibrahim Sangaré",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Callum Hudson-Odoi",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Chris Wood",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Taiwo Awoniyi",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Matz Sels",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Neco Williams",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Luca Netz",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Xaver Schlager",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Nicolás Domínguez",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Dan Ndoye",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Arnaud Kalimuendo",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "crystal palace": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Dean Henderson",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Nathaniel Clyne",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Takehiro Tomiyasu",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Borna Sosa",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Daniel Muñoz",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jefferson Lerma",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Daichi Kamada",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Will Hughes",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Jean-Philippe Mateta",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ismaïla Sarr",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Eddie Nketiah",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Remi Matthews",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Maxence Lacroix",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Chris Richards",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Cheick Doucouré",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Justin Devenny",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Dwight McNeil",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Brennan Johnson",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "brighton & hove albion": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Jason Steele",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Olivier Boscagli",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Pascal Struijk",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lewis Dunk",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ferdi Kadıoğlu",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Matt O'Riley",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Pascal Groß",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Yasin Ayari",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Danny Welbeck",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Georginio Rutter",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Evan Ferguson",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Bart Verbruggen",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Igor Julio",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Michael Svoboda",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Carlos Baleba",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Diego Gómez",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Kaoru Mitoma",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Yankubah Minteh",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "brighton hove": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Jason Steele",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Olivier Boscagli",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Pascal Struijk",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lewis Dunk",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ferdi Kadıoğlu",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Matt O'Riley",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Pascal Groß",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Yasin Ayari",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Danny Welbeck",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Georginio Rutter",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Evan Ferguson",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Bart Verbruggen",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Igor Julio",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Michael Svoboda",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Carlos Baleba",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Diego Gómez",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Kaoru Mitoma",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Yankubah Minteh",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "brentford": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Ellery Balcombe",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Ethan Pinnock",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Rico Henry",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Sepp van den Berg",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Kristoffer Ajer",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jordan Henderson",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Josh Dasilva",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Vitaly Janelt",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Callum Wilson",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Kevin Schade",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Thiago",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Caoimhin Kelleher",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Aaron Hickey",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Nathan Collins",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Mathias Jensen",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Mikkel Damsgaard",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Jaidon Anthony",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Dango Ouattara",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "a bournemouth": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Fraser Forster",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Adam Smith",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Max Aarons",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "James Hill",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Bafodé Diakité",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lewis Cook",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Marcus Tavernier",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Justin Kluivert",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "David Brooks",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Enes Ünal",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Evanilson",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Đorđe Petrović",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Julian Araujo",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Adrien Truffert",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Ryan Christie",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Tyler Adams",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Amine Adli",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Daniel Jebbison",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "bournemouth": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Fraser Forster",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Adam Smith",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Max Aarons",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "James Hill",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Bafodé Diakité",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lewis Cook",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Marcus Tavernier",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Justin Kluivert",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "David Brooks",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Enes Ünal",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Evanilson",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Đorđe Petrović",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Julian Araujo",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Adrien Truffert",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Ryan Christie",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Tyler Adams",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Amine Adli",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Daniel Jebbison",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "coventry city": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Ben Wilson",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Jake Bidwell",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Luke Woolfenden",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jay Dasilva",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Liam Kitching",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ephron Mason-Clark",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Matt Grimes",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Gustavo Hamer",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Brandon Thomas-Asante",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Taiwo Awoniyi",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Haji Wright",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Oliver Dovin",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Milan van Ewijk",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Joel Latibeaudiere",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Victor Torp",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Frank Onyeka",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Tatsuhiro Sakamoto",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Raphael Borges Rodrigues",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "athletic club": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Unai Simón",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Aymeric Laporte",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Yuri Berchiche",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Yeray Álvarez",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Daniel Vivian",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ruiz de Galarreta",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Oihan Sancet",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Unai Vencedor Paris",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Álex Berenguer",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Iñaki Williams",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Gorka Guruzeta",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Julen Agirrezabala",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Andoni Gorosabel",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Jesús Areso",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Benat Prados",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Mikel Jauregizar",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Roberto Navarro",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Nico Williams",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "athletic": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Unai Simón",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Aymeric Laporte",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Yuri Berchiche",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Yeray Álvarez",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Daniel Vivian",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ruiz de Galarreta",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Oihan Sancet",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Unai Vencedor Paris",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Álex Berenguer",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Iñaki Williams",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Gorka Guruzeta",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Julen Agirrezabala",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Andoni Gorosabel",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Jesús Areso",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Benat Prados",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Mikel Jauregizar",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Roberto Navarro",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Nico Williams",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "club atlético de madrid": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Jan Oblak",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Marcos Llorente",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Dávid Hancko",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alejandro Grimaldo",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Christian Romero",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Koke",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Thomas Lemar",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Morten Hjulmand",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Alexander Sørloth",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ademola Lookman",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Julián Álvarez",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Juan Musso",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Nahuel Molina",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Robin Le Normand",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Johnny",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Obed Vargas",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Alejandro Baena",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Giuliano Simeone",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "atleti": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Jan Oblak",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Marcos Llorente",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Dávid Hancko",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alejandro Grimaldo",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Christian Romero",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Koke",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Thomas Lemar",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Morten Hjulmand",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Alexander Sørloth",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ademola Lookman",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Julián Álvarez",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Juan Musso",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Nahuel Molina",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Robin Le Normand",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Johnny",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Obed Vargas",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Alejandro Baena",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Giuliano Simeone",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "ca osasuna": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Sergio Herrera",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Diego Rico",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Valentin Rosier",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Catena",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Flavien Boyomo",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lucas Torró",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Moi Gómez",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Jon Moncayola",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ante Budimir",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Kike Barja",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Rubén García",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Aitor Fernández",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Jorge Herrando",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Abel Bretones",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Aimar Oroz",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Iker Munoz",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Raúl",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Raúl Moro",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "osasuna": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Sergio Herrera",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Diego Rico",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Valentin Rosier",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Catena",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Flavien Boyomo",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lucas Torró",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Moi Gómez",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Jon Moncayola",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ante Budimir",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Kike Barja",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Rubén García",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Aitor Fernández",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Jorge Herrando",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Abel Bretones",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Aimar Oroz",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Iker Munoz",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Raúl",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Raúl Moro",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "rcd espanyol de barcelona": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Marko Dmitrović",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Leandro Cabrera",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Unai Núñez",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Vanja Drkušič",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Clemens Riedel",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Edu Expósito",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Pol Lozano",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Urko González",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Pere Milla",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Kike García",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Javi Puado",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Ángel Fortuño Viñas",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Miguel Rubio",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Quilindschy Hartman",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Moscardo",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Álex Calatrava",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Tyrhys Dolan",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Jofre Carreras Pagès",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "espanyol": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Marko Dmitrović",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Leandro Cabrera",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Unai Núñez",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Vanja Drkušič",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Clemens Riedel",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Edu Expósito",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Pol Lozano",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Urko González",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Pere Milla",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Kike García",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Javi Puado",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Ángel Fortuño Viñas",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Miguel Rubio",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Quilindschy Hartman",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Moscardo",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Álex Calatrava",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Tyrhys Dolan",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Jofre Carreras Pagès",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "barcelona": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Wojciech Szczęsny",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "João Cancelo",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Andreas Christensen",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jules Koundé",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ronald Araújo",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Rodri",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Frenkie de Jong",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Dani Olmo",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Anthony Gordon",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ferrán Torres",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Raphinha",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Joan García",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Eric García",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Álex Balde",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Pedri",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Pablo Gavira",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Karim Adeyemi",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Roony Bardghji",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "barça": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Wojciech Szczęsny",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "João Cancelo",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Andreas Christensen",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jules Koundé",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ronald Araújo",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Rodri",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Frenkie de Jong",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Dani Olmo",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Anthony Gordon",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ferrán Torres",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Raphinha",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Joan García",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Eric García",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Álex Balde",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Pedri",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Pablo Gavira",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Karim Adeyemi",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Roony Bardghji",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "getafe": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "David Soria",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Dakonam Djené",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Johan Mojica",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Femenía Far",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Juan Berrocal",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Orel Mangala",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Javi Muñoz",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Yvan Neyou",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Juanmi",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Borja Mayoral",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Enes Ünal",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Jiří Letáček",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Abdelkabir Abqar",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Saba Sazonov",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Francho Serrano",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "RamónTerrats Espacio",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Martin Satriano",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Alejandro Sancris",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "málaga": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Alfonso Herrero",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Fernando Calero",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alex Pastor Carayol",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "José Salinas",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Angel Recio",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Juan Melero",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ramón Enríquez Rodríguez",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Dani Lorenzo",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Eneko Jauregi Escobar",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Juan Cruz",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Joaquín Muñoz",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Lopez Nogueras",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Diego Murillo",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Moussa Diarra",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Carlos Dotor",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Rafa Rodriguez",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Julen Lobete",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "David Larrubia",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "real madrid": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Thibaut Courtois",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Éder Militão",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Antonio Rüdiger",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Denzel Dumfries",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Trent Alexander-Arnold",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Federico Valverde",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Bernardo Silva",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Aurélien Tchouameni",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Rodrygo",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Vinicius Junior",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Kylian Mbappé",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Andriy Lunin",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Ferland Mendy",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Ibrahima Konaté",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Eduardo Camavinga",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Jude Bellingham",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Brahim Diaz",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Endrick",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "rayo vallano de madrid": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Augusto Batalla",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Luiz Felipe",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marash Kumbulla",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Florian Lejeune",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Iván Balliu",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Óscar Valentín",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Unai López",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Pedro Díaz",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Raúl de Tomás",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Álvaro García",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Isi Palazón",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Dani Cárdenas",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Andrei Rațiu",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Pep Chavarría",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Pathé Ciss",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Randy Ntekja",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Alexandre Alemão",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Sergio Camello",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "rayo vallecano": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Augusto Batalla",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Luiz Felipe",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marash Kumbulla",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Florian Lejeune",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Iván Balliu",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Óscar Valentín",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Unai López",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Pedro Díaz",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Raúl de Tomás",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Álvaro García",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Isi Palazón",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Dani Cárdenas",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Andrei Rațiu",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Pep Chavarría",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Pathé Ciss",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Randy Ntekja",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Alexandre Alemão",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Sergio Camello",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "levante ud": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Maty Ryan",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Aïssa Mandi",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jeremy Toljan",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Adrián de la Fuente",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Manuel Sánchez",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Oriol Rey",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Carlos Álvarez",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Jon Olasagasti",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Roger Brugué",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Víctor García",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Iván Romero",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Pablo Cuñat",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Xavi Grande",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Jorge Cabello",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Hugo Sotelo",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Enzo Bardeli",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Thiago Fernandez",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Karl Etta Eyong",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "levante": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Maty Ryan",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Aïssa Mandi",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jeremy Toljan",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Adrián de la Fuente",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Manuel Sánchez",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Oriol Rey",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Carlos Álvarez",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Jon Olasagasti",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Roger Brugué",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Víctor García",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Iván Romero",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Pablo Cuñat",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Xavi Grande",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Jorge Cabello",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Hugo Sotelo",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Enzo Bardeli",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Thiago Fernandez",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Karl Etta Eyong",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "real betis balompié": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Álvaro Vallés Rosa",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Diego Llorente",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Héctor Bellerín",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Júnior Firpo",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Bartra",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Isco",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Giovani Lo Celso",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Marc Roca",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Cucho Hernández",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Aitor Ruibal",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Antony",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Diego Conde",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Francisco Garcia",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Natan",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Pablo Fornals",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Álvaro Fidalgo",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Iker Losada",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Rodrigo Riquelme",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "real betis": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Álvaro Vallés Rosa",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Diego Llorente",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Héctor Bellerín",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Júnior Firpo",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Bartra",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Isco",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Giovani Lo Celso",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Marc Roca",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Cucho Hernández",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Aitor Ruibal",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Antony",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Diego Conde",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Francisco Garcia",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Natan",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Pablo Fornals",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Álvaro Fidalgo",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Iker Losada",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Rodrigo Riquelme",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "real sociedad de fútbol": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Álex Remiro",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Álvaro Odriozola",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Igor Zubeldía",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Sergio Gómez",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Javi López",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Carlos Soler",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Yangel Herrera",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Luka Sučić",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Gonçalo Guedes",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Takefusa Kubo",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ander Barrenetxea",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Unai Marrero",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Aihen Muñoz",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Jon Aramburu",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Beñat Turrientes",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Arsen Zakharyan",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Jon Karrikaburu",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Mikel Oyarzabal",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "real sociedad": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Álex Remiro",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Álvaro Odriozola",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Igor Zubeldía",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Sergio Gómez",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Javi López",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Carlos Soler",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Yangel Herrera",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Luka Sučić",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Gonçalo Guedes",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Takefusa Kubo",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ander Barrenetxea",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Unai Marrero",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Aihen Muñoz",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Jon Aramburu",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Beñat Turrientes",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Arsen Zakharyan",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Jon Karrikaburu",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Mikel Oyarzabal",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "villarreal": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Péter Gulácsi",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Logan Costa",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Juan Foyth",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alex Freeman",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Renato Veiga",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Pape Gueye",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Santiago Comesaña",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Alassane Diatta",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ayoze Pérez",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Nicolas Pépé",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Hugo López",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Luiz Lúcio Reis Júnior",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Sergi Cardona",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Carlos Romero",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Carlos Macià",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Gerard Moreno",
        "number": 16,
        "pos": "FW",
        "rating": 7.1
      },
      {
        "name": "Tajon Buchanan",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      }
    ]
  },
  "valencia": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Cristian",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Mouctar Diakhaby",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Dimitri Foulquier",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Gaya",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Pablo Maffeo",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Filip Ugrinic",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Pepelu",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "André Almeida",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Sergi Canós",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Umar Sadiq",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Arnaut Danjuma",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Stole Dimitrievski",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Justin de Haas",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Jesus Vazquez Alcalde",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Guido Rodríguez",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Javier Guerra",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Hugo Duro",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Dani Raba",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "deportivo alavés": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Sivera",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Jonny Otto",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Nikola Maraš",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Facundo Garcés",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Nahuel Tenaglia",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Aleñà",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Denís Suárez",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Carlos Benavidez",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Mariano Díaz",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Lucas Boyé",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Toni Martínez",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Jesús Owono",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Moussa Diarra",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Ville Koski",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Ander Guevara",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Antonio Blanco",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Miguel Rodríguez",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Abde Rebbach",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "alavés": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Sivera",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Jonny Otto",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Nikola Maraš",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Facundo Garcés",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Nahuel Tenaglia",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Aleñà",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Denís Suárez",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Carlos Benavidez",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Mariano Díaz",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Lucas Boyé",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Toni Martínez",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Jesús Owono",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Moussa Diarra",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Ville Koski",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Ander Guevara",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Antonio Blanco",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Miguel Rodríguez",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Abde Rebbach",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "elche": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Matías Dituro",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Pedro Bigas",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Bambo Diaby",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "David Affengruber",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Víctor Chust",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Gonzalo Villar",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Marc Aguado",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Martim Neto",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Grady Diangana",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ezequiel Ponce",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Josán Fernández",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Alejandro Iturbe",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Buba",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Matia Barzic",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Federico Redondo",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Facundo Buonanotte",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Tete Morente",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Germán Valera",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "rc celta de vigo": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Ionuț Radu",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Marcos Alonso",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Carl Starfelt",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Javier Galán",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Abdoulaye Fayé",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Matías Vecino",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Aleix Febas",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ilaix Moriba",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Iago Aspas",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Borja Iglesias",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Carles Pérez",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Altay Bayındır",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Sergio Carreira",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Carlos Dominguez",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Miguel Román",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Ferran Jutglà",
        "number": 16,
        "pos": "FW",
        "rating": 7.1
      },
      {
        "name": "Williot Swedberg",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      }
    ]
  },
  "celta": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Ionuț Radu",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Marcos Alonso",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Carl Starfelt",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Javier Galán",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Abdoulaye Fayé",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Matías Vecino",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Aleix Febas",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ilaix Moriba",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Iago Aspas",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Borja Iglesias",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Carles Pérez",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Altay Bayındır",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Sergio Carreira",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Carlos Dominguez",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Miguel Román",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Ferran Jutglà",
        "number": 16,
        "pos": "FW",
        "rating": 7.1
      },
      {
        "name": "Williot Swedberg",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      }
    ]
  },
  "sevilla": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Odisseas Vlachodimos",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Gabriel Suazo",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Fábio Cardoso",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marcão",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Federico Gattoni",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jon Guridi",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Jordán",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Lucien Agoume",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ruben Vargas",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Alfonso González",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Chidera Ejuke",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Fran Gonzalez",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Juan Iglesias",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Pedrosa",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Manu Bueno",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Nicolás Guillén",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Peque",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Robbie Ure",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "sevilla fc": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Odisseas Vlachodimos",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Gabriel Suazo",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Fábio Cardoso",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marcão",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Federico Gattoni",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jon Guridi",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Jordán",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Lucien Agoume",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ruben Vargas",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Alfonso González",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Chidera Ejuke",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Fran Gonzalez",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Juan Iglesias",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Pedrosa",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Manu Bueno",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Nicolás Guillén",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Peque",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Robbie Ure",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "rc deportivo la coruña": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Álvaro Fernández",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Ximo Navarro",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Angeliño",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Giacomo Quagliata",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Arnau Comas",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "José Jurado",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Mario Soriano",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Riki Rodríguez",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Pierre-Emerick Aubameyang",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Zakaria Eddahchouri",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Luismi Cruz",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "German Parreno",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Lucas Noubi",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Adrià Altimira",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Charlie Patino",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Lorenzo Amatucci",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "David Mella",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Peke",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "deportivo": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Álvaro Fernández",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Ximo Navarro",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Angeliño",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Giacomo Quagliata",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Arnau Comas",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "José Jurado",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Mario Soriano",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Riki Rodríguez",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Pierre-Emerick Aubameyang",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Zakaria Eddahchouri",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Luismi Cruz",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "German Parreno",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Lucas Noubi",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Adrià Altimira",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Charlie Patino",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Lorenzo Amatucci",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "David Mella",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Peke",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "real racing club de santander": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Julen Agirrezabala",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "José Manuel",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Pablo Ramon",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Álvaro Mantilla",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Facundo González",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Canales",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Iván Martín",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Íñigo Sainz Maza",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Andrés Martín",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Asier Villalibre",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Iñigo Vicente",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Simon Eriksson",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Pedro Felipe",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Salinas",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Maguette Gueye",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Gustavo Puerta",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Giorgi Guliashvili",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Arana",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "santander": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Julen Agirrezabala",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "José Manuel",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Pablo Ramon",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Álvaro Mantilla",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Facundo González",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Canales",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Iván Martín",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Íñigo Sainz Maza",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Andrés Martín",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Asier Villalibre",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Iñigo Vicente",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Simon Eriksson",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Pedro Felipe",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Salinas",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Maguette Gueye",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Gustavo Puerta",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Giorgi Guliashvili",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Arana",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "1.  köln": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Matthias Köbbing",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Timo Hübers",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alessio Castro-Montes",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Gideon Mensah",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jusuf Gazibegović",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Tom Krauß",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ísak Bergmann Jóhannesson",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Paul Okon-Engstler",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Linton Maina",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Gian-Luca Waldschmidt",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ragnar Ache",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Ron-Robert Zieler",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Luka Lochoshvili",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Joël Schmied",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Gil Neves",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Thijs Dallinga",
        "number": 16,
        "pos": "FW",
        "rating": 7.1
      },
      {
        "name": "Imad Rondić",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      }
    ]
  },
  "1. fc köln": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Matthias Köbbing",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Timo Hübers",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alessio Castro-Montes",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Gideon Mensah",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jusuf Gazibegović",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Tom Krauß",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ísak Bergmann Jóhannesson",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Paul Okon-Engstler",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Linton Maina",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Gian-Luca Waldschmidt",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ragnar Ache",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Ron-Robert Zieler",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Luka Lochoshvili",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Joël Schmied",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Gil Neves",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Thijs Dallinga",
        "number": 16,
        "pos": "FW",
        "rating": 7.1
      },
      {
        "name": "Imad Rondić",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      }
    ]
  },
  "tsg 1899 hoffenheim": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Oliver Baumann",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Bernardo",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ozan Kabak",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Koki Machida",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Vladimir Coufal",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Dennis Geiger",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Wouter Burger",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Alexander Prass",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Andrej Kramarić",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Adam Hložek",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Patrick Wimmer",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Luca Philipp",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Valentin Gendrey",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Albian Hajdari",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Bambase Conte",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Muhammed Damar",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Tim Lemperle",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Fisnik Asllani",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "hoffenheim": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Oliver Baumann",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Bernardo",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ozan Kabak",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Koki Machida",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Vladimir Coufal",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Dennis Geiger",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Wouter Burger",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Alexander Prass",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Andrej Kramarić",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Adam Hložek",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Patrick Wimmer",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Luca Philipp",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Valentin Gendrey",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Albian Hajdari",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Bambase Conte",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Muhammed Damar",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Tim Lemperle",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Fisnik Asllani",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "bayer 04 leverkusen": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Niklas Lomb",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Lucas Vázquez",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Abdoulaye Fayé",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Facundo Medina",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Edmond Tapsoba",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jonas Hofmann",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Exequiel Palacios",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Aleix García",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Patrik Schick",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Martin Terrier",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Victor Boniface",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Janis Blaswich",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Loïc Bade",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Miguel Gutiérrez",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Robert Andrich",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Malik Tillman",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Nathan Tella",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Ernest Poku",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "leverkusen": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Niklas Lomb",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Lucas Vázquez",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Abdoulaye Fayé",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Facundo Medina",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Edmond Tapsoba",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jonas Hofmann",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Exequiel Palacios",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Aleix García",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Patrik Schick",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Martin Terrier",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Victor Boniface",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Janis Blaswich",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Loïc Bade",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Miguel Gutiérrez",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Robert Andrich",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Malik Tillman",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Nathan Tella",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Ernest Poku",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "borussia dortmund": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Gregor Kobel",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Waldemar Anton",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Emre Can",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ramy Bensebaini",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Julian Ryerson",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marcel Sabitzer",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Joey Veerman",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Felix Kalu Nmecha",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Sehrou Guirassy",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Karim Adeyemi",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Fábio Silva",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Patrick Drewes",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Nico Schlotterbeck",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Yan Couto",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Giannis Konstantelias",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Carney Chukwuemeka",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Maximilian Beier",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Samuele Inácio",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "dortmund": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Gregor Kobel",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Waldemar Anton",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Emre Can",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ramy Bensebaini",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Julian Ryerson",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marcel Sabitzer",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Joey Veerman",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Felix Kalu Nmecha",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Sehrou Guirassy",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Karim Adeyemi",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Fábio Silva",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Patrick Drewes",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Nico Schlotterbeck",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Yan Couto",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Giannis Konstantelias",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Carney Chukwuemeka",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Maximilian Beier",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Samuele Inácio",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "bayern münchen": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Manuel Neuer",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Jonathan Tah",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Dayot Upamecano",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Konrad Laimer",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alphonso Davies",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Joshua Kimmich",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "João Palhinha",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ismael Saibari",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Serge Gnabry",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Harry Kane",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Luis Díaz",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Sven Ulreich",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Hiroki Ito",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Sacha Boey",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Jamal Musiala",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Tom Bischof",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Michael Olise",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Armindo Sieb",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "bayern": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Manuel Neuer",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Jonathan Tah",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Dayot Upamecano",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Konrad Laimer",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alphonso Davies",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Joshua Kimmich",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "João Palhinha",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ismael Saibari",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Serge Gnabry",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Harry Kane",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Luis Díaz",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Sven Ulreich",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Hiroki Ito",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Sacha Boey",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Jamal Musiala",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Tom Bischof",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Michael Olise",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Armindo Sieb",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "schalke 04": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Kevin Müller",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Robin Gosens",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Tomáš Kalas",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Maximilian Wöber",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Timo Becker",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Kenan Karaman",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Janik Bachmann",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Finn Porath",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Bryan Lasme",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Edin Džeko",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Moussa Sylla",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Loris Karius",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Nikola Katić",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Anton Donkor",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Dejan Ljubicic",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Ron Schallenberg",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Chikwubuike Adamu",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Christian Gomis",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "schalke": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Kevin Müller",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Robin Gosens",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Tomáš Kalas",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Maximilian Wöber",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Timo Becker",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Kenan Karaman",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Janik Bachmann",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Finn Porath",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Bryan Lasme",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Edin Džeko",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Moussa Sylla",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Loris Karius",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Nikola Katić",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Anton Donkor",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Dejan Ljubicic",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Ron Schallenberg",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Chikwubuike Adamu",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Christian Gomis",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "hamburger sv": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Daniel Fernandes",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Jordan Torunarigha",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Sebastiaan Bornauw",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Miro Muheim",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Nicolás Capaldo",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Albert Sambi Lokonga",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Immanuel Pherai",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Albert Gronbaek Erlykke",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Yussuf Poulsen",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Bakery Jatta",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Jean-Luc Dompé",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Sander Tangvik",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Warmed Omari",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Daniel Elfadli",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Nicolai Remberg",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Bilal Nadir",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Patson Daka",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Emir Sahiti",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "hsv": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Daniel Fernandes",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Jordan Torunarigha",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Sebastiaan Bornauw",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Miro Muheim",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Nicolás Capaldo",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Albert Sambi Lokonga",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Immanuel Pherai",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Albert Gronbaek Erlykke",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Yussuf Poulsen",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Bakery Jatta",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Jean-Luc Dompé",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Sander Tangvik",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Warmed Omari",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Daniel Elfadli",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Nicolai Remberg",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Bilal Nadir",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Patson Daka",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Emir Sahiti",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "vfb stuttgart": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Fabian Bredlow",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Dan-Axel Zagadou",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Josha Vagnoman",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Maximilian Mittelstädt",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Julian Chabot",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Nikolas Nartey",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Grischa Prömel",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Atakan Karazor",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Chris Führich",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Deniz Undav",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ermedin Demirovic",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Marius Funk",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Leonidas Stergiou",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Lorenz Assignon",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Angelo Stiller",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Laurin Ulrich",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Jamie Leweling",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Tiago Tomás",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "stuttgart": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Fabian Bredlow",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Dan-Axel Zagadou",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Josha Vagnoman",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Maximilian Mittelstädt",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Julian Chabot",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Nikolas Nartey",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Grischa Prömel",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Atakan Karazor",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Chris Führich",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Deniz Undav",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ermedin Demirovic",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Marius Funk",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Leonidas Stergiou",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Lorenz Assignon",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Angelo Stiller",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Laurin Ulrich",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Jamie Leweling",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Tiago Tomás",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "sv werder bremen": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Alexander Schlager",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Mitchell Weiser",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Niklas Stark",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marco Friedl",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Felix Agu",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ludovit Reis",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Senne Lynen",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Romano Schmid",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Niclas Füllkrug",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Dawid Kownacki",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Cédric Itten",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Markus Kolke",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Amos Pieper",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Olivier Deman",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Jens Stage",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Skelly Alvero",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Marco Grüll",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Justin Njinmah",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "bremen": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Alexander Schlager",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Mitchell Weiser",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Niklas Stark",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marco Friedl",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Felix Agu",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ludovit Reis",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Senne Lynen",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Romano Schmid",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Niclas Füllkrug",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Dawid Kownacki",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Cédric Itten",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Markus Kolke",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Amos Pieper",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Olivier Deman",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Jens Stage",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Skelly Alvero",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Marco Grüll",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Justin Njinmah",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "1. fsv mainz 05": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Robin Zentner",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Dominik Kohr",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Stefan Posch",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Silvan Widmer",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Philipp Mwene",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Nadiem Amiri",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Lee Jaesung",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Marco Richter",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Sheraldo Becker",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Phillip Tietz",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Silas Wamangituka",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Alexander Schwolow",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Stefan Bell",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Danny da Costa",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Lennart Maloney",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Kaishu Sano",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Ransford Königsdörffer",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Benedict Hollerbach",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "mainz": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Robin Zentner",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Dominik Kohr",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Stefan Posch",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Silvan Widmer",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Philipp Mwene",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Nadiem Amiri",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Lee Jaesung",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Marco Richter",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Sheraldo Becker",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Phillip Tietz",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Silas Wamangituka",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Alexander Schwolow",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Stefan Bell",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Danny da Costa",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Lennart Maloney",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Kaishu Sano",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Ransford Königsdörffer",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Benedict Hollerbach",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "augsburg": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Finn Dahmen",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Jeffrey Gouweleeuw",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marius Wolf",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Mads Pedersen",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Dimitris Giannoulis",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alexis Claude Maurice",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Kristijan Jakić",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Robin Fellhauer",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Michael Gregoritsch",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Steve Mounié",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Nathanael Mbuku",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Nediljko Labrović",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Keven Schlotterbeck",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Calvin Brackelmann",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Yannik Keitel",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Han-Noah Massengo",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Yusuf Kabadayi",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Rodrigo Ribeiro",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "sc freiburg": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Florian Müller",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Matthias Ginter",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Christian Günter",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lukas Kübler",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Philipp Lienhart",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Maximilian Eggestein",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Rihito Yamamoto",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Patrick Osterhage",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Jan-Niklas Beste",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Vincenzo Grifo",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Florent Muslija",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Jannik Huth",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Anthony Jung",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Philipp Treu",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Yannik Engelhardt",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Rouven Tarnutzer",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Lucas Höler",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Yuito Suzuki",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "freiburg": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Florian Müller",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Matthias Ginter",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Christian Günter",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lukas Kübler",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Philipp Lienhart",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Maximilian Eggestein",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Rihito Yamamoto",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Patrick Osterhage",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Jan-Niklas Beste",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Vincenzo Grifo",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Florent Muslija",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Jannik Huth",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Anthony Jung",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Philipp Treu",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Yannik Engelhardt",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Rouven Tarnutzer",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Lucas Höler",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Yuito Suzuki",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "borussia mönchengladbach": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Tobias Sippel",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Nico Elvedi",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Kevin Diks",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Daiki Hashioka",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ko Itakura",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Florian Neuhaus",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Kevin Stöger",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Philipp Sander",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Robin Hack",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Franck Honorat",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Tim Kleindienst",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Moritz Nicolas",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Joseph Scally",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Yukhym Konoplya",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Enzo Leopold",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Gio Reyna",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Isac Lidberg",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Tomáš Čvančara",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "m'gladbach": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Tobias Sippel",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Nico Elvedi",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Kevin Diks",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Daiki Hashioka",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ko Itakura",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Florian Neuhaus",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Kevin Stöger",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Philipp Sander",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Robin Hack",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Franck Honorat",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Tim Kleindienst",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Moritz Nicolas",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Joseph Scally",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Yukhym Konoplya",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Enzo Leopold",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Gio Reyna",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Isac Lidberg",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Tomáš Čvančara",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "eintracht frankfurt": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Jens Grahl",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Timmy Chandler",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Robin Koch",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Niels Nkounkou",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Arthur Theate",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Mario Götze",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ellyes Skhiri",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Dina Ebimbe",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Michy Batshuayi",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ritsu Doan",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Jonathan Burkardt",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Michael Zetterer",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Nnamdi Collins",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Elias Baum",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Raphael Onyedika",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Fares Chaïbi",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Jessic Ngankam",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Noel Futkeu",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "frankfurt": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Jens Grahl",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Timmy Chandler",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Robin Koch",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Niels Nkounkou",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Arthur Theate",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Mario Götze",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ellyes Skhiri",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Dina Ebimbe",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Michy Batshuayi",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ritsu Doan",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Jonathan Burkardt",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Michael Zetterer",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Nnamdi Collins",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Elias Baum",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Raphael Onyedika",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Fares Chaïbi",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Jessic Ngankam",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Noel Futkeu",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "1.  union berlin": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Frederik Rønnow",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Marvin Friedrich",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Christopher Trimmel",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Josip Juranović",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Derrick Köhn",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Rani Khedira",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Janik Haberer",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Robert Skov",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Emmanuel Latte Lath",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Tim Skarke",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Oliver Burke",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Carl Klaus",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Leopold Querfeld",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Tom Rothe",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Michel Aebischer",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "András Schafer",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Andrej Ilic",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Marin Ljubicic",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "union berlin": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Frederik Rønnow",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Marvin Friedrich",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Christopher Trimmel",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Josip Juranović",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Derrick Köhn",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Rani Khedira",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Janik Haberer",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Robert Skov",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Emmanuel Latte Lath",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Tim Skarke",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Oliver Burke",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Carl Klaus",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Leopold Querfeld",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Tom Rothe",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Michel Aebischer",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "András Schafer",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Andrej Ilic",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Marin Ljubicic",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "sc paderborn 07": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Markus Schubert",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Felix Götze",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marcel Hoffmeier",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Tjark Scheller",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Mattes Hansen",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Tom Baack",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Sebastian Klaas",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Raphael Obermair",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Steffen Tigges",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Sven Michel",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Gabriel Vidovic",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Nahuel Noll",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Tristan Zobel",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Nyamekye Awortwie-Grant",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Oliver Batista-Meier",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Timur Gayret",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Stefano Marino",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Kennedy Okpala",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "sc paderborn": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Markus Schubert",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Felix Götze",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marcel Hoffmeier",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Tjark Scheller",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Mattes Hansen",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Tom Baack",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Sebastian Klaas",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Raphael Obermair",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Steffen Tigges",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Sven Michel",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Gabriel Vidovic",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Nahuel Noll",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Tristan Zobel",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Nyamekye Awortwie-Grant",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Oliver Batista-Meier",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Timur Gayret",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Stefano Marino",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Kennedy Okpala",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "sv 07 elversberg": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Tim Boss",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Florian Le Joncour",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jan Gyamerah",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Luca Sirch",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Maximilian Rohr",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Carlo Sickinger",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Amara Condé",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Łukasz Poręba",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Luca Schnellbacher",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Tom Zimmerschied",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Luca Pfeiffer",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Frank Lehmann",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Lukas Pinckert",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Lasse Günther",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Frederik Schmahl",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Noah Darvich",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Lukas Petkov",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Jason Ceka",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "elversberg": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Tim Boss",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Florian Le Joncour",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jan Gyamerah",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Luca Sirch",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Maximilian Rohr",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Carlo Sickinger",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Amara Condé",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Łukasz Poręba",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Luca Schnellbacher",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Tom Zimmerschied",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Luca Pfeiffer",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Frank Lehmann",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Lukas Pinckert",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Lasse Günther",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Frederik Schmahl",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Noah Darvich",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Lukas Petkov",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Jason Ceka",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "rb leipzig": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Ørjan Nyland",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Benjamin Henrichs",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ridle Baku",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lutsharel Geertruida",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lukas Klostermann",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Eljif Elmas",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Christoph Baumgartner",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Nicolas  Seiwald",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Johan Bakayoko",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Antonio Nusa",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Romulo Cruz",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Péter Gulácsi",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Willi Orban",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "David Raum",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Rocco Reitz",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Ezechiel Banzuzi",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Conrad Harder",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Tidiam Gomis",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "ac milan": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Pietro Terracciano",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Matteo Gabbia",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Fikayo Tomori",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Pervis Estupiñán",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Strahinja Pavlović",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Luka Modrić",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Adrien Rabiot",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ruben Loftus-Cheek",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Christian Pulisic",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Christopher Nkunku",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Rafael Leão",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Mike Maignan",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Filippo Terracciano",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Koni De Winter",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Alexis Saelemaekers",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Youssouf Fofana",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Samuel Chukwueze",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Santiago Giménez",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "milan": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Pietro Terracciano",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Matteo Gabbia",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Fikayo Tomori",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Pervis Estupiñán",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Strahinja Pavlović",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Luka Modrić",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Adrien Rabiot",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ruben Loftus-Cheek",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Christian Pulisic",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Christopher Nkunku",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Rafael Leão",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Mike Maignan",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Filippo Terracciano",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Koni De Winter",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Alexis Saelemaekers",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Youssouf Fofana",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Samuel Chukwueze",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Santiago Giménez",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "a fiorentina": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Luca Lezzerini",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Luca Ranieri",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marin Pongračić",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Dodô",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "João Mário Lopes",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Antonín Barák",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Rolando Mandragora",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Nicolò Fagioli",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Riccardo Sottil",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Moise Kean",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Mbala N'Zola",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "David De Gea",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Fabiano Parisi",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Radu Drăgușin",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Marco Brescianini",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Giovanni Fabbian",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Albert Guðmundsson",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Mateo Pellegrino",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "fiorentina": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Luca Lezzerini",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Luca Ranieri",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marin Pongračić",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Dodô",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "João Mário Lopes",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Antonín Barák",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Rolando Mandragora",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Nicolò Fagioli",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Riccardo Sottil",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Moise Kean",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Mbala N'Zola",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "David De Gea",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Fabiano Parisi",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Radu Drăgușin",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Marco Brescianini",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Giovanni Fabbian",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Albert Guðmundsson",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Mateo Pellegrino",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "as roma": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Pierluigi Gollini",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Evan N'Dicka",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Gianluca Mancini",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Mario Hermoso",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Nahuel Molina",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lorenzo Pellegrini",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Bryan Cristante",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Manu Koné",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Paulo Dybala",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Donyell Malen",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Santiago Castro",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Mile Svilar",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Anass Salah-Eddine",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Devyne Rensch",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Neil El Aynaoui",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Niccolo Pisilli",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Matias Soule",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Robinio Vaz",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "roma": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Pierluigi Gollini",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Evan N'Dicka",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Gianluca Mancini",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Mario Hermoso",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Nahuel Molina",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lorenzo Pellegrini",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Bryan Cristante",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Manu Koné",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Paulo Dybala",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Donyell Malen",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Santiago Castro",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Mile Svilar",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Anass Salah-Eddine",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Devyne Rensch",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Neil El Aynaoui",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Niccolo Pisilli",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Matias Soule",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Robinio Vaz",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "atalanta bc": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Marco Sportiello",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Sead Kolašinac",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Thomas Kristensen",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Giorgio Scalvini",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Isak Hien",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Éderson",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Raoul Bellanova",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Marten de Roon",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Gianluca Scamacca",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Giacomo Raspadori",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Nikola Krstović",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Francesco Rossi",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Odilon Kossounou",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Honest Ahanor",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Mario Pašalić",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Mitchel Bakker",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Kamal Deen Sulemana",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Vanja Vlahovic",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "atalanta": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Marco Sportiello",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Sead Kolašinac",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Thomas Kristensen",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Giorgio Scalvini",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Isak Hien",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Éderson",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Raoul Bellanova",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Marten de Roon",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Gianluca Scamacca",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Giacomo Raspadori",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Nikola Krstović",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Francesco Rossi",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Odilon Kossounou",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Honest Ahanor",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Mario Pašalić",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Mitchel Bakker",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Kamal Deen Sulemana",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Vanja Vlahovic",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "bologna  1909": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Łukasz Skorupski",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Lorenzo De Silvestri",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Torbjørn Heggem",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Juan Miranda",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Nicolò Casale",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jens Odgaard",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Nikola Moro",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Lewis Ferguson",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Riccardo Orsolini",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Federico Bernardeschi",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Artem Dovbyk",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Massimo Pessina",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Emil Holm",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Nadir Zortea",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Tommaso Pobega",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Oussama El Azzouzi",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Jesper Karlsson",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Roberto Piccoli",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "bologna": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Łukasz Skorupski",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Lorenzo De Silvestri",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Torbjørn Heggem",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Juan Miranda",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Nicolò Casale",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jens Odgaard",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Nikola Moro",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Lewis Ferguson",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Riccardo Orsolini",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Federico Bernardeschi",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Artem Dovbyk",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Massimo Pessina",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Emil Holm",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Nadir Zortea",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Tommaso Pobega",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Oussama El Azzouzi",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Jesper Karlsson",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Roberto Piccoli",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "cagliari calcio": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Boris Radunović",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Yerry Mina",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Zé Pedro Figueiredo",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Gabriele Zappa",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Giuseppe Aurelio",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alessandro Deiola",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Harry Winks",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Daniel Maldini",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Mattia Felici",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Sebastiano Esposito",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Gennaro Borrelli",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Elia Caprile",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Adam Obert",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Raphael Kofler",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Matteo Prati",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Nicolo Cavuoti",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Kevin Carlos",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Kingstone Mutandwa",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "cagliari": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Boris Radunović",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Yerry Mina",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Zé Pedro Figueiredo",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Gabriele Zappa",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Giuseppe Aurelio",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alessandro Deiola",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Harry Winks",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Daniel Maldini",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Mattia Felici",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Sebastiano Esposito",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Gennaro Borrelli",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Elia Caprile",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Adam Obert",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Raphael Kofler",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Matteo Prati",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Nicolo Cavuoti",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Kevin Carlos",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Kingstone Mutandwa",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "genoa c": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Justin Bijlow",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Stefano Sabelli",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Aaron Martín",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Johan Vásquez",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Leo Østigård",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Djibril Sow",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Morten Frendrup",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Tommaso Baldanzi",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Hamed Traoré",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Junior Messias",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Lorenzo Colombo",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Daniele Sommariva",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Mario Mitaj",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Brooke Norton-Cuffy",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Mikael Egill Ellertsson",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Alexsandro Amorim",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Vitor Oliveira",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Elias Havel",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "genoa": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Justin Bijlow",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Stefano Sabelli",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Aaron Martín",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Johan Vásquez",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Leo Østigård",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Djibril Sow",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Morten Frendrup",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Tommaso Baldanzi",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Hamed Traoré",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Junior Messias",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Lorenzo Colombo",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Daniele Sommariva",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Mario Mitaj",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Brooke Norton-Cuffy",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Mikael Egill Ellertsson",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Alexsandro Amorim",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Vitor Oliveira",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Elias Havel",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "internazionale milano": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Ivan Provedel",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Manuel Akanji",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Yann Aurel Bisseck",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alessandro Bastoni",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "John Stones",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Hakan Çalhanoğlu",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Nicolò Barella",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Piotr Zieliński",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Lautaro Martínez",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Marcus Thuram-Ulien",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ange-Yoan Bonny",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Raffaele Di Gennaro",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Benjamin Pavard",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Carlos",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Henrikh Mkhitaryan",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Luis Henrique",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Francesco Esposito",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      }
    ]
  },
  "inter": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Ivan Provedel",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Manuel Akanji",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Yann Aurel Bisseck",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alessandro Bastoni",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "John Stones",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Hakan Çalhanoğlu",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Nicolò Barella",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Piotr Zieliński",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Lautaro Martínez",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Marcus Thuram-Ulien",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ange-Yoan Bonny",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Raffaele Di Gennaro",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Benjamin Pavard",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Carlos",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Henrikh Mkhitaryan",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Luis Henrique",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Francesco Esposito",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      }
    ]
  },
  "juventus": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Mattia Perin",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Bremer",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Daniele Rugani",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lloyd Kelly",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jhon Lucumí",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Arthur",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Manuel Locatelli",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Weston McKennie",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Arkadiusz Milik",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Jérémie Boga",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Randal Kolo Muani",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Carlo Pinsoglio",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Zeki Çelik",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Juan Cabal",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Teun Koopmeiners",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Douglas Luiz",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Jonathan David",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Edon Zhegrova",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "ss lazio": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Christos Mandas",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Alfonso Pedraza",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alessio Romagnoli",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Luca Pellegrini",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Patric",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Davide Frattesi",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Danilo Cataldi",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Kenneth Taylor",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Mattia Zaccagni",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Boulaye Dia",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Gustav Isaksen",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Alessio Furlanetto",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Adam Marušić",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Mohamed Salim Fares",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Nicolò Rovella",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Fisayo Dele-Bashiru",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Gabriele Artistico",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Matteo Cancellieri",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "lazio": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Christos Mandas",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Alfonso Pedraza",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alessio Romagnoli",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Luca Pellegrini",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Patric",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Davide Frattesi",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Danilo Cataldi",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Kenneth Taylor",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Mattia Zaccagni",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Boulaye Dia",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Gustav Isaksen",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Alessio Furlanetto",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Adam Marušić",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Mohamed Salim Fares",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Nicolò Rovella",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Fisayo Dele-Bashiru",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Gabriele Artistico",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Matteo Cancellieri",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "parma calcio 1913": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Zion Suzuki",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Enrico Del Prato",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Emanuele Valeri",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lautaro Valenti",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Botond Balogh",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Adrián Bernabé",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Hans Nicolussi Caviglia",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Mandela Keita",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Pontus Almqvist",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "El Bilal Touré",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "José Romero",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Edoardo Corvi",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Franco Carboni",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Alessandro Circati",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Oliver Sørensen",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Rachid Kouda",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Matija Frigan",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Antoine Joujou",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "parma": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Zion Suzuki",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Enrico Del Prato",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Emanuele Valeri",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lautaro Valenti",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Botond Balogh",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Adrián Bernabé",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Hans Nicolussi Caviglia",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Mandela Keita",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Pontus Almqvist",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "El Bilal Touré",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "José Romero",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Edoardo Corvi",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Franco Carboni",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Alessandro Circati",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Oliver Sørensen",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Rachid Kouda",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Matija Frigan",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Antoine Joujou",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "ssc napoli": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Vanja Milinković-Savić",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Leonardo Spinazzola",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alessandro Buongiorno",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Pasquale Mazzocchi",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Giovanni Di Lorenzo",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Kevin De Bruyne",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Scott McTominay",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "André Zambo Anguissa",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Matteo Politano",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Noa Lang",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "David Neres",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Alex Meret",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Amir Rrahmani",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Mathías Olivera",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Jens Cajuste",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Stanislav Lobotka",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Lorenzo Lucca",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Jesper Lindstrøm",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "napoli": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Vanja Milinković-Savić",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Leonardo Spinazzola",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alessandro Buongiorno",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Pasquale Mazzocchi",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Giovanni Di Lorenzo",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Kevin De Bruyne",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Scott McTominay",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "André Zambo Anguissa",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Matteo Politano",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Noa Lang",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "David Neres",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Alex Meret",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Amir Rrahmani",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Mathías Olivera",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Jens Cajuste",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Stanislav Lobotka",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Lorenzo Lucca",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Jesper Lindstrøm",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "udinese calcio": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Daniele Padelli",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Enzo Ebosse",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Hassane Kamara",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alessandro Zanoli",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Christian Kabasele",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jurgen Ekkelenkamp",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Giorgi Chakvetadze",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Sandi Lovric",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Nicolò Zaniolo",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Keinan Davis",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Adam Buksa",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Maduka Okoye",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Oumar Solet",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Mërgim Vojvoda",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Jesper Karlström",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Jakub Piotrowski",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Vakoun Issouf Bayo",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Idrissa Guèye",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "udinese": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Daniele Padelli",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Enzo Ebosse",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Hassane Kamara",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alessandro Zanoli",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Christian Kabasele",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jurgen Ekkelenkamp",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Giorgi Chakvetadze",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Sandi Lovric",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Nicolò Zaniolo",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Keinan Davis",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Adam Buksa",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Maduka Okoye",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Oumar Solet",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Mërgim Vojvoda",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Jesper Karlström",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Jakub Piotrowski",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Vakoun Issouf Bayo",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Idrissa Guèye",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "venezia": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Alessio Pozzi",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Marin Šverko",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ridgeciano Haps",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Thierry Correia",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Armel Bella Kotchap",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alfred Duncan",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Þórir Jóhann Helgason",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Toma Bašić",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Lion Lauberbach",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Akor Adams",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "John Yeboah",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Lorenzo Montipò",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Bartol Franjić",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Redouane Halhal",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Kike Pérez",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Emil Bohinen",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Andrea Adorante",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Alvin Okoro",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "venezia fc": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Alessio Pozzi",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Marin Šverko",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ridgeciano Haps",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Thierry Correia",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Armel Bella Kotchap",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alfred Duncan",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Þórir Jóhann Helgason",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Toma Bašić",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Lion Lauberbach",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Akor Adams",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "John Yeboah",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Lorenzo Montipò",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Bartol Franjić",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Redouane Halhal",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Kike Pérez",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Emil Bohinen",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Andrea Adorante",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Alvin Okoro",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "frosinone calcio": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Matteo Pisseri",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Kevin Akpoguma",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Aleksa Terzić",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Sergio Kalaj",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Niccolò Corrado",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Florian Grillitsch",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Alessio Zerbin",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ben Lhassine Kone",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Antonio Raimondo",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Seydou Fini",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Giorgi Kvernadze",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Sebastiano Desplanches",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Ilario Monterisi",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Anthony Oyono",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Romano Schmid",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Francesco Gelli",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Kevin Barcella",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Farés Ghedjemis",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "frosinone": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Matteo Pisseri",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Kevin Akpoguma",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Aleksa Terzić",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Sergio Kalaj",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Niccolò Corrado",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Florian Grillitsch",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Alessio Zerbin",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ben Lhassine Kone",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Antonio Raimondo",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Seydou Fini",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Giorgi Kvernadze",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Sebastiano Desplanches",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Ilario Monterisi",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Anthony Oyono",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Romano Schmid",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Francesco Gelli",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Kevin Barcella",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Farés Ghedjemis",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "us sassuolo calcio": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Giacomo Satalino",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Jay Idzes",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Sebastian Walukiewicz",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Fali Candé",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Josh Doig",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Fabrizio Caligara",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Nemanja Matić",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Kristian Thorstvedt",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Andrea Pinamonti",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Domenico Berardi",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Nicholas Pierini",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Stefano Turati",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Cas Odenthal",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Filippo Missori",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Andrea Ghion",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Daniel Boloca",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Armand Lauriente",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Kieron Bowie",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "sassuolo": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Giacomo Satalino",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Jay Idzes",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Sebastian Walukiewicz",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Fali Candé",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Josh Doig",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Fabrizio Caligara",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Nemanja Matić",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Kristian Thorstvedt",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Andrea Pinamonti",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Domenico Berardi",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Nicholas Pierini",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Stefano Turati",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Cas Odenthal",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Filippo Missori",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Andrea Ghion",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Daniel Boloca",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Armand Lauriente",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Kieron Bowie",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "torino": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Alberto Paleari",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Cristiano Biraghi",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ardian Ismajli",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Eray Cömert",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marcus Pedersen",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Nikola Vlašić",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ivan Ilić",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Faustino Anjorin",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Giovanni Simeone",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Duván Zapata",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Che Adams",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Franco Israel",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Saúl Coco",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Ali Dembele",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Kian Fitz-Jim",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Gaetano Oristanio",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Pietro Pellegri",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Sandro Kulenović",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "us lce": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Marco Bleve",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Antonino Gallo",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Gaby Jean",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Corrie Ndaba",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jamil Siebert",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lassana Coulibaly",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Youssef Maleh",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Omri Gandelman",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Willem Geubbels",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Santiago Pierotti",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Lameck Banda",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Wladimiro Falcone",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Danilo Veiga",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Sebastian Esposito",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Mohamed Kaba",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Sadik Fofana",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Nikola Štulić",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Konan N'Dri",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "lecce": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Marco Bleve",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Antonino Gallo",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Gaby Jean",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Corrie Ndaba",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jamil Siebert",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lassana Coulibaly",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Youssef Maleh",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Omri Gandelman",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Willem Geubbels",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Santiago Pierotti",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Lameck Banda",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Wladimiro Falcone",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Danilo Veiga",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Sebastian Esposito",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Mohamed Kaba",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Sadik Fofana",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Nikola Štulić",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Konan N'Dri",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "ac monza": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Semuel Pizzignacco",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Valentin Antov",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Samuele Birindelli",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ricardo Mangas",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Filippo Delli Carri",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Andrea Colpani",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Matteo Pessina",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Patrick Ciurria",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Patrick Cutrone",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Andrea Petagna",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Dany Mota Carvalho",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Demba Thiam",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Andrea Carboni",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Lorenzo Lucchesi",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Idrissa Touré",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Nicolas Galazzi",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Keïta Baldé",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Omari Forson",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "monza": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Semuel Pizzignacco",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Valentin Antov",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Samuele Birindelli",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ricardo Mangas",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Filippo Delli Carri",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Andrea Colpani",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Matteo Pessina",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Patrick Ciurria",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Patrick Cutrone",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Andrea Petagna",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Dany Mota Carvalho",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Demba Thiam",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Andrea Carboni",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Lorenzo Lucchesi",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Idrissa Touré",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Nicolas Galazzi",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Keïta Baldé",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Omari Forson",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "como 1907": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Mauro Vigorito",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Edoardo Goldaniga",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Trevoh Chalobah",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marc-Oliver Kempf",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alberto Dossena",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Luca Mazzitelli",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Luis Milla",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Maxence Caqueret",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Álvaro Morata",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Anastasios Douvikas",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Nicolas Kühn",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Emil Audero",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Ivan Smolčić",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Ignace Van Der Brempt",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Lucas Da Cunha",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Matthias Braunöder",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Alessandro Gabrielloni",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Tommaso Fumagalli",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "toulouse": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Guillaume Restes",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Rasmus Nicolaisen",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Mark McKenzie",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Charlie Cresswell",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "David Odogu",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Niklas Schmidt",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Cristian Cásseres Jr.",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Francis Abu",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Yann Gboho",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Jacen Russell-Rowe",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Santiago Hidalgo",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Mathys Niflore",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Ilyes Aradj",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Rafik Messali",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Aron Dönnum",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Thomas Jørgensen",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Sion Oppong",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Enzo Faty",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "stade brestois 29": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Grégoire Coudert",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Brendan Chardonnet",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Gautier Lloris",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Kenny Lala",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Bradley Locko",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lucas Tousart",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Hugo Magnetti",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Joris Chotard",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ludovic Ajorque",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Romain Del Castillo",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Mama Baldé",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Egil Selvik",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Luc Zogbe",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Raphaël Le Guen",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Mamady Diambou",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Kamory Doumbia",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Axel Camblan",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Pathé Mboup",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "brest": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Grégoire Coudert",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Brendan Chardonnet",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Gautier Lloris",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Kenny Lala",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Bradley Locko",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lucas Tousart",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Hugo Magnetti",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Joris Chotard",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ludovic Ajorque",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Romain Del Castillo",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Mama Baldé",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Egil Selvik",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Luc Zogbe",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Raphaël Le Guen",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Mamady Diambou",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Kamory Doumbia",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Axel Camblan",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Pathé Mboup",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "olympique de marseille": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Géronimo Rulli",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Ulisses Garcia",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Emerson",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Facundo Medina",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Nayef Aguerd",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Angel Gomes",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Pierre Emile Højbjerg",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Tim Weah",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Amine Harit",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Neal Maupay",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Amine Gouiri",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Jeffrey De Lange",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Leonardo Balerdi",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Derek Cornelius",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Geoffrey Kondogbia",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Himad Abdelli",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Igor Paixão",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Faris Moumbagna",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "marseille": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Géronimo Rulli",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Ulisses Garcia",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Emerson",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Facundo Medina",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Nayef Aguerd",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Angel Gomes",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Pierre Emile Højbjerg",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Tim Weah",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Amine Harit",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Neal Maupay",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Amine Gouiri",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Jeffrey De Lange",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Leonardo Balerdi",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Derek Cornelius",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Geoffrey Kondogbia",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Himad Abdelli",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Igor Paixão",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Faris Moumbagna",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "aj auxerre": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Paul Nardi",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Francisco Sierralta",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Bryan Okoh",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Sinaly Diomandé",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marvin Senaya",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Assane Dioussé",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Elisha Owusu",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Romain Faivre",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Daniel Namaso",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Eros Maddy",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Theo Bair",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Mamadou Diop",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Fredrik Oppegard",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Lamine Sy",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Naouirou Ahamada",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Kevin Danois",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Josué Casimir",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Lasso Coulibaly",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "auxerre": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Paul Nardi",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Francisco Sierralta",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Bryan Okoh",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Sinaly Diomandé",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marvin Senaya",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Assane Dioussé",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Elisha Owusu",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Romain Faivre",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Daniel Namaso",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Eros Maddy",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Theo Bair",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Mamadou Diop",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Fredrik Oppegard",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Lamine Sy",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Naouirou Ahamada",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Kevin Danois",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Josué Casimir",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Lasso Coulibaly",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "lille osc": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Arnaud Bodart",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Romain Perraud",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Calvin Verdonk",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Nianzou Kouassi",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alexsandro Ribeiro",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Nabil Bentaleb",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Benjamin André",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Hákon Arnar Haraldsson",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Mohamed Bayo",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Gaëtan Perrin",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Olivier Giroud",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Berke Özer",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Tiago Santos",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Nathan Ngoy",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Ugo Raghouber",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Ngal'ayel Mukau",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Osame Sahraoui",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Félix Correia",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "lille": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Arnaud Bodart",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Romain Perraud",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Calvin Verdonk",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Nianzou Kouassi",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alexsandro Ribeiro",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Nabil Bentaleb",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Benjamin André",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Hákon Arnar Haraldsson",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Mohamed Bayo",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Gaëtan Perrin",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Olivier Giroud",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Berke Özer",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Tiago Santos",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Nathan Ngoy",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Ugo Raghouber",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Ngal'ayel Mukau",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Osame Sahraoui",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Félix Correia",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "ogc nice": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Yehvann Diouf",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Jonathan Clauss",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ali El Abdi",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Mattia Viti",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Melvin Bard",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Laurent Abergel",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Axel Witsel",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Morgan Sanson",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Gauthier Hein",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Sofiane Diop",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Isak Jansson",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Teddy Boulhendi",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Antoine Mendy",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Youssouf Ndayishimiye",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Everton",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Salis Abdul Samed",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Nathan N'Goumou",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Terem Moffi",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "nice": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Yehvann Diouf",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Jonathan Clauss",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ali El Abdi",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Mattia Viti",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Melvin Bard",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Laurent Abergel",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Axel Witsel",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Morgan Sanson",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Gauthier Hein",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Sofiane Diop",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Isak Jansson",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Teddy Boulhendi",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Antoine Mendy",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Youssouf Ndayishimiye",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Everton",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Salis Abdul Samed",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Nathan N'Goumou",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Terem Moffi",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "olympique lyonnais": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Rémy Descamps",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Nicolás Tagliafico",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ainsley Maitland-Niles",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Moussa Niakhaté",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Clinton Mata",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Corentin Tolisso",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Orel Mangala",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Paul Akouokou",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Loïs Openda",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Julien Duranville",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ernest Nuamah",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Dominik Greif",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Duje Ćaleta-Car",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Felix Bacher",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Pavel Šulc",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Tanner Tessmann",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Malick Fofana",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Kaïl Boudache",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "olympique lyon": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Rémy Descamps",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Nicolás Tagliafico",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ainsley Maitland-Niles",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Moussa Niakhaté",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Clinton Mata",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Corentin Tolisso",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Orel Mangala",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Paul Akouokou",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Loïs Openda",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Julien Duranville",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ernest Nuamah",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Dominik Greif",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Duje Ćaleta-Car",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Felix Bacher",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Pavel Šulc",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Tanner Tessmann",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Malick Fofana",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Kaïl Boudache",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "paris saint-germain": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Matvei Safonov",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Achraf Hakimi",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marquinhos",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lucas Digne",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lucas Hernández",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Fabián Ruiz",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Renato Sanches",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Vitinha",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ousmane Dembélé",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Randal Kolo Muani",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ferrán Torres",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Lucas Chevalier",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "William Pacho",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Illia Zabarnyi",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Warren Zaïre-Emery",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Joao Neves",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Khvicha Kvaratskhelia",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Bradley Barcola",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "psg": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Matvei Safonov",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Achraf Hakimi",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marquinhos",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lucas Digne",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lucas Hernández",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Fabián Ruiz",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Renato Sanches",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Vitinha",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ousmane Dembélé",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Randal Kolo Muani",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ferrán Torres",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Lucas Chevalier",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "William Pacho",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Illia Zabarnyi",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Warren Zaïre-Emery",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Joao Neves",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Khvicha Kvaratskhelia",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Bradley Barcola",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "lorient": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Benjamin Leroy",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Alec Georgen",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Souleymane Isaak Toure",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Formose Mendy",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Montassar Talbi",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jean-Victor Makengo",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Noah Cadiou",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Bandiougou Fadiga",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Aiyegun Tosin",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Mohamed Bamba",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Jérémy Hatchi",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Bingourou Kamara",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Dembo Sylla",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Nathaniel Adjei",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Joel Mugisha",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Noah Mbamba",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Souleymane Faye",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      }
    ]
  },
  "stade rennais  1901": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Nicolas Lemaître",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Przemysław Frankowski",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Bryan Reynolds",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lilian Brassier",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alidu Seidu",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Seko Fofana",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Mahdi Camara",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Valentin Rongier",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Arnaud Nordin",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Breel Embolo",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Musa Al Taamari",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Brice Samba",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Anthony Rouault",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Charlie Cresswell",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Adrien Thomasson",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Sebastian Szymański",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Esteban Lepaul",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Issa Soumaré",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "stade rennais": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Nicolas Lemaître",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Przemysław Frankowski",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Bryan Reynolds",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lilian Brassier",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alidu Seidu",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Seko Fofana",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Mahdi Camara",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Valentin Rongier",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Arnaud Nordin",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Breel Embolo",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Musa Al Taamari",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Brice Samba",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Anthony Rouault",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Charlie Cresswell",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Adrien Thomasson",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Sebastian Szymański",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Esteban Lepaul",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Issa Soumaré",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "es troyes ac": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Zacharie Boucher",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Adrien Monfray",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Paolo Gozzi Iweru",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ismaëlben Boura",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Thierno Baldé",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alexandre Phliponeau",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Iron Gomis",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Antoine Mille",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Renaud Ripart",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Kandet Diawara",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ibrahim Traoré",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Hillel Konaté",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Lucas Maronnier",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Michel Diaz",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Mouhamed Diop",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Hugo Picard",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Merwan Ifnaoui",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Amadou Diakite",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "troyes": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Zacharie Boucher",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Adrien Monfray",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Paolo Gozzi Iweru",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ismaëlben Boura",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Thierno Baldé",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alexandre Phliponeau",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Iron Gomis",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Antoine Mille",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Renaud Ripart",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Kandet Diawara",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ibrahim Traoré",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Hillel Konaté",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Lucas Maronnier",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Michel Diaz",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Mouhamed Diop",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Hugo Picard",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Merwan Ifnaoui",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Amadou Diakite",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "angers sco": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Anthony Lopes",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Carlens Arcus",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jordan Lefort",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ousman Camara",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jacques Ekomie",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Haris Belkebla",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Branco van den Boomen",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Louis Mouton",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Jim Allevinah",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Amine El Ouazzani",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Mamadou Usman Simbakoli",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Melvin Zinga",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Emmanuel Biumla",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Lilian Rao-Lisoa",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Yassin Belkhdim",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Marius Courcoul",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Amine Sbaï",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Anthony Bermont",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "le havre ac": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Mory Diaw",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Vincent Sasso",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ayumu Seko",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Timothee Pembele",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Fodé Doucouré",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Kaito Mizuta",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Amir Richardson",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Rassoul N'Diaye",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Josh Maja",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Mbwana Samatta",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Godson Kyeremeh",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Lionel Mpasi",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Yanis Zouaoui",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Stephan Zagadou",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Junior Mwanga",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Simon Ebonog",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Felix Mambimbi",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Andy Logbo",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "le havre": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Mory Diaw",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Vincent Sasso",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ayumu Seko",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Timothee Pembele",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Fodé Doucouré",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Kaito Mizuta",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Amir Richardson",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Rassoul N'Diaye",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Josh Maja",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Mbwana Samatta",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Godson Kyeremeh",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Lionel Mpasi",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Yanis Zouaoui",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Stephan Zagadou",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Junior Mwanga",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Simon Ebonog",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Felix Mambimbi",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Andy Logbo",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "le mans": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Nicolas Kocik",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Lucas Buadés",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Samuel Yohou",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Djibril Sidibé",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Yasser Larouci",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Edwin Quarshie",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Alexandre Lauray",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Jean Vercruysse",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Antoine Rabillard",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Dame Guèye",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Louis Mafouta",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Ewan Hatfout",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Raúl Torrente",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Harold Voyer",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Milan Robin",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Martin Rossignol",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Erwan Colas",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Bilal Brahimi",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "racing club de lens": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Hervé Koffi",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Jonathan Gradit",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ruben Aguilar",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Matthieu Udol",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Maik Nawrocki",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Thorgan Hazard",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Mickaël Cuisance",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Amadou Haïdara",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Florian Thauvin",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Odsonne Edouard",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Florian Sotoca",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Mathieu Gorgelin",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Saud Abdulhamid",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Jhoanner Chavez",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Mamadou Sangare",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Alpha Diallo",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Michał Skóraś",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Abdallah Sima",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "rc lens": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Hervé Koffi",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Jonathan Gradit",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ruben Aguilar",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Matthieu Udol",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Maik Nawrocki",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Thorgan Hazard",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Mickaël Cuisance",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Amadou Haïdara",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Florian Thauvin",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Odsonne Edouard",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Florian Sotoca",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Mathieu Gorgelin",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Saud Abdulhamid",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Jhoanner Chavez",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Mamadou Sangare",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Alpha Diallo",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Michał Skóraś",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Abdallah Sima",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "as monaco": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Lukáš Hrádecký",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Eric Dier",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Thilo Kehrer",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jordan Teze",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Mohammed Salisu",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Paul Pogba",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Aleksandr Golovin",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Denis Zakaria",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Takumi Minamino",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ansu Fati",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Folarin Balogun",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Philipp Köhn",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Vanderson",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Flávio Nazinho",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Edan Diop",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Lamine Camara",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Matthis Abline",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Maghnes Akliouche",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "monaco": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Lukáš Hrádecký",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Eric Dier",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Thilo Kehrer",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jordan Teze",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Mohammed Salisu",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Paul Pogba",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Aleksandr Golovin",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Denis Zakaria",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Takumi Minamino",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ansu Fati",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Folarin Balogun",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Philipp Köhn",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Vanderson",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Flávio Nazinho",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Edan Diop",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Lamine Camara",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Matthis Abline",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Maghnes Akliouche",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "rc strasbourg alsace": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Filip Jörgensen",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Ben Chilwell",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ismaël Doukouré",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Saïdou Sow",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Andrew Omobamidele",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Gio Reyna",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Julio Enciso",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Valentin Barco",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Sebastian Nanasi",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Sekou Mara",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Oscar Perea",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Miłosz Piekutowski",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Soumaïla Coulibaly",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Abakar Sylla",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Junior Mwanga",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Diego Moreira",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Joaquín Panichelli",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Martial Godo",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "strasbourg": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Filip Jörgensen",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Ben Chilwell",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ismaël Doukouré",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Saïdou Sow",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Andrew Omobamidele",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Gio Reyna",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Julio Enciso",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Valentin Barco",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Sebastian Nanasi",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Sekou Mara",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Oscar Perea",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Miłosz Piekutowski",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Soumaïla Coulibaly",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Abakar Sylla",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Junior Mwanga",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Diego Moreira",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Joaquín Panichelli",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Martial Godo",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "paris": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Kevin Trapp",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Hamari Traoré",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Thibault De Smet",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Tuomas Ollila",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Samir Chergui",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Vincent Marchetti",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Maxime López",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Pierre Lees Melou",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Lassine Sinayoko",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Alimami Gory",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ciro Immobile",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Obed Nkambadio",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Otavio Ataide",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Mamadou Mbow",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Adama Camara",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Patrick Zabi",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Moses Simon",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Jonathan Ikoné",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "paris fc": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Kevin Trapp",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Hamari Traoré",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Thibault De Smet",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Tuomas Ollila",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Samir Chergui",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Vincent Marchetti",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Maxime López",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Pierre Lees Melou",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Lassine Sinayoko",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Alimami Gory",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ciro Immobile",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Obed Nkambadio",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Otavio Ataide",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Mamadou Mbow",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Adama Camara",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Patrick Zabi",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Moses Simon",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Jonathan Ikoné",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "fluminense": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Fábio",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Samuel Xavier",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Igor Rabello",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Renê",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Guga",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ganso",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Alisson",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Otávio",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Hulk",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Germán Cano",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Agustín Canobbio",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Vitor Eudes",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Guilherme Arana",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Ignácio",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Yeferson Soteldo",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "David Terans",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Yago",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Kevin Serna",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "ca mineiro": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Everson",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Vitor Hugo",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Júnior Alonso",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ángelo Preciado",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Natanael",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Maycon",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Bernard",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Alan Franco",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Dudu",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Mateo Cassierra",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Eric Soares",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Gabriel Delfim",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Iván Román",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Igor",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Tomás Cuello",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Gustavo Scarpa",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Ryan Felipe",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "João Castro",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "mineiro": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Everson",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Vitor Hugo",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Júnior Alonso",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ángelo Preciado",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Natanael",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Maycon",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Bernard",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Alan Franco",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Dudu",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Mateo Cassierra",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Eric Soares",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Gabriel Delfim",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Iván Román",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Igor",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Tomás Cuello",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Gustavo Scarpa",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Ryan Felipe",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "João Castro",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "grêmio fbpa": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Weverton",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Marlon",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Walter Kannemann",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marcos Rocha",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "João Pedro",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Dodi",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Arthur",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Felipe Carballo",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Cristian Pavón",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Francis Amuzu",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Andre",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Gabriel Chapeco",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Fabián Balbuena",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Erick Noriega",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Mathías Villasanti",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Caio Paulista",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Smiley",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Jeferson",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "grêmio": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Weverton",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Marlon",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Walter Kannemann",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marcos Rocha",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "João Pedro",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Dodi",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Arthur",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Felipe Carballo",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Cristian Pavón",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Francis Amuzu",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Andre",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Gabriel Chapeco",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Fabián Balbuena",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Erick Noriega",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Mathías Villasanti",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Caio Paulista",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Smiley",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Jeferson",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "ca paranaense": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Santos",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Léo",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Dudu",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Juan Aguirre",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alejandro García",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jádson",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Luiz Gustavo",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Bruno Zapelli",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Julimar",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Renan",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Kevin Viveros",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Mycael",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Carlos Terán",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Gastón Benavídez",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Juan Portilla",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Isaac",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Renan Peixoto",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Leozinho",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "paranaense": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Santos",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Léo",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Dudu",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Juan Aguirre",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alejandro García",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jádson",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Luiz Gustavo",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Bruno Zapelli",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Julimar",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Renan",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Kevin Viveros",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Mycael",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Carlos Terán",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Gastón Benavídez",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Juan Portilla",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Isaac",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Renan Peixoto",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Leozinho",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "se palmeiras": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Marcelo Lomba",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Gustavo Gómez",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Joaquín Piquerez",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alexander Barboza",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Bruno Fuchs",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marlon Freitas",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Jhon Arias",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Lucas Evangelista",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Paulinho",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ramón Sosa",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "José Manuel López",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Carlos Miguel",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Khellven",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Murilo Cerqueira",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Mauricio",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Emiliano Martínez",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Luighi Hanri",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Riquelme Fillipi",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "palmeiras": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Marcelo Lomba",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Gustavo Gómez",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Joaquín Piquerez",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alexander Barboza",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Bruno Fuchs",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marlon Freitas",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Jhon Arias",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Lucas Evangelista",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Paulinho",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Ramón Sosa",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "José Manuel López",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Carlos Miguel",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Khellven",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Murilo Cerqueira",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Mauricio",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Emiliano Martínez",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Luighi Hanri",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Riquelme Fillipi",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "botafogo fr": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Neto",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Vitinho",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marçal",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alex Telles",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Nahuel Ferraresi",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Edenilson",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Allan",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Santiago Rodríguez",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Joaquín Correa",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Júnior Santos",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Chris Ramos",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Raul",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Kaio Pantaleão",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Caio Roque",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Danilo dos Santos de Oliveira",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Cristian Medina",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Weliton Santos",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Nathan Ribeiro",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "botafogo": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Neto",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Vitinho",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marçal",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alex Telles",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Nahuel Ferraresi",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Edenilson",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Allan",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Santiago Rodríguez",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Joaquín Correa",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Júnior Santos",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Chris Ramos",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Raul",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Kaio Pantaleão",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Caio Roque",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Danilo dos Santos de Oliveira",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Cristian Medina",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Weliton Santos",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Nathan Ribeiro",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "cruzeiro": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Cássio",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Fabrício Bruno",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Fágner",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "William",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lucas Villalba",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lucas Romero",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Lucas Silva",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Gerson",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Chico",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Matheus Pereira",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Bruno Rodrigues",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Matheus Cunha",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "João Marcelo",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Kaiki Bruno",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Wanderson",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Christian",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Neizer Villarreal",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Ruan",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "chapoense af": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Rafael Santos",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Bruno Pacheco",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Rafael Thyere",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marcinho",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Neto Pessoa",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Giovanni Augusto",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Yannick Bolasie",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Jean Carlos",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Kevin Ramírez",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Maurício Garcez",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Vinicius",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Anderson",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Marcos Vinicius",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Walter Clar",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Wermeson",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Camilo",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Alberto Pagnoncelli",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Gleidson",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "chapecoense": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Rafael Santos",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Bruno Pacheco",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Rafael Thyere",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Marcinho",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Neto Pessoa",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Giovanni Augusto",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Yannick Bolasie",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Jean Carlos",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Kevin Ramírez",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Maurício Garcez",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Vinicius",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Anderson",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Marcos Vinicius",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Walter Clar",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Wermeson",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Camilo",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Alberto Pagnoncelli",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Gleidson",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "são paulo": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Carlos Coronel",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Robert Arboleda",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lucas Ramon",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alan Franco",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Enzo Díaz",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lucas Moura",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Cauly",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Danielzinho",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Artur Guimaraes",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Jonathan Calleri",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Luciano",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Rafael Monteiro",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Luan",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "José Sabino",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Marcos Antônio",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Ferreira",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "André Silva",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Gonzalo Tapia",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "bahia": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "João Paulo",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Gilberto",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Kanu",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "David Duarte",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Santiago Ramos",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Jean Lucas",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Éverton Ribeiro",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Erick",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ademir Santos",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Michel Araujo",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Everaldo",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Ronaldo",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Luciano Juba",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Marcos Victor",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Nicolás Acevedo",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Rodrigo Nestor",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Joao Vitor",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Roger Gabriel",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "sc corinthians paulista": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Hugo Souza",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Matheuzinho",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "André Ramalho",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Raniele",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Hugo",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Charles",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Alex Santana",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Matheus Pereira",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Yuri Alberto",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Memphis Depay",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Vitinho",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Matheus Donelli",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Pedro Milans",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Bidu",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Jesse Lingard",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Zakaria Labyad",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Pedro Raul",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Dieguinho",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "corinthians": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Hugo Souza",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Matheuzinho",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "André Ramalho",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Raniele",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Hugo",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Charles",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Alex Santana",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Matheus Pereira",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Yuri Alberto",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Memphis Depay",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Vitinho",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Matheus Donelli",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Pedro Milans",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Bidu",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Jesse Lingard",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Zakaria Labyad",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Pedro Raul",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Dieguinho",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "cr vasco da gama": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Daniel Fuzato",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Carlos Cuesta",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "José Rodríguez",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lucas Piton",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lucas Freitas",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Tchê Tchê",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "David",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Thiago Mendes",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Marino Hinestroza",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Matheus Franca",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Carlos Gómez",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Léo Jardim",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Paulo Henrique",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Robert",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Jair",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Claudio Spinelli",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Lukas Zuccarello",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Riquelme Avellar",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "vasco da gama": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Daniel Fuzato",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Carlos Cuesta",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "José Rodríguez",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lucas Piton",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lucas Freitas",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Tchê Tchê",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "David",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Thiago Mendes",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Marino Hinestroza",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Matheus Franca",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Carlos Gómez",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Léo Jardim",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Paulo Henrique",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Robert",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Jair",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Claudio Spinelli",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Lukas Zuccarello",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Riquelme Avellar",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "vitória": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Gabriel",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Neris",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Carlos Eduardo",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Camutanga",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Cacá",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ronald",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Marinho",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Aitor Cantalapiedra",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Osvaldo",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Renato Kayzer",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Erick",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Yuri Sena",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Luan Cândido",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Jamerson",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Leandro Martínez",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Gabriel Baralhas",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Renzo López",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Fabrício",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "cr flamengo": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Agustín Rossi",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Ayrton Lucas",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Leo Ortiz",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alex Sandro",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Guillermo Varela",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Giorgian De Arrascaeta",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Lucas Paquetá",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Erick Pulgar",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Pedro",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Éverton",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Bruno Henrique",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Andrew",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Danilo Luiz da Silva",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Léo Pereira",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Jorge Carrascal",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Gonzalo Plata",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Luiz Araújo",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Guilherme",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "flamengo": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Agustín Rossi",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Ayrton Lucas",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Leo Ortiz",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alex Sandro",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Guillermo Varela",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Giorgian De Arrascaeta",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Lucas Paquetá",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Erick Pulgar",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Pedro",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Éverton",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Bruno Henrique",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Andrew",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Danilo Luiz da Silva",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Léo Pereira",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Jorge Carrascal",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Gonzalo Plata",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Luiz Araújo",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Guilherme",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "coritiba fbc": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Keiller",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Rodrigo Moledo",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Felipe Jonatan",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Tinga",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Bruno Melo",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Thiago Santos",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Willian Oliveira",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Fernando Sobral",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Keno",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Pedro Rocha",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Rodrigo Rodrigues",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Gabriel Leite",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Maicon",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Tiago",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Sebastián Gómez",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Josué",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Fabinho",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Breno Lopes",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "coritiba": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Keiller",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Rodrigo Moledo",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Felipe Jonatan",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Tinga",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Bruno Melo",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Thiago Santos",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Willian Oliveira",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Fernando Sobral",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Keno",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Pedro Rocha",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Rodrigo Rodrigues",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Gabriel Leite",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Maicon",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Tiago",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Sebastián Gómez",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Josué",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Fabinho",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Breno Lopes",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "rb bragantino": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Cleiton",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Pedro Henrique",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Juninho Capixaba",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ariel Sant'Anna",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Eduardo Santos",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Matheus Fernandes",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Gabriel",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Eric Ramires",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Eduardo Sasha",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Fernando",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Isidro Pitta",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Tiago Volpi",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "José Hurtado",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Guzmán Rodríguez",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Bruno Praxedes",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Ignacio Sosa",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "João Neto",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Henry Mosquera",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "bragantino": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Cleiton",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Pedro Henrique",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Juninho Capixaba",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ariel Sant'Anna",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Eduardo Santos",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Matheus Fernandes",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Gabriel",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Eric Ramires",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Eduardo Sasha",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Fernando",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Isidro Pitta",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Tiago Volpi",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "José Hurtado",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Guzmán Rodríguez",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Bruno Praxedes",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Ignacio Sosa",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "João Neto",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Henry Mosquera",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "clube do remo": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Ivan",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Marllon",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Yago Pikachu",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Léo Andrade",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Mayk",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Patrick",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Víctor Cantillo",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Gabriel Taliari",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Carlinhos",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "João Pedro",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Gabriel Poveda",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Marcelo Rangel",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Matheus Alexandre",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "João Lucas",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Panagiotis Tachtsidis",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Zé Ricardo",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Alef Manga",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Jáderson",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "mirassol": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Walter",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Victor Luis",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Reinaldo",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Daniel Borges",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Willian Machado",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Gabriel",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Shaylon",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Yuri",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Neto Moura",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Igor Cariús",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "André Luis",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Georgemy",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Rodrigues",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "João Victor",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Everton",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Lucas Mugni",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Nathan",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Tiquinho Soares",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "sc internacional": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Sergio Rochet",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Gabriel Mercado",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Félix Torres",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alexandro Bernabei",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Matheus Bahia",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Bruno Henrique",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ronaldo",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Thiago Maia",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Richard",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Alerrandro",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Johan Carbonero",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Anthoni",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Braian Aguirre",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Victor Gabriel",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Alan Patrick",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Rodrigo Villagra",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Tabata",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Vitinho",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "internacional": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Sergio Rochet",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Gabriel Mercado",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Félix Torres",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Alexandro Bernabei",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Matheus Bahia",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Bruno Henrique",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ronaldo",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Thiago Maia",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Richard",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Alerrandro",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Johan Carbonero",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Anthoni",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Braian Aguirre",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Victor Gabriel",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Alan Patrick",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Rodrigo Villagra",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Tabata",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Vitinho",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "santos": {
    "formation": "4-3-3",
    "starting_xi": [
      {
        "name": "Gabriel Brazão",
        "number": 1,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Luan Peres",
        "number": 2,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Mayke",
        "number": 3,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Lucas Veríssimo",
        "number": 4,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Igor Vinícius",
        "number": 5,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Thaciano",
        "number": 6,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Zé Rafael",
        "number": 7,
        "pos": "CM",
        "rating": 7.75,
        "goals": 4,
        "assists": 5,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Willian Arão",
        "number": 8,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 2.4,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Rony",
        "number": 9,
        "pos": "RW",
        "rating": 7.8,
        "goals": 8,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Gabriel Barbosa",
        "number": 10,
        "pos": "ST",
        "rating": 8.05,
        "goals": 11,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Neymar",
        "number": 11,
        "pos": "LW",
        "rating": 7.8,
        "goals": 14,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.2,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Diogenes",
        "number": 12,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Gonzalo Escobar",
        "number": 13,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Zé Ivaldo",
        "number": 14,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "João Schmidt",
        "number": 15,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Tomás Rincón",
        "number": 16,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Alexandre Guedes",
        "number": 17,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Moises",
        "number": 18,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  }
};

// 100% Non-overlapping tactical formation coordinates (Home: 6% to 43%, Away: 57% to 94%)
const FORMATION_COORDINATES: Record<string, [number, number][]> = {
  '4-3-3': [
    [50, 6],
    [14, 16], [38, 15], [62, 15], [86, 16],
    [26, 26], [50, 25], [74, 26],
    [16, 40], [50, 43], [84, 40],
  ],
  '4-2-3-1': [
    [50, 6],
    [14, 16], [38, 15], [62, 15], [86, 16],
    [33, 25], [67, 25],
    [14, 34], [50, 33], [86, 34],
    [50, 43],
  ],
  '3-4-2-1': [
    [50, 6],
    [25, 15], [50, 14], [75, 15],
    [12, 25], [36, 24], [64, 24], [88, 25],
    [28, 34], [72, 34],
    [50, 43],
  ],
  '3-5-2': [
    [50, 6],
    [25, 15], [50, 14], [75, 15],
    [12, 26], [32, 25], [50, 24], [68, 25], [88, 26],
    [34, 42], [66, 42],
  ],
  '4-4-2': [
    [50, 6],
    [14, 16], [38, 15], [62, 15], [86, 16],
    [14, 27], [38, 26], [62, 26], [86, 27],
    [34, 42], [66, 42],
  ],
  '5-3-2': [
    [50, 6],
    [10, 16], [28, 15], [50, 14], [72, 15], [90, 16],
    [26, 26], [50, 25], [74, 26],
    [34, 42], [66, 42],
  ],
};

const REGIONAL_FIRST = [
  'Lucas', 'Gabriel', 'Matheus', 'Rodrigo', 'Felipe', 'Bruno', 'Eduardo', 'Diego', 'Carlos', 'Thiago',
  'Marco', 'Julian', 'Antoine', 'Victor', 'Alex', 'David', 'Pablo', 'Alvaro', 'Rafael', 'Sergio',
  'Martin', 'Henrik', 'Sandro', 'Daniel', 'Oscar', 'Jonas', 'Maximiliano', 'Guillermo', 'Ignacio', 'Fabian'
];
const REGIONAL_LAST = [
  'Silva', 'Santos', 'Oliveira', 'Pereira', 'Ferreira', 'Alves', 'Rodrigues', 'Costa', 'Fernandez', 'Gomez',
  'Martinez', 'Lopez', 'Sanchez', 'Perez', 'Gonzalez', 'Rodriguez', 'Morales', 'Navarro', 'Castro', 'Vargas',
  'Schmidt', 'Muller', 'Weber', 'Schneider', 'Fischer', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann'
];

export function resolveTeamLineup(teamName: string, formation: string, isHome: boolean): TeamLineup {
  const clean = teamName.toLowerCase().replace(/\b(fc|cf|ca|afc|ec|sc|ac|cd)\b/g, '').replace(/[^a-z0-9 ]/g, ' ').trim();
  let match = Object.keys(REAL_SQUADS).find(k => clean.includes(k) || k.includes(clean));
  if (!match) {
    for (const k of Object.keys(REAL_SQUADS)) {
      const words = k.split(' ');
      if (words.some(w => w.length >= 4 && clean.includes(w))) {
        match = k;
        break;
      }
    }
  }
  
  const squad = match ? REAL_SQUADS[match] : null;
  const form = squad?.formation || (FORMATION_COORDINATES[formation] ? formation : '4-2-3-1');
  const coords = FORMATION_COORDINATES[form] || FORMATION_COORDINATES['4-2-3-1'];

  let xi: Player[] = [];
  let bench: Player[] = [];

  const rawXi = squad ? (squad.starting_xi || (squad as any).xi) : null;
  if (rawXi && rawXi.length > 0) {
    xi = rawXi.map((p: any) => ({ ...p }));
    bench = (squad?.bench || []).map((p: any) => ({ ...p }));
  } else {
    let hash = 0;
    for (let i = 0; i < teamName.length; i++) hash = (hash * 31 + teamName.charCodeAt(i)) & 0xffffff;
    const seed = Math.abs(hash);

    const positions = ['GK', 'LB', 'CB', 'CB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST'];
    for (let i = 0; i < 11; i++) {
      const num = i === 0 ? 1 : i + 1;
      const pos = positions[i] || 'MF';
      const rating = Number((6.8 + ((seed + i * 17) % 20) / 10).toFixed(2));
      
      const fn = REGIONAL_FIRST[(seed + i * 7) % REGIONAL_FIRST.length];
      const ln = REGIONAL_LAST[(seed + i * 13) % REGIONAL_LAST.length];
      const realName = `${fn} ${ln}`;

      xi.push({
        name: realName,
        number: num,
        pos,
        rating,
        goals: ['ST', 'LW', 'RW', 'AM'].includes(pos) ? (seed + i) % 8 : 0,
        assists: ['AM', 'LW', 'RW', 'CM', 'LB', 'RB'].includes(pos) ? (seed + i * 3) % 7 : 0,
        tackles: Number((1.2 + ((seed + i) % 20) / 10).toFixed(1)),
        key_passes: Number((0.5 + ((seed + i * 2) % 25) / 10).toFixed(1)),
        shots: Number((0.4 + ((seed + i * 5) % 30) / 10).toFixed(1)),
        yellow_cards: (seed + i) % 4,
      });
    }

    for (let i = 0; i < 7; i++) {
      const fn = REGIONAL_FIRST[(seed + (i + 12) * 5) % REGIONAL_FIRST.length];
      const ln = REGIONAL_LAST[(seed + (i + 12) * 11) % REGIONAL_LAST.length];
      bench.push({
        name: `${fn} ${ln}`,
        number: 12 + i,
        pos: i % 2 === 0 ? 'MF' : (i < 4 ? 'DF' : 'FW'),
        rating: Number((6.6 + (i % 6) / 10).toFixed(2)),
      });
    }
  }

  xi.forEach((p, idx) => {
    if (coords[idx]) {
      const [cx, cy] = coords[idx];
      p.x = cx;
      p.y = isHome ? cy : 100 - cy;
      p.team = teamName;
      p.is_home = isHome;
    }
  });

  return { team: teamName, formation: form, is_home: isHome, starting_xi: xi, bench };
}

export default function TacticalPitch({
  lineupData,
  homeName = 'Home Team',
  awayName = 'Away Team',
  homeFormation = '4-2-3-1',
  awayFormation = '4-3-3',
  homeManager,
  awayManager,
  isLiveOrFinished = false,
  onRefresh,
}: TacticalPitchProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const homeLineup = useMemo<TeamLineup>(() => {
    try {
      if (lineupData?.home?.starting_xi && Array.isArray(lineupData.home.starting_xi) && lineupData.home.starting_xi.length > 0) {
        const raw = lineupData.home;
        const form = raw.formation || homeFormation || '4-2-3-1';
        const coords = FORMATION_COORDINATES[form] || FORMATION_COORDINATES['4-2-3-1'];
        const xi = raw.starting_xi.map((p, idx) => ({
          ...p,
          rating: typeof p.rating === 'number' && !isNaN(p.rating) ? p.rating : 7.0,
          number: p.number || (idx === 0 ? 1 : idx + 1),
          name: p.name || `Player ${idx + 1}`,
          pos: p.pos || (idx === 0 ? 'GK' : 'MF'),
          x: typeof p.x === 'number' ? p.x : (coords[idx] ? coords[idx][0] : 50),
          y: typeof p.y === 'number' ? p.y : (coords[idx] ? coords[idx][1] : 20),
          team: p.team || homeName,
          is_home: true,
        }));
        const bench = (raw.bench || []).map((p, idx) => ({
          ...p,
          rating: typeof p.rating === 'number' && !isNaN(p.rating) ? p.rating : 6.8,
          number: p.number || (12 + idx),
          name: p.name || `Substitute ${idx + 1}`,
          pos: p.pos || 'MF',
        }));
        return { team: raw.team || homeName, formation: form, is_home: true, starting_xi: xi, bench };
      }
      return resolveTeamLineup(homeName, homeFormation, true);
    } catch (e) {
      console.error('Error resolving home lineup:', e);
      return resolveTeamLineup(homeName, homeFormation, true);
    }
  }, [lineupData, homeName, homeFormation]);

  const awayLineup = useMemo<TeamLineup>(() => {
    try {
      if (lineupData?.away?.starting_xi && Array.isArray(lineupData.away.starting_xi) && lineupData.away.starting_xi.length > 0) {
        const raw = lineupData.away;
        const form = raw.formation || awayFormation || '4-3-3';
        const coords = FORMATION_COORDINATES[form] || FORMATION_COORDINATES['4-3-3'] || FORMATION_COORDINATES['4-2-3-1'];
        const xi = raw.starting_xi.map((p, idx) => ({
          ...p,
          rating: typeof p.rating === 'number' && !isNaN(p.rating) ? p.rating : 7.0,
          number: p.number || (idx === 0 ? 1 : idx + 1),
          name: p.name || `Player ${idx + 1}`,
          pos: p.pos || (idx === 0 ? 'GK' : 'MF'),
          x: typeof p.x === 'number' ? p.x : (coords[idx] ? coords[idx][0] : 50),
          y: typeof p.y === 'number' ? p.y : (coords[idx] ? 100 - coords[idx][1] : 80),
          team: p.team || awayName,
          is_home: false,
        }));
        const bench = (raw.bench || []).map((p, idx) => ({
          ...p,
          rating: typeof p.rating === 'number' && !isNaN(p.rating) ? p.rating : 6.8,
          number: p.number || (12 + idx),
          name: p.name || `Substitute ${idx + 1}`,
          pos: p.pos || 'MF',
        }));
        return { team: raw.team || awayName, formation: form, is_home: false, starting_xi: xi, bench };
      }
      return resolveTeamLineup(awayName, awayFormation, false);
    } catch (e) {
      console.error('Error resolving away lineup:', e);
      return resolveTeamLineup(awayName, awayFormation, false);
    }
  }, [lineupData, awayName, awayFormation]);

  const hPlayers = homeLineup?.starting_xi || [];
  const aPlayers = awayLineup?.starting_xi || [];
  const hBench = homeLineup?.bench || [];
  const aBench = awayLineup?.bench || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Tactical Summary & Official Lineup Status Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        {/* Home Tactical Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 800, color: '#38bdf8', fontSize: '0.88rem' }}>{homeName}</span>
          <span style={{
            fontSize: '0.72rem',
            padding: '0.15rem 0.5rem',
            borderRadius: '6px',
            background: 'rgba(56,189,248,0.15)',
            color: '#38bdf8',
            fontWeight: 800,
            border: '1px solid rgba(56,189,248,0.3)',
          }}>
            {homeLineup?.formation || homeFormation || '4-2-3-1'}
          </span>
          {homeManager && (
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>👔 {homeManager}</span>
          )}
        </div>

        {/* Status indicator badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isLiveOrFinished ? (
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              padding: '0.2rem 0.65rem',
              borderRadius: '20px',
              background: 'rgba(34,197,94,0.15)',
              color: '#4ade80',
              border: '1px solid rgba(34,197,94,0.3)',
              display: 'flex', alignItems: 'center', gap: '0.35rem',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} />
              Official Confirmed Lineup
            </span>
          ) : (
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              padding: '0.2rem 0.65rem',
              borderRadius: '20px',
              background: 'rgba(59,130,246,0.15)',
              color: '#60a5fa',
              border: '1px solid rgba(59,130,246,0.3)',
              display: 'flex', alignItems: 'center', gap: '0.35rem',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa' }} />
              Projected Tactical Lineup
            </span>
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'var(--text-primary)',
                padding: '0.2rem 0.55rem',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Refresh lineup updates"
            >
              🔄
            </button>
          )}
        </div>

        {/* Away Tactical Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {awayManager && (
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>👔 {awayManager}</span>
          )}
          <span style={{
            fontSize: '0.72rem',
            padding: '0.15rem 0.5rem',
            borderRadius: '6px',
            background: 'rgba(239,68,68,0.15)',
            color: '#f87171',
            fontWeight: 800,
            border: '1px solid rgba(239,68,68,0.3)',
          }}>
            {awayLineup?.formation || awayFormation || '4-3-3'}
          </span>
          <span style={{ fontWeight: 800, color: '#f87171', fontSize: '0.88rem' }}>{awayName}</span>
        </div>
      </div>

      {/* 🏟️ 2D Interactive Football Pitch */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '640px',
        background: 'linear-gradient(180deg, #134220 0%, #1e5c2e 50%, #134220 100%)',
        borderRadius: '16px',
        border: '3px solid rgba(255,255,255,0.25)',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6), 0 8px 30px rgba(0,0,0,0.4)',
        overflow: 'hidden',
        userSelect: 'none',
      }}>
        
        {/* Grass Pitch Stripes */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 64px, transparent 64px, transparent 128px)',
          pointerEvents: 'none',
        }} />

        {/* Outer Pitch Border Line */}
        <div style={{ position: 'absolute', inset: '12px', border: '2px solid rgba(255,255,255,0.45)', borderRadius: '6px', pointerEvents: 'none' }} />

        {/* Halfway Line */}
        <div style={{ position: 'absolute', left: '12px', right: '12px', top: '50%', height: '2px', background: 'rgba(255,255,255,0.45)', transform: 'translateY(-50%)', pointerEvents: 'none' }} />

        {/* Center Circle */}
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          width: '110px', height: '110px',
          border: '2px solid rgba(255,255,255,0.45)', borderRadius: '50%',
          transform: 'translate(-50%, -50%)', pointerEvents: 'none',
        }} />
        {/* Center Spot */}
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          width: '6px', height: '6px', background: 'rgba(255,255,255,0.7)',
          borderRadius: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none',
        }} />

        {/* Top Penalty Box (Home Goal Area) */}
        <div style={{
          position: 'absolute', left: '26%', right: '26%', top: '12px', height: '90px',
          border: '2px solid rgba(255,255,255,0.45)', borderTop: 'none', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', left: '38%', right: '38%', top: '12px', height: '40px',
          border: '2px solid rgba(255,255,255,0.45)', borderTop: 'none', pointerEvents: 'none',
        }} />

        {/* Bottom Penalty Box (Away Goal Area) */}
        <div style={{
          position: 'absolute', left: '26%', right: '26%', bottom: '12px', height: '90px',
          border: '2px solid rgba(255,255,255,0.45)', borderBottom: 'none', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', left: '38%', right: '38%', bottom: '12px', height: '40px',
          border: '2px solid rgba(255,255,255,0.45)', borderBottom: 'none', pointerEvents: 'none',
        }} />

        {/* Home Players (Top Half) */}
        {hPlayers.map((player, idx) => {
          const posX = typeof player.x === 'number' ? player.x : 50;
          const posY = typeof player.y === 'number' ? player.y : (8 + idx * 4);
          const isSelected = selectedPlayer?.name === player.name;
          const pName = player.name || `Player ${idx + 1}`;
          const lastName = pName.includes(' ') ? pName.split(' ').slice(1).join(' ') : pName;
          const ratingVal = typeof player.rating === 'number' && !isNaN(player.rating) ? player.rating : 7.0;

          return (
            <div
              key={`h-${pName}-${idx}`}
              onClick={() => setSelectedPlayer(player)}
              style={{
                position: 'absolute',
                left: `${posX}%`,
                top: `${posY}%`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: isSelected ? 30 : 15,
                transition: 'transform 0.15s ease',
              }}
              title={`Click for ${pName}'s stats`}
            >
              {/* Compact Jersey Node with Pinned Micro Rating */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isSelected ? '#38bdf8' : 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                  border: '2px solid #ffffff',
                  boxShadow: isSelected ? '0 0 12px #38bdf8' : '0 2px 6px rgba(0,0,0,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.74rem',
                }}>
                  {player.number || (idx + 1)}
                </div>

                {/* Rating Pin Badge */}
                <div style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-14px',
                  fontSize: '0.58rem',
                  fontWeight: 900,
                  padding: '0 3px',
                  borderRadius: '4px',
                  background: ratingVal >= 7.5 ? '#15803d' : '#854d0e',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.4)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.6)',
                  whiteSpace: 'nowrap',
                }}>
                  {ratingVal.toFixed(1)}
                </div>
              </div>

              {/* Compact Name Tag */}
              <div style={{
                marginTop: '2px',
                background: 'rgba(0,0,0,0.85)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '4px',
                padding: '1px 5px',
                color: '#ffffff',
                fontSize: '0.64rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                maxWidth: '85px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
              }}>
                {lastName}
              </div>
            </div>
          );
        })}

        {/* Away Players (Bottom Half) */}
        {aPlayers.map((player, idx) => {
          const posX = typeof player.x === 'number' ? player.x : 50;
          const posY = typeof player.y === 'number' ? player.y : (92 - idx * 4);
          const isSelected = selectedPlayer?.name === player.name;
          const pName = player.name || `Player ${idx + 1}`;
          const lastName = pName.includes(' ') ? pName.split(' ').slice(1).join(' ') : pName;
          const ratingVal = typeof player.rating === 'number' && !isNaN(player.rating) ? player.rating : 7.0;

          return (
            <div
              key={`a-${pName}-${idx}`}
              onClick={() => setSelectedPlayer(player)}
              style={{
                position: 'absolute',
                left: `${posX}%`,
                top: `${posY}%`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: isSelected ? 30 : 15,
                transition: 'transform 0.15s ease',
              }}
              title={`Click for ${pName}'s stats`}
            >
              {/* Compact Jersey Node with Pinned Micro Rating */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isSelected ? '#f87171' : 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                  border: '2px solid #ffffff',
                  boxShadow: isSelected ? '0 0 12px #f87171' : '0 2px 6px rgba(0,0,0,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.74rem',
                }}>
                  {player.number || (idx + 1)}
                </div>

                {/* Rating Pin Badge */}
                <div style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-14px',
                  fontSize: '0.58rem',
                  fontWeight: 900,
                  padding: '0 3px',
                  borderRadius: '4px',
                  background: ratingVal >= 7.5 ? '#15803d' : '#854d0e',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.4)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.6)',
                  whiteSpace: 'nowrap',
                }}>
                  {ratingVal.toFixed(1)}
                </div>
              </div>

              {/* Compact Name Tag */}
              <div style={{
                marginTop: '2px',
                background: 'rgba(0,0,0,0.85)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '4px',
                padding: '1px 5px',
                color: '#ffffff',
                fontSize: '0.64rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                maxWidth: '85px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
              }}>
                {lastName}
              </div>
            </div>
          );
        })}
      </div>

      {/* 🌟 Selected Player Details Popover Card */}
      {selectedPlayer && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--accent-blue)',
          borderRadius: '14px',
          padding: '1.1rem 1.3rem',
          boxShadow: '0 8px 30px rgba(0,0,0,0.45)',
          position: 'relative',
        }}>
          <button
            onClick={() => setSelectedPlayer(null)}
            style={{
              position: 'absolute', right: '12px', top: '12px',
              background: 'none', border: 'none', color: 'var(--text-muted)',
              fontSize: '1rem', cursor: 'pointer',
            }}
          >
            ✕
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.85rem' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%',
              background: selectedPlayer.is_home ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'linear-gradient(135deg, #dc2626, #b91c1c)',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '1.05rem',
              border: '2px solid #ffffff',
            }}>
              {selectedPlayer.number || 1}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                {selectedPlayer.name || 'Player'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Club: <span style={{ fontWeight: 700, color: selectedPlayer.is_home ? '#38bdf8' : '#f87171' }}>{selectedPlayer.team || (selectedPlayer.is_home ? homeName : awayName)}</span> · 
                Position: <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedPlayer.pos || 'MF'}</span> · 
                Rating: <span style={{ fontWeight: 800, color: '#4ade80' }}>⭐ {(typeof selectedPlayer.rating === 'number' && !isNaN(selectedPlayer.rating) ? selectedPlayer.rating : 7.0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
            gap: '0.5rem',
            textAlign: 'center',
          }}>
            <div style={{ background: 'var(--bg-card-hover)', padding: '0.55rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>⚽ Goals</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedPlayer.goals ?? 0}</div>
            </div>
            <div style={{ background: 'var(--bg-card-hover)', padding: '0.55rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>🎯 Assists</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedPlayer.assists ?? 0}</div>
            </div>
            <div style={{ background: 'var(--bg-card-hover)', padding: '0.55rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>🛡️ Tackles/g</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedPlayer.tackles ?? 1.5}</div>
            </div>
            <div style={{ background: 'var(--bg-card-hover)', padding: '0.55rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>⚡ Key Passes</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedPlayer.key_passes ?? 1.2}</div>
            </div>
            <div style={{ background: 'var(--bg-card-hover)', padding: '0.55rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>🟨 Cards</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedPlayer.yellow_cards ?? 1}</div>
            </div>
          </div>
        </div>
      )}

      {/* 🔄 Substitutes & Bench Roster */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        
        {/* Home Bench */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '0.9rem 1rem',
        }}>
          <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#38bdf8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>🔄</span> {homeName} Substitutes Bench
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {hBench.map((p, idx) => {
              const bRating = typeof p.rating === 'number' && !isNaN(p.rating) ? p.rating : 6.8;
              return (
                <div key={`hb-${idx}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.80rem', padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(56,189,248,0.18)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56,189,248,0.35)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '0.72rem',
                      flexShrink: 0,
                    }}>
                      {p.number || (12 + idx)}
                    </span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.name || 'Substitute'}</span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {p.pos || 'MF'} · <span style={{ color: '#4ade80', fontWeight: 800 }}>⭐ {bRating.toFixed(1)}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Away Bench */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '0.9rem 1rem',
        }}>
          <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#f87171', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>🔄</span> {awayName} Substitutes Bench
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {aBench.map((p, idx) => {
              const bRating = typeof p.rating === 'number' && !isNaN(p.rating) ? p.rating : 6.8;
              return (
                <div key={`ab-${idx}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.80rem', padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(239,68,68,0.18)',
                      color: '#f87171',
                      border: '1px solid rgba(239,68,68,0.35)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '0.72rem',
                      flexShrink: 0,
                    }}>
                      {p.number || (12 + idx)}
                    </span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.name || 'Substitute'}</span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {p.pos || 'MF'} · <span style={{ color: '#4ade80', fontWeight: 800 }}>⭐ {bRating.toFixed(1)}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}