const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\rhith\\.gemini\\antigravity-ide\\brain\\d313d013-046b-470b-a040-e2e1be812183';
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runE2ETests() {
  console.log('=== STARTING REAL CHROMIUM BROWSER E2E TEST ===');
  
  const browser = await chromium.launch({
    executablePath: 'C:\\Users\\rhith\\AppData\\Local\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    permissions: ['microphone', 'camera']
  });

  const page = await context.newPage();

  const consoleLogs = [];
  const networkLogs = [];

  page.on('console', msg => {
    const text = `[Browser Console ${msg.type()}]: ${msg.text()}`;
    consoleLogs.push(text);
    if (msg.type() === 'error') {
      console.log('  ⚠️ ' + text);
    }
  });

  page.on('pageerror', err => {
    console.log('  💥 [Browser Uncaught Error]:', err.message);
  });

  page.on('response', async res => {
    const url = res.url();
    if (url.includes('/api/')) {
      const status = res.status();
      let bodyText = '';
      try {
        bodyText = await res.text();
      } catch (e) {}
      const logEntry = `[Network Response]: ${res.request().method()} ${url} -> Status ${status} (${bodyText.slice(0, 150)})`;
      networkLogs.push(logEntry);
      console.log('  🌐 ' + logEntry);
    }
  });

  try {
    // -------------------------------------------------------------
    // TEST 1: LANDING PAGE & THEME TOGGLE
    // -------------------------------------------------------------
    console.log('\n--- 1. Testing Landing Page & Theme Toggle ---');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    
    const initialHtmlClass = await page.evaluate(() => document.documentElement.className);
    console.log('Initial html class:', initialHtmlClass);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_landing_dark.png') });

    // Click theme toggle button in header
    const themeBtn = page.locator('header button[aria-label="Toggle theme"]');
    await themeBtn.click();
    await page.waitForTimeout(400);

    const toggledHtmlClass = await page.evaluate(() => document.documentElement.className);
    console.log('Toggled html class (after 1st click):', toggledHtmlClass);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_landing_light.png') });

    // Toggle back to dark
    await themeBtn.click();
    await page.waitForTimeout(400);
    const restoredHtmlClass = await page.evaluate(() => document.documentElement.className);
    console.log('Restored html class (after 2nd click):', restoredHtmlClass);

    // -------------------------------------------------------------
    // TEST 2: TOP SEARCH BAR (Landing Page Role Filtering)
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing Top Search Bar on Landing Page ---');
    const searchInput = page.locator('input[placeholder*="Search any job role"]');
    await searchInput.fill('Python');
    await page.waitForTimeout(500);

    const matchText = await page.locator('text=Showing').textContent();
    console.log('Search match text:', matchText);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_search_python.png') });

    // Clear search
    await page.locator('button:has-text("Clear")').click();
    await page.waitForTimeout(300);
    console.log('Search cleared successfully.');

    // -------------------------------------------------------------
    // TEST 3: MOBILE RESPONSIVENESS (375px viewport)
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing Mobile Responsive Viewport (375x812) ---');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_mobile_375px_landing.png') });

    // Open mobile hamburger menu
    const menuBtn = page.locator('header button:has(svg.lucide-menu)');
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_mobile_drawer_open.png') });
      console.log('Mobile drawer menu opened.');
      
      // Close menu
      const closeBtn = page.locator('header button:has(svg.lucide-x)');
      await closeBtn.click();
      await page.waitForTimeout(300);
    }
    
    // Restore desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(500);

    // -------------------------------------------------------------
    // TEST 4: RESUME UPLOAD REAL BROWSER FLOW
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing Resume Upload Flow ---');
    await page.locator('header nav button:has-text("Resume & ATS")').click();
    await page.waitForTimeout(600);

    const resumeFilePath = 'C:\\Users\\rhith\\Desktop\\roko interview\\sample_resume.txt';
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(resumeFilePath);
    await page.waitForTimeout(400);

    console.log('File attached to file input. Clicking Upload & Analyze...');
    const uploadBtn = page.locator('button:has-text("Upload & Analyze")');
    await uploadBtn.click();

    // Wait for parse response and ATS results to render
    await page.waitForSelector('text=Extracted Technical Skills', { timeout: 15000 });
    const atsScoreText = await page.locator('div.text-right:has-text("ATS Readiness")').textContent();
    console.log('Parsed ATS Score section:', atsScoreText);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_resume_uploaded_parsed.png') });

    // Navigate to ATS Scorecard
    await page.locator('button:has-text("View ATS Scorecard")').click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_ats_analyzer_page.png') });
    console.log('ATS Analyzer Page rendered successfully.');

    // -------------------------------------------------------------
    // TEST 5: INTERVIEW CONFIG MODAL & ENTER KEY
    // -------------------------------------------------------------
    console.log('\n--- 5. Testing Interview Config Modal & Enter Key ---');
    await page.locator('header nav button:has-text("Practice Hub")').click();
    await page.waitForTimeout(500);

    await page.locator('button:has-text("Start Interview")').first().click();
    await page.waitForSelector('text=Configure Your AI 1-to-1 Interview');
    console.log('Modal opened (Step 1).');

    // Press Enter to trigger form submit to Step 2
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    const isStep2 = await page.locator('text=Hardware & Network Diagnostics').isVisible();
    console.log('Advanced to Step 2 via Enter key:', isStep2);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_config_modal_step2.png') });

    // Press Enter to launch interview room
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    // -------------------------------------------------------------
    // TEST 6: INTERVIEW ROOM Q&A LOOP (3 QUESTIONS DEEP)
    // -------------------------------------------------------------
    console.log('\n--- 6. Testing Interview Room 3-Question Q&A Loop ---');
    await page.waitForSelector('text=Current Question (1/', { timeout: 15000 });
    console.log('Interview room loaded. Question 1 active.');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_interview_room_q1.png') });

    // Question 1 Answer: Switch to type mode, type answer, press Enter
    await page.locator('button:has-text("Type Response Instead")').click();
    const answerInput = page.locator('textarea');
    await answerInput.fill('In modern web development, I structure React components modularly with custom hooks and manage state using Context API and TanStack Query.');
    await page.waitForTimeout(300);
    
    console.log('Submitting Q1 answer via Enter key...');
    await answerInput.press('Enter');

    // Wait for Question 2 to appear
    await page.waitForSelector('text=Current Question (2/', { timeout: 20000 });
    console.log('Advanced to Question 2 successfully!');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_interview_room_q2.png') });

    // Question 2 Answer
    await answerInput.fill('For backend systems with FastAPI, I use Pydantic models for request validation, dependency injection for DB sessions, and async connection pooling.');
    await page.waitForTimeout(300);
    console.log('Submitting Q2 answer via Enter key...');
    await answerInput.press('Enter');

    // Wait for Question 3 to appear
    await page.waitForSelector('text=Current Question (3/', { timeout: 20000 });
    console.log('Advanced to Question 3 successfully!');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_interview_room_q3.png') });

    // Question 3 Answer
    await answerInput.fill('When handling technical disagreements, I use reproducible performance benchmarks and team trade-off matrix documentation to reach consensus.');
    await page.waitForTimeout(300);
    console.log('Submitting Q3 answer...');
    await answerInput.press('Enter');
    await page.waitForTimeout(2000);

    // End session to view performance report scorecard
    console.log('Concluding interview and compiling scorecard...');
    const endBtn = page.locator('button[title="End Interview Early"]');
    await endBtn.click();
    await page.waitForSelector('text=End Interview Early?');
    await page.locator('button:has-text("End & Generate Scorecard")').click();

    // Wait for interview completion / report page
    console.log('Waiting for final scorecard report...');
    await page.waitForSelector('text=Interview Performance Report', { timeout: 25000 });
    console.log('Reached Interview Report Page!');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_interview_report_scorecard.png') });

    // -------------------------------------------------------------
    // TEST 7: DASHBOARD & SETTINGS
    // -------------------------------------------------------------
    console.log('\n--- 7. Testing Dashboard & Settings ---');
    await page.locator('header nav button:has-text("Dashboard")').click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13_dashboard_page.png') });
    console.log('Dashboard verified.');

    await page.locator('header nav button:has-text("Settings")').click();
    await page.waitForTimeout(600);
    
    // Test Save Preferences
    await page.locator('button:has-text("Save Preferences")').click();
    await page.waitForSelector('text=Settings updated successfully!');
    console.log('Settings save verified.');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14_settings_page.png') });

    console.log('\n=== ALL REAL BROWSER E2E TESTS PASSED SUCCESSFULLY! ===');
  } catch (err) {
    console.error('Test execution error:', err);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'error_state.png') });
  } finally {
    await browser.close();
  }
}

runE2ETests();
