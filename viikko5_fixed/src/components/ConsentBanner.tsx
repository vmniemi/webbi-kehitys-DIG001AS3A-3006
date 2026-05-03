function getConsent(): boolean | null {
  const value = localStorage.getItem("consent");

  if (value === null) return null;

  return value === "true";
}

function setConsent(value: boolean) {
  localStorage.setItem("consent", value.toString());
}

export function hasAnalyticsConsent(): boolean {
  return localStorage.getItem("consent") === "true";
}

export function resetAnalyticsConsent() {
  localStorage.removeItem("consent");
  window.location.reload();
}

export default function ConsentBanner() {
  if (getConsent() !== null) return null;

  const acceptAnalytics = () => {
    setConsent(true);
    window.location.reload();
  };

  const declineAnalytics = () => {
    setConsent(false);
    window.location.reload();
  };

  return (
    <div className="consent-banner">
      <p>
        Tämä sovellus käyttää anonyymia analytiikkaa sovelluksen teknisen
        toimivuuden ja käytettävyyden arviointiin.
      </p>

      <div className="consent-actions">
        <button type="button" onClick={acceptAnalytics}>
          Hyväksy analytiikka
        </button>

        <button type="button" onClick={declineAnalytics}>
          Hylkää
        </button>
      </div>
    </div>
  );
}