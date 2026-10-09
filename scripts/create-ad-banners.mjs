import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const workspaceRoot = '/Users/mac/Downloads/noorpath-admin';
const logoBase64 = fs.readFileSync(path.join(workspaceRoot, 'public/logo.png')).toString('base64');
const girlImgBase64 = fs.readFileSync(path.join(workspaceRoot, 'public/quran_banner_girl.jpg')).toString('base64');
const kidsImgBase64 = fs.readFileSync(path.join(workspaceRoot, 'public/quran_banner_kids.jpg')).toString('base64');

// HTML Template 1: Premium Card Split Layout (1080 x 1080)
const banner1Html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1080px;
    height: 1080px;
    background: radial-gradient(circle at 50% 0%, #063826 0%, #021a12 60%, #010d09 100%);
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #ffffff;
    padding: 36px 40px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    position: relative;
  }
  
  /* Top Glow */
  .glow {
    position: absolute;
    top: -100px;
    left: 200px;
    width: 680px;
    height: 300px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%);
    pointer-events: none;
  }

  /* Header */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    z-index: 10;
  }
  .logo-box {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .logo-img {
    width: 68px;
    height: 68px;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  }
  .brand-title {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    font-weight: 900;
    letter-spacing: -0.5px;
    color: #ffffff;
    line-height: 1;
  }
  .brand-title span { color: #f59e0b; }
  .brand-tag {
    font-size: 13px;
    font-weight: 700;
    color: #34d399;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-top: 5px;
  }
  .trust-pill {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.4);
    padding: 10px 20px;
    border-radius: 50px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 700;
    color: #fbbf24;
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  }

  /* Main Hero Showcase */
  .hero-wrapper {
    position: relative;
    width: 100%;
    height: 520px;
    border-radius: 28px;
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(0,0,0,0.6);
    border: 2px solid rgba(255, 255, 255, 0.12);
  }
  .hero-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(2, 26, 18, 0.7) 70%, rgba(2, 26, 18, 0.98) 100%);
  }
  .hero-content {
    position: absolute;
    bottom: 24px;
    left: 28px;
    right: 28px;
  }
  .tag-bubble {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #059669;
    color: #ffffff;
    font-size: 13px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 6px 14px;
    border-radius: 8px;
    margin-bottom: 10px;
  }
  .hero-title {
    font-family: 'Playfair Display', serif;
    font-size: 38px;
    font-weight: 900;
    line-height: 1.15;
    color: #ffffff;
    text-shadow: 0 4px 12px rgba(0,0,0,0.7);
  }
  .hero-title span { color: #f59e0b; }
  .hero-subtitle {
    font-size: 17px;
    color: #d1fae5;
    font-weight: 600;
    margin-top: 6px;
    text-shadow: 0 2px 6px rgba(0,0,0,0.7);
  }

  /* 4 Value Badges */
  .features-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin: 8px 0;
  }
  .feature-item {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    padding: 12px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .feature-icon {
    width: 28px;
    height: 28px;
    background: #10b981;
    color: #064e3b;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 15px;
    flex-shrink: 0;
  }
  .feature-text {
    font-size: 15px;
    font-weight: 700;
    color: #f3f4f6;
  }

  /* Bottom CTA & Footer */
  .cta-bar {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    border-radius: 20px;
    padding: 16px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 12px 30px rgba(245, 158, 11, 0.35);
  }
  .cta-left h3 {
    font-size: 24px;
    font-weight: 900;
    color: #0f172a;
    line-height: 1.1;
  }
  .cta-left p {
    font-size: 14px;
    font-weight: 700;
    color: #451a03;
    margin-top: 3px;
  }
  .cta-btn {
    background: #0f172a;
    color: #ffffff;
    font-size: 16px;
    font-weight: 800;
    padding: 12px 26px;
    border-radius: 12px;
    letter-spacing: 0.3px;
    box-shadow: 0 6px 18px rgba(0,0,0,0.3);
  }

  .footer-strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8px;
    font-size: 15px;
    font-weight: 700;
    color: #94a3b8;
  }
  .footer-strip .url { color: #34d399; font-weight: 800; }
  .footer-strip .wa { color: #fbbf24; font-weight: 800; }
</style>
</head>
<body>
  <div class="glow"></div>

  <!-- Header -->
  <div class="header">
    <div class="logo-box">
      <img class="logo-img" src="data:image/png;base64,${logoBase64}" alt="NoorPath Logo">
      <div>
        <div class="brand-title">Noor<span>Path</span> Academy</div>
        <div class="brand-tag">Online Quran & Tajweed Academy</div>
      </div>
    </div>
    <div class="trust-pill">
      <span>⭐⭐⭐⭐⭐</span>
      <span>Rated 4.9/5 by Parents</span>
    </div>
  </div>

  <!-- Hero Visual Card -->
  <div class="hero-wrapper">
    <img class="hero-img" src="data:image/jpeg;base64,${girlImgBase64}" alt="Quran Class">
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <div class="tag-bubble">🇬🇧 UK · 🇺🇸 USA · 🇨🇦 Canada · 🇦🇺 Australia</div>
      <h1 class="hero-title">Live 1-on-1 Online <span>Quran Classes</span></h1>
      <p class="hero-subtitle">Personalized learning with caring, certified tutors at home</p>
    </div>
  </div>

  <!-- Features Grid -->
  <div class="features-grid">
    <div class="feature-item">
      <div class="feature-icon">✓</div>
      <div class="feature-text">Certified Female Tutors for Daughters</div>
    </div>
    <div class="feature-item">
      <div class="feature-icon">✓</div>
      <div class="feature-text">Interactive Noorani Qaida & Tajweed</div>
    </div>
    <div class="feature-item">
      <div class="feature-icon">✓</div>
      <div class="feature-text">Flexible After-School & Weekend Timings</div>
    </div>
    <div class="feature-item">
      <div class="feature-icon">✓</div>
      <div class="feature-text">Parent Progress Portal & Monthly Reports</div>
    </div>
  </div>

  <!-- CTA Box -->
  <div class="cta-bar">
    <div class="cta-left">
      <h3>🎁 3-DAY FREE TRIAL CLASS</h3>
      <p>No Credit Card Required · 100% Risk Free</p>
    </div>
    <div class="cta-btn">Book Free Trial →</div>
  </div>

  <!-- Footer Info -->
  <div class="footer-strip">
    <div>🌐 Visit: <span class="url">www.noorpath.online</span></div>
    <div>💬 WhatsApp: <span class="wa">+92 312 4877906</span></div>
  </div>
</body>
</html>`;

// HTML Template 2: Brother & Sister Interactive Classroom (1080 x 1080)
const banner2Html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1080px;
    height: 1080px;
    background: radial-gradient(circle at 50% 0%, #063826 0%, #021a12 60%, #010d09 100%);
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #ffffff;
    padding: 36px 40px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    position: relative;
  }
  
  .glow {
    position: absolute;
    top: -100px;
    left: 200px;
    width: 680px;
    height: 300px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%);
    pointer-events: none;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    z-index: 10;
  }
  .logo-box {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .logo-img {
    width: 68px;
    height: 68px;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  }
  .brand-title {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    font-weight: 900;
    letter-spacing: -0.5px;
    color: #ffffff;
    line-height: 1;
  }
  .brand-title span { color: #f59e0b; }
  .brand-tag {
    font-size: 13px;
    font-weight: 700;
    color: #34d399;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-top: 5px;
  }
  .trust-pill {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.4);
    padding: 10px 20px;
    border-radius: 50px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 700;
    color: #fbbf24;
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  }

  .hero-wrapper {
    position: relative;
    width: 100%;
    height: 520px;
    border-radius: 28px;
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(0,0,0,0.6);
    border: 2px solid rgba(255, 255, 255, 0.12);
  }
  .hero-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(2, 26, 18, 0.7) 70%, rgba(2, 26, 18, 0.98) 100%);
  }
  .hero-content {
    position: absolute;
    bottom: 24px;
    left: 28px;
    right: 28px;
  }
  .tag-bubble {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #059669;
    color: #ffffff;
    font-size: 13px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 6px 14px;
    border-radius: 8px;
    margin-bottom: 10px;
  }
  .hero-title {
    font-family: 'Playfair Display', serif;
    font-size: 38px;
    font-weight: 900;
    line-height: 1.15;
    color: #ffffff;
    text-shadow: 0 4px 12px rgba(0,0,0,0.7);
  }
  .hero-title span { color: #f59e0b; }
  .hero-subtitle {
    font-size: 17px;
    color: #d1fae5;
    font-weight: 600;
    margin-top: 6px;
    text-shadow: 0 2px 6px rgba(0,0,0,0.7);
  }

  .features-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin: 8px 0;
  }
  .feature-item {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    padding: 12px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .feature-icon {
    width: 28px;
    height: 28px;
    background: #10b981;
    color: #064e3b;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 15px;
    flex-shrink: 0;
  }
  .feature-text {
    font-size: 15px;
    font-weight: 700;
    color: #f3f4f6;
  }

  .cta-bar {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    border-radius: 20px;
    padding: 16px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 12px 30px rgba(245, 158, 11, 0.35);
  }
  .cta-left h3 {
    font-size: 24px;
    font-weight: 900;
    color: #0f172a;
    line-height: 1.1;
  }
  .cta-left p {
    font-size: 14px;
    font-weight: 700;
    color: #451a03;
    margin-top: 3px;
  }
  .cta-btn {
    background: #0f172a;
    color: #ffffff;
    font-size: 16px;
    font-weight: 800;
    padding: 12px 26px;
    border-radius: 12px;
    letter-spacing: 0.3px;
    box-shadow: 0 6px 18px rgba(0,0,0,0.3);
  }

  .footer-strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8px;
    font-size: 15px;
    font-weight: 700;
    color: #94a3b8;
  }
  .footer-strip .url { color: #34d399; font-weight: 800; }
  .footer-strip .wa { color: #fbbf24; font-weight: 800; }
</style>
</head>
<body>
  <div class="glow"></div>

  <!-- Header -->
  <div class="header">
    <div class="logo-box">
      <img class="logo-img" src="data:image/png;base64,${logoBase64}" alt="NoorPath Logo">
      <div>
        <div class="brand-title">Noor<span>Path</span> Academy</div>
        <div class="brand-tag">Online Quran & Tajweed Academy</div>
      </div>
    </div>
    <div class="trust-pill">
      <span>👨‍👩‍👧‍👦</span>
      <span>1,000+ Students Worldwide</span>
    </div>
  </div>

  <!-- Hero Visual Card -->
  <div class="hero-wrapper">
    <img class="hero-img" src="data:image/jpeg;base64,${kidsImgBase64}" alt="Quran Class">
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <div class="tag-bubble">🌟 All Ages Welcome · Beginners to Hifz</div>
      <h1 class="hero-title">Give Your Child The <span>Gift of Quran</span></h1>
      <p class="hero-subtitle">Interactive Noorani Qaida & Tajweed with certified mentors</p>
    </div>
  </div>

  <!-- Features Grid -->
  <div class="features-grid">
    <div class="feature-item">
      <div class="feature-icon">✓</div>
      <div class="feature-text">1-on-1 Dedicated Tutor (No Crowded Classes)</div>
    </div>
    <div class="feature-item">
      <div class="feature-icon">✓</div>
      <div class="feature-text">Qualified Female & Male Teachers</div>
    </div>
    <div class="feature-item">
      <div class="feature-icon">✓</div>
      <div class="feature-text">UK, USA, Canada & Australia Timezones</div>
    </div>
    <div class="feature-item">
      <div class="feature-icon">✓</div>
      <div class="feature-text">Special Sibling Discount Plans</div>
    </div>
  </div>

  <!-- CTA Box -->
  <div class="cta-bar">
    <div class="cta-left">
      <h3>🎁 3-DAY FREE TRIAL CLASS</h3>
      <p>Start Today · No Payment or Card Needed</p>
    </div>
    <div class="cta-btn">Book Free Trial →</div>
  </div>

  <!-- Footer Info -->
  <div class="footer-strip">
    <div>🌐 Website: <span class="url">www.noorpath.online</span></div>
    <div>💬 WhatsApp: <span class="wa">+92 312 4877906</span></div>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(workspaceRoot, 'public/banner1.html'), banner1Html);
fs.writeFileSync(path.join(workspaceRoot, 'public/banner2.html'), banner2Html);
console.log('HTML Banner templates written successfully.');
