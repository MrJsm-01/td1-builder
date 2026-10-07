/* global LZString */

import { BUILD_VERSION } from './constants.js';
import { STRINGS } from './strings.js';
import { BUILD } from './state.js';
import { openModal } from './modal.js';
import { selectLoadoutName } from './name.js';
import { selectWeapon, selectWeaponTalent, selectWeaponMod, setWeaponScore, GEAR_SCORE } from './weapons.js';
import { selectGear, renderGearStats, selectGearTalent, selectGearAttr, selectGearModType, selectGearModBonus, selectPerfMod } from './gear.js';
import { selectSkill } from './skills.js';
import { selectPlayerTalent } from './talents.js';

const WEAPON_SLOTS = ['primary', 'secondary', 'handgun'];
const GEAR_SLOTS = ['chest', 'mask', 'kneepads', 'backpack', 'gloves', 'holster'];
const SKILL_SLOTS = ['skill1', 'skill2', 'skillUlt'];
const PL_TALENT_SLOTS = ['talent1', 'talent2', 'talent3', 'talent4'];

let isLoadingFromUrl = false;

function compactArray(arr) {
  const PAIRS = [];

  if (Array.isArray(arr)) {
    arr.forEach((value, index) => {
      if (value !== null && value !== undefined) {
        PAIRS.push([index, value]);
      }
    });
  }

  return PAIRS;
}

function serializeWeaponSlot(slot) {
  const WEAPON_STATE = BUILD[slot];

  if (!WEAPON_STATE) return null;

  const MOD_ENTRIES = {};

  if (WEAPON_STATE.mods) {
    Object.keys(WEAPON_STATE.mods).forEach(modSlot => {
      const PAIRS = compactArray(WEAPON_STATE.mods[modSlot]);

      if (PAIRS.length) {
        MOD_ENTRIES[modSlot] = PAIRS;
      }
    });
  }

  const PAYLOAD = {
    id: WEAPON_STATE.weaponId,
    t: compactArray(WEAPON_STATE.talents),
    m: MOD_ENTRIES
  };

  if (WEAPON_STATE.gs !== GEAR_SCORE[0]) {
    PAYLOAD.gs = WEAPON_STATE.gs;
  }

  return PAYLOAD;
}

function serializeGearSlot(slot) {
  const GEAR_STATE = BUILD[slot];

  if (!GEAR_STATE) return null;

  const PAYLOAD = {
    id: GEAR_STATE.itemId
  };

  if (GEAR_STATE.stat !== null) {
    PAYLOAD.s = GEAR_STATE.stat;
  }

  if (
    GEAR_STATE.talentLocked === false &&
    GEAR_STATE.talent !== null
  ) {
    PAYLOAD.t = GEAR_STATE.talent;
  }

  const MAJOR_PAIRS = compactArray(GEAR_STATE.majorAttrs);

  if (MAJOR_PAIRS.length) {
    PAYLOAD.ma = MAJOR_PAIRS;
  }

  const MINOR_PAIRS = compactArray(GEAR_STATE.minorAttrs);

  if (MINOR_PAIRS.length) {
    PAYLOAD.mi = MINOR_PAIRS;
  }

  const GEAR_MOD_PAIRS = [];

  if (Array.isArray(GEAR_STATE.gearMods)) {
    GEAR_STATE.gearMods.forEach((mod, index) => {
      if (
        mod &&
        mod.type !== null &&
        mod.type !== undefined
      ) {
        GEAR_MOD_PAIRS.push([
          index,
          mod.type,
          mod.bonus
        ]);
      }
    });
  }

  if (GEAR_MOD_PAIRS.length) {
    PAYLOAD.gm = GEAR_MOD_PAIRS;
  }

  const PERF_PAIRS = compactArray(GEAR_STATE.perfMods);

  if (PERF_PAIRS.length) {
    PAYLOAD.pm = PERF_PAIRS;
  }

  return PAYLOAD;
}

function serializeBuild() {
  const PAYLOAD = {
    v: BUILD_VERSION
  };

  if (BUILD.name !== null) {
    PAYLOAD.n = BUILD.name;
  }

  const WEAPONS = {};

  WEAPON_SLOTS.forEach(slot => {
    const DATA = serializeWeaponSlot(slot);

    if (DATA !== null) {
      WEAPONS[slot] = DATA;
    }
  });

  if (Object.keys(WEAPONS).length) {
    PAYLOAD.w = WEAPONS;
  }

  const GEAR = {};

  GEAR_SLOTS.forEach(slot => {
    const DATA = serializeGearSlot(slot);

    if (DATA !== null) {
      GEAR[slot] = DATA;
    }
  });

  if (Object.keys(GEAR).length) {
    PAYLOAD.g = GEAR;
  }

  const SKILLS = {};

  SKILL_SLOTS.forEach(slot => {
    if (
      BUILD[slot] !== null &&
      BUILD[slot] !== undefined
    ) {
      SKILLS[slot] = BUILD[slot];
    }
  });

  if (Object.keys(SKILLS).length) {
    PAYLOAD.sk = SKILLS;
  }

  const TALENTS = {};

  PL_TALENT_SLOTS.forEach(slot => {
    if (
      BUILD[slot] !== null &&
      BUILD[slot] !== undefined
    ) {
      TALENTS[slot] = BUILD[slot];
    }
  });

  if (Object.keys(TALENTS).length) {
    PAYLOAD.pt = TALENTS;
  }

  const JSON_STRING = JSON.stringify(PAYLOAD);

  return LZString.compressToEncodedURIComponent(JSON_STRING);
}

function generateShareUrl() {
  const ENCODED = serializeBuild();
  const SHARE_URL = new URL(window.location.href);

  SHARE_URL.hash = ENCODED;

  return SHARE_URL.toString();
}

export function updateAddressBar() {
  if (isLoadingFromUrl) return;

  const ENCODED = serializeBuild();

  history.replaceState(
    null,
    '',
    `#${ENCODED}`
  );
}

function applyWeaponSlot(slot, data) {
  try {
    if (!data || !data.id) return;

    selectWeapon(slot, data.id);

    if (Array.isArray(data.t)) {
      data.t.forEach(([index, talentId]) => {
        if (
          talentId !== undefined &&
          talentId !== null
        ) {
          selectWeaponTalent(
            slot,
            index,
            talentId
          );
        }
      });
    }

    if (
      data.m &&
      typeof data.m === 'object'
    ) {
      Object.keys(data.m).forEach(modSlot => {
        if (Array.isArray(data.m[modSlot])) {
          data.m[modSlot].forEach(
            ([index, modId]) => {
              if (
                modId !== undefined &&
                modId !== null
              ) {
                selectWeaponMod(
                  slot,
                  modSlot,
                  index,
                  modId
                );
              }
            }
          );
        }
      });
    }

    if (data.gs) {
      setWeaponScore(slot, data.gs);
    }

  } catch (err) {
    console.warn(
      `Error applying weapon slot ${slot}:`,
      err
    );
  }
}

function applyGearSlot(slot, data) {
  try {
    if (!data || !data.id) return;

    selectGear(slot, data.id);

    if (
      data.s !== undefined &&
      data.s !== null
    ) {
      const RADIO = document.querySelector(
        `input[name="${slot}-stat"][value="${data.s}"]`
      );

      if (RADIO) {
        RADIO.checked = true;
      }

      if (BUILD[slot]) {
        BUILD[slot].stat = data.s;
      }
    }

    if (data.t) {
      selectGearTalent(slot, data.t);
    }

    if (Array.isArray(data.ma)) {
      data.ma.forEach(
        ([index, attrId]) => {
          selectGearAttr(
            slot,
            'major',
            index,
            attrId
          );
        }
      );
    }

    if (Array.isArray(data.mi)) {
      data.mi.forEach(
        ([index, attrId]) => {
          selectGearAttr(
            slot,
            'minor',
            index,
            attrId
          );
        }
      );
    }

    if (Array.isArray(data.gm)) {
      data.gm.forEach(
        ([index, modId, bonusId]) => {
          selectGearModType(
            slot,
            index,
            modId
          );

          if (
            bonusId !== null &&
            bonusId !== undefined
          ) {
            selectGearModBonus(
              slot,
              index,
              bonusId
            );
          }
        }
      );
    }

    if (Array.isArray(data.pm)) {
      data.pm.forEach(
        ([index, bonusId]) => {
          selectPerfMod(
            slot,
            index,
            bonusId
          );
        }
      );
    }

  } catch (err) {
    console.warn(
      `Error applying gear slot ${slot}:`,
      err
    );
  }
}

function applyBuildData(payload) {
  if (!payload) return;

  if (payload.v !== BUILD_VERSION) {
    openModal(`
      <div class="title-container error">
        <div class="icon-container">
          <svg viewBox="0 0 24 24" class="icon exclamation" aria-hidden="true">
            <path d="M11 4h2v11h-2zm2 14v2h-2v-2z"/>
          </svg>
        </div>

        <div class="title">
          ${STRINGS.error.version}
        </div>
      </div>

      <div class="content">
        <p>
          The shared build link contains outdated data.
        </p>

        <p>
          The default build has been loaded instead.
        </p>
      </div>
    `, STRINGS.error.version);

    return;
  }

  if (payload.n !== undefined) {
    selectLoadoutName(payload.n);
  }

  if (payload.w) {
    Object.keys(payload.w).forEach(slot => {
      applyWeaponSlot(
        slot,
        payload.w[slot]
      );
    });
  }

  if (payload.g) {
    Object.keys(payload.g).forEach(slot => {
      applyGearSlot(
        slot,
        payload.g[slot]
      );
    });
  }

  if (payload.sk) {
    Object.keys(payload.sk).forEach(slot => {
      try {
        selectSkill(
          slot,
          payload.sk[slot]
        );
      } catch (e) {}
    });
  }

  if (payload.pt) {
    Object.keys(payload.pt).forEach(slot => {
      try {
        selectPlayerTalent(
          slot,
          payload.pt[slot]
        );
      } catch (e) {}
    });
  }

  try {
    renderGearStats();
  } catch (e) {
    console.warn(
      'Error rendering gear stats:',
      e
    );
  }
}

export function loadBuildFromUrl() {
  const HASH = window.location.hash.slice(1);

  if (!HASH) return;

  try {
    const JSON_STRING =
      LZString.decompressFromEncodedURIComponent(
        HASH
      );

    if (!JSON_STRING) return;

    const PAYLOAD =
      JSON.parse(JSON_STRING);

    isLoadingFromUrl = true;

    applyBuildData(PAYLOAD);

    isLoadingFromUrl = false;

  } catch (error) {
    console.error(
      'Failed to load build from URL:',
      error
    );

    isLoadingFromUrl = false;
  }
}


/* =========================================================
   URL SHORTENER
   ========================================================= */

function shortenWithJsonp(
  service,
  longUrl,
  timeoutMs
) {
  return new Promise((resolve, reject) => {

    const callbackName =
      `td1Shortener_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}`;

    const scriptId =
      `${callbackName}_script`;

    let finished = false;

    const cleanup = () => {
      const scriptEl =
        document.getElementById(scriptId);

      if (scriptEl) {
        scriptEl.remove();
      }

      try {
        delete window[callbackName];
      } catch (e) {
        window[callbackName] = undefined;
      }
    };

    const finishSuccess = shortUrl => {
      if (finished) return;

      finished = true;

      clearTimeout(timeoutId);
      cleanup();

      resolve(shortUrl);
    };

    const finishError = error => {
      if (finished) return;

      finished = true;

      clearTimeout(timeoutId);
      cleanup();

      reject(error);
    };

    window[callbackName] = data => {

      console.log(
        `[TD1 Builder] ${service} response:`,
        data
      );

      if (
        data &&
        typeof data.shorturl === 'string' &&
        data.shorturl.length > 0
      ) {
        finishSuccess(data.shorturl);
        return;
      }

      if (
        data &&
        data.errorcode !== undefined
      ) {
        finishError(
          new Error(
            `${service} API 오류 ` +
            `(code ${data.errorcode}): ` +
            `${data.errormessage || '알 수 없는 오류'}`
          )
        );

        return;
      }

      finishError(
        new Error(
          `${service}에서 예상하지 못한 응답을 반환했습니다.`
        )
      );
    };

    const timeoutId = setTimeout(() => {

      finishError(
        new Error(
          `${service} API 응답 시간 초과 (${timeoutMs / 1000}초)`
        )
      );

    }, timeoutMs);

    const script =
      document.createElement('script');

    script.id = scriptId;

    script.async = true;

    const encodedUrl =
      encodeURIComponent(longUrl);

    script.src =
      `https://${service}/create.php` +
      `?format=json` +
      `&callback=${encodeURIComponent(callbackName)}` +
      `&url=${encodedUrl}`;

    console.log(
      `[TD1 Builder] ${service} 요청:`,
      script.src
    );

    script.onerror = () => {

      finishError(
        new Error(
          `${service} JSONP 스크립트를 불러오지 못했습니다.`
        )
      );

    };

    document.head.appendChild(script);
  });
}


async function shortenUrl(longUrl) {

  /*
   * 1차: is.gd
   */
  try {

    console.log(
      '[TD1 Builder] is.gd 단축 URL 생성 시도'
    );

    const shortUrl =
      await shortenWithJsonp(
        'is.gd',
        longUrl,
        10000
      );

    console.log(
      '[TD1 Builder] is.gd 성공:',
      shortUrl
    );

    return shortUrl;

  } catch (error) {

    console.warn(
      '[TD1 Builder] is.gd 실패:',
      error
    );
  }


  /*
   * 2차: v.gd
   *
   * is.gd와 동일한 API를 제공하는
   * 대체 서비스입니다.
   */
  try {

    console.log(
      '[TD1 Builder] v.gd 단축 URL 생성 시도'
    );

    const shortUrl =
      await shortenWithJsonp(
        'v.gd',
        longUrl,
        10000
      );

    console.log(
      '[TD1 Builder] v.gd 성공:',
      shortUrl
    );

    return shortUrl;

  } catch (error) {

    console.warn(
      '[TD1 Builder] v.gd 실패:',
      error
    );
  }


  /*
   * 두 서비스 모두 실패
   */
  throw new Error(
    'URL 단축 서비스에 연결하지 못했습니다.'
  );
}


export function openShareModal() {

  const LONG_URL =
    generateShareUrl();

  openModal(`
    <div class="title-container share">

      <div class="icon-container">
        <svg
          viewBox="0 0 24 24"
          class="icon exclamation"
          aria-hidden="true"
        >
          <path d="M11 4h2v11h-2zm2 14v2h-2v-2z"/>
        </svg>
      </div>

      <div class="title">
        ${STRINGS.help.share}
      </div>

    </div>

    <div class="content">

      <div class="help">
        ${STRINGS.help.clipboard.copy}
      </div>

      <input
        type="text"
        id="share-url"
        value="단축 링크 생성 중..."
        readonly
      />

    </div>
  `, STRINGS.help.share);


  const inputEl =
    document.getElementById(
      'share-url'
    );


  /*
   * 단축 URL 생성
   */
  shortenUrl(LONG_URL)

    .then(shortUrl => {

      console.log(
        '[TD1 Builder] 최종 단축 URL:',
        shortUrl
      );

      if (inputEl) {

        inputEl.value =
          shortUrl;

        if (inputEl.select) {
          inputEl.select();
        }
      }

    })

    .catch(error => {

      console.error(
        '[TD1 Builder] URL 단축 최종 실패:',
        error
      );

      if (inputEl) {

        inputEl.value =
          LONG_URL;

        if (inputEl.select) {
          inputEl.select();
        }
      }

    });
}
