import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatDecimal } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const COOLDOWN_REDUCTION_MS = 1500;

class CrusadersMight extends Module {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  effectiveHolyShockReductionMs = 0;
  wastedHolyShockReductionMs = 0;
  effectiveLightOfDawnReductionMs = 0;
  wastedLightOfDawnReductionMs = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.CRUSADERS_MIGHT_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.CRUSADER_STRIKE.id) {
      return;
    }

    const holyShockisOnCooldown = this.spellUsable.isOnCooldown(SPELLS.HOLY_SHOCK_CAST.id);
    if (holyShockisOnCooldown) {
      const reductionMs = this.spellUsable.reduceCooldown(SPELLS.HOLY_SHOCK_CAST.id, COOLDOWN_REDUCTION_MS);
      this.effectiveHolyShockReductionMs += reductionMs;
      this.wastedHolyShockReductionMs += COOLDOWN_REDUCTION_MS - reductionMs;
    } else {
      const wastedReductionMs = COOLDOWN_REDUCTION_MS;
      this.wastedHolyShockReductionMs += wastedReductionMs;
    }
    const lightOfDawnisOnCooldown = this.spellUsable.isOnCooldown(SPELLS.LIGHT_OF_DAWN_CAST.id);
    if (lightOfDawnisOnCooldown) {
      const reductionMs = this.spellUsable.reduceCooldown(SPELLS.LIGHT_OF_DAWN_CAST.id, COOLDOWN_REDUCTION_MS);
      this.effectiveLightOfDawnReductionMs += reductionMs;
      this.wastedLightOfDawnReductionMs += COOLDOWN_REDUCTION_MS - reductionMs;
    } else {
      const wastedReductionMs = COOLDOWN_REDUCTION_MS;
      this.wastedLightOfDawnReductionMs += wastedReductionMs;
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CRUSADERS_MIGHT_TALENT.id} />}
        value={(
          <span style={{ fontSize: '75%' }}>
            {formatDecimal(this.effectiveHolyShockReductionMs / 1000, 1)}s{' '}
            <SpellIcon
              id={SPELLS.HOLY_SHOCK_CAST.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
            {' '}
            {formatDecimal(this.effectiveLightOfDawnReductionMs / 1000, 1)}s{' '}
            <SpellIcon
              id={SPELLS.LIGHT_OF_DAWN_CAST.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
          </span>
        )}
        label="Cooldown reduction"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(75);
}

export default CrusadersMight;