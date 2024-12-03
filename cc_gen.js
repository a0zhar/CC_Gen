function generate() {
  const bin = document.getElementById("bin").value.trim();
  if (bin.length < 6 || isNaN(bin)) {
    alert("BIN needs to be at least 6 numbers.");
    return;
  }
  const format = document.getElementById("format").value;
  const expiryMonth = document.getElementById("expiry-month").value;
  const expiryYear = document.getElementById("expiry-year").value;
  const ccv = document.getElementById("ccv").value.trim() || "random";
  const quantity = getQuantity();
  let cards = [];
  for (let i = 0; i < quantity; i++) {
    let card = generateCard(bin, expiryMonth, expiryYear, ccv);
    while (!luhnCheck(card.cardNumber)) {
      card = generateCard(bin, expiryMonth, expiryYear, ccv);
    }
    cards.push(card);
  }
  displayResult(cards, format);
}
function handleQuantityChange() {
  const quantitySelect = document.getElementById("quantity");
  const customQuantityDiv = document.getElementById("custom-quantity");
  const customQuantityInput = document.getElementById("custom-quantity-input");
  if (quantitySelect.value === "custom") {
    customQuantityDiv.style.display = "block";
  } else {
    customQuantityDiv.style.display = "none";
  }
}
function getQuantity() {
  const quantitySelect = document.getElementById("quantity");
  if (quantitySelect.value === "custom") {
    return (
      parseInt(document.getElementById("custom-quantity-input").value) || 0
    );
  } else {
    return parseInt(quantitySelect.value);
  }
}
function generateCard(bin, expiryMonth, expiryYear, ccv) {
  let generatedDigits = generateUniqueDigits(bin.length);
  const cardNumber = bin + generatedDigits;
  const month =
    expiryMonth === "random"
      ? Math.floor(Math.random() * 12 + 1)
          .toString()
          .padStart(2, "0")
      : expiryMonth;
  const year =
    expiryYear === "random"
      ? Math.floor(Math.random() * 10 + 2024).toString()
      : expiryYear;
  let ccvCode;
  if (ccv === "random") {
    if (bin.startsWith("342262")) {
      ccvCode = Math.floor(Math.random() * 9000 + 1000).toString();
    } else {
      ccvCode = Math.floor(Math.random() * 900 + 100).toString();
    }
  } else {
    ccvCode = ccv;
  }
  return { cardNumber, month, year, ccvCode };
}
function generateUniqueDigits(binLength) {
  const remainingDigits = 16 - binLength;
  let digits = [];
  for (let i = 0; i < remainingDigits; i++) {
    digits.push(Math.floor(Math.random() * 10));
  }
  return digits.join("");
}
function luhnCheck(cardNumber) {
  let sum = 0;
  let shouldDouble = !1;
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i));
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}
function displayResult(cards, format) {
  const resultBox = document.getElementById("result");
  resultBox.innerHTML = "";
  if (format === "pipes") {
    cards.forEach((card) => {
      resultBox.innerHTML += `${card.cardNumber}|${card.month}|${card.year}|${card.ccvCode}<br>`;
    });
  } else if (format === "csv") {
    let csvContent = "Card Number,Expiry Month,Expiry Year,CCV\n";
    cards.forEach((card) => {
      csvContent += `${card.cardNumber},${card.month},${card.year},${card.ccvCode}\n`;
    });
    resultBox.innerHTML = `<pre>${csvContent}</pre>`;
  } else if (format === "sql") {
    let sqlContent =
      "INSERT INTO cards (card_number, expiry_month, expiry_year, ccv) VALUES ";
    cards.forEach((card, index) => {
      sqlContent += `('${card.cardNumber}', '${card.month}', '${card.year}', '${card.ccvCode}')`;
      if (index < cards.length - 1) {
        sqlContent += ", ";
      } else {
        sqlContent += ";";
      }
    });
    resultBox.innerHTML = `<pre>${sqlContent}</pre>`;
  } else if (format === "json") {
    let jsonContent = JSON.stringify(cards, null, 2);
    resultBox.innerHTML = `<pre>${jsonContent}</pre>`;
  } else if (format === "xml") {
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<cards>\n';
    cards.forEach((card) => {
      xmlContent += `  <card>\n    <cardNumber>${card.cardNumber}</cardNumber>\n    <expiryMonth>${card.month}</expiryMonth>\n    <expiryYear>${card.year}</expiryYear>\n    <ccv>${card.ccvCode}</ccv>\n  </card>\n`;
    });
    xmlContent += "</cards>";
    resultBox.innerHTML = `<pre>${xmlContent}</pre>`;
  }
}
function copyToClipboard() {
  const resultBox = document.getElementById("result");
  const copyStatus = document.getElementById("copy-status");
  const textToCopy = resultBox.innerText;
  navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
      copyStatus.textContent = "Copied!";
      setTimeout(() => {
        copyStatus.textContent = "";
      }, 2000);
    })
    .catch((err) => {
      copyStatus.textContent = "Failed to copy!";
      console.error("Failed to copy text: ", err);
    });
}
