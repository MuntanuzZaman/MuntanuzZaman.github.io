/* =======================================================
	Md. Muntanuz Zaman — Portfolio / Resume site
	Vanilla JS: nav, scroll effects, reveal animations, contact form
======================================================= */

(function () {
	"use strict";

	document.addEventListener("DOMContentLoaded", function () {
		document.body.classList.remove("is-loading");

		initYear();
		initNavToggle();
		initScrollSpyAndHeader();
		initScrollProgress();
		initRevealAnimations();
		initContactForm();
	});

	// Footer year
	function initYear() {
		var yearEl = document.getElementById("year");
		if (yearEl) {
			yearEl.textContent = new Date().getFullYear();
		}
	}

	// Mobile nav toggle
	function initNavToggle() {
		var toggle = document.getElementById("navToggle");
		var nav = document.getElementById("mainNav");
		if (!toggle || !nav) return;

		toggle.addEventListener("click", function () {
			var isOpen = nav.classList.toggle("open");
			toggle.classList.toggle("open", isOpen);
			toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
		});

		nav.querySelectorAll(".nav-link").forEach(function (link) {
			link.addEventListener("click", function () {
				nav.classList.remove("open");
				toggle.classList.remove("open");
				toggle.setAttribute("aria-expanded", "false");
			});
		});
	}

	// Header background on scroll + active nav link highlighting
	function initScrollSpyAndHeader() {
		var header = document.getElementById("siteHeader");
		var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
		var sections = navLinks
			.map(function (link) {
				var id = link.getAttribute("href").replace("#", "");
				return document.getElementById(id);
			})
			.filter(Boolean);

		function onScroll() {
			if (header) {
				header.classList.toggle("scrolled", window.scrollY > 20);
			}

			var scrollPos = window.scrollY + 120;
			var activeIndex = 0;

			sections.forEach(function (section, i) {
				if (section.offsetTop <= scrollPos) {
					activeIndex = i;
				}
			});

			navLinks.forEach(function (link) {
				link.classList.remove("active");
			});
			if (navLinks[activeIndex]) {
				navLinks[activeIndex].classList.add("active");
			}
		}

		window.addEventListener("scroll", onScroll, { passive: true });
		onScroll();
	}

	// Top scroll progress bar
	function initScrollProgress() {
		var bar = document.getElementById("scrollProgress");
		if (!bar) return;

		function update() {
			var scrollTop = window.scrollY;
			var docHeight = document.documentElement.scrollHeight - window.innerHeight;
			var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
			bar.style.width = pct + "%";
		}

		window.addEventListener("scroll", update, { passive: true });
		window.addEventListener("resize", update);
		update();
	}

	// Scroll reveal + skill bar fill animation
	function initRevealAnimations() {
		var revealEls = document.querySelectorAll(".reveal");
		var skillFills = document.querySelectorAll(".skill-fill");

		if (!("IntersectionObserver" in window)) {
			revealEls.forEach(function (el) { el.classList.add("in-view"); });
			skillFills.forEach(function (el) { el.classList.add("in-view"); });
			return;
		}

		var observer = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						entry.target.classList.add("in-view");
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.15 }
		);

		revealEls.forEach(function (el) { observer.observe(el); });
		skillFills.forEach(function (el) { observer.observe(el); });
	}

	// Contact form: client-side validation + Web3Forms submission (no backend required)
	function initContactForm() {
		var form = document.getElementById("contactForm");
		var note = document.getElementById("formNote");
		if (!form || !note) return;

		var submitBtn = form.querySelector('button[type="submit"]');
		var submitBtnDefaultHtml = submitBtn ? submitBtn.innerHTML : "";

		// Basic RFC-5322-ish email check (good enough for client-side UX; the real check happens server-side).
		var EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

		// Strip CR/LF so values can't be used to smuggle extra headers into an outgoing email.
		function stripControlChars(value) {
			return value.replace(/[\r\n\t]+/g, " ").trim();
		}

		form.addEventListener("submit", function (e) {
			e.preventDefault();

			// Honeypot: if this hidden checkbox got checked, it was a bot — drop silently.
			if (form.botcheck && form.botcheck.checked) {
				return;
			}

			var name = stripControlChars(form.name.value);
			var email = stripControlChars(form.email.value);
			var message = form.message.value.trim();

			if (!name || !email || !message) {
				note.classList.add("error");
				note.textContent = "Please fill in all fields before sending.";
				return;
			}

			if (!EMAIL_PATTERN.test(email)) {
				note.classList.add("error");
				note.textContent = "Please enter a valid email address.";
				return;
			}

			if (name.length > 100 || email.length > 254 || message.length > 5000) {
				note.classList.add("error");
				note.textContent = "One of the fields is too long. Please shorten your message.";
				return;
			}

			// Write the sanitized values back so the exact values we validated are what gets submitted.
			form.name.value = name;
			form.email.value = email;
			form.message.value = message;

			note.classList.remove("error");
			note.textContent = "Sending your message…";

			if (submitBtn) {
				submitBtn.disabled = true;
				submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
			}

			fetch(form.action, {
				method: "POST",
				headers: { Accept: "application/json" },
				body: new FormData(form)
			})
				.then(function (response) {
					return response.json();
				})
				.then(function (data) {
					if (data.success) {
						note.classList.remove("error");
						note.textContent = "Thanks! Your message has been sent — I'll get back to you soon.";
						form.reset();
					} else {
						throw new Error(data.message || "Submission failed.");
					}
				})
				.catch(function () {
					note.classList.add("error");
					note.textContent = "Something went wrong. Please email me directly at muntanuzzaman1111@gmail.com.";
				})
				.finally(function () {
					if (submitBtn) {
						submitBtn.disabled = false;
						submitBtn.innerHTML = submitBtnDefaultHtml;
					}
				});
		});
	}
})();
