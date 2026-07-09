---
# Front Matter
# Do not remove
---

export const GAME_DATA = {
  qualities       : {{ site.data.qualities | jsonify }},
  weapon_types    : {{ site.data.weapon_types | jsonify }},
  weapon_slots    : {{ site.data.weapon_slots | jsonify }},
  weapon_talents  : {{ site.data.weapon_talents | jsonify }},
  weapon_mods     : {{ site.data.weapon_mods | jsonify }},
  weapons         : {{ site.data.weapons | jsonify }},
  weapon_bonus    : {{ site.data.weapon_bonus | jsonify }},
  gear_talents    : {{ site.data.gear_talents | jsonify }},
  gear_attr       : {{ site.data.gear_attr | jsonify }},
  gear_mods       : {{ site.data.gear_mods | jsonify }},
  gear_mods_bonus : {{ site.data.gear_mods_bonus | jsonify }},
  gear_perf_mods  : {{ site.data.gear_perf_mods | jsonify }},
  gear            : {{ site.data.gear | jsonify }},
  gear_bonus      : {{ site.data.gear_bonus | jsonify }},
  wings           : {{ site.data.wings | jsonify }},
  player_talents  : {{ site.data.player_talents | jsonify }},
  skills          : {{ site.data.skills | jsonify }},
  skills_ult      : {{ site.data.skills_ult | jsonify }}
}
