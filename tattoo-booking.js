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
            "Reference image selected from the Skin Stories site."
        ].join("\n");
    }

    function openWhatsApp(card, fileName) {
        const message = buildMessage(card, fileName);
        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank", "noopener");
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

    async function shareViaSystem(card, file) {
        const message = buildMessage(card, file.name);

        if (!navigator.share || !navigator.canShare) {
            return false;
        }

        const sharePayload = {
            title: "Skin Stories Tattoo Booking",
            text: message,
            files: [file]
        };

        if (!navigator.canShare(sharePayload)) {
            return false;
        }

        await navigator.share(sharePayload);
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
            const shared = await shareViaSystem(card, file);

            if (shared) {
                fileNameField.textContent = `Selected image: ${file.name}. Shared through your device share sheet.`;
                sendButton.disabled = false;
                return;
            }
        } catch (error) {
            if (error && error.name === "AbortError") {
                fileNameField.textContent = `Selected image: ${file.name}. Share canceled.`;
                sendButton.disabled = false;
                return;
            }
        }

        try {
            const copied = await copyImageToClipboard(file);

            if (copied) {
                fileNameField.textContent = `Selected image: ${file.name}. Image copied. WhatsApp is opening with the booking text ready.`;
            } else {
                fileNameField.textContent = `Selected image: ${file.name}. WhatsApp is opening with the booking text ready.`;
            }
        } catch (error) {
            fileNameField.textContent = `Selected image: ${file.name}. WhatsApp is opening with the booking text ready.`;
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