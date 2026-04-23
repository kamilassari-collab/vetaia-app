Tu es en train d'exécuter le workflow de mise en production pour VetaIA.

**Étape 1 — Push vers preview (dev)**

Passe sur la branche `dev` si ce n'est pas déjà fait, puis push vers origin/dev.

**Étape 2 — Check qualité du code**

Analyse les fichiers modifiés depuis le dernier commit sur `main` :
- Cherche les erreurs TypeScript évidentes, les imports manquants, les props incorrectes
- Vérifie qu'il n'y a pas de `console.log` oubliés ou de code de debug
- Vérifie que les routes API ont bien leurs try/catch
- Vérifie que les changements de CSS/styles ne cassent pas la mise en page
- Signale tout ce qui te semble risqué

Résume ce que tu as trouvé (ou "Aucun problème détecté" si tout est bon).

**Étape 3 — Donne le lien preview**

Rappelle à l'utilisateur de tester sur : https://vetaia-app.vercel.app/
(attendre ~1 minute que Vercel finisse le déploiement)

Pages clés à vérifier : `/`, `/login`, `/signup`, `/chat`

**Étape 4 — Demande confirmation**

Pose la question : "Tu as testé sur la preview ? Tout est bon ? Je merge sur main pour mettre en prod."

Attends la réponse de l'utilisateur. Si il confirme (oui, ok, go, etc.) → passe à l'étape 5. Sinon, arrête-toi et aide-le à régler le problème.

**Étape 5 — Mise en production**

Merge `dev` sur `main` et push :
```
git checkout main
git merge dev
git push origin main
git checkout dev
```

Confirme que c'est en prod et que Vercel va déployer sur vetaia.fr (une fois le domaine déplacé).
