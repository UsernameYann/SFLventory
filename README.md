# SFLventory — Sumac's farm

This site is the inventory tracker for Sumac's Sunflower Land farm (ID: 219328).

Live: https://usernameyann.github.io/SFLventory/

### Running Locally

```bash
cd SFLventory
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

### Custom Path Explorer
Query your farm data using JSON paths with wildcard support.

Enter a path using dot notation, with `*` for dynamic keys:
   - `farm.pets.nfts.*.experience` — All pet experience values
   - `farm.inventory.Sunflower` — Total sunflowers
   - `farm.boostsUsedAt.*` — All boost usage timestamps

