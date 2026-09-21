document.addEventListener('DOMContentLoaded', () => {
  const toggleClean = document.getElementById('toggleClean');
  const togglePng = document.getElementById('togglePng');

  chrome.storage?.sync?.get(['cleanWatermark', 'losslessPng'], (items) => {
    if (items.cleanWatermark !== undefined) toggleClean.checked = items.cleanWatermark;
    if (items.losslessPng !== undefined) togglePng.checked = items.losslessPng;
  });

  toggleClean.addEventListener('change', () => {
    chrome.storage?.sync?.set({ cleanWatermark: toggleClean.checked });
  });

  togglePng.addEventListener('change', () => {
    chrome.storage?.sync?.set({ losslessPng: togglePng.checked });
  });
});
