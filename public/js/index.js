document.addEventListener('DOMContentLoaded', function () {
  let navbarToggle = document.getElementById('navbar-toggle');
  navbarToggle.addEventListener('click', function () {
    let navList = document.querySelector('.nav-list');
    navList.classList.toggle('active');
  });

  // Track selected plan
  let selectedPlanKey = null;

  // Plan selection buttons
  document.querySelectorAll('.subscription-btn').forEach((btn, index) => {
    const planNames = ['Silver', 'Gold', 'Platinum'];
    btn.addEventListener('click', () => {
      selectedPlanKey = planNames[index];
      openRegisterForm(selectedPlanKey);  // Open the registration form after selecting a plan
    });
  });

  // Attach to submit button if needed
  const formSubmitBtn = document.querySelector('#registerForm button[type="submit"]');
  if (formSubmitBtn) {
    formSubmitBtn.addEventListener("click", submitForm);  // Handle form submission
  }

  // Submit form logic
  window.submitForm = function () {
    let fullName = document.getElementsByName("fullname")[0].value;
    let email = document.getElementsByName("email")[0].value;
    let mobile = document.getElementsByName("mobile")[0].value;
    let duration = document.querySelector('input[name="duration"]:checked');
    let payment = document.querySelector('input[name="payment"]:checked');
    let personalTraining = document.querySelector('input[name="personal-training"]:checked');
    let termsAndConditions = document.getElementsByName("sign-me")[0].checked;

    // Check if all fields are filled out
    if (
      fullName.trim() === "" ||
      email.trim() === "" ||
      mobile.trim() === "" ||
      !duration ||
      !payment ||
      !personalTraining ||
      !termsAndConditions
    ) {
      alert("Please fill in all the required fields and accept the terms and conditions before submitting the form.");
      return;
    }

    // Successful submission
    alert("Thank you, " + fullName + "! Your form has been submitted successfully.");
    closeRegisterForm();  // Close the registration form

    // After form submission, show the modal with the diet/workout plan
    if (selectedPlanKey) {
      openModal(selectedPlanKey);
    }
  };

  // Register form logic
  function openRegisterForm(planKey) {
    document.getElementById("registerForm").style.display = "block";  // Display registration form

    // Auto-select duration based on plan selection
    const planDurationMap = {
      Silver: "4 months",
      Gold: "8 months",
      Platinum: "12 months"
    };

    if (planKey) {
      const durationInputs = document.querySelectorAll('input[name="duration"]');
      durationInputs.forEach(input => {
        input.checked = input.value.trim() === planDurationMap[planKey];
      });

      // Auto-select personal training for Platinum plan
      if (planKey === "Platinum") {
        document.querySelector('input[value="required"]').checked = true;
      }
    }
  }

  function closeRegisterForm() {
    document.getElementById("registerForm").style.display = "none";  // Close registration form
  }

  // Modal for Diet & Workout Plan
  function openModal(planKey) {
    const planDetails = {
      'Silver': {
        diet: 'High protein breakfast, balanced lunch with greens, light dinner. Avoid sugar.',
        workout: 'Monday to Friday: Cardio + Strength. Weekends: Rest or light yoga.'
      },
      'Gold': {
        diet: 'Custom macros-based diet with 3 main meals and 2 snacks. Weekly cheat meal allowed.',
        workout: '5x per week: Full-body workouts with resistance and HIIT. Sunday: Active recovery.'
      },
      'Platinum': {
        diet: 'Personalized diet plan with supplementation guidance. Includes macro tracking.',
        workout: '6x per week: Strength + Hypertrophy focus. Personal trainer guided sessions.'
      }
    };

    const modal = document.getElementById('planModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDiet = document.getElementById('modalDiet');
    const modalWorkout = document.getElementById('modalWorkout');

    // Update the modal with diet and workout details based on the selected plan
    modalTitle.innerText = `${planKey} Plan - Diet & Workout`;
    modalDiet.innerHTML = `<strong>Diet Plan:</strong> ${planDetails[planKey].diet}`;
    modalWorkout.innerHTML = `<strong>Workout Routine:</strong> ${planDetails[planKey].workout}`;

    modal.style.display = 'flex';  // Display the modal
  }

  window.closeModal = function () {
    document.getElementById('planModal').style.display = 'none';  // Close the modal
  };
});

const classSchedules = {
  "HIIT": ["Monday - 6:00 AM", "Wednesday - 6:00 AM", "Friday - 6:00 AM"],
  "Mixed-Level Exercise": ["Tuesday - 7:00 AM", "Thursday - 7:00 AM", "Saturday - 9:00 AM"],
  "Beginner Level Exercise": ["Monday - 8:00 AM", "Wednesday - 8:00 AM", "Friday - 8:00 AM"]
};

document.querySelectorAll('.class-hero-btn').forEach(button => {
  button.addEventListener('click', () => {
    const className = button.innerText.trim();
    showModal(className);
  });
});

function showModal(className) {
  const modal = document.getElementById("classModal");
  document.getElementById("classTitle").innerText = className + " Schedule";
  const scheduleList = document.getElementById("scheduleList");
  scheduleList.innerHTML = "";
  classSchedules[className]?.forEach(day => {
    const li = document.createElement("li");
    li.textContent = day;
    scheduleList.appendChild(li);
  });
  modal.style.display = "block";
}
function closeModal() {
  document.getElementById("classModal").style.display = "none";
}

// Optional: Close modal when clicking outside of it
window.onclick = function(event) {
  const modal = document.getElementById("classModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
}