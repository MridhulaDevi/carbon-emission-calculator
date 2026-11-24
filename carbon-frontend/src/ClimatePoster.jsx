
import React from "react";
import { Leaf, Sparkles } from "lucide-react";
import "./Dashboard.css";

export default function ClimatePoster({
  totalEmission = 0,
  analytics = false
}) {
  return (
    <section className="dash-hero">
      <div className="hero-grid-pattern" />
      <div className="hero-glow hero-glow-one" />
      <div className="hero-glow hero-glow-two" />

      <div className="hero-content">
        <div className="hero-tag">
          <span className="hero-pulse" />
          {analytics
            ? "YOUR IMPACT INTELLIGENCE"
            : "YOUR CLIMATE JOURNEY"}
        </div>

        <h2>
          {analytics ? (
            <>
              Understand today.
              <br />
              <span>Improve tomorrow.</span>
            </>
          ) : (
            <>
              Every action
              <br />
              <span>shapes tomorrow.</span>
            </>
          )}
        </h2>

        <p>
          {analytics
            ? "Explore your emission patterns, discover trends, and understand your environmental impact."
            : "Track your footprint, discover your patterns, and turn everyday decisions into meaningful impact."}
        </p>

        <div className="hero-bottom">
          <div className="hero-live">
            <span className="hero-live-dot" />
            IMPACT TRACKER ACTIVE
          </div>

          <span className="hero-index">
            {analytics ? "02" : "01"} / CARBONDOWN
          </span>
        </div>
      </div>

      <div className="hero-art" aria-hidden="true">
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="orbit orbit-three" />

        <div className="orbit-path orbit-path-one">
          <span className="orbit-particle" />
        </div>

        <div className="orbit-path orbit-path-two">
          <span className="orbit-particle particle-two" />
        </div>

        <div className="hero-core">
          <div className="core-inner">
            <Leaf size={58} strokeWidth={1.15} />
          </div>
        </div>

        <div className="hero-float float-one">
          <span>CO₂</span>
          <strong>
            {Number(totalEmission || 0).toFixed(2)}
          </strong>
          <small>KG TRACKED</small>
        </div>

        <div className="hero-float float-two">
          <Sparkles size={16} />
          <span>MAKE AN IMPACT</span>
        </div>

        <span className="hero-coordinate coord-one">
          35° 41' N
        </span>

        <span className="hero-coordinate coord-two">
          EARTH / 001
        </span>
      </div>
    </section>
  );
}
