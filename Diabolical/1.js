const colorBlock = document.querySelector("#colorBlock");
const colorPicker = document.querySelector("#colorPicker");
const checkButton = document.querySelector("#checkButton");
const message = document.querySelector("#message");
const totalScoreElement = document.querySelector("#totalScore");
const roundsElement = document.querySelector("#rounds");

function getRandomColor() {
	const letters = "0123456789ABCDEF";
	let color = "#";
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function hexToRgb(hex) {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
		  }
		: null;
}

function euclideanDistance(rgb1, rgb2) {
	const distance = Math.sqrt(
		Math.pow(rgb1.r - rgb2.r, 2) +
			Math.pow(rgb1.g - rgb2.g, 2) +
			Math.pow(rgb1.b - rgb2.b, 2)
	);
	return distance;
}

let totalScore = 0;
let round = 1;
let targetColor = getRandomColor();
colorBlock.style.backgroundColor = targetColor;

colorPicker.addEventListener("input", () => {
	const pickedColor = colorPicker.value.toUpperCase();
	checkButton.style.backgroundColor = pickedColor;
});

checkButton.addEventListener("click", () => {
	const pickedColor = colorPicker.value.toUpperCase();
	const targetRgb = hexToRgb(targetColor);
	const pickedRgb = hexToRgb(pickedColor);

	const diff = euclideanDistance(targetRgb, pickedRgb);
	const roundScore = Math.max(
		0,
		Math.round((1 - diff / Math.sqrt(3 * Math.pow(255, 2))) * 1000)
	);
	const percentageMatch = ((roundScore / 1000) * 100).toFixed(2);
	totalScore += roundScore;

	const roundDiv = document.createElement("div");
	roundDiv.innerHTML = `Round ${round}: You scored ${roundScore} points! (${percentageMatch}% match)`;

	// New Code: Insert the new round at the beginning of roundsElement.
	if (roundsElement.firstChild) {
		roundsElement.insertBefore(roundDiv, roundsElement.firstChild);
	} else {
		roundsElement.appendChild(roundDiv);
	}

	totalScoreElement.textContent = totalScore;

	if (pickedColor === targetColor) {
		message.textContent = "You've matched the color!";
		message.style.color = "#4CAF50";
	} else {
		if (percentageMatch > 90) {
			message.textContent = "So close! Try again.";
			message.style.color = "#f9a825";
		} else if (percentageMatch > 80) {
			message.textContent = "That was close! Try again.";
			message.style.color = "#fb8c00";
		} else if (percentageMatch > 70) {
			message.textContent = "Not bad! Keep going.";
			message.style.color = "#ff5722";
		} else if (percentageMatch > 50) {
			message.textContent = "Good effort! Try again.";
			message.style.color = "#f44336";
		} else if (percentageMatch > 30) {
			message.textContent = "You can do better! Try again.";
			message.style.color = "#f44336";
		} else {
			message.textContent = "Are you even trying!?";
			message.style.color = "#e53935";
		}
	}

	targetColor = getRandomColor();
	colorBlock.style.backgroundColor = targetColor;

	round++;

	if (round > 5) {
		checkButton.disabled = true;
		message.textContent = "Game over!";
	}
});
