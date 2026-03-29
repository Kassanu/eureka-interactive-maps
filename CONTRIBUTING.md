# Contributing to FFXIV Interactive Eureka Maps

## Bug Reports and Feature Requests

Please use the [Issues](../../issues) page for all bug reports and feature requests. Include as much detail as possible — screenshots are helpful for visual bugs.

## Code Contributions

1. Fork the repository and create a branch from `master`.
2. Make your changes. See [README.md](README.md) for how to run the project locally.
3. Open a pull request with a clear description of what was changed and why. Reference the relevant issue if one exists.

## Map Data Contributions

The easiest way to contribute is by keeping map data accurate and up to date. Each zone has a built-in editor you can use directly in the browser — no coding required.

### How to contribute map data

1. Open the editor for the zone you want to update:
   - [Anemos Editor](https://www.ffxiv-interactive-eureka-maps.com/map/anemos/edit)
   - [Pagos Editor](https://www.ffxiv-interactive-eureka-maps.com/map/pagos/edit)
   - [Pyros Editor](https://www.ffxiv-interactive-eureka-maps.com/map/pyros/edit)
   - [Hydatos Editor](https://www.ffxiv-interactive-eureka-maps.com/map/hydatos/edit)
   - [Bozjan Southern Front Editor](https://www.ffxiv-interactive-eureka-maps.com/map/bozjansouthernfront/edit)

2. Make your changes using the editor. You can add, edit, or reposition items on the map.

3. When you're done, click **Save** to download the updated JSON file.

4. Fork this repository and replace the corresponding JSON file in `assets/data/` with your updated file.

5. Open a pull request with a description of what was changed (e.g. "Updated spawn position for X", "Added missing NM fate Y").

The JSON files live in:

```
assets/data/
  anemos.json
  pagos.json
  pyros.json
  hydatos.json
  bozjansouthernfront.json
```
