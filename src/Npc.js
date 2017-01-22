'use strict';

const Character = require('./Character');
const uuid = require('node-uuid');
const util = require('util');

/**
 * @property {number} id   Area-relative id (vnum)
 * @property {Area}   area Area npc belongs to (not necessarily the area they're currently in)
 * @property {
 */
class Npc extends Character {
  constructor(area, data) {
    super(data);
    const validate = ['keywords', 'name', 'id'];

    for (const prop of validate) {
      if (!(prop in data)) {
        throw new ReferenceError(`NPC in area [${area.name}] missing required property [${prop}]`)
      }
    }

    this.defaultItems = data.items || [];
    this.defaultEquipment = data.equipment || [];
    this.behaviors = data.behaviors || [];
    this.area = data.area;
    this.keywords = data.keywords;
    this.description = data.description;
    this.id = data.id;
    this.uuid = data.uuid || uuid.v4();
  }

  hydrate(state) {
    super.hydrate(state);

    this.defaultItems.forEach(defaultItemId => {
      if (parseInt(defaultItemId, 10)) {
        defaultItemId = this.area.name + ':' + defaultItemId;
      }

      util.log(`\tDIST: Adding item [${defaultItemId}] to npc [${this.name}]`);
      const newItem = state.ItemFactory.create(this.area, defaultItemId);
      newItem.hydrate(state);
      state.ItemManager.add(newItem);
      this.addItem(newItem);
    });

    this.behaviors && this.behaviors.forEach(behaviorName => {
      let behavior = state.MobBehaviorManager.get(behaviorName);
      if (!behavior) {
        return;
      }

      behavior.attach(this);
    });
  }
}

module.exports = Npc;