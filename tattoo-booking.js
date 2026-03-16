const bookingModal = document.querySelector("[data-booking-modal]");

if (bookingModal) {
    const openButtons = document.querySelectorAll("[data-open-booking]");
    const closeButtons = bookingModal.querySelectorAll("[data-close-booking]");
    const artistFields = bookingModal.querySelectorAll("[data-booking-artist], [data-booking-artist-secondary]");
    const whatsappLinks = bookingModal.querySelectorAll("[data-booking-whatsapp-link]");
    const instagramLinks = bookingModal.querySelectorAll("[data-booking-instagram-link]");
    const whatsappNumberFields = bookingModal.querySelectorAll("[data-booking-whatsapp-number]");
    const optionCards = bookingModal.querySelectorAll("[data-booking-option]");
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
            "Reference image selected from the Skin Stories site."
        ].join("\n");
    }

    function openWhatsApp(card, fileName) {
        const message = buildMessage(card, fileName);
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

    function readFileAsDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Could not read the uploaded image."));
            reader.readAsDataURL(file);
        });
    }

    function loadImage(dataUrl) {
        return new Promise((resolve, reject) => {
            const image = new Image();

            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error("Could not prepare the uploaded image."));
            image.src = dataUrl;
        });
    }

    function canvasToBlob(canvas) {
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                    return;
                }

                reject(new Error("Could not create a clipboard image."));
            }, "image/png");
        });
    }

    async function copyImageToClipboard(file) {
        if (!navigator.clipboard || typeof navigator.clipboard.write !== "function" || typeof ClipboardItem === "undefined") {
            return false;
        }

        const dataUrl = await readFileAsDataUrl(file);
        const image = await loadImage(dataUrl);
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        context.drawImage(image, 0, 0);

        const pngBlob = await canvasToBlob(canvas);
        await navigator.clipboard.write([
            new ClipboardItem({
                "image/png": pngBlob
            })
        ]);

        return true;
    }

    async function sendTattooBooking(card, input, fileNameField, sendButton) {
        const file = input.files && input.files[0];

        if (!file) {
            return;
        }

        sendButton.disabled = true;
        fileNameField.textContent = `Selected image: ${file.name}. Preparing WhatsApp...`;

        try {
            const copied = await copyImageToClipboard(file);

            if (copied) {
                fileNameField.textContent = `Selected image: ${file.name}. Image copied. Opening WhatsApp for +250 789 831 320.`;
            } else {
                fileNameField.textContent = `Selected image: ${file.name}. Opening WhatsApp for +250 789 831 320.`;
            }
        } catch (error) {
            fileNameField.textContent = `Selected image: ${file.name}. Opening WhatsApp for +250 789 831 320.`;
        }

        openWhatsApp(card, file.name);
        sendButton.disabled = false;
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

        input.addEventListener("change", async () => {
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
            await sendTattooBooking(card, input, fileNameField, sendButton);
        });

        sendButton.addEventListener("click", async () => {
            await sendTattooBooking(card, input, fileNameField, sendButton);
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