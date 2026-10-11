# Contributing to FFXIV Interactive Eureka Maps

## Bug Reports and Feature Requests

Please use the [Issues](../../issues) page for all bug reports and feature requests. Include as much detail as possible - screenshots are helpful for visual bugs.

## Code Contributions

1. Fork the repository and create a branch from `master`.
2. Make your changes. See [README.md](README.md) for how to run the project locally.
3. Open a pull request with a clear description of what was changed and why. Reference the relevant issue if one exists.

## Map Data Contributions

The easiest way to contribute is by keeping map data accurate and up to date. Each zone has a built-in editor you can use directly in the browser - no coding required.

### How to contribute map data

1. Open the editor for the zone you want to update:
   - [Anemos Editor](https://www.ffxiv-interactive-eureka-maps.com/map/anemos/edit)
   - [Pagos Editor](https://www.ffxiv-interactive-eureka-maps.com/map/pagos/edit)
   - [Pyros Editor](https://www.ffxiv-interactive-eureka-maps.com/map/pyros/edit)
   - [Hydatos Editor](https://www.ffxiv-interactive-eureka-maps.com/map/hydatos/edit)
   - [Bozjan Southern Front Editor](https://www.ffxiv-interactive-eureka-maps.com/map/bozjansouthernfront/edit)
   - [Zadnor Editor](https://www.ffxiv-interactive-eureka-maps.com/map/zadnor/edit)
   - [South Horn Editor](https://www.ffxiv-interactive-eureka-maps.com/map/south_horn/edit)
   - [North Horn Editor](https://www.ffxiv-interactive-eureka-maps.com/map/north_horn/edit)

2. Make your changes using the editor. You can add, edit, or reposition items on the map.

3. When you're done, click **Save** to download the updated JSON file.

   Save checks every item before it writes anything. If there is an issue, nothing downloads and the editor lists what is wrong.

4. Fork this repository and replace the zone's file with your updated one. The download is named after its zone (`anemos.json`), and the file it replaces is `data/zones/anemos/zone.json`, so rename it to `zone.json` and put it in that zone's folder.

5. Open a pull request with a description of what was changed (e.g. "Updated spawn position for X", "Added missing NM fate Y").

The JSON files live in:

```
data/zones/
  anemos/zone.json
  pagos/zone.json
  pyros/zone.json
  hydatos/zone.json
  bozjansouthernfront/zone.json
  zadnor/zone.json
  south_horn/zone.json
  north_horn/zone.json
```

Each file holds items and nothing else. What a section is called, what type it is, what order it draws in and which icon it uses live in `zones/`, so adding a zone means adding a module there rather than copying a template file.

### The `schemaVersion` line

Each of those files opens with a `"schemaVersion"` line. It records the shape the file was written against, and the editor fills it in for you every time you Save. Leave it alone: don't delete it, and don't change its number by hand.

If a pull request is rejected because the version is out of date, the data format changed after you downloaded your copy. Open the zone's editor again, redo your change there, and download a fresh file.

## Translations

The site is available in English, Japanese (`ja`), German (`de`) and French (`fr`), the languages the game itself supports. Translations are contributed like any other change: edit the file and open a pull request. Text that has not been translated yet is shown in English.

Please avoid submitting machine translations as they are. The aim is to use the words players actually use when talking about the game.

Text is kept in three places, depending on where it comes from.

### Names from the game

The names of enemies, bosses, FATEs, aethernet and everything else placed on the map are in each zone's `entities.json`, next to its `zone.json` (for example `data/zones/anemos/entities.json`). Drop names are in `data/drops.json`.

These names come directly from the game, in every language. If one is missing, including one the editor does not list, add it to that file in the group it belongs to (`enemies`, `bosses`, `fates` and so on) with only its English name:

```json
{
    "name": {
        "en": "English name here"
    }
}
```

Every new name is checked against the game by hand. Once the change is live on the site, the editor lists it.

### Game terms

Terms such as weather, elements, time of day and enemy families are in `data/terms/`, one file for each kind (`weatherTypes.json`, `elements.json` and so on). Each entry holds every language side by side:

```json
"snow": {
    "en": "Snow",
    "ja": "雪",
    "de": "Schnee",
    "fr": "Neige"
}
```

To add a translation, or to suggest a better one, add or edit the line for your language.

### Site text

Buttons, headings, labels and page descriptions are in `i18n/locales/`, one file for each language (`ja.json`, `de.json`, `fr.json`). `en.json` holds every line. To translate a line, copy it from `en.json` into the same place in your language's file and replace the English. Leave out any line you have not translated rather than leaving it empty, so the English is shown instead.
