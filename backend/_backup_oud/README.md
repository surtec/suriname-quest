# Backup — originele één-tabel + JSON versie

Originele één-tabel + JSON versie. Terugzetten = bestanden weer naar hun oude locatie verplaatsen en in MySQL `DROP DATABASE suriname_quest` + originele `setup.sql` draaien.

## Terugzetten

```powershell
# 1) Bestanden terugplaatsen
git mv backend/_backup_oud/setup.sql    backend/setup.sql
git mv backend/_backup_oud/index.js     backend/index.js
git mv backend/_backup_oud/auth.js      backend/routes/auth.js
git mv backend/_backup_oud/speler.js    backend/routes/speler.js

# 2) Database terugzetten
# (DROPt de nieuwe genormaliseerde tabellen!)
Get-Content backend/setup.sql | mysql -u root -P 2004 -p
```
