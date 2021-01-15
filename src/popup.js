/*
 * Copyright (c) Stanislav Panin
**/

'use strict';

browser.tabs.query({ active: true, currentWindow: true }).then(async (current) => {
  const stop = [
      "accounts-static.cdn.mozilla.net",
      "accounts.firefox.com",
      "addons.cdn.mozilla.net",
      "addons.mozilla.org",
      "api.accounts.firefox.com",
      "content.cdn.mozilla.net",
      "content.cdn.mozilla.net",
      "discovery.addons.mozilla.org",
      "input.mozilla.org",
      "install.mozilla.org",
      "oauth.accounts.firefox.com",
      "profile.accounts.firefox.com",
      "support.mozilla.org",
      "sync.services.mozilla.com",
      "testpilot.firefox.com"
  ];
  let body = document.querySelector('body');
  let info = document.querySelector('#info');
  let minutes = document.querySelector('#minutes');
  let add = document.querySelector('#add');
  let sliderContainer = document.querySelector('#sliderContainer');
  let slider = document.querySelector('#slider');
  let limitContainer = document.querySelector('#limitContainer');
  let limit = document.querySelector('#limit');

  let colorize = () => {
    if (!(site in sites)) info.style.background = '#ffffff';
    else {
      let colors = [ '#00aa00', '#dd7700', '#dd3333' ];
      info.style.background = colors[Math.min(
        colors.length - 1,
        Math.floor(time / 60 / limitValue)
      )];
    }
  }

  let sites = (await browser.storage.local.get('sites'))['sites'] || {};

  let site = current[0]
    .url
    .replace(/http(s)?:\/\/(www\.)?/, '')
    .replace(/(\/|\?).*$/, '');
  document.querySelector('#site').innerText = site;

  let time = sites[site] ? sites[site]['time'] : 0;

  let limitValue = sites[site] ? sites[site]['limit'] : 60;
  limit.innerText = slider.value = limitValue;
  slider.addEventListener('change', async () => {
    limit.innerText = limitValue = +slider.value;
    if (sites[site]) sites[site]['limit'] = +limitValue;
    await browser.storage.local.set({ 'sites': sites });
    if (site in sites) colorize();
  });

  if (site in sites) {
    minutes.innerText = `${Math.floor(time / 60)}\xa0min.`;
    colorize();
    add.innerText = 'Remove & reload';
  }
  else {
    minutes.innerText = 'n/a';
    sliderContainer.style.display = 'none';
    limitContainer.style.display = 'none';
    add.innerText = 'Add & reload';
  }

  add.addEventListener('click', async () => {
    time = 0;
    if (site in sites) {
      sliderContainer.style.display = 'none';
      limitContainer.style.display = 'none';
      delete sites[site];
      await browser.storage.local.set({ 'sites': sites });
      minutes.innerText = 'n/a';
      add.innerText = 'Add & reload';
      colorize();
      browser.tabs.reload();
    }
    else {
      slider.value = limit.innerText = limitValue = 60;
      sliderContainer.style.display = 'block';
      limitContainer.style.display = 'block';
      sites = { ...sites, [site]: {
        time: 0,
        limit: 60
      } };
      await browser.storage.local.set({ 'sites': sites });
      minutes.innerText = '0 min.';
      add.innerText = 'Remove & reload';
      colorize();
      browser.tabs.reload();
    }
  });

  if (site.slice(0, 6) === 'about:' || stop.includes(site)) {
    add.remove();
  }
});
