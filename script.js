// ==========================================
// CURRENCY CONVERTER
// SpireX Foundation - Task 7
// ==========================================

const API_URL = "https://open.er-api.com/v6/latest";

// DOM elements
const amountInput = document.getElementById("amount");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");

const convertBtn = document.getElementById("convertBtn");
const swapBtn = document.getElementById("swapBtn");

const resultBox = document.getElementById("resultBox");
const result = document.getElementById("result");

const rateText = document.getElementById("rateText");
const updatedText = document.getElementById("updatedText");

const errorMessage = document.getElementById("errorMessage");

const btnText = document.getElementById("btnText");
const loader = document.getElementById("loader");

const fromSymbol = document.getElementById("fromSymbol");


// ==========================================
// CURRENCY SYMBOLS
// ==========================================

const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    PKR: "₨",
    AED: "د.إ",
    SAR: "﷼",
    CAD: "C$",
    AUD: "A$",
    JPY: "¥",
    CNY: "¥",
    INR: "₹",
    TRY: "₺",
    RUB: "₽",
    CHF: "CHF",
    NZD: "NZ$",
    SGD: "S$",
    MYR: "RM",
    THB: "฿",
    KRW: "₩",
    QAR: "﷼",
    KWD: "د.ك",
    BHD: ".د.ب"
};


// ==========================================
// UPDATE CURRENCY SYMBOL
// ==========================================

function updateCurrencySymbol() {

    const currency = fromCurrency.value;

    fromSymbol.textContent =
        currencySymbols[currency] || currency;
}


// ==========================================
// SHOW ERROR
// ==========================================

function showError(message) {

    errorMessage.textContent = message;
    errorMessage.style.display = "block";
}


// ==========================================
// HIDE ERROR
// ==========================================

function hideError() {

    errorMessage.style.display = "none";
}


// ==========================================
// LOADING STATE
// ==========================================

function setLoading(isLoading) {

    if (isLoading) {

        convertBtn.disabled = true;

        btnText.style.visibility = "hidden";
        loader.style.display = "block";

    } else {

        convertBtn.disabled = false;

        btnText.style.visibility = "visible";
        loader.style.display = "none";
    }
}


// ==========================================
// FORMAT NUMBER
// ==========================================

function formatNumber(number) {

    return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 4
    }).format(number);
}


// ==========================================
// CONVERT CURRENCY
// ==========================================

async function convertCurrency() {

    hideError();

    const amount = parseFloat(amountInput.value);
    const from = fromCurrency.value;
    const to = toCurrency.value;


    // Check amount
    if (isNaN(amount) || amount <= 0) {

        showError("Please enter an amount greater than 0.");

        resultBox.style.display = "none";

        return;
    }


    // Same currency
    if (from === to) {

        result.textContent =
            `${currencySymbols[to] || to}${formatNumber(amount)}`;

        rateText.textContent =
            `1 ${from} = 1 ${to}`;

        updatedText.textContent =
            "Same currency — no conversion needed";

        resultBox.style.display = "block";

        return;
    }


    setLoading(true);


    try {

        /*
         * Get latest rates using the selected
         * FROM currency as the base currency.
         *
         * Example:
         *
         * https://open.er-api.com/v6/latest/PKR
         */

        const response = await fetch(
            `${API_URL}/${from}`
        );


        // Check HTTP response
        if (!response.ok) {

            throw new Error(
                `API request failed: ${response.status}`
            );
        }


        const data = await response.json();


        // Check API response
        if (data.result !== "success") {

            throw new Error(
                "Currency API returned an error."
            );
        }


        // Get conversion rate
        const rate = data.rates[to];


        if (!rate) {

            throw new Error(
                `Exchange rate for ${to} is unavailable.`
            );
        }


        // Calculate result
        const convertedAmount = amount * rate;


        // Display converted amount
        result.textContent =
            `${currencySymbols[to] || to}${formatNumber(convertedAmount)}`;


        // Display exchange rate
        rateText.textContent =
            `1 ${from} = ${formatNumber(rate)} ${to}`;


        // Display update information
        if (data.time_last_update_utc) {

            updatedText.textContent =
                `Latest rate • ${data.time_last_update_utc}`;

        } else {

            updatedText.textContent =
                "Latest available exchange rate";
        }


        // Show result
        resultBox.style.display = "block";


    } catch (error) {

        console.error("Currency API Error:", error);

        resultBox.style.display = "none";


        /*
         * Give a more accurate error message.
         */

        if (!navigator.onLine) {

            showError(
                "You appear to be offline. Please check your internet connection."
            );

        } else {

            showError(
                "Unable to load exchange rates right now. Please try again."
            );
        }

    } finally {

        setLoading(false);
    }
}


// ==========================================
// SWAP CURRENCIES
// ==========================================

function swapCurrencies() {

    const currentFrom = fromCurrency.value;
    const currentTo = toCurrency.value;

    fromCurrency.value = currentTo;
    toCurrency.value = currentFrom;

    updateCurrencySymbol();

    convertCurrency();
}


// ==========================================
// EVENT LISTENERS
// ==========================================

convertBtn.addEventListener(
    "click",
    convertCurrency
);


swapBtn.addEventListener(
    "click",
    swapCurrencies
);


fromCurrency.addEventListener(
    "change",
    updateCurrencySymbol
);


// Press ENTER to convert
amountInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            convertCurrency();
        }
    }
);


// ==========================================
// INITIAL SETUP
// ==========================================

updateCurrencySymbol();


// Automatically convert default value
window.addEventListener(
    "DOMContentLoaded",
    function () {

        convertCurrency();

    }
);
