
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./LandingPage.css";

function LandingPage({ onRegister, onSignIn, languageSelector = null }) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const tr = (key, fallback) => t(key, { defaultValue: fallback });

  const features = [
    {
      number: "01",
      icon: "↗",
      title: tr("landing.feature1Title", "See the full picture."),
      description: tr(
        "landing.feature1Desc",
        "Understand the impact of your transport, electricity, food and shopping in one beautiful space."
      ),
      style: "dark",
    },
    {
      number: "02",
      icon: "◎",
      title: tr("landing.feature2Title", "Make progress tangible."),
      description: tr(
        "landing.feature2Desc",
        "Set meaningful sustainability goals and follow your journey one thoughtful decision at a time."
      ),
      style: "sage",
    },
    {
      number: "03",
      icon: "✳",
      title: tr("landing.feature3Title", "Build better habits."),
      description: tr(
        "landing.feature3Desc",
        "Explore personalized recommendations and celebrate milestones with achievement badges."
      ),
      style: "cream",
    },
  ];

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("lp-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".lp-reveal").forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="lp-site">
      <header className="lp-navbar">
        <a href="#home" className="lp-logo">
          <span className="lp-logo-symbol">✳</span>
          carbon<span>down</span><b>.</b>
        </a>

        <nav className={`lp-navlinks ${menuOpen ? "open" : ""}`}>
          <a href="#about" onClick={() => setMenuOpen(false)}>
            {tr("landing.approach", "Our approach")}
          </a>
          <a href="#features" onClick={() => setMenuOpen(false)}>
            {tr("landing.features", "Features")}
          </a>
          <a href="#how" onClick={() => setMenuOpen(false)}>
            {tr("landing.howItWorks", "How it works")}
          </a>
        </nav>

        <div className="lp-auth-actions">
          <span className="lp-new-label">
            {tr("landing.newHere", "")}
          </span>

          <div className="lp-language-slot">
            {languageSelector}
          </div>

          <button
            type="button"
            className="lp-register-btn"
            onClick={onRegister}
          >
            {tr("landing.register", "Register")} ↗
          </button>

          <button
            type="button"
            className="lp-signin-btn"
            onClick={onSignIn}
          >
            {tr("landing.signIn", "Sign In")} ↗
          </button>
        </div>

        <button
          type="button"
          className="lp-menu-btn"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </header>

      <main>
        <section className="lp-hero" id="home">
          <div className="lp-hero-glow" />

          <div className="lp-hero-content">
            <div className="lp-eyebrow">
              <span className="lp-pulse-dot" />
              {tr(
                "landing.companion",
                "YOUR PERSONAL CLIMATE COMPANION"
              )}
              <span className="lp-eyebrow-line" />
            </div>

            <h1>
              {tr("landing.hero1", "Live lighter.")}
              <br />
              <em>
                {tr("landing.hero2", "Leave a better")}
              </em>
              <br />
              {tr("landing.hero3", "footprint")}
              <span className="lp-accent">.</span>
            </h1>

            <p className="lp-hero-description">
              {tr(
                "landing.heroDescription",
                "The future is shaped by what we do today. Discover your environmental impact, make intentional choices, and turn small actions into lasting change."
              )}
            </p>

            <div className="lp-hero-buttons">
              <button
                type="button"
                className="lp-primary-btn"
                onClick={onRegister}
              >
                {tr("landing.startJourney", "Start your journey")}
                <span>↗</span>
              </button>

              <a href="#about" className="lp-discover-link">
                {tr("landing.discover", "Discover CarbonDown")}
                <span>↓</span>
              </a>
            </div>

            <div className="lp-hero-caption">
              <span />
              {tr(
                "landing.tomorrow",
                "A BETTER TOMORROW STARTS HERE"
              )}
            </div>
          </div>

          <div className="lp-hero-visual">
            <div className="lp-orbit lp-orbit-one" />
            <div className="lp-orbit lp-orbit-two" />

            <div className="lp-planet">
              <div className="lp-planet-texture" />
              <div className="lp-planet-highlight" />
            </div>

            <div className="lp-floating-card lp-floating-top">
              <span className="lp-card-icon">↘</span>
              <div>
                <small>
                  {tr("landing.yourImpact", "YOUR IMPACT")}
                </small>
                <strong>
                  {tr("landing.makeItCount", "Make it count.")}
                </strong>
              </div>
            </div>

            <div className="lp-floating-card lp-floating-bottom">
              <span className="lp-card-icon">✳</span>
              <div>
                <small>
                  {tr(
                    "landing.oneChoice",
                    "ONE CHOICE AT A TIME"
                  )}
                </small>
                <strong>
                  {tr(
                    "landing.progressBegins",
                    "Progress begins here."
                  )}
                </strong>
              </div>
            </div>

            <div className="lp-planet-caption">
              {tr(
                "landing.planetCaption",
                "01 / THE PLANET WE SHARE"
              )}
            </div>
          </div>

          <div className="lp-vertical-text">
            {tr(
              "landing.thinkTrack",
              "THINK · TRACK · TRANSFORM"
            )}
          </div>
        </section>

        <div className="lp-marquee">
          <div>
            {Array.from({ length: 2 }).map((_, index) => (
              <span key={index}>
                {tr(
                  "landing.measure",
                  "MEASURE WHAT MATTERS"
                )}{" "}
                <span>✳</span>{" "}
                {tr(
                  "landing.understand",
                  "UNDERSTAND YOUR IMPACT"
                )}{" "}
                <span>✳</span>{" "}
                {tr(
                  "landing.positiveChange",
                  "CREATE POSITIVE CHANGE"
                )}{" "}
                <span>✳</span>{" "}
              </span>
            ))}
          </div>
        </div>

        <section className="lp-section lp-about" id="about">
          <div className="lp-section-heading lp-reveal">
            <span>
              {tr("landing.idea", "01 / THE IDEA")}
            </span>
            <span>
              {tr(
                "landing.consciousLiving",
                "CONSCIOUS LIVING, MADE SIMPLE"
              )}
            </span>
          </div>

          <div className="lp-about-grid">
            <h2 className="lp-reveal">
              {tr(
                "landing.aboutTitle1",
                "A clearer view of"
              )}
              <br />
              <em>
                {tr(
                  "landing.aboutTitle2",
                  "your impact."
                )}
              </em>
            </h2>

            <div className="lp-about-copy lp-reveal">
              <p>
                {tr(
                  "landing.aboutDescription",
                  "Change starts with awareness. CarbonDown connects your everyday activities with their carbon emissions, giving you the clarity to make more sustainable decisions."
                )}
              </p>

              <a href="#features">
                {tr(
                  "landing.explore",
                  "Explore what's possible"
                )}
                <span>↗</span>
              </a>
            </div>
          </div>

          <div className="lp-categories lp-reveal">
            <span>{tr("landing.transport", "TRANSPORT")}</span>
            <span>{tr("landing.energy", "ENERGY")}</span>
            <span>{tr("landing.food", "FOOD")}</span>
            <span>{tr("landing.shopping", "SHOPPING")}</span>
          </div>
        </section>

        <section className="lp-section lp-features" id="features">
          <div className="lp-section-heading lp-reveal">
            <span>
              {tr(
                "landing.experience",
                "02 / THE EXPERIENCE"
              )}
            </span>
            <span>
              {tr(
                "landing.everydayImpact",
                "BUILT FOR EVERYDAY IMPACT"
              )}
            </span>
          </div>

          <div className="lp-features-intro lp-reveal">
            <h2>
              {tr(
                "landing.featuresTitle1",
                "Everything you need."
              )}
              <br />
              <em>
                {tr(
                  "landing.featuresTitle2",
                  "Nothing you don't."
                )}
              </em>
            </h2>

            <p>
              {tr(
                "landing.featuresDescription",
                "Thoughtful tools for understanding your footprint and moving toward a lower-carbon lifestyle."
              )}
            </p>
          </div>

          <div className="lp-feature-grid">
            {features.map((feature) => (
              <article
                key={feature.number}
                className={`lp-feature-card lp-${feature.style} lp-reveal`}
              >
                <div className="lp-feature-top">
                  <span>{feature.number} / 03</span>
                  <span>{feature.icon}</span>
                </div>

                <div className="lp-feature-art">
                  <div className="lp-feature-ring">
                    {feature.icon}
                  </div>
                </div>

                <h3>{feature.title}</h3>
                <p>{feature.description}</p>

                <span className="lp-feature-arrow">↗</span>
              </article>
            ))}
          </div>
        </section>

        <section className="lp-section lp-how" id="how">
          <div className="lp-section-heading lp-reveal">
            <span>
              {tr(
                "landing.howSection",
                "03 / HOW IT WORKS"
              )}
            </span>
            <span>
              {tr(
                "landing.journeySimplified",
                "YOUR JOURNEY, SIMPLIFIED"
              )}
            </span>
          </div>

          <div className="lp-how-grid">
            <div className="lp-reveal">
              <h2>
                {tr(
                  "landing.betterChoices",
                  "Better choices."
                )}
                <br />
                <em>
                  {tr(
                    "landing.oneDay",
                    "One day at a time."
                  )}
                </em>
              </h2>

              <p>
                {tr(
                  "landing.howDescription",
                  "CarbonDown makes it easier to understand where you are and decide where you want to go."
                )}
              </p>

              <button
                type="button"
                className="lp-primary-btn lp-dark-btn"
                onClick={onRegister}
              >
                {tr(
                  "landing.createAccount",
                  "Create your account"
                )}
                <span>↗</span>
              </button>
            </div>

            <div className="lp-steps lp-reveal">
              <div className="lp-step">
                <span>01</span>
                <div>
                  <h3>
                    {tr(
                      "landing.step1Title",
                      "Create your space"
                    )}
                  </h3>
                  <p>
                    {tr(
                      "landing.step1Desc",
                      "Set up your personal CarbonDown profile."
                    )}
                  </p>
                </div>
                <span>↗</span>
              </div>

              <div className="lp-step">
                <span>02</span>
                <div>
                  <h3>
                    {tr(
                      "landing.step2Title",
                      "Log your everyday activities"
                    )}
                  </h3>
                  <p>
                    {tr(
                      "landing.step2Desc",
                      "Track transport, electricity, food and shopping."
                    )}
                  </p>
                </div>
                <span>↗</span>
              </div>

              <div className="lp-step">
                <span>03</span>
                <div>
                  <h3>
                    {tr(
                      "landing.step3Title",
                      "Watch your progress"
                    )}
                  </h3>
                  <p>
                    {tr(
                      "landing.step3Desc",
                      "Explore your dashboard, goals, recommendations and badges."
                    )}
                  </p>
                </div>
                <span>↗</span>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-section lp-final-cta">
          <div className="lp-cta-orb" />

          <div className="lp-cta-content lp-reveal">
            <span className="lp-cta-label">
              {tr(
                "landing.nextChapter",
                "THE NEXT CHAPTER STARTS WITH YOU"
              )}
            </span>

            <h2>
              {tr("landing.ourPlanet", "Our planet.")}
              <br />
              <em>
                {tr(
                  "landing.ourPossibility",
                  "Our possibility."
                )}
              </em>
            </h2>

            <p>
              {tr(
                "landing.ctaDescription",
                "A more mindful future begins with a single choice. Make yours count."
              )}
            </p>

            <button
              type="button"
              className="lp-primary-btn"
              onClick={onRegister}
            >
              {tr(
                "landing.getStarted",
                "Get started with CarbonDown"
              )}
              <span>↗</span>
            </button>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <a href="#home" className="lp-logo">
          <span className="lp-logo-symbol">✳</span>
          carbon<span>down</span><b>.</b>
        </a>

        <p>
          {tr(
            "landing.footerMessage",
            "Small choices. Meaningful impact."
          )}
        </p>

        <span>
          © {new Date().getFullYear()} CarbonDown
        </span>
      </footer>
    </div>
  );
}

export default LandingPage;
