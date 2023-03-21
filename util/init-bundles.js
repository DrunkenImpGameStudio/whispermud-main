#!/usr/bin/env node
'use strict';

const cp = require('child_process');
const fs = require('fs');
const os = require('os');
const readline = require('readline');

const gitRoot = cp.execSync('git rev-parse --show-toplevel').toString('utf8').trim();
process.chdir(gitRoot);

async function prompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve, reject) => {
    rl.question('Do you want to install the bundles? [Y/n] ', resolve);
  });
}

async function main() {

  try {
    let answer = await prompt();

    if (answer === 'n') {
      throw 'foo';
    }
  } catch (err) {
    console.log('Done.');
    process.exit(0);
  }

  const githubPath = 'https://github.com/DrunkenImpGameStudio/';
  const defaultBundles = [
    'https://github.com/DrunkenImpGameStudio/whispermud-areas',
    'https://github.com/DrunkenImpGameStudio/whispermud-channels',
    'https://github.com/DrunkenImpGameStudio/whispermud-classes',
    'https://github.com/DrunkenImpGameStudio/whispermud-combat',
    'https://github.com/DrunkenImpGameStudio/whispermud-commands',
    'https://github.com/DrunkenImpGameStudio/whispermud-debug',
    'https://github.com/DrunkenImpGameStudio/whispermud-effects',
    'https://github.com/DrunkenImpGameStudio/whispermud-input',
    'https://github.com/DrunkenImpGameStudio/whispermud-lib',
    'https://github.com/DrunkenImpGameStudio/whispermud-npc-behaviors',
    'https://github.com/DrunkenImpGameStudio/whispermud-player-events',
    'https://github.com/DrunkenImpGameStudio/whispermud-quests',
    'https://github.com/DrunkenImpGameStudio/whispermud-crafting',
    'https://github.com/DrunkenImpGameStudio/whispermud-vendors',
    'https://github.com/DrunkenImpGameStudio/whispermud-respawn',
  ];

  const modified = cp.execSync('git status -uno --porcelain').toString();
  if (modified) {
    console.warn('You have uncommitted changes. For safety setup-bundles must be run on a clean repository.');
    process.exit(1);
  }

  // add each bundle as a submodule
  for (const bundle of defaultBundles) {
    const bundlePath = `bundles/${bundle}`;
    cp.execSync(`npm run install-bundle ${bundle}`);
  }
  console.info('Done.');

  console.info('Enabling bundles...');
  const whispermudJsonPath = __dirname + '/../whispermud.json';
  const whispermudJson = require(whispermudJsonPath);
  whispermudJson.bundles = defaultBundles.map(bundle => bundle.replace(/^.+\/([a-z\-]+)$/, '$1'));
  fs.writeFileSync(whispermudJsonPath, JSON.stringify(whispermudJson, null, 2));
  console.info('Done.');

  cp.execSync('git add whispermud.json');

  console.info(`
-------------------------------------------------------------------------------
Bundles have been installed as submodules.

You're all set!
`);

  process.exit(0);
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
