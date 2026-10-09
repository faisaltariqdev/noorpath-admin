import fs from 'fs';
import path from 'path';

const workspaceRoot = '/Users/mac/Downloads/noorpath-admin';
const logoBase64 = fs.readFileSync(path.join(workspaceRoot, 'public/logo.png')).toString('base64');
const girlImgBase64 = fs.readFileSync(path.join(workspaceRoot, 'public/quran_banner_girl.jpg')).toString('base64');
const kidsImgBase64 = fs.readFileSync(path.join(workspaceRoot, 'public/quran_banner_kids.jpg')).toString('base64');

// Design A: Full-Bleed Hero (Girl & Ustadha) - 1080x1080
// Image is 100% prominent, text is BIG and directly overlaid with sleek glassmorphism gradients
const bannerA_Html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800;900&family=Playfair+Display:wght@700;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1080px;
    height: 1080px;
    position: relative;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #ffffff;
    overflow: hidden;
    background: #000;
  }

  /* Full Bleed Background Photo - Maximum Prominence */
  .bg-photo {
    position: absolute;
    top: 0;
    left: 0;
    width: 1080px;
    height: 1080px;
    object-fit: cover;
    object-position: center 25%;
  }

  /* Strategic Vignette Gradients - Keeps faces 100% bright while making text razor-sharp */
  .top-gradient {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 380px;
    background: linear-gradient(180deg, rgba(3, 20, 14, 0.96) 0%, rgba(3, 20, 14, 0.82) 50%, rgba(3, 20, 14, 0) 100%);
    pointer-events: none;
  }
  .bottom-gradient {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 480px;
    background: linear-gradient(0deg, rgba(2, 16, 11, 0.98) 0%, rgba(2, 16, 11, 0.88) 60%, rgba(2, 16, 11, 0) 100%);
    pointer-events: none;
  }

  /* Content Container */
  .container {
    position: relative;
    z-index: 10;
    width: 1080px;
    height: 1080px;
    padding: 36px 44px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  /* Top Bar */
  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .brand-group {
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 8px 18px 8px 10px;
    border-radius: 50px;
  }
  .logo-img {
    width: 54px;
    height: 54px;
    border-radius: 50%;
    box-shadow: 0 4px 14px rgba(0,0,0,0.4);
  }
  .brand-name {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    font-weight: 900;
    line-height: 1;
    color: #ffffff;
  }
  .brand-name span { color: #fbbf24; }
  .brand-subtitle {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: #34d399;
    margin-top: 3px;
  }
  .pill-rating {
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(251, 191, 36, 0.4);
    padding: 10px 20px;
    border-radius: 50px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 800;
    color: #fbbf24;
  }

  /* Header Headline (BIG & PROMINENT) */
  .headline-section {
    margin-top: 16px;
  }
  .kicker-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #059669;
    color: #ffffff;
    font-size: 14px;
    font-weight: 900;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    padding: 6px 14px;
    border-radius: 8px;
    margin-bottom: 12px;
    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
  }
  .main-heading {
    font-family: 'Playfair Display', serif;
    font-size: 52px;
    font-weight: 900;
    line-height: 1.12;
    color: #ffffff;
    text-shadow: 0 4px 16px rgba(0,0,0,0.8);
    max-width: 960px;
  }
  .main-heading .gold {
    color: #fbbf24;
    text-shadow: 0 4px 20px rgba(245, 158, 11, 0.5);
  }
  .sub-heading {
    font-size: 20px;
    font-weight: 700;
    color: #e2e8f0;
    margin-top: 10px;
    text-shadow: 0 2px 8px rgba(0,0,0,0.8);
  }

  /* Bottom Section (Badges on Image + CTA) */
  .bottom-section {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* 4 Tick Options Directly Floating Over the Image */
  .ticks-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .tick-pill {
    background: rgba(4, 28, 19, 0.75);
    backdrop-filter: blur(14px);
    border: 1.5px solid rgba(52, 211, 153, 0.4);
    padding: 12px 18px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  }
  .tick-icon {
    width: 26px;
    height: 26px;
    background: #10b981;
    color: #022c22;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-weight: 900;
    flex-shrink: 0;
  }
  .tick-text {
    font-size: 16px;
    font-weight: 800;
    color: #ffffff;
    line-height: 1.2;
  }

  /* Big Golden CTA Box */
  .cta-banner {
    background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
    border-radius: 20px;
    padding: 18px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 14px 35px rgba(217, 119, 6, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.4);
  }
  .cta-banner-left h3 {
    font-size: 26px;
    font-weight: 900;
    color: #0f172a;
    line-height: 1.1;
  }
  .cta-banner-left p {
    font-size: 15px;
    font-weight: 800;
    color: #451a03;
    margin-top: 4px;
  }
  .cta-action-btn {
    background: #0f172a;
    color: #ffffff;
    font-size: 17px;
    font-weight: 900;
    padding: 14px 28px;
    border-radius: 14px;
    letter-spacing: 0.3px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.35);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Bottom Contacts Bar */
  .footer-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8px;
    font-size: 16px;
    font-weight: 800;
    color: #cbd5e1;
    text-shadow: 0 2px 6px rgba(0,0,0,0.8);
  }
  .footer-bar .site { color: #34d399; font-weight: 900; text-decoration: underline; }
  .footer-bar .phone { color: #fbbf24; font-weight: 900; }
</style>
</head>
<body>
  <!-- Full-Bleed Prominent Photo -->
  <img class="bg-photo" src="data:image/jpeg;base64,${girlImgBase64}" alt="NoorPath Quran Student">

  <!-- Gradients -->
  <div class="top-gradient"></div>
  <div class="bottom-gradient"></div>

  <!-- Content Layer -->
  <div class="container">
    <!-- Header -->
    <div>
      <div class="top-bar">
        <div class="brand-group">
          <img class="logo-img" src="data:image/png;base64,${logoBase64}" alt="NoorPath Logo">
          <div>
            <div class="brand-name">Noor<span>Path</span> Academy</div>
            <div class="brand-subtitle">Online Quran & Tajweed Academy</div>
          </div>
        </div>
        <div class="pill-rating">
          <span>⭐⭐⭐⭐⭐</span>
          <span>4.9/5 (1,000+ Students)</span>
        </div>
      </div>

      <!-- Main Catchy Headline -->
      <div class="headline-section">
        <div class="kicker-badge">🇬🇧 UK · 🇺🇸 USA · 🇨🇦 Canada · 🇦🇺 Australia</div>
        <h1 class="main-heading">Live 1-on-1 Online <span class="gold">Quran Classes</span> For Kids</h1>
        <p class="sub-heading">Learn Noorani Qaida, Tajweed & Hifz from Home with Caring Mentors</p>
      </div>
    </div>

    <!-- Bottom Section: Ticks Over Image + Golden CTA -->
    <div class="bottom-section">
      <!-- 4 Ticks directly over image -->
      <div class="ticks-grid">
        <div class="tick-pill">
          <div class="tick-icon">✓</div>
          <div class="tick-text">Certified Female Tutors for Daughters</div>
        </div>
        <div class="tick-pill">
          <div class="tick-icon">✓</div>
          <div class="tick-text">Interactive Noorani Qaida & Tajweed</div>
        </div>
        <div class="tick-pill">
          <div class="tick-icon">✓</div>
          <div class="tick-text">Flexible After-School & Weekend Timings</div>
        </div>
        <div class="tick-pill">
          <div class="tick-icon">✓</div>
          <div class="tick-text">1-on-1 Dedicated Tutor (No Crowded Classes)</div>
        </div>
      </div>

      <!-- Big CTA Banner -->
      <div class="cta-banner">
        <div class="cta-banner-left">
          <h3>🎁 BOOK 3-DAY FREE TRIAL CLASS</h3>
          <p>No Credit Card Required · Start Learning Today</p>
        </div>
        <div class="cta-action-btn">Book Free Trial →</div>
      </div>

      <!-- Footer URLs -->
      <div class="footer-bar">
        <div>🌐 Official Site: <span class="site">www.noorpath.online</span></div>
        <div>💬 WhatsApp: <span class="phone">+92 312 4877906</span></div>
      </div>
    </div>
  </div>
</body>
</html>`;

// Design B: Full-Bleed Hero (Brother & Sister Interactive Screen) - 1080x1080
const bannerB_Html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800;900&family=Playfair+Display:wght@700;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1080px;
    height: 1080px;
    position: relative;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #ffffff;
    overflow: hidden;
    background: #000;
  }

  .bg-photo {
    position: absolute;
    top: 0;
    left: 0;
    width: 1080px;
    height: 1080px;
    object-fit: cover;
    object-position: center 25%;
  }

  .top-gradient {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 380px;
    background: linear-gradient(180deg, rgba(3, 20, 14, 0.96) 0%, rgba(3, 20, 14, 0.82) 50%, rgba(3, 20, 14, 0) 100%);
    pointer-events: none;
  }
  .bottom-gradient {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 480px;
    background: linear-gradient(0deg, rgba(2, 16, 11, 0.98) 0%, rgba(2, 16, 11, 0.88) 60%, rgba(2, 16, 11, 0) 100%);
    pointer-events: none;
  }

  .container {
    position: relative;
    z-index: 10;
    width: 1080px;
    height: 1080px;
    padding: 36px 44px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .brand-group {
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 8px 18px 8px 10px;
    border-radius: 50px;
  }
  .logo-img {
    width: 54px;
    height: 54px;
    border-radius: 50%;
    box-shadow: 0 4px 14px rgba(0,0,0,0.4);
  }
  .brand-name {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    font-weight: 900;
    line-height: 1;
    color: #ffffff;
  }
  .brand-name span { color: #fbbf24; }
  .brand-subtitle {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: #34d399;
    margin-top: 3px;
  }
  .pill-rating {
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(251, 191, 36, 0.4);
    padding: 10px 20px;
    border-radius: 50px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 800;
    color: #fbbf24;
  }

  .headline-section {
    margin-top: 16px;
  }
  .kicker-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #059669;
    color: #ffffff;
    font-size: 14px;
    font-weight: 900;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    padding: 6px 14px;
    border-radius: 8px;
    margin-bottom: 12px;
    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
  }
  .main-heading {
    font-family: 'Playfair Display', serif;
    font-size: 52px;
    font-weight: 900;
    line-height: 1.12;
    color: #ffffff;
    text-shadow: 0 4px 16px rgba(0,0,0,0.8);
    max-width: 960px;
  }
  .main-heading .gold {
    color: #fbbf24;
    text-shadow: 0 4px 20px rgba(245, 158, 11, 0.5);
  }
  .sub-heading {
    font-size: 20px;
    font-weight: 700;
    color: #e2e8f0;
    margin-top: 10px;
    text-shadow: 0 2px 8px rgba(0,0,0,0.8);
  }

  .bottom-section {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .ticks-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .tick-pill {
    background: rgba(4, 28, 19, 0.75);
    backdrop-filter: blur(14px);
    border: 1.5px solid rgba(52, 211, 153, 0.4);
    padding: 12px 18px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  }
  .tick-icon {
    width: 26px;
    height: 26px;
    background: #10b981;
    color: #022c22;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-weight: 900;
    flex-shrink: 0;
  }
  .tick-text {
    font-size: 16px;
    font-weight: 800;
    color: #ffffff;
    line-height: 1.2;
  }

  .cta-banner {
    background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
    border-radius: 20px;
    padding: 18px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 14px 35px rgba(217, 119, 6, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.4);
  }
  .cta-banner-left h3 {
    font-size: 26px;
    font-weight: 900;
    color: #0f172a;
    line-height: 1.1;
  }
  .cta-banner-left p {
    font-size: 15px;
    font-weight: 800;
    color: #451a03;
    margin-top: 4px;
  }
  .cta-action-btn {
    background: #0f172a;
    color: #ffffff;
    font-size: 17px;
    font-weight: 900;
    padding: 14px 28px;
    border-radius: 14px;
    letter-spacing: 0.3px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.35);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .footer-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8px;
    font-size: 16px;
    font-weight: 800;
    color: #cbd5e1;
    text-shadow: 0 2px 6px rgba(0,0,0,0.8);
  }
  .footer-bar .site { color: #34d399; font-weight: 900; text-decoration: underline; }
  .footer-bar .phone { color: #fbbf24; font-weight: 900; }
</style>
</head>
<body>
  <!-- Full-Bleed Prominent Photo -->
  <img class="bg-photo" src="data:image/jpeg;base64,${kidsImgBase64}" alt="NoorPath Quran Students">

  <!-- Gradients -->
  <div class="top-gradient"></div>
  <div class="bottom-gradient"></div>

  <!-- Content Layer -->
  <div class="container">
    <!-- Header -->
    <div>
      <div class="top-bar">
        <div class="brand-group">
          <img class="logo-img" src="data:image/png;base64,${logoBase64}" alt="NoorPath Logo">
          <div>
            <div class="brand-name">Noor<span>Path</span> Academy</div>
            <div class="brand-subtitle">Online Quran & Tajweed Academy</div>
          </div>
        </div>
        <div class="pill-rating">
          <span>👨‍👩‍👧‍👦</span>
          <span>1,000+ Enrolled Students</span>
        </div>
      </div>

      <!-- Main Catchy Headline -->
      <div class="headline-section">
        <div class="kicker-badge">🌟 Beginners to Hifz · All Ages Welcome</div>
        <h1 class="main-heading">Give Your Child The <span class="gold">Gift of Quran</span></h1>
        <p class="sub-heading">Interactive Noorani Qaida & Tajweed with Certified Tutors from Home</p>
      </div>
    </div>

    <!-- Bottom Section: Ticks Over Image + Golden CTA -->
    <div class="bottom-section">
      <!-- 4 Ticks directly over image -->
      <div class="ticks-grid">
        <div class="tick-pill">
          <div class="tick-icon">✓</div>
          <div class="tick-text">1-on-1 Dedicated Tutor (No Crowded Classes)</div>
        </div>
        <div class="tick-pill">
          <div class="tick-icon">✓</div>
          <div class="tick-text">Qualified Female & Male Teachers</div>
        </div>
        <div class="tick-pill">
          <div class="tick-icon">✓</div>
          <div class="tick-text">Flexible After-School & Weekend Timings</div>
        </div>
        <div class="tick-pill">
          <div class="tick-icon">✓</div>
          <div class="tick-text">Family & Sibling Discount Plans</div>
        </div>
      </div>

      <!-- Big CTA Banner -->
      <div class="cta-banner">
        <div class="cta-banner-left">
          <h3>🎁 BOOK 3-DAY FREE TRIAL CLASS</h3>
          <p>Start Learning Today · No Card or Payment Needed</p>
        </div>
        <div class="cta-action-btn">Book Free Trial →</div>
      </div>

      <!-- Footer URLs -->
      <div class="footer-bar">
        <div>🌐 Official Site: <span class="site">www.noorpath.online</span></div>
        <div>💬 WhatsApp: <span class="phone">+92 312 4877906</span></div>
      </div>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(workspaceRoot, 'public/banner_v2_girl.html'), bannerA_Html);
fs.writeFileSync(path.join(workspaceRoot, 'public/banner_v2_kids.html'), bannerB_Html);
console.log('HTML V2 templates written successfully.');
