// Authentication state
let isAuthenticated = false;
let statsData = null;
let autoRefreshInterval = null;
let authToken = null;
let votingEnabled = false; // Track voting status
let manualVoteData = { judges: {}, teachers: {} }; // Track manual vote status
let batchModeEnabled = false;

// DOM Elements
const loginPage = document.getElementById("loginPage");
const dashboardPage = document.getElementById("dashboardPage");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");
const refreshBtn = document.getElementById("refreshBtn");
const loadingSpinner = document.getElementById("loadingSpinner");

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  setupEventListeners();
  setupRevealButtons();
});

function setupEventListeners() {
  loginForm.addEventListener("submit", handleLogin);
  logoutBtn.addEventListener("click", handleLogout);
  refreshBtn.addEventListener("click", () => fetchStats(true));

  // Voting toggle
  const votingToggle = document.getElementById("votingToggle");
  if (votingToggle) {
    votingToggle.addEventListener("change", handleVotingToggle);
  }

  // Batch mode toggle
  const batchModeToggle = document.getElementById("batchModeToggle");
  if (batchModeToggle) {
    batchModeToggle.addEventListener("change", handleBatchModeToggle);
  }
}

function setupRevealButtons() {
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("reveal-btn")) {
      const gender = e.target.dataset.gender;
      const rank = parseInt(e.target.dataset.rank);
      revealSpecificRank(gender, rank);
      e.target.disabled = true;
      e.target.classList.add("btn-success");
      e.target.classList.remove("btn-outline-primary");
    }
  });
}

async function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  loginError.style.display = "none";
  showLoading(true);

  try {
    const response = await fetch(
      "https://two5-26-king-queen-backend.onrender.com/api/admindamnbro/loginkyaml",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      }
    );

    const result = await response.json();

    if (response.ok && result.success) {
      // Login successful - store JWT token
      isAuthenticated = true;
      authToken = result.token; // Token is now always provided by backend
      localStorage.setItem("adminToken", authToken);
      localStorage.setItem("adminData", JSON.stringify(result.admin));

      // Log successful login (without sensitive data)
      console.log("Login successful:", result.admin.username);

      showDashboard();
      fetchStats();
      fetchVotingStatus(); // Fetch voting status on login
      initializeManualVoteEntry(); // Initialize manual vote entry
      startAutoRefresh();
    } else {
      // Login failed
      throw new Error(
        result.error || result.message || "Invalid username or password"
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    // Handle both Error objects and fetch errors
    const errorMessage = error.message || "Login failed. Please try again.";
    loginError.textContent = errorMessage.includes("fetch")
      ? "Cannot connect to server. Please try again."
      : errorMessage;
    loginError.style.display = "block";
  } finally {
    showLoading(false);
  }
}

function handleLogout() {
  // CRITICAL: Stop auto-refresh FIRST to prevent API calls with invalid token
  stopAutoRefresh();

  // Clear all authentication state
  isAuthenticated = false;
  authToken = null;
  statsData = null;
  votingEnabled = false;
  manualVoteData = { judges: {}, teachers: {} };

  // Clear localStorage completely
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminData");

  // Double-check interval is cleared
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }

  // Show login page
  showLogin();

  // Force page reload to ensure completely clean state
  setTimeout(() => {
    window.location.href = window.location.origin + window.location.pathname;
  }, 100);
}

function checkAuth() {
  const token = localStorage.getItem("adminToken");
  if (token) {
    isAuthenticated = true;
    authToken = token;
    showDashboard();
    fetchStats();
    fetchVotingStatus(); // Fetch voting status on login
    initializeManualVoteEntry(); // Initialize manual vote entry
    startAutoRefresh();
  } else {
    showLogin();
  }
}

// Helper function to check if user is authenticated
function isAuthenticatedUser() {
  return !!localStorage.getItem("adminToken");
}

// Get current admin data
function getAdminData() {
  const data = localStorage.getItem("adminData");
  return data ? JSON.parse(data) : null;
}

// Protected API call helper function
async function callProtectedAPI(endpoint, method = "GET", body = null) {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    handleLogout();
    return null;
  }

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(
      `https://two5-26-king-queen-backend.onrender.com${endpoint}`,
      options
    );

    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      alert(errorData.message || "Session expired. Please log in again.");
      handleLogout();
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          errorData.message ||
          `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

function showLogin() {
  loginPage.style.display = "flex";
  dashboardPage.style.display = "none";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  loginError.style.display = "none";
}

function showDashboard() {
  loginPage.style.display = "none";
  dashboardPage.style.display = "block";

  // Display admin username
  const adminData = getAdminData();
  if (adminData && adminData.username) {
    const usernameElement = document.getElementById("adminUsername");
    if (usernameElement) {
      usernameElement.textContent = `👤 ${adminData.username}`;
    }
  }
}

function showLoading(show) {
  loadingSpinner.style.display = show ? "flex" : "none";
}

async function fetchStats(showLoader = false) {
  // Safety check: prevent API calls when not authenticated
  if (!isAuthenticated || !authToken) return;

  if (showLoader) showLoading(true);

  try {
    statsData = await callProtectedAPI("/api/stats/live");

    if (statsData) {
      updateDashboard(statsData);
      updateLastUpdated();
    }
  } catch (error) {
    console.error("Error fetching stats:", error);
    showError(error.message || "Failed to fetch statistics. Please try again.");
  } finally {
    if (showLoader) showLoading(false);
  }
}

function updateDashboard(data) {
  updateOverallStats(data.overall);
  updateVoteBreakdown(data); // Add vote breakdown
  updateKingChart(data.kingResults);
  updateQueenChart(data.queenResults);
  updateCollectionTable(data.byCollection);
}

function updateOverallStats(overall) {
  document.getElementById("totalStudents").textContent =
    overall.totalStudents || 0;
  document.getElementById("totalVoted").textContent = overall.totalVoted || 0;
  document.getElementById("totalNotVoted").textContent =
    overall.totalNotVoted || 0;
  document.getElementById("votingPercentage").textContent =
    overall.votingPercentage + "%" || "0%";
}

function updateVoteBreakdown(data) {
  // Calculate votes from new API structure
  const studentVotes = data.overall?.totalVoted || 0;
  const judgeVotes = data.judges?.voted || 0;
  const teacherVotes = data.teachers?.voted || 0;

  // Update UI
  const studentVotesEl = document.getElementById("studentVotes");
  const judgeVotesEl = document.getElementById("judgeVotes");
  const teacherVotesEl = document.getElementById("teacherVotes");

  if (studentVotesEl) {
    studentVotesEl.textContent = studentVotes;
    // Add weight indicator
    const studentLabel =
      studentVotesEl.parentElement.querySelector(".stat-label");
    if (studentLabel && data.weights) {
      studentLabel.innerHTML = `Student Votes <small>(${data.weights.students})</small>`;
    }
  }

  if (judgeVotesEl) {
    judgeVotesEl.textContent = `${judgeVotes}/${data.judges?.total || 10}`;
    // Add weight indicator
    const judgeLabel = judgeVotesEl.parentElement.querySelector(".stat-label");
    if (judgeLabel && data.weights) {
      judgeLabel.innerHTML = `Judge Votes <small>(${data.weights.judges})</small>`;
    }
  }

  if (teacherVotesEl) {
    teacherVotesEl.textContent = `${teacherVotes}/${
      data.teachers?.total || 10
    }`;
    // Add weight indicator
    const teacherLabel =
      teacherVotesEl.parentElement.querySelector(".stat-label");
    if (teacherLabel && data.weights) {
      teacherLabel.innerHTML = `Teacher Votes <small>(${data.weights.teachers})</small>`;
    }
  }
}

function updateKingChart(kingResults) {
  const container = document.getElementById("kingChart");
  container.innerHTML = "";

  // Results are already sorted by weightedScore from backend
  const maxScore = kingResults[0]?.weightedScore || 100;

  kingResults.forEach((candidate, index) => {
    const rank = index + 1;
    const barItem = createWeightedBarChart(
      candidate.candidateNumber,
      candidate,
      maxScore,
      rank,
      "king"
    );
    container.appendChild(barItem);
  });
}

function updateQueenChart(queenResults) {
  const container = document.getElementById("queenChart");
  container.innerHTML = "";

  // Results are already sorted by weightedScore from backend
  const maxScore = queenResults[0]?.weightedScore || 100;

  queenResults.forEach((candidate, index) => {
    const rank = index + 1;
    const barItem = createWeightedBarChart(
      candidate.candidateNumber,
      candidate,
      maxScore,
      rank,
      "queen"
    );
    container.appendChild(barItem);
  });
}

function createWeightedBarChart(
  candidateNum,
  candidate,
  maxScore,
  rank,
  gender
) {
  const barItem = document.createElement("div");
  barItem.className = "vertical-bar-item";
  barItem.dataset.gender = gender;
  barItem.dataset.rank = rank;
  barItem.dataset.candidateNum = candidateNum;

  const barWrapper = document.createElement("div");
  barWrapper.className = "vertical-bar-wrapper";

  const barFill = document.createElement("div");
  barFill.className = `vertical-bar-fill ${
    rank === 1 ? "bar-fill-top" : ""
  } bar-fill-${gender}`;
  const heightPercent =
    maxScore > 0 ? (candidate.weightedScore / maxScore) * 100 : 0;
  barFill.style.height = heightPercent + "%";

  const barValue = document.createElement("div");
  barValue.className = "vertical-bar-value";
  barValue.innerHTML = `
    <strong>${candidate.weightedScore}%</strong>
    <span class="bar-percentage" style="font-size: 11px; display: block; margin-top: 4px;">
      S: ${candidate.studentVotes} | J: ${candidate.judgeVotes} | T: ${candidate.teacherVotes}
    </span>
  `;

  const barLabel = document.createElement("div");
  barLabel.className = "vertical-bar-label blurred";
  barLabel.textContent = `C${candidateNum}`;

  // Add tooltip on hover
  barItem.title = `Candidate #${candidateNum}
Weighted Score: ${candidate.weightedScore}%
Total Votes: ${candidate.totalVotes}
  Students: ${candidate.studentVotes} (${candidate.studentPercentage}%)
  Judges: ${candidate.judgeVotes} (${candidate.judgePercentage}%)
  Teachers: ${candidate.teacherVotes} (${candidate.teacherPercentage}%)`;

  barWrapper.appendChild(barValue);
  barWrapper.appendChild(barFill);
  barItem.appendChild(barWrapper);
  barItem.appendChild(barLabel);

  return barItem;
}

function revealSpecificRank(gender, rank) {
  // Find the candidate with this rank
  const bars = document.querySelectorAll(`[data-gender="${gender}"]`);
  let candidateNum = null;

  bars.forEach((bar) => {
    const barRank = parseInt(bar.dataset.rank);
    if (barRank === rank) {
      const barLabel = bar.querySelector(".vertical-bar-label");
      if (barLabel) barLabel.classList.remove("blurred");
      candidateNum = parseInt(bar.dataset.candidateNum);
    }
  });

  // Show celebration modal
  if (candidateNum) {
    showCelebration(gender, rank, candidateNum);
  }
}

function showCelebration(gender, rank, candidateNum) {
  // Get candidate data
  const candidates =
    gender === "king"
      ? window.candidateData.maleCandidates
      : window.candidateData.femaleCandidates;

  // Match by candidate number (candidateNum could be 1-6, ids are "k1"-"k6" or "q1"-"q6")
  const prefix = gender === "king" ? "k" : "q";
  const candidateId = `${prefix}${candidateNum}`;
  const candidate = candidates.find((c) => c.id === candidateId);

  if (!candidate) return;

  // Set titles based on rank and gender
  let title, icon;
  if (rank === 1) {
    title = gender === "king" ? "👑 King" : "👸 Queen";
    icon = "👑";
  } else if (rank === 2) {
    title = gender === "king" ? "🤴 Prince" : "👸 Princess";
    icon = "🤴";
  } else if (rank === 3) {
    title = gender === "king" ? "⭐ Mr Popular" : "⭐ Mrs Popular";
    icon = "⭐";
  }

  // Update modal content
  document.getElementById("celebrationIcon").textContent = icon;
  document.getElementById("celebrationTitle").textContent = title;
  document.getElementById("celebrationPhoto").src = candidate.photo;
  document.getElementById("celebrationName").textContent = candidate.name;
  document.getElementById(
    "celebrationSubtitle"
  ).textContent = `Candidate #${candidateNum}`;

  // Show modal with animation
  const modal = new bootstrap.Modal(
    document.getElementById("celebrationModal")
  );
  modal.show();

  // Trigger confetti animation
  triggerConfetti();
}

function triggerConfetti() {
  const modal = document.querySelector(".celebration-modal");
  if (modal) {
    modal.classList.add("celebrate");
    setTimeout(() => {
      modal.classList.remove("celebrate");
    }, 3000);
  }
}

function updateCollectionTable(byCollection) {
  const tbody = document.getElementById("collectionTable");
  tbody.innerHTML = "";

  byCollection.forEach((collection) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td><strong>${collection.label}</strong></td>
      <td>${collection.totalStudents}</td>
      <td><span class="badge bg-success">${collection.votedCount}</span></td>
      <td><span class="badge bg-warning">${collection.notVotedCount}</span></td>
      <td>
        <div class="progress" style="height: 20px;">
          <div class="progress-bar bg-primary" role="progressbar" 
               style="width: ${collection.votingPercentage}%" 
               aria-valuenow="${collection.votingPercentage}" 
               aria-valuemin="0" 
               aria-valuemax="100">
            ${collection.votingPercentage}%
          </div>
        </div>
      </td>
    `;

    tbody.appendChild(row);
  });
}

function updateLastUpdated() {
  const now = new Date();
  const timeString = now.toLocaleTimeString();
  document.getElementById(
    "lastUpdated"
  ).textContent = `Last updated: ${timeString}`;
}

function startAutoRefresh() {
  // Refresh every 30 seconds
  autoRefreshInterval = setInterval(() => {
    fetchStats(false);
  }, 30000);
}

function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }
}

function showError(message) {
  // You can implement a toast notification or alert here
  alert(message);
}

// Voting Control Functions
async function fetchVotingStatus() {
  try {
    const response = await fetch(
      "https://two5-26-king-queen-backend.onrender.com/api/voting-status",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    votingEnabled = result.votingEnabled || false;
    updateVotingStatusUI();
  } catch (error) {
    console.error("Error fetching voting status:", error);
  }
}

function updateVotingStatusUI() {
  const votingToggle = document.getElementById("votingToggle");
  const votingStatusText = document.getElementById("votingStatusText");

  if (votingToggle) {
    votingToggle.checked = votingEnabled;
  }

  if (votingStatusText) {
    if (votingEnabled) {
      votingStatusText.innerHTML =
        "<strong>✅ Voting is currently OPEN</strong><br><small>Students can submit their votes</small>";
    } else {
      votingStatusText.innerHTML =
        "<strong>🔒 Voting is currently CLOSED</strong><br><small>Students cannot submit votes until you enable it</small>";
    }
  }
}

async function handleVotingToggle(event) {
  const enabled = event.target.checked;
  const votingToggle = document.getElementById("votingToggle");

  // Disable toggle while processing
  votingToggle.disabled = true;

  try {
    const result = await callProtectedAPI(
      "/api/admindamnbro/toggle-voting",
      "POST",
      { enabled: enabled }
    );

    if (result && result.success) {
      votingEnabled = result.votingEnabled;
      updateVotingStatusUI();

      // Show success message
      const message = enabled
        ? "🎉 Voting is now OPEN! Students can now submit their votes."
        : "🔒 Voting is now CLOSED. Students cannot submit votes.";
      alert(message);
    } else {
      throw new Error("Failed to update voting status");
    }
  } catch (error) {
    console.error("Error toggling voting:", error);
    alert("Failed to update voting status: " + error.message);

    // Revert toggle on error
    votingToggle.checked = votingEnabled;
  } finally {
    votingToggle.disabled = false;
  }
}

// Manual Vote Entry Functions
function initializeManualVoteEntry() {
  // Initialize judges (J001 - J010)
  for (let i = 1; i <= 10; i++) {
    const judgeId = `J${String(i).padStart(3, "0")}`;
    manualVoteData.judges[judgeId] = {
      voted: false,
      name: "",
      king: null,
      queen: null,
    };
  }

  // Initialize teachers (T001 - T010)
  for (let i = 1; i <= 10; i++) {
    const teacherId = `T${String(i).padStart(3, "0")}`;
    manualVoteData.teachers[teacherId] = {
      voted: false,
      name: "",
      king: null,
      queen: null,
    };
  }

  // Fetch existing votes
  fetchManualVotes();

  // Generate UI
  generateJudgesUI();
  generateTeachersUI();
}

async function fetchManualVotes() {
  // Safety check: prevent API calls when not authenticated
  if (!isAuthenticated || !authToken) return;

  try {
    // Fetch judges
    const judgesData = await callProtectedAPI("/api/admin/judges");
    if (judgesData && judgesData.judges) {
      judgesData.judges.forEach((judge) => {
        if (manualVoteData.judges[judge.judgeId]) {
          manualVoteData.judges[judge.judgeId] = {
            voted: judge.voted,
            name: judge.name || "",
            king: judge.king,
            queen: judge.queen,
          };
        }
      });
    }

    // Fetch teachers
    const teachersData = await callProtectedAPI("/api/admin/teachers");
    if (teachersData && teachersData.teachers) {
      teachersData.teachers.forEach((teacher) => {
        if (manualVoteData.teachers[teacher.teacherId]) {
          manualVoteData.teachers[teacher.teacherId] = {
            voted: teacher.voted,
            name: teacher.name || "",
            king: teacher.king,
            queen: teacher.queen,
          };
        }
      });
    }

    updateManualVoteProgress();
  } catch (error) {
    console.error("Error fetching manual votes:", error);
  }
}

function generateJudgesUI() {
  const accordion = document.getElementById("judgesAccordion");
  if (!accordion) return;

  accordion.innerHTML = "";

  Object.keys(manualVoteData.judges).forEach((judgeId, index) => {
    const judge = manualVoteData.judges[judgeId];
    const item = createManualVoteItem(judgeId, judge, "judges", index);
    accordion.appendChild(item);
  });
}

function generateTeachersUI() {
  const accordion = document.getElementById("teachersAccordion");
  if (!accordion) return;

  accordion.innerHTML = "";

  Object.keys(manualVoteData.teachers).forEach((teacherId, index) => {
    const teacher = manualVoteData.teachers[teacherId];
    const item = createManualVoteItem(teacherId, teacher, "teachers", index);
    accordion.appendChild(item);
  });
}

function createManualVoteItem(id, data, type, index) {
  const accordionItem = document.createElement("div");
  accordionItem.className = "accordion-item";

  // Status badge and color
  let statusBadge = "";
  let headerClass = "";

  if (data.voted) {
    statusBadge = '<span class="badge bg-success">✓ Voted</span>';
    headerClass = "bg-light";
  } else {
    statusBadge = '<span class="badge bg-warning">⏳ Pending</span>';
  }

  const collapseId = `collapse-${type}-${index}`;

  accordionItem.innerHTML = `
    <h2 class="accordion-header">
      <button class="accordion-button ${
        data.voted ? "collapsed" : ""
      } ${headerClass}" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target="#${collapseId}"
              ${data.voted && !batchModeEnabled ? "disabled" : ""}>
        <div class="d-flex justify-content-between w-100 align-items-center pe-3">
          <span><strong>${id}</strong> ${
    data.voted ? `- ${data.name}` : ""
  }</span>
          ${statusBadge}
        </div>
      </button>
    </h2>
    <div id="${collapseId}" class="accordion-collapse collapse ${
    !data.voted && index === 0 && batchModeEnabled ? "show" : ""
  }" data-bs-parent="#${type}Accordion">
      <div class="accordion-body">
        ${data.voted ? createReadOnlyView(data) : createVoteForm(id, type)}
      </div>
    </div>
  `;

  return accordionItem;
}

function createReadOnlyView(data) {
  return `
    <div class="alert alert-success mb-0">
      <div class="row">
        <div class="col-md-4">
          <strong>Name:</strong> ${data.name}
        </div>
        <div class="col-md-4">
          <strong>King:</strong> Candidate #${data.king}
        </div>
        <div class="col-md-4">
          <strong>Queen:</strong> Candidate #${data.queen}
        </div>
      </div>
      <small class="text-muted d-block mt-2">✓ Vote recorded. Cannot be edited to prevent tampering.</small>
    </div>
  `;
}

function createVoteForm(id, type) {
  return `
    <form class="manual-vote-form" data-id="${id}" data-type="${type}">
      <div class="row g-3">
        <div class="col-md-4">
          <label class="form-label fw-bold">Name <span class="text-danger">*</span></label>
          <input type="text" class="form-control" name="name" placeholder="Enter full name" required>
        </div>
        <div class="col-md-3">
          <label class="form-label fw-bold">King <span class="text-danger">*</span></label>
          <select class="form-select" name="king" required>
            <option value="">Select...</option>
            ${[1, 2, 3, 4, 5, 6]
              .map((n) => `<option value="${n}">Candidate #${n}</option>`)
              .join("")}
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label fw-bold">Queen <span class="text-danger">*</span></label>
          <select class="form-select" name="queen" required>
            <option value="">Select...</option>
            ${[1, 2, 3, 4, 5, 6]
              .map((n) => `<option value="${n}">Candidate #${n}</option>`)
              .join("")}
          </select>
        </div>
        <div class="col-md-2 d-flex align-items-end">
          <button type="submit" class="btn btn-primary w-100">Submit</button>
        </div>
      </div>
      <div class="alert alert-danger mt-2" style="display: none;" role="alert"></div>
      <div class="alert alert-success mt-2" style="display: none;" role="alert"></div>
    </form>
  `;
}

// Set up form submission handlers
document.addEventListener("submit", async (e) => {
  if (e.target.classList.contains("manual-vote-form")) {
    e.preventDefault();
    await handleManualVoteSubmit(e.target);
  }
});

async function handleManualVoteSubmit(form) {
  const id = form.dataset.id;
  const type = form.dataset.type;
  const submitBtn = form.querySelector('button[type="submit"]');
  const errorDiv = form.querySelector(".alert-danger");
  const successDiv = form.querySelector(".alert-success");

  // Get form data
  const formData = new FormData(form);
  const name = formData.get("name").trim();
  const king = parseInt(formData.get("king"));
  const queen = parseInt(formData.get("queen"));

  // Hide previous messages
  errorDiv.style.display = "none";
  successDiv.style.display = "none";

  // Validation
  if (!name) {
    errorDiv.textContent = "Name is required";
    errorDiv.style.display = "block";
    return;
  }

  if (!king || king < 1 || king > 6) {
    errorDiv.textContent = "King must be between 1 and 6";
    errorDiv.style.display = "block";
    return;
  }

  if (!queen || queen < 1 || queen > 6) {
    errorDiv.textContent = "Queen must be between 1 and 6";
    errorDiv.style.display = "block";
    return;
  }

  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  try {
    // Determine the correct endpoint
    const endpoint =
      type === "judges"
        ? `/api/admin/judge/${id}/vote`
        : `/api/admin/teacher/${id}/vote`;

    const result = await callProtectedAPI(endpoint, "POST", {
      name: name,
      king: king,
      queen: queen,
    });

    if (result && result.success) {
      // Update local data
      const dataObj =
        type === "judges" ? manualVoteData.judges : manualVoteData.teachers;
      dataObj[id] = {
        voted: true,
        name: name,
        king: king,
        queen: queen,
      };

      // Show success message
      successDiv.textContent = `✓ Vote for ${id} recorded successfully!`;
      successDiv.style.display = "block";

      // Refresh UI after short delay
      setTimeout(() => {
        if (type === "judges") {
          generateJudgesUI();
        } else {
          generateTeachersUI();
        }
        updateManualVoteProgress();
        fetchStats(false); // Refresh statistics

        // In batch mode, auto-focus next entry
        if (batchModeEnabled) {
          focusNextPendingEntry(type);
        }
      }, 1000);
    } else {
      throw new Error(
        result.message || result.error || "Failed to submit vote"
      );
    }
  } catch (error) {
    console.error("Error submitting manual vote:", error);
    let errorMessage =
      error.message || "Failed to submit vote. Please try again.";

    if (
      errorMessage.includes("already voted") ||
      errorMessage.includes("already recorded")
    ) {
      errorMessage =
        "Vote already recorded for this " +
        (type === "judges" ? "judge" : "teacher");
    } else if (errorMessage.includes("JSON")) {
      errorMessage = "Server error: Invalid response format from API.";
    }

    errorDiv.textContent = errorMessage;
    errorDiv.style.display = "block";
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit";
  }
}

function updateManualVoteProgress() {
  const judgesVoted = Object.values(manualVoteData.judges).filter(
    (j) => j.voted
  ).length;
  const teachersVoted = Object.values(manualVoteData.teachers).filter(
    (t) => t.voted
  ).length;

  const judgesProgress = document.getElementById("judgesProgress");
  const teachersProgress = document.getElementById("teachersProgress");

  if (judgesProgress) {
    judgesProgress.textContent = `${judgesVoted}/10 voted`;
    judgesProgress.parentElement.className =
      judgesVoted === 10 ? "alert alert-success mb-0" : "alert alert-info mb-0";
  }

  if (teachersProgress) {
    teachersProgress.textContent = `${teachersVoted}/10 voted`;
    teachersProgress.parentElement.className =
      teachersVoted === 10
        ? "alert alert-success mb-0"
        : "alert alert-info mb-0";
  }
}

function handleBatchModeToggle(event) {
  batchModeEnabled = event.target.checked;

  if (batchModeEnabled) {
    // Regenerate UI in batch mode
    generateJudgesUI();
    generateTeachersUI();

    // Focus first pending entry
    focusNextPendingEntry("judges");
  } else {
    // Regenerate UI in normal mode
    generateJudgesUI();
    generateTeachersUI();
  }
}

function focusNextPendingEntry(currentType) {
  // Find next pending entry
  let nextType = currentType;
  let dataObj =
    currentType === "judges" ? manualVoteData.judges : manualVoteData.teachers;
  let nextId = null;

  // Find next pending in current type
  for (const id in dataObj) {
    if (!dataObj[id].voted) {
      nextId = id;
      break;
    }
  }

  // If all done in current type, try other type
  if (!nextId) {
    nextType = currentType === "judges" ? "teachers" : "judges";
    dataObj =
      nextType === "judges" ? manualVoteData.judges : manualVoteData.teachers;

    for (const id in dataObj) {
      if (!dataObj[id].voted) {
        nextId = id;
        break;
      }
    }
  }

  if (nextId) {
    // Switch tab if needed
    if (nextType !== currentType) {
      const tab = document.getElementById(`${nextType}-tab`);
      if (tab) {
        tab.click();
      }
    }

    // Open the accordion and focus the input
    setTimeout(() => {
      const form = document.querySelector(`form[data-id="${nextId}"]`);
      if (form) {
        const nameInput = form.querySelector('input[name="name"]');
        if (nameInput) {
          nameInput.focus();
        }
      }
    }, 300);
  }
}

// Add keyboard shortcuts for batch mode
document.addEventListener("keydown", (e) => {
  if (!batchModeEnabled) return;

  // Ctrl/Cmd + Enter to submit focused form
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    const activeElement = document.activeElement;
    const form = activeElement.closest(".manual-vote-form");
    if (form) {
      e.preventDefault();
      form.requestSubmit();
    }
  }
});
