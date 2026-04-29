import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, RotateCcw, Check, ArrowRight, X, Search, Plus, List, Edit2, Trash2 } from "lucide-react";

/* ============================================================
   TYPE CHART — from user-supplied Pokémon Champions chart
   ============================================================ */
const TYPES = ["Normal","Fire","Water","Electric","Grass","Ice","Fighting","Poison","Ground","Flying","Psychic","Bug","Rock","Ghost","Dragon","Dark","Steel","Fairy"];

const TC = (() => {
  const t = {};
  TYPES.forEach(a => { t[a] = {}; TYPES.forEach(d => t[a][d] = 1); });
  const set = (a, d, v) => { t[a][d] = v; };
  set("Normal","Rock",0.5); set("Normal","Ghost",0); set("Normal","Steel",0.5);
  set("Fire","Fire",0.5); set("Fire","Water",0.5); set("Fire","Grass",2); set("Fire","Ice",2); set("Fire","Bug",2); set("Fire","Rock",0.5); set("Fire","Dragon",0.5); set("Fire","Steel",2);
  set("Water","Fire",2); set("Water","Water",0.5); set("Water","Grass",0.5); set("Water","Ground",2); set("Water","Rock",2); set("Water","Dragon",0.5);
  set("Electric","Water",2); set("Electric","Electric",0.5); set("Electric","Grass",0.5); set("Electric","Ground",0); set("Electric","Flying",2); set("Electric","Dragon",0.5);
  set("Grass","Fire",0.5); set("Grass","Water",2); set("Grass","Grass",0.5); set("Grass","Poison",0.5); set("Grass","Ground",2); set("Grass","Flying",0.5); set("Grass","Bug",0.5); set("Grass","Rock",2); set("Grass","Dragon",0.5); set("Grass","Steel",0.5);
  set("Ice","Fire",0.5); set("Ice","Water",0.5); set("Ice","Grass",2); set("Ice","Ice",0.5); set("Ice","Ground",2); set("Ice","Flying",2); set("Ice","Dragon",2); set("Ice","Steel",0.5);
  set("Fighting","Normal",2); set("Fighting","Ice",2); set("Fighting","Poison",0.5); set("Fighting","Flying",0.5); set("Fighting","Psychic",0.5); set("Fighting","Bug",0.5); set("Fighting","Rock",2); set("Fighting","Ghost",0); set("Fighting","Dark",2); set("Fighting","Steel",2); set("Fighting","Fairy",0.5);
  set("Poison","Grass",2); set("Poison","Poison",0.5); set("Poison","Ground",0.5); set("Poison","Rock",0.5); set("Poison","Ghost",0.5); set("Poison","Steel",0); set("Poison","Fairy",2);
  set("Ground","Fire",2); set("Ground","Electric",2); set("Ground","Grass",0.5); set("Ground","Poison",2); set("Ground","Flying",0); set("Ground","Bug",0.5); set("Ground","Rock",2); set("Ground","Steel",2);
  set("Flying","Electric",0.5); set("Flying","Grass",2); set("Flying","Fighting",2); set("Flying","Bug",2); set("Flying","Rock",0.5); set("Flying","Steel",0.5);
  set("Psychic","Fighting",2); set("Psychic","Poison",2); set("Psychic","Psychic",0.5); set("Psychic","Dark",0); set("Psychic","Steel",0.5);
  set("Bug","Fire",0.5); set("Bug","Grass",2); set("Bug","Fighting",0.5); set("Bug","Poison",0.5); set("Bug","Flying",0.5); set("Bug","Psychic",2); set("Bug","Ghost",0.5); set("Bug","Dark",2); set("Bug","Steel",0.5); set("Bug","Fairy",0.5);
  set("Rock","Fire",2); set("Rock","Ice",2); set("Rock","Fighting",0.5); set("Rock","Ground",0.5); set("Rock","Flying",2); set("Rock","Bug",2); set("Rock","Steel",0.5);
  set("Ghost","Normal",0); set("Ghost","Psychic",2); set("Ghost","Ghost",2); set("Ghost","Dark",0.5);
  set("Dragon","Dragon",2); set("Dragon","Steel",0.5); set("Dragon","Fairy",0);
  set("Dark","Fighting",0.5); set("Dark","Psychic",2); set("Dark","Ghost",2); set("Dark","Dark",0.5); set("Dark","Fairy",0.5);
  set("Steel","Fire",0.5); set("Steel","Water",0.5); set("Steel","Electric",0.5); set("Steel","Ice",2); set("Steel","Rock",2); set("Steel","Steel",0.5); set("Steel","Fairy",2);
  set("Fairy","Fire",0.5); set("Fairy","Fighting",2); set("Fairy","Poison",0.5); set("Fairy","Dragon",2); set("Fairy","Dark",2); set("Fairy","Steel",0.5);
  return t;
})();

const eff = (atkType, defTypes) => defTypes.reduce((m, d) => m * (TC[atkType]?.[d] ?? 1), 1);

/* ============================================================
   POKÉDEX
   - TYPE_DEX: types + base speed for hundreds of common VGC species.
     Used for type/speed math regardless of strategic detail.
   - STRATEGIC_DEX: rich data (moves, ability, item, notes) for the
     species we have curated tips for. Optional enrichment.
   - Final POKEDEX is a getter that merges both.
   ============================================================ */
const TYPE_DEX = {
  "Bulbasaur":{types:["Grass","Poison"],speed:45},
  "Ivysaur":{types:["Grass","Poison"],speed:60},
  "Venusaur":{types:["Grass","Poison"],speed:80},
  "Charmander":{types:["Fire"],speed:65},
  "Charmeleon":{types:["Fire"],speed:80},
  "Charizard":{types:["Fire","Flying"],speed:100},
  "Squirtle":{types:["Water"],speed:43},
  "Wartortle":{types:["Water"],speed:58},
  "Blastoise":{types:["Water"],speed:78},
  "Butterfree":{types:["Bug","Flying"],speed:70},
  "Beedrill":{types:["Bug","Poison"],speed:75},
  "Pidgeot":{types:["Normal","Flying"],speed:101},
  "Raticate":{types:["Normal"],speed:97},
  "Fearow":{types:["Normal","Flying"],speed:100},
  "Arbok":{types:["Poison"],speed:80},
  "Pikachu":{types:["Electric"],speed:90},
  "Raichu":{types:["Electric"],speed:110},
  "Sandslash":{types:["Ground"],speed:65},
  "Nidoqueen":{types:["Poison","Ground"],speed:76},
  "Nidoking":{types:["Poison","Ground"],speed:85},
  "Clefable":{types:["Fairy"],speed:60},
  "Ninetales":{types:["Fire"],speed:100},
  "Wigglytuff":{types:["Normal","Fairy"],speed:45},
  "Vileplume":{types:["Grass","Poison"],speed:50},
  "Dugtrio":{types:["Ground"],speed:120},
  "Persian":{types:["Normal"],speed:115},
  "Golduck":{types:["Water"],speed:85},
  "Primeape":{types:["Fighting"],speed:95},
  "Arcanine":{types:["Fire"],speed:95},
  "Poliwrath":{types:["Water","Fighting"],speed:70},
  "Alakazam":{types:["Psychic"],speed:120},
  "Machamp":{types:["Fighting"],speed:55},
  "Victreebel":{types:["Grass","Poison"],speed:70},
  "Tentacruel":{types:["Water","Poison"],speed:100},
  "Golem":{types:["Rock","Ground"],speed:45},
  "Rapidash":{types:["Fire"],speed:105},
  "Slowbro":{types:["Water","Psychic"],speed:30},
  "Magneton":{types:["Electric","Steel"],speed:70},
  "Dodrio":{types:["Normal","Flying"],speed:110},
  "Dewgong":{types:["Water","Ice"],speed:70},
  "Muk":{types:["Poison"],speed:50},
  "Cloyster":{types:["Water","Ice"],speed:70},
  "Gengar":{types:["Ghost","Poison"],speed:110},
  "Hypno":{types:["Psychic"],speed:67},
  "Kingler":{types:["Water"],speed:75},
  "Electrode":{types:["Electric"],speed:150},
  "Exeggutor":{types:["Grass","Psychic"],speed:55},
  "Marowak":{types:["Ground"],speed:45},
  "Hitmonlee":{types:["Fighting"],speed:87},
  "Hitmonchan":{types:["Fighting"],speed:76},
  "Lickitung":{types:["Normal"],speed:30},
  "Weezing":{types:["Poison"],speed:60},
  "Rhydon":{types:["Ground","Rock"],speed:40},
  "Chansey":{types:["Normal"],speed:50},
  "Tangela":{types:["Grass"],speed:60},
  "Kangaskhan":{types:["Normal"],speed:90},
  "Seadra":{types:["Water"],speed:85},
  "Seaking":{types:["Water"],speed:68},
  "Starmie":{types:["Water","Psychic"],speed:115},
  "Mr. Mime":{types:["Psychic","Fairy"],speed:90},
  "Scyther":{types:["Bug","Flying"],speed:105},
  "Jynx":{types:["Ice","Psychic"],speed:95},
  "Electabuzz":{types:["Electric"],speed:105},
  "Magmar":{types:["Fire"],speed:93},
  "Pinsir":{types:["Bug"],speed:85},
  "Tauros":{types:["Normal"],speed:110},
  "Gyarados":{types:["Water","Flying"],speed:81},
  "Lapras":{types:["Water","Ice"],speed:60},
  "Ditto":{types:["Normal"],speed:48},
  "Vaporeon":{types:["Water"],speed:65},
  "Jolteon":{types:["Electric"],speed:130},
  "Flareon":{types:["Fire"],speed:65},
  "Porygon":{types:["Normal"],speed:40},
  "Omastar":{types:["Rock","Water"],speed:55},
  "Kabutops":{types:["Rock","Water"],speed:80},
  "Aerodactyl":{types:["Rock","Flying"],speed:130},
  "Snorlax":{types:["Normal"],speed:30},
  "Articuno":{types:["Ice","Flying"],speed:85},
  "Zapdos":{types:["Electric","Flying"],speed:100},
  "Moltres":{types:["Fire","Flying"],speed:90},
  "Dragonite":{types:["Dragon","Flying"],speed:80},
  "Mewtwo":{types:["Psychic"],speed:130},
  "Mew":{types:["Psychic"],speed:100},
  "Meganium":{types:["Grass"],speed:80},
  "Typhlosion":{types:["Fire"],speed:100},
  "Feraligatr":{types:["Water"],speed:78},
  "Furret":{types:["Normal"],speed:90},
  "Noctowl":{types:["Normal","Flying"],speed:70},
  "Ledian":{types:["Bug","Flying"],speed:85},
  "Ariados":{types:["Bug","Poison"],speed:40},
  "Crobat":{types:["Poison","Flying"],speed:130},
  "Lanturn":{types:["Water","Electric"],speed:67},
  "Pichu":{types:["Electric"],speed:60},
  "Cleffa":{types:["Fairy"],speed:15},
  "Igglybuff":{types:["Normal","Fairy"],speed:15},
  "Togepi":{types:["Fairy"],speed:20},
  "Togetic":{types:["Fairy","Flying"],speed:40},
  "Natu":{types:["Psychic","Flying"],speed:70},
  "Xatu":{types:["Psychic","Flying"],speed:95},
  "Mareep":{types:["Electric"],speed:35},
  "Flaaffy":{types:["Electric"],speed:45},
  "Ampharos":{types:["Electric"],speed:55},
  "Bellossom":{types:["Grass"],speed:50},
  "Marill":{types:["Water","Fairy"],speed:40},
  "Azumarill":{types:["Water","Fairy"],speed:50},
  "Sudowoodo":{types:["Rock"],speed:30},
  "Politoed":{types:["Water"],speed:70},
  "Hoppip":{types:["Grass","Flying"],speed:50},
  "Skiploom":{types:["Grass","Flying"],speed:80},
  "Jumpluff":{types:["Grass","Flying"],speed:110},
  "Sunflora":{types:["Grass"],speed:30},
  "Yanma":{types:["Bug","Flying"],speed:95},
  "Quagsire":{types:["Water","Ground"],speed:35},
  "Espeon":{types:["Psychic"],speed:110},
  "Umbreon":{types:["Dark"],speed:65},
  "Murkrow":{types:["Dark","Flying"],speed:91},
  "Slowking":{types:["Water","Psychic"],speed:30},
  "Misdreavus":{types:["Ghost"],speed:85},
  "Unown":{types:["Psychic"],speed:48},
  "Wobbuffet":{types:["Psychic"],speed:33},
  "Girafarig":{types:["Normal","Psychic"],speed:85},
  "Pineco":{types:["Bug"],speed:15},
  "Forretress":{types:["Bug","Steel"],speed:40},
  "Dunsparce":{types:["Normal"],speed:45},
  "Gligar":{types:["Ground","Flying"],speed:85},
  "Steelix":{types:["Steel","Ground"],speed:30},
  "Granbull":{types:["Fairy"],speed:45},
  "Qwilfish":{types:["Water","Poison"],speed:85},
  "Scizor":{types:["Bug","Steel"],speed:65},
  "Shuckle":{types:["Bug","Rock"],speed:5},
  "Heracross":{types:["Bug","Fighting"],speed:85},
  "Sneasel":{types:["Dark","Ice"],speed:115},
  "Ursaring":{types:["Normal"],speed:55},
  "Magcargo":{types:["Fire","Rock"],speed:30},
  "Piloswine":{types:["Ice","Ground"],speed:50},
  "Corsola":{types:["Water","Rock"],speed:35},
  "Octillery":{types:["Water"],speed:45},
  "Delibird":{types:["Ice","Flying"],speed:75},
  "Mantine":{types:["Water","Flying"],speed:70},
  "Skarmory":{types:["Steel","Flying"],speed:70},
  "Houndoom":{types:["Dark","Fire"],speed:95},
  "Kingdra":{types:["Water","Dragon"],speed:85},
  "Donphan":{types:["Ground"],speed:50},
  "Porygon2":{types:["Normal"],speed:60},
  "Stantler":{types:["Normal"],speed:85},
  "Smeargle":{types:["Normal"],speed:75},
  "Hitmontop":{types:["Fighting"],speed:70},
  "Smoochum":{types:["Ice","Psychic"],speed:65},
  "Elekid":{types:["Electric"],speed:95},
  "Magby":{types:["Fire"],speed:83},
  "Miltank":{types:["Normal"],speed:100},
  "Blissey":{types:["Normal"],speed:55},
  "Raikou":{types:["Electric"],speed:115},
  "Entei":{types:["Fire"],speed:100},
  "Suicune":{types:["Water"],speed:85},
  "Tyranitar":{types:["Rock","Dark"],speed:61},
  "Lugia":{types:["Psychic","Flying"],speed:110},
  "Ho-Oh":{types:["Fire","Flying"],speed:90},
  "Celebi":{types:["Psychic","Grass"],speed:100},
  "Sceptile":{types:["Grass"],speed:120},
  "Blaziken":{types:["Fire","Fighting"],speed:80},
  "Swampert":{types:["Water","Ground"],speed:60},
  "Mightyena":{types:["Dark"],speed:70},
  "Linoone":{types:["Normal"],speed:100},
  "Beautifly":{types:["Bug","Flying"],speed:65},
  "Dustox":{types:["Bug","Poison"],speed:65},
  "Ludicolo":{types:["Water","Grass"],speed:70},
  "Shiftry":{types:["Grass","Dark"],speed:80},
  "Swellow":{types:["Normal","Flying"],speed:125},
  "Pelipper":{types:["Water","Flying"],speed:65},
  "Gardevoir":{types:["Psychic","Fairy"],speed:80},
  "Masquerain":{types:["Bug","Water"],speed:60},
  "Breloom":{types:["Grass","Fighting"],speed:70},
  "Slaking":{types:["Normal"],speed:100},
  "Ninjask":{types:["Bug","Flying"],speed:160},
  "Shedinja":{types:["Bug","Ghost"],speed:40},
  "Loudred":{types:["Normal"],speed:50},
  "Exploud":{types:["Normal"],speed:68},
  "Hariyama":{types:["Fighting"],speed:50},
  "Azurill":{types:["Normal","Fairy"],speed:20},
  "Nosepass":{types:["Rock"],speed:30},
  "Delcatty":{types:["Normal"],speed:90},
  "Sableye":{types:["Dark","Ghost"],speed:50},
  "Mawile":{types:["Steel","Fairy"],speed:50},
  "Aggron":{types:["Steel","Rock"],speed:50},
  "Medicham":{types:["Fighting","Psychic"],speed:80},
  "Manectric":{types:["Electric"],speed:105},
  "Plusle":{types:["Electric"],speed:95},
  "Minun":{types:["Electric"],speed:95},
  "Volbeat":{types:["Bug"],speed:85},
  "Illumise":{types:["Bug"],speed:85},
  "Roselia":{types:["Grass","Poison"],speed:65},
  "Gulpin":{types:["Poison"],speed:40},
  "Swalot":{types:["Poison"],speed:55},
  "Sharpedo":{types:["Water","Dark"],speed:95},
  "Wailord":{types:["Water"],speed:60},
  "Camerupt":{types:["Fire","Ground"],speed:40},
  "Torkoal":{types:["Fire"],speed:20},
  "Spoink":{types:["Psychic"],speed:60},
  "Grumpig":{types:["Psychic"],speed:80},
  "Spinda":{types:["Normal"],speed:60},
  "Flygon":{types:["Ground","Dragon"],speed:100},
  "Cacturne":{types:["Grass","Dark"],speed:55},
  "Altaria":{types:["Dragon","Flying"],speed:80},
  "Zangoose":{types:["Normal"],speed:90},
  "Seviper":{types:["Poison"],speed:65},
  "Lunatone":{types:["Rock","Psychic"],speed:70},
  "Solrock":{types:["Rock","Psychic"],speed:70},
  "Whiscash":{types:["Water","Ground"],speed:60},
  "Crawdaunt":{types:["Water","Dark"],speed:55},
  "Claydol":{types:["Ground","Psychic"],speed:75},
  "Cradily":{types:["Rock","Grass"],speed:43},
  "Armaldo":{types:["Rock","Bug"],speed:45},
  "Milotic":{types:["Water"],speed:81},
  "Castform":{types:["Normal"],speed:70},
  "Kecleon":{types:["Normal"],speed:40},
  "Banette":{types:["Ghost"],speed:65},
  "Dusclops":{types:["Ghost"],speed:25},
  "Tropius":{types:["Grass","Flying"],speed:51},
  "Chimecho":{types:["Psychic"],speed:65},
  "Absol":{types:["Dark"],speed:75},
  "Glalie":{types:["Ice"],speed:80},
  "Walrein":{types:["Ice","Water"],speed:65},
  "Huntail":{types:["Water"],speed:52},
  "Gorebyss":{types:["Water"],speed:52},
  "Relicanth":{types:["Water","Rock"],speed:55},
  "Luvdisc":{types:["Water"],speed:97},
  "Salamence":{types:["Dragon","Flying"],speed:100},
  "Metagross":{types:["Steel","Psychic"],speed:70},
  "Regirock":{types:["Rock"],speed:50},
  "Regice":{types:["Ice"],speed:50},
  "Registeel":{types:["Steel"],speed:50},
  "Latias":{types:["Dragon","Psychic"],speed:110},
  "Latios":{types:["Dragon","Psychic"],speed:110},
  "Kyogre":{types:["Water"],speed:90},
  "Groudon":{types:["Ground"],speed:90},
  "Rayquaza":{types:["Dragon","Flying"],speed:95},
  "Jirachi":{types:["Steel","Psychic"],speed:100},
  "Deoxys":{types:["Psychic"],speed:150},
  "Torterra":{types:["Grass","Ground"],speed:56},
  "Infernape":{types:["Fire","Fighting"],speed:108},
  "Empoleon":{types:["Water","Steel"],speed:60},
  "Staraptor":{types:["Normal","Flying"],speed:100},
  "Bibarel":{types:["Normal","Water"],speed:71},
  "Kricketune":{types:["Bug"],speed:65},
  "Luxray":{types:["Electric"],speed:70},
  "Roserade":{types:["Grass","Poison"],speed:90},
  "Rampardos":{types:["Rock"],speed:58},
  "Bastiodon":{types:["Rock","Steel"],speed:30},
  "Wormadam":{types:["Bug","Grass"],speed:36},
  "Mothim":{types:["Bug","Flying"],speed:66},
  "Vespiquen":{types:["Bug","Flying"],speed:40},
  "Pachirisu":{types:["Electric"],speed:95},
  "Floatzel":{types:["Water"],speed:115},
  "Cherrim":{types:["Grass"],speed:85},
  "Gastrodon":{types:["Water","Ground"],speed:39},
  "Ambipom":{types:["Normal"],speed:115},
  "Drifblim":{types:["Ghost","Flying"],speed:80},
  "Lopunny":{types:["Normal"],speed:105},
  "Mismagius":{types:["Ghost"],speed:105},
  "Honchkrow":{types:["Dark","Flying"],speed:71},
  "Purugly":{types:["Normal"],speed:112},
  "Skuntank":{types:["Poison","Dark"],speed:84},
  "Bronzong":{types:["Steel","Psychic"],speed:33},
  "Spiritomb":{types:["Ghost","Dark"],speed:35},
  "Garchomp":{types:["Dragon","Ground"],speed:102},
  "Lucario":{types:["Fighting","Steel"],speed:90},
  "Hippowdon":{types:["Ground"],speed:47},
  "Drapion":{types:["Poison","Dark"],speed:95},
  "Toxicroak":{types:["Poison","Fighting"],speed:85},
  "Carnivine":{types:["Grass"],speed:46},
  "Lumineon":{types:["Water"],speed:91},
  "Abomasnow":{types:["Grass","Ice"],speed:60},
  "Weavile":{types:["Dark","Ice"],speed:125},
  "Magnezone":{types:["Electric","Steel"],speed:60},
  "Lickilicky":{types:["Normal"],speed:50},
  "Rhyperior":{types:["Ground","Rock"],speed:40},
  "Tangrowth":{types:["Grass"],speed:50},
  "Electivire":{types:["Electric"],speed:95},
  "Magmortar":{types:["Fire"],speed:83},
  "Togekiss":{types:["Fairy","Flying"],speed:80},
  "Yanmega":{types:["Bug","Flying"],speed:95},
  "Leafeon":{types:["Grass"],speed:95},
  "Glaceon":{types:["Ice"],speed:65},
  "Gliscor":{types:["Ground","Flying"],speed:95},
  "Mamoswine":{types:["Ice","Ground"],speed:80},
  "Porygon-Z":{types:["Normal"],speed:90},
  "Gallade":{types:["Psychic","Fighting"],speed:80},
  "Probopass":{types:["Rock","Steel"],speed:40},
  "Dusknoir":{types:["Ghost"],speed:45},
  "Froslass":{types:["Ice","Ghost"],speed:110},
  "Rotom":{types:["Electric","Ghost"],speed:91},
  "Rotom (Wash)":{types:["Electric","Water"],speed:86},
  "Rotom (Heat)":{types:["Electric","Fire"],speed:86},
  "Rotom (Frost)":{types:["Electric","Ice"],speed:86},
  "Rotom (Fan)":{types:["Electric","Flying"],speed:86},
  "Rotom (Mow)":{types:["Electric","Grass"],speed:86},
  "Uxie":{types:["Psychic"],speed:95},
  "Mesprit":{types:["Psychic"],speed:80},
  "Azelf":{types:["Psychic"],speed:115},
  "Dialga":{types:["Steel","Dragon"],speed:90},
  "Palkia":{types:["Water","Dragon"],speed:100},
  "Heatran":{types:["Fire","Steel"],speed:77},
  "Regigigas":{types:["Normal"],speed:100},
  "Giratina":{types:["Ghost","Dragon"],speed:90},
  "Cresselia":{types:["Psychic"],speed:85},
  "Manaphy":{types:["Water"],speed:100},
  "Darkrai":{types:["Dark"],speed:125},
  "Shaymin":{types:["Grass"],speed:100},
  "Arceus":{types:["Normal"],speed:120},
  "Serperior":{types:["Grass"],speed:113},
  "Emboar":{types:["Fire","Fighting"],speed:65},
  "Samurott":{types:["Water"],speed:70},
  "Watchog":{types:["Normal"],speed:77},
  "Stoutland":{types:["Normal"],speed:80},
  "Liepard":{types:["Dark"],speed:106},
  "Simisage":{types:["Grass"],speed:101},
  "Simisear":{types:["Fire"],speed:101},
  "Simipour":{types:["Water"],speed:101},
  "Musharna":{types:["Psychic"],speed:29},
  "Unfezant":{types:["Normal","Flying"],speed:93},
  "Zebstrika":{types:["Electric"],speed:116},
  "Gigalith":{types:["Rock"],speed:25},
  "Swoobat":{types:["Psychic","Flying"],speed:114},
  "Excadrill":{types:["Ground","Steel"],speed:88},
  "Audino":{types:["Normal"],speed:50},
  "Conkeldurr":{types:["Fighting"],speed:45},
  "Seismitoad":{types:["Water","Ground"],speed:74},
  "Throh":{types:["Fighting"],speed:45},
  "Sawk":{types:["Fighting"],speed:85},
  "Leavanny":{types:["Bug","Grass"],speed:92},
  "Scolipede":{types:["Bug","Poison"],speed:112},
  "Whimsicott":{types:["Grass","Fairy"],speed:116},
  "Lilligant":{types:["Grass"],speed:90},
  "Basculin":{types:["Water"],speed:98},
  "Krookodile":{types:["Ground","Dark"],speed:92},
  "Darmanitan":{types:["Fire"],speed:95},
  "Maractus":{types:["Grass"],speed:60},
  "Crustle":{types:["Bug","Rock"],speed:45},
  "Scrafty":{types:["Dark","Fighting"],speed:58},
  "Sigilyph":{types:["Psychic","Flying"],speed:97},
  "Cofagrigus":{types:["Ghost"],speed:30},
  "Carracosta":{types:["Water","Rock"],speed:32},
  "Archeops":{types:["Rock","Flying"],speed:110},
  "Garbodor":{types:["Poison"],speed:75},
  "Zoroark":{types:["Dark"],speed:105},
  "Cinccino":{types:["Normal"],speed:115},
  "Gothitelle":{types:["Psychic"],speed:55},
  "Reuniclus":{types:["Psychic"],speed:30},
  "Swanna":{types:["Water","Flying"],speed:98},
  "Vanilluxe":{types:["Ice"],speed:79},
  "Sawsbuck":{types:["Normal","Grass"],speed:95},
  "Emolga":{types:["Electric","Flying"],speed:103},
  "Escavalier":{types:["Bug","Steel"],speed:20},
  "Amoonguss":{types:["Grass","Poison"],speed:30},
  "Jellicent":{types:["Water","Ghost"],speed:60},
  "Alomomola":{types:["Water"],speed:65},
  "Galvantula":{types:["Bug","Electric"],speed:108},
  "Ferrothorn":{types:["Grass","Steel"],speed:20},
  "Klinklang":{types:["Steel"],speed:90},
  "Eelektross":{types:["Electric"],speed:67},
  "Beheeyem":{types:["Psychic"],speed:40},
  "Chandelure":{types:["Ghost","Fire"],speed:80},
  "Haxorus":{types:["Dragon"],speed:97},
  "Beartic":{types:["Ice"],speed:50},
  "Cryogonal":{types:["Ice"],speed:105},
  "Accelgor":{types:["Bug"],speed:145},
  "Stunfisk":{types:["Ground","Electric"],speed:32},
  "Mienshao":{types:["Fighting"],speed:105},
  "Druddigon":{types:["Dragon"],speed:48},
  "Golurk":{types:["Ground","Ghost"],speed:55},
  "Bisharp":{types:["Dark","Steel"],speed:70},
  "Bouffalant":{types:["Normal"],speed:55},
  "Braviary":{types:["Normal","Flying"],speed:80},
  "Mandibuzz":{types:["Dark","Flying"],speed:80},
  "Heatmor":{types:["Fire"],speed:65},
  "Durant":{types:["Bug","Steel"],speed:109},
  "Hydreigon":{types:["Dark","Dragon"],speed:98},
  "Volcarona":{types:["Bug","Fire"],speed:100},
  "Cobalion":{types:["Steel","Fighting"],speed:108},
  "Terrakion":{types:["Rock","Fighting"],speed:108},
  "Virizion":{types:["Grass","Fighting"],speed:108},
  "Tornadus":{types:["Flying"],speed:111},
  "Thundurus":{types:["Electric","Flying"],speed:111},
  "Reshiram":{types:["Dragon","Fire"],speed:90},
  "Zekrom":{types:["Dragon","Electric"],speed:90},
  "Landorus":{types:["Ground","Flying"],speed:101},
  "Kyurem":{types:["Dragon","Ice"],speed:95},
  "Keldeo":{types:["Water","Fighting"],speed:108},
  "Meloetta":{types:["Normal","Psychic"],speed:90},
  "Genesect":{types:["Bug","Steel"],speed:99},
  "Chesnaught":{types:["Grass","Fighting"],speed:64},
  "Delphox":{types:["Fire","Psychic"],speed:104},
  "Greninja":{types:["Water","Dark"],speed:122},
  "Diggersby":{types:["Normal","Ground"],speed:78},
  "Talonflame":{types:["Fire","Flying"],speed:126},
  "Vivillon":{types:["Bug","Flying"],speed:89},
  "Pyroar":{types:["Fire","Normal"],speed:106},
  "Florges":{types:["Fairy"],speed:75},
  "Gogoat":{types:["Grass"],speed:68},
  "Pangoro":{types:["Fighting","Dark"],speed:58},
  "Furfrou":{types:["Normal"],speed:102},
  "Meowstic":{types:["Psychic"],speed:104},
  "Aegislash":{types:["Steel","Ghost"],speed:60},
  "Aromatisse":{types:["Fairy"],speed:29},
  "Slurpuff":{types:["Fairy"],speed:72},
  "Malamar":{types:["Dark","Psychic"],speed:73},
  "Barbaracle":{types:["Rock","Water"],speed:68},
  "Dragalge":{types:["Poison","Dragon"],speed:44},
  "Clawitzer":{types:["Water"],speed:59},
  "Heliolisk":{types:["Electric","Normal"],speed:109},
  "Tyrantrum":{types:["Rock","Dragon"],speed:71},
  "Aurorus":{types:["Rock","Ice"],speed:58},
  "Sylveon":{types:["Fairy"],speed:60},
  "Hawlucha":{types:["Fighting","Flying"],speed:118},
  "Dedenne":{types:["Electric","Fairy"],speed:101},
  "Carbink":{types:["Rock","Fairy"],speed:50},
  "Goodra":{types:["Dragon"],speed:80},
  "Klefki":{types:["Steel","Fairy"],speed:75},
  "Trevenant":{types:["Ghost","Grass"],speed:56},
  "Gourgeist":{types:["Ghost","Grass"],speed:84},
  "Avalugg":{types:["Ice"],speed:28},
  "Noivern":{types:["Flying","Dragon"],speed:123},
  "Xerneas":{types:["Fairy"],speed:99},
  "Yveltal":{types:["Dark","Flying"],speed:99},
  "Zygarde":{types:["Dragon","Ground"],speed:95},
  "Diancie":{types:["Rock","Fairy"],speed:50},
  "Hoopa":{types:["Psychic","Ghost"],speed:70},
  "Volcanion":{types:["Fire","Water"],speed:70},
  "Decidueye":{types:["Grass","Ghost"],speed:70},
  "Incineroar":{types:["Fire","Dark"],speed:60},
  "Primarina":{types:["Water","Fairy"],speed:60},
  "Toucannon":{types:["Normal","Flying"],speed:60},
  "Gumshoos":{types:["Normal"],speed:45},
  "Vikavolt":{types:["Bug","Electric"],speed:43},
  "Crabominable":{types:["Fighting","Ice"],speed:32},
  "Oricorio":{types:["Fire","Flying"],speed:93},
  "Ribombee":{types:["Bug","Fairy"],speed:124},
  "Lycanroc":{types:["Rock"],speed:112},
  "Wishiwashi":{types:["Water"],speed:30},
  "Toxapex":{types:["Poison","Water"],speed:35},
  "Mudsdale":{types:["Ground"],speed:35},
  "Araquanid":{types:["Water","Bug"],speed:42},
  "Lurantis":{types:["Grass"],speed:45},
  "Shiinotic":{types:["Grass","Fairy"],speed:30},
  "Salazzle":{types:["Poison","Fire"],speed:117},
  "Bewear":{types:["Normal","Fighting"],speed:60},
  "Tsareena":{types:["Grass"],speed:72},
  "Comfey":{types:["Fairy"],speed:100},
  "Oranguru":{types:["Normal","Psychic"],speed:60},
  "Passimian":{types:["Fighting"],speed:80},
  "Palossand":{types:["Ghost","Ground"],speed:35},
  "Pyukumuku":{types:["Water"],speed:5},
  "Type: Null":{types:["Normal"],speed:59},
  "Silvally":{types:["Normal"],speed:95},
  "Mimikyu":{types:["Ghost","Fairy"],speed:96},
  "Bruxish":{types:["Water","Psychic"],speed:92},
  "Drampa":{types:["Normal","Dragon"],speed:36},
  "Dhelmise":{types:["Ghost","Grass"],speed:40},
  "Kommo-o":{types:["Dragon","Fighting"],speed:85},
  "Tapu Koko":{types:["Electric","Fairy"],speed:130},
  "Tapu Lele":{types:["Psychic","Fairy"],speed:95},
  "Tapu Bulu":{types:["Grass","Fairy"],speed:75},
  "Tapu Fini":{types:["Water","Fairy"],speed:85},
  "Cosmog":{types:["Psychic"],speed:5},
  "Solgaleo":{types:["Psychic","Steel"],speed:97},
  "Lunala":{types:["Psychic","Ghost"],speed:97},
  "Nihilego":{types:["Rock","Poison"],speed:103},
  "Buzzwole":{types:["Bug","Fighting"],speed:79},
  "Pheromosa":{types:["Bug","Fighting"],speed:151},
  "Xurkitree":{types:["Electric"],speed:83},
  "Celesteela":{types:["Steel","Flying"],speed:61},
  "Kartana":{types:["Grass","Steel"],speed:109},
  "Guzzlord":{types:["Dark","Dragon"],speed:43},
  "Necrozma":{types:["Psychic"],speed:79},
  "Magearna":{types:["Steel","Fairy"],speed:65},
  "Marshadow":{types:["Fighting","Ghost"],speed:125},
  "Blacephalon":{types:["Fire","Ghost"],speed:107},
  "Stakataka":{types:["Rock","Steel"],speed:13},
  "Zeraora":{types:["Electric"],speed:143},
  "Meltan":{types:["Steel"],speed:34},
  "Melmetal":{types:["Steel"],speed:34},
  "Rillaboom":{types:["Grass"],speed:85},
  "Cinderace":{types:["Fire"],speed:119},
  "Inteleon":{types:["Water"],speed:120},
  "Corviknight":{types:["Flying","Steel"],speed:67},
  "Orbeetle":{types:["Bug","Psychic"],speed:90},
  "Thievul":{types:["Dark"],speed:90},
  "Eldegoss":{types:["Grass"],speed:60},
  "Dubwool":{types:["Normal"],speed:75},
  "Drednaw":{types:["Water","Rock"],speed:74},
  "Boltund":{types:["Electric"],speed:121},
  "Coalossal":{types:["Rock","Fire"],speed:30},
  "Flapple":{types:["Grass","Dragon"],speed:70},
  "Appletun":{types:["Grass","Dragon"],speed:30},
  "Sandaconda":{types:["Ground"],speed:65},
  "Cramorant":{types:["Flying","Water"],speed:85},
  "Barraskewda":{types:["Water"],speed:136},
  "Toxtricity":{types:["Electric","Poison"],speed:75},
  "Centiskorch":{types:["Fire","Bug"],speed:65},
  "Grapploct":{types:["Fighting"],speed:42},
  "Polteageist":{types:["Ghost"],speed:70},
  "Hatterene":{types:["Psychic","Fairy"],speed:29},
  "Grimmsnarl":{types:["Dark","Fairy"],speed:60},
  "Obstagoon":{types:["Dark","Normal"],speed:95},
  "Perrserker":{types:["Steel"],speed:50},
  "Cursola":{types:["Ghost"],speed:30},
  "Sirfetch'd":{types:["Fighting"],speed:65},
  "Mr. Rime":{types:["Ice","Psychic"],speed:70},
  "Runerigus":{types:["Ground","Ghost"],speed:30},
  "Milcery":{types:["Fairy"],speed:34},
  "Alcremie":{types:["Fairy"],speed:64},
  "Falinks":{types:["Fighting"],speed:75},
  "Pincurchin":{types:["Electric"],speed:15},
  "Frosmoth":{types:["Ice","Bug"],speed:65},
  "Stonjourner":{types:["Rock"],speed:70},
  "Eiscue":{types:["Ice"],speed:50},
  "Indeedee":{types:["Psychic","Normal"],speed:85},
  "Morpeko":{types:["Electric","Dark"],speed:97},
  "Copperajah":{types:["Steel"],speed:30},
  "Dragapult":{types:["Dragon","Ghost"],speed:142},
  "Zacian":{types:["Fairy"],speed:138},
  "Zamazenta":{types:["Fighting"],speed:138},
  "Eternatus":{types:["Poison","Dragon"],speed:130},
  "Kubfu":{types:["Fighting"],speed:78},
  "Urshifu":{types:["Fighting","Dark"],speed:97},
  "Zarude":{types:["Dark","Grass"],speed:105},
  "Regieleki":{types:["Electric"],speed:200},
  "Regidrago":{types:["Dragon"],speed:80},
  "Glastrier":{types:["Ice"],speed:30},
  "Spectrier":{types:["Ghost"],speed:130},
  "Calyrex":{types:["Psychic","Grass"],speed:80},
  "Wyrdeer":{types:["Normal","Psychic"],speed:65},
  "Kleavor":{types:["Bug","Rock"],speed:85},
  "Ursaluna":{types:["Ground","Normal"],speed:55},
  "Basculegion":{types:["Water","Ghost"],speed:78},
  "Sneasler":{types:["Fighting","Poison"],speed:120},
  "Overqwil":{types:["Dark","Poison"],speed:85},
  "Enamorus":{types:["Fairy","Flying"],speed:87},
  "Meowscarada":{types:["Grass","Dark"],speed:123},
  "Skeledirge":{types:["Fire","Ghost"],speed:66},
  "Quaquaval":{types:["Water","Fighting"],speed:85},
  "Lechonk":{types:["Normal"],speed:25},
  "Oinkologne":{types:["Normal"],speed:65},
  "Spidops":{types:["Bug"],speed:45},
  "Lokix":{types:["Bug","Dark"],speed:102},
  "Pawmot":{types:["Electric","Fighting"],speed:105},
  "Maushold":{types:["Normal"],speed:111},
  "Dachsbun":{types:["Fairy"],speed:97},
  "Tinkaton":{types:["Fairy","Steel"],speed:94},
  "Glimmora":{types:["Rock","Poison"],speed:86},
  "Bellibolt":{types:["Electric"],speed:50},
  "Espathra":{types:["Psychic"],speed:105},
  "Ceruledge":{types:["Fire","Ghost"],speed:85},
  "Armarouge":{types:["Fire","Psychic"],speed:85},
  "Scovillain":{types:["Grass","Fire"],speed:65},
  "Garganacl":{types:["Rock"],speed:35},
  "Sinistcha":{types:["Grass","Ghost"],speed:70},
  "Floette":{types:["Fairy"],speed:75},
  "Wugtrio":{types:["Water"],speed:120},
  "Bombirdier":{types:["Flying","Dark"],speed:80},
  "Palafin":{types:["Water"],speed:100},
  "Revavroom":{types:["Steel","Poison"],speed:72},
  "Cyclizar":{types:["Dragon","Normal"],speed:121},
  "Orthworm":{types:["Steel"],speed:35},
  "Houndstone":{types:["Ghost"],speed:68},
  "Flamigo":{types:["Flying","Fighting"],speed:105},
  "Cetitan":{types:["Ice"],speed:55},
  "Veluza":{types:["Water","Psychic"],speed:70},
  "Dondozo":{types:["Water"],speed:35},
  "Tatsugiri":{types:["Dragon","Water"],speed:82},
  "Annihilape":{types:["Fighting","Ghost"],speed:90},
  "Clodsire":{types:["Poison","Ground"],speed:20},
  "Farigiraf":{types:["Normal","Psychic"],speed:60},
  "Dudunsparce":{types:["Normal"],speed:45},
  "Kingambit":{types:["Dark","Steel"],speed:50},
  "Great Tusk":{types:["Ground","Fighting"],speed:87},
  "Scream Tail":{types:["Fairy","Psychic"],speed:111},
  "Brute Bonnet":{types:["Grass","Dark"],speed:55},
  "Flutter Mane":{types:["Ghost","Fairy"],speed:135},
  "Slither Wing":{types:["Bug","Fighting"],speed:65},
  "Sandy Shocks":{types:["Electric","Ground"],speed:101},
  "Iron Treads":{types:["Ground","Steel"],speed:90},
  "Iron Bundle":{types:["Ice","Water"],speed:136},
  "Iron Hands":{types:["Fighting","Electric"],speed:50},
  "Iron Jugulis":{types:["Dark","Flying"],speed:112},
  "Iron Moth":{types:["Fire","Poison"],speed:110},
  "Iron Thorns":{types:["Rock","Electric"],speed:72},
  "Frigibax":{types:["Dragon","Ice"],speed:38},
  "Arctibax":{types:["Dragon","Ice"],speed:58},
  "Baxcalibur":{types:["Dragon","Ice"],speed:87},
  "Gimmighoul":{types:["Ghost"],speed:10},
  "Gholdengo":{types:["Steel","Ghost"],speed:84},
  "Wo-Chien":{types:["Dark","Grass"],speed:70},
  "Chien-Pao":{types:["Dark","Ice"],speed:135},
  "Ting-Lu":{types:["Dark","Ground"],speed:45},
  "Chi-Yu":{types:["Dark","Fire"],speed:100},
  "Roaring Moon":{types:["Dragon","Dark"],speed:119},
  "Iron Valiant":{types:["Fairy","Fighting"],speed:116},
  "Koraidon":{types:["Fighting","Dragon"],speed:135},
  "Miraidon":{types:["Electric","Dragon"],speed:135},
  "Walking Wake":{types:["Water","Dragon"],speed:109},
  "Iron Leaves":{types:["Grass","Psychic"],speed:104},
  "Dipplin":{types:["Grass","Dragon"],speed:45},
  "Hydrapple":{types:["Grass","Dragon"],speed:44},
  "Gouging Fire":{types:["Fire","Dragon"],speed:105},
  "Raging Bolt":{types:["Electric","Dragon"],speed:75},
  "Iron Boulder":{types:["Rock","Psychic"],speed:124},
  "Iron Crown":{types:["Steel","Psychic"],speed:116},
  "Terapagos":{types:["Normal"],speed:85},
  "Pecharunt":{types:["Poison","Ghost"],speed:88},
  "Archaludon":{types:["Steel","Dragon"],speed:85},
};

// Common mega forms — the ones most likely to appear with Mega items.
// Maps base name → mega type/speed override when item indicates mega.
const MEGA_FORMS = {
  "Charizard": [
    { suffix: "Mega Y", item: "Charizardite Y", types: ["Fire","Flying"], speed: 100 },
    { suffix: "Mega X", item: "Charizardite X", types: ["Fire","Dragon"], speed: 100 },
  ],
  "Venusaur": [{ suffix: "Mega", item: "Venusaurite", types: ["Grass","Poison"], speed: 80 }],
  "Blastoise": [{ suffix: "Mega", item: "Blastoisinite", types: ["Water"], speed: 78 }],
  "Scizor": [{ suffix: "Mega", item: "Scizorite", types: ["Bug","Steel"], speed: 75 }],
  "Gengar": [{ suffix: "Mega", item: "Gengarite", types: ["Ghost","Poison"], speed: 130 }],
  "Lucario": [{ suffix: "Mega", item: "Lucarionite", types: ["Fighting","Steel"], speed: 112 }],
  "Garchomp": [{ suffix: "Mega", item: "Garchompite", types: ["Dragon","Ground"], speed: 92 }],
  "Salamence": [{ suffix: "Mega", item: "Salamencite", types: ["Dragon","Flying"], speed: 120 }],
  "Tyranitar": [{ suffix: "Mega", item: "Tyranitarite", types: ["Rock","Dark"], speed: 71 }],
  "Metagross": [{ suffix: "Mega", item: "Metagrossite", types: ["Steel","Psychic"], speed: 110 }],
  "Mawile": [{ suffix: "Mega", item: "Mawilite", types: ["Steel","Fairy"], speed: 50 }],
  "Lopunny": [{ suffix: "Mega", item: "Lopunnite", types: ["Normal","Fighting"], speed: 135 }],
  "Gardevoir": [{ suffix: "Mega", item: "Gardevoirite", types: ["Psychic","Fairy"], speed: 80 }],
  "Gyarados": [{ suffix: "Mega", item: "Gyaradosite", types: ["Water","Dark"], speed: 81 }],
  "Pinsir": [{ suffix: "Mega", item: "Pinsirite", types: ["Bug","Flying"], speed: 105 }],
  "Aerodactyl": [{ suffix: "Mega", item: "Aerodactylite", types: ["Rock","Flying"], speed: 150 }],
  "Heracross": [{ suffix: "Mega", item: "Heracronite", types: ["Bug","Fighting"], speed: 75 }],
  "Houndoom": [{ suffix: "Mega", item: "Houndoominite", types: ["Dark","Fire"], speed: 115 }],
  "Manectric": [{ suffix: "Mega", item: "Manectite", types: ["Electric"], speed: 135 }],
  "Banette": [{ suffix: "Mega", item: "Banettite", types: ["Ghost"], speed: 75 }],
  "Absol": [{ suffix: "Mega", item: "Absolite", types: ["Dark"], speed: 75 }],
  "Latias": [{ suffix: "Mega", item: "Latiasite", types: ["Dragon","Psychic"], speed: 110 }],
  "Latios": [{ suffix: "Mega", item: "Latiosite", types: ["Dragon","Psychic"], speed: 110 }],
  "Abomasnow": [{ suffix: "Mega", item: "Abomasite", types: ["Grass","Ice"], speed: 30 }],
  "Ampharos": [{ suffix: "Mega", item: "Ampharosite", types: ["Electric","Dragon"], speed: 55 }],
  "Sceptile": [{ suffix: "Mega", item: "Sceptilite", types: ["Grass","Dragon"], speed: 145 }],
  "Blaziken": [{ suffix: "Mega", item: "Blazikenite", types: ["Fire","Fighting"], speed: 100 }],
  "Swampert": [{ suffix: "Mega", item: "Swampertite", types: ["Water","Ground"], speed: 70 }],
  "Sableye": [{ suffix: "Mega", item: "Sablenite", types: ["Dark","Ghost"], speed: 50 }],
  "Sharpedo": [{ suffix: "Mega", item: "Sharpedonite", types: ["Water","Dark"], speed: 105 }],
  "Camerupt": [{ suffix: "Mega", item: "Cameruptite", types: ["Fire","Ground"], speed: 20 }],
  "Altaria": [{ suffix: "Mega", item: "Altarianite", types: ["Dragon","Fairy"], speed: 80 }],
  "Glalie": [{ suffix: "Mega", item: "Glalitite", types: ["Ice"], speed: 100 }],
  "Audino": [{ suffix: "Mega", item: "Audinite", types: ["Normal","Fairy"], speed: 50 }],
  "Medicham": [{ suffix: "Mega", item: "Medichamite", types: ["Fighting","Psychic"], speed: 100 }],
  "Slowbro": [{ suffix: "Mega", item: "Slowbronite", types: ["Water","Psychic"], speed: 30 }],
  "Steelix": [{ suffix: "Mega", item: "Steelixite", types: ["Steel","Ground"], speed: 30 }],
  "Pidgeot": [{ suffix: "Mega", item: "Pidgeotite", types: ["Normal","Flying"], speed: 121 }],
  "Beedrill": [{ suffix: "Mega", item: "Beedrillite", types: ["Bug","Poison"], speed: 145 }],
  "Kangaskhan": [{ suffix: "Mega", item: "Kangaskhanite", types: ["Normal"], speed: 100 }],
  "Alakazam": [{ suffix: "Mega", item: "Alakazite", types: ["Psychic"], speed: 150 }],
  "Diancie": [{ suffix: "Mega", item: "Diancite", types: ["Rock","Fairy"], speed: 110 }],
};

// Strategic enrichment — fires when a Pokémon has known sets we want to comment on.
// Optional. Type math works for everyone in TYPE_DEX even without strategic data.
// Tags drive the strategy engine: setsSun, fakeOut, intimidate, levitate, willOWisp,
// sleepPowder, earthquake, redirect, trickRoom, tailwind.
const STRATEGIC_DEX = {
  "Charizard": {
    notes: "Mega Y becomes Drought-setter and special nuker; Mega X is physical Fire/Dragon.",
    tags: ["megaY-setsSun"], // applies only when (Mega Y) form is registered
  },
  "Venusaur": {
    notes: "Chlorophyll doubles Speed in Sun. Sleep Powder + Sludge Bomb is classic VGC.",
    tags: ["chlorophyll", "sleepPowder"],
  },
  "Garchomp": {
    notes: "Earthquake + Rock Slide spread coverage. Ground immunity needed in partner.",
    tags: ["earthquake"],
  },
  "Rotom (Wash)": {
    notes: "Levitate ignores Ground. Will-O-Wisp cripples physical attackers.",
    tags: ["levitate", "willOWisp"],
  },
  "Sneasler": {
    notes: "Unburden + Fake Out make it a top-tier disruptor. Fighting/Poison hits Fairy-resists.",
    tags: ["fakeOut"],
  },
  "Incineroar": {
    notes: "Intimidate + Fake Out + Parting Shot is the premier doubles support kit.",
    tags: ["intimidate", "fakeOut"],
  },
  "Primarina": {
    notes: "Sparkling Aria is a spread move and cures burn on hit. Calm Mind sets up.",
    tags: [],
  },
  "Meowscarada": {
    notes: "Protean changes type to match move. Flower Trick always crits.",
    tags: [],
  },
  "Archaludon": {
    notes: "Stamina raises Defense each hit. Only Fighting and Ground hit super-effectively.",
    tags: [],
  },
  "Amoonguss": {
    notes: "Spore + Rage Powder is the gold-standard doubles redirect.",
    tags: ["redirect", "sleepPowder"],
  },
  "Indeedee": {
    notes: "Female sets Psychic Terrain via Psychic Surge — boosts Psychic moves and blocks priority.",
    tags: [],
  },
  "Tornadus": {
    notes: "Tailwind setter. Bleakwind Storm hits both opponents.",
    tags: ["tailwind"],
  },
  "Landorus": {
    notes: "Intimidate + Earthquake/Rock Slide spread. Levitate variant ignores Ground.",
    tags: ["intimidate", "earthquake", "levitate"],
  },
  "Tapu Koko": {
    notes: "Electric Surge sets Electric Terrain — boosts Electric moves and blocks Sleep.",
    tags: [],
  },
  "Tapu Fini": {
    notes: "Misty Surge blocks status moves. Trick Room support and bulky pivot.",
    tags: [],
  },
  "Urshifu": {
    notes: "Single Strike: Wicked Blow always crits. Rapid Strike: Surging Strikes always crits, hits twice.",
    tags: [],
  },
  "Flutter Mane": {
    notes: "Extreme Special Attack and Speed. Frail but 4× Steel weakness is dangerous.",
    tags: [],
  },
  "Iron Hands": {
    notes: "Quark Drive in Electric Terrain. Drain Punch + Wild Charge bulk-up sweeper.",
    tags: ["fakeOut"],
  },
  "Chien-Pao": {
    notes: "Sword of Ruin lowers all Defense. Icicle Crash + Sucker Punch is its bread and butter.",
    tags: [],
  },
  "Chi-Yu": {
    notes: "Beads of Ruin lowers all Sp. Def. Heat Wave hits both opponents.",
    tags: [],
  },
  "Gholdengo": {
    notes: "Good as Gold blocks status moves. Make It Rain hits both opponents.",
    tags: [],
  },
  "Annihilape": {
    notes: "Rage Fist scales with hits taken. Bulk Up + Drain Punch sweep potential.",
    tags: [],
  },
  "Torkoal": {
    notes: "Drought sets permanent Sun. The classic Sun setter for Trick Room.",
    tags: ["setsSun"],
  },
  "Groudon": {
    notes: "Drought (or Desolate Land as Primal). Best Sun setter in the game.",
    tags: ["setsSun"],
  },
};

// Build the runtime POKEDEX from TYPE_DEX + STRATEGIC_DEX. Adds mega awareness.
const POKEDEX = (() => {
  const dex = {};
  Object.entries(TYPE_DEX).forEach(([name, base]) => {
    const strat = STRATEGIC_DEX[name] || {};
    dex[name] = {
      types: base.types,
      speed: base.speed,
      notes: strat.notes,
      tags: (strat.tags || []).filter(t => !t.startsWith("megaY-") && !t.startsWith("megaX-")),
    };
  });
  // Register mega-form variants under names like "Charizard (Mega Y)"
  Object.entries(MEGA_FORMS).forEach(([base, megas]) => {
    if (!TYPE_DEX[base]) return;
    const strat = STRATEGIC_DEX[base] || {};
    megas.forEach(m => {
      const key = `${base} (${m.suffix})`;
      // Pull mega-specific tags (megaY-setsSun -> setsSun when suffix is "Mega Y")
      const baseTags = (strat.tags || []).filter(t => !t.startsWith("megaY-") && !t.startsWith("megaX-"));
      const megaSpecificTags = (strat.tags || [])
        .filter(t => t.startsWith(`mega${m.suffix.replace("Mega ", "")}-`) ||
                     (m.suffix === "Mega Y" && t.startsWith("megaY-")) ||
                     (m.suffix === "Mega X" && t.startsWith("megaX-")))
        .map(t => t.replace(/^megaY-|^megaX-/, ""));
      dex[key] = {
        types: TYPE_DEX[base].types,
        speed: TYPE_DEX[base].speed,
        megaTypes: m.types,
        megaSpeed: m.speed,
        item: m.item,
        mega: true,
        notes: strat.notes,
        tags: [...baseTags, ...megaSpecificTags],
      };
    });
  });
  return dex;
})();

// Pokémon Champions roster — base species only (Megas appear via transformation in battle).
// Source: pokechamdb.com (Season M-1) + Game8 Champions wiki, cross-referenced.
const POKEMON_CHAMPIONS_AVAILABLE = new Set([
  "Garchomp","Primarina","Charizard","Corviknight","Archaludon","Hippowdon","Gengar","Dragonite",
  "Aegislash","Scizor","Meowscarada","Basculegion","Kingambit","Mimikyu","Lopunny","Hydreigon",
  "Glimmora","Rotom (Wash)","Umbreon","Lucario","Delphox","Gyarados","Kangaskhan","Meganium",
  "Greninja","Floette","Venusaur","Sneasler","Volcarona","Clefable","Tyranitar","Starmie",
  "Rotom (Heat)","Sylveon","Skeledirge","Dragapult","Toxapex","Espathra","Pelipper","Bellibolt",
  "Azumarill","Mamoswine","Diggersby","Ceruledge","Snorlax","Empoleon","Blastoise","Excadrill",
  "Scovillain","Victreebel","Skarmory","Froslass","Gardevoir","Ninetales","Goodra","Whimsicott",
  "Kleavor","Araquanid","Gallade","Zoroark","Incineroar","Banette","Hatterene","Milotic",
  "Serperior","Slowking","Samurott","Heracross","Conkeldurr","Tinkaton","Armarouge","Chandelure",
  "Arcanine","Ditto","Chesnaught","Aerodactyl","Orthworm","Aggron","Slowbro","Palafin",
  "Sinistcha","Espeon","Feraligatr","Sableye","Quaquaval","Sharpedo","Heliolisk","Beedrill",
  "Hawlucha","Toucannon","Polteageist","Crabominable","Weavile","Vaporeon","Alakazam","Infernape",
  "Maushold","Typhlosion","Chimecho","Pinsir","Garganacl","Talonflame","Vivillon","Abomasnow",
  "Lycanroc","Mudsdale","Manectric","Emboar","Pidgeot","Altaria","Gliscor","Rotom (Mow)",
  "Jolteon","Tauros","Decidueye","Salazzle","Machamp","Torterra","Ampharos","Runerigus",
  "Glaceon","Kommo-o","Torkoal","Krookodile","Forretress","Medicham","Steelix","Tsareena",
  "Politoed","Vanilluxe","Cofagrigus","Drampa","Slurpuff","Noivern","Ariados","Absol",
  "Glalie","Farigiraf","Rhyperior","Clawitzer","Avalugg","Hydrapple","Klefki","Pikachu",
  "Spiritomb","Roserade","Golurk","Morpeko","Houndoom","Alcremie","Sandaconda","Reuniclus",
  "Meowstic","Rotom (Frost)","Aurorus","Toxicroak","Stunfisk","Trevenant","Tyrantrum","Luxray",
  "Camerupt","Pangoro","Leafeon","Emolga","Flareon","Florges","Raichu","Bastiodon",
  "Gourgeist","Rampardos","Wyrdeer","Appletun","Audino","Dedenne","Rotom (Fan)","Mr. Rime",
  "Arbok","Beartic","Liepard","Furfrou","Garbodor","Flapple","Oranguru","Simipour",
  "Passimian","Watchog","Simisear","Aromatisse","Simisage","Rotom","Castform",
]);

// All searchable names — restricted to Pokémon available in Pokémon Champions
const ALL_NAMES = Object.keys(POKEDEX)
  .filter(n => POKEMON_CHAMPIONS_AVAILABLE.has(n))
  .sort();

/* ============================================================
   SCORING
   ============================================================ */
const offenseScore = (a, d) => {
  const at = a.megaTypes || a.types, dt = d.megaTypes || d.types;
  let best = 0; at.forEach(t => { best = Math.max(best, eff(t, dt)); }); return best;
};
const defenseScore = (def, atk) => {
  const at = atk.megaTypes || atk.types, dt = def.megaTypes || def.types;
  let worst = 0; at.forEach(t => { worst = Math.max(worst, eff(t, dt)); }); return worst;
};
const pairScoreVsTeam = (m1, m2, oppTeam) => {
  let score = 0;
  oppTeam.forEach(opp => {
    const off = Math.max(offenseScore(m1, opp), offenseScore(m2, opp));
    if (off >= 2) score += 2;
    else if (off === 1) score += 0.25;
    else score -= 1;
    const d1 = defenseScore(m1, opp), d2 = defenseScore(m2, opp);
    if (d1 >= 4 || d2 >= 4) score -= 2;
    else if (d1 >= 2 || d2 >= 2) score -= 0.75;
  });
  const tags1 = m1.tags || [], tags2 = m2.tags || [];
  const has = (t) => tags1.includes(t) || tags2.includes(t);
  if (has("setsSun")) {
    if (has("chlorophyll")) score += 1.5;
    score += 0.5; // Sun is generally helpful
  }
  if (has("fakeOut")) score += 0.5;
  if (has("intimidate")) score += 0.4;
  if (has("redirect")) score += 0.4;
  if (has("tailwind")) score += 0.3;
  return score;
};
const rankLeads = (myNames, oppNames) => {
  const my = myNames.map(n => ({ name: n, ...POKEDEX[n] }));
  const opp = oppNames.map(n => ({ name: n, ...POKEDEX[n] }));
  const pairs = [];
  for (let i = 0; i < my.length; i++)
    for (let j = i + 1; j < my.length; j++)
      pairs.push({ a: my[i], b: my[j], score: pairScoreVsTeam(my[i], my[j], opp) });
  pairs.sort((x, y) => y.score - x.score);
  return pairs;
};

// Score a 4-Pokemon subset as a "bring 4 of 6" team vs the opponent's full 6.
// For each opp, take the BEST offense across the 4 (any of your 4 can be sent in)
// and penalize the worst single defensive matchup once (you only field 2 at a time
// but switching can usually keep your weakest mon out of trouble — so penalize gently).
const fourScoreVsTeam = (four, oppTeam) => {
  let score = 0;
  oppTeam.forEach(opp => {
    // Offense: best hit available across the 4
    let bestOff = 0;
    four.forEach(m => { bestOff = Math.max(bestOff, offenseScore(m, opp)); });
    if (bestOff >= 2) score += 2;
    else if (bestOff === 1) score += 0.25;
    else score -= 1;
    // Defense: how vulnerable the GROUP is — count how many of the 4 take 4x or 2x.
    // More weak mons = worse, since switching options shrink.
    let n4 = 0, n2 = 0;
    four.forEach(m => {
      const d = defenseScore(m, opp);
      if (d >= 4) n4++;
      else if (d >= 2) n2++;
    });
    if (n4 >= 2) score -= 1.5;
    else if (n4 === 1) score -= 0.5;
    if (n2 >= 3) score -= 0.5;
  });
  // Synergy bonuses across the 4
  const allTags = four.flatMap(m => m.tags || []);
  const has = (t) => allTags.includes(t);
  if (has("setsSun") && has("chlorophyll")) score += 2.0;
  if (has("setsSun")) score += 0.5;
  if (has("fakeOut")) score += 0.4;
  if (has("intimidate")) score += 0.4;
  if (has("redirect")) score += 0.3;
  if (has("tailwind")) score += 0.3;
  // Reward type diversity — penalize duplicate primary types in the 4
  const primaries = four.map(m => (m.megaTypes || m.types)[0]);
  const uniq = new Set(primaries).size;
  score += (uniq - 1) * 0.15; // up to +0.45 for 4 unique
  return score;
};

// Pick the best 4 to bring from your 6, then the best lead pair from those 4.
const recommendBringFour = (myNames, oppNames) => {
  const my = myNames.map(n => ({ name: n, ...POKEDEX[n] }));
  const opp = oppNames.map(n => ({ name: n, ...POKEDEX[n] }));
  // Try all C(6,4) = 15 subsets
  const subsets = [];
  for (let a = 0; a < my.length; a++)
    for (let b = a + 1; b < my.length; b++)
      for (let c = b + 1; c < my.length; c++)
        for (let d = c + 1; d < my.length; d++) {
          const four = [my[a], my[b], my[c], my[d]];
          subsets.push({ four, score: fourScoreVsTeam(four, opp) });
        }
  subsets.sort((x, y) => y.score - x.score);
  const top = subsets[0];
  // Best lead pair within the chosen 4
  const leadPairs = [];
  for (let i = 0; i < top.four.length; i++)
    for (let j = i + 1; j < top.four.length; j++)
      leadPairs.push({
        a: top.four[i], b: top.four[j],
        score: pairScoreVsTeam(top.four[i], top.four[j], opp),
      });
  leadPairs.sort((x, y) => y.score - x.score);
  const lead = leadPairs[0];
  // The 2 NOT leading become the back row (priority switches)
  const back = top.four.filter(m => m.name !== lead.a.name && m.name !== lead.b.name);
  // The 2 NOT brought
  const benched = my.filter(m => !top.four.some(f => f.name === m.name));
  return {
    four: top.four,
    fourScore: top.score,
    lead,
    back,
    benched,
    altSubsets: subsets.slice(1, 4), // top alternatives for the "alternatives" list
  };
};

/* ============================================================
   MATCHUP ANALYSIS
   ============================================================ */
const analyzeMatchup = (myActive, oppActive) => {
  const my = myActive.map(n => ({ name: n, ...POKEDEX[n] }));
  const opp = oppActive.map(n => ({ name: n, ...POKEDEX[n] }));
  const matrix = [];
  my.forEach(m => {
    opp.forEach(o => {
      const aT = m.megaTypes || m.types, dT = o.megaTypes || o.types;
      let bestOff = 0; aT.forEach(t => { bestOff = Math.max(bestOff, eff(t, dT)); });
      const inT = o.megaTypes || o.types;
      let worstIn = 0; inT.forEach(t => { worstIn = Math.max(worstIn, eff(t, m.megaTypes || m.types)); });
      matrix.push({
        mine: m.name, theirs: o.name,
        mySpeed: m.megaSpeed || m.speed,
        theirSpeed: o.megaSpeed || o.speed,
        bestOff, worstIn,
      });
    });
  });
  return matrix;
};

const buildPlan = (myActive, oppActive) => {
  const my = myActive.map(n => ({ name: n, ...POKEDEX[n] }));
  const opp = oppActive.map(n => ({ name: n, ...POKEDEX[n] }));
  const lines = [];

  const sunSetters = my.filter(m => (m.tags || []).includes("setsSun"));
  const theirSunSetters = opp.filter(o => (o.tags || []).includes("setsSun"));
  if (sunSetters.length && !theirSunSetters.length) {
    const setter = sunSetters[0];
    if (setter.mega) lines.push({ tag: "Mega", text: `Mega Evolve ${shortName(setter.name)} now — Sun powers Fire moves and 1-turn Solar Beam.` });
    else lines.push({ tag: "Weather", text: `${shortName(setter.name)} sets Sun on switch-in — boost Fire damage now.` });
  } else if (sunSetters.length && theirSunSetters.length) {
    lines.push({ tag: "Weather", text: "Sun war — claim it first or hold to overwrite theirs." });
  }

  const fakeOuters = my.filter(m => (m.tags || []).includes("fakeOut"));
  if (fakeOuters.length) {
    const target = opp.reduce((best, o) => (best && (best.megaSpeed || best.speed) >= (o.megaSpeed || o.speed) ? best : o), null);
    if (target) lines.push({ tag: "Fake Out", text: `${shortName(fakeOuters[0].name)} → Fake Out ${shortName(target.name)} (their fastest).` });
  }

  const intims = my.filter(m => (m.tags || []).includes("intimidate"));
  if (intims.length) lines.push({ tag: "Intimidate", text: `${shortName(intims[0].name)} dropped both their Attack on switch-in.` });

  const myEqs = my.filter(m => (m.tags || []).includes("earthquake"));
  if (myEqs.length) {
    const partner = my.find(m => m.name !== myEqs[0].name);
    const grounded = partner && !(partner.types.includes("Flying") || (partner.tags || []).includes("levitate"));
    if (grounded) lines.push({ tag: "Warning", text: `Earthquake hits your own ${shortName(partner.name)}. Use single-target.`, danger: true });
    else if (partner) lines.push({ tag: "Safe EQ", text: `Earthquake is safe — ${shortName(partner.name)} ignores Ground.` });
  }

  const threats = [];
  opp.forEach(o => {
    my.forEach(m => {
      const inMax = Math.max(...(o.megaTypes || o.types).map(t => eff(t, m.megaTypes || m.types)));
      if (inMax >= 2 && (o.megaSpeed || o.speed) > (m.megaSpeed || m.speed)) {
        threats.push(`${shortName(o.name)} outspeeds ${shortName(m.name)} & hits hard`);
      }
    });
  });
  if (threats.length) lines.push({ tag: "Threat", text: threats[0], danger: true });

  if (my.some(m => (m.tags || []).includes("willOWisp"))) {
    const target = opp.find(o => !o.types.includes("Fire"));
    if (target) lines.push({ tag: "Burn", text: `Will-O-Wisp ${shortName(target.name)} to neuter physical pressure.` });
  }
  if (my.some(m => (m.tags || []).includes("sleepPowder"))) {
    const target = opp.find(o => !o.types.includes("Grass") && !o.types.includes("Steel"));
    if (target) lines.push({ tag: "Sleep", text: `Sleep Powder ${shortName(target.name)} to remove a threat.` });
  }
  return lines;
};

const overallVerdict = (matrix) => {
  let myW = 0, theirW = 0;
  matrix.forEach(c => {
    if (c.bestOff > c.worstIn) myW++;
    else if (c.worstIn > c.bestOff) theirW++;
  });
  if (myW >= 3) return { label: "ADVANTAGE", color: "win" };
  if (theirW >= 3) return { label: "DISADVANTAGE", color: "lose" };
  if (myW > theirW) return { label: "SLIGHT EDGE", color: "win" };
  if (theirW > myW) return { label: "BE CAREFUL", color: "lose" };
  return { label: "EVEN", color: "neutral" };
};

const shortName = (n) => n.replace(" [Opp]","").replace(" (Mega Y)","").replace(" (Mega)","").replace(" (Wash)","");

/* ============================================================
   SHARED UI
   ============================================================ */
const TYPE_COLORS = {
  Normal:"#9ca3af", Fire:"#f97316", Water:"#3b82f6", Electric:"#eab308", Grass:"#22c55e",
  Ice:"#67e8f9", Fighting:"#dc2626", Poison:"#a855f7", Ground:"#a16207", Flying:"#7dd3fc",
  Psychic:"#ec4899", Bug:"#84cc16", Rock:"#78716c", Ghost:"#7c3aed", Dragon:"#4338ca",
  Dark:"#1f2937", Steel:"#94a3b8", Fairy:"#f9a8d4",
};

// Lookup move name -> type (used to color-code the move chips on the team card)
const MOVE_TYPES = {
  // User team moves
  "Heat Wave":"Fire", "Solar Beam":"Grass", "Weather Ball":"Normal", "Protect":"Normal",
  "Sleep Powder":"Grass", "Leaf Storm":"Grass", "Sludge Bomb":"Poison",
  "Rock Slide":"Rock", "Dragon Claw":"Dragon", "Earthquake":"Ground", "Bulldoze":"Ground",
  "Hydro Pump":"Water", "Thunderbolt":"Electric", "Will-O-Wisp":"Fire",
  "Dire Claw":"Poison", "Close Combat":"Fighting", "Rock Tomb":"Rock", "Fake Out":"Normal",
  "Darkest Lariat":"Dark", "Flare Blitz":"Fire", "Parting Shot":"Dark",
  // Other common VGC staples (extensible)
  "Flamethrower":"Fire", "Overheat":"Fire", "Flame Charge":"Fire", "Burning Jealousy":"Fire",
  "Surf":"Water", "Scald":"Water", "Liquidation":"Water", "Flip Turn":"Water", "Sparkling Aria":"Water",
  "Volt Switch":"Electric", "Discharge":"Electric", "Steel Beam":"Steel", "Iron Head":"Steel",
  "Triple Axel":"Ice", "Icy Wind":"Ice", "Ice Beam":"Ice", "Blizzard":"Ice",
  "U-turn":"Bug", "Bug Buzz":"Bug",
  "Knock Off":"Dark", "Crunch":"Dark", "Foul Play":"Dark",
  "Shadow Ball":"Ghost", "Poltergeist":"Ghost",
  "Dazzling Gleam":"Fairy", "Moonblast":"Fairy", "Play Rough":"Fairy",
  "Draco Meteor":"Dragon", "Outrage":"Dragon",
  "Bullet Punch":"Steel", "Aura Sphere":"Fighting", "Drain Punch":"Fighting", "Mach Punch":"Fighting",
  "Air Slash":"Flying", "Brave Bird":"Flying", "Tailwind":"Flying",
  "Stealth Rock":"Rock", "Stone Edge":"Rock",
  "Calm Mind":"Psychic", "Psychic":"Psychic", "Expanding Force":"Psychic",
  "Swords Dance":"Normal", "Body Slam":"Normal", "Hyper Voice":"Normal", "Helping Hand":"Normal", "Quick Attack":"Normal",
  "Roost":"Flying", "Flower Trick":"Grass", "Energy Ball":"Grass", "Giga Drain":"Grass",
};

const TypePill = ({ type }) => (
  <span
    className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
    style={{ background: TYPE_COLORS[type] }}
  >
    {type}
  </span>
);

const EffPill = ({ mult }) => {
  let bg = "#f3f4f6", fg = "#374151", text = "1×";
  if (mult === 0) { bg = "#374151"; fg = "#fff"; text = "0×"; }
  else if (mult === 0.25) { bg = "#dbeafe"; fg = "#1e3a8a"; text = "¼×"; }
  else if (mult === 0.5) { bg = "#dbeafe"; fg = "#1e40af"; text = "½×"; }
  else if (mult === 2) { bg = "#fee2e2"; fg = "#991b1b"; text = "2×"; }
  else if (mult === 4) { bg = "#dc2626"; fg = "#fff"; text = "4×"; }
  return (
    <span className="inline-flex items-center rounded-md px-2.5 py-1 text-base font-extrabold tabular-nums" style={{ background: bg, color: fg }}>
      {text}
    </span>
  );
};

/* ============================================================
   USER'S DOUBLES TEAM — default values (editable via Team Editor)
   ============================================================ */
const DEFAULT_TEAM = ["Charizard (Mega Y)","Venusaur","Garchomp","Rotom (Wash)","Sneasler","Incineroar"];

const DEFAULT_TEAM_SETS = {
  "Charizard (Mega Y)": {
    ability: "Solar Power → Drought",
    item: "Charizardite Y",
    moves: ["Heat Wave", "Solar Beam", "Weather Ball", "Protect"],
  },
  "Venusaur": {
    ability: "Chlorophyll",
    item: "Focus Sash",
    moves: ["Sleep Powder", "Leaf Storm", "Sludge Bomb", "Protect"],
  },
  "Garchomp": {
    ability: "Rough Skin",
    item: "Choice Scarf",
    moves: ["Rock Slide", "Dragon Claw", "Earthquake", "Bulldoze"],
  },
  "Rotom (Wash)": {
    ability: "Levitate",
    item: "Leftovers",
    moves: ["Hydro Pump", "Thunderbolt", "Will-O-Wisp", "Protect"],
  },
  "Sneasler": {
    ability: "Unburden",
    item: "White Herb",
    moves: ["Dire Claw", "Close Combat", "Rock Tomb", "Fake Out"],
  },
  "Incineroar": {
    ability: "Intimidate",
    item: "Sitrus Berry",
    moves: ["Darkest Lariat", "Flare Blitz", "Fake Out", "Parting Shot"],
  },
};

/* ============================================================
   COMMON ABILITIES / ITEMS / MOVES (for dropdown suggestions)
   ============================================================ */
const COMMON_ABILITIES = [
  "Intimidate","Levitate","Drought","Drizzle","Sand Stream","Snow Warning",
  "Chlorophyll","Swift Swim","Sand Rush","Slush Rush","Solar Power",
  "Protean","Libero","Adaptability","Technician","Sheer Force","Tinted Lens",
  "Rough Skin","Iron Barbs","Static","Flame Body","Cute Charm",
  "Speed Boost","Unburden","Quick Feet","Sand Veil","Snow Cloak",
  "Sturdy","Multiscale","Filter","Solid Rock","Thick Fat","Fluffy",
  "Magic Bounce","Magic Guard","Wonder Guard","Disguise","Unaware",
  "Prankster","Gale Wings","Telepathy","Friend Guard","Storm Drain","Lightning Rod",
  "Mold Breaker","Dauntless Shield","Intrepid Sword","Stamina","Stakeout",
  "Beads of Ruin","Sword of Ruin","Vessel of Ruin","Tablets of Ruin",
  "Quark Drive","Protosynthesis","Toxic Debris","Supreme Overlord",
  "Pixilate","Aerilate","Refrigerate","Galvanize","Skill Link",
  "Blaze","Torrent","Overgrow","Swarm","Guts","Hustle","Moxie",
];

const COMMON_ITEMS = [
  "Leftovers","Sitrus Berry","Focus Sash","Life Orb","Choice Scarf",
  "Choice Specs","Choice Band","Assault Vest","Mental Herb","White Herb","Power Herb",
  "Rocky Helmet","Heavy-Duty Boots","Eviolite","Light Clay","Safety Goggles",
  "Wide Lens","Scope Lens","Expert Belt","Throat Spray","Covert Cloak",
  "Clear Amulet","Booster Energy","Loaded Dice","Mirror Herb","Punching Glove",
  "Lum Berry","Iapapa Berry","Figy Berry","Wiki Berry","Mago Berry","Aguav Berry",
  "Chople Berry","Occa Berry","Passho Berry","Yache Berry","Babiri Berry",
  "Eject Pack","Eject Button","Red Card","Air Balloon","Weakness Policy",
  "Charizardite Y","Charizardite X","Venusaurite","Blastoisinite","Scizorite",
  "Garchompite","Lucarionite","Lopunnite","Gengarite","Tyranitarite",
  "Kangaskhanite","Gardevoirite","Galladite","Pinsirite","Heracronite",
  "Manectite","Banettite","Houndoominite","Absolite","Aggronite","Beedrillite",
  "Pidgeotite","Altarianite","Audinite","Sablenite","Glalitite","Steelixite",
  "Sharpedonite","Cameruptite","Ampharosite","Slowbronite","Medichamite",
  "Abomasite","Aerodactylite","Alakazite",
];

const COMMON_MOVES = [
  "Protect","Detect","Tailwind","Helping Hand","Follow Me","Rage Powder",
  "Fake Out","Quick Attack","Bullet Punch","Sucker Punch","Mach Punch",
  "Earthquake","Rock Slide","Stone Edge","Bulldoze","Headbutt","Body Slam",
  "Flamethrower","Heat Wave","Fire Blast","Overheat","Flare Blitz","Will-O-Wisp",
  "Surf","Hydro Pump","Scald","Liquidation","Flip Turn","Wave Crash",
  "Thunderbolt","Discharge","Volt Switch","Thunder","Wild Charge","Thunder Punch",
  "Ice Beam","Blizzard","Triple Axel","Icy Wind","Ice Shard","Ice Punch",
  "Energy Ball","Leaf Storm","Solar Beam","Giga Drain","Flower Trick","Sleep Powder","Spore",
  "Close Combat","Drain Punch","Aura Sphere","Brick Break","Cross Chop","Sacred Sword",
  "Sludge Bomb","Toxic","Gunk Shot","Poison Jab","Cross Poison","Dire Claw",
  "Earth Power","High Horsepower","Drill Run","Mud Shot",
  "Air Slash","Brave Bird","Hurricane","Acrobatics","Roost",
  "Psychic","Psyshock","Expanding Force","Stored Power","Calm Mind",
  "U-turn","Bug Buzz","Lunge","First Impression","Megahorn",
  "Stealth Rock","Rock Tomb","Accelerock","Diamond Storm",
  "Shadow Ball","Hex","Poltergeist","Phantom Force","Shadow Sneak",
  "Outrage","Dragon Claw","Dragon Pulse","Draco Meteor","Dragon Dance",
  "Dark Pulse","Knock Off","Crunch","Foul Play","Sucker Punch","Darkest Lariat","Parting Shot",
  "Iron Head","Bullet Punch","Steel Beam","Flash Cannon","Meteor Mash",
  "Moonblast","Dazzling Gleam","Play Rough","Disarming Voice","Sparkling Aria",
  "Swords Dance","Nasty Plot","Bulk Up","Iron Defense","Calm Mind","Curse",
  "Substitute","Recover","Roost","Slack Off","Soft-Boiled","Wish",
  "Weather Ball","Hyper Voice","Body Press","Liquidation","Flame Charge",
];

/* ============================================================
   BRAND IDENTITY — Official Pokémon palette
   ============================================================ */
const BRAND = {
  name: "PETRSON'S DOUBLE BATTLE BUDDY",
  // Official Pokémon brand colors
  yellow: "#FFCB05",      // Pokémon Yellow — primary brand
  yellowDeep: "#E8B800",  // Shadow / pressed yellow
  blue: "#3D7DCA",        // Pokémon Blue — mid accent
  navy: "#003A70",        // Pokémon Navy — deep surfaces, headlines
  // Champions site accent
  orange: "#FF6B1A",      // Champions battle orange — energy / verdict
  red: "#E0153B",         // Pokeball red
  // Neutrals
  white: "#FFFFFF",
  paper: "#F5F7FA",       // Cool light canvas (echoes Pokémon UI)
  cream: "#FFFEF7",       // Slight warm cream
  ink: "#003A70",         // Body text uses navy for brand consistency
  inkSoft: "#475569",
};

// Pokeball logo — classic red/white with navy band
const BrandLogo = ({ size = 36 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="pbRedGrad" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#FF4D5E" />
          <stop offset="100%" stopColor={BRAND.red} />
        </radialGradient>
        <radialGradient id="pbWhiteGrad" cx="35%" cy="70%" r="80%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E8EEF5" />
        </radialGradient>
      </defs>
      {/* Outer black ring */}
      <circle cx="24" cy="24" r="22" fill={BRAND.navy} />
      {/* Top half */}
      <path d="M 4 24 A 20 20 0 0 1 44 24 Z" fill="url(#pbRedGrad)" />
      {/* Bottom half */}
      <path d="M 4 24 A 20 20 0 0 0 44 24 Z" fill="url(#pbWhiteGrad)" />
      {/* Center band */}
      <rect x="2" y="22" width="44" height="4" fill={BRAND.navy} />
      {/* Center button */}
      <circle cx="24" cy="24" r="6" fill={BRAND.navy} />
      <circle cx="24" cy="24" r="4.5" fill="white" />
      <circle cx="24" cy="24" r="2" fill={BRAND.navy} />
      {/* Highlight glint on red half */}
      <ellipse cx="16" cy="13" rx="4" ry="2.5" fill="white" opacity="0.4" />
    </svg>
  );
};

/* ============================================================
   MAIN APP
   ============================================================ */
export default function DoubleBattleBuddy() {
  const [stage, setStage] = useState("welcome");
  const [oppTeam, setOppTeam] = useState([]);
  const [myActive, setMyActive] = useState([]);
  const [oppActive, setOppActive] = useState([]);

  // Editable team state (loaded from storage on mount, saved on change)
  const [myTeam, setMyTeam] = useState(DEFAULT_TEAM);
  const [myTeamSets, setMyTeamSets] = useState(DEFAULT_TEAM_SETS);
  const [editingMon, setEditingMon] = useState(null); // null | "all" | name of mon being edited
  const [storageReady, setStorageReady] = useState(false);

  // Load saved team on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (typeof window !== "undefined" && window.storage) {
          const teamRes = await window.storage.get("myTeam");
          const setsRes = await window.storage.get("myTeamSets");
          if (!cancelled) {
            if (teamRes?.value) setMyTeam(JSON.parse(teamRes.value));
            if (setsRes?.value) setMyTeamSets(JSON.parse(setsRes.value));
          }
        }
      } catch (e) { /* no saved team yet — use defaults */ }
      if (!cancelled) setStorageReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  // Persist team on change (skip until initial load is done)
  useEffect(() => {
    if (!storageReady) return;
    if (typeof window === "undefined" || !window.storage) return;
    window.storage.set("myTeam", JSON.stringify(myTeam)).catch(() => {});
    window.storage.set("myTeamSets", JSON.stringify(myTeamSets)).catch(() => {});
  }, [myTeam, myTeamSets, storageReady]);

  const ranked = useMemo(() => {
    if (myTeam.length === 6 && oppTeam.length === 6) return rankLeads(myTeam, oppTeam);
    return [];
  }, [oppTeam, myTeam]);

  const bringFour = useMemo(() => {
    if (myTeam.length === 6 && oppTeam.length === 6) return recommendBringFour(myTeam, oppTeam);
    return null;
  }, [oppTeam, myTeam]);

  const reset = () => {
    setStage("welcome"); setOppTeam([]); setMyActive([]); setOppActive([]);
  };

  const updateMon = (oldName, newName, newSet) => {
    setMyTeam(prev => prev.map(n => n === oldName ? newName : n));
    setMyTeamSets(prev => {
      const next = { ...prev };
      if (oldName !== newName) delete next[oldName];
      next[newName] = newSet;
      return next;
    });
    // Clear any battle state that referenced the old name to avoid stale refs
    setMyActive([]);
    setOppActive([]);
  };

  const stages = ["welcome","oppteam","leads","active"];
  const currentIdx = stages.indexOf(stage);

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: BRAND.paper,
        backgroundImage: `linear-gradient(${BRAND.navy}06 1px, transparent 1px), linear-gradient(90deg, ${BRAND.navy}06 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
        fontFamily: "'Plus Jakarta Sans', -apple-system, system-ui, sans-serif",
        color: BRAND.ink,
        scrollbarGutter: "stable",
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Archivo+Black&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
      <style>{`html { scrollbar-gutter: stable; }`}</style>

      {/* Header — Pokémon yellow with navy band */}
      <div
        className="sticky top-0 z-20"
        style={{
          background: BRAND.yellow,
          borderBottom: `4px solid ${BRAND.navy}`,
          boxShadow: `0 4px 0 0 ${BRAND.yellowDeep}`,
        }}
      >
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
          <BrandLogo size={44} />
          <div className="min-w-0 flex-1 leading-none">
            <div
              className="text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: BRAND.navy, fontFamily: "'JetBrains Mono', monospace", opacity: 0.75 }}
            >
              Petrson's
            </div>
            <div
              className="mt-0.5 whitespace-nowrap text-[clamp(15px,4.5vw,20px)] uppercase"
              style={{
                fontFamily: "'Archivo Black', sans-serif",
                letterSpacing: "-0.01em",
                color: BRAND.navy,
              }}
            >
              Double Battle Buddy
            </div>
          </div>
          <button
            onClick={reset}
            className="flex shrink-0 items-center justify-center rounded-full transition active:scale-95"
            style={{
              background: stage === "welcome" ? "transparent" : BRAND.navy,
              color: BRAND.yellow,
              border: stage === "welcome" ? "2px solid transparent" : `2px solid ${BRAND.navy}`,
              width: 32,
              height: 32,
              visibility: stage === "welcome" ? "hidden" : "visible",
            }}
            aria-label="Reset"
            title="Reset"
            tabIndex={stage === "welcome" ? -1 : 0}
            aria-hidden={stage === "welcome"}
          >
            <RotateCcw size={14} strokeWidth={2.5} />
          </button>
        </div>
        {/* Progress dots */}
        <div className="mx-auto flex max-w-md gap-1 px-4 pb-2.5">
          {stages.map((s, i) => (
            <div
              key={s}
              className="h-1.5 flex-1 rounded-full transition-all"
              style={{
                background: i <= currentIdx ? BRAND.navy : `${BRAND.navy}25`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 py-5 pb-24">
        {stage === "welcome" && (
          <Welcome
            onStart={() => setStage("oppteam")}
            myTeam={myTeam}
            myTeamSets={myTeamSets}
            onEditMon={(name) => setEditingMon(name)}
            onEditAll={() => setEditingMon("all")}
          />
        )}
        {stage === "oppteam" && (
          <OpponentPicker
            team={oppTeam}
            setTeam={setOppTeam}
            onConfirm={() => setStage("leads")}
          />
        )}
        {stage === "leads" && (
          <LeadRecommendation
            ranked={ranked}
            bringFour={bringFour}
            oppTeam={oppTeam}
            onConfirm={() => setStage("active")}
          />
        )}
        {stage === "active" && (
          <ActiveBattle
            myTeam={bringFour ? bringFour.four.map(m => m.name) : myTeam}
            oppTeam={oppTeam}
            myActive={myActive} oppActive={oppActive}
            setMyActive={setMyActive} setOppActive={setOppActive}
          />
        )}
      </div>

      {/* Team Editor — modal overlay */}
      {editingMon && (
        <TeamEditor
          target={editingMon}
          myTeam={myTeam}
          myTeamSets={myTeamSets}
          onClose={() => setEditingMon(null)}
          onSaveMon={(oldName, newName, newSet) => {
            updateMon(oldName, newName, newSet);
            setEditingMon(null);
          }}
        />
      )}
    </div>
  );
}

/* ============================================================
   STAGE: WELCOME
   ============================================================ */
function Welcome({ onStart, myTeam, myTeamSets, onEditMon, onEditAll }) {
  return (
    <div className="space-y-5 pt-4">
      {/* User's team card — Pokémon trainer card style */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background: BRAND.navy,
          border: `4px solid ${BRAND.yellow}`,
          boxShadow: `0 8px 0 0 ${BRAND.yellowDeep}, 0 12px 24px -8px ${BRAND.navy}60`,
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ background: BRAND.yellow }}
        >
          <span
            className="text-3xl uppercase leading-none"
            style={{
              fontFamily: "'Archivo Black', sans-serif",
              color: BRAND.navy,
              letterSpacing: "-0.01em",
            }}
          >
            My Team
          </span>
          <button
            onClick={onEditAll}
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition active:scale-95"
            style={{
              background: BRAND.navy,
              color: BRAND.yellow,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <Edit2 size={10} strokeWidth={2.5} /> Edit
          </button>
        </div>
        <div className="space-y-1 p-1.5">
          {myTeam.map(name => {
            const p = POKEDEX[name];
            const set = myTeamSets[name];
            return (
              <div
                key={name}
                role="button"
                tabIndex={0}
                onClick={() => onEditMon(name)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onEditMon(name); } }}
                className="cursor-pointer rounded-lg px-2.5 py-2 transition active:scale-[0.99]"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: `1px solid ${BRAND.yellow}30`,
                }}
                aria-label={`Edit ${name}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-sm font-bold text-white">{shortName(name)}</div>
                  <div className="flex shrink-0 flex-wrap justify-end gap-1">
                    {(p?.megaTypes || p?.types || []).map(t => <TypePill key={t} type={t} />)}
                  </div>
                </div>
                {set && (
                  <>
                    <div className="mt-1 flex items-center gap-1.5 truncate text-[11px]" title={`Ability: ${set.ability} · Item: ${set.item}`}>
                      <span style={{ color: BRAND.yellow }} aria-label="Ability">◇</span>
                      <span className="truncate font-semibold text-white/95">{set.ability}</span>
                      <span className="opacity-30 text-white">|</span>
                      <span style={{ color: BRAND.yellow }} aria-label="Item">●</span>
                      <span className="truncate font-semibold text-white/95">{set.item}</span>
                    </div>
                    {set.moves && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {set.moves.map(m => {
                          const moveType = MOVE_TYPES[m];
                          const bg = moveType ? TYPE_COLORS[moveType] : `${BRAND.yellow}25`;
                          return (
                            <span
                              key={m}
                              className="rounded px-1.5 py-px text-[10px] font-bold leading-tight text-white"
                              style={{
                                background: bg,
                                boxShadow: moveType ? `inset 0 0 0 1px rgba(255,255,255,0.15)` : `inset 0 0 0 1px ${BRAND.yellow}50`,
                                textShadow: "0 1px 1px rgba(0,0,0,0.3)",
                              }}
                            >
                              {m}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onStart}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-lg uppercase transition active:translate-y-0.5"
        style={{
          background: BRAND.yellow,
          color: BRAND.navy,
          fontFamily: "'Archivo Black', sans-serif",
          letterSpacing: "0.05em",
          border: `3px solid ${BRAND.navy}`,
          boxShadow: `0 6px 0 0 ${BRAND.navy}, 0 10px 20px -5px ${BRAND.navy}40`,
        }}
      >
        Start <ArrowRight size={20} strokeWidth={3} />
      </button>
    </div>
  );
}

/* ============================================================
   TEAM EDITOR — modal for editing user's team
   ============================================================ */
function TeamEditor({ target, myTeam, myTeamSets, onClose, onSaveMon }) {
  // If target is a single mon name, edit just that one. If "all", show the list to pick.
  const [activeMon, setActiveMon] = useState(target === "all" ? null : target);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="mx-auto mt-auto flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl"
        style={{ background: BRAND.paper, border: `4px solid ${BRAND.yellow}`, borderBottom: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex shrink-0 items-center justify-between px-4 py-3"
          style={{ background: BRAND.yellow }}
        >
          <div className="flex items-center gap-2">
            {activeMon && target === "all" && (
              <button
                onClick={() => setActiveMon(null)}
                className="text-xs font-bold"
                style={{ color: BRAND.navy, fontFamily: "'JetBrains Mono', monospace" }}
              >
                ← Back
              </button>
            )}
            <span
              className="text-xl uppercase leading-none"
              style={{ fontFamily: "'Archivo Black', sans-serif", color: BRAND.navy, letterSpacing: "-0.01em" }}
            >
              {activeMon ? `Edit ${shortName(activeMon)}` : "Edit Team"}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ background: BRAND.navy, color: BRAND.yellow }}
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3">
          {!activeMon ? (
            // List of all 6 mons (when "Edit Team" was clicked)
            <div className="space-y-2">
              <p className="px-1 pb-1 text-xs" style={{ color: BRAND.inkSoft }}>
                Tap any Pokémon to edit its species, ability, item, or moves.
              </p>
              {myTeam.map(name => {
                const set = myTeamSets[name];
                const p = POKEDEX[name];
                return (
                  <button
                    key={name}
                    onClick={() => setActiveMon(name)}
                    className="flex w-full items-center justify-between rounded-xl bg-white p-3 text-left transition active:scale-[0.99]"
                    style={{ border: `1.5px solid ${BRAND.navy}15` }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold" style={{ color: BRAND.navy }}>{name}</div>
                      <div className="mt-0.5 flex flex-wrap gap-1">
                        {(p?.megaTypes || p?.types || []).map(t => <TypePill key={t} type={t} />)}
                      </div>
                      {set && (
                        <div className="mt-1 truncate text-[11px]" style={{ color: BRAND.inkSoft }}>
                          {set.ability} · {set.item}
                        </div>
                      )}
                    </div>
                    <Edit2 size={14} className="shrink-0" style={{ color: BRAND.blue }} />
                  </button>
                );
              })}
            </div>
          ) : (
            <MonEditor
              monName={activeMon}
              monSet={myTeamSets[activeMon] || { ability: "", item: "", moves: ["", "", "", ""] }}
              myTeam={myTeam}
              onSave={(newName, newSet) => onSaveMon(activeMon, newName, newSet)}
              onCancel={target === "all" ? () => setActiveMon(null) : onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Editor for a single Pokémon — name, ability, item, 4 moves
function MonEditor({ monName, monSet, myTeam, onSave, onCancel }) {
  const [name, setName] = useState(monName);
  const [ability, setAbility] = useState(monSet.ability || "");
  const [item, setItem] = useState(monSet.item || "");
  const [moves, setMoves] = useState([
    monSet.moves?.[0] || "",
    monSet.moves?.[1] || "",
    monSet.moves?.[2] || "",
    monSet.moves?.[3] || "",
  ]);

  const setMove = (i, v) => setMoves(prev => prev.map((m, idx) => idx === i ? v : m));

  const otherTeamNames = myTeam.filter(n => n !== monName);
  const nameInvalid = !name || (otherTeamNames.includes(name));
  const movesInvalid = moves.some(m => !m.trim());

  const submit = () => {
    if (nameInvalid || movesInvalid) return;
    onSave(name, {
      ability: ability.trim(),
      item: item.trim(),
      moves: moves.map(m => m.trim()),
    });
  };

  return (
    <div className="space-y-3">
      {/* Pokémon name picker */}
      <FieldGroup label="Pokémon">
        <Autocomplete
          value={name}
          onChange={setName}
          options={Object.keys(POKEDEX).filter(n => POKEMON_CHAMPIONS_AVAILABLE.has(n) || /\(Mega/.test(n))}
          placeholder="Type to search…"
          accent={BRAND.blue}
        />
        {nameInvalid && (
          <p className="mt-1 text-[11px]" style={{ color: BRAND.red }}>
            {!name ? "Required" : "This Pokémon is already on your team"}
          </p>
        )}
      </FieldGroup>

      {/* Ability */}
      <FieldGroup label="Ability">
        <Autocomplete
          value={ability}
          onChange={setAbility}
          options={COMMON_ABILITIES}
          placeholder="e.g. Intimidate"
          accent={BRAND.yellowDeep}
          allowFreeText
        />
      </FieldGroup>

      {/* Item */}
      <FieldGroup label="Held Item">
        <Autocomplete
          value={item}
          onChange={setItem}
          options={COMMON_ITEMS}
          placeholder="e.g. Sitrus Berry"
          accent={BRAND.yellowDeep}
          allowFreeText
        />
      </FieldGroup>

      {/* Moves */}
      <FieldGroup label="Moves">
        <div className="space-y-1.5">
          {moves.map((m, i) => (
            <Autocomplete
              key={i}
              value={m}
              onChange={(v) => setMove(i, v)}
              options={COMMON_MOVES}
              placeholder={`Move ${i + 1}`}
              accent={BRAND.blue}
              allowFreeText
            />
          ))}
        </div>
        {movesInvalid && (
          <p className="mt-1 text-[11px]" style={{ color: BRAND.red }}>All 4 moves are required</p>
        )}
      </FieldGroup>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 rounded-xl py-3 text-sm font-bold uppercase transition active:scale-[0.98]"
          style={{
            background: "white",
            color: BRAND.navy,
            border: `2px solid ${BRAND.navy}`,
            fontFamily: "'Archivo Black', sans-serif",
            letterSpacing: "0.05em",
          }}
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={nameInvalid || movesInvalid}
          className="flex-[2] rounded-xl py-3 text-sm uppercase transition active:translate-y-0.5 disabled:opacity-50"
          style={{
            background: BRAND.yellow,
            color: BRAND.navy,
            border: `2px solid ${BRAND.navy}`,
            boxShadow: nameInvalid || movesInvalid ? "none" : `0 4px 0 0 ${BRAND.navy}`,
            fontFamily: "'Archivo Black', sans-serif",
            letterSpacing: "0.05em",
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}

function FieldGroup({ label, children }) {
  return (
    <div>
      <div
        className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em]"
        style={{ color: BRAND.navy, fontFamily: "'JetBrains Mono', monospace" }}
      >
        ▸ {label}
      </div>
      {children}
    </div>
  );
}

// Autocomplete: input with suggestion dropdown. Filters options by current value.
function Autocomplete({ value, onChange, options, placeholder, accent, allowFreeText }) {
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const blurTimer = useRef(null);

  const filtered = useMemo(() => {
    const v = value.toLowerCase().trim();
    if (!v) return options.slice(0, 30);
    return options
      .filter(o => o.toLowerCase().includes(v))
      .slice(0, 30);
  }, [value, options]);

  const exactMatch = options.some(o => o.toLowerCase() === value.toLowerCase());
  const showOpen = open && filtered.length > 0;

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setTouched(true); }}
        onFocus={() => { clearTimeout(blurTimer.current); setOpen(true); }}
        onBlur={() => { blurTimer.current = setTimeout(() => setOpen(false), 150); }}
        placeholder={placeholder}
        className="w-full rounded-lg bg-white px-3 py-2.5 text-sm font-semibold outline-none transition focus:ring-2"
        style={{
          color: BRAND.navy,
          border: `1.5px solid ${touched && !value ? `${BRAND.red}80` : `${BRAND.navy}20`}`,
          "--tw-ring-color": `${accent || BRAND.blue}40`,
        }}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Clear"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100"
          tabIndex={-1}
        >
          <X size={12} />
        </button>
      )}
      {showOpen && (
        <div
          className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-y-auto rounded-lg bg-white shadow-lg"
          style={{ border: `1.5px solid ${BRAND.navy}20` }}
        >
          {filtered.map(opt => (
            <button
              key={opt}
              onMouseDown={(e) => { e.preventDefault(); onChange(opt); setOpen(false); }}
              className="block w-full px-3 py-2 text-left text-sm font-medium hover:bg-slate-50"
              style={{ color: BRAND.navy }}
            >
              {opt}
            </button>
          ))}
          {!exactMatch && allowFreeText && value.trim() && (
            <button
              onMouseDown={(e) => { e.preventDefault(); setOpen(false); }}
              className="block w-full border-t px-3 py-2 text-left text-xs italic"
              style={{ borderColor: `${BRAND.navy}10`, color: BRAND.inkSoft }}
            >
              Use "{value.trim()}" as-is
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   STAGE: OPPONENT PICKER (search-based)
   ============================================================ */
function OpponentPicker({ team, setTeam, onConfirm }) {
  const [query, setQuery] = useState("");
  const [browseOpen, setBrowseOpen] = useState(false);
  const [browseSort, setBrowseSort] = useState("name"); // name | speed | type
  const [browseType, setBrowseType] = useState("All"); // All or one of TYPES
  const inputRef = useRef(null);

  const searchResults = useMemo(() => {
    const s = query.trim().toLowerCase();
    if (!s) return [];
    return ALL_NAMES
      .filter(n => !team.includes(n) && n.toLowerCase().includes(s))
      .sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(s) ? 0 : 1;
        const bStarts = b.toLowerCase().startsWith(s) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;
        return a.length - b.length;
      })
      .slice(0, 12);
  }, [query, team]);

  const browseList = useMemo(() => {
    let list = ALL_NAMES.filter(n => !team.includes(n));
    if (browseType !== "All") {
      list = list.filter(n => {
        const p = POKEDEX[n];
        return (p?.megaTypes || p?.types || []).includes(browseType);
      });
    }
    if (browseSort === "speed") {
      list = list.slice().sort((a, b) => {
        const sa = (POKEDEX[a]?.megaSpeed || POKEDEX[a]?.speed || 0);
        const sb = (POKEDEX[b]?.megaSpeed || POKEDEX[b]?.speed || 0);
        return sb - sa;
      });
    } else if (browseSort === "type") {
      list = list.slice().sort((a, b) => {
        const ta = (POKEDEX[a]?.megaTypes || POKEDEX[a]?.types || ["zzz"])[0];
        const tb = (POKEDEX[b]?.megaTypes || POKEDEX[b]?.types || ["zzz"])[0];
        if (ta !== tb) return ta.localeCompare(tb);
        return a.localeCompare(b);
      });
    } else {
      list = list.slice().sort();
    }
    return list;
  }, [browseSort, browseType, team]);

  const addPokemon = (name) => {
    if (team.length >= 6) return;
    if (team.includes(name)) return;
    setTeam([...team, name]);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const removePokemon = (name) => {
    setTeam(team.filter(n => n !== name));
  };

  const teamComplete = team.length === 6;

  return (
    <div className="space-y-5">
      <div>
        <div
          className="inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em]"
          style={{ background: BRAND.navy, color: BRAND.yellow, fontFamily: "'JetBrains Mono', monospace" }}
        >
          ▸ Step 1 of 3
        </div>
        <h2
          className="mt-2 text-3xl uppercase leading-none"
          style={{
            fontFamily: "'Archivo Black', sans-serif",
            color: BRAND.navy,
            letterSpacing: "-0.01em",
          }}
        >
          Opponent's Team
        </h2>
        <p className="mt-3 text-sm" style={{ color: BRAND.inkSoft }}>
          <span className="font-bold" style={{ color: BRAND.navy }}>{team.length}/6</span> added. Search or browse the full list.
        </p>
      </div>

      {team.length < 6 && (
        <div className="space-y-3">
          {/* Search bar + browse toggle */}
          <div className="flex gap-2">
            <div
              className="flex flex-1 items-center gap-2 rounded-xl bg-white px-3 py-3 transition focus-within:ring-2"
              style={{ border: `2px solid ${BRAND.navy}15`, "--tw-ring-color": `${BRAND.blue}40` }}
            >
              <Search size={18} className="shrink-0" style={{ color: BRAND.navy }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setBrowseOpen(false); }}
                placeholder="Search Pokémon…"
                className="w-full bg-transparent text-base font-medium text-slate-900 outline-none placeholder:text-slate-400"
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => { setBrowseOpen(!browseOpen); setQuery(""); }}
              className="flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-3 text-sm font-bold transition active:scale-95"
              style={{
                background: browseOpen ? BRAND.navy : "white",
                color: browseOpen ? "white" : BRAND.navy,
                border: `2px solid ${BRAND.navy}${browseOpen ? "" : "15"}`,
              }}
            >
              <List size={16} />
              <ChevronDown size={14} className={browseOpen ? "rotate-180 transition" : "transition"} />
            </button>
          </div>

          {/* Search results */}
          {query.trim() && (
            <div className="space-y-1.5">
              {searchResults.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
                  No matches. Try a shorter or different spelling.
                </div>
              ) : (
                searchResults.map(name => (
                  <PickerRow key={name} name={name} onAdd={addPokemon} />
                ))
              )}
            </div>
          )}

          {/* Browse dropdown */}
          {browseOpen && (
            <div className="overflow-hidden rounded-xl border-2" style={{ borderColor: BRAND.navy, background: "white" }}>
              {/* Filter chips */}
              <div className="border-b border-slate-200 bg-slate-50 p-3">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Sort by</div>
                <div className="mb-3 flex gap-1.5">
                  {[
                    { v: "name", label: "Name" },
                    { v: "type", label: "Type" },
                  ].map(opt => (
                    <button
                      key={opt.v}
                      onClick={() => setBrowseSort(opt.v)}
                      className="rounded-full px-3 py-1 text-xs font-bold transition active:scale-95"
                      style={{
                        background: browseSort === opt.v ? BRAND.navy : "white",
                        color: browseSort === opt.v ? "white" : BRAND.navy,
                        border: `1.5px solid ${BRAND.navy}${browseSort === opt.v ? "" : "30"}`,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Filter type</div>
                <div className="flex flex-wrap gap-1">
                  {["All", ...TYPES].map(t => (
                    <button
                      key={t}
                      onClick={() => setBrowseType(t)}
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-bold transition active:scale-95"
                      style={{
                        background: browseType === t ? (t === "All" ? BRAND.navy : TYPE_COLORS[t]) : "white",
                        color: browseType === t ? "white" : "#475569",
                        border: `1.5px solid ${browseType === t ? "transparent" : "#cbd5e1"}`,
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              {/* Scrollable list */}
              <div className="max-h-80 overflow-y-auto">
                <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {browseList.length} Pokémon
                </div>
                <div className="space-y-1 px-2 pb-2">
                  {browseList.slice(0, 200).map(name => (
                    <PickerRow key={name} name={name} onAdd={addPokemon} compact />
                  ))}
                  {browseList.length > 200 && (
                    <div className="px-3 py-2 text-center text-[11px] text-slate-400">
                      Showing first 200. Refine the filter above to see more.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected team */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span
            className="text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ color: BRAND.navy, fontFamily: "'JetBrains Mono', monospace" }}
          >
            ▸ Opponent ({team.length}/6)
          </span>
        </div>
        {team.length === 0 ? (
          <div
            className="rounded-xl border-2 border-dashed bg-white p-6 text-center text-sm font-medium text-slate-400"
            style={{ borderColor: `${BRAND.navy}25` }}
          >
            Add Pokémon to start
          </div>
        ) : (
          <div className="space-y-2">
            {team.map((name, idx) => {
              const p = POKEDEX[name];
              return (
                <div
                  key={name}
                  className="flex items-center gap-3 rounded-xl bg-white p-3"
                  style={{ border: `1.5px solid ${BRAND.navy}15` }}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                    style={{ background: BRAND.navy, fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold" style={{ color: BRAND.navy }}>{name}</div>
                    <div className="mt-0.5 flex flex-wrap gap-1">
                      {(p?.megaTypes || p?.types || []).map(t => <TypePill key={t} type={t} />)}
                    </div>
                  </div>
                  <button
                    onClick={() => removePokemon(name)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    style={{ border: `1px solid ${BRAND.navy}15` }}
                    aria-label="Remove"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        onClick={onConfirm}
        disabled={!teamComplete}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-lg uppercase transition active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          background: BRAND.yellow,
          color: BRAND.navy,
          fontFamily: "'Archivo Black', sans-serif",
          letterSpacing: "0.05em",
          border: `3px solid ${BRAND.navy}`,
          boxShadow: teamComplete ? `0 6px 0 0 ${BRAND.navy}` : `0 3px 0 0 ${BRAND.navy}`,
        }}
      >
        {teamComplete ? <>See Best Picks <ArrowRight size={20} strokeWidth={3} /></> : `Need ${6 - team.length} more`}
      </button>
    </div>
  );
}

// Reusable picker row
function PickerRow({ name, onAdd, compact }) {
  const p = POKEDEX[name];
  return (
    <button
      onClick={() => onAdd(name)}
      className="flex w-full items-center justify-between gap-2 rounded-lg bg-white px-3 text-left transition active:scale-[0.99]"
      style={{
        border: `1.5px solid ${BRAND.navy}10`,
        padding: compact ? "0.5rem 0.75rem" : "0.625rem 0.75rem",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = BRAND.blue; e.currentTarget.style.background = `${BRAND.blue}08`; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${BRAND.navy}10`; e.currentTarget.style.background = "white"; }}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold" style={{ color: BRAND.navy }}>{name}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1">
          {(p?.megaTypes || p?.types || []).map(t => <TypePill key={t} type={t} />)}
        </div>
      </div>
      <Plus size={18} className="shrink-0" style={{ color: BRAND.blue }} />
    </button>
  );
}

/* ============================================================
   STAGE: LEAD RECOMMENDATION (Bring 6, Pick 4)
   ============================================================ */
function LeadRecommendation({ ranked, bringFour, oppTeam, onConfirm }) {
  if (!bringFour) return null;
  const { four, fourScore, lead, back, benched } = bringFour;
  const leadReason = leadReasons(lead.a, lead.b, oppTeam);
  const bringReason = bringFourReasons(four, oppTeam);

  return (
    <div className="space-y-5">
      <div>
        <div
          className="inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em]"
          style={{ background: BRAND.navy, color: BRAND.yellow, fontFamily: "'JetBrains Mono', monospace" }}
        >
          ▸ Step 2 of 3
        </div>
        <h2
          className="mt-2 text-3xl uppercase leading-none"
          style={{
            fontFamily: "'Archivo Black', sans-serif",
            color: BRAND.navy,
            letterSpacing: "-0.01em",
          }}
        >
          Bring These 4
        </h2>
      </div>

      {/* Hero card — the 4 to bring with lead pair highlighted */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background: BRAND.navy,
          border: `4px solid ${BRAND.yellow}`,
          boxShadow: `0 8px 0 0 ${BRAND.yellowDeep}, 0 12px 24px -8px ${BRAND.navy}60`,
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ background: BRAND.yellow }}
        >
          <span
            className="text-xs uppercase tracking-[0.1em]"
            style={{ color: BRAND.navy, fontFamily: "'Archivo Black', sans-serif" }}
          >
            Best Picks
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-bold"
            style={{ background: BRAND.navy, color: BRAND.yellow, fontFamily: "'JetBrains Mono', monospace" }}
          >
            {fourScore.toFixed(1)}
          </span>
        </div>

        {/* LEAD section */}
        <div className="px-3 pt-3">
          <div
            className="mb-2 text-[10px] font-bold uppercase tracking-wider"
            style={{ color: BRAND.yellow, fontFamily: "'JetBrains Mono', monospace" }}
          >
            ▸ Lead with these 2
          </div>
          <div className="space-y-2">
            <BigLeadRow num="1" mon={lead.a} note={lead.a.mega ? "Mega Evolve immediately" : (lead.a.tags || []).includes("fakeOut") ? "Fake Out turn 1" : "Send first"} />
            <BigLeadRow num="2" mon={lead.b} note="Partner" />
          </div>
        </div>

        {/* BACK ROW section */}
        <div className="mt-3 px-3">
          <div
            className="mb-2 text-[10px] font-bold uppercase tracking-wider"
            style={{ color: BRAND.yellow, fontFamily: "'JetBrains Mono', monospace", opacity: 0.85 }}
          >
            ▸ Keep ready (priority switches)
          </div>
          <div className="space-y-2">
            {back.map((m, i) => (
              <BackRow key={m.name} num={i + 3} mon={m} note={backRowNote(m, oppTeam)} />
            ))}
          </div>
        </div>

        {/* Why */}
        <div
          className="mx-3 my-3 rounded-lg p-3"
          style={{ background: "rgba(255,255,255,0.08)", border: `1px solid ${BRAND.yellow}30` }}
        >
          <div
            className="mb-2 text-[10px] font-bold uppercase tracking-wider"
            style={{ color: BRAND.yellow, fontFamily: "'JetBrains Mono', monospace" }}
          >
            ▸ Why these picks
          </div>
          <div className="space-y-2.5">
            <div>
              <div
                className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.15em]"
                style={{ color: BRAND.yellow, opacity: 0.75, fontFamily: "'JetBrains Mono', monospace" }}
              >
                Bringing the 4
              </div>
              <p className="text-[13px] leading-relaxed text-white/90">{bringReason}</p>
            </div>
            <div>
              <div
                className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.15em]"
                style={{ color: BRAND.yellow, opacity: 0.75, fontFamily: "'JetBrains Mono', monospace" }}
              >
                Leading with #1 + #2
              </div>
              <p className="text-[13px] leading-relaxed text-white/90">{leadReason}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bench — 2 NOT brought */}
      {benched.length > 0 && (
        <div>
          <div
            className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ color: BRAND.inkSoft, fontFamily: "'JetBrains Mono', monospace" }}
          >
            ▸ Leave on Bench
          </div>
          <div className="space-y-2">
            {benched.map(m => {
              const reason = singleBenchReason(m, four, oppTeam);
              return (
                <div
                  key={m.name}
                  className="rounded-xl px-4 py-3"
                  style={{ background: "#f8fafc", border: `1.5px dashed ${BRAND.navy}20`, opacity: 0.85 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: BRAND.inkSoft }}>{shortName(m.name)}</span>
                    <div className="flex flex-wrap gap-1">
                      {(m.megaTypes || m.types).map(t => <TypePill key={t} type={t} />)}
                    </div>
                  </div>
                  {reason && (
                    <p className="mt-1.5 text-xs italic leading-relaxed" style={{ color: BRAND.inkSoft }}>
                      {reason}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Score explainer */}
      <details
        className="rounded-xl bg-white"
        style={{ border: `1.5px solid ${BRAND.navy}15` }}
      >
        <summary
          className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-[11px] font-bold uppercase tracking-[0.2em]"
          style={{ color: BRAND.navy, fontFamily: "'JetBrains Mono', monospace" }}
        >
          <span>▸ How is the score calculated?</span>
          <span style={{ color: BRAND.blue }}>+</span>
        </summary>
        <div className="space-y-3 border-t px-4 py-3 text-xs leading-relaxed" style={{ borderColor: `${BRAND.navy}10`, color: BRAND.inkSoft }}>
          <p style={{ color: BRAND.navy }}>
            For each of the opponent's 6, your group of 4 gets points based on the BEST type matchup any of your 4 has against that opp, minus penalties if many of your 4 are weak to that opp's typing. Then synergy bonuses are added.
          </p>
          <div>
            <div
              className="mb-1 text-[10px] font-bold uppercase tracking-wider"
              style={{ color: BRAND.blue, fontFamily: "'JetBrains Mono', monospace" }}
            >
              Offense (best of your 4 vs each opp)
            </div>
            <div className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-0.5 font-mono text-[11px]">
              <span style={{ color: "#10b981" }}>+2.0</span><span>Super-effective hit (2× or 4×)</span>
              <span style={{ color: BRAND.navy }}>+0.25</span><span>Neutral hit (1×)</span>
              <span style={{ color: BRAND.red }}>−1.0</span><span>Resisted or immune</span>
            </div>
          </div>
          <div>
            <div
              className="mb-1 text-[10px] font-bold uppercase tracking-wider"
              style={{ color: BRAND.red, fontFamily: "'JetBrains Mono', monospace" }}
            >
              Defense (vulnerability of the 4)
            </div>
            <div className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-0.5 font-mono text-[11px]">
              <span style={{ color: BRAND.red }}>−1.5</span><span>2+ of your 4 take 4× from this opp</span>
              <span style={{ color: BRAND.red }}>−0.5</span><span>1 of your 4 takes 4×</span>
              <span style={{ color: BRAND.red }}>−0.5</span><span>3+ take 2× (limited switch options)</span>
            </div>
          </div>
          <div>
            <div
              className="mb-1 text-[10px] font-bold uppercase tracking-wider"
              style={{ color: BRAND.yellowDeep, fontFamily: "'JetBrains Mono', monospace" }}
            >
              Group bonuses
            </div>
            <div className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-0.5 font-mono text-[11px]">
              <span style={{ color: "#10b981" }}>+2.0</span><span>Sun setter + Chlorophyll partner</span>
              <span style={{ color: "#10b981" }}>+0.5</span><span>Sun setter</span>
              <span style={{ color: "#10b981" }}>+0.4</span><span>Fake Out, Intimidate</span>
              <span style={{ color: "#10b981" }}>+0.3</span><span>Redirect (Follow Me), Tailwind</span>
              <span style={{ color: "#10b981" }}>+0.45</span><span>Up to: 4 unique primary types</span>
            </div>
          </div>
          <p className="text-[11px] italic" style={{ color: BRAND.inkSoft }}>
            The picker tries all 15 possible 4-of-6 combinations and shows the highest-scoring one. The lead pair is then the highest-scoring pair within those 4.
          </p>
        </div>
      </details>

      <button
        onClick={onConfirm}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-lg uppercase transition active:translate-y-0.5"
        style={{
          background: BRAND.yellow,
          color: BRAND.navy,
          fontFamily: "'Archivo Black', sans-serif",
          letterSpacing: "0.05em",
          border: `3px solid ${BRAND.navy}`,
          boxShadow: `0 6px 0 0 ${BRAND.navy}`,
        }}
      >
        Start Battle <ArrowRight size={20} strokeWidth={3} />
      </button>
    </div>
  );
}

// Smaller back-row card (lighter weight than BigLeadRow)
function BackRow({ num, mon, note }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/[0.06] p-2.5" style={{ border: `1px solid ${BRAND.yellow}25` }}>
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base"
        style={{
          background: "rgba(255,255,255,0.12)",
          color: BRAND.yellow,
          fontFamily: "'Archivo Black', sans-serif",
          border: `2px solid ${BRAND.yellow}50`,
        }}
      >
        {num}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold text-white">{shortName(mon.name)}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1">
          {(mon.megaTypes || mon.types).map(t => <TypePill key={t} type={t} />)}
        </div>
        {note && <div className="mt-0.5 truncate text-[11px] text-white/70">{note}</div>}
      </div>
    </div>
  );
}

// Generate a "switch in if..." note for back-row mons based on their tags/types
function backRowNote(m, oppTeam) {
  const tags = m.tags || [];
  if (tags.includes("intimidate")) return "Switch in to neutralize physical attackers";
  if (tags.includes("fakeOut")) return "Pivot for Fake Out + reset momentum";
  if (tags.includes("willOWisp")) return "Switch in to burn physical threats";
  if (tags.includes("levitate")) return "Free switch on Earthquake";
  // Type-based fallback: find an opponent this mon hits super-effectively
  const opp = oppTeam.map(n => ({ name: n, ...POKEDEX[n] }));
  const myTypes = m.megaTypes || m.types;
  for (const o of opp) {
    let best = 0;
    myTypes.forEach(t => { best = Math.max(best, eff(t, o.megaTypes || o.types)); });
    if (best >= 2) return `Counter to their ${shortName(o.name)}`;
  }
  return "Flexible answer";
}

function BigLeadRow({ num, mon, note }) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl bg-white p-3"
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xl"
        style={{
          background: BRAND.yellow,
          color: BRAND.navy,
          fontFamily: "'Archivo Black', sans-serif",
          border: `2px solid ${BRAND.navy}`,
        }}
      >
        {num}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-extrabold" style={{ color: BRAND.navy }}>{shortName(mon.name)}</div>
        <div className="mt-1 flex flex-wrap items-center gap-1">
          {(mon.megaTypes || mon.types).map(t => <TypePill key={t} type={t} />)}
        </div>
        <div className="mt-1 truncate text-xs font-medium" style={{ color: BRAND.inkSoft }}>{note}</div>
      </div>
    </div>
  );
}

function leadReasons(a, b, oppTeam) {
  const opp = oppTeam.map(n => POKEDEX[n]);
  const reasons = [];
  const tagsA = a.tags || [], tagsB = b.tags || [];
  const has = (t) => tagsA.includes(t) || tagsB.includes(t);

  if (has("setsSun")) {
    if (has("chlorophyll")) reasons.push("Sun + Chlorophyll doubles your partner's Speed");
    else reasons.push("Sun powers Fire moves and 1-turn Solar Beam");
  }
  if (has("fakeOut")) reasons.push("Fake Out gives a free turn-1");
  if (has("intimidate")) reasons.push("Intimidate softens their physical threats");
  if (has("redirect")) reasons.push("Redirection protects your partner from focused attacks");
  if (has("tailwind")) reasons.push("Tailwind doubles your team's Speed for 4 turns");

  // Type-based reason: best 2× coverage across the opponent team
  const aTypes = a.megaTypes || a.types;
  const bTypes = b.megaTypes || b.types;
  const myTypes = [...new Set([...aTypes, ...bTypes])];
  const typeWeakCount = {};
  myTypes.forEach(t => {
    typeWeakCount[t] = opp.filter(o => eff(t, o.megaTypes || o.types) >= 2).length;
  });
  const bestType = Object.entries(typeWeakCount).sort((x, y) => y[1] - x[1])[0];
  if (bestType && bestType[1] >= 2) {
    reasons.push(`${bestType[1]} of their Pokémon are weak to ${bestType[0]}`);
  }

  if (!reasons.length) reasons.push("Best overall type matchups vs their team");
  return reasons.slice(0, 3).join(". ") + ".";
}

// Justify the choice of the 4 Pokémon to bring (separate from lead reasoning)
function bringFourReasons(four, oppTeam) {
  const opp = oppTeam.map(n => POKEDEX[n]);
  const reasons = [];

  // Coverage: list every opp the 4 hit super-effectively
  const covered = [];
  opp.forEach(o => {
    let hitter = null;
    four.forEach(m => {
      const myT = m.megaTypes || m.types;
      const oT = o.megaTypes || o.types;
      let best = 0;
      myT.forEach(t => { best = Math.max(best, eff(t, oT)); });
      if (best >= 2 && !hitter) hitter = m;
    });
    if (hitter) covered.push({ opp: o, hitter });
  });
  if (covered.length >= 4) {
    reasons.push(`Hit ${covered.length} of their 6 super-effectively`);
  } else if (covered.length >= 2) {
    const samples = covered.slice(0, 2).map(c => `${shortName(c.hitter.name)} → ${shortName(c.opp.name)}`).join(", ");
    reasons.push(`Key hits: ${samples}`);
  }

  // Tag coverage across the 4
  const allTags = four.flatMap(m => m.tags || []);
  const tagCount = (t) => allTags.filter(x => x === t).length;
  const has = (t) => tagCount(t) > 0;
  const synergies = [];
  if (has("setsSun") && has("chlorophyll")) synergies.push("Sun + Chlorophyll core");
  if (has("intimidate")) synergies.push("Intimidate");
  if (has("fakeOut")) synergies.push("Fake Out");
  if (has("redirect")) synergies.push("redirection");
  if (has("tailwind")) synergies.push("Tailwind");
  if (synergies.length) reasons.push(`Brings ${synergies.slice(0, 3).join(", ")}`);

  // Type diversity
  const primaries = four.map(m => (m.megaTypes || m.types)[0]);
  const uniq = new Set(primaries).size;
  if (uniq === 4) reasons.push("4 distinct primary types — no overlap");

  if (!reasons.length) reasons.push("Best balance of offense and switch options");
  return reasons.slice(0, 3).join(". ") + ".";
}

// Explain why ONE benched Pokémon got dropped (used per-row)
function singleBenchReason(m, four, oppTeam) {
  const opp = oppTeam.map(n => POKEDEX[n]);
  const myT = m.megaTypes || m.types;

  // Count opps that 2x or 4x this mon
  let weak = 0;
  opp.forEach(o => {
    const oT = o.megaTypes || o.types;
    let worst = 0;
    oT.forEach(t => { worst = Math.max(worst, eff(t, myT)); });
    if (worst >= 2) weak++;
  });

  // How many opps does this mon hit super-effectively?
  let hits = 0;
  opp.forEach(o => {
    const oT = o.megaTypes || o.types;
    let best = 0;
    myT.forEach(t => { best = Math.max(best, eff(t, oT)); });
    if (best >= 2) hits++;
  });

  // Does another of the 4 share its primary typing?
  const myPrimary = myT[0];
  const overlap = four.find(f => (f.megaTypes || f.types)[0] === myPrimary);

  if (weak >= 3) return `Weak to ${weak} of their 6 — too risky to switch in.`;
  if (hits === 0) return `Can't hit anything super-effectively in this matchup.`;
  if (overlap) return `${myPrimary}-type role already covered by ${shortName(overlap.name)}.`;
  return `Doesn't add unique coverage the bring-4 lacks.`;
}

// Combined bench reasoning (kept for legacy callers if any)
function benchReasons(benched, four, oppTeam) {
  if (!benched.length) return "";
  return benched.map(m => `${shortName(m.name)}: ${singleBenchReason(m, four, oppTeam)}`).join(" ");
}

/* ============================================================
   STAGE: ACTIVE BATTLE
   ============================================================ */
function ActiveBattle({ myTeam, oppTeam, myActive, oppActive, setMyActive, setOppActive }) {
  const ready = myActive.length === 2 && oppActive.length === 2;

  const toggle = (current, setCurrent, name) => {
    if (current.includes(name)) setCurrent(current.filter(n => n !== name));
    else if (current.length < 2) setCurrent([...current, name]);
  };

  return (
    <div className="space-y-5">
      <div>
        <div
          className="inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em]"
          style={{ background: BRAND.navy, color: BRAND.yellow, fontFamily: "'JetBrains Mono', monospace" }}
        >
          ▸ Step 3 of 3
        </div>
        <h2
          className="mt-2 text-3xl uppercase leading-none"
          style={{
            fontFamily: "'Archivo Black', sans-serif",
            color: BRAND.navy,
            letterSpacing: "-0.01em",
          }}
        >
          {ready ? "Your Move" : "Tap Actives"}
        </h2>
        {!ready && (
          <p className="mt-2 text-sm" style={{ color: BRAND.inkSoft }}>Select 2 from each side to see the call.</p>
        )}
      </div>

      <ActiveSelectorPanel
        side="you"
        team={myTeam}
        active={myActive}
        toggle={(n) => toggle(myActive, setMyActive, n)}
        compact={ready}
      />
      <ActiveSelectorPanel
        side="them"
        team={oppTeam}
        active={oppActive}
        toggle={(n) => toggle(oppActive, setOppActive, n)}
        compact={ready}
      />

      {ready && <MatchupReadout myActive={myActive} oppActive={oppActive} />}
    </div>
  );
}

function ActiveSelectorPanel({ side, team, active, toggle, compact }) {
  const isYou = side === "you";
  const accent = isYou ? BRAND.blue : BRAND.red;
  const label = isYou ? "▸ Your Active" : "▸ Their Active";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span
          className="text-[11px] font-bold uppercase tracking-[0.2em]"
          style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}
        >
          {label}
        </span>
        <span
          className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {active.length}/2
        </span>
      </div>
      <div className={compact ? "grid grid-cols-6 gap-1.5" : "grid grid-cols-2 gap-2"}>
        {team.map((name) => {
          const sel = active.includes(name);
          const dim = !sel && active.length === 2;
          const p = POKEDEX[name];
          if (compact) {
            return (
              <button
                key={name}
                onClick={() => toggle(name)}
                className="flex flex-col items-center justify-center rounded-lg p-1.5 transition active:scale-95"
                style={{
                  border: `2px solid ${sel ? accent : `${BRAND.navy}15`}`,
                  background: sel ? `${accent}15` : "#fff",
                  opacity: dim ? 0.4 : 1,
                }}
              >
                <div className="w-full truncate text-center text-[10px] font-bold leading-tight text-slate-900">
                  {shortName(name).split(" ")[0]}
                </div>
              </button>
            );
          }
          return (
            <button
              key={name}
              onClick={() => toggle(name)}
              className="flex flex-col gap-2 rounded-xl bg-white p-3 text-left transition active:scale-[0.97]"
              style={{
                border: `2px solid ${sel ? accent : `${BRAND.navy}15`}`,
                background: sel ? `${accent}10` : "#fff",
                opacity: dim ? 0.4 : 1,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">{shortName(name)}</span>
                {sel && <Check size={16} style={{ color: accent }} />}
              </div>
              <div className="flex flex-wrap gap-1">
                {(p?.megaTypes || p?.types || []).map(t => <TypePill key={t} type={t} />)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MatchupReadout({ myActive, oppActive }) {
  const matrix = analyzeMatchup(myActive, oppActive);
  const plan = buildPlan(myActive, oppActive);
  const verdict = overallVerdict(matrix);
  const verdictPalette = {
    win: { bg: "#10b981", border: BRAND.yellow },
    lose: { bg: BRAND.red, border: BRAND.yellow },
    neutral: { bg: BRAND.navy, border: BRAND.yellow },
  }[verdict.color];

  return (
    <div className="space-y-4">
      {/* Verdict — chunky trainer-card */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background: verdictPalette.bg,
          border: `4px solid ${verdictPalette.border}`,
          boxShadow: `0 8px 0 0 ${BRAND.yellowDeep}, 0 12px 24px -8px ${BRAND.navy}60`,
        }}
      >
        <div className="px-5 py-5 text-center">
          <div
            className="text-[11px] font-bold uppercase tracking-[0.3em]"
            style={{ color: BRAND.yellow, fontFamily: "'JetBrains Mono', monospace" }}
          >
            ▸ Verdict
          </div>
          <div
            className="mt-1 text-4xl uppercase text-white"
            style={{ fontFamily: "'Archivo Black', sans-serif", letterSpacing: "0.02em" }}
          >
            {verdict.label}
          </div>
        </div>
      </div>

      {plan.length > 0 && (
        <div>
          <div
            className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ color: BRAND.navy, fontFamily: "'JetBrains Mono', monospace" }}
          >
            ▸ Do This Turn
          </div>
          <div className="space-y-2">
            {plan.slice(0, 3).map((p, i) => <PlanCard key={i} item={p} primary={i === 0} />)}
          </div>
        </div>
      )}

      <div>
        <div
          className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em]"
          style={{ color: BRAND.navy, fontFamily: "'JetBrains Mono', monospace" }}
        >
          ▸ Matchups
        </div>
        <div className="space-y-2">
          {matrix.map((cell, i) => <MatchupRow key={i} cell={cell} />)}
        </div>
      </div>
    </div>
  );
}

function PlanCard({ item, primary }) {
  const danger = item.danger;
  const bg = danger ? "#fef2f2" : primary ? `${BRAND.yellow}20` : "#fff";
  const border = danger ? "#fecaca" : primary ? BRAND.yellow : `${BRAND.navy}15`;
  const tagBg = danger ? BRAND.red : primary ? BRAND.navy : BRAND.blue;
  const tagFg = danger || !primary ? "white" : BRAND.yellow;

  return (
    <div className="flex gap-3 rounded-xl p-3" style={{ background: bg, border: `2px solid ${border}` }}>
      <div
        className="shrink-0 self-start rounded px-2 py-0.5 text-[10px] uppercase tracking-wider"
        style={{
          background: tagBg,
          color: primary && !danger ? BRAND.yellow : "white",
          fontFamily: "'Archivo Black', sans-serif",
          letterSpacing: "0.05em",
        }}
      >
        {item.tag}
      </div>
      <div className="text-sm font-medium leading-snug" style={{ color: BRAND.navy }}>{item.text}</div>
    </div>
  );
}

function MatchupRow({ cell }) {
  const advantage = cell.bestOff > cell.worstIn ? "fav" : cell.worstIn > cell.bestOff ? "unfav" : "even";
  const stripe = advantage === "fav" ? "#10b981" : advantage === "unfav" ? "#dc2626" : "#94a3b8";
  const speedFav = cell.mySpeed > cell.theirSpeed;
  const speedSame = cell.mySpeed === cell.theirSpeed;

  return (
    <div
      className="overflow-hidden rounded-xl bg-white"
      style={{ border: `1.5px solid ${BRAND.navy}15` }}
    >
      <div className="flex">
        <div className="w-1.5" style={{ background: stripe }} />
        <div className="flex-1 p-3">
          <div className="text-sm font-bold text-slate-900">
            <span style={{ color: BRAND.blue }}>{shortName(cell.mine)}</span>
            <span className="mx-1.5 text-slate-400">vs</span>
            <span style={{ color: BRAND.red }}>{shortName(cell.theirs)}</span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <span
                className="text-[10px] font-bold uppercase tracking-wider text-slate-500"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                You hit
              </span>
              <EffPill mult={cell.bestOff} />
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="text-[10px] font-bold uppercase tracking-wider text-slate-500"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                They hit
              </span>
              <EffPill mult={cell.worstIn} />
            </div>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs">
            <span
              className="text-[10px] font-bold uppercase tracking-wider text-slate-500"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Speed
            </span>
            {speedSame ? (
              <span className="font-semibold text-slate-600">
                {cell.mySpeed} = {cell.theirSpeed} (tie)
              </span>
            ) : speedFav ? (
              <span className="font-bold text-emerald-600">
                You go first ({cell.mySpeed} vs {cell.theirSpeed})
              </span>
            ) : (
              <span className="font-bold text-red-600">
                They go first ({cell.theirSpeed} vs {cell.mySpeed})
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
