export const BUILD_VERSION = 1;

// Quality order for weapons
export const QUALITY_ORDER = {
  exotic  : 0,
  highend : 1
};

// Quality order for gear
export const GEAR_QUALITY_ORDER = {
  exotic  : 0,
  highend : 1,
  classy  : 2,
  gearset : 3
};

// Quality order for gear mods
export const GEAR_MOD_QUALITY_ORDER = {
  highend  : 0,
  superior : 1
};

export const BASE_PLAYER_STAT = 535;
export const BASE_GEAR_STAT   = 205;

// Gear attributes and mods count
export const GEAR_SLOT_CONFIG = {
  chest : {
    major   : 2,
    minor   : 1,
    gearMod : 2,
    perfMod : 0
  },
  mask : {
    major   : 1,
    minor   : 1,
    gearMod : 1,
    perfMod : 0
  },
  kneepads : {
    major   : 1,
    minor   : 3,
    gearMod : 1,
    perfMod : 1
  },
  backpack : {
    major   : 1,
    minor   : 1,
    gearMod : 1,
    perfMod : 2
  },
  gloves : {
    major   : 3,
    minor   : 0,
    gearMod : 0,
    perfMod : 0
  },
  holster : {
    major   : 1,
    minor   : 0,
    gearMod : 0,
    perfMod : 1
  }
};
