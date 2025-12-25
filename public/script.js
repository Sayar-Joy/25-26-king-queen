// Populate king and queen carousels from shared candidate data.
let selectedKing = null;
let selectedQueen = null;
let votingEnabled = true; // Default to true, will be updated by API
let votingStatusCheckInterval = null;

document.addEventListener("DOMContentLoaded", () => {
  const data = window.candidateData || {};
  const { maleCandidates = [], femaleCandidates = [] } = data;

  renderCarousel(maleCandidates, "kingCarousel", {
    pronoun: "him",
    gender: "king",
  });
  renderCarousel(femaleCandidates, "queenCarousel", {
    pronoun: "her",
    gender: "queen",
  });

  bindCandidateDetailOverlay();
  initRobotAssistant();
  initAuthModal();

  // Check voting status on page load
  checkVotingStatus();

  // Poll voting status every 30 seconds
  votingStatusCheckInterval = setInterval(checkVotingStatus, 30000);
});

function renderCarousel(candidates, carouselId, { pronoun, gender }) {
  const carousel = document.getElementById(carouselId);
  const inner = carousel?.querySelector(".carousel-inner");
  if (!carousel || !inner) {
    return;
  }

  inner.innerHTML = "";

  if (!Array.isArray(candidates) || candidates.length === 0) {
    inner.appendChild(createEmptySlide());
    return;
  }

  const item = document.createElement("div");
  item.className = "carousel-item active";

  const scroller = document.createElement("div");
  scroller.className = "candidate-scroller";

  // Render exactly one set of cards (no infinite wrap / no jumping).
  candidates.forEach((candidate, index) => {
    scroller.appendChild(
      createCandidateCard(candidate, index, { pronoun, gender })
    );
  });

  item.appendChild(scroller);
  inner.appendChild(item);

  bindScrollerControls(carousel, scroller);
  bindCenterFocus(scroller);
}

function createCandidateCard(candidate, index, { pronoun, gender }) {
  const slide = document.createElement("div");
  slide.className = "candidate-slide";
  slide.dataset.originalIndex = String(index);
  slide.dataset.candidateId = candidate.id || index;
  slide.dataset.gender = gender;

  const card = document.createElement("div");
  card.className = "candidate-card text-center";

  const placeholder = document.createElement("div");
  placeholder.className = "candidate-img";
  if (candidate.photo) {
    placeholder.style.backgroundImage = `url('${candidate.photo}')`;
  }

  const name = document.createElement("h5");
  name.className = "mt-3 fw-bold";
  name.textContent = candidate.name || "Unnamed Candidate";

  const voteButton = document.createElement("button");
  voteButton.className = "btn vote-btn w-100";
  voteButton.type = "button";
  voteButton.textContent = "Vote";
  voteButton.addEventListener("click", () => {
    handleVote(candidate, card, gender);
  });

  const moreButton = document.createElement("button");
  moreButton.className = "btn btn-outline-primary w-100 mt-2 rounded-pill";
  moreButton.type = "button";
  moreButton.textContent = `More about ${pronoun}`;
  moreButton.addEventListener("click", () => {
    openCandidateDetail(candidate);
  });

  card.appendChild(placeholder);
  card.appendChild(name);
  card.appendChild(voteButton);
  card.appendChild(moreButton);

  slide.appendChild(card);
  return slide;
}

function bindCandidateDetailOverlay() {
  const overlay = document.getElementById("candidateDetailOverlay");
  const closeBtn = document.getElementById("candidateDetailClose");
  if (!overlay || !closeBtn) {
    return;
  }

  closeBtn.addEventListener("click", closeCandidateDetail);

  // ESC to close
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCandidateDetail();
    }
  });
}

function openCandidateDetail(candidate) {
  const overlay = document.getElementById("candidateDetailOverlay");
  if (!overlay) {
    return;
  }

  const photoCarousel = document.getElementById("candidateDetailPhotoCarousel");
  const name = document.getElementById("candidateDetailName");
  const roll = document.getElementById("candidateDetailRoll");
  const hobby = document.getElementById("candidateDetailHobby");
  const about = document.getElementById("candidateDetailAbout");

  // Handle photo carousel - use detailPhotos if available, otherwise use main photo
  if (photoCarousel) {
    const photos =
      candidate?.detailPhotos && candidate.detailPhotos.length > 0
        ? candidate.detailPhotos
        : [candidate?.photo || ""];

    photoCarousel.innerHTML = photos
      .map(
        (photo, index) => `
      <div class="carousel-item ${index === 0 ? "active" : ""}">
        <div class="candidate-img candidate-detail-photo" style="background-image: url('${photo}')"></div>
      </div>
    `
      )
      .join("");

    // Re-initialize Bootstrap carousel to enable touch swipe
    const carouselElement = document.getElementById("candidatePhotoCarousel");
    if (carouselElement && window.bootstrap) {
      const bsCarousel = new bootstrap.Carousel(carouselElement, {
        interval: false,
        touch: true,
        wrap: true,
      });
    }
  }

  if (name) {
    name.textContent = candidate?.name || "";
  }
  if (roll) {
    roll.textContent = candidate?.rollNumber || "";
  }
  if (hobby) {
    hobby.textContent = candidate?.hobby || "";
  }
  if (about) {
    about.textContent = candidate?.about || "";
  }

  overlay.hidden = false;
  document.body.classList.add("detail-open");
}

function closeCandidateDetail() {
  const overlay = document.getElementById("candidateDetailOverlay");
  if (!overlay) {
    return;
  }
  overlay.hidden = true;
  document.body.classList.remove("detail-open");
}

function initRobotAssistant() {
  const robot = document.getElementById("robot-assistant");
  const messageEl = document.getElementById("robot-message");

  if (!robot || !messageEl) return;

  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 20; // Start from initial left position
  let yOffset = 100; // Start from initial top position

  // Make robot draggable
  robot.addEventListener("mousedown", dragStart);
  robot.addEventListener("touchstart", dragStart);
  document.addEventListener("mousemove", drag);
  document.addEventListener("touchmove", drag);
  document.addEventListener("mouseup", dragEnd);
  document.addEventListener("touchend", dragEnd);

  function dragStart(e) {
    if (e.type === "touchstart") {
      initialX = e.touches[0].clientX - xOffset;
      initialY = e.touches[0].clientY - yOffset;
    } else {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
    }

    if (e.target === robot || robot.contains(e.target)) {
      isDragging = true;
      robot.style.cursor = "grabbing";
      // Disable float animation while dragging
      robot.style.animation = "none";
      e.preventDefault();
    }
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();

      if (e.type === "touchmove") {
        currentX = e.touches[0].clientX - initialX;
        currentY = e.touches[0].clientY - initialY;
      } else {
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
      }

      xOffset = currentX;
      yOffset = currentY;

      // Use left/top positioning instead of transform to avoid conflicts
      robot.style.left = `${currentX}px`;
      robot.style.top = `${currentY}px`;
      robot.style.right = "auto";
      robot.style.bottom = "auto";
      robot.style.transform = "translateY(0)"; // Keep for float animation
    }
  }

  function dragEnd(e) {
    if (isDragging) {
      initialX = currentX;
      // Re-enable float animation after dragging
      robot.style.animation = "robotFloat 3s ease-in-out infinite";
    }
  }

  // Set initial position
  robot.style.cursor = "grab";
  robot.style.position = "fixed";
  robot.style.left = "20px";
  robot.style.top = "100px";

  const tips = [
    "👋 Hi! Click on any candidate card to learn more about them!",
    "💡 Swipe left or right to browse through all candidates.",
    "✨ Click the 'More about him/her' button for full details.",
    "🎯 Use the King/Queen tabs to switch between categories.",
    "📱 This site works great on mobile too!",
    "🌟 Vote for your favorite candidate by clicking the Vote button!",
    "🔍 The centered card is highlighted - swipe to change focus.",
    "💫 Check out the Rules page to learn how voting works!",
    "🎨 Enjoying the cosmic background? It rotates slowly!",
    "👀 Each candidate has unique hobbies and interests!",
  ];

  let currentTipIndex = 0;
  let messageVisible = false;

  function showRandomTip() {
    if (messageVisible) return;

    const tip = tips[currentTipIndex];
    messageEl.textContent = tip;
    messageEl.classList.add("show");
    messageVisible = true;

    currentTipIndex = (currentTipIndex + 1) % tips.length;

    setTimeout(() => {
      messageEl.classList.remove("show");
      messageVisible = false;
    }, 6000);
  }

  // Show first tip after 2 seconds
  setTimeout(showRandomTip, 2000);

  // Random position movement
  function moveRobotRandomly() {
    const positions = [
      { left: "20px", top: "100px", right: "auto", bottom: "auto" },
      { right: "20px", top: "100px", left: "auto", bottom: "auto" },
      { left: "20px", bottom: "80px", top: "auto", right: "auto" },
      { right: "20px", bottom: "80px", left: "auto", top: "auto" },
      {
        left: "50%",
        top: "120px",
        transform: "translateX(-50%)",
        right: "auto",
        bottom: "auto",
      },
    ];

    const randomPos = positions[Math.floor(Math.random() * positions.length)];
    Object.assign(robot.style, randomPos);
  }

  // Move robot to random position every 20-30 seconds
  setInterval(moveRobotRandomly, Math.random() * 10000 + 20000);

  // Show tips randomly every 15-25 seconds
  setInterval(() => {
    if (!messageVisible) {
      showRandomTip();
    }
  }, Math.random() * 10000 + 15000);

  // Click robot to show tip immediately
  robot.addEventListener("click", () => {
    if (!messageVisible) {
      showRandomTip();
    }
  });
}

function createEmptySlide() {
  const item = document.createElement("div");
  item.classList.add("carousel-item", "active");

  const column = document.createElement("div");
  column.className = "col-md-6 mx-auto";

  const alert = document.createElement("div");
  alert.className = "alert alert-info text-center";
  alert.textContent = "No candidates available yet. Check back later.";

  column.appendChild(alert);
  item.appendChild(column);
  return item;
}

function bindScrollerControls(carousel, scroller) {
  if (carousel.dataset.scrollerControlsBound === "true") {
    return;
  }
  carousel.dataset.scrollerControlsBound = "true";

  const prevBtn = carousel.querySelector('[data-bs-slide="prev"]');
  const nextBtn = carousel.querySelector('[data-bs-slide="next"]');

  const getScrollAmount = () => {
    const firstCard = scroller.querySelector(".candidate-slide");
    if (!firstCard) {
      return 320;
    }
    const cardWidth = firstCard.getBoundingClientRect().width;
    return Math.max(240, Math.round(cardWidth));
  };

  prevBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    scroller.scrollBy({ left: -getScrollAmount(), behavior: "smooth" });
  });

  nextBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    scroller.scrollBy({ left: getScrollAmount(), behavior: "smooth" });
  });
}

function bindCenterFocus(scroller) {
  if (scroller.dataset.centerFocusBound === "true") {
    return;
  }
  scroller.dataset.centerFocusBound = "true";

  let rafId = null;

  const updateActive = () => {
    rafId = null;

    const slides = Array.from(scroller.querySelectorAll(".candidate-slide"));
    if (slides.length === 0) {
      return;
    }

    const centerX = scroller.scrollLeft + scroller.clientWidth / 2;
    let bestSlide = slides[0];
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const slide of slides) {
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const distance = Math.abs(slideCenter - centerX);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestSlide = slide;
      }
    }

    for (const slide of slides) {
      slide.classList.toggle("is-active", slide === bestSlide);
    }
  };

  const scheduleUpdate = () => {
    if (rafId !== null) {
      return;
    }
    rafId = requestAnimationFrame(updateActive);
  };

  scroller.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);

  scheduleUpdate();
}

function handleVote(candidate, cardElement, gender) {
  // Check if voting is enabled
  if (!votingEnabled) {
    alert(
      "⚠️ Voting is currently closed. The voting will open on January 9, 2026."
    );
    return;
  }

  if (gender === "king") {
    // Remove previous king selection
    const prevSelected = document.querySelector(
      "#kingCarousel .candidate-card.selected"
    );
    if (prevSelected) {
      prevSelected.classList.remove("selected");
    }
    selectedKing = candidate;
  } else if (gender === "queen") {
    // Remove previous queen selection
    const prevSelected = document.querySelector(
      "#queenCarousel .candidate-card.selected"
    );
    if (prevSelected) {
      prevSelected.classList.remove("selected");
    }
    selectedQueen = candidate;
  }

  // Add selected class to current card
  cardElement.classList.add("selected");

  // Update selection display
  updateSelectionDisplay();

  // If both selected, show auth modal
  if (selectedKing && selectedQueen) {
    setTimeout(() => {
      showAuthModal();
    }, 500);
  }
}

function updateSelectionDisplay() {
  const displayBox = document.getElementById("selectionDisplay");
  const kingDiv = document.getElementById("selectionKing");
  const queenDiv = document.getElementById("selectionQueen");
  const kingNameSpan = document.getElementById("selectionKingName");
  const queenNameSpan = document.getElementById("selectionQueenName");

  if (selectedKing) {
    kingNameSpan.textContent = selectedKing.name;
    kingDiv.style.display = "block";
  } else {
    kingDiv.style.display = "none";
  }

  if (selectedQueen) {
    queenNameSpan.textContent = selectedQueen.name;
    queenDiv.style.display = "block";
  } else {
    queenDiv.style.display = "none";
  }

  if (selectedKing || selectedQueen) {
    displayBox.classList.add("show");
  } else {
    displayBox.classList.remove("show");
  }
}

function showAuthModal() {
  const authKingName = document.getElementById("authKingName");
  const authQueenName = document.getElementById("authQueenName");

  authKingName.textContent = selectedKing?.name || "";
  authQueenName.textContent = selectedQueen?.name || "";

  const authModal = new bootstrap.Modal(document.getElementById("authModal"));
  authModal.show();
}

function initAuthModal() {
  const confirmBtn = document.getElementById("confirmVoteBtn");
  const classSelect = document.getElementById("authClass");
  const rollSelect = document.getElementById("authRollNumber");
  const errorDiv = document.getElementById("authError");
  const successDiv = document.getElementById("authSuccess");

  // Class to student count mapping
  const classStudentCounts = {
    firstYear: 80,
    secondYear: 60,
    thirdYear: 55,
    fourthYearFirst: 45,
    fourthYearSecond: 47,
    fifthYear: 20,
    finalYear: 15,
  };

  // Class to roll number prefix mapping
  const rollNumberPrefixes = {
    firstYear: "FY1",
    secondYear: "SY3",
    thirdYear: "TY",
    fourthYearFirst: "FY1S",
    fourthYearSecond: "FY2S",
    fifthYear: "FFY",
    finalYear: "FNL",
  };

  // Handle class selection change
  classSelect?.addEventListener("change", () => {
    const selectedClass = classSelect.value;

    // Clear error messages
    errorDiv.style.display = "none";
    successDiv.style.display = "none";

    if (!selectedClass) {
      rollSelect.disabled = true;
      rollSelect.innerHTML =
        '<option value="">-- First select your class --</option>';
      return;
    }

    // Populate roll numbers based on selected class
    const studentCount = classStudentCounts[selectedClass];
    const prefix = rollNumberPrefixes[selectedClass];
    rollSelect.innerHTML =
      '<option value="">-- Select your roll number --</option>';

    for (let i = 1; i <= studentCount; i++) {
      const option = document.createElement("option");
      const formattedNumber = String(i).padStart(3, "0");
      const rollNumber = `${prefix}-${formattedNumber}`;
      option.value = rollNumber;
      option.textContent = rollNumber;
      rollSelect.appendChild(option);
    }

    rollSelect.disabled = false;
  });

  confirmBtn?.addEventListener("click", () => {
    const nameInput = document.getElementById("authName");
    const selectedClass = classSelect.value;
    const rollNumber = rollSelect.value;
    const pinInput = document.getElementById("authPin");
    const name = nameInput?.value?.trim();
    const pin = pinInput?.value;

    errorDiv.style.display = "none";
    successDiv.style.display = "none";

    if (!name) {
      errorDiv.textContent = "Please enter your name.";
      errorDiv.style.display = "block";
      return;
    }

    if (!selectedClass) {
      errorDiv.textContent = "Please select your class.";
      errorDiv.style.display = "block";
      return;
    }

    if (!rollNumber) {
      errorDiv.textContent = "Please select your roll number.";
      errorDiv.style.display = "block";
      return;
    }

    if (!pin) {
      errorDiv.textContent = "Please enter your PIN.";
      errorDiv.style.display = "block";
      return;
    }

    // Map the vote data
    const voteData = mapVoteData(
      rollNumber,
      pin,
      name,
      selectedKing,
      selectedQueen
    );

    // Get collection name from selected class
    const collection = getCollectionName(selectedClass);

    // Submit vote
    submitVote(
      voteData,
      collection,
      confirmBtn,
      errorDiv,
      successDiv,
      classSelect,
      rollSelect,
      pinInput,
      nameInput
    );
  });
}

/**
 * Maps class selection to API collection name
 * @param {string} classValue - The selected class value from dropdown
 * @returns {string} The API collection name
 */
function getCollectionName(classValue) {
  const collectionMap = {
    firstYear: "firstyearsem1",
    secondYear: "secondyearsem3",
    thirdYear: "thirdyear",
    fourthYearFirst: "fourthyearfirstsem",
    fourthYearSecond: "fourthyearsecondsem",
    fifthYear: "fifthyear",
    finalYear: "finalyear",
  };
  return collectionMap[classValue] || classValue;
}

/**
 * Maps the vote submission data to match the backend data structure
 * @param {string|number} rollNumber - The roll number of the student (e.g., "FY1-001", "FNL-015")
 * @param {string|number} pin - The PIN for authentication
 * @param {string} name - The name of the student
 * @param {Object} kingCandidate - The selected king candidate object
 * @param {Object} queenCandidate - The selected queen candidate object
 * @returns {Object} The mapped vote data ready for submission
 */
function mapVoteData(rollNumber, pin, name, kingCandidate, queenCandidate) {
  return {
    rollNumber: rollNumber, // Keep as string (e.g., "FY1-001")
    pin: parseInt(pin),
    name: name || null,
    king: kingCandidate?.id ? parseInt(kingCandidate.id) : null,
    queen: queenCandidate?.id ? parseInt(queenCandidate.id) : null,
  };
}

/**
 * Submits the vote data to the backend
 * @param {Object} voteData - The vote data to submit
 * @param {string} collection - The collection name (e.g., 'fifthyear', 'finalyear')
 * @param {HTMLElement} confirmBtn - The confirm button element
 * @param {HTMLElement} errorDiv - The error message div
 * @param {HTMLElement} successDiv - The success message div
 * @param {HTMLElement} classSelect - The class select element
 * @param {HTMLElement} rollSelect - The roll select element
 * @param {HTMLElement} pinInput - The PIN input element
 * @param {HTMLElement} nameInput - The name input element
 */
async function submitVote(
  voteData,
  collection,
  confirmBtn,
  errorDiv,
  successDiv,
  classSelect,
  rollSelect,
  pinInput,
  nameInput
) {
  confirmBtn.disabled = true;
  confirmBtn.textContent = "Submitting...";

  try {
    // Call the dynamic API endpoint: POST https://two5-26-king-queen-backend.onrender.com/api/{collection}/vote
    const apiUrl = `https://two5-26-king-queen-backend.onrender.com/api/${collection}/vote`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(voteData),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      // Success
      const kingName = selectedKing?.name || "King";
      const queenName = selectedQueen?.name || "Queen";
      successDiv.innerHTML = `
        <strong>✓ Vote submitted successfully!</strong><br>
        Your vote for <strong>${kingName}</strong> (King) and <strong>${queenName}</strong> (Queen) has been recorded.
      `;
      successDiv.style.display = "block";

      confirmBtn.textContent = "Submitted!";

      setTimeout(() => {
        const authModal = bootstrap.Modal.getInstance(
          document.getElementById("authModal")
        );
        authModal?.hide();

        // Reset form
        confirmBtn.disabled = false;
        confirmBtn.textContent = "Confirm Vote";
        if (nameInput) nameInput.value = "";
        classSelect.value = "";
        rollSelect.value = "";
        rollSelect.disabled = true;
        rollSelect.innerHTML =
          '<option value="">-- First select your class --</option>';
        if (pinInput) pinInput.value = "";
        successDiv.style.display = "none";

        // Reset selections
        selectedKing = null;
        selectedQueen = null;
        updateSelectionDisplay();
      }, 2000);
    } else {
      // Handle error responses
      const errorMessage =
        result.error || result.message || "Failed to submit vote";
      const errorDetails = result.details ? ` - ${result.details}` : "";
      throw new Error(errorMessage + errorDetails);
    }
  } catch (error) {
    console.error("Vote submission error:", error);
    let userMessage =
      error.message || "Failed to submit vote. Please try again.";

    // Handle common error messages
    if (userMessage.includes("Invalid PIN")) {
      userMessage = "Invalid PIN. Please check your PIN and try again.";
    } else if (userMessage.includes("Already voted")) {
      userMessage = "You have already submitted your vote.";
    } else if (userMessage.includes("Student not found")) {
      userMessage = "Student not found. Please check your roll number.";
    } else if (userMessage.includes("Name is required")) {
      userMessage = "Please enter your name.";
    } else if (
      userMessage.includes("Voting is currently closed") ||
      userMessage.includes("403")
    ) {
      userMessage =
        "⚠️ Voting is currently closed. The voting will open on January 9, 2026.";
    } else if (userMessage.includes("Failed to fetch")) {
      userMessage =
        "Cannot connect to server. Please check your internet connection or try again later.";
    }

    errorDiv.textContent = userMessage;
    errorDiv.style.display = "block";
    confirmBtn.disabled = false;
    confirmBtn.textContent = "Confirm Vote";
  }
}

// Voting Status Functions
async function checkVotingStatus() {
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
      console.error("Failed to fetch voting status");
      return;
    }

    const result = await response.json();
    votingEnabled = result.votingEnabled || false;
    updateVotingUI();
  } catch (error) {
    console.error("Error checking voting status:", error);
    // On error, keep votingEnabled at current value
  }
}

function updateVotingUI() {
  const votingClosedAlert = document.getElementById("votingClosedAlert");
  const voteButtons = document.querySelectorAll(".vote-btn");
  const confirmVoteBtn = document.getElementById("confirmVoteBtn");

  if (votingClosedAlert) {
    votingClosedAlert.style.display = votingEnabled ? "none" : "block";
  }

  // Enable/disable vote buttons
  voteButtons.forEach((btn) => {
    if (!votingEnabled) {
      btn.disabled = true;
      btn.style.opacity = "0.5";
      btn.style.cursor = "not-allowed";
    } else {
      btn.disabled = false;
      btn.style.opacity = "1";
      btn.style.cursor = "pointer";
    }
  });

  // Enable/disable confirm button in modal
  if (confirmVoteBtn && !votingEnabled) {
    confirmVoteBtn.disabled = true;
  }
}

// Sample vote data that will be submitted from frontend
/*
API ENDPOINT: POST https://two5-26-king-queen-backend.onrender.com/api/:collection/vote

COLLECTIONS:
- firstyearsem1 (First Year - Sem 1)
- secondyearsem3 (Second Year - Sem 3)
- thirdyear (Third Year)
- fourthyearfirstsem (Fourth Year - First Sem)
- fourthyearsecondsem (Fourth Year - Second Sem)
- fifthyear (Fifth Year)
- finalyear (Final Year)

SAMPLE FRONTEND VOTE SUBMISSION DATA:
{
  "rollNumber": "FY1-001",  // String: Formatted roll number (FY1-001, SY3-001, etc.)
  "pin": 4821,               // Number: 1000-9999 (4-digit PIN)
  "name": "John Doe",        // String: Student's full name (required)
  "king": 3,                 // Number: 1-7 (King candidate ID)
  "queen": 5                 // Number: 1-7 (Queen candidate ID)
}

ROLL NUMBER FORMATS:
- First Year (Sem 1): FY1-001 to FY1-080
- Second Year (Sem 3): SY3-001 to SY3-060
- Third Year: TY-001 to TY-055
- Fourth Year (First Sem): FY1S-001 to FY1S-045
- Fourth Year (Second Sem): FY2S-001 to FY2S-047
- Fifth Year: FFY-001 to FFY-020
- Final Year: FNL-001 to FNL-015

EXAMPLE USAGE:
// For Fifth Year student
const sampleVoteData = {
  rollNumber: "FFY-001",
  pin: 4821,
  name: "John Doe",
  king: 3,
  queen: 5
};

// Submit via fetch to Fifth Year collection
fetch('https://two5-26-king-queen-backend.onrender.com/api/fifthyear/vote', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(sampleVoteData)
});

SUCCESS RESPONSE:
{
  "success": true,
  "message": "Vote submitted successfully",
  "student": {
    "rollNumber": "FFY-001",
    "name": "John Doe",
    "voted": true,
    "king": 3,
    "queen": 5
  }
}

ERROR RESPONSES:
- Invalid PIN: {"error": "Invalid PIN"}
- Already voted: {"error": "Already voted", "details": "This student has already submitted their vote"}
- Missing name: {"error": "Name is required"}
- Invalid vote: {"error": "King and Queen must be between 1 and 7"}
- Not found: {"error": "Student not found", "details": "Roll number 999 not found in fifthyear"}
*/
