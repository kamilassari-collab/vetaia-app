import Link from 'next/link';
import { Logo } from '@/components/Logo';

export const metadata = { title: 'Politique de Confidentialité — VetaIA' };

export default function ConfidentialitePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Newsreader:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F3F0EA; font-family: 'DM Sans', sans-serif; }
        .nav { padding: 18px 40px; background: white; border-bottom: 1px solid #EAE6DC; }
        .page { max-width: 760px; margin: 0 auto; padding: 60px 24px 100px; }
        .badge { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: #0B7A6A; background: rgba(11,122,106,0.08); border-radius: 99px; padding: 4px 12px; margin-bottom: 16px; text-transform: uppercase; }
        h1 { font-family: 'Newsreader', serif; font-size: 36px; font-weight: 400; color: #111D1B; margin-bottom: 8px; }
        .date { font-size: 13px; color: #9B9589; margin-bottom: 48px; }
        h2 { font-size: 16px; font-weight: 600; color: #111D1B; margin: 36px 0 10px; }
        p { font-size: 14.5px; line-height: 1.75; color: #4A5568; margin-bottom: 14px; }
        ul { margin: 10px 0 14px 20px; }
        li { font-size: 14.5px; line-height: 1.75; color: #4A5568; margin-bottom: 6px; }
        a { color: #0B7A6A; text-decoration: none; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0 24px; font-size: 13.5px; }
        th { text-align: left; padding: 10px 14px; background: #F3F0EA; color: #4A5568; font-weight: 600; border: 1px solid #DDD9CF; }
        td { padding: 10px 14px; color: #4A5568; border: 1px solid #DDD9CF; vertical-align: top; line-height: 1.6; }
        hr { border: none; border-top: 1px solid #EAE6DC; margin: 40px 0; }
      `}</style>
      <nav className="nav">
        <Link href="/"><Logo height={28} /></Link>
      </nav>
      <div className="page">
        <div className="badge">Légal</div>
        <h1>Politique de Confidentialité</h1>
        <div className="date">Dernière mise à jour : mai 2026</div>

        <p>VetaIA (ci-après « l'Éditeur ») attache une importance particulière à la protection de vos données personnelles et au respect du Règlement Général sur la Protection des Données (RGPD – UE 2016/679).</p>

        <h2>1. Responsable du traitement</h2>
        <p>Le responsable du traitement est VetaIA, joignable à l'adresse : <a href="mailto:kamil@vetaia.fr">kamil@vetaia.fr</a>.</p>

        <h2>2. Données collectées</h2>
        <p>Nous collectons les données suivantes :</p>

        <table>
          <thead>
            <tr><th>Données</th><th>Finalité</th><th>Base légale</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Prénom, nom, email, nom de clinique</td>
              <td>Création et gestion de votre compte</td>
              <td>Exécution du contrat</td>
            </tr>
            <tr>
              <td>Questions posées à l'assistant IA</td>
              <td>Fourniture du service, amélioration des réponses</td>
              <td>Exécution du contrat</td>
            </tr>
            <tr>
              <td>Données de consultations (comptes-rendus, notes vocales)</td>
              <td>Fourniture du service de génération de rapports</td>
              <td>Exécution du contrat</td>
            </tr>
            <tr>
              <td>Données de navigation (pages visitées, actions)</td>
              <td>Analyse d'usage anonyme pour améliorer le service</td>
              <td>Intérêt légitime / Consentement</td>
            </tr>
          </tbody>
        </table>

        <p><strong>Données médicales animales :</strong> Les données relatives aux animaux (espèce, poids, historique médical) saisies dans le Service sont traitées comme données professionnelles et stockées de manière sécurisée. Elles ne constituent pas des données personnelles au sens du RGPD mais bénéficient des mêmes protections.</p>

        <h2>3. Cookies et traceurs</h2>
        <p>VetaIA utilise des cookies et technologies similaires :</p>

        <table>
          <thead>
            <tr><th>Cookie</th><th>Rôle</th><th>Durée</th><th>Obligatoire</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Session Supabase</td>
              <td>Authentification — maintien de votre connexion</td>
              <td>Session</td>
              <td>Oui</td>
            </tr>
            <tr>
              <td>PostHog</td>
              <td>Analyse d'usage anonyme (pages visitées, fonctionnalités utilisées). Aucune donnée vendue ou partagée à des tiers.</td>
              <td>1 an</td>
              <td>Non (avec consentement)</td>
            </tr>
          </tbody>
        </table>

        <p>Vous pouvez refuser les cookies d'analyse lors de votre première visite ou à tout moment en nous contactant. Les cookies d'authentification sont nécessaires au fonctionnement du Service et ne peuvent être désactivés.</p>

        <h2>4. Sous-traitants et transferts de données</h2>
        <p>Vos données sont traitées par les sous-traitants suivants, tous conformes au RGPD :</p>
        <ul>
          <li><strong>Supabase</strong> (base de données et authentification) — serveurs UE</li>
          <li><strong>Vercel</strong> (hébergement de l'application) — serveurs UE</li>
          <li><strong>OpenAI</strong> (traitement des questions par l'IA) — serveurs US, encadré par les clauses contractuelles types UE</li>
          <li><strong>PostHog</strong> (analytics) — serveurs UE</li>
        </ul>
        <p>Aucune donnée n'est vendue à des tiers. Les données transmises à OpenAI ne sont pas utilisées pour entraîner leurs modèles (opt-out activé).</p>

        <h2>5. Durée de conservation</h2>
        <ul>
          <li>Données de compte : conservées pendant la durée d'utilisation du Service + 3 ans après suppression du compte</li>
          <li>Historiques de consultations : conservés pendant la durée d'utilisation du compte</li>
          <li>Données d'analyse : anonymisées après 12 mois</li>
        </ul>

        <h2>6. Vos droits</h2>
        <p>Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :</p>
        <ul>
          <li><strong>Droit d'accès</strong> : obtenir une copie de vos données</li>
          <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
          <li><strong>Droit à l'effacement</strong> : demander la suppression de vos données</li>
          <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
          <li><strong>Droit d'opposition</strong> : vous opposer à certains traitements</li>
        </ul>
        <p>Pour exercer vos droits : <a href="mailto:kamil@vetaia.fr">kamil@vetaia.fr</a>. Nous répondrons dans un délai de 30 jours. Vous pouvez également adresser une réclamation à la <a href="https://www.cnil.fr" target="_blank" rel="noopener">CNIL</a>.</p>

        <h2>7. Sécurité</h2>
        <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement des communications (HTTPS/TLS), authentification sécurisée, accès restreint aux données. En cas de violation de données susceptible d'engendrer un risque pour vos droits et libertés, nous vous en informerons dans les délais légaux.</p>

        <h2>8. Contact</h2>
        <p>Pour toute question relative à cette politique : <a href="mailto:kamil@vetaia.fr">kamil@vetaia.fr</a></p>

        <hr />
        <p style={{ fontSize: 13, color: '#B5AFA6' }}>Voir aussi nos <Link href="/cgu">Conditions Générales d'Utilisation</Link>.</p>
      </div>
    </>
  );
}
