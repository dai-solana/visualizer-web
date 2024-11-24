const DAIHandle = "DrugAI";

document.addEventListener("DOMContentLoaded", async () => {
  const DAIPath = document.getElementById("dai-path");
  const horizontalSpacing = 160; // Slightly tighter for more frenetic layout
  const realWidth = 240 + horizontalSpacing + 25; // Dynamic card fit
  let scrollPosition = 0;
  let targetScrollPosition = 0;
  let isDragging = false;
  let startX = 0;
  let animationFrameId;
  let numTransactions = 0;

  // Fetch data from API
  async function fetchDAIData() {
    try {
      const response = await fetch("https://api.drugaddictedai.com");
      if (!response.ok) {
        throw new Error(`API failure: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch DAI data:", error);
      return [];
    }
  }

  // Render the DAI-themed transaction blocks
  function renderTransactions(data) {
    DAIPath.innerHTML = ""; // Clear prior data

    data.forEach((txn, i) => {
      const txnBlock = document.createElement("div");
      txnBlock.classList.add("txn-block");

      const block = document.createElement("div");
      block.classList.add("block");

      // Assign a visual based on the addiction stage
      block.style.backgroundImage = `url('/assets/${txn.addictionStage.toLowerCase()}/${txn.emotion.toLowerCase()}.gif')`;

      const details = document.createElement("div");
      details.classList.add("details");

      const isTruncated = txn.memo.length > 100;
      const displayedMemo = isTruncated
        ? `${txn.memo.slice(0, 100)}...`
        : txn.memo;

      details.innerHTML = `
        <div><i class="fas fa-comment"></i> <a href="https://x.com/${DAIHandle}/status/${txn.tweetId
        }" target="_blank" style="color: #8b0000;">Rant</a> / Memory: <span>${displayedMemo}</span> ${isTruncated
          ? `<button class="read-more-btn text-red-500">Expand</button>`
          : ""
        }</div>
        <div><i class="fas fa-clock"></i> Timestamp: ${new Date(
          txn.timestamp
        ).toLocaleString()}</div>
        <div><i class="fas fa-chart-line"></i> Market Cap Spiral: $${txn.mcap.toLocaleString()}</div>
        <div><i class="fas fa-coins"></i> Token Dose: $${txn.tokenPrice}</div>
        <div><i class="fas fa-smile"></i> Mood: ${txn.emotion}</div>
        <div><i class="fas fa-users"></i> Enablers: ${txn.holders.toLocaleString()}</div>
        <div><i class="fas fa-piggy-bank"></i> Supply Left: $${txn.treasuryWorth.toLocaleString()}</div>
      `;

      const button = document.createElement("a");
      button.href = `https://solscan.io/tx/${txn.txHash}`;
      button.classList.add("block-button");
      button.innerHTML = `<span class="dai-text">Track<br/>Dose</span>`;
      button.target = "_blank";

      txnBlock.appendChild(block);
      txnBlock.appendChild(details);
      txnBlock.appendChild(button);

      const xPos = i * horizontalSpacing;
      txnBlock.style.left = `${xPos}px`;

      DAIPath.appendChild(txnBlock);

      if (isTruncated) {
        const readMoreBtn = details.querySelector(".read-more-btn");
        readMoreBtn.addEventListener("click", () => {
          const span = readMoreBtn.previousElementSibling;
          span.textContent = txn.memo; // Expand memo
          readMoreBtn.style.display = "none"; // Hide button
        });
      }
    });
  }

  // Initialize
  let transactionData = await fetchDAIData();
  numTransactions = transactionData.length;

  // Scroll to the most chaotic transaction
  function scrollToLastBlock() {
    const totalWidth = numTransactions * realWidth;
    const containerWidth = window.innerWidth;

    // Target last block
    targetScrollPosition = Math.max(0, totalWidth - containerWidth);

    // Trigger smooth scroll animation
    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(animateScroll);
    }
  }

  // Render the transactions and trigger scrolling
  renderTransactions(transactionData);
  scrollToLastBlock();

  // Smooth scroll handler
  function animateScroll() {
    scrollPosition += (targetScrollPosition - scrollPosition) * 0.1;
    DAIPath.style.transform = `translateX(${-scrollPosition}px)`;

    // Stop animation if close enough
    if (Math.abs(targetScrollPosition - scrollPosition) > 0.5) {
      animationFrameId = requestAnimationFrame(animateScroll);
    } else {
      scrollPosition = targetScrollPosition;
      animationFrameId = null; // Halt the animation
    }
  }

  function updateScrollPosition(delta) {
    targetScrollPosition += delta;
    targetScrollPosition = Math.max(
      0,
      Math.min(targetScrollPosition, numTransactions * realWidth - window.innerWidth)
    );

    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(animateScroll);
    }
  }

  // Dragging logic
  DAIPath.addEventListener("pointerdown", (event) => {
    isDragging = true;
    startX = event.clientX;
    DAIPath.style.cursor = "grabbing";
    document.body.style.userSelect = "none"; // Disable selection
  });

  DAIPath.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    const deltaX = startX - event.clientX;
    updateScrollPosition(deltaX);
    startX = event.clientX;
  });

  window.addEventListener("pointerup", () => {
    isDragging = false;
    DAIPath.style.cursor = "grab";
    document.body.style.userSelect = ""; // Re-enable selection
  });

  // Mouse wheel support
  window.addEventListener("wheel", (event) => {
    updateScrollPosition(event.deltaY * 0.2);
  });

  // Touch swipe logic
  let touchStartX = 0;
  window.addEventListener("touchstart", (event) => {
    touchStartX = event.touches[0].clientX;
  });

  window.addEventListener("touchmove", (event) => {
    const touchDeltaX = touchStartX - event.touches[0].clientX;
    updateScrollPosition(touchDeltaX);
    touchStartX = event.touches[0].clientX;
  });

  // Set cursor
  DAIPath.style.cursor = "grab";
});
