document.addEventListener('DOMContentLoaded', () => {
    // Elements Selection
    const form = document.getElementById('appointment-form');
    const formSlides = document.querySelectorAll('.form-slide');
    const nextButtons = document.querySelectorAll('.next-button');
    const prevButtons = document.querySelectorAll('.prev-button');
    const bookSomeoneElseLinks = document.querySelectorAll('#book-someone-else, #book-someone-else-2, #book-someone-else-3');
    const hospitalInput = document.getElementById('hospital');
    const suggestionsBox = document.getElementById('suggestions');
    const departmentSelect = document.getElementById('department');
    const timeSlotSelect = document.getElementById('time-slot');
    const dateInput = document.getElementById('date');

    // Hospital Suggestions Data
    const hospitals = [
        'AIIMS Delhi',
        'Safdarjung Hospital',
        'Max Super Specialty Hospital',
        'Fortis Hospital',
        'Apollo Hospital',
        'BLK Super Specialty Hospital',
        'Sir Ganga Ram Hospital',
        'Lok Nayak Hospital',
        'Ram Manohar Lohia Hospital',
        'GTB Hospital'
    ];

    // Time Slots Data
    const timeSlots = {
        cardiology: ['09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM'],
        neurology: ['12:00 PM - 01:00 PM', '01:00 PM - 02:00 PM', '02:00 PM - 03:00 PM'],
        orthopedics: ['03:00 PM - 04:00 PM', '04:00 PM - 05:00 PM', '05:00 PM - 06:00 PM'],
        pediatrics: ['09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM'],
        gynecology: ['12:00 PM - 01:00 PM', '01:00 PM - 02:00 PM', '02:00 PM - 03:00 PM'],
        dermatology: ['03:00 PM - 04:00 PM', '04:00 PM - 05:00 PM', '05:00 PM - 06:00 PM']
    };

    // Initialize Minimum Date for Appointment (Today's Date)
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    // Function to Show Suggestions
    hospitalInput.addEventListener('input', () => {
        const query = hospitalInput.value.trim().toLowerCase();
        suggestionsBox.innerHTML = '';
        if (query.length > 0) {
            const filteredHospitals = hospitals.filter(hospital =>
                hospital.toLowerCase().includes(query)
            );
            if (filteredHospitals.length > 0) {
                filteredHospitals.forEach(hospital => {
                    const suggestionItem = document.createElement('div');
                    suggestionItem.textContent = hospital;
                    suggestionItem.addEventListener('click', () => {
                        hospitalInput.value = hospital;
                        suggestionsBox.innerHTML = '';
                        suggestionsBox.style.display = 'none';
                    });
                    suggestionsBox.appendChild(suggestionItem);
                });
                suggestionsBox.style.display = 'block';
            } else {
                suggestionsBox.style.display = 'none';
            }
        } else {
            suggestionsBox.style.display = 'none';
        }
    });

    // Hide Suggestions on Click Outside
    document.addEventListener('click', (e) => {
        if (e.target !== hospitalInput) {
            suggestionsBox.style.display = 'none';
        }
    });

    // Populate Time Slots Based on Department Selection
    departmentSelect.addEventListener('change', () => {
        const selectedDepartment = departmentSelect.value;
        timeSlotSelect.innerHTML = '<option value="" disabled selected>Select a time slot</option>';
        if (timeSlots[selectedDepartment]) {
            timeSlots[selectedDepartment].forEach(slot => {
                const option = document.createElement('option');
                option.value = slot;
                option.textContent = slot;
                timeSlotSelect.appendChild(option);
            });
            timeSlotSelect.disabled = false;
        } else {
            timeSlotSelect.disabled = true;
        }
    });

    // Next Button Event Listeners with Validation
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentSlide = button.closest('.form-slide');
            const currentSlideIndex = Array.from(formSlides).indexOf(currentSlide);
            const inputs = currentSlide.querySelectorAll('input[required], select[required]');
            let allValid = true;

            inputs.forEach(input => {
                if (!input.value.trim()) {
                    showError(input);
                    allValid = false;
                } else {
                    clearError(input);
                    if (input.type === 'email' && !validateEmail(input.value)) {
                        showError(input, 'Please enter a valid email address.');
                        allValid = false;
                    }
                    if (input.type === 'tel' && !validatePhone(input.value)) {
                        showError(input, 'Please enter a valid phone number.');
                        allValid = false;
                    }
                }
            });

            if (allValid) {
                goToSlide(currentSlideIndex + 1);
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });

    // Previous Button Event Listeners
    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentSlide = button.closest('.form-slide');
            const currentSlideIndex = Array.from(formSlides).indexOf(currentSlide);
            goToSlide(currentSlideIndex - 1);
        });
    });

    // Form Submission Event Listener
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const saveDetails = document.getElementById('save-details').checked;
        if (saveDetails) {
            saveFormData();
        } else {
            localStorage.removeItem('appointmentFormData');
        }
        alert('Appointment booked successfully!');
        form.reset();
        goToSlide(0);
    });

    // "Book for Someone Else" Links Event Listeners
    bookSomeoneElseLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            form.reset();
            clearAllErrors();
            goToSlide(0);
            localStorage.removeItem('appointmentFormData');
        });
    });

    // Save Form Data to Local Storage
    function saveFormData() {
        const formData = {
            name: form.name.value,
            email: form.email.value,
            phone: form.phone.value,
            hospital: form.hospital.value,
            department: form.department.value,
            date: form.date.value,
            timeSlot: form['time-slot'].value,
            abhaId: form['abha-id'].value,
            message: form.message.value
        };
        localStorage.setItem('appointmentFormData', JSON.stringify(formData));
    }

    // Load Form Data from Local Storage
    function loadFormData() {
        const savedData = JSON.parse(localStorage.getItem('appointmentFormData'));
        if (savedData) {
            form.name.value = savedData.name || '';
            form.email.value = savedData.email || '';
            form.phone.value = savedData.phone || '';
            form.hospital.value = savedData.hospital || '';
            form.department.value = savedData.department || '';
            form.date.value = savedData.date || '';
            form['time-slot'].value = savedData.timeSlot || '';
            form['abha-id'].value = savedData.abhaId || '';
            form.message.value = savedData.message || '';
        }
    }

    // Navigate to Specific Slide
    function goToSlide(slideIndex) {
        formSlides.forEach((slide, index) => {
            if (index === slideIndex) {
                slide.classList.add('active-slide');
                slide.classList.remove('hidden');
            } else {
                slide.classList.remove('active-slide');
                slide.classList.add('hidden');
            }
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Show Input Error
    function showError(input, message) {
        const formGroup = input.parentElement;
        const errorMessage = formGroup.querySelector('.error-message');
        input.classList.add('error-input');
        errorMessage.textContent = message || `${input.previousElementSibling.textContent} is required.`;
        errorMessage.style.display = 'block';
    }

    // Clear Input Error
    function clearError(input) {
        const formGroup = input.parentElement;
        const errorMessage = formGroup.querySelector('.error-message');
        input.classList.remove('error-input');
        errorMessage.style.display = 'none';
    }

    // Clear All Errors
    function clearAllErrors() {
        const errorInputs = form.querySelectorAll('.error-input');
        const errorMessages = form.querySelectorAll('.error-message');
        errorInputs.forEach(input => input.classList.remove('error-input'));
        errorMessages.forEach(message => (message.style.display = 'none'));
    }

    // Validate Email Format
    function validateEmail(email) {
        const re = /^\S+@\S+\.\S+$/;
        return re.test(email);
    }

    // Validate Phone Number Format
    function validatePhone(phone) {
        const re = /^[0-9]{10}$/;
        return re.test(phone);
    }

    // Initialize Form with Saved Data if Available
    loadFormData();
});
