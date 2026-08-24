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

const SQUADS_DB: Record<string, { formation: string; xi: Player[]; bench: Player[] }> = {
  "chelsea": {
    "formation": "4-2-3-1",
    "xi": [
      {
        "name": "Robert Sánchez",
        "number": 1,
        "pos": "GK",
        "rating": 7.3,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 2
      },
      {
        "name": "Malo Gusto",
        "number": 27,
        "pos": "RB",
        "rating": 7.35,
        "goals": 0,
        "assists": 3,
        "tackles": 2.6,
        "key_passes": 1.5,
        "shots": 0.6,
        "yellow_cards": 2
      },
      {
        "name": "Wesley Fofana",
        "number": 29,
        "pos": "CB",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 2.4,
        "key_passes": 0.3,
        "shots": 0.4,
        "yellow_cards": 4
      },
      {
        "name": "Levi Colwill",
        "number": 6,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.3,
        "key_passes": 0.5,
        "shots": 0.5,
        "yellow_cards": 3
      },
      {
        "name": "Marc Cucurella",
        "number": 3,
        "pos": "LB",
        "rating": 7.45,
        "goals": 0,
        "assists": 2,
        "tackles": 3.0,
        "key_passes": 1.2,
        "shots": 0.4,
        "yellow_cards": 4
      },
      {
        "name": "Moisés Caicedo",
        "number": 25,
        "pos": "DM",
        "rating": 7.9,
        "goals": 2,
        "assists": 3,
        "tackles": 3.9,
        "key_passes": 1.7,
        "shots": 1.2,
        "yellow_cards": 4
      },
      {
        "name": "Enzo Fernández",
        "number": 8,
        "pos": "CM",
        "rating": 7.6,
        "goals": 3,
        "assists": 5,
        "tackles": 2.2,
        "key_passes": 2.5,
        "shots": 1.8,
        "yellow_cards": 3
      },
      {
        "name": "Noni Madueke",
        "number": 11,
        "pos": "RW",
        "rating": 7.65,
        "goals": 6,
        "assists": 3,
        "tackles": 1.2,
        "key_passes": 2.0,
        "shots": 2.9,
        "yellow_cards": 2
      },
      {
        "name": "Cole Palmer",
        "number": 20,
        "pos": "AM",
        "rating": 8.4,
        "goals": 12,
        "assists": 8,
        "tackles": 1.3,
        "key_passes": 3.6,
        "shots": 3.8,
        "yellow_cards": 2
      },
      {
        "name": "Pedro Neto",
        "number": 7,
        "pos": "LW",
        "rating": 7.55,
        "goals": 3,
        "assists": 4,
        "tackles": 1.3,
        "key_passes": 2.3,
        "shots": 2.4,
        "yellow_cards": 1
      },
      {
        "name": "Nicolas Jackson",
        "number": 15,
        "pos": "ST",
        "rating": 7.8,
        "goals": 10,
        "assists": 3,
        "tackles": 0.8,
        "key_passes": 1.5,
        "shots": 3.3,
        "yellow_cards": 3
      }
    ],
    "bench": [
      {
        "name": "Filip Jörgensen",
        "number": 12,
        "pos": "GK",
        "rating": 6.85
      },
      {
        "name": "Reece James",
        "number": 24,
        "pos": "DF",
        "rating": 7.4
      },
      {
        "name": "Tosin Adarabioyo",
        "number": 4,
        "pos": "DF",
        "rating": 7.1
      },
      {
        "name": "Renato Veiga",
        "number": 40,
        "pos": "MF",
        "rating": 7.15
      },
      {
        "name": "Roméo Lavia",
        "number": 45,
        "pos": "MF",
        "rating": 7.3
      },
      {
        "name": "Jadon Sancho",
        "number": 19,
        "pos": "FW",
        "rating": 7.45
      },
      {
        "name": "Christopher Nkunku",
        "number": 18,
        "pos": "FW",
        "rating": 7.65
      }
    ]
  },
  "fulham": {
    "formation": "4-2-3-1",
    "xi": [
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
        "name": "Kenny Tete",
        "number": 2,
        "pos": "RB",
        "rating": 7.25,
        "goals": 0,
        "assists": 2,
        "tackles": 2.8,
        "key_passes": 1.1,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Joachim Andersen",
        "number": 5,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 1,
        "tackles": 2.5,
        "key_passes": 0.6,
        "shots": 0.6,
        "yellow_cards": 3
      },
      {
        "name": "Calvin Bassey",
        "number": 3,
        "pos": "CB",
        "rating": 7.35,
        "goals": 0,
        "assists": 0,
        "tackles": 2.4,
        "key_passes": 0.3,
        "shots": 0.4,
        "yellow_cards": 3
      },
      {
        "name": "Antonee Robinson",
        "number": 33,
        "pos": "LB",
        "rating": 7.65,
        "goals": 0,
        "assists": 6,
        "tackles": 3.1,
        "key_passes": 2.4,
        "shots": 0.8,
        "yellow_cards": 2
      },
      {
        "name": "Sander Berge",
        "number": 16,
        "pos": "DM",
        "rating": 7.35,
        "goals": 1,
        "assists": 1,
        "tackles": 3.0,
        "key_passes": 1.2,
        "shots": 0.7,
        "yellow_cards": 2
      },
      {
        "name": "Saša Lukić",
        "number": 28,
        "pos": "CM",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.7,
        "key_passes": 1.5,
        "shots": 1.0,
        "yellow_cards": 4
      },
      {
        "name": "Adama Traoré",
        "number": 11,
        "pos": "RW",
        "rating": 7.55,
        "goals": 3,
        "assists": 4,
        "tackles": 1.1,
        "key_passes": 2.5,
        "shots": 2.3,
        "yellow_cards": 1
      },
      {
        "name": "Emile Smith Rowe",
        "number": 32,
        "pos": "AM",
        "rating": 7.75,
        "goals": 5,
        "assists": 4,
        "tackles": 1.4,
        "key_passes": 2.7,
        "shots": 2.5,
        "yellow_cards": 1
      },
      {
        "name": "Alex Iwobi",
        "number": 17,
        "pos": "LW",
        "rating": 7.6,
        "goals": 4,
        "assists": 5,
        "tackles": 1.5,
        "key_passes": 2.4,
        "shots": 2.2,
        "yellow_cards": 2
      },
      {
        "name": "Raúl Jiménez",
        "number": 7,
        "pos": "ST",
        "rating": 7.7,
        "goals": 8,
        "assists": 3,
        "tackles": 0.9,
        "key_passes": 1.4,
        "shots": 3.4,
        "yellow_cards": 2
      }
    ],
    "bench": [
      {
        "name": "Steven Benda",
        "number": 23,
        "pos": "GK",
        "rating": 6.7
      },
      {
        "name": "Timothy Castagne",
        "number": 21,
        "pos": "DF",
        "rating": 7.15
      },
      {
        "name": "Issa Diop",
        "number": 31,
        "pos": "DF",
        "rating": 7.1
      },
      {
        "name": "Harrison Reed",
        "number": 6,
        "pos": "MF",
        "rating": 7.15
      },
      {
        "name": "Andreas Pereira",
        "number": 18,
        "pos": "MF",
        "rating": 7.45
      },
      {
        "name": "Harry Wilson",
        "number": 8,
        "pos": "FW",
        "rating": 7.4
      },
      {
        "name": "Rodrigo Muniz",
        "number": 9,
        "pos": "ST",
        "rating": 7.35
      }
    ]
  },
  "arsenal": {
    "formation": "4-3-3",
    "xi": [
      {
        "name": "David Raya",
        "number": 22,
        "pos": "GK",
        "rating": 7.45,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.2,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Ben White",
        "number": 4,
        "pos": "RB",
        "rating": 7.3,
        "goals": 1,
        "assists": 2,
        "tackles": 2.2,
        "key_passes": 1.3,
        "shots": 0.6,
        "yellow_cards": 2
      },
      {
        "name": "William Saliba",
        "number": 2,
        "pos": "CB",
        "rating": 7.6,
        "goals": 1,
        "assists": 0,
        "tackles": 2.4,
        "key_passes": 0.4,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Gabriel Magalhães",
        "number": 6,
        "pos": "CB",
        "rating": 7.65,
        "goals": 3,
        "assists": 0,
        "tackles": 2.3,
        "key_passes": 0.3,
        "shots": 1.1,
        "yellow_cards": 3
      },
      {
        "name": "Jurriën Timber",
        "number": 12,
        "pos": "LB",
        "rating": 7.35,
        "goals": 0,
        "assists": 2,
        "tackles": 2.5,
        "key_passes": 1.1,
        "shots": 0.5,
        "yellow_cards": 1
      },
      {
        "name": "Thomas Partey",
        "number": 5,
        "pos": "DM",
        "rating": 7.4,
        "goals": 1,
        "assists": 1,
        "tackles": 2.8,
        "key_passes": 1.2,
        "shots": 1.0,
        "yellow_cards": 3
      },
      {
        "name": "Declan Rice",
        "number": 41,
        "pos": "CM",
        "rating": 7.8,
        "goals": 3,
        "assists": 4,
        "tackles": 2.9,
        "key_passes": 2.3,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Martin Ødegaard",
        "number": 8,
        "pos": "AM",
        "rating": 8.05,
        "goals": 5,
        "assists": 7,
        "tackles": 1.5,
        "key_passes": 3.4,
        "shots": 2.7,
        "yellow_cards": 1
      },
      {
        "name": "Bukayo Saka",
        "number": 7,
        "pos": "RW",
        "rating": 8.3,
        "goals": 9,
        "assists": 10,
        "tackles": 1.8,
        "key_passes": 3.6,
        "shots": 3.4,
        "yellow_cards": 2
      },
      {
        "name": "Kai Havertz",
        "number": 29,
        "pos": "ST",
        "rating": 7.7,
        "goals": 8,
        "assists": 3,
        "tackles": 1.6,
        "key_passes": 1.5,
        "shots": 2.6,
        "yellow_cards": 3
      },
      {
        "name": "Gabriel Martinelli",
        "number": 11,
        "pos": "LW",
        "rating": 7.55,
        "goals": 5,
        "assists": 4,
        "tackles": 1.4,
        "key_passes": 2.1,
        "shots": 2.5,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Neto",
        "number": 32,
        "pos": "GK",
        "rating": 6.8
      },
      {
        "name": "Oleksandr Zinchenko",
        "number": 17,
        "pos": "DF",
        "rating": 7.05
      },
      {
        "name": "Jakub Kiwior",
        "number": 15,
        "pos": "DF",
        "rating": 7.0
      },
      {
        "name": "Mikel Merino",
        "number": 23,
        "pos": "MF",
        "rating": 7.3
      },
      {
        "name": "Jorginho",
        "number": 20,
        "pos": "MF",
        "rating": 7.15
      },
      {
        "name": "Leandro Trossard",
        "number": 19,
        "pos": "FW",
        "rating": 7.5
      },
      {
        "name": "Gabriel Jesus",
        "number": 9,
        "pos": "FW",
        "rating": 7.25
      }
    ]
  },
  "manchester city": {
    "formation": "4-2-3-1",
    "xi": [
      {
        "name": "Ederson",
        "number": 31,
        "pos": "GK",
        "rating": 7.3,
        "goals": 0,
        "assists": 1,
        "tackles": 0.2,
        "key_passes": 0.3,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Kyle Walker",
        "number": 2,
        "pos": "RB",
        "rating": 7.15,
        "goals": 0,
        "assists": 1,
        "tackles": 1.7,
        "key_passes": 0.9,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Rúben Dias",
        "number": 3,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.2,
        "key_passes": 0.4,
        "shots": 0.5,
        "yellow_cards": 2
      },
      {
        "name": "Manuel Akanji",
        "number": 25,
        "pos": "CB",
        "rating": 7.35,
        "goals": 0,
        "assists": 1,
        "tackles": 2.0,
        "key_passes": 0.5,
        "shots": 0.4,
        "yellow_cards": 1
      },
      {
        "name": "Joško Gvardiol",
        "number": 24,
        "pos": "LB",
        "rating": 7.65,
        "goals": 4,
        "assists": 2,
        "tackles": 2.3,
        "key_passes": 1.4,
        "shots": 1.5,
        "yellow_cards": 2
      },
      {
        "name": "Mateo Kovačić",
        "number": 8,
        "pos": "DM",
        "rating": 7.45,
        "goals": 3,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.7,
        "shots": 1.4,
        "yellow_cards": 3
      },
      {
        "name": "Ilkay Gündogan",
        "number": 19,
        "pos": "CM",
        "rating": 7.55,
        "goals": 2,
        "assists": 4,
        "tackles": 1.8,
        "key_passes": 2.4,
        "shots": 1.6,
        "yellow_cards": 1
      },
      {
        "name": "Bernardo Silva",
        "number": 20,
        "pos": "RW",
        "rating": 7.75,
        "goals": 3,
        "assists": 6,
        "tackles": 2.1,
        "key_passes": 2.8,
        "shots": 1.9,
        "yellow_cards": 3
      },
      {
        "name": "Kevin De Bruyne",
        "number": 17,
        "pos": "AM",
        "rating": 8.25,
        "goals": 5,
        "assists": 11,
        "tackles": 1.2,
        "key_passes": 3.8,
        "shots": 2.9,
        "yellow_cards": 1
      },
      {
        "name": "Phil Foden",
        "number": 47,
        "pos": "LW",
        "rating": 7.85,
        "goals": 6,
        "assists": 5,
        "tackles": 1.3,
        "key_passes": 2.6,
        "shots": 3.1,
        "yellow_cards": 1
      },
      {
        "name": "Erling Haaland",
        "number": 9,
        "pos": "ST",
        "rating": 8.4,
        "goals": 19,
        "assists": 1,
        "tackles": 0.3,
        "key_passes": 0.9,
        "shots": 4.6,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Stefan Ortega",
        "number": 18,
        "pos": "GK",
        "rating": 7.0
      },
      {
        "name": "John Stones",
        "number": 5,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Nathan Aké",
        "number": 6,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Rico Lewis",
        "number": 82,
        "pos": "DF",
        "rating": 7.25
      },
      {
        "name": "Matheus Nunes",
        "number": 27,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Jérémy Doku",
        "number": 11,
        "pos": "FW",
        "rating": 7.6
      },
      {
        "name": "Savinho",
        "number": 26,
        "pos": "FW",
        "rating": 7.5
      }
    ]
  },
  "liverpool": {
    "formation": "4-2-3-1",
    "xi": [
      {
        "name": "Alisson Becker",
        "number": 1,
        "pos": "GK",
        "rating": 7.45,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 0
      },
      {
        "name": "Trent Alexander-Arnold",
        "number": 66,
        "pos": "RB",
        "rating": 7.8,
        "goals": 2,
        "assists": 7,
        "tackles": 2.0,
        "key_passes": 3.2,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Ibrahima Konaté",
        "number": 5,
        "pos": "CB",
        "rating": 7.45,
        "goals": 1,
        "assists": 1,
        "tackles": 2.5,
        "key_passes": 0.3,
        "shots": 0.6,
        "yellow_cards": 2
      },
      {
        "name": "Virgil van Dijk",
        "number": 4,
        "pos": "CB",
        "rating": 7.75,
        "goals": 2,
        "assists": 1,
        "tackles": 2.1,
        "key_passes": 0.5,
        "shots": 1.0,
        "yellow_cards": 1
      },
      {
        "name": "Andrew Robertson",
        "number": 26,
        "pos": "LB",
        "rating": 7.3,
        "goals": 0,
        "assists": 3,
        "tackles": 2.2,
        "key_passes": 1.8,
        "shots": 0.7,
        "yellow_cards": 1
      },
      {
        "name": "Ryan Gravenberch",
        "number": 38,
        "pos": "DM",
        "rating": 7.7,
        "goals": 1,
        "assists": 2,
        "tackles": 3.2,
        "key_passes": 1.8,
        "shots": 1.1,
        "yellow_cards": 3
      },
      {
        "name": "Alexis Mac Allister",
        "number": 10,
        "pos": "CM",
        "rating": 7.6,
        "goals": 3,
        "assists": 3,
        "tackles": 2.7,
        "key_passes": 2.1,
        "shots": 1.5,
        "yellow_cards": 3
      },
      {
        "name": "Mohamed Salah",
        "number": 11,
        "pos": "RW",
        "rating": 8.45,
        "goals": 15,
        "assists": 11,
        "tackles": 0.9,
        "key_passes": 3.6,
        "shots": 4.2,
        "yellow_cards": 1
      },
      {
        "name": "Dominik Szoboszlai",
        "number": 8,
        "pos": "AM",
        "rating": 7.5,
        "goals": 3,
        "assists": 4,
        "tackles": 1.8,
        "key_passes": 2.4,
        "shots": 2.3,
        "yellow_cards": 2
      },
      {
        "name": "Luis Díaz",
        "number": 7,
        "pos": "LW",
        "rating": 7.85,
        "goals": 9,
        "assists": 3,
        "tackles": 1.5,
        "key_passes": 2.5,
        "shots": 3.3,
        "yellow_cards": 2
      },
      {
        "name": "Darwin Núñez",
        "number": 9,
        "pos": "ST",
        "rating": 7.45,
        "goals": 6,
        "assists": 4,
        "tackles": 0.8,
        "key_passes": 1.3,
        "shots": 3.6,
        "yellow_cards": 2
      }
    ],
    "bench": [
      {
        "name": "Caoimhín Kelleher",
        "number": 62,
        "pos": "GK",
        "rating": 7.2
      },
      {
        "name": "Joe Gomez",
        "number": 2,
        "pos": "DF",
        "rating": 7.05
      },
      {
        "name": "Kostas Tsimikas",
        "number": 21,
        "pos": "DF",
        "rating": 7.1
      },
      {
        "name": "Curtis Jones",
        "number": 17,
        "pos": "MF",
        "rating": 7.35
      },
      {
        "name": "Wataru Endo",
        "number": 3,
        "pos": "MF",
        "rating": 7.0
      },
      {
        "name": "Cody Gakpo",
        "number": 18,
        "pos": "FW",
        "rating": 7.6
      },
      {
        "name": "Federico Chiesa",
        "number": 14,
        "pos": "FW",
        "rating": 7.15
      }
    ]
  },
  "manchester united": {
    "formation": "4-2-3-1",
    "xi": [
      {
        "name": "André Onana",
        "number": 24,
        "pos": "GK",
        "rating": 7.3,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Noussair Mazraoui",
        "number": 3,
        "pos": "RB",
        "rating": 7.35,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.2,
        "shots": 0.5,
        "yellow_cards": 2
      },
      {
        "name": "Matthijs de Ligt",
        "number": 4,
        "pos": "CB",
        "rating": 7.4,
        "goals": 1,
        "assists": 0,
        "tackles": 2.3,
        "key_passes": 0.3,
        "shots": 0.6,
        "yellow_cards": 3
      },
      {
        "name": "Lisandro Martínez",
        "number": 6,
        "pos": "CB",
        "rating": 7.45,
        "goals": 1,
        "assists": 1,
        "tackles": 2.7,
        "key_passes": 0.7,
        "shots": 0.3,
        "yellow_cards": 4
      },
      {
        "name": "Diogo Dalot",
        "number": 20,
        "pos": "LB",
        "rating": 7.25,
        "goals": 1,
        "assists": 1,
        "tackles": 2.4,
        "key_passes": 1.1,
        "shots": 0.8,
        "yellow_cards": 3
      },
      {
        "name": "Manuel Ugarte",
        "number": 25,
        "pos": "DM",
        "rating": 7.35,
        "goals": 0,
        "assists": 1,
        "tackles": 3.5,
        "key_passes": 0.8,
        "shots": 0.4,
        "yellow_cards": 3
      },
      {
        "name": "Kobbie Mainoo",
        "number": 37,
        "pos": "CM",
        "rating": 7.45,
        "goals": 2,
        "assists": 2,
        "tackles": 2.2,
        "key_passes": 1.8,
        "shots": 1.2,
        "yellow_cards": 2
      },
      {
        "name": "Alejandro Garnacho",
        "number": 17,
        "pos": "RW",
        "rating": 7.65,
        "goals": 7,
        "assists": 4,
        "tackles": 1.2,
        "key_passes": 2.4,
        "shots": 3.4,
        "yellow_cards": 1
      },
      {
        "name": "Bruno Fernandes",
        "number": 8,
        "pos": "AM",
        "rating": 8.0,
        "goals": 6,
        "assists": 8,
        "tackles": 1.8,
        "key_passes": 3.7,
        "shots": 3.2,
        "yellow_cards": 3
      },
      {
        "name": "Marcus Rashford",
        "number": 10,
        "pos": "LW",
        "rating": 7.45,
        "goals": 6,
        "assists": 3,
        "tackles": 0.9,
        "key_passes": 1.9,
        "shots": 2.8,
        "yellow_cards": 1
      },
      {
        "name": "Rasmus Højlund",
        "number": 9,
        "pos": "ST",
        "rating": 7.5,
        "goals": 8,
        "assists": 1,
        "tackles": 0.6,
        "key_passes": 1.0,
        "shots": 2.9,
        "yellow_cards": 2
      }
    ],
    "bench": [
      {
        "name": "Altay Bayındır",
        "number": 1,
        "pos": "GK",
        "rating": 6.8
      },
      {
        "name": "Harry Maguire",
        "number": 5,
        "pos": "DF",
        "rating": 7.15
      },
      {
        "name": "Leny Yoro",
        "number": 15,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Casemiro",
        "number": 18,
        "pos": "MF",
        "rating": 7.3
      },
      {
        "name": "Christian Eriksen",
        "number": 14,
        "pos": "MF",
        "rating": 7.25
      },
      {
        "name": "Amad Diallo",
        "number": 16,
        "pos": "FW",
        "rating": 7.55
      },
      {
        "name": "Joshua Zirkzee",
        "number": 11,
        "pos": "FW",
        "rating": 7.2
      }
    ]
  },
  "tottenham": {
    "formation": "4-3-3",
    "xi": [
      {
        "name": "Guglielmo Vicario",
        "number": 1,
        "pos": "GK",
        "rating": 7.35,
        "goals": 0,
        "assists": 0,
        "tackles": 0.3,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Pedro Porro",
        "number": 23,
        "pos": "RB",
        "rating": 7.65,
        "goals": 2,
        "assists": 4,
        "tackles": 2.8,
        "key_passes": 2.5,
        "shots": 1.9,
        "yellow_cards": 2
      },
      {
        "name": "Cristian Romero",
        "number": 17,
        "pos": "CB",
        "rating": 7.55,
        "goals": 2,
        "assists": 0,
        "tackles": 2.7,
        "key_passes": 0.4,
        "shots": 0.7,
        "yellow_cards": 4
      },
      {
        "name": "Micky van de Ven",
        "number": 37,
        "pos": "CB",
        "rating": 7.6,
        "goals": 1,
        "assists": 1,
        "tackles": 2.4,
        "key_passes": 0.5,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Destiny Udogie",
        "number": 13,
        "pos": "LB",
        "rating": 7.4,
        "goals": 0,
        "assists": 2,
        "tackles": 2.6,
        "key_passes": 1.4,
        "shots": 0.6,
        "yellow_cards": 3
      },
      {
        "name": "Rodrigo Bentancur",
        "number": 30,
        "pos": "DM",
        "rating": 7.45,
        "goals": 1,
        "assists": 2,
        "tackles": 2.9,
        "key_passes": 1.6,
        "shots": 1.1,
        "yellow_cards": 4
      },
      {
        "name": "Pape Matar Sarr",
        "number": 29,
        "pos": "CM",
        "rating": 7.35,
        "goals": 2,
        "assists": 2,
        "tackles": 2.3,
        "key_passes": 1.5,
        "shots": 1.4,
        "yellow_cards": 2
      },
      {
        "name": "James Maddison",
        "number": 10,
        "pos": "AM",
        "rating": 7.9,
        "goals": 5,
        "assists": 6,
        "tackles": 1.6,
        "key_passes": 3.3,
        "shots": 2.8,
        "yellow_cards": 2
      },
      {
        "name": "Brennan Johnson",
        "number": 22,
        "pos": "RW",
        "rating": 7.75,
        "goals": 8,
        "assists": 3,
        "tackles": 1.1,
        "key_passes": 1.8,
        "shots": 2.9,
        "yellow_cards": 1
      },
      {
        "name": "Dominic Solanke",
        "number": 19,
        "pos": "ST",
        "rating": 7.7,
        "goals": 7,
        "assists": 3,
        "tackles": 1.2,
        "key_passes": 1.4,
        "shots": 3.1,
        "yellow_cards": 1
      },
      {
        "name": "Son Heung-min",
        "number": 7,
        "pos": "LW",
        "rating": 8.05,
        "goals": 8,
        "assists": 7,
        "tackles": 0.9,
        "key_passes": 3.1,
        "shots": 3.5,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Fraser Forster",
        "number": 20,
        "pos": "GK",
        "rating": 6.75
      },
      {
        "name": "Radu Drăgușin",
        "number": 6,
        "pos": "DF",
        "rating": 7.1
      },
      {
        "name": "Archie Gray",
        "number": 14,
        "pos": "DF",
        "rating": 7.15
      },
      {
        "name": "Yves Bissouma",
        "number": 8,
        "pos": "MF",
        "rating": 7.35
      },
      {
        "name": "Lucas Bergvall",
        "number": 15,
        "pos": "MF",
        "rating": 7.2
      },
      {
        "name": "Dejan Kulusevski",
        "number": 21,
        "pos": "MF",
        "rating": 7.7
      },
      {
        "name": "Richarlison",
        "number": 9,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "aston villa": {
    "formation": "4-2-3-1",
    "xi": [
      {
        "name": "Emiliano Martínez",
        "number": 23,
        "pos": "GK",
        "rating": 7.45,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 2
      },
      {
        "name": "Matty Cash",
        "number": 2,
        "pos": "RB",
        "rating": 7.2,
        "goals": 1,
        "assists": 1,
        "tackles": 2.4,
        "key_passes": 1.1,
        "shots": 0.6,
        "yellow_cards": 3
      },
      {
        "name": "Ezri Konsa",
        "number": 4,
        "pos": "CB",
        "rating": 7.4,
        "goals": 1,
        "assists": 0,
        "tackles": 2.3,
        "key_passes": 0.3,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Pau Torres",
        "number": 14,
        "pos": "CB",
        "rating": 7.45,
        "goals": 1,
        "assists": 1,
        "tackles": 2.2,
        "key_passes": 0.7,
        "shots": 0.5,
        "yellow_cards": 1
      },
      {
        "name": "Lucas Digne",
        "number": 12,
        "pos": "LB",
        "rating": 7.5,
        "goals": 0,
        "assists": 4,
        "tackles": 2.5,
        "key_passes": 2.4,
        "shots": 0.8,
        "yellow_cards": 3
      },
      {
        "name": "Amadou Onana",
        "number": 24,
        "pos": "DM",
        "rating": 7.6,
        "goals": 3,
        "assists": 1,
        "tackles": 3.4,
        "key_passes": 1.1,
        "shots": 1.2,
        "yellow_cards": 3
      },
      {
        "name": "Youri Tielemans",
        "number": 8,
        "pos": "CM",
        "rating": 7.75,
        "goals": 2,
        "assists": 5,
        "tackles": 2.6,
        "key_passes": 2.9,
        "shots": 1.9,
        "yellow_cards": 2
      },
      {
        "name": "Leon Bailey",
        "number": 31,
        "pos": "RW",
        "rating": 7.55,
        "goals": 4,
        "assists": 4,
        "tackles": 1.2,
        "key_passes": 2.2,
        "shots": 2.6,
        "yellow_cards": 1
      },
      {
        "name": "Morgan Rogers",
        "number": 27,
        "pos": "AM",
        "rating": 7.8,
        "goals": 5,
        "assists": 4,
        "tackles": 1.7,
        "key_passes": 2.8,
        "shots": 2.7,
        "yellow_cards": 2
      },
      {
        "name": "John McGinn",
        "number": 7,
        "pos": "LW",
        "rating": 7.5,
        "goals": 3,
        "assists": 3,
        "tackles": 2.3,
        "key_passes": 2.1,
        "shots": 1.8,
        "yellow_cards": 3
      },
      {
        "name": "Ollie Watkins",
        "number": 11,
        "pos": "ST",
        "rating": 8.0,
        "goals": 10,
        "assists": 5,
        "tackles": 0.9,
        "key_passes": 1.7,
        "shots": 3.6,
        "yellow_cards": 2
      }
    ],
    "bench": [
      {
        "name": "Robin Olsen",
        "number": 25,
        "pos": "GK",
        "rating": 6.7
      },
      {
        "name": "Diego Carlos",
        "number": 3,
        "pos": "DF",
        "rating": 7.1
      },
      {
        "name": "Ian Maatsen",
        "number": 22,
        "pos": "DF",
        "rating": 7.25
      },
      {
        "name": "Boubacar Kamara",
        "number": 44,
        "pos": "MF",
        "rating": 7.35
      },
      {
        "name": "Ross Barkley",
        "number": 6,
        "pos": "MF",
        "rating": 7.2
      },
      {
        "name": "Emiliano Buendía",
        "number": 10,
        "pos": "MF",
        "rating": 7.3
      },
      {
        "name": "Jhon Durán",
        "number": 9,
        "pos": "FW",
        "rating": 7.7
      }
    ]
  },
  "newcastle": {
    "formation": "4-3-3",
    "xi": [
      {
        "name": "Nick Pope",
        "number": 22,
        "pos": "GK",
        "rating": 7.35,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Tino Livramento",
        "number": 21,
        "pos": "RB",
        "rating": 7.4,
        "goals": 0,
        "assists": 2,
        "tackles": 2.7,
        "key_passes": 1.4,
        "shots": 0.6,
        "yellow_cards": 1
      },
      {
        "name": "Fabian Schär",
        "number": 5,
        "pos": "CB",
        "rating": 7.5,
        "goals": 2,
        "assists": 1,
        "tackles": 2.5,
        "key_passes": 0.6,
        "shots": 1.2,
        "yellow_cards": 3
      },
      {
        "name": "Dan Burn",
        "number": 33,
        "pos": "CB",
        "rating": 7.35,
        "goals": 1,
        "assists": 0,
        "tackles": 2.3,
        "key_passes": 0.3,
        "shots": 0.5,
        "yellow_cards": 4
      },
      {
        "name": "Lewis Hall",
        "number": 20,
        "pos": "LB",
        "rating": 7.45,
        "goals": 0,
        "assists": 3,
        "tackles": 2.6,
        "key_passes": 1.8,
        "shots": 0.7,
        "yellow_cards": 2
      },
      {
        "name": "Sandro Tonali",
        "number": 8,
        "pos": "DM",
        "rating": 7.65,
        "goals": 1,
        "assists": 3,
        "tackles": 2.9,
        "key_passes": 2.2,
        "shots": 1.3,
        "yellow_cards": 2
      },
      {
        "name": "Bruno Guimarães",
        "number": 39,
        "pos": "CM",
        "rating": 7.95,
        "goals": 3,
        "assists": 5,
        "tackles": 3.3,
        "key_passes": 2.8,
        "shots": 1.7,
        "yellow_cards": 4
      },
      {
        "name": "Joelinton",
        "number": 7,
        "pos": "CM",
        "rating": 7.6,
        "goals": 4,
        "assists": 2,
        "tackles": 3.1,
        "key_passes": 1.6,
        "shots": 1.9,
        "yellow_cards": 5
      },
      {
        "name": "Anthony Gordon",
        "number": 10,
        "pos": "RW",
        "rating": 7.85,
        "goals": 6,
        "assists": 5,
        "tackles": 1.7,
        "key_passes": 2.9,
        "shots": 3.2,
        "yellow_cards": 3
      },
      {
        "name": "Alexander Isak",
        "number": 14,
        "pos": "ST",
        "rating": 8.2,
        "goals": 13,
        "assists": 3,
        "tackles": 0.7,
        "key_passes": 1.6,
        "shots": 3.9,
        "yellow_cards": 1
      },
      {
        "name": "Harvey Barnes",
        "number": 11,
        "pos": "LW",
        "rating": 7.6,
        "goals": 6,
        "assists": 2,
        "tackles": 1.1,
        "key_passes": 1.8,
        "shots": 2.8,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Martin Dúbravka",
        "number": 1,
        "pos": "GK",
        "rating": 6.8
      },
      {
        "name": "Kieran Trippier",
        "number": 2,
        "pos": "DF",
        "rating": 7.3
      },
      {
        "name": "Lloyd Kelly",
        "number": 25,
        "pos": "DF",
        "rating": 7.05
      },
      {
        "name": "Sean Longstaff",
        "number": 36,
        "pos": "MF",
        "rating": 7.15
      },
      {
        "name": "Joe Willock",
        "number": 28,
        "pos": "MF",
        "rating": 7.25
      },
      {
        "name": "Jacob Murphy",
        "number": 23,
        "pos": "FW",
        "rating": 7.35
      },
      {
        "name": "Callum Wilson",
        "number": 9,
        "pos": "FW",
        "rating": 7.3
      }
    ]
  },
  "real madrid": {
    "formation": "4-3-3",
    "xi": [
      {
        "name": "Thibaut Courtois",
        "number": 1,
        "pos": "GK",
        "rating": 7.42,
        "goals": 0,
        "assists": 0,
        "tackles": 0.4,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 0
      },
      {
        "name": "Dani Carvajal",
        "number": 2,
        "pos": "RB",
        "rating": 7.35,
        "goals": 1,
        "assists": 2,
        "tackles": 2.1,
        "key_passes": 1.2,
        "shots": 0.8,
        "yellow_cards": 3
      },
      {
        "name": "Éder Militão",
        "number": 3,
        "pos": "CB",
        "rating": 7.28,
        "goals": 1,
        "assists": 0,
        "tackles": 1.9,
        "key_passes": 0.3,
        "shots": 0.6,
        "yellow_cards": 2
      },
      {
        "name": "Antonio Rüdiger",
        "number": 22,
        "pos": "CB",
        "rating": 7.4,
        "goals": 2,
        "assists": 0,
        "tackles": 1.8,
        "key_passes": 0.2,
        "shots": 0.9,
        "yellow_cards": 1
      },
      {
        "name": "Ferland Mendy",
        "number": 23,
        "pos": "LB",
        "rating": 7.05,
        "goals": 0,
        "assists": 1,
        "tackles": 1.7,
        "key_passes": 0.6,
        "shots": 0.3,
        "yellow_cards": 2
      },
      {
        "name": "Federico Valverde",
        "number": 8,
        "pos": "CM",
        "rating": 7.82,
        "goals": 4,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.1,
        "shots": 2.6,
        "yellow_cards": 1
      },
      {
        "name": "Aurélien Tchouaméni",
        "number": 14,
        "pos": "DM",
        "rating": 7.3,
        "goals": 0,
        "assists": 1,
        "tackles": 2.8,
        "key_passes": 0.9,
        "shots": 0.8,
        "yellow_cards": 3
      },
      {
        "name": "Jude Bellingham",
        "number": 5,
        "pos": "AM",
        "rating": 8.15,
        "goals": 8,
        "assists": 6,
        "tackles": 1.9,
        "key_passes": 2.5,
        "shots": 3.1,
        "yellow_cards": 2
      },
      {
        "name": "Rodrygo",
        "number": 11,
        "pos": "RW",
        "rating": 7.55,
        "goals": 6,
        "assists": 5,
        "tackles": 1.1,
        "key_passes": 2.0,
        "shots": 2.8,
        "yellow_cards": 1
      },
      {
        "name": "Kylian Mbappé",
        "number": 9,
        "pos": "ST",
        "rating": 8.2,
        "goals": 14,
        "assists": 3,
        "tackles": 0.4,
        "key_passes": 1.8,
        "shots": 4.5,
        "yellow_cards": 1
      },
      {
        "name": "Vinícius Júnior",
        "number": 7,
        "pos": "LW",
        "rating": 8.35,
        "goals": 12,
        "assists": 8,
        "tackles": 1.2,
        "key_passes": 3.2,
        "shots": 3.9,
        "yellow_cards": 4
      }
    ],
    "bench": [
      {
        "name": "Andriy Lunin",
        "number": 13,
        "pos": "GK",
        "rating": 7.1
      },
      {
        "name": "Lucas Vázquez",
        "number": 17,
        "pos": "DF",
        "rating": 7.0
      },
      {
        "name": "Luka Modrić",
        "number": 10,
        "pos": "MF",
        "rating": 7.45
      },
      {
        "name": "Eduardo Camavinga",
        "number": 6,
        "pos": "MF",
        "rating": 7.3
      },
      {
        "name": "Arda Güler",
        "number": 15,
        "pos": "MF",
        "rating": 7.2
      },
      {
        "name": "Brahim Díaz",
        "number": 21,
        "pos": "FW",
        "rating": 7.35
      },
      {
        "name": "Endrick",
        "number": 16,
        "pos": "FW",
        "rating": 7.15
      }
    ]
  },
  "barcelona": {
    "formation": "4-2-3-1",
    "xi": [
      {
        "name": "Marc-André ter Stegen",
        "number": 1,
        "pos": "GK",
        "rating": 7.35,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 0
      },
      {
        "name": "Jules Koundé",
        "number": 23,
        "pos": "RB",
        "rating": 7.6,
        "goals": 2,
        "assists": 4,
        "tackles": 2.5,
        "key_passes": 1.6,
        "shots": 0.6,
        "yellow_cards": 1
      },
      {
        "name": "Pau Cubarsí",
        "number": 2,
        "pos": "CB",
        "rating": 7.45,
        "goals": 0,
        "assists": 1,
        "tackles": 2.1,
        "key_passes": 0.8,
        "shots": 0.2,
        "yellow_cards": 2
      },
      {
        "name": "Íñigo Martínez",
        "number": 5,
        "pos": "CB",
        "rating": 7.35,
        "goals": 1,
        "assists": 1,
        "tackles": 2.0,
        "key_passes": 0.4,
        "shots": 0.5,
        "yellow_cards": 3
      },
      {
        "name": "Alejandro Balde",
        "number": 3,
        "pos": "LB",
        "rating": 7.3,
        "goals": 1,
        "assists": 3,
        "tackles": 1.8,
        "key_passes": 1.5,
        "shots": 0.7,
        "yellow_cards": 1
      },
      {
        "name": "Marc Casadó",
        "number": 17,
        "pos": "DM",
        "rating": 7.4,
        "goals": 0,
        "assists": 3,
        "tackles": 2.9,
        "key_passes": 1.4,
        "shots": 0.4,
        "yellow_cards": 3
      },
      {
        "name": "Pedri",
        "number": 8,
        "pos": "CM",
        "rating": 7.95,
        "goals": 4,
        "assists": 5,
        "tackles": 2.2,
        "key_passes": 2.8,
        "shots": 1.8,
        "yellow_cards": 2
      },
      {
        "name": "Lamine Yamal",
        "number": 19,
        "pos": "RW",
        "rating": 8.25,
        "goals": 7,
        "assists": 9,
        "tackles": 1.4,
        "key_passes": 3.4,
        "shots": 3.2,
        "yellow_cards": 1
      },
      {
        "name": "Dani Olmo",
        "number": 20,
        "pos": "AM",
        "rating": 7.8,
        "goals": 6,
        "assists": 4,
        "tackles": 1.3,
        "key_passes": 2.6,
        "shots": 2.9,
        "yellow_cards": 1
      },
      {
        "name": "Raphinha",
        "number": 11,
        "pos": "LW",
        "rating": 8.3,
        "goals": 13,
        "assists": 8,
        "tackles": 1.6,
        "key_passes": 3.5,
        "shots": 3.8,
        "yellow_cards": 2
      },
      {
        "name": "Robert Lewandowski",
        "number": 9,
        "pos": "ST",
        "rating": 8.1,
        "goals": 17,
        "assists": 2,
        "tackles": 0.5,
        "key_passes": 1.2,
        "shots": 4.1,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Iñaki Peña",
        "number": 13,
        "pos": "GK",
        "rating": 6.85
      },
      {
        "name": "Andreas Christensen",
        "number": 15,
        "pos": "DF",
        "rating": 7.1
      },
      {
        "name": "Frenkie de Jong",
        "number": 21,
        "pos": "MF",
        "rating": 7.5
      },
      {
        "name": "Gavi",
        "number": 6,
        "pos": "MF",
        "rating": 7.45
      },
      {
        "name": "Fermín López",
        "number": 16,
        "pos": "MF",
        "rating": 7.25
      },
      {
        "name": "Ferran Torres",
        "number": 7,
        "pos": "FW",
        "rating": 7.15
      },
      {
        "name": "Pau Víctor",
        "number": 18,
        "pos": "FW",
        "rating": 6.9
      }
    ]
  },
  "atletico madrid": {
    "formation": "5-3-2",
    "xi": [
      {
        "name": "Jan Oblak",
        "number": 13,
        "pos": "GK",
        "rating": 7.4,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 0
      },
      {
        "name": "Nahuel Molina",
        "number": 16,
        "pos": "RWB",
        "rating": 7.2,
        "goals": 1,
        "assists": 2,
        "tackles": 2.2,
        "key_passes": 1.3,
        "shots": 0.6,
        "yellow_cards": 2
      },
      {
        "name": "Robin Le Normand",
        "number": 24,
        "pos": "CB",
        "rating": 7.35,
        "goals": 0,
        "assists": 0,
        "tackles": 2.4,
        "key_passes": 0.2,
        "shots": 0.4,
        "yellow_cards": 3
      },
      {
        "name": "José María Giménez",
        "number": 2,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 0.3,
        "shots": 0.5,
        "yellow_cards": 4
      },
      {
        "name": "Reinildo Mandava",
        "number": 23,
        "pos": "CB",
        "rating": 7.25,
        "goals": 0,
        "assists": 0,
        "tackles": 2.5,
        "key_passes": 0.4,
        "shots": 0.2,
        "yellow_cards": 3
      },
      {
        "name": "Samuel Lino",
        "number": 12,
        "pos": "LWB",
        "rating": 7.45,
        "goals": 3,
        "assists": 3,
        "tackles": 2.0,
        "key_passes": 2.1,
        "shots": 1.8,
        "yellow_cards": 1
      },
      {
        "name": "Rodrigo De Paul",
        "number": 5,
        "pos": "CM",
        "rating": 7.6,
        "goals": 2,
        "assists": 4,
        "tackles": 2.5,
        "key_passes": 2.4,
        "shots": 1.5,
        "yellow_cards": 4
      },
      {
        "name": "Koke",
        "number": 6,
        "pos": "DM",
        "rating": 7.4,
        "goals": 1,
        "assists": 3,
        "tackles": 2.7,
        "key_passes": 1.8,
        "shots": 0.6,
        "yellow_cards": 3
      },
      {
        "name": "Conor Gallagher",
        "number": 4,
        "pos": "CM",
        "rating": 7.55,
        "goals": 3,
        "assists": 2,
        "tackles": 3.1,
        "key_passes": 1.6,
        "shots": 1.7,
        "yellow_cards": 2
      },
      {
        "name": "Antoine Griezmann",
        "number": 7,
        "pos": "ST",
        "rating": 8.1,
        "goals": 9,
        "assists": 7,
        "tackles": 1.5,
        "key_passes": 3.3,
        "shots": 3.2,
        "yellow_cards": 1
      },
      {
        "name": "Julián Álvarez",
        "number": 19,
        "pos": "ST",
        "rating": 7.9,
        "goals": 8,
        "assists": 3,
        "tackles": 1.1,
        "key_passes": 2.1,
        "shots": 3.4,
        "yellow_cards": 1
      }
    ],
    "bench": [
      {
        "name": "Juan Musso",
        "number": 1,
        "pos": "GK",
        "rating": 6.8
      },
      {
        "name": "César Azpilicueta",
        "number": 3,
        "pos": "DF",
        "rating": 7.05
      },
      {
        "name": "Axel Witsel",
        "number": 20,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Pablo Barrios",
        "number": 8,
        "pos": "MF",
        "rating": 7.35
      },
      {
        "name": "Rodrigo Riquelme",
        "number": 17,
        "pos": "MF",
        "rating": 7.2
      },
      {
        "name": "Alexander Sørloth",
        "number": 9,
        "pos": "FW",
        "rating": 7.5
      },
      {
        "name": "Ángel Correa",
        "number": 10,
        "pos": "FW",
        "rating": 7.4
      }
    ]
  },
  "botafogo": {
    "formation": "4-2-3-1",
    "xi": [
      {
        "name": "John Victor",
        "number": 1,
        "pos": "GK",
        "rating": 7.3,
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
        "rating": 7.15,
        "goals": 1,
        "assists": 2,
        "tackles": 2.4,
        "key_passes": 1.2,
        "shots": 0.6,
        "yellow_cards": 2
      },
      {
        "name": "Bastos",
        "number": 15,
        "pos": "CB",
        "rating": 7.4,
        "goals": 3,
        "assists": 0,
        "tackles": 2.5,
        "key_passes": 0.2,
        "shots": 0.7,
        "yellow_cards": 3
      },
      {
        "name": "Alexander Barboza",
        "number": 20,
        "pos": "CB",
        "rating": 7.35,
        "goals": 1,
        "assists": 1,
        "tackles": 2.6,
        "key_passes": 0.3,
        "shots": 0.5,
        "yellow_cards": 4
      },
      {
        "name": "Alex Telles",
        "number": 13,
        "pos": "LB",
        "rating": 7.45,
        "goals": 2,
        "assists": 4,
        "tackles": 2.1,
        "key_passes": 2.2,
        "shots": 1.1,
        "yellow_cards": 2
      },
      {
        "name": "Gregore",
        "number": 5,
        "pos": "DM",
        "rating": 7.5,
        "goals": 0,
        "assists": 1,
        "tackles": 3.6,
        "key_passes": 0.8,
        "shots": 0.4,
        "yellow_cards": 5
      },
      {
        "name": "Marlon Freitas",
        "number": 17,
        "pos": "CM",
        "rating": 7.6,
        "goals": 2,
        "assists": 5,
        "tackles": 2.5,
        "key_passes": 2.1,
        "shots": 1.2,
        "yellow_cards": 3
      },
      {
        "name": "Luiz Henrique",
        "number": 7,
        "pos": "RW",
        "rating": 8.1,
        "goals": 8,
        "assists": 6,
        "tackles": 1.4,
        "key_passes": 2.9,
        "shots": 3.4,
        "yellow_cards": 2
      },
      {
        "name": "Thiago Almada",
        "number": 23,
        "pos": "AM",
        "rating": 8.05,
        "goals": 5,
        "assists": 7,
        "tackles": 1.3,
        "key_passes": 3.2,
        "shots": 2.8,
        "yellow_cards": 2
      },
      {
        "name": "Jefferson Savarino",
        "number": 10,
        "pos": "LW",
        "rating": 7.75,
        "goals": 7,
        "assists": 6,
        "tackles": 1.1,
        "key_passes": 2.6,
        "shots": 2.7,
        "yellow_cards": 1
      },
      {
        "name": "Igor Jesus",
        "number": 9,
        "pos": "ST",
        "rating": 7.85,
        "goals": 9,
        "assists": 3,
        "tackles": 0.8,
        "key_passes": 1.4,
        "shots": 3.5,
        "yellow_cards": 2
      }
    ],
    "bench": [
      {
        "name": "Gatito Fernández",
        "number": 12,
        "pos": "GK",
        "rating": 6.8
      },
      {
        "name": "Mateo Ponte",
        "number": 4,
        "pos": "DF",
        "rating": 7.0
      },
      {
        "name": "Lucas Halter",
        "number": 3,
        "pos": "DF",
        "rating": 7.05
      },
      {
        "name": "Tchê Tchê",
        "number": 8,
        "pos": "MF",
        "rating": 7.2
      },
      {
        "name": "Danilo Barbosa",
        "number": 6,
        "pos": "MF",
        "rating": 7.15
      },
      {
        "name": "Matheus Martins",
        "number": 11,
        "pos": "FW",
        "rating": 7.4
      },
      {
        "name": "Tiquinho Soares",
        "number": 99,
        "pos": "ST",
        "rating": 7.5
      }
    ]
  },
  "paranaense": {
    "formation": "4-2-3-1",
    "xi": [
      {
        "name": "Mycael",
        "number": 1,
        "pos": "GK",
        "rating": 7.2,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Madson",
        "number": 22,
        "pos": "RB",
        "rating": 7.05,
        "goals": 1,
        "assists": 2,
        "tackles": 2.1,
        "key_passes": 1.1,
        "shots": 0.6,
        "yellow_cards": 2
      },
      {
        "name": "Kaique Rocha",
        "number": 4,
        "pos": "CB",
        "rating": 7.25,
        "goals": 2,
        "assists": 0,
        "tackles": 2.4,
        "key_passes": 0.2,
        "shots": 0.4,
        "yellow_cards": 3
      },
      {
        "name": "Thiago Heleno",
        "number": 44,
        "pos": "CB",
        "rating": 7.3,
        "goals": 1,
        "assists": 0,
        "tackles": 2.3,
        "key_passes": 0.3,
        "shots": 0.5,
        "yellow_cards": 4
      },
      {
        "name": "Fernando",
        "number": 6,
        "pos": "LB",
        "rating": 6.95,
        "goals": 0,
        "assists": 1,
        "tackles": 2.0,
        "key_passes": 0.9,
        "shots": 0.3,
        "yellow_cards": 2
      },
      {
        "name": "Erick",
        "number": 26,
        "pos": "DM",
        "rating": 7.4,
        "goals": 3,
        "assists": 2,
        "tackles": 3.1,
        "key_passes": 1.3,
        "shots": 1.2,
        "yellow_cards": 3
      },
      {
        "name": "Gabriel",
        "number": 5,
        "pos": "CM",
        "rating": 7.15,
        "goals": 1,
        "assists": 1,
        "tackles": 2.8,
        "key_passes": 1.0,
        "shots": 0.7,
        "yellow_cards": 4
      },
      {
        "name": "Tomás Cuello",
        "number": 28,
        "pos": "RW",
        "rating": 7.35,
        "goals": 4,
        "assists": 5,
        "tackles": 1.5,
        "key_passes": 2.3,
        "shots": 2.4,
        "yellow_cards": 2
      },
      {
        "name": "Bruno Zapelli",
        "number": 10,
        "pos": "AM",
        "rating": 7.55,
        "goals": 3,
        "assists": 6,
        "tackles": 1.4,
        "key_passes": 2.9,
        "shots": 2.1,
        "yellow_cards": 2
      },
      {
        "name": "Nikão",
        "number": 11,
        "pos": "LW",
        "rating": 7.3,
        "goals": 4,
        "assists": 3,
        "tackles": 1.2,
        "key_passes": 2.0,
        "shots": 2.2,
        "yellow_cards": 1
      },
      {
        "name": "Agustín Canobbio",
        "number": 9,
        "pos": "ST",
        "rating": 7.5,
        "goals": 7,
        "assists": 4,
        "tackles": 1.6,
        "key_passes": 1.8,
        "shots": 3.0,
        "yellow_cards": 3
      }
    ],
    "bench": [
      {
        "name": "Léo Linck",
        "number": 24,
        "pos": "GK",
        "rating": 6.7
      },
      {
        "name": "Leo Godoy",
        "number": 2,
        "pos": "DF",
        "rating": 6.9
      },
      {
        "name": "Mateo Gamarra",
        "number": 15,
        "pos": "DF",
        "rating": 6.85
      },
      {
        "name": "Fernandinho",
        "number": 8,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Christian",
        "number": 88,
        "pos": "MF",
        "rating": 7.1
      },
      {
        "name": "Julimar",
        "number": 20,
        "pos": "FW",
        "rating": 7.2
      },
      {
        "name": "Pablo",
        "number": 92,
        "pos": "FW",
        "rating": 7.15
      }
    ]
  },
  "flamengo": {
    "formation": "4-2-3-1",
    "xi": [
      {
        "name": "Agustín Rossi",
        "number": 1,
        "pos": "GK",
        "rating": 7.35,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Guillermo Varela",
        "number": 2,
        "pos": "RB",
        "rating": 7.15,
        "goals": 1,
        "assists": 2,
        "tackles": 2.3,
        "key_passes": 1.2,
        "shots": 0.5,
        "yellow_cards": 3
      },
      {
        "name": "Fabrício Bruno",
        "number": 15,
        "pos": "CB",
        "rating": 7.45,
        "goals": 2,
        "assists": 0,
        "tackles": 2.6,
        "key_passes": 0.2,
        "shots": 0.6,
        "yellow_cards": 3
      },
      {
        "name": "Léo Ortiz",
        "number": 3,
        "pos": "CB",
        "rating": 7.5,
        "goals": 1,
        "assists": 1,
        "tackles": 2.5,
        "key_passes": 0.8,
        "shots": 0.4,
        "yellow_cards": 2
      },
      {
        "name": "Ayrton Lucas",
        "number": 6,
        "pos": "LB",
        "rating": 7.3,
        "goals": 2,
        "assists": 3,
        "tackles": 2.1,
        "key_passes": 1.5,
        "shots": 0.9,
        "yellow_cards": 2
      },
      {
        "name": "Erick Pulgar",
        "number": 5,
        "pos": "DM",
        "rating": 7.45,
        "goals": 1,
        "assists": 2,
        "tackles": 3.4,
        "key_passes": 1.4,
        "shots": 0.8,
        "yellow_cards": 4
      },
      {
        "name": "Nicolás de la Cruz",
        "number": 18,
        "pos": "CM",
        "rating": 7.7,
        "goals": 3,
        "assists": 4,
        "tackles": 2.7,
        "key_passes": 2.8,
        "shots": 2.1,
        "yellow_cards": 3
      },
      {
        "name": "Gerson",
        "number": 8,
        "pos": "RW",
        "rating": 7.9,
        "goals": 5,
        "assists": 7,
        "tackles": 2.2,
        "key_passes": 3.1,
        "shots": 2.2,
        "yellow_cards": 2
      },
      {
        "name": "Giorgian de Arrascaeta",
        "number": 14,
        "pos": "AM",
        "rating": 8.05,
        "goals": 8,
        "assists": 9,
        "tackles": 1.3,
        "key_passes": 3.6,
        "shots": 2.8,
        "yellow_cards": 2
      },
      {
        "name": "Bruno Henrique",
        "number": 27,
        "pos": "LW",
        "rating": 7.6,
        "goals": 7,
        "assists": 3,
        "tackles": 1.1,
        "key_passes": 1.9,
        "shots": 3.0,
        "yellow_cards": 3
      },
      {
        "name": "Pedro",
        "number": 9,
        "pos": "ST",
        "rating": 8.2,
        "goals": 18,
        "assists": 4,
        "tackles": 0.5,
        "key_passes": 1.5,
        "shots": 4.2,
        "yellow_cards": 2
      }
    ],
    "bench": [
      {
        "name": "Matheus Cunha",
        "number": 25,
        "pos": "GK",
        "rating": 6.8
      },
      {
        "name": "Wesley",
        "number": 43,
        "pos": "DF",
        "rating": 7.1
      },
      {
        "name": "David Luiz",
        "number": 23,
        "pos": "DF",
        "rating": 7.15
      },
      {
        "name": "Allan",
        "number": 21,
        "pos": "MF",
        "rating": 7.2
      },
      {
        "name": "Carlos Alcaraz",
        "number": 37,
        "pos": "MF",
        "rating": 7.3
      },
      {
        "name": "Michael",
        "number": 30,
        "pos": "FW",
        "rating": 7.4
      },
      {
        "name": "Gabriel Barbosa",
        "number": 99,
        "pos": "FW",
        "rating": 7.5
      }
    ]
  },
  "palmeiras": {
    "formation": "4-2-3-1",
    "xi": [
      {
        "name": "Weverton",
        "number": 21,
        "pos": "GK",
        "rating": 7.35,
        "goals": 0,
        "assists": 0,
        "tackles": 0.2,
        "key_passes": 0.1,
        "shots": 0.0,
        "yellow_cards": 1
      },
      {
        "name": "Marcos Rocha",
        "number": 2,
        "pos": "RB",
        "rating": 7.2,
        "goals": 0,
        "assists": 4,
        "tackles": 2.5,
        "key_passes": 1.4,
        "shots": 0.4,
        "yellow_cards": 3
      },
      {
        "name": "Gustavo Gómez",
        "number": 15,
        "pos": "CB",
        "rating": 7.6,
        "goals": 3,
        "assists": 1,
        "tackles": 2.8,
        "key_passes": 0.4,
        "shots": 0.9,
        "yellow_cards": 4
      },
      {
        "name": "Murilo",
        "number": 26,
        "pos": "CB",
        "rating": 7.45,
        "goals": 2,
        "assists": 0,
        "tackles": 2.4,
        "key_passes": 0.3,
        "shots": 0.6,
        "yellow_cards": 2
      },
      {
        "name": "Joaquín Piquerez",
        "number": 22,
        "pos": "LB",
        "rating": 7.5,
        "goals": 2,
        "assists": 4,
        "tackles": 2.4,
        "key_passes": 2.0,
        "shots": 1.2,
        "yellow_cards": 2
      },
      {
        "name": "Aníbal Moreno",
        "number": 5,
        "pos": "DM",
        "rating": 7.6,
        "goals": 2,
        "assists": 1,
        "tackles": 3.7,
        "key_passes": 1.2,
        "shots": 0.9,
        "yellow_cards": 5
      },
      {
        "name": "Richard Ríos",
        "number": 8,
        "pos": "CM",
        "rating": 7.45,
        "goals": 3,
        "assists": 3,
        "tackles": 2.6,
        "key_passes": 1.8,
        "shots": 1.6,
        "yellow_cards": 3
      },
      {
        "name": "Estêvão",
        "number": 41,
        "pos": "RW",
        "rating": 8.25,
        "goals": 12,
        "assists": 8,
        "tackles": 1.4,
        "key_passes": 3.4,
        "shots": 3.6,
        "yellow_cards": 2
      },
      {
        "name": "Raphael Veiga",
        "number": 23,
        "pos": "AM",
        "rating": 7.9,
        "goals": 10,
        "assists": 6,
        "tackles": 1.5,
        "key_passes": 3.0,
        "shots": 3.2,
        "yellow_cards": 2
      },
      {
        "name": "Felipe Anderson",
        "number": 7,
        "pos": "LW",
        "rating": 7.55,
        "goals": 4,
        "assists": 5,
        "tackles": 1.6,
        "key_passes": 2.4,
        "shots": 2.1,
        "yellow_cards": 1
      },
      {
        "name": "Flaco López",
        "number": 42,
        "pos": "ST",
        "rating": 7.8,
        "goals": 11,
        "assists": 3,
        "tackles": 0.7,
        "key_passes": 1.2,
        "shots": 3.7,
        "yellow_cards": 2
      }
    ],
    "bench": [
      {
        "name": "Marcelo Lomba",
        "number": 14,
        "pos": "GK",
        "rating": 6.7
      },
      {
        "name": "Mayke",
        "number": 12,
        "pos": "DF",
        "rating": 7.15
      },
      {
        "name": "Vitor Reis",
        "number": 44,
        "pos": "DF",
        "rating": 7.2
      },
      {
        "name": "Zé Rafael",
        "number": 8,
        "pos": "MF",
        "rating": 7.3
      },
      {
        "name": "Maurício",
        "number": 18,
        "pos": "MF",
        "rating": 7.4
      },
      {
        "name": "Dudu",
        "number": 7,
        "pos": "FW",
        "rating": 7.35
      },
      {
        "name": "Rony",
        "number": 10,
        "pos": "FW",
        "rating": 7.25
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