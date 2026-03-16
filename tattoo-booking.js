const bookingModal = document.querySelector("[data-booking-modal]");

if (bookingModal) {
    const openButtons = document.querySelectorAll("[data-open-booking]");
    const closeButtons = bookingModal.querySelectorAll("[data-close-booking]");
    const artistFields = bookingModal.querySelectorAll("[data-booking-artist], [data-booking-artist-secondary]");
    const whatsappLinks = bookingModal.querySelectorAll("[data-booking-whatsapp-link]");
    const instagramLinks = bookingModal.querySelectorAll("[data-booking-instagram-link]");
    const whatsappNumberFields = bookingModal.querySelectorAll("[data-booking-whatsapp-number]");
    const optionItems = bookingModal.querySelectorAll("[data-booking-option]");
    const params = new URLSearchParams(window.location.search);
    const defaultArtist = "Skin Stories Tattoo Team";
    const artistProfiles = {
        "Skin Stories Tattoo Team": {
            whatsappNumber: "250789831320",
            whatsappDisplay: "+250 789 831 320",
            whatsappLabel: "Open Skin Stories WhatsApp",
            instagramUrl: "https://www.instagram.com/skinstories/",
            instagramLabel: "Open Skin Stories Instagram"
        },
        "Yanky Tattoo": {
            whatsappNumber: "250789831320",
            whatsappDisplay: "+250 789 831 320",
            whatsappLabel: "Open Skin Stories WhatsApp for Yanky Tattoo",
            instagramUrl: "https://www.instagram.com/i_am_yanky_yvan?igsh=aTd4andyZXJ4ejY0",
            instagramLabel: "Open Yanky Tattoo Instagram"
        },
        "Hamza Tattoo": {
            whatsappNumber: "250781925969",
            whatsappDisplay: "+250 781 925 969",
            whatsappLabel: "Open Hamza Tattoo WhatsApp",
            instagramUrl: "https://www.instagram.com/hamza.tattoo_?igsh=MXMzZThrbzAzMHY2cg==",
            instagramLabel: "Open Hamza Tattoo Instagram"
        }
    };
    let activeProfile = artistProfiles[defaultArtist];
    let activeArtist = defaultArtist;

    function setArtist(artistName) {
        activeArtist = artistName || defaultArtist;
        activeProfile = artistProfiles[activeArtist] || artistProfiles[defaultArtist];

        artistFields.forEach((field) => {
            field.textContent = activeArtist;
        });

        whatsappLinks.forEach((link) => {
            link.href = `https://wa.me/${activeProfile.whatsappNumber}`;
            link.setAttribute("aria-label", activeProfile.whatsappLabel);
        });

        instagramLinks.forEach((link) => {
            link.href = activeProfile.instagramUrl;
            link.setAttribute("aria-label", activeProfile.instagramLabel);
        });

        whatsappNumberFields.forEach((field) => {
            field.textContent = activeProfile.whatsappDisplay;
        });
    }

    function openBooking(artistName) {
        setArtist(artistName);
        bookingModal.hidden = false;
        document.body.classList.add("modal-open");
    }

    function closeBooking() {
        bookingModal.hidden = true;
        document.body.classList.remove("modal-open");
    }

    function buildMessage(card) {
        const optionName = card.dataset.optionName;
        const optionDuration = card.dataset.optionDuration;
        const optionPrice = card.dataset.optionPrice;
        const optionCode = card.dataset.optionCode;

        return [
            "Hello Skin Stories,",
            "I want to book a tattoo.",
            `Featured artist: ${activeArtist}`,
            `Option number: ${optionCode}`,
            `Tattoo type: ${optionName}`,
            `Duration: ${optionDuration}`,
            `Price: ${optionPrice}`,
            "Please confirm availability and next booking steps."
        ].join("\n");
    }

    function openWhatsApp(card) {
        const message = buildMessage(card);
        const encodedMessage = encodeURIComponent(message);
        const appUrl = `whatsapp://send?phone=${activeProfile.whatsappNumber}&text=${encodedMessage}`;
        const webUrl = `https://wa.me/${activeProfile.whatsappNumber}?text=${encodedMessage}`;
        const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (isMobileDevice) {
            window.location.href = appUrl;

            window.setTimeout(() => {
                if (document.visibilityState === "visible") {
                    window.location.href = webUrl;
                }
            }, 900);

            return;
        }

        window.open(webUrl, "_blank", "noopener");
    }

    openButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            openBooking(button.dataset.featuredArtist || defaultArtist);
        });
    });

    closeButtons.forEach((button) => {
        button.addEventListener("click", closeBooking);
    });

    bookingModal.addEventListener("click", (event) => {
        if (event.target === bookingModal) {
            closeBooking();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !bookingModal.hidden) {
            closeBooking();
        }
    });

    optionItems.forEach((card) => {
        const sendButton = card.querySelector("[data-send-whatsapp]");

        sendButton.addEventListener("click", () => {
            openWhatsApp(card);
        });
    });

    if (params.get("booking") === "1") {
        openBooking(params.get("artist") || defaultArtist);
        params.delete("booking");
        const nextUrl = params.toString() ? `?${params.toString()}` : window.location.pathname.split("/").pop();
        window.history.replaceState({}, "", nextUrl);
    } else {
        setArtist(defaultArtist);
    }
}