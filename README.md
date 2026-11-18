# Habit Pixel

Suivi d’habitudes en pixel art. Chaque journée où tu valides **toutes** tes habitudes prolonge ta série et fait grandir ton monde : 7 stades jusqu’à 100 jours, puis un palier de légende tous les 60 jours jusqu’à 1000 jours.

## Fonctionnalités

- **Monde** : ton univers animé (Tout-en-un, Blob, Arbre, Île céleste, Cristal ou Planète), ton niveau, la prochaine surprise et la feuille de route (les étapes futures restent cachées).
- **Habitudes** : coche tes habitudes du jour (ou des 6 jours précédents), série en cours, record et historique sur 16 semaines.
- **Boutique** : teintes, feuillages, sols, fonds, accessoires et compagnons. Chaque vignette montre l’objet porté par ton monde.
- **Missions** : quotidiennes, hebdomadaires, défis et séries, avec pièces et objets exclusifs.
- **Équipement** : équipe ou retire en un tap ce que tu possèdes.
- Écran de célébration à chaque nouveau stade ou palier.
- Mode aperçu (Réglages) pour simuler une série de 0 à 1000 jours sans toucher à tes vraies données.
- Données stockées sur l’appareil (localStorage), export et import JSON.
- Installable en PWA, fonctionne hors ligne.

**Pièces** : +10 par habitude validée, +25 par journée complète, plus les récompenses de missions. Décocher une habitude retire les pièces correspondantes.

## Développement

```bash
npm install
npm run dev      # serveur de développement
npm test         # tests de la logique (séries, pièces, missions)
npm run build    # build de production dans dist/
```

Stack : Vite, React 18, TypeScript. Le pixel art est généré procéduralement dans `src/pixel/engine.js`, repris de la maquette d’origine.

## Déploiement

Le workflow `.github/workflows/deploy.yml` publie l’app sur GitHub Pages à chaque push sur `main`. Il faut activer une fois **Settings → Pages → Source : GitHub Actions** dans le dépôt.
