// Populate king and queen carousels from shared candidate data.
let selectedKing = null;
let selectedQueen = null;

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

  // Handle photo carousel - use the same photo 3 times for now
  if (photoCarousel) {
    const photos = [
      candidate?.photo || "",
      candidate?.photo || "",
      candidate?.photo || "",
    ];

    photoCarousel.innerHTML = photos
      .map(
        (photo, index) => `
      <div class="carousel-item ${index === 0 ? "active" : ""}">
        <div class="candidate-img candidate-detail-photo" style="background-image: url('${photo}')"></div>
      </div>
    `
      )
      .join("");
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
    rollSelect.innerHTML =
      '<option value="">-- Select your roll number --</option>';

    for (let i = 1; i <= studentCount; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = `Roll No. ${i}`;
      rollSelect.appendChild(option);
    }

    rollSelect.disabled = false;
  });

  confirmBtn?.addEventListener("click", () => {
    const selectedClass = classSelect.value;
    const rollNumber = rollSelect.value;

    errorDiv.style.display = "none";
    successDiv.style.display = "none";

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

    // Simulate vote submission
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Submitting...";

    setTimeout(() => {
      // Success
      successDiv.innerHTML = `
        <strong>✓ Vote submitted successfully!</strong><br>
        Your vote for <strong>${selectedKing?.name}</strong> (King) and <strong>${selectedQueen?.name}</strong> (Queen) has been recorded.
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
        classSelect.value = "";
        rollSelect.value = "";
        rollSelect.disabled = true;
        rollSelect.innerHTML =
          '<option value="">-- First select your class --</option>';
        successDiv.style.display = "none";
      }, 2000);
    }, 1500);
  });
}
