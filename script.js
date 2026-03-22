const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const revealItems = document.querySelectorAll('[data-reveal]');
const quoteForm = document.querySelector('[data-quote-form]');
const formNote = document.querySelector('[data-form-note]');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('is-open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('menu-open', isOpen);
    });

    navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('is-open');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('menu-open');
        });
    });
}

if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.18,
        }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
} else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
}

if (quoteForm && formNote) {
    quoteForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(quoteForm);
        const name = formData.get('name');
        const submitButton = quoteForm.querySelector('button[type="submit"]');

        if (submitButton instanceof HTMLButtonElement) {
            submitButton.disabled = true;
        }

        formNote.textContent = 'Sending your request...';

        try {
            const response = await fetch('/api/quote', {
                method: 'POST',
                body: formData,
            });

            const payload = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(payload && typeof payload.message === 'string'
                    ? payload.message
                    : 'Unable to send your request right now.');
            }

            const displayName = typeof name === 'string' ? name.trim() : '';
            formNote.textContent = payload && typeof payload.message === 'string'
                ? payload.message
                : displayName
                    ? `Thanks, ${displayName}. Your quote request has been sent.`
                    : 'Your quote request has been sent.';

            quoteForm.reset();
        } catch (error) {
            formNote.textContent = error instanceof Error
                ? error.message
                : 'Unable to send your request right now.';
        } finally {
            if (submitButton instanceof HTMLButtonElement) {
                submitButton.disabled = false;
            }
        }
    });
}