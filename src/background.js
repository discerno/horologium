/*
 * Copyright (c) Stanislav Panin
**/

'use strict';

let intervals = [];
let trackTab = async () => {
  intervals.forEach(interval => clearInterval(interval));
  intervals = [];
  let activeTabs = await browser.tabs.query({ active: true, currentWindow: true });
  let site = activeTabs[0]
    .url
    .replace(/http(s)?:\/\/(www\.)?/, '')
    .replace(/(\/|\?).*$/, '');
  let date;

  let countTime = async () => {
    let sites = (await browser.storage.local.get('sites'))['sites'] || {};
    let today = (new Date()).getDate();
    if (today !== date) {
      await browser.storage.local.set({ 'date': today });
      for (let s in sites) sites[s]['time'] = 0;
      await browser.storage.local.set({ 'sites': sites });
    }
    else if (sites[site]) {
      ++sites[site]['time'];
      await browser.storage.local.set({ 'sites': sites });
    }
  }

  let start = async () => {
    date = (await browser.storage.local.get('date'))['date'];
    if (!date) {
      date = (new Date()).getDate();
      await browser.storage.local.set({ 'date': date });
    }
    intervals.forEach(interval => clearInterval(interval));
    intervals = [];
    intervals.push(setInterval(countTime, 1000));
  }

  let sites = (await browser.storage.local.get('sites'))['sites'] || {};
  if (site in sites) start();
}

browser.tabs.onUpdated.addListener(trackTab);
