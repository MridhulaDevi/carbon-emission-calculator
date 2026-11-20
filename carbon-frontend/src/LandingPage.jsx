import { useEffect, useState } from "react";
import "./LandingPage.css";

const features = [
  {
    number: "01",
    icon: "↗",
    title: "See the full picture.",
    description:
      "Understand the impact of your transport, electricity, food and shopping in one beautiful space.",
    style: "dark",
  },
  {
    number: "02",
    icon: "◎",
    title: "Make progress tangible.",
    description:
      "Set meaningful sustainability goals and follow your journey one thoughtful decision at a time.",
    style: "sage",
  },
  {
    number: "03",
    icon: "✳",
    title: "Build better habits.",
    description:
      "Explore personalized recommendations and celebrate milestones with achievement badges.",
    style: "cream",
  },
];

function LandingPage({ onRegister, onSignIn }) {
  const [menuOpen, setMenuOpen] = useState(false);

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
            Our approach
          </a>
          <a href="#features" onClick={() => setMenuOpen(false)}>
            Features
          </a>
          <a href="#how" onClick={() => setMenuOpen(false)}>
            How it works
          </a>
        </nav>

        <div className="lp-auth-actions">
          <span className="lp-new-label">New here?</span>

          <button
            type="button"
            className="lp-register-btn"
            onClick={onRegister}
          >
            Register ↗
          </button>

          <button
            type="button"
            className="lp-signin-btn"
            onClick={onSignIn}
          >
            Sign In ↗
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
              YOUR PERSONAL CLIMATE COMPANION
              <span className="lp-eyebrow-line" />
            </div>

            <h1>
              Live lighter.
              <br />
              <em>Leave a better</em>
              <br />
              footprint<span className="lp-accent">.</span>
            </h1>

            <p className="lp-hero-description">
              The future is shaped by what we do today.
              Discover your environmental impact, make
              intentional choices, and turn small actions
              into lasting change.
            </p>

            <div className="lp-hero-buttons">
              <button
                type="button"
                className="lp-primary-btn"
                onClick={onRegister}
              >
                Start your journey <span>↗</span>
              </button>

              <a href="#about" className="lp-discover-link">
                Discover CarbonDown <span>↓</span>
              </a>
            </div>

            <div className="lp-hero-caption">
              <span />
              A BETTER TOMORROW STARTS HERE
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
                <small>YOUR IMPACT</small>
                <strong>Make it count.</strong>
              </div>
            </div>

            <div className="lp-floating-card lp-floating-bottom">
              <span className="lp-card-icon">✳</span>
              <div>
                <small>ONE CHOICE AT A TIME</small>
                <strong>Progress begins here.</strong>
              </div>
            </div>

            <div className="lp-planet-caption">
              01 / THE PLANET WE SHARE
            </div>
          </div>

          <div className="lp-vertical-text">
            THINK · TRACK · TRANSFORM
          </div>
        </section>

        <div className="lp-marquee">
          <div>
            MEASURE WHAT MATTERS <span>✳</span>
            UNDERSTAND YOUR IMPACT <span>✳</span>
            CREATE POSITIVE CHANGE <span>✳</span>
            MEASURE WHAT MATTERS <span>✳</span>
            UNDERSTAND YOUR IMPACT <span>✳</span>
            CREATE POSITIVE CHANGE <span>✳</span>
          </div>
        </div>

        <section className="lp-section lp-about" id="about">
          <div className="lp-section-heading lp-reveal">
            <span>01 / THE IDEA</span>
            <span>CONSCIOUS LIVING, MADE SIMPLE</span>
          </div>

          <div className="lp-about-grid">
            <h2 className="lp-reveal">
              A clearer view of
              <br />
              <em>your impact.</em>
            </h2>

            <div className="lp-about-copy lp-reveal">
              <p>
                Change starts with awareness. CarbonDown
                connects your everyday activities with
                their carbon emissions, giving you the
                clarity to make more sustainable decisions.
              </p>

              <a href="#features">
                Explore what's possible <span>↗</span>
              </a>
            </div>
          </div>

          <div className="lp-categories lp-reveal">
            <span>TRANSPORT</span>
            <span>ENERGY</span>
            <span>FOOD</span>
            <span>SHOPPING</span>
          </div>
        </section>

        <section className="lp-section lp-features" id="features">
          <div className="lp-section-heading lp-reveal">
            <span>02 / THE EXPERIENCE</span>
            <span>BUILT FOR EVERYDAY IMPACT</span>
          </div>

          <div className="lp-features-intro lp-reveal">
            <h2>
              Everything you need.
              <br />
              <em>Nothing you don't.</em>
            </h2>

            <p>
              Thoughtful tools for understanding your
              footprint and moving toward a lower-carbon
              lifestyle.
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
            <span>03 / HOW IT WORKS</span>
            <span>YOUR JOURNEY, SIMPLIFIED</span>
          </div>

          <div className="lp-how-grid">
            <div className="lp-reveal">
              <h2>
                Better choices.
                <br />
                <em>One day at a time.</em>
              </h2>

              <p>
                CarbonDown makes it easier to understand
                where you are and decide where you want
                to go.
              </p>

              <button
                type="button"
                className="lp-primary-btn lp-dark-btn"
                onClick={onRegister}
              >
                Create your account <span>↗</span>
              </button>
            </div>

            <div className="lp-steps lp-reveal">
              <div className="lp-step">
                <span>01</span>
                <div>
                  <h3>Create your space</h3>
                  <p>
                    Set up your personal CarbonDown profile.
                  </p>
                </div>
                <span>↗</span>
              </div>

              <div className="lp-step">
                <span>02</span>
                <div>
                  <h3>Log your everyday activities</h3>
                  <p>
                    Track transport, electricity, food
                    and shopping.
                  </p>
                </div>
                <span>↗</span>
              </div>

              <div className="lp-step">
                <span>03</span>
                <div>
                  <h3>Watch your progress</h3>
                  <p>
                    Explore your dashboard, goals,
                    recommendations and badges.
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
              THE NEXT CHAPTER STARTS WITH YOU
            </span>

            <h2>
              Our planet.
              <br />
              <em>Our possibility.</em>
            </h2>

            <p>
              A more mindful future begins with a
              single choice. Make yours count.
            </p>

            <button
              type="button"
              className="lp-primary-btn"
              onClick={onRegister}
            >
              Get started with CarbonDown <span>↗</span>
            </button>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <a href="#home" className="lp-logo">
          <span className="lp-logo-symbol">✳</span>
          carbon<span>down</span><b>.</b>
        </a>

        <p>Small choices. Meaningful impact.</p>
        <span>© {new Date().getFullYear()} CarbonDown</span>
      </footer>
    </div>
  );
}

export default LandingPage;