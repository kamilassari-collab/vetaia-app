import Link from 'next/link';
import { Logo } from '@/components/Logo';

export const metadata = { title: "Conditions Générales d'Utilisation — VetaIA" };

export default function CGUPage() {
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
        .warning { background: #FFF8E6; border: 1px solid #F0D070; border-radius: 10px; padding: 16px 20px; margin: 24px 0; }
        .warning p { color: #7A5800; margin: 0; font-size: 13.5px; }
        hr { border: none; border-top: 1px solid #EAE6DC; margin: 40px 0; }
      `}</style>
      <nav className="nav">
        <Link href="/"><Logo height={28} /></Link>
      </nav>
      <div className="page">
        <div className="badge">Légal</div>
        <h1>Conditions Générales d'Utilisation</h1>
        <div className="date">Dernière mise à jour : mai 2026</div>

        <div className="warning">
          <p>⚠️ VetaIA est un outil d'aide à la décision clinique réservé aux vétérinaires diplômés. Il ne remplace en aucun cas le jugement professionnel du praticien.</p>
        </div>

        <h2>1. Présentation du service</h2>
        <p>VetaIA est une plateforme en ligne proposant un assistant d'intelligence artificielle destiné aux professionnels de la santé animale (ci-après « le Service »). Le Service est exploité sous la marque VetaIA (ci-après « l'Éditeur »).</p>
        <p>Le Service est accessible à l'adresse <strong>vetaia.fr</strong> et propose notamment :</p>
        <ul>
          <li>Un assistant IA pour répondre aux questions cliniques vétérinaires</li>
          <li>La génération automatique de comptes-rendus de consultation</li>
          <li>La transcription vocale de consultations</li>
          <li>La gestion de dossiers patients</li>
        </ul>

        <h2>2. Conditions d'accès</h2>
        <p>L'accès au Service est réservé aux vétérinaires diplômés et aux professionnels de santé animale habilités à exercer. En créant un compte, l'utilisateur déclare sur l'honneur être titulaire d'un diplôme vétérinaire ou d'une qualification professionnelle équivalente.</p>
        <p>L'Éditeur se réserve le droit de suspendre ou de supprimer tout compte ne respectant pas cette condition.</p>

        <h2>3. Inscription et compte utilisateur</h2>
        <p>Pour accéder aux fonctionnalités du Service, l'utilisateur doit créer un compte en fournissant des informations exactes et à jour. L'utilisateur est responsable de la confidentialité de ses identifiants de connexion et de toute activité effectuée depuis son compte.</p>
        <p>L'utilisateur s'engage à informer immédiatement l'Éditeur de toute utilisation non autorisée de son compte à l'adresse : <a href="mailto:kamil@vetaia.fr">kamil@vetaia.fr</a>.</p>

        <h2>4. Avertissement médical et limites du Service</h2>
        <div className="warning">
          <p>Les réponses générées par VetaIA sont fournies à titre informatif et d'aide à la décision uniquement. Elles ne constituent pas un avis médical vétérinaire au sens légal et ne sauraient se substituer à l'examen clinique du praticien, à son diagnostic et à son jugement professionnel. L'Éditeur décline toute responsabilité en cas de préjudice résultant d'une décision clinique prise sur la seule base des réponses de l'assistant.</p>
        </div>
        <p>Les informations produites par l'assistant IA peuvent contenir des erreurs ou être incomplètes. Le vétérinaire utilisateur reste seul responsable des actes médicaux pratiqués.</p>

        <h2>5. Utilisation du Service</h2>
        <p>L'utilisateur s'engage à utiliser le Service conformément à la législation en vigueur et aux présentes CGU. Il est notamment interdit de :</p>
        <ul>
          <li>Partager ses identifiants de connexion avec des tiers</li>
          <li>Utiliser le Service à des fins non professionnelles ou frauduleuses</li>
          <li>Tenter de contourner les mesures de sécurité du Service</li>
          <li>Reproduire, copier ou revendre tout ou partie du Service</li>
        </ul>

        <h2>6. Données personnelles et confidentialité</h2>
        <p>La collecte et le traitement des données personnelles sont régis par notre <Link href="/confidentialite">Politique de Confidentialité</Link>, qui fait partie intégrante des présentes CGU.</p>
        <p>Les données médicales relatives aux animaux saisies dans le Service (comptes-rendus, historiques patients) sont stockées de manière sécurisée sur des serveurs situés en Europe. L'utilisateur conserve la propriété de ses données et peut en demander la suppression à tout moment.</p>

        <h2>7. Service en version bêta</h2>
        <p>VetaIA est actuellement proposé en version bêta. L'accès est gratuit pendant cette phase. L'Éditeur se réserve le droit de modifier les conditions d'accès, d'introduire une tarification ou de faire évoluer les fonctionnalités à tout moment, après notification préalable des utilisateurs par email.</p>

        <h2>8. Disponibilité du Service</h2>
        <p>L'Éditeur s'efforce d'assurer la disponibilité du Service 24h/24 et 7j/7, sans toutefois pouvoir le garantir. Des interruptions pour maintenance ou pour des raisons techniques peuvent survenir sans préavis. L'Éditeur ne saurait être tenu responsable des conséquences d'une indisponibilité du Service.</p>

        <h2>9. Propriété intellectuelle</h2>
        <p>L'ensemble des éléments constituant le Service (interface, algorithmes, marque VetaIA, contenus) est la propriété exclusive de l'Éditeur. Toute reproduction, représentation ou exploitation non autorisée est interdite.</p>

        <h2>10. Modification des CGU</h2>
        <p>L'Éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par email au moins 15 jours avant l'entrée en vigueur de toute modification substantielle. La poursuite de l'utilisation du Service après notification vaut acceptation des nouvelles conditions.</p>

        <h2>11. Contact</h2>
        <p>Pour toute question relative aux présentes CGU : <a href="mailto:kamil@vetaia.fr">kamil@vetaia.fr</a></p>

        <hr />
        <p style={{ fontSize: 13, color: '#B5AFA6' }}>Ces CGU sont régies par le droit français. Tout litige sera soumis à la compétence exclusive des tribunaux français.</p>
      </div>
    </>
  );
}
