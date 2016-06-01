function handleGridChange({ target }) {
  chrome.storage.sync.get('catsnacksPrefs', ({catsnacksPrefs = {}}) => {
    const newPrefs = Object.assign(catsnacksPrefs, { gridLayout: target.checked });
    chrome.storage.sync.set({catsnacksPrefs: newPrefs});
  });
}

chrome.storage.sync.get('catsnacksPrefs', ({catsnacksPrefs = {}}) => {
  const checkbox = document.querySelector('#grid');
  checkbox.checked = !!catsnacksPrefs.gridLayout;

  checkbox.addEventListener('change', handleGridChange);
});
