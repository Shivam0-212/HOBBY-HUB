// ============================================================
// script.js - Client-side JavaScript for Hobby Hub
// Adds interactivity and dynamic behavior to the pages
// ============================================================

// ============================================================
// 1. DOMContentLoaded - Wait for the page to fully load
//    before running any JavaScript
// ============================================================
document.addEventListener('DOMContentLoaded', function () {

  // --------------------------------------------------------
  // 2. ACTIVE NAV HIGHLIGHT
  //    Automatically marks the current page link as active
  //    based on the current URL path
  // --------------------------------------------------------
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(function (link) {
    // Remove existing active class
    link.classList.remove('active');

    // Get the href attribute of the link
    const linkPath = link.getAttribute('href');

    // Add active class if the link matches the current URL
    if (linkPath === currentPath ||
        (currentPath.startsWith(linkPath) && linkPath !== '/')) {
      link.classList.add('active');
    }

    // Special case: Home link is only active on exact '/'
    if (linkPath === '/' && currentPath === '/') {
      link.classList.add('active');
    }
  });

  // --------------------------------------------------------
  // 3. SMOOTH SCROLL FOR ANCHOR LINKS
  //    Makes clicking anchor links (#section) scroll smoothly
  // --------------------------------------------------------
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --------------------------------------------------------
  // 4. HOBBY CARD FADE-IN ANIMATION
  //    Adds a staggered fade-in effect to hobby cards
  //    as the user scrolls the page
  // --------------------------------------------------------
  const hobbyCards = document.querySelectorAll('.hobby-card');

  if (hobbyCards.length > 0) {
    // Use IntersectionObserver to detect when cards enter the viewport
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, index) {
          if (entry.isIntersecting) {
            // Add visible class with a small staggered delay per card
            setTimeout(function () {
              entry.target.classList.add('visible');
            }, index * 80);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 } // Trigger when 10% of the card is visible
    );

    // Add base animation styles and observe each card
    hobbyCards.forEach(function (card) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      observer.observe(card);
    });
  }

  // --------------------------------------------------------
  // 5. FORM VALIDATION
  //    Basic client-side form validation for the Add Hobby form
  // --------------------------------------------------------
  const hobbyForm = document.querySelector('.hobby-form');

  if (hobbyForm) {
    hobbyForm.addEventListener('submit', function (e) {
      const title = document.getElementById('title');
      const description = document.getElementById('description');
      const category = document.getElementById('category');

      let isValid = true;

      // Check title is not empty
      if (!title || title.value.trim() === '') {
        showFieldError(title, 'Please enter a hobby title.');
        isValid = false;
      } else {
        clearFieldError(title);
      }

      // Check description has at least 20 characters
      if (!description || description.value.trim().length < 20) {
        showFieldError(description, 'Description must be at least 20 characters.');
        isValid = false;
      } else {
        clearFieldError(description);
      }

      // Check a category is selected
      if (!category || category.value === '') {
        showFieldError(category, 'Please select a category.');
        isValid = false;
      } else {
        clearFieldError(category);
      }

      // Prevent form submission if validation fails
      if (!isValid) {
        e.preventDefault();
      }
    });
  }

  // --------------------------------------------------------
  // 6. IMAGE PREVIEW ON URL INPUT
  //    Shows a live preview of the image when user types a URL
  // --------------------------------------------------------
  const imageInput = document.getElementById('image');

  if (imageInput) {
    // Create a preview container
    const previewContainer = document.createElement('div');
    previewContainer.style.marginTop = '10px';
    previewContainer.style.display = 'none';

    const previewImg = document.createElement('img');
    previewImg.style.maxHeight = '150px';
    previewImg.style.borderRadius = '8px';
    previewImg.style.border = '1px solid #e2e8f0';
    previewImg.alt = 'Hobby image preview';

    previewContainer.appendChild(previewImg);
    imageInput.parentNode.appendChild(previewContainer);

    // Update preview when user types or pastes a URL
    imageInput.addEventListener('input', function () {
      const url = this.value.trim();
      if (url && isValidUrl(url)) {
        previewImg.src = url;
        previewImg.onload = function () {
          previewContainer.style.display = 'block';
        };
        previewImg.onerror = function () {
          previewContainer.style.display = 'none';
        };
      } else {
        previewContainer.style.display = 'none';
      }
    });
  }

  // --------------------------------------------------------
  // 7. AUTO-DISMISS ALERT MESSAGES
  //    Success/error alerts automatically disappear after 5s
  // --------------------------------------------------------
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(function (alert) {
    setTimeout(function () {
      alert.style.transition = 'opacity 0.5s, transform 0.5s';
      alert.style.opacity = '0';
      alert.style.transform = 'translateY(-10px)';
      setTimeout(function () {
        if (alert.parentNode) {
          alert.parentNode.removeChild(alert);
        }
      }, 500);
    }, 5000); // Dismiss after 5 seconds
  });

  // --------------------------------------------------------
  // 8. STATS COUNTER ANIMATION
  //    Animates stat numbers counting up from 0
  // --------------------------------------------------------
  const statNumbers = document.querySelectorAll('.stat-card .stat-number');

  statNumbers.forEach(function (el) {
    const finalValue = el.textContent.trim();
    const numericValue = parseInt(finalValue.replace(/\D/g, ''));

    if (!isNaN(numericValue) && numericValue > 0) {
      let startValue = 0;
      const duration = 1000; // 1 second
      const stepTime = 20;
      const steps = duration / stepTime;
      const increment = numericValue / steps;

      const counter = setInterval(function () {
        startValue += increment;
        if (startValue >= numericValue) {
          el.textContent = finalValue; // Restore original text with any suffix
          clearInterval(counter);
        } else {
          el.textContent = Math.floor(startValue);
        }
      }, stepTime);
    }
  });

}); // End of DOMContentLoaded

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Shows a validation error message below an input field
 * @param {HTMLElement} field - The input element
 * @param {string} message - The error message to display
 */
function showFieldError(field, message) {
  // Remove any existing error for this field
  clearFieldError(field);

  // Create error message element
  const errorEl = document.createElement('span');
  errorEl.className = 'field-error';
  errorEl.textContent = message;
  errorEl.style.color = '#dc2626';
  errorEl.style.fontSize = '0.8rem';
  errorEl.style.marginTop = '4px';
  errorEl.style.display = 'block';

  // Highlight the field border
  field.style.borderColor = '#dc2626';
  field.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';

  // Insert error after the field
  field.parentNode.insertBefore(errorEl, field.nextSibling);
}

/**
 * Clears validation error from an input field
 * @param {HTMLElement} field - The input element to clear
 */
function clearFieldError(field) {
  const existingError = field.parentNode.querySelector('.field-error');
  if (existingError) {
    existingError.remove();
  }
  field.style.borderColor = '';
  field.style.boxShadow = '';
}

/**
 * Checks if a string is a valid URL
 * @param {string} url - The string to validate
 * @returns {boolean} True if valid URL
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}

// Make visible class work for card animation
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.hobby-card.visible').forEach(function (card) {
    card.style.opacity = '1';
    card.style.transform = 'translateY(0)';
  });
});

// Observer callback to apply visible styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `.hobby-card.visible { opacity: 1 !important; transform: translateY(0) !important; }`;
document.head.appendChild(styleSheet);

// Profile avatar dropdown toggle
function toggleProfileMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById('profileMenu');
  if (menu) menu.classList.toggle('open');
}
document.addEventListener('click', function() {
  const menu = document.getElementById('profileMenu');
  if (menu) menu.classList.remove('open');
});
