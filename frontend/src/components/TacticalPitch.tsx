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
  // ── Botafogo (Brasileirão) ──
  'botafogo': {
    formation: '4-2-3-1',
    xi: [
      { name: 'John Victor', number: 1, pos: 'GK', rating: 7.30, goals: 0, assists: 0, tackles: 0.2, key_passes: 0.1, shots: 0.0, yellow_cards: 1 },
      { name: 'Vitinho', number: 2, pos: 'RB', rating: 7.15, goals: 1, assists: 2, tackles: 2.4, key_passes: 1.2, shots: 0.6, yellow_cards: 2 },
      { name: 'Bastos', number: 15, pos: 'CB', rating: 7.40, goals: 3, assists: 0, tackles: 2.5, key_passes: 0.2, shots: 0.7, yellow_cards: 3 },
      { name: 'Alexander Barboza', number: 20, pos: 'CB', rating: 7.35, goals: 1, assists: 1, tackles: 2.6, key_passes: 0.3, shots: 0.5, yellow_cards: 4 },
      { name: 'Alex Telles', number: 13, pos: 'LB', rating: 7.45, goals: 2, assists: 4, tackles: 2.1, key_passes: 2.2, shots: 1.1, yellow_cards: 2 },
      { name: 'Gregore', number: 5, pos: 'DM', rating: 7.50, goals: 0, assists: 1, tackles: 3.6, key_passes: 0.8, shots: 0.4, yellow_cards: 5 },
      { name: 'Marlon Freitas', number: 17, pos: 'CM', rating: 7.60, goals: 2, assists: 5, tackles: 2.5, key_passes: 2.1, shots: 1.2, yellow_cards: 3 },
      { name: 'Luiz Henrique', number: 7, pos: 'RW', rating: 8.10, goals: 8, assists: 6, tackles: 1.4, key_passes: 2.9, shots: 3.4, yellow_cards: 2 },
      { name: 'Thiago Almada', number: 23, pos: 'AM', rating: 8.05, goals: 5, assists: 7, tackles: 1.3, key_passes: 3.2, shots: 2.8, yellow_cards: 2 },
      { name: 'Jefferson Savarino', number: 10, pos: 'LW', rating: 7.75, goals: 7, assists: 6, tackles: 1.1, key_passes: 2.6, shots: 2.7, yellow_cards: 1 },
      { name: 'Igor Jesus', number: 9, pos: 'ST', rating: 7.85, goals: 9, assists: 3, tackles: 0.8, key_passes: 1.4, shots: 3.5, yellow_cards: 2 },
    ],
    bench: [
      { name: 'Gatito Fernández', number: 12, pos: 'GK', rating: 6.80 },
      { name: 'Mateo Ponte', number: 4, pos: 'DF', rating: 7.00 },
      { name: 'Lucas Halter', number: 3, pos: 'DF', rating: 7.05 },
      { name: 'Tchê Tchê', number: 8, pos: 'MF', rating: 7.20 },
      { name: 'Danilo Barbosa', number: 6, pos: 'MF', rating: 7.15 },
      { name: 'Matheus Martins', number: 11, pos: 'FW', rating: 7.40 },
      { name: 'Tiquinho Soares', number: 99, pos: 'ST', rating: 7.50 },
    ],
  },

  // ── Athletico Paranaense / Paraná ──
  'paranaense': {
    formation: '4-2-3-1',
    xi: [
      { name: 'Mycael', number: 1, pos: 'GK', rating: 7.20, goals: 0, assists: 0, tackles: 0.2, key_passes: 0.1, shots: 0.0, yellow_cards: 1 },
      { name: 'Madson', number: 22, pos: 'RB', rating: 7.05, goals: 1, assists: 2, tackles: 2.1, key_passes: 1.1, shots: 0.6, yellow_cards: 2 },
      { name: 'Kaique Rocha', number: 4, pos: 'CB', rating: 7.25, goals: 2, assists: 0, tackles: 2.4, key_passes: 0.2, shots: 0.4, yellow_cards: 3 },
      { name: 'Thiago Heleno', number: 44, pos: 'CB', rating: 7.30, goals: 1, assists: 0, tackles: 2.3, key_passes: 0.3, shots: 0.5, yellow_cards: 4 },
      { name: 'Fernando', number: 6, pos: 'LB', rating: 6.95, goals: 0, assists: 1, tackles: 2.0, key_passes: 0.9, shots: 0.3, yellow_cards: 2 },
      { name: 'Erick', number: 26, pos: 'DM', rating: 7.40, goals: 3, assists: 2, tackles: 3.1, key_passes: 1.3, shots: 1.2, yellow_cards: 3 },
      { name: 'Gabriel', number: 5, pos: 'CM', rating: 7.15, goals: 1, assists: 1, tackles: 2.8, key_passes: 1.0, shots: 0.7, yellow_cards: 4 },
      { name: 'Tomás Cuello', number: 28, pos: 'RW', rating: 7.35, goals: 4, assists: 5, tackles: 1.5, key_passes: 2.3, shots: 2.4, yellow_cards: 2 },
      { name: 'Bruno Zapelli', number: 10, pos: 'AM', rating: 7.55, goals: 3, assists: 6, tackles: 1.4, key_passes: 2.9, shots: 2.1, yellow_cards: 2 },
      { name: 'Nikão', number: 11, pos: 'LW', rating: 7.30, goals: 4, assists: 3, tackles: 1.2, key_passes: 2.0, shots: 2.2, yellow_cards: 1 },
      { name: 'Agustín Canobbio', number: 9, pos: 'ST', rating: 7.50, goals: 7, assists: 4, tackles: 1.6, key_passes: 1.8, shots: 3.0, yellow_cards: 3 },
    ],
    bench: [
      { name: 'Léo Linck', number: 24, pos: 'GK', rating: 6.70 },
      { name: 'Leo Godoy', number: 2, pos: 'DF', rating: 6.90 },
      { name: 'Mateo Gamarra', number: 15, pos: 'DF', rating: 6.85 },
      { name: 'Fernandinho', number: 8, pos: 'MF', rating: 7.40 },
      { name: 'Christian', number: 88, pos: 'MF', rating: 7.10 },
      { name: 'Julimar', number: 20, pos: 'FW', rating: 7.20 },
      { name: 'Pablo', number: 92, pos: 'FW', rating: 7.15 },
    ],
  },
  'athletico': {
    formation: '4-2-3-1',
    xi: [
      { name: 'Mycael', number: 1, pos: 'GK', rating: 7.20, goals: 0, assists: 0, tackles: 0.2, key_passes: 0.1, shots: 0.0, yellow_cards: 1 },
      { name: 'Madson', number: 22, pos: 'RB', rating: 7.05, goals: 1, assists: 2, tackles: 2.1, key_passes: 1.1, shots: 0.6, yellow_cards: 2 },
      { name: 'Kaique Rocha', number: 4, pos: 'CB', rating: 7.25, goals: 2, assists: 0, tackles: 2.4, key_passes: 0.2, shots: 0.4, yellow_cards: 3 },
      { name: 'Thiago Heleno', number: 44, pos: 'CB', rating: 7.30, goals: 1, assists: 0, tackles: 2.3, key_passes: 0.3, shots: 0.5, yellow_cards: 4 },
      { name: 'Fernando', number: 6, pos: 'LB', rating: 6.95, goals: 0, assists: 1, tackles: 2.0, key_passes: 0.9, shots: 0.3, yellow_cards: 2 },
      { name: 'Erick', number: 26, pos: 'DM', rating: 7.40, goals: 3, assists: 2, tackles: 3.1, key_passes: 1.3, shots: 1.2, yellow_cards: 3 },
      { name: 'Gabriel', number: 5, pos: 'CM', rating: 7.15, goals: 1, assists: 1, tackles: 2.8, key_passes: 1.0, shots: 0.7, yellow_cards: 4 },
      { name: 'Tomás Cuello', number: 28, pos: 'RW', rating: 7.35, goals: 4, assists: 5, tackles: 1.5, key_passes: 2.3, shots: 2.4, yellow_cards: 2 },
      { name: 'Bruno Zapelli', number: 10, pos: 'AM', rating: 7.55, goals: 3, assists: 6, tackles: 1.4, key_passes: 2.9, shots: 2.1, yellow_cards: 2 },
      { name: 'Nikão', number: 11, pos: 'LW', rating: 7.30, goals: 4, assists: 3, tackles: 1.2, key_passes: 2.0, shots: 2.2, yellow_cards: 1 },
      { name: 'Agustín Canobbio', number: 9, pos: 'ST', rating: 7.50, goals: 7, assists: 4, tackles: 1.6, key_passes: 1.8, shots: 3.0, yellow_cards: 3 },
    ],
    bench: [
      { name: 'Léo Linck', number: 24, pos: 'GK', rating: 6.70 },
      { name: 'Leo Godoy', number: 2, pos: 'DF', rating: 6.90 },
      { name: 'Mateo Gamarra', number: 15, pos: 'DF', rating: 6.85 },
      { name: 'Fernandinho', number: 8, pos: 'MF', rating: 7.40 },
      { name: 'Christian', number: 88, pos: 'MF', rating: 7.10 },
      { name: 'Julimar', number: 20, pos: 'FW', rating: 7.20 },
      { name: 'Pablo', number: 92, pos: 'FW', rating: 7.15 },
    ],
  },

  // ── Osasuna ──
  'osasuna': {
    formation: '4-2-3-1',
    xi: [
      { name: 'Sergio Herrera', number: 1, pos: 'GK', rating: 7.25, goals: 0, assists: 0, tackles: 0.2, key_passes: 0.1, shots: 0.0, yellow_cards: 2 },
      { name: 'Jesús Areso', number: 12, pos: 'RB', rating: 7.15, goals: 1, assists: 3, tackles: 2.2, key_passes: 1.4, shots: 0.7, yellow_cards: 2 },
      { name: 'Alejandro Catena', number: 24, pos: 'CB', rating: 7.20, goals: 0, assists: 1, tackles: 2.1, key_passes: 0.3, shots: 0.5, yellow_cards: 3 },
      { name: 'Enzo Boyomo', number: 22, pos: 'CB', rating: 7.35, goals: 2, assists: 0, tackles: 2.6, key_passes: 0.2, shots: 0.4, yellow_cards: 2 },
      { name: 'Juan Cruz', number: 3, pos: 'LB', rating: 6.95, goals: 0, assists: 1, tackles: 2.0, key_passes: 0.6, shots: 0.3, yellow_cards: 2 },
      { name: 'Lucas Torró', number: 6, pos: 'DM', rating: 7.30, goals: 2, assists: 0, tackles: 3.1, key_passes: 0.8, shots: 0.9, yellow_cards: 4 },
      { name: 'Jon Moncayola', number: 7, pos: 'CM', rating: 7.10, goals: 1, assists: 2, tackles: 2.3, key_passes: 1.5, shots: 1.2, yellow_cards: 2 },
      { name: 'Rubén Peña', number: 15, pos: 'RW', rating: 7.05, goals: 1, assists: 1, tackles: 1.7, key_passes: 1.2, shots: 1.1, yellow_cards: 1 },
      { name: 'Aimar Oroz', number: 10, pos: 'AM', rating: 7.45, goals: 3, assists: 4, tackles: 1.8, key_passes: 2.5, shots: 1.8, yellow_cards: 2 },
      { name: 'Bryan Zaragoza', number: 19, pos: 'LW', rating: 7.60, goals: 4, assists: 5, tackles: 1.1, key_passes: 2.8, shots: 2.6, yellow_cards: 2 },
      { name: 'Ante Budimir', number: 17, pos: 'ST', rating: 7.55, goals: 8, assists: 1, tackles: 0.6, key_passes: 0.9, shots: 2.9, yellow_cards: 2 },
    ],
    bench: [
      { name: 'Aitor Fernández', number: 13, pos: 'GK', rating: 6.70 },
      { name: 'Unai García', number: 4, pos: 'DF', rating: 6.85 },
      { name: 'Pablo Ibáñez', number: 18, pos: 'MF', rating: 6.90 },
      { name: 'Moi Gómez', number: 16, pos: 'MF', rating: 7.10 },
      { name: 'Kike Barja', number: 11, pos: 'FW', rating: 6.80 },
      { name: 'Raúl García', number: 9, pos: 'FW', rating: 7.00 },
      { name: 'José Arnaiz', number: 20, pos: 'FW', rating: 6.85 },
    ],
  },

  // ── Levante ──
  'levante': {
    formation: '3-4-2-1',
    xi: [
      { name: 'Andrés Fernández', number: 1, pos: 'GK', rating: 7.05, goals: 0, assists: 0, tackles: 0.3, key_passes: 0.1, shots: 0.0, yellow_cards: 1 },
      { name: 'Unai Elgezabal', number: 4, pos: 'CB', rating: 7.10, goals: 1, assists: 0, tackles: 2.4, key_passes: 0.2, shots: 0.4, yellow_cards: 3 },
      { name: 'Jorge Cabello', number: 14, pos: 'CB', rating: 6.95, goals: 0, assists: 0, tackles: 2.1, key_passes: 0.2, shots: 0.3, yellow_cards: 2 },
      { name: 'Diego Pampín', number: 3, pos: 'CB', rating: 7.00, goals: 0, assists: 1, tackles: 2.2, key_passes: 0.7, shots: 0.4, yellow_cards: 2 },
      { name: 'Andrés García', number: 2, pos: 'RWB', rating: 7.20, goals: 2, assists: 2, tackles: 2.1, key_passes: 1.6, shots: 1.1, yellow_cards: 1 },
      { name: 'Ángel Algobia', number: 6, pos: 'CM', rating: 7.05, goals: 1, assists: 1, tackles: 2.8, key_passes: 1.1, shots: 0.8, yellow_cards: 3 },
      { name: 'Oriol Rey', number: 20, pos: 'CM', rating: 7.15, goals: 0, assists: 2, tackles: 2.7, key_passes: 1.4, shots: 0.6, yellow_cards: 2 },
      { name: 'Marcos Navarro', number: 29, pos: 'LWB', rating: 6.90, goals: 0, assists: 1, tackles: 1.9, key_passes: 0.8, shots: 0.4, yellow_cards: 1 },
      { name: 'Carlos Álvarez', number: 11, pos: 'AM', rating: 7.45, goals: 4, assists: 5, tackles: 1.5, key_passes: 2.7, shots: 2.2, yellow_cards: 1 },
      { name: 'Pablo Martínez', number: 10, pos: 'AM', rating: 7.25, goals: 3, assists: 3, tackles: 1.8, key_passes: 2.1, shots: 1.9, yellow_cards: 3 },
      { name: 'José Luis Morales', number: 18, pos: 'ST', rating: 7.35, goals: 6, assists: 2, tackles: 0.6, key_passes: 1.3, shots: 2.8, yellow_cards: 2 },
    ],
    bench: [
      { name: 'Alfonso Pastor', number: 13, pos: 'GK', rating: 6.60 },
      { name: 'Adrián de la Fuente', number: 5, pos: 'DF', rating: 6.85 },
      { name: 'Vicente Iborra', number: 8, pos: 'MF', rating: 7.00 },
      { name: 'Giorgi Kochorashvili', number: 16, pos: 'MF', rating: 7.20 },
      { name: 'Brugui', number: 7, pos: 'FW', rating: 7.15 },
      { name: 'Fabrício Santos', number: 12, pos: 'FW', rating: 7.05 },
      { name: 'Iván Romero', number: 9, pos: 'FW', rating: 6.90 },
    ],
  },

  // ── Real Madrid ──
  'real madrid': {
    formation: '4-3-3',
    xi: [
      { name: 'Thibaut Courtois', number: 1, pos: 'GK', rating: 7.42, goals: 0, assists: 0, tackles: 0.4, key_passes: 0.1, shots: 0.0, yellow_cards: 0 },
      { name: 'Dani Carvajal', number: 2, pos: 'RB', rating: 7.35, goals: 1, assists: 2, tackles: 2.1, key_passes: 1.2, shots: 0.8, yellow_cards: 3 },
      { name: 'Éder Militão', number: 3, pos: 'CB', rating: 7.28, goals: 1, assists: 0, tackles: 1.9, key_passes: 0.3, shots: 0.6, yellow_cards: 2 },
      { name: 'Antonio Rüdiger', number: 22, pos: 'CB', rating: 7.40, goals: 2, assists: 0, tackles: 1.8, key_passes: 0.2, shots: 0.9, yellow_cards: 1 },
      { name: 'Ferland Mendy', number: 23, pos: 'LB', rating: 7.05, goals: 0, assists: 1, tackles: 1.7, key_passes: 0.6, shots: 0.3, yellow_cards: 2 },
      { name: 'Federico Valverde', number: 8, pos: 'CM', rating: 7.82, goals: 4, assists: 4, tackles: 2.4, key_passes: 2.1, shots: 2.6, yellow_cards: 1 },
      { name: 'Aurélien Tchouaméni', number: 14, pos: 'DM', rating: 7.30, goals: 0, assists: 1, tackles: 2.8, key_passes: 0.9, shots: 0.8, yellow_cards: 3 },
      { name: 'Jude Bellingham', number: 5, pos: 'AM', rating: 8.15, goals: 8, assists: 6, tackles: 1.9, key_passes: 2.5, shots: 3.1, yellow_cards: 2 },
      { name: 'Rodrygo', number: 11, pos: 'RW', rating: 7.55, goals: 6, assists: 5, tackles: 1.1, key_passes: 2.0, shots: 2.8, yellow_cards: 1 },
      { name: 'Kylian Mbappé', number: 9, pos: 'ST', rating: 8.20, goals: 14, assists: 3, tackles: 0.4, key_passes: 1.8, shots: 4.5, yellow_cards: 1 },
      { name: 'Vinícius Júnior', number: 7, pos: 'LW', rating: 8.35, goals: 12, assists: 8, tackles: 1.2, key_passes: 3.2, shots: 3.9, yellow_cards: 4 },
    ],
    bench: [
      { name: 'Andriy Lunin', number: 13, pos: 'GK', rating: 7.10 },
      { name: 'Lucas Vázquez', number: 17, pos: 'DF', rating: 7.00 },
      { name: 'Luka Modrić', number: 10, pos: 'MF', rating: 7.45 },
      { name: 'Eduardo Camavinga', number: 6, pos: 'MF', rating: 7.30 },
      { name: 'Arda Güler', number: 15, pos: 'MF', rating: 7.20 },
      { name: 'Brahim Díaz', number: 21, pos: 'FW', rating: 7.35 },
      { name: 'Endrick', number: 16, pos: 'FW', rating: 7.15 },
    ],
  },

  // ── Barcelona ──
  'barcelona': {
    formation: '4-2-3-1',
    xi: [
      { name: 'Marc-André ter Stegen', number: 1, pos: 'GK', rating: 7.35, goals: 0, assists: 0, tackles: 0.3, key_passes: 0.1, shots: 0.0, yellow_cards: 0 },
      { name: 'Jules Koundé', number: 23, pos: 'RB', rating: 7.60, goals: 2, assists: 4, tackles: 2.5, key_passes: 1.6, shots: 0.6, yellow_cards: 1 },
      { name: 'Pau Cubarsí', number: 2, pos: 'CB', rating: 7.45, goals: 0, assists: 1, tackles: 2.1, key_passes: 0.8, shots: 0.2, yellow_cards: 2 },
      { name: 'Íñigo Martínez', number: 5, pos: 'CB', rating: 7.35, goals: 1, assists: 1, tackles: 2.0, key_passes: 0.4, shots: 0.5, yellow_cards: 3 },
      { name: 'Alejandro Balde', number: 3, pos: 'LB', rating: 7.30, goals: 1, assists: 3, tackles: 1.8, key_passes: 1.5, shots: 0.7, yellow_cards: 1 },
      { name: 'Marc Casadó', number: 17, pos: 'DM', rating: 7.40, goals: 0, assists: 3, tackles: 2.9, key_passes: 1.4, shots: 0.4, yellow_cards: 3 },
      { name: 'Pedri', number: 8, pos: 'CM', rating: 7.95, goals: 4, assists: 5, tackles: 2.2, key_passes: 2.8, shots: 1.8, yellow_cards: 2 },
      { name: 'Lamine Yamal', number: 19, pos: 'RW', rating: 8.25, goals: 7, assists: 9, tackles: 1.4, key_passes: 3.4, shots: 3.2, yellow_cards: 1 },
      { name: 'Dani Olmo', number: 20, pos: 'AM', rating: 7.80, goals: 6, assists: 4, tackles: 1.3, key_passes: 2.6, shots: 2.9, yellow_cards: 1 },
      { name: 'Raphinha', number: 11, pos: 'LW', rating: 8.30, goals: 13, assists: 8, tackles: 1.6, key_passes: 3.5, shots: 3.8, yellow_cards: 2 },
      { name: 'Robert Lewandowski', number: 9, pos: 'ST', rating: 8.10, goals: 17, assists: 2, tackles: 0.5, key_passes: 1.2, shots: 4.1, yellow_cards: 1 },
    ],
    bench: [
      { name: 'Iñaki Peña', number: 13, pos: 'GK', rating: 6.85 },
      { name: 'Andreas Christensen', number: 15, pos: 'DF', rating: 7.10 },
      { name: 'Frenkie de Jong', number: 21, pos: 'MF', rating: 7.50 },
      { name: 'Gavi', number: 6, pos: 'MF', rating: 7.45 },
      { name: 'Fermín López', number: 16, pos: 'MF', rating: 7.25 },
      { name: 'Ferran Torres', number: 7, pos: 'FW', rating: 7.15 },
      { name: 'Pau Víctor', number: 18, pos: 'FW', rating: 6.90 },
    ],
  },
};

// Non-overlapping coordinates (Home: Y from 7% to 46%; Away: Y from 54% to 93%)
const FORMATION_COORDINATES: Record<string, [number, number][]> = {
  '4-3-3': [
    [50, 7],
    [12, 17], [37, 16], [63, 16], [88, 17],
    [28, 28], [50, 27], [72, 28],
    [16, 42], [50, 46], [84, 42],
  ],
  '4-2-3-1': [
    [50, 7],
    [12, 17], [37, 16], [63, 16], [88, 17],
    [34, 27], [66, 27],
    [15, 37], [50, 36], [85, 37],
    [50, 46],
  ],
  '3-4-2-1': [
    [50, 7],
    [25, 17], [50, 16], [75, 17],
    [10, 27], [36, 27], [64, 27], [90, 27],
    [30, 37], [70, 37],
    [50, 46],
  ],
  '3-5-2': [
    [50, 7],
    [25, 17], [50, 16], [75, 17],
    [10, 27], [30, 27], [50, 26], [70, 27], [90, 27],
    [35, 46], [65, 46],
  ],
  '4-4-2': [
    [50, 7],
    [12, 17], [37, 16], [63, 16], [88, 17],
    [14, 29], [38, 29], [62, 29], [86, 29],
    [35, 46], [65, 46],
  ],
  '5-3-2': [
    [50, 7],
    [10, 17], [28, 16], [50, 15], [72, 16], [90, 17],
    [28, 28], [50, 27], [72, 28],
    [35, 46], [65, 46],
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

function resolveTeamLineup(teamName: string, formation: string, isHome: boolean): TeamLineup {
  const clean = teamName.toLowerCase().replace(/fc|cf|ca|afc|ec/g, '').trim();
  let match = Object.keys(SQUADS_DB).find(k => clean.includes(k) || k.includes(clean));
  
  const squad = match ? SQUADS_DB[match] : null;
  const form = squad?.formation || (FORMATION_COORDINATES[formation] ? formation : '4-2-3-1');
  const coords = FORMATION_COORDINATES[form] || FORMATION_COORDINATES['4-2-3-1'];

  let xi: Player[] = [];
  let bench: Player[] = [];

  if (squad) {
    xi = squad.xi.map(p => ({ ...p }));
    bench = squad.bench.map(p => ({ ...p }));
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
  homeName,
  awayName,
  homeFormation = '4-2-3-1',
  awayFormation = '4-3-3',
  homeManager,
  awayManager,
  isLiveOrFinished = false,
  onRefresh,
}: TacticalPitchProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const homeLineup = useMemo(() => {
    if (lineupData?.home?.starting_xi && lineupData.home.starting_xi.length > 0) return lineupData.home;
    return resolveTeamLineup(homeName, homeFormation, true);
  }, [lineupData, homeName, homeFormation]);

  const awayLineup = useMemo(() => {
    if (lineupData?.away?.starting_xi && lineupData.away.starting_xi.length > 0) return lineupData.away;
    return resolveTeamLineup(awayName, awayFormation, false);
  }, [lineupData, awayName, awayFormation]);

  const hPlayers = homeLineup.starting_xi;
  const aPlayers = awayLineup.starting_xi;
  const hBench = homeLineup.bench || [];
  const aBench = awayLineup.bench || [];

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
            {homeLineup.formation}
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
            {awayLineup.formation}
          </span>
          <span style={{ fontWeight: 800, color: '#f87171', fontSize: '0.88rem' }}>{awayName}</span>
        </div>
      </div>

      {/* 🏟️ 2D Interactive Football Pitch */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '600px',
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
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 60px, transparent 60px, transparent 120px)',
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
          const posX = player.x ?? 50;
          const posY = player.y ?? (8 + idx * 4);
          const isSelected = selectedPlayer?.name === player.name;
          const lastName = player.name.includes(' ') ? player.name.split(' ').slice(1).join(' ') : player.name;

          return (
            <div
              key={`h-${player.name}-${idx}`}
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
                zIndex: isSelected ? 25 : 10,
                transition: 'transform 0.15s ease',
              }}
              title={`Click for ${player.name}'s stats`}
            >
              {/* Jersey Node */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isSelected ? '#38bdf8' : 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                border: '2px solid #ffffff',
                boxShadow: isSelected ? '0 0 14px #38bdf8' : '0 2px 8px rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.78rem',
              }}>
                {player.number}
              </div>

              {/* Player Name Tag */}
              <div style={{
                marginTop: '2px',
                background: 'rgba(0,0,0,0.85)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '4px',
                padding: '1px 5px',
                color: '#ffffff',
                fontSize: '0.66rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                maxWidth: '96px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textAlign: 'center',
                boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
              }}>
                {lastName}
              </div>

              {/* Rating Tag */}
              <div style={{
                marginTop: '1px',
                fontSize: '0.60rem',
                fontWeight: 800,
                padding: '0 4px',
                borderRadius: '3px',
                background: 'rgba(0,0,0,0.85)',
                color: player.rating >= 7.5 ? '#4ade80' : '#facc15',
              }}>
                ⭐ {player.rating.toFixed(1)}
              </div>
            </div>
          );
        })}

        {/* Away Players (Bottom Half) */}
        {aPlayers.map((player, idx) => {
          const posX = player.x ?? 50;
          const posY = player.y ?? (92 - idx * 4);
          const isSelected = selectedPlayer?.name === player.name;
          const lastName = player.name.includes(' ') ? player.name.split(' ').slice(1).join(' ') : player.name;

          return (
            <div
              key={`a-${player.name}-${idx}`}
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
                zIndex: isSelected ? 25 : 10,
                transition: 'transform 0.15s ease',
              }}
              title={`Click for ${player.name}'s stats`}
            >
              {/* Jersey Node */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isSelected ? '#f87171' : 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                border: '2px solid #ffffff',
                boxShadow: isSelected ? '0 0 14px #f87171' : '0 2px 8px rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.78rem',
              }}>
                {player.number}
              </div>

              {/* Player Name Tag */}
              <div style={{
                marginTop: '2px',
                background: 'rgba(0,0,0,0.85)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '4px',
                padding: '1px 5px',
                color: '#ffffff',
                fontSize: '0.66rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                maxWidth: '96px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textAlign: 'center',
                boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
              }}>
                {lastName}
              </div>

              {/* Rating Tag */}
              <div style={{
                marginTop: '1px',
                fontSize: '0.60rem',
                fontWeight: 800,
                padding: '0 4px',
                borderRadius: '3px',
                background: 'rgba(0,0,0,0.85)',
                color: player.rating >= 7.5 ? '#4ade80' : '#facc15',
              }}>
                ⭐ {player.rating.toFixed(1)}
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
              {selectedPlayer.number}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                {selectedPlayer.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Club: <span style={{ fontWeight: 700, color: selectedPlayer.is_home ? '#38bdf8' : '#f87171' }}>{selectedPlayer.team || (selectedPlayer.is_home ? homeName : awayName)}</span> · 
                Position: <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedPlayer.pos}</span> · 
                Rating: <span style={{ fontWeight: 800, color: '#4ade80' }}>⭐ {selectedPlayer.rating.toFixed(2)}</span>
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
            {hBench.map((p, idx) => (
              <div key={`hb-${idx}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.2rem 0' }}>
                <span style={{ color: 'var(--text-primary)' }}>
                  <strong style={{ color: '#38bdf8', marginRight: '6px' }}>#{p.number}</strong> {p.name}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {p.pos} · ⭐ {p.rating.toFixed(1)}
                </span>
              </div>
            ))}
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
            {aBench.map((p, idx) => (
              <div key={`ab-${idx}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.2rem 0' }}>
                <span style={{ color: 'var(--text-primary)' }}>
                  <strong style={{ color: '#f87171', marginRight: '6px' }}>#{p.number}</strong> {p.name}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {p.pos} · ⭐ {p.rating.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}