(() => {
  'use strict'

  console.log("[script.js] Validation script loaded");

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation');
  console.log("[script.js] Forms found:", forms.length);

  // Loop over them and prevent submission
  Array.from(forms).forEach((form, index) => {
    console.log(`[script.js] Attaching validation to form #${index + 1}`);

    form.addEventListener('submit', event => {
      console.log(`[script.js] Submit triggered for form #${index + 1}`);

      if (!form.checkValidity()) {
        console.warn(`[script.js] Form #${index + 1} failed validation`);
        event.preventDefault();
        event.stopPropagation();
      } else {
        console.log(`[script.js] Form #${index + 1} passed validation`);
      }

      form.classList.add('was-validated');
      console.log(`[script.js] Validation class added to form #${index + 1}`);
    }, false);
  });

  if (forms.length === 0) {
    console.warn("[script.js] No forms with .needs-validation found");
  }
})();