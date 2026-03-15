const bookingModal = document.querySelector("[data-booking-modal]");

if (bookingModal) {
    const openButtons = document.querySelectorAll("[data-open-booking]");
    const closeButtons = bookingModal.querySelectorAll("[data-close-booking]");
    const artistFields = bookingModal.querySelectorAll("[data-booking-artist], [data-booking-artist-secondary]");
    const optionCards = bookingModal.querySelectorAll("[data-booking-option]");
    const params = new URLSearchParams(window.location.search);
    const defaultArtist = "Skin Stories Tattoo Team";
    const whatsappNumber = "250789831320";
    let activeArtist = defaultArtist;

    function setArtist(artistName) {
        activeArtist = artistName || defaultArtist;
        artistFields.forEach((field) => {
            field.textContent = activeArtist;
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

    function buildMessage(card, fileName) {
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
            `Reference image: ${fileName || "No file selected yet"}`,
            "I will attach the selected image in this WhatsApp chat."
        ].join("\n");
    }

    function openWhatsApp(card, fileName) {
        const message = buildMessage(card, fileName);
        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank", "noopener");
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

    optionCards.forEach((card) => {
        const input = card.querySelector("[data-upload-input]");
        const fileNameField = card.querySelector("[data-file-name]");
        const sendButton = card.querySelector("[data-send-whatsapp]");

        input.addEventListener("change", () => {
            const file = input.files && input.files[0];

            if (!file) {
                fileNameField.textContent = "No image selected yet.";
                sendButton.disabled = true;
                card.classList.remove("has-file");
                return;
            }

            fileNameField.textContent = `Selected image: ${file.name}`;
            sendButton.disabled = false;
            card.classList.add("has-file");
            openWhatsApp(card, file.name);
        });

        sendButton.addEventListener("click", () => {
            const file = input.files && input.files[0];

            if (!file) {
                return;
            }

            openWhatsApp(card, file.name);
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